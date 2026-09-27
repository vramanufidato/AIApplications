import json
from google import genai
from google.genai import types
from prompts import SYSTEM_PROMPT, DIAGNOSIS_SCHEMA, build_diagnosis_prompt

client = genai.Client()

def diagnose(image_bytes: bytes, voice_transcript: str, city: str) -> dict:
    prompt = build_diagnosis_prompt(voice_transcript, city)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg") if image_bytes else None,
            prompt,
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=DIAGNOSIS_SCHEMA,
            temperature=0.2,
        ),
    )
    return json.loads(response.text)
