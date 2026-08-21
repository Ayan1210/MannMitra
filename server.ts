import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate-summary', async (req, res) => {
  try {
    const { student, analysis } = req.body;
    if (!student || !analysis) {
      return res.status(400).json({ error: 'Missing student or analysis payload' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on server' });
    }

    const checkIns = student.checkIns || [];
    const timelineSummary = checkIns
      .map(
        (c: any) =>
          `Week ${c.weekNumber} (${c.date}): Wellbeing ${c.overallWellbeing}/5, Academic Stress ${c.academicStress}/5, Sleep ${c.sleepQuality}/5, Energy ${c.energyLevel}/5, Social ${c.socialConnection}/5, Focus ${c.concentration}/5. Note: "${c.personalReflection || 'None provided'}"`
      )
      .join('\n');

    const systemInstruction = `You are an ethical assistant for university wellbeing counselors. 
Your goal is to synthesize self-reported student wellbeing check-in patterns over time into a concise, empathetic, non-diagnostic counselor briefing.
CRITICAL SAFEGUARDS:
- NEVER use psychiatric or diagnostic labels (e.g. do NOT say depression, anxiety disorder, MDD, insomnia disorder).
- DO focus on environmental factors, workload pacing, sleep routines, social connectedness, and observed score shifts.
- Keep tone professional, supportive, and action-oriented for a 1-on-1 counselor check-in.
- Provide JSON output format with:
  "summary": concise 2-sentence overview of the observed change over time,
  "keyObservations": list of 3 bullet points highlighting specific pattern shifts,
  "suggestedOpeners": list of 2 gentle, non-threatening conversation starters the counselor can use.`;

    const userPrompt = `Student Code: ${student.anonymousCode}
Department: ${student.department} (${student.year})
Longitudinal Check-in History (Oldest to Newest):
${timelineSummary}

Deterministic Engine Flags:
Status: ${analysis.status}
Decline Streak: ${analysis.consecutiveDeclines} weeks
Primary Drivers: ${(analysis.primaryDrivers || []).join(', ')}
Engine Explanation: ${analysis.explanation}

Generate the structured counselor synthesis.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return res.json({
        summary: parsed.summary,
        keyObservations: parsed.keyObservations,
        suggestedOpeners: parsed.suggestedOpeners,
        disclaimer:
          'AI-generated briefing for qualified counselor review only. This is an early-warning communication aid, NOT a clinical or psychiatric diagnosis.',
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    return res.status(500).json({ error: 'No output received from Gemini API' });
  } catch (err: any) {
    console.error('Error generating counselor summary:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
});

// Vite middleware in development vs static serve in production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
