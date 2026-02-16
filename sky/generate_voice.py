import wave
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables from .env file
load_dotenv()

# Initialize the client with your AI Studio API Key
# It's recommended to store your API key in an environment variable
# For example, in a .env file: GOOGLE_API_KEY="YOUR_AI_STUDIO_API_KEY"
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    client = genai.Client(api_key=api_key)
except ValueError as e:
    print(f"Error: {e}")
    print("Please set your GOOGLE_API_KEY in a .env file or as an environment variable.")
    exit(1)


def generate_speech(text, filename="output.wav", voice="Charon"):
    # Configure the request for audio output
    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",  # Use a model with TTS capabilities
        contents=text,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice  # Options: 'Kore', 'Puck', 'Charon', 'Aoede', 'Enceladus', etc.
                    )
                )
            ),
        ),
    )

    # Extract the PCM audio data from the response
    # The response.candidates can be an empty list, so we need to check if it's not empty.
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                audio_data = part.inline_data.data

                # Save as a standard WAV file (Gemini returns 24kHz, 16-bit, Mono PCM)
                with wave.open(filename, "wb") as wf:
                    wf.setnchannels(1)
                    wf.setsampwidth(2)  # 16-bit
                    wf.setframerate(24000)
                    wf.writeframes(audio_data)
                print(f"Audio saved to {filename}")
                return filename
    else:
        print("No audio content received from the API.")
        print(f"API Response: {response}")
    return None

# Example usage
if __name__ == "__main__":
    example_text = "Hello! This is a test of Google AI Studio's native Text-to-Speech using the Charon voice. Charon is an informative and neutral voice."
    output_file = "charon_test.wav"
    print(f"Generating speech for: '{example_text}' with voice '{'Charon'}'...")
    generated_file = generate_speech(example_text, filename=output_file, voice="Charon")
    if generated_file:
        print(f"Successfully generated audio to {generated_file}")
    else:
        print("Failed to generate audio.")
