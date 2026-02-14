# AI Podcast & Slide Generator

This is a Flask-based web application that leverages Google's Gemini API to generate podcast scripts and slide outlines based on user prompts. It further processes the generated text to create an audio version (using `gTTS`) and a PDF document (using `fpdf2`), organizing all outputs into a dated folder structure.

## Features

*   **Content Generation:** Generates detailed podcast scripts and slide outlines using Google Gemini.
*   **Text-to-Speech (TTS):** Converts the podcast script into an MP3 audio file using `gTTS`. Includes text preprocessing to remove common script annotations (timestamps, speaker notes) for cleaner audio.
*   **PDF Generation:** Creates a PDF document of the podcast script, supporting Tamil characters.
*   **Organized Output:** Saves the generated text script, PDF, and audio file into a structured directory (`outputs/YYYY/MM/DD/prompt_keywords_timestamp/`).
*   **Web Interface:** A simple and intuitive web interface for inputting prompts and accessing generated content.

## Architecture

The application follows a client-server architecture with a Python Flask backend serving a simple HTML/JavaScript frontend. It integrates with external APIs and manages local file storage.

```mermaid
graph TD
    A[User (Browser)] -->|Input Prompt| B(Frontend: HTML/JS)
    B -->|API Call: /generate_podcast| C(Flask Backend: app.py)

    C -->|Text Generation Request| D(Google Gemini API)
    D -->|Generated Text (Script, Outline)| C

    C -->|TTS Request (Script)| E(gTTS Service)
    E -->|MP3 Audio| C

    C -->|PDF Generation (Script)| F(fpdf2 Library)
    F -->|PDF Document| C

    C -->|Save TXT, PDF, MP3| G[Local File System: outputs/]
    G -->|Serve Files| B

    subgraph Local Environment
        C
        F
        G
        H[static/fonts/: NotoSansTamil-Regular.ttf] -- PDF Font --> F
    end

    subgraph External Services
        D
        E
    end

    B -->|Display Content & Download Links| A
```

### Component Breakdown:

*   **User (Browser):** Interacts with the web interface to submit prompts and download generated files.
*   **Frontend (HTML/JS):** A simple single-page application that provides the user interface, sends API requests to the Flask backend, and dynamically displays the generated content and download links.
*   **Flask Backend (`app.py`):**
    *   The core Python application built with Flask.
    *   Handles routing, API requests, and orchestration of services.
    *   **Google Gemini API:** Utilized to generate the core textual content (podcast script and slide outline) based on the user's prompt. Authenticated via `GOOGLE_API_KEY`.
    *   **`gTTS` Service:** Used to convert the podcast script text into an MP3 audio file. It leverages Google's free online text-to-speech service.
    *   **`fpdf2` Library:** A Python library used to render the podcast script into a PDF document.
    *   **Local File System (`outputs/`):** A directory managed by the Flask app to store all generated `.txt`, `.pdf`, and `.mp3` files in a structured, dated hierarchy.
    *   **`static/fonts/`:** Contains the `NotoSansTamil-Regular.ttf` font file, essential for `fpdf2` to correctly render Tamil characters in the PDF.

---

## Setup and Installation

### Prerequisites

*   Python 3.8+
*   `pip` (Python package installer)

### 1. Clone the Repository (or ensure you have the files)

Ensure you have the following files in your project directory:
```
.
├── app.py
├── requirements.txt
├── .env
├── templates/
│   └── index.html
└── static/
    └── fonts/
```

### 2. Obtain Your Google Gemini API Key

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Create or retrieve your API key.

### 3. Configure API Keys and Environment Variables

1.  Open the `.env` file in your project root.
2.  Add your Gemini API key:
    ```
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```

### 4. Tamil Font for PDF Generation

1.  **Download Noto Sans Tamil:**
    *   Go to [Google Fonts: Noto Sans Tamil](https://fonts.google.com/specimen/Noto+Sans+Tamil).
    *   Download the font family (look for `NotoSansTamil-Regular.ttf` within the downloaded ZIP).
2.  **Place the Font File:**
    *   Copy `NotoSansTamil-Regular.ttf` into the `static/fonts/` directory within your project. Ensure the filename is exactly `NotoSansTamil-Regular.ttf`.

### 5. Install Python Dependencies

1.  Open your terminal or command prompt in the project directory.
2.  **Create a virtual environment** (recommended):
    ```bash
    python -m venv venv
    ```
3.  **Activate the virtual environment:**
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
4.  **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

### 6. Run the Flask Application

1.  With your virtual environment activated, run:
    ```bash
    python app.py
    ```
2.  You should see output similar to: `* Running on http://127.0.0.1:5000`

### 7. Access the Application

1.  Open your web browser and navigate to `http://127.0.0.1:5000`.
2.  Enter your desired prompt (e.g., "create a tamil podcast on tamil actor chandra babu") and click "Generate Podcast & Slides".
3.  The generated text, along with links to download the MP3 audio, PDF document, and raw text file, will appear.

---
**Note on `gTTS` Quality:**
The audio generation uses `gTTS`, which leverages Google's free online text-to-speech service. While convenient and free, its voice quality can sometimes be perceived as robotic. Efforts have been made to preprocess the script to remove common annotations (like timestamps or instructions) that `gTTS` might misread. If higher fidelity TTS is required without Google Cloud's paid services, further manual steps or exploration of other APIs would be necessary.
