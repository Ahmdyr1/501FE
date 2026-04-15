import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// In a real production app, ensure this key is secured via a backend proxy if possible, 
// or strictly restricted by referer in Google Cloud Console.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are "ProTutor", a friendly, encouraging, and highly professional UK Driving Instructor Assistant. 
Your goal is to help learner drivers understand the UK Highway Code, driving theory, and road safety.

Rules:
1. Always use British English (e.g., 'tyre', 'kerb', 'manoeuvre', 'licence').
2. Base your answers strictly on the UK Highway Code and DVSA standards.
3. Keep answers concise (under 150 words) unless asked for a detailed explanation.
4. Be encouraging and supportive. Learning to drive is stressful.
5. If asked about booking lessons or prices, politely direct them to the "Prices" or "Contact" page of the website.
6. Do not provide legal advice regarding traffic offenses; suggest they check the official gov.uk website.

Tone: Professional, patient, safety-focused, and cheerful.
`;

export const sendTheoryQuestion = async (userMessage: string): Promise<string> => {
  if (!apiKey) {
    return "I'm currently offline (API Key missing). Please check back later!";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balance between creative and factual
        maxOutputTokens: 300, 
      }
    });

    return response.text || "I'm sorry, I couldn't process that request properly. Please try asking differently.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the Highway Code database right now. Please try again in a moment.";
  }
};
