# FixMate

FixMate is an expert plumbing and electrical diagnostic assistant built as a Streamlit web application. It uses Google's Gemini 2.5 Flash model to diagnose visible plumbing and electrical problems from images and voice/text descriptions.

## Setup Instructions

1. **Install Python**: Ensure you have Python 3.8+ installed.

2. **Install Dependencies**:
   Navigate to this directory in your terminal and run:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set API Key**:
   You need a Google Gemini API key. Get one from [Google AI Studio](https://aistudio.google.com/).
   Set it as an environment variable in your terminal:

   **Windows (Command Prompt):**
   ```cmd
   set GEMINI_API_KEY=your_api_key_here
   ```
   **Windows (PowerShell):**
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"
   ```
   **Linux/Mac:**
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

4. **Run the Application**:
   Start the Streamlit server:
   ```bash
   streamlit run app.py
   ```

5. **Open in Browser**:
   The app should automatically open in your default web browser at `http://localhost:8501`.

## Features
- Upload photos of plumbing or electrical issues.
- Describe the issue in the chat.
- Get a prioritized repair plan and replacement parts list.
- Safety warnings for hazardous situations.
