import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';

/**
 * Export array of records to downloadable CSV
 */
export function downloadCSV(data: Record<string, any>[], filename: string = 'filtered_dataset.csv') {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert OKLCH or unsupported CSS color strings into html2canvas-compatible rgb() / rgba()
 */
function parseNumOrPercent(val: string, maxVal: number): number {
  if (val.endsWith('%')) {
    return (parseFloat(val) / 100) * maxVal;
  }
  return parseFloat(val) || 0;
}

function parseAndConvertOklch(str: string): string {
  const match = str.match(/oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
  if (!match) return 'rgb(100, 116, 139)';

  let L = parseNumOrPercent(match[1], 1);
  let C = parseNumOrPercent(match[2], 1);
  const H = parseFloat(match[3]) || 0;
  const alpha = match[4] !== undefined ? parseNumOrPercent(match[4], 1) : 1;

  if (match[1].endsWith('%')) L = L / 100;
  if (match[2].endsWith('%')) C = C / 100;

  const hRad = (H * Math.PI) / 180;
  const a_ = C * Math.cos(hRad);
  const b_ = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a_ - 1.291485548 * b_;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r_lin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g_lin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b_lin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055);

  const r = Math.min(255, Math.max(0, Math.round(gamma(r_lin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(gamma(g_lin) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(gamma(b_lin) * 255)));

  return alpha >= 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

function oklchToRgb(str: string): string {
  if (!str) return 'rgb(0, 0, 0)';
  const cleanStr = str
    .replace(/var\([^)]*?,\s*([\d.]+)\)/gi, '$1')
    .replace(/var\([^)]+\)/gi, '1')
    .trim();

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = cleanStr;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      if (a > 0 || cleanStr.includes(' 0') || cleanStr.includes('/ 0')) {
        const alpha = (a / 255).toFixed(3);
        return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
  } catch {
    // Fallback
  }

  return parseAndConvertOklch(cleanStr);
}

/**
 * Replace unsupported CSS color functions (like oklch) in cloned DOM with computed RGB colors
 */
function sanitizeClonedDocColors(clonedDoc: Document) {
  const oklchRegex = /oklch\((?:[^()]+|\([^()]*\))*\)/gi;

  // 1. Process all <style> elements in clonedDoc
  const styleEls = clonedDoc.querySelectorAll('style');
  styleEls.forEach((style) => {
    if (style.textContent && /oklch/i.test(style.textContent)) {
      style.textContent = style.textContent.replace(oklchRegex, (match) => oklchToRgb(match));
    }
  });

  // 2. Read all document.styleSheets from active window and copy sanitized CSS into clonedDoc
  try {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        let cssText = rules.map((r) => r.cssText).join('\n');
        if (/oklch/i.test(cssText)) {
          cssText = cssText.replace(oklchRegex, (match) => oklchToRgb(match));
          const newStyle = clonedDoc.createElement('style');
          newStyle.textContent = cssText;
          clonedDoc.head.appendChild(newStyle);
        }
      } catch {
        // Guard against CORS or cross-origin stylesheets
      }
    });
  } catch {
    // Ignore stylesheet read errors
  }

  // 3. Remove raw <link rel="stylesheet"> in clonedDoc so html2canvas doesn't re-parse oklch in external CSS
  const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    link.parentNode?.removeChild(link);
  });

  // 4. Process inline style attributes and SVG attributes
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach((node) => {
    const el = node as HTMLElement;

    const styleAttr = el.getAttribute('style');
    if (styleAttr && /oklch/i.test(styleAttr)) {
      const sanitized = styleAttr.replace(oklchRegex, (match) => oklchToRgb(match));
      el.setAttribute('style', sanitized);
    }

    ['fill', 'stroke', 'color', 'background-color'].forEach((attr) => {
      const val = el.getAttribute(attr);
      if (val && /oklch/i.test(val)) {
        el.setAttribute(attr, oklchToRgb(val));
      }
    });
  });
}

/**
 * Capture DOM element (chart) as PNG image
 */
export async function exportElementAsPNG(elementId: string, filename: string = 'chart_export.png') {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        sanitizeClonedDocColors(clonedDoc);
      },
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    link.click();
  } catch (err) {
    console.error('Failed to export chart as PNG:', err);
  }
}

/**
 * Export entire dashboard as PDF report
 */
export async function exportDashboardAsPDF(containerId: string, title: string = 'Dashboard_Report.pdf') {
  const el = document.getElementById(containerId);
  if (!el) return;

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8fafc', // slate-50 background
      logging: false,
      onclone: (clonedDoc) => {
        sanitizeClonedDocColors(clonedDoc);
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(title);
  } catch (err) {
    console.error('Failed to export dashboard PDF:', err);
  }
}
