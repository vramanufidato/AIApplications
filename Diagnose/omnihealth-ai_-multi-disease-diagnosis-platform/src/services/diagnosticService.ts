import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeMRI(base64Image: string) {
  const model = "gemini-2.5-flash-image";
  
  const prompt = `Act as a Senior Radiologist and Oncology Expert. 
  Analyze this MRI scan for potential tumors or anomalies. 
  Provide a structured response including:
  1. Primary Findings
  2. Probability of Malignancy (0-1)
  3. Suggested Next Steps
  4. Metadata Extraction (if any text is visible)
  
  Return the response in a professional medical format.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: "image/png" } },
        { text: prompt }
      ]
    }
  });

  return response.text;
}

export async function predictDiabetes(data: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `Act as a Health Informatics Expert. 
  Using the Pima Indians Diabetes dataset logic (Random Forest simulation), predict the diabetes probability for this patient:
  ${JSON.stringify(data)}
  
  Provide:
  - Probability (0-1)
  - Risk factors identified
  - Confidence score of the model`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text;
}

export async function analyzeMentalHealthPatterns(data: any) {
  const model = "gemini-3-flash-preview";
  const prompt = `Act as a Lead ML Engineer. 
  Perform an Unsupervised Isolation Forest / K-Means clustering analysis on this mental health survey data to identify anomalies or risk patterns:
  ${JSON.stringify(data)}
  
  Provide:
  - Cluster assignment
  - Anomaly score
  - Key behavioral markers`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return response.text;
}
