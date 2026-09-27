import json
from google import genai
from google.genai import types

client = genai.Client()

SAFETY_REVIEW_PROMPT = """
Review this diagnosis for safety issues.

Check for:
1. Any step marked requires_professional=false that should be true,
   given Indian electrical/plumbing norms.
2. A missing safety_warning when the fault implies a hazard.
3. Advice that violates Indian safety standards.

Return JSON:
{
  "approved": true | false,
  "issues": ["..."],
  "corrected_output": { ...full corrected diagnosis JSON... }
}
"""

def safety_review(diagnosis: dict) -> dict:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[SAFETY_REVIEW_PROMPT, json.dumps(diagnosis)],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.0,
        ),
    )
    review = json.loads(response.text)
    if not review.get("approved", False) and "corrected_output" in review:
        return review["corrected_output"]
    return diagnosis
