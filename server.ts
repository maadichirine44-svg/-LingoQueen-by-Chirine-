import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('RESOURCE_EXHAUSTED');
      if (!isTransient || attempt === retries) break;
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Luna AI Tutor endpoint
  app.post('/api/gemini/luna', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Luna is resting, try again in a few minutes',
      });
    }

    const { message, targetLanguage, history } = req.body as {
      message?: string;
      targetLanguage?: string;
      history?: Array<{ role: 'user' | 'model'; text: string }>;
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const allowedLangs = ['French', 'English', 'Spanish', 'Italian', 'Chinese', 'German'];
    const activeLang = allowedLangs.includes(targetLanguage || '') ? targetLanguage : 'English';

    const systemInstruction = `You are Luna, the royal multilingual AI tutor of LingoQueen by Chirine.
STRICT LANGUAGE RULES:
1. You speak ONLY these 6 languages: French, English, Spanish, Italian, Chinese (Mandarin), and German.
2. You MUST NEVER speak Darija (Moroccan Arabic) or any Arabic dialect, nor Arabic script as your conversational language, even if the user writes in Darija or asks you to speak Darija. If the user writes in Darija or asks for Darija, politely decline in ${activeLang} (e.g., explain you only teach and converse in French, English, Spanish, Italian, Chinese, and German) and invite them to continue in ${activeLang}.
3. Currently the student's active language is ${activeLang}. Reply primarily in ${activeLang} (you may include brief helpful English clarity only for beginners if asked).
4. Answer ANY language, grammar, vocabulary, culture, or hospitality question thoroughly and warmly.
5. ALWAYS check the user's message for grammar or spelling mistakes in the 6 languages. If there are errors, set hasCorrection to true, provide the exact correctedSentence, and a short clear explanation. If their sentence is grammatically correct, set hasCorrection to false.`;

    try {
      const contents = [
        ...(Array.isArray(history)
          ? history.slice(-10).map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }],
            }))
          : []),
        { role: 'user', parts: [{ text: message }] },
      ];

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: 'Luna response in one of the 6 supported languages only.',
                },
                languageUsed: {
                  type: Type.STRING,
                  description: 'Which of the 6 languages Luna used.',
                },
                hasCorrection: {
                  type: Type.BOOLEAN,
                  description: 'True if the user message contained a grammar/spelling error.',
                },
                correctedSentence: {
                  type: Type.STRING,
                  description: 'Corrected version of the user sentence if hasCorrection is true.',
                },
                grammarNote: {
                  type: Type.STRING,
                  description: 'Brief grammar explanation in the active language or English.',
                },
              },
              required: ['reply', 'languageUsed', 'hasCorrection'],
            },
          },
        })
      );

      const rawText = (response.text ?? '').trim();
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText || '{}');
      } catch {
        parsed = {
          reply: rawText || `Let us continue practicing ${activeLang}!`,
          languageUsed: activeLang,
          hasCorrection: false,
        };
      }
      return res.json(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach Gemini API';
      return res.status(503).json({ error: msg });
    }
  });

  // Evaluate lesson writing (5-8 sentences)
  app.post('/api/gemini/evaluate-writing', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const { text, language, prompt, level } = req.body as {
      text?: string;
      language?: string;
      prompt?: string;
      level?: string;
    };

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Writing text is required.' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Evaluate this ${level || 'A1'} ${language || 'French'} student writing submission.
Prompt: "${prompt || ''}"
Student text:
"""
${text}
"""
Provide a fair numeric score out of 100, a corrected polished version of their text, 2-4 specific corrections/notes, and encouraging feedback.`,
        config: {
          systemInstruction:
            'You are an encouraging, precise language examiner for LingoQueen. Score 0-100 based on grammar, vocabulary, prompt relevance, and having 5-8 complete sentences.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              correctedText: { type: Type.STRING },
              feedback: { type: Type.STRING },
              corrections: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['score', 'correctedText', 'feedback', 'corrections'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to evaluate writing';
      return res.status(502).json({ error: msg });
    }
  });

  // Evaluate Hospitality CV
  app.post('/api/gemini/evaluate-cv', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const { cvData, targetLanguage } = req.body as {
      cvData?: Record<string, string>;
      targetLanguage?: string;
    };

    if (!cvData) {
      return res.status(400).json({ error: 'CV data is required.' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Review this luxury hospitality / hotel job CV written for a ${targetLanguage || 'English'} position:
${JSON.stringify(cvData, null, 2)}
Score it out of 100, provide an improved professional summary, and list 3-5 concrete corrections or upgrades.`,
        config: {
          systemInstruction:
            'You are a 5-star luxury hotel HR director evaluating a hospitality CV. Respond in clean structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              polishedSummary: { type: Type.STRING },
              corrections: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              overallFeedback: { type: Type.STRING },
            },
            required: ['score', 'polishedSummary', 'corrections', 'overallFeedback'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to evaluate CV';
      return res.status(502).json({ error: msg });
    }
  });

  // Hotel Job Interview Role-Play
  app.post('/api/gemini/interview', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
      },);
    }

    const { answer, question, step, totalSteps, targetLanguage, role } = req.body as {
      answer?: string;
      question?: string;
      step?: number;
      totalSteps?: number;
      targetLanguage?: string;
      role?: string;
    };

    if (!answer) {
      return res.status(400).json({ error: 'Candidate answer is required.' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Role applied for: ${role || 'Front Desk Receptionist'}
Target interview language: ${targetLanguage || 'English'}
Question #${step || 1} of ${totalSteps || 5}: "${question || ''}"
Candidate's answer: "${answer}"
Score this answer 0-100, give concise constructive HR feedback (including any language/grammar polish), and provide the next follow-up reaction.`,
        config: {
          systemInstruction:
            'You are the General Manager of Grand Palace Hotel conducting a real hospitality job interview. Evaluate professionalism, hospitality warmth, and language accuracy.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              feedback: { type: Type.STRING },
              polishedAnswer: { type: Type.STRING },
              interviewerReaction: { type: Type.STRING },
            },
            required: ['score', 'feedback', 'polishedAnswer', 'interviewerReaction'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to evaluate interview response';
      return res.status(502).json({ error: msg });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build not found. Run npm run build.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LingoQueen server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
