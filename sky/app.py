import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template, send_from_directory
from dotenv import load_dotenv
from gtts import gTTS # Re-integrating gTTS
from fpdf import FPDF
from datetime import datetime
import re
import unicodedata
import io # Import io for handling audio in memory

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['OUTPUT_FOLDER'] = 'outputs'
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True) # Ensure outputs directory exists

# --- Configure Google Gemini API ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found. Please set it in your .env file or environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('models/gemini-2.5-flash') # Using the identified working model

# --- Helper Function for TTS (using gTTS) ---
def _synthesize_text_to_audio(text, output_file_path):
    # --- Advanced Pre-processing for gTTS ---
    cleaned_text = text

    # 1. Remove timestamps like (0:00 - 0:45) or (0:00)
    cleaned_text = re.sub(r'\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)', '', cleaned_text) # (0:00 - 0:45)
    cleaned_text = re.sub(r'\(\d{1,2}:\d{2}\)', '', cleaned_text) # (0:00)

    # 2. Remove common parenthetical instructions or labels in various languages
    # This pattern catches anything within [] or () that looks like a note or label
    cleaned_text = re.sub(r'\[[^\]]+\]', '', cleaned_text) # [music - intro], [host]
    cleaned_text = re.sub(r'\((?:அறிமுகம்|முடிவுரை|தொடக்க இசை|மெல்லிசை|இசை|சவுண்ட் எஃபெக்ட்|உரை|பேச்சு|பகுதி|வரவு|போகுதல்)[^\)]*\)', '', cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'\((?:intro|conclusion|music|sound effect|part|segment|break)[^\)]*\)', '', cleaned_text, flags=re.IGNORECASE)

    # 3. Remove asterisks or other unwanted single characters if any remain (e.g., from markdown)
    cleaned_text = re.sub(r'[*_]', '', cleaned_text)

    # 4. Replace multiple newlines with at most two, and excessive spaces with single spaces
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text) # Max two newlines
    cleaned_text = re.sub(r' {2,}', ' ', cleaned_text) # Multiple spaces to single space
    cleaned_text = cleaned_text.strip() # Remove leading/trailing whitespace

    # gTTS uses language codes, 'ta' for Tamil
    tts = gTTS(text=cleaned_text, lang='ta', slow=False) # Use cleaned text
    tts.save(output_file_path)
    print(f"Audio content written to file: {output_file_path}")

# --- Helper Function for PDF Generation ---
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
    # Ensure this font file exists in static/fonts/
    # Instructions will be provided to the user to place NotoSansTamil-Regular.ttf here
    font_path = os.path.join(app.root_path, 'static', 'fonts', 'NotoSansTamil-Regular.ttf')
    if not os.path.exists(font_path):
        raise FileNotFoundError(f"Tamil font file not found: {font_path}. Please place 'NotoSansTamil-Regular.ttf' in the static/fonts directory.")
    
    pdf.add_font('NotoSansTamil', '', font_path)
    pdf.add_font('NotoSansTamil', 'B', font_path) # Bold variant
    pdf.add_font('NotoSansTamil', 'I', font_path) # Italic variant

    pdf.add_page()
    pdf.chapter_title(title)
    pdf.chapter_body(text)
    pdf.output(output_file_path)
    print(f"PDF content written to file: {output_file_path}")


# --- Helper for sanitizing filenames ---
def _slugify(value, allow_unicode=False):
    """
    Taken from Django's slugify. Converts to ASCII if 'allow_unicode' is False.
    Converts spaces to hyphens. Removes characters that aren't alphanumerics, underscores, or hyphens.
    Converts to lowercase. Also strips leading and trailing whitespace.
    """
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value).strip().lower()
    return re.sub(r'[-\s]+', '-', value)


# --- Flask Routes ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_podcast', methods=['POST'])
def generate_podcast():
    user_prompt = request.json.get('prompt')
    if not user_prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        # Generate content using Gemini
        full_prompt = f"""
        You are an expert podcast script and slide outline generator.
        Based on the following request, generate two distinct outputs:
        1. A detailed podcast script in Tamil. The script should be conversational, engaging, and structured with an introduction, main body segments, and a conclusion. Include suggestions for intro/outro music and approximate timings.
        2. A structured slide outline for a presentation based on the podcast content. Each slide should have a "Slide Title," "Content" (bullet points summarizing the key information for that slide), and an "Image Prompt" (a short description for a visual related to the slide).

        User Request: "{user_prompt}"

        Please format the output clearly with distinct sections for the "## Podcast Script" and "## Slide Outline".
        Use Markdown for both outputs.
        """
        response = model.generate_content(full_prompt)
        generated_content = response.text

        # Extract podcast script
        podcast_script = "Could not extract podcast script."
        slide_outline = "Could not extract slide outline."

        podcastScriptMatch = re.search(r"## Podcast Script\n([\s\S]*?)(?=## Slide Outline|$)", generated_content)
        slideOutlineMatch = re.search(r"## Slide Outline\n([\s\S]*)", generated_content)

        if podcastScriptMatch:
            podcast_script = podcastScriptMatch.group(1).strip()
        if slideOutlineMatch:
            slide_outline = slideOutlineMatch.group(1).strip()
        
        if not podcast_script or "Could not extract" in podcast_script:
             # Fallback if parsing failed, use entire content for script for TTS/PDF
             podcast_script = generated_content 
             print("WARNING: Podcast script parsing failed, using full generated content for TTS/PDF.")


        # --- File Organization ---
        today = datetime.now()
        date_folder = today.strftime("%Y/%m/%d")
        
        # Sanitize prompt for folder name, limit length
        sanitized_prompt = _slugify(user_prompt)
        if len(sanitized_prompt) > 50:
            sanitized_prompt = sanitized_prompt[:50] + "..."
        
        timestamp = today.strftime("%H%M%S")
        unique_folder_name = f"{sanitized_prompt}_{timestamp}"
        
        full_output_dir = os.path.join(app.config['OUTPUT_FOLDER'], date_folder, unique_folder_name)
        os.makedirs(full_output_dir, exist_ok=True)

        base_filename = _slugify(user_prompt)[:30] # Short filename for output files

        # Save Text Script
        text_script_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}.txt")
        text_script_path_abs = os.path.join(app.config['OUTPUT_FOLDER'], text_script_path_rel)
        with open(text_script_path_abs, "w", encoding="utf-8") as f:
            f.write(podcast_script)
        
        # Generate Audio
        audio_file_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}.mp3")
        audio_file_path_abs = os.path.join(app.config['OUTPUT_FOLDER'], audio_file_path_rel)
        _synthesize_text_to_audio(podcast_script, audio_file_path_abs)

        # Generate PDF
        pdf_file_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}.pdf")
        pdf_file_path_abs = os.path.join(app.config['OUTPUT_FOLDER'], pdf_file_path_rel)
        _generate_pdf(podcast_script, pdf_file_path_abs, title=user_prompt)


        return jsonify({
            "success": True,
            "podcast_script": podcast_script,
            "slide_outline": slide_outline,
            "output_folder": os.path.join(date_folder, unique_folder_name), # Relative path for display
            "text_file_url": f"/outputs/{text_script_path_rel.replace(os.sep, '/')}",
            "audio_file_url": f"/outputs/{audio_file_path_rel.replace(os.sep, '/')}",
            "pdf_file_url": f"/outputs/{pdf_file_path_rel.replace(os.sep, '/')}"
        })

    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# Serve static files from the 'outputs' directory
@app.route('/outputs/<path:filename>')
def serve_output_files(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)


if __name__ == '__main__':
    app.run(debug=True)
