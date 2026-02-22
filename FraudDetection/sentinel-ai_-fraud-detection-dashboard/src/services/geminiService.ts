import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function explainRisk(transaction: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
        Analyze the following financial transaction for potential fraud risk. 
        Explain why it might be flagged based on common fraud patterns (e.g., unusual amount, location mismatch, velocity).
        
        Transaction Details:
        - Amount: $${transaction.amount}
        - Merchant: ${transaction.merchant}
        - Category: ${transaction.category}
        - Location: ${transaction.location}
        - Risk Score: ${transaction.risk_score}
        
        Provide a concise, professional analysis for a fraud analyst.
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analysis unavailable at this time.";
  }
}
