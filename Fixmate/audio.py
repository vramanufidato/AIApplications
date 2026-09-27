from google import genai

client = genai.Client()

def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribes audio using Gemini 2.5 Flash."""
    if not audio_bytes:
        return ""
        
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            {"mime_type": "audio/mp3", "data": audio_bytes},
            "Please accurately transcribe the user's spoken description of their plumbing or electrical problem. Just provide the transcription text, nothing else."
        ]
    )
    return response.text.strip()
