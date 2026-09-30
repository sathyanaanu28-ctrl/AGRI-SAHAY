import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Set payload limit for image uploads
app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient generateContent helper that falls back gracefully across active models
async function generateContentSafe(params: {
  contents: any;
  config?: any;
}) {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = err.message || '';
      const isQuotaOrRateLimit =
        err.status === 429 ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        msg.includes('exceeded your current quota') ||
        msg.includes('rate-limit');

      if (isQuotaOrRateLimit) {
        console.warn(`Quota exhausted on ${model}, attempting fallback model...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// Helper language mapping for Gemini prompt clarity
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  mr: 'Marathi (मराठी)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
};

// 1. Crop Disease Detection Endpoint
app.post('/api/diagnose-crop', async (req, res) => {
  try {
    let { imageBase64, mimeType = 'image/jpeg', languageCode = 'en' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Strip data URI scheme prefix if present
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      if (parts[0].startsWith('data:')) {
        mimeType = parts[0].replace('data:', '');
      }
      imageBase64 = parts[1];
    } else if (imageBase64.includes(',')) {
      const parts = imageBase64.split(',');
      if (parts[0].startsWith('data:')) {
        mimeType = parts[0].replace('data:', '').replace(';utf8', '');
      }
      imageBase64 = parts[1];
    }

    const langName = LANGUAGE_NAMES[languageCode] || 'English';

    const prompt = `You are a world-class plant pathologist and sustainable organic agriculture specialist.
Analyze this plant or leaf image. Identify any disease, insect pest damage, nutrient deficiency, or confirm if the plant is healthy.
IMPORTANT: Respond with text in the language: ${langName} (language code: ${languageCode}).
Provide practical, organic, non-toxic remedies that local smallholder or commercial organic farmers can prepare or source easily (e.g., neem oil, Trichoderma viride, Pseudomonas fluorescens, copper oxychloride organic permitted, milk spray, compost tea, companion planting, bio-controls).
Also provide clear visible symptoms and cultural preventative practices.`;

    let contents: any[];

    // Detect if content is SVG or URL-encoded vector markup
    let isSvg = (mimeType && mimeType.includes('svg'));
    let decodedText = '';

    if (imageBase64.startsWith('%') || imageBase64.includes('%3C') || imageBase64.includes('%20')) {
      try {
        decodedText = decodeURIComponent(imageBase64);
        if (decodedText.includes('<svg')) {
          isSvg = true;
        }
      } catch {
        // ignore
      }
    } else {
      try {
        decodedText = Buffer.from(imageBase64, 'base64').toString('utf8');
        if (decodedText.includes('<svg')) {
          isSvg = true;
        }
      } catch {
        // ignore
      }
    }

    if (isSvg) {
      if (!decodedText) {
        try {
          decodedText = decodeURIComponent(imageBase64);
        } catch {
          decodedText = Buffer.from(imageBase64, 'base64').toString('utf8');
        }
      }
      // Pass vector pathology representation cleanly in text prompt for Gemini to inspect
      contents = [
        `${prompt}\n\n[Pathology leaf specimen vector markings and features]:\n${decodedText}`,
      ];
    } else {
      // Normal raster image (PNG, JPEG, WEBP)
      contents = [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64,
          },
        },
        prompt,
      ];
    }

    const response = await generateContentSafe({
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['Disease', 'Pest', 'Nutrient Deficiency', 'Healthy'] },
            severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            organicRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
            preventativeMeasures: { type: Type.ARRAY, items: { type: Type.STRING } },
            scientificName: { type: Type.STRING },
            pathogenType: { type: Type.STRING },
            spraySchedule: { type: Type.STRING },
          },
          required: [
            'diseaseName',
            'confidenceScore',
            'type',
            'severity',
            'symptoms',
            'organicRemedies',
            'preventativeMeasures',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Crop diagnosis error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze crop image',
    });
  }
});

// 2. Comprehensive Eco-Plan Generator
app.post('/api/generate-eco-plan', async (req, res) => {
  try {
    const {
      location,
      soilType,
      season,
      budget,
      farmSize,
      irrigation = 'Standard drip/canal',
      farmingGoal = 'Maximize organic profit & soil regeneration',
      languageCode = 'en',
    } = req.body;

    const langName = LANGUAGE_NAMES[languageCode] || 'English';

    const prompt = `You are a chief agronomist specializing in regenerative and sustainable organic farming.
Create an exhaustive, highly practical Eco-Farming Plan for:
- Location / Region: ${location || 'Tropical agricultural belt'}
- Soil Type: ${soilType || 'Loamy fertile soil'}
- Season: ${season || 'Current Season'}
- Budget Level: ${budget || 'Moderate'}
- Farm Size: ${farmSize || '2 Acres'}
- Irrigation: ${irrigation}
- Primary Goal: ${farmingGoal}

IMPORTANT: Write all descriptions, crop names, reasoning, steps, and tips in the target language: ${langName} (code: ${languageCode}).
Include 3-4 top recommended crops with suitability percentages, yield estimates, and organic economic profit potential.
Provide a clear chronological 4-step organic growth plan (from land prep & seed treatment to harvest), risk analysis, and local APMC market insights with price trends.`;

    const response = await generateContentSafe({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sustainabilityScore: { type: Type.NUMBER },
            soilHealthAnalysis: { type: Type.STRING },
            recommendedCrops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cropName: { type: Type.STRING },
                  suitabilityScore: { type: Type.NUMBER },
                  expectedYield: { type: Type.STRING },
                  estimatedProfit: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  durationDays: { type: Type.STRING },
                  waterRequirement: { type: Type.STRING },
                },
                required: ['cropName', 'suitabilityScore', 'expectedYield', 'estimatedProfit', 'reasoning'],
              },
            },
            ecoPlanSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  timeline: { type: Type.STRING },
                  organicInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
                  waterStrategy: { type: Type.STRING },
                  keyPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['phase', 'timeline', 'organicInputs', 'waterStrategy', 'keyPractices'],
              },
            },
            riskAnalysis: {
              type: Type.OBJECT,
              properties: {
                pestRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                climateRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                mitigationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['pestRisks', 'climateRisks', 'mitigationTips'],
            },
            marketInsights: {
              type: Type.OBJECT,
              properties: {
                currentDemand: { type: Type.STRING },
                priceTrend: { type: Type.STRING, enum: ['Upward', 'Stable', 'Downward'] },
                recommendedBuyerChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
                peakSellingPeriod: { type: Type.STRING },
              },
              required: ['currentDemand', 'priceTrend', 'recommendedBuyerChannels'],
            },
          },
          required: [
            'summary',
            'sustainabilityScore',
            'recommendedCrops',
            'ecoPlanSteps',
            'riskAnalysis',
            'marketInsights',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Eco plan error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate eco-farming plan',
    });
  }
});

// 3. Compost C:N Optimizer Endpoint
app.post('/api/analyze-compost', async (req, res) => {
  try {
    const { materials = [], totalKg = 100, languageCode = 'en' } = req.body;

    const langName = LANGUAGE_NAMES[languageCode] || 'English';

    const materialsList = materials
      .map((m: any) => `- ${m.name} (${m.category}): ${m.quantityKg} kg`)
      .join('\n');

    const prompt = `You are an expert bio-fertilizer and composting scientist.
Analyze this farmer's compost recipe:
Materials:
${materialsList || 'Dry leaves (Brown) 40kg, Cow manure (Green) 30kg, Kitchen veg scraps (Green) 20kg, Straw (Brown) 10kg'}
Total volume: ${totalKg} kg.

Calculate the approximate Carbon-to-Nitrogen (C:N) ratio (ideal is 25:1 to 30:1), decomposition duration in weeks, moisture recommendations (ideal 50-60%), microbial quality grade, and practical bio-accelerators (e.g. cow urine/dung slurry, buttermilk, jaggery water, trichoderma).
IMPORTANT: Translate all descriptions and advice into language: ${langName} (code: ${languageCode}).`;

    const response = await generateContentSafe({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cnRatio: { type: Type.STRING },
            estimatedReadyWeeks: { type: Type.NUMBER },
            moistureAdvice: { type: Type.STRING },
            qualityGrade: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            acceleratorTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            aerationSchedule: { type: Type.STRING },
            warningFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['cnRatio', 'estimatedReadyWeeks', 'moistureAdvice', 'recommendations', 'qualityGrade'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Compost analysis error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze compost materials',
    });
  }
});

// 4. Crop Rotation Strategy Endpoint
app.post('/api/plan-rotation', async (req, res) => {
  try {
    const { currentCrop, soilCondition = 'Normal', season = 'Upcoming', languageCode = 'en' } = req.body;

    const langName = LANGUAGE_NAMES[languageCode] || 'English';

    const prompt = `You are a specialist in regenerative crop rotation, cover crops, and soil microbiology.
The farmer has just grown or is currently cultivating: "${currentCrop || 'Tomato'}".
Current soil condition: "${soilCondition}".
Target upcoming season: "${season}".

Provide:
1. Top 3 sequential crop recommendations that prevent soil nutrient depletion, break specific pest/pathogen life cycles, and maximize organic yield.
2. Intercropping and companion planting options that thrive alongside or between rows.
3. Long-term regenerative soil health strategy.
4. A multi-season 3-season rotation cycle.
IMPORTANT: Translate all explanations, benefits, and crop names into language: ${langName} (code: ${languageCode}).`;

    const response = await generateContentSafe({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentCrop: { type: Type.STRING },
            nextCropRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  crop: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  soilImpact: { type: Type.STRING },
                  botanicalFamily: { type: Type.STRING },
                  economicValue: { type: Type.STRING },
                },
                required: ['crop', 'benefit', 'soilImpact'],
              },
            },
            intercroppingOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            soilHealthStrategy: { type: Type.STRING },
            rotationCycleSeasons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  seasonName: { type: Type.STRING },
                  cropName: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                },
                required: ['seasonName', 'cropName', 'purpose'],
              },
            },
          },
          required: ['currentCrop', 'nextCropRecommendations', 'intercroppingOptions', 'soilHealthStrategy'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Crop rotation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate crop rotation strategy',
    });
  }
});

// 5. Quick Farm Advisor Q&A
app.post('/api/farm-advisory', async (req, res) => {
  try {
    const { question, languageCode = 'en' } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const langName = LANGUAGE_NAMES[languageCode] || 'English';

    const prompt = `You are AgriSahay's senior organic farming advisor. Answer the farmer's question in a practical, scientific yet simple and encouraging manner.
Farmer Question: "${question}"
Target Language: ${langName} (code: ${languageCode}).
Provide bullet points with step-by-step instructions, dosages (e.g. 5ml neem oil / liter, 200L Jeevamrutha / acre), and safety or storage notes.`;

    const response = await generateContentSafe({
      contents: prompt,
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Advisory error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to answer farm advisory question',
    });
  }
});

// Vite middleware for development or static serving for production
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`AgriSahay full-stack server running on http://0.0.0.0:${port}`);
});
