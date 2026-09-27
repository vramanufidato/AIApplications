import json
from google import genai
from google.genai import types

client = genai.Client()

QUERY_OPTIMIZER_PROMPT = """
Convert each part into the best possible Google Shopping query for India.
Use terms Indian hardware stores actually use:
- "PVC elbow 1/2 inch" (not "PVC 90-degree fitting")
- "MCB 32 amp single pole" (not "circuit breaker 32A SP")
- "ISI marked wire 1.5 sq mm" (not "1.5mm² copper wire")
Keep queries under 8 words. No brand names.
Return JSON: {"queries": [{"part_name": "...", "search_query": "..."}]}
"""

def optimize_queries(parts: list[dict]) -> list[dict]:
    if not parts:
        return []
        
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            QUERY_OPTIMIZER_PROMPT,
            json.dumps(parts),
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.0,
        ),
    )
    return json.loads(response.text).get("queries", [])


def search_parts(queries: list[dict], city: str, api_key: str) -> list[dict]:
    # serpapi is required, we use try-except for local testing without key
    try:
        from serpapi import GoogleSearch
    except ImportError:
        return [{"part_name": q["part_name"], "search_query": q["search_query"], "offers": []} for q in queries]

    if not api_key:
        return [{"part_name": q["part_name"], "search_query": q["search_query"], "offers": []} for q in queries]

    results = []
    for q in queries:
        params = {
            "engine": "google_shopping",
            "q": q["search_query"],
            "gl": "in",
            "hl": "en",
            "location": city,
            "api_key": api_key,
        }
        try:
            data = GoogleSearch(params).get_dict()
            offers = data.get("shopping_results", [])[:5]
            results.append({
                "part_name": q["part_name"],
                "search_query": q["search_query"],
                "offers": [
                    {
                        "title": o.get("title"),
                        "price": o.get("price"),
                        "source": o.get("source"),
                        "link": o.get("product_link") or o.get("link"),
                        "rating": o.get("rating"),
                    }
                    for o in offers
                ],
            })
        except Exception as e:
             results.append({
                "part_name": q["part_name"],
                "search_query": q["search_query"],
                "offers": []
             })
             
    return results
