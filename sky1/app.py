from flask import Flask, request, jsonify, render_template, send_from_directory
from gtts import gTTS
from fpdf import FPDF
from datetime import datetime
import os
import re
import unicodedata
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['OUTPUT_FOLDER'] = 'outputs'
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found. Set it in .env or environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('models/gemini-2.5-flash')

# --- Configure OpenAI API for Image Generation (DALL-E 3) ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = None
if OPENAI_API_KEY:
    openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
    print("OpenAI API client initialized for DALL-E 3.")
else:
    print("OPENAI_API_KEY not found. DALL-E 3 image generation will be skipped.")

# --- Helper Function for DALL-E 3 Image Generation ---
import requests # Import requests for downloading images
import time

def _generate_image_from_prompt(image_prompt):
    if not openai_client:
        print("OpenAI API key not configured. Skipping image generation.")
        return None

    try:
        print(f"Generating image for prompt: '{image_prompt}'")
        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=image_prompt,
            size="1024x1024", # Standard size for DALL-E 3
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        print(f"Generated image URL: {image_url}")
        return image_url
    except openai.APIError as e:
        print(f"OpenAI API Error during image generation: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred during image generation: {e}")
        return None

# Helper for Text-to-Speech
def _synthesize_text_to_audio(text, output_file_path):
    cleaned_text = text
    cleaned_text = re.sub(r'\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)', '', cleaned_text)
    cleaned_text = re.sub(r'\(\d{1,2}:\d{2}\)', '', cleaned_text)
    cleaned_text = re.sub(r'\[[^\]]+\]', '', cleaned_text)
    cleaned_text = re.sub(r'\((?:அறிமுகம்|முடிவுரை|தொடக்க இசை|மெல்லிசை|இசை|சவுண்ட் எஃபெக்ட்|உரை|பேச்சு|பகுதி|வரவு|போகுதல்)[^\)]*\)', '', cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'\((?:intro|conclusion|music|sound effect|part|segment|break)[^\)]*\)', '', cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'[*_]', '', cleaned_text)
    cleaned_text = re.sub(r'^\s*Host:\s*', '', cleaned_text, flags=re.MULTILINE)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
    cleaned_text = re.sub(r' {2,}', ' ', cleaned_text)
    cleaned_text = cleaned_text.strip()
    tts = gTTS(text=cleaned_text, lang='ta', slow=False)
    tts.save(output_file_path)
    print(f"Audio content written to file: {output_file_path}")

# Helper for PDF Generation
class PDF(FPDF):
    def header(self):
        self.set_font('NotoSansTamil', 'B', 15)
        self.cell(0, 10, 'Podcast Script', 0, 1, 'C')
        self.ln(10)
    def footer(self):
        self.set_y(-15)
        self.set_font('NotoSansTamil', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
    def chapter_title(self, title):
        self.set_font('NotoSansTamil', 'B', 12)
        self.cell(0, 10, title, 0, 1, 'L')
        self.ln(5)
    def chapter_body(self, body):
        self.set_font('NotoSansTamil', '', 10)
        self.multi_cell(0, 5, body)
        self.ln()

def _generate_pdf(text, output_file_path, title="Podcast Script"):
    pdf = PDF()
    font_path = os.path.join(app.root_path, 'static', 'fonts', 'NotoSansTamil-Regular.ttf')
    if not os.path.exists(font_path):
        raise FileNotFoundError(f"Tamil font file not found: {font_path}. Place 'NotoSansTamil-Regular.ttf' in static/fonts.")
    pdf.add_font('NotoSansTamil', '', font_path)
    pdf.add_font('NotoSansTamil', 'B', font_path)
    pdf.add_font('NotoSansTamil', 'I', font_path)
    pdf.add_page()
    pdf.chapter_title(title)
    pdf.chapter_body(text)
    pdf.output(output_file_path)
    print(f"PDF content written to file: {output_file_path}")

# Helper for Slide PDF Generation
class SlidePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=15)
        font_path = os.path.join(app.root_path, 'static', 'fonts', 'NotoSansTamil-Regular.ttf')
        if not os.path.exists(font_path):
            raise FileNotFoundError(f"Tamil font file not found: {font_path}. Place 'NotoSansTamil-Regular.ttf' in static/fonts.")
        self.add_font('NotoSansTamil', '', font_path)
        self.add_font('NotoSansTamil', 'B', font_path)
    def add_slide(self, title, content, image_prompt, image_url=None):
        self.add_page()
        self.set_font('NotoSansTamil', 'B', 20)
        self.multi_cell(self.w - self.l_margin - self.r_margin, 10, title, align='C')
        self.ln(10)
        self.set_font('NotoSansTamil', '', 12)
        for line in content.split('\n'):
            if line.strip().startswith('-'):
                self.multi_cell(self.w - self.l_margin - self.r_margin, 7, f'  {line.strip()}')
            else:
                self.multi_cell(self.w - self.l_margin - self.r_margin, 7, line.strip())
        
        # Add image if available
        if image_url:
            try:
                # Download image
                image_filename = os.path.join(app.config['OUTPUT_FOLDER'], "temp_image.png") # Using a temp name
                response = requests.get(image_url, stream=True)
                response.raise_for_status()
                with open(image_filename, 'wb') as out_file:
                    out_file.write(response.content)
                
                # Calculate image position and size
                # 150 width, aspect ratio
                page_width = self.w - self.l_margin - self.r_margin
                image_width = 150
                
                # Get image dimensions to maintain aspect ratio
                # FPDF doesn't directly give image dims from file path before adding
                # So we'll make a best guess or let FPDF auto-scale if possible
                # For simplicity, we'll assume a square image from DALL-E 3 1024x1024
                # and place it centered below the text
                
                x_pos = self.l_margin + (page_width - image_width) / 2
                y_pos = self.get_y() + 5 # Small margin from text
                
                self.image(image_filename, x=x_pos, y=y_pos, w=image_width)
                self.ln(image_width * (self.h/self.w) / 4) # Adjust line break after image to prevent overlap
                
                os.remove(image_filename) # Clean up temp file
            except Exception as e:
                print(f"Error embedding image from {image_url}: {e}")
                self.set_font('NotoSansTamil', 'I', 8)
                self.multi_cell(self.w - self.l_margin - self.r_margin, 5, f'Could not load image: {image_url}', align='C')
                self.ln(5)
        
        self.ln(10)
        self.set_font('NotoSansTamil', 'B', 10)
        self.multi_cell(self.w - self.l_margin - self.r_margin, 7, f'Image Prompt: {image_prompt}', align='C')

def _clean_slide_text(text):
    # Remove timestamps like (0:00 - 0:45) or (0:00)
    text = re.sub(r'\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)', '', text)
    text = re.sub(r'\(\d{1,2}:\d{2}\)', '', text)
    # Remove specific music cues, host instructions, and other noise
    text = re.sub(r'\[[^\]]+\]', '', text) # [music - intro], [host], [sound effect]
    text = re.sub(r'\((?:அறிமுகம்|முடிவுரை|தொடக்க இசை|மெல்லிசை|இசை|சவுண்ட் எஃபெக்ட்|உரை|பேச்சு|பகுதி|வரவு|போகுதல்|intro|conclusion|music|sound effect|part|segment|break)[^\)]*\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'^\s*Host:\s*', '', text, flags=re.MULTILINE) # Remove "Host:"
    text = re.sub(r'[*#`]', '', text) # Remove common markdown formatting characters if they somehow persist
    text = re.sub(r'(\s*\n){3,}', '\n\n', text) # Reduce excessive newlines
    text = re.sub(r' {2,}', ' ', text) # Reduce excessive spaces
    text = text.strip()
    return text

def _generate_slides_pdf(slide_outline_text, output_file_path, title="Podcast Slides"):
    pdf = SlidePDF()
    
    # Clean the entire slide outline text before parsing
    cleaned_slide_outline_text = _clean_slide_text(slide_outline_text)
    
    # Regex to parse each slide
    # Assumes "Slide Title:", "Content:", "Image Prompt:" structure
    slide_pattern = re.compile(r"Slide Title:\s*(.*?)\nContent:\s*([\s\S]*?)\nImage Prompt:\s*(.*?)(?=\nSlide Title:|\Z)", re.MULTILINE)
    
    slides = slide_pattern.findall(cleaned_slide_outline_text)

    if not slides:
        print("No slides found in the outline.")
        # Create a single slide with an error message or just the raw outline
        pdf.add_slide("No Slides Found", "Could not parse slide outline. Raw content:\n" + cleaned_slide_outline_text, "N/A")
    else:
        for title, content, image_prompt in slides:
            image_url = _generate_image_from_prompt(image_prompt) # Generate image
            pdf.add_slide(title.strip(), content.strip(), image_prompt.strip(), image_url)
    
    pdf.output(output_file_path)
    print(f"Slide PDF content written to file: {output_file_path}")

# Helper for sanitizing filenames
def _slugify(value, allow_unicode=False):
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_podcast', methods=['POST'])
def generate_podcast():
    user_prompt = request.json.get('prompt')
    if not user_prompt:
        return jsonify({"error": "Prompt is required"}), 400
    try:
        full_prompt = f"""
        You are an expert podcast script and slide outline generator.
        Based on the following request, generate two distinct outputs:
        1. A detailed podcast script in Tamil. The script should be conversational, engaging, and structured with an introduction, main body segments, and a conclusion. Include suggestions for intro/outro music and approximate timings.
        2. A structured slide outline for a presentation based on the podcast content. Each slide should have a "Slide Title," "Content" (bullet points summarizing the key information for that slide, *without* music cues, timings, or host instructions), and an "Image Prompt" (a short description for a visual related to the slide). Ensure the slide content is concise and directly relevant to the slide's topic.

        User Request: "{user_prompt}"

        Please format the output clearly with distinct sections for the "## Podcast Script" and "## Slide Outline".
        Use Markdown for both outputs.
        """
        response = model.generate_content(full_prompt)
        generated_content = response.text

        podcast_script = "Could not extract podcast script."
        slide_outline = "Could not extract slide outline."

        podcastScriptMatch = re.search(r"## Podcast Script\n([\s\S]*?)(?=## Slide Outline|$)", generated_content)
        slideOutlineMatch = re.search(r"## Slide Outline\n([\s\S]*)", generated_content)

        if podcastScriptMatch:
            podcast_script = podcastScriptMatch.group(1).strip()
        if slideOutlineMatch:
            slide_outline = slideOutlineMatch.group(1).strip()
        
        if not podcast_script or "Could not extract" in podcast_script:
             podcast_script = generated_content 
             print("WARNING: Podcast script parsing failed, using full generated content for TTS/PDF.")

        today = datetime.now()
        date_folder = today.strftime("%Y/%m/%d")
        sanitized_prompt = _slugify(user_prompt)
        if len(sanitized_prompt) > 50:
            sanitized_prompt = sanitized_prompt[:50] + "..."
        timestamp = today.strftime("%H%M%S")
        unique_folder_name = f"{sanitized_prompt}_{timestamp}"
        
        full_output_dir = os.path.join(app.config['OUTPUT_FOLDER'], date_folder, unique_folder_name)
        os.makedirs(full_output_dir, exist_ok=True)

        base_filename = _slugify(user_prompt)[:30]

        text_script_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}.txt")
        text_script_path_abs = os.path.join(app.config['OUTPUT_FOLDER'], text_script_path_rel)
        with open(text_script_path_abs, "w", encoding="utf-8") as f:
            f.write(podcast_script)
        
        audio_file_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}.mp3")
        audio_file_path_abs = os.path.join(app.config['OUTPUT_FOLDER'], audio_file_path_rel)
        _synthesize_text_to_audio(podcast_script, audio_file_path_abs)

        pdf_file_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}.pdf")
        pdf_file_path_abs = os.path.join(app.config['OUTPUT_FOLDER'], pdf_file_path_rel)
        _generate_pdf(podcast_script, pdf_file_path_abs, title=user_prompt)

        slides_pdf_file_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}_slides.pdf")
        slides_pdf_file_path_abs = os.path.join(app.config['OUTPUT_FOLDER'], slides_pdf_file_path_rel)
        _generate_slides_pdf(slide_outline, slides_pdf_file_path_abs, title=f"{user_prompt} - Slides")

        return jsonify({
            "success": True,
            "podcast_script": podcast_script,
            "slide_outline": slide_outline,
            "output_folder": os.path.join(date_folder, unique_folder_name),
            "text_file_url": f"/outputs/{text_script_path_rel.replace(os.sep, '/')}",
            "audio_file_url": f"/outputs/{audio_file_path_rel.replace(os.sep, '/')}",
            "pdf_file_url": f"/outputs/{pdf_file_path_rel.replace(os.sep, '/')}",
            "slides_pdf_file_url": f"/outputs/{slides_pdf_file_path_rel.replace(os.sep, '/')}"
        })
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/outputs/<path:filename>')
def serve_output_files(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
