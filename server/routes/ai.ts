import express from "express";
import { GoogleGenAI } from "@google/genai";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Lazy initialization of Gemini API client
let ai: GoogleGenAI | null = null;
const getAiClient = () => {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY environment variable is required");
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
};

router.post("/chat", protect, async (req, res) => {
  try {
    const { message, history } = req.body;
    const client = getAiClient();
    
    // Format history for Gemini
    const formattedHistory = history?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })) || [];

    const chat = client.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: "You are a helpful and intelligent AI study assistant. Explain concepts clearly, summarize text efficiently, and help students prepare for exams. Keep answers concise but informative.",
        }
    });
    
    // send past messages if any
    for (const msg of formattedHistory) {
        await chat.sendMessage({message: msg.parts[0].text});
    }

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate AI response" });
  }
});

router.post("/summarize", protect, async (req, res) => {
    try {
        const { text } = req.body;
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Summarize the following text into short, concise revision points suitable for studying. Use bullet points.\n\n${text}`
        });
        res.json({ text: response.text });
    } catch(error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/generate-flashcards", protect, async (req, res) => {
    try {
        const { topic, count } = req.body;
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate exactly ${count} flashcards for the topic: "${topic}". 
            Respond ONLY with a valid JSON array of objects. Each object must have a "question" (string) and an "answer" (string) property. 
            Do not include markdown blocks or any other text.
            Example: [{"question": "What is...", "answer": "It is..."}]`
        });
        
        let jsonStr = response.text || "[]";
        // Clean up potential markdown formatting from AI response
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```\n?$/, '');
        }
        
        const flashcards = JSON.parse(jsonStr);
        res.json(flashcards);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/generate-quiz", protect, async (req, res) => {
    try {
        const { subject, topic, count, difficulty } = req.body;
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a multiple choice quiz with exactly ${count} questions about "${topic}" in the subject "${subject}" at a "${difficulty}" difficulty level.
            Respond ONLY with a valid JSON array of objects. Each object must have:
            - question (string)
            - options (array of 4 strings)
            - correctAnswer (string, must exactly match one of the options)
            - explanation (string)
            Do not include markdown blocks or any other text.`
        });
        
        let jsonStr = response.text || "[]";
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```\n?$/, '');
        }
        
        const quiz = JSON.parse(jsonStr);
        res.json(quiz);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
