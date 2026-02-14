import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure Google Gemini API
# It's crucial to set your GOOGLE_API_KEY in a .env file or environment variables.
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found. Please set it in your .env file or environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the Gemini model
# Using a model suitable for text generation, e.g., 'gemini-2.5-flash'
model = genai.GenerativeModel('models/gemini-2.5-flash')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_podcast', methods=['POST'])
def generate_podcast():
    user_prompt = request.json.get('prompt')
    if not user_prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        # Construct the full prompt for the Gemini model
        full_prompt = f"""
        You are an expert podcast script and slide outline generator.
        Based on the following request, generate two distinct outputs:
        1. A detailed podcast script in Tamil. The script should be conversational, engaging, and structured with an introduction, main body segments, and a conclusion. Include suggestions for intro/outro music and approximate timings.
        2. A structured slide outline for a presentation based on the podcast content. Each slide should have a "Slide Title," "Content" (bullet points summarizing the key information for that slide), and an "Image Prompt" (a short description for a visual related to the slide).

        User Request: "{user_prompt}"

        Please format the output clearly with distinct sections for the "Podcast Script" and "Slide Outline".
        Use Markdown for both outputs.
        """

        # Generate content using Gemini
        response = model.generate_content(full_prompt)
        generated_content = response.text

        # Basic parsing (can be improved)
        # For now, we'll return the full generated content and let the frontend parse or display as is.
        # In a later step, we can refine this to split into script and slides more robustly.

        return jsonify({"success": True, "content": generated_content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)