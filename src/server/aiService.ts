import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { DocumentLanguage, SectionId } from '../shared/types.ts';
import { ALL_SECTIONS } from '../shared/brandbook/sections.ts';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
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

export async function generateSectionIntroCopy(params: {
  brandName: string;
  sector: string;
  baseline: string;
  description: string;
  values: string[];
  language: DocumentLanguage;
  sectionId: SectionId;
}): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error(
      'Clé API Gemini manquante dans les secrets du serveur (Settings > Secrets).'
    );
  }

  const section = ALL_SECTIONS.find((s) => s.id === params.sectionId);
  const sectionLabel =
    params.language === 'en'
      ? section?.titleEn ?? params.sectionId
      : section?.titleFr ?? params.sectionId;

  const prompt =
    params.language === 'en'
      ? `Write a concise, agency-grade 2-sentence introduction paragraph (max 45 words) for the "${sectionLabel}" section of a Brand Guidelines book.
Brand: ${params.brandName}
Sector: ${params.sector || 'General'}
Tagline: ${params.baseline || 'N/A'}
Description: ${params.description || 'N/A'}
Values: ${params.values.join(', ') || 'Clarity, Precision'}
Return only the plain paragraph text with no markdown, no quotes, and no bullet points.`
      : `Rédige un court paragraphe d'introduction professionnel de niveau agence (2 phrases maximum, ~40 mots) pour la section « ${sectionLabel} » d'une charte graphique.
Marque : ${params.brandName}
Secteur : ${params.sector || 'Général'}
Baseline : ${params.baseline || 'Non précisée'}
Description : ${params.description || 'Non précisée'}
Valeurs : ${params.values.join(', ') || 'Clarté, Exigence'}
Renvoie uniquement le texte brut sans guillemets, sans markdown et sans puces.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  const text = (response.text ?? '').trim();
  if (!text) {
    throw new Error('Réponse vide retournée par le service de rédaction IA.');
  }
  return text;
}
