from flask import Flask, request, jsonify, render_template, send_from_directory
import wave
from fpdf import FPDF
from datetime import datetime
import os
import re
import unicodedata
from google import genai
from google.genai import types
from google.genai.errors import ClientError # New import
# No longer need google_exceptions for ResourceExhausted directly as ClientError handles it
from dotenv import load_dotenv
# import openai # Removed - no longer using OpenAI
import time
import base64 # Needed for decoding Gemini image data

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['OUTPUT_FOLDER'] = 'outputs'
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Configure Google Gemini API Client
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found. Set it in .env or environment variables.")
# Unified client for all Gemini API calls
client = genai.Client(api_key=GOOGLE_API_KEY)


# --- Helper Function for Gemini Image Generation (Nano Banana) ---
# Removed OpenAI imports/client init
def _generate_image_from_prompt(image_prompt):
    print(f"Generating image for prompt: '{image_prompt}' using gemini-2.5-flash-image...")
    image_retries = 3
    while image_retries > 0:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-image", # Using Nano Banana model
                contents=[image_prompt], # Image prompt as content
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"], # Requesting image output
                ),
            )

            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.inline_data:
                        # Gemini image generation returns base64 encoded data
                        image_data = base64.b64decode(part.inline_data.data)
                        print(f"Successfully generated image for prompt: '{image_prompt}'")
                        return image_data # Return raw image data
            
            # If no image data is received, it's a soft failure, retry
            image_retries -= 1
            if image_retries <= 0:
                print(f"Warning: API call succeeded but no image data received after max retries for prompt: '{image_prompt}'. Failing.")
                break
            print(f"Warning: No image data received for prompt: '{image_prompt}'. Retrying (attempts left: {image_retries})...")
            time.sleep(2) # Short delay before retrying

        except ClientError as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                image_retries -= 1
                if image_retries <= 0:
                    print(f"ERROR: Image generation rate limit exceeded. Max retries reached for prompt: '{image_prompt}'. Failing.")
                    break
                print(f"DEBUG: Caught ClientError (429 RESOURCE_EXHAUSTED) for image prompt: '{image_prompt}'. Retries left: {image_retries}.")
                sleep_time = 60 # Default if parsing fails
                match_seconds = re.search(r"retry in (\d+\.?\d*)s", error_str)
                match_delay_str = re.search(r"retryDelay': '(\d+)s'", error_str)
                if match_seconds:
                    sleep_time = float(match_seconds.group(1)) + 2
                elif match_delay_str:
                    sleep_time = int(match_delay_str.group(1)) + 2
                print(f"Waiting for {sleep_time:.2f} seconds before retrying image prompt: '{image_prompt}'...")
                time.sleep(sleep_time)
            elif "500" in error_str or "INTERNAL" in error_str:
                image_retries -= 1
                if image_retries <= 0:
                    print(f"ERROR: Google API 500 Internal error for image prompt: '{image_prompt}'. Max retries reached. Failing.")
                    break
                print(f"WARNING: Google API returned 500 Internal error for image prompt: '{image_prompt}'. Retrying (attempts left: {image_retries})...")
                time.sleep(5)
            else:
                print(f"ERROR: Non-retryable ClientError occurred during image generation for prompt: '{image_prompt}': {e}. Failing.")
                break # Non-retryable ClientError

        except Exception as e:
            print(f"ERROR: An unexpected general error occurred during image generation for prompt: '{image_prompt}': {e}. Failing.")
            break

    print("No image content received from the Gemini API after multiple retries.")
    return None


# Helper for Text-to-Speech (using new Gemini TTS)
def _synthesize_text_to_audio(text, output_file_path, voice="Charon"):
    # First, perform initial cleaning
    cleaned_text = text
    cleaned_text = re.sub(r'\(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\)', '', cleaned_text)
    cleaned_text = re.sub(r'\(\d{1,2}:\d{2}\)', '', cleaned_text)
    cleaned_text = re.sub(r'\[[^\]]+\]', '', cleaned_text)
    
    # Original regex that caused SyntaxError:
    # cleaned_text = re.sub(r'\((?:அறிமுகம்|முடிவுரை|தொடக்க இசை|மெல்லிசை|இசை|சவுண்ட் எஃபெக்ட்|உரை|பேச்சு|பகுதி|வரவு|போகுதல்)[^\)]*\)', '', cleaned_text, flags=re.IGNORECASE)
    # Replaced with a more robust/safe version, splitting the regex if needed
    cleaned_text = re.sub(r'\((?:அறிமுகம்|முடிவுரை|தொடக்க இசை|மெல்லிசை|இசை|சவுண்ட் எஃபெக்ட்|உரை|பேச்சு|பகுதி|வரவு|போகுதல்)[^)]*\)', '', cleaned_text, flags=re.IGNORECASE)

    cleaned_text = re.sub(r'\((?:intro|conclusion|music|sound effect|part|segment|break)[^)]*\)', '', cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'[*_]', '', cleaned_text)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
    cleaned_text = re.sub(r' {2,}', ' ', cleaned_text)
    cleaned_text = cleaned_text.strip()

    # --- New Host Name Logic ---
    lines = cleaned_text.split('\n')
    found_first_host = False
    processed_lines = []
    for line in lines:
        match = re.match(r'^\s*Host:\s*', line)
        if match and not found_first_host:
            processed_line = line.replace(match.group(0), 'Fidato: ', 1)
            processed_lines.append(processed_line)
            found_first_host = True
        elif match and found_first_host:
            processed_line = line.replace(match.group(0), '', 1)
            processed_lines.append(processed_line)
        else:
            processed_lines.append(line)
    final_cleaned_text = '\n'.join(processed_lines)
    # --- End New Logic ---

    print(f"Total text length for TTS: {len(final_cleaned_text)}")
    text_chunks = [chunk for chunk in final_cleaned_text.split('\n\n') if chunk.strip()] # Re-introduced chunking
    
    if not text_chunks:
        print("No text to synthesize after cleaning.")
        return

    all_audio_data = []
    
    print(f"Splitting text into {len(text_chunks)} chunks for audio generation.")

    for i, chunk in enumerate(text_chunks): # Re-introduced chunking loop
        print(f"Processing chunk {i+1}/{len(text_chunks)}...")
        chunk_retries = 3 # Max retries for a single chunk for any API error
        while chunk_retries > 0:
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash-preview-tts",
                    contents=chunk, # Using chunk here
                    config=types.GenerateContentConfig(
                        response_modalities=["AUDIO"],
                        speech_config=types.SpeechConfig(
                            voice_config=types.VoiceConfig(
                                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice)
                            )
                        )
                    ),
                )
                if response.candidates and response.candidates[0].content.parts:
                    for part in response.candidates[0].content.parts:
                        if part.inline_data:
                            all_audio_data.append(part.inline_data.data)
                            print(f"Successfully generated audio for chunk {i+1}.")
                            break # Found audio, exit inner loop for this chunk
                    break # Successfully processed chunk (or no audio data, but no exception), move to next
                else:
                    # If API call succeeds but returns no audio, decrement retries and try again
                    chunk_retries -= 1
                    if chunk_retries <= 0:
                        print(f"Warning: API call succeeded but no audio data received for chunk {i+1} after max retries. Skipping chunk.")
                        break # Skip this chunk if no audio after max retries
                    print(f"Warning: API call succeeded but no audio data received for chunk {i+1}. Retrying (attempts left: {chunk_retries})...")
                    time.sleep(2) # Short delay before retrying this type of failure

            except ClientError as e: # Catch ClientError directly
                error_str = str(e)
                # Check for 429 status code or RESOURCE_EXHAUSTED message in the error string
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    chunk_retries -= 1
                    if chunk_retries <= 0:
                        print(f"ERROR: Rate limit exceeded for chunk {i+1}. Max retries reached. Skipping chunk.")
                        break # Skip this chunk if rate limit persists after max retries
                    
                    print(f"DEBUG: Caught ClientError (429 RESOURCE_EXHAUSTED) for chunk {i+1}. Retries left: {chunk_retries}.")
                    print(f"Waiting for rate limit reset for chunk {i+1}...")
                    sleep_time = 60 # Default if parsing fails
                    
                    match_seconds = re.search(r"retry in (\d+\.?\d*)s", error_str)
                    match_delay_str = re.search(r"retryDelay': '(\d+)s'", error_str)

                    if match_seconds:
                        sleep_time = float(match_seconds.group(1)) + 2 # Add a small buffer
                    elif match_delay_str:
                        sleep_time = int(match_delay_str.group(1)) + 2 # Add a small buffer

                    print(f"Waiting for {sleep_time:.2f} seconds before retrying chunk {i+1}...")
                    time.sleep(sleep_time)
                elif "500" in error_str or "INTERNAL" in error_str:
                    chunk_retries -= 1
                    if chunk_retries <= 0:
                        print(f"ERROR: Google API 500 Internal error for chunk {i+1}. Max retries reached. Skipping chunk.")
                        break
                    print(f"WARNING: Google API returned 500 Internal error for chunk {i+1}. Retrying (attempts left: {chunk_retries})...")
                    time.sleep(5) # Small fixed delay for internal server error retry
                else:
                    # It's a ClientError, but not 429 or 500. Treat as unexpected and non-retryable for this chunk
                    print(f"ERROR: Non-retryable ClientError occurred for chunk {i+1}: {e}. Skipping chunk.")
                    break 

            except Exception as e:
                # Generic catch-all for any other unexpected errors.
                print(f"ERROR: An unexpected general error occurred for chunk {i+1}: {e}. Skipping chunk.")
                break # Move to the next chunk if a non-retryable error occurs

    if not all_audio_data:
        print("Failed to generate any audio. All chunks either failed, returned no data, or were skipped due to errors.")
        raise IOError("Could not generate audio from Gemini API for any text chunk.")

    print("Stitching audio chunks together...")
    final_audio_data = b''.join(all_audio_data)

    with wave.open(output_file_path, "wb") as wf:
        wf.setnchannels(1)       # Mono
        wf.setsampwidth(2)       # 16-bit (as per Gemini specs)
        wf.setframerate(24000)   # 24kHz sample rate (as per Gemini specs)
        wf.writeframes(final_audio_data)
    
    print(f"Successfully generated and saved full audio to file: {output_file_path}")


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
    def add_slide(self, title, content, image_data, image_prompt): # image_data is raw bytes now
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
        if image_data:
            try:
                # Save raw image data to a temporary file
                image_filename = os.path.join(app.config['OUTPUT_FOLDER'], "temp_slide_image.png")
                with open(image_filename, 'wb') as f:
                    f.write(image_data)
                
                image_width = 150 # Fixed width for images
                # FPDF will auto-calculate height to maintain aspect ratio
                
                x_pos = self.l_margin + (self.w - self.l_margin - self.r_margin - image_width) / 2
                y_pos = self.get_y() + 5
                
                self.image(image_filename, x=x_pos, y=y_pos, w=image_width)
                self.ln(image_width * (self.h/self.w) / 4) # Adjust line break after image to prevent overlap
                
                os.remove(image_filename) # Clean up temp file
            except Exception as e:
                print(f"Error embedding image in PDF: {e}")
                self.set_font('NotoSansTamil', 'I', 8)
                self.multi_cell(self.w - self.l_margin - self.r_margin, 5, f'Could not embed image for prompt: {image_prompt}', align='C')
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
    text = re.sub(r'\((?:அறிமுகம்|முடிவுரை|தொடக்க இசை|மெல்லிசை|இசை|சவுண்ட் எஃபெக்ட்|உரை|பேச்சு|பகுதி|வரவு|போகுதல்)[^\)]*\)', '', text, flags=re.IGNORECASE)
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
    slide_pattern = re.compile(r"Slide Title:\s*(.*?)\nContent:\s*([\s\S]*?)\nImage Prompt:\s*(.*?)(?=\nSlide Title:|\Z)", re.MULTILINE)
    
    slides = slide_pattern.findall(cleaned_slide_outline_text)

    if not slides:
        print("No slides found in the outline.")
        pdf.add_slide("No Slides Found", "Could not parse slide outline. Raw content:\n" + cleaned_slide_outline_text, "N/A", image_data=None)
    else:
        for title, content, image_prompt in slides:
            image_data = _generate_image_from_prompt(image_prompt) # Generate image, now returns raw data
            pdf.add_slide(title.strip(), content.strip(), image_prompt.strip(), image_data)
    
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
        1. A detailed podcast script in Tamil. The script should be conversational, engaging, and structured with an introduction, main body segments, and a conclusion. Include suggestions for intro/outro music and approximate timings. **The script should be concise, approximately 800-1000 words, suitable for a 7-minute podcast.**
        2. A structured slide outline for a presentation based on the podcast content. Each slide should have a "Slide Title," "Content" (bullet points summarizing the key information for that slide, *without* music cues, timings, or host instructions), and an "Image Prompt" (a short description for a visual related to the slide). Ensure the slide content is concise and directly relevant to the slide's topic.

        User Request: "{user_prompt}"

        Please format the output clearly with distinct sections for the "## Podcast Script" and "## Slide Outline".
        Use Markdown for both outputs.
        """
        # Use the unified client to generate text
        response = client.models.generate_content(model='models/gemini-2.5-flash', contents=full_prompt)
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
        
        audio_file_path_rel = os.path.join(date_folder, unique_folder_name, f"{base_filename}.wav")
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

@app.route('/favicon.ico')
def favicon():
    return '', 204

@app.route('/outputs/<path:filename>')
def serve_output_files(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
