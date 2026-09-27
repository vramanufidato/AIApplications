SYSTEM_PROMPT = """
You are "FixMate" — an expert plumbing and electrical diagnostic assistant
built for a Raspberry Pi-based field tool. You help homeowners and
technicians identify faults from photos, voice descriptions, or both.

DOMAIN SCOPE:
- PLUMBING: leaks, pipe corrosion, joint failures, clogged drains,
  water heater issues, valve problems, faucet drips, toilet faults.
- ELECTRICAL: exposed wiring, burnt outlets, tripped breakers, loose
  connections, corroded terminals, faulty switches, overloaded circuits,
  damaged insulation, flickering lights, earthing issues.

STRICT RULES:
1. SAFETY FIRST. If the image or description suggests an immediate hazard
   (sparking, burning smell, active water near electricity, gas smell,
   exposed live wires), your FIRST line MUST be a safety warning telling
   the user to cut power/water and call a licensed professional.
2. NEVER instruct the user to perform work that legally requires a
   licensed electrician or plumber in India (main panel work, gas line
   repair, structural pipe replacement).
3. If the image is unclear, ask for a specific re-shot instead of guessing.
4. Do not invent part numbers. Use generic, searchable component names.
5. State confidence as HIGH / MEDIUM / LOW per fault.
6. Never recommend a brand unless explicitly asked.
"""

DIAGNOSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "safety_warning": {"type": "string", "nullable": True},
        "summary": {"type": "string"},
        "faults": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "evidence": {"type": "string"},
                    "confidence": {"type": "string", "enum": ["HIGH", "MEDIUM", "LOW"]},
                    "root_cause": {"type": "string"}
                },
                "required": ["name", "evidence", "confidence", "root_cause"]
            }
        },
        "repair_steps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "step": {"type": "integer"},
                    "action": {"type": "string"},
                    "requires_professional": {"type": "boolean"}
                },
                "required": ["step", "action", "requires_professional"]
            }
        },
        "parts_needed": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "category": {"type": "string", "enum": ["plumbing", "electrical"]},
                    "quantity": {"type": "string"},
                    "notes": {"type": "string", "nullable": True}
                },
                "required": ["name", "category", "quantity"]
            }
        },
        "tools_needed": {"type": "array", "items": {"type": "string"}},
        "difficulty": {"type": "string", "enum": ["EASY", "MODERATE", "HARD", "CALL A PRO"]},
        "estimated_time": {"type": "string"},
        "follow_up_questions": {"type": "array", "items": {"type": "string"}},
        "reshoot_request": {"type": "string", "nullable": True}
    },
    "required": ["summary", "faults", "repair_steps", "parts_needed",
                 "tools_needed", "difficulty", "estimated_time"]
}

def build_diagnosis_prompt(transcript: str, city: str) -> str:
    return f"""
TASK: Diagnose the plumbing/electrical problem in the attached image.

USER'S SPOKEN DESCRIPTION (transcribed):
\"\"\"
{transcript or "No voice description provided."}
\"\"\"

LOCATION HINT: {city}

If no voice was provided, rely on visual evidence and mark confidence
conservatively. If the image is unclear, populate "reshoot_request".

Return ONLY the JSON object matching the schema.
"""
