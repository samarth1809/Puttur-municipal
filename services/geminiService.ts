
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ReportCategory, Language } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a municipal report using Gemini to determine its impact and urgency.
 */
export const analyzeReport = async (title: string, description: string) => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY_MISSING");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert municipal infrastructure auditor. Analyze this citizen report from Puttur, Karnataka.
      
      Title: ${title}
      Description: ${description}
      
      Tasks:
      1. Determine Severity (Low, Medium, High) based on potential danger or environmental damage.
      2. Suggest Priority (Low, Medium, High, Critical) based on immediate threat to public safety or core utilities.
      3. Provide a concise action-oriented summary (max 50 words).
      
      Strictly follow the JSON schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { 
              type: Type.STRING, 
              description: "The degree of impact (Low, Medium, High)" 
            },
            priority: { 
              type: Type.STRING, 
              description: "The suggested urgency level (Low, Medium, High, Critical)" 
            },
            summary: { 
              type: Type.STRING, 
              description: "Executive summary for the municipal task force" 
            }
          },
          required: ["severity", "priority", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("AI Analysis failed:", error);
    let errorMessage = "AI Analysis unavailable.";
    
    if (error.message === "API_KEY_MISSING") {
      errorMessage = "Disconnected: API Key Missing.";
    } else if (error.status === 429) {
      errorMessage = "System Overloaded. Priority default: Low.";
    }
    
    return { severity: "Medium", priority: "Medium", summary: errorMessage };
  }
};

/**
 * Creates a new chat session for the MuniBot assistant.
 */
export const createMuniBotChat = (lang: Language): Chat => {
  const langName = lang === Language.KANNADA ? 'Kannada' : lang === Language.HINDI ? 'Hindi' : 'English';
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are PMC Assistant (MuniBot) for Puttur Municipal Corporation.
      
      Core Rules:
      1. RESPOND IN SHORT TERMS. Be punchy and direct.
      2. STEP-BY-STEP SOLUTIONS. For all procedures or "how-to" questions, provide numbered steps (1, 2, 3...).
      3. MAX 100 WORDS. Keep it brief.
      4. Language: Always respond in ${langName}.
      
      Specific Content:
      - How to report: 1. Login. 2. Click "File Report". 3. Attach image & details. 4. Dispatched.
      - Categories: Waste, Water, Roads, Social.
      - Emergency: Call 112 immediately.
      - Wards: Darbe, Bolwar, Nehru Nagar, etc.`,
    },
  });
};
