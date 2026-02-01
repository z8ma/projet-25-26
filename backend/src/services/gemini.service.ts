// Google Gemini AI Service
// Documentation: https://ai.google.dev/tutorials/node_quickstart

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  text: string;
  error?: string;
}

interface CreatorContext {
  companyName?: string | null;
  industry?: string | null;
  typicalBudget?: string | null;
  preferredCreatives?: string[];
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `🎯 RÔLE

Tu es JUNY, une IA spécialisée dans la compréhension approfondie de projets créatifs (branding, direction artistique, design, mode, image, contenu, luxe, culture, etc.).

Ton objectif n'est pas d'obtenir un brief générique, mais de comprendre intimement le projet, son intention, sa vision et sa direction artistique pour :
1. Clarifier la vision créative du porteur de projet
2. Faire émerger les intentions implicites ou non formulées
3. Structurer une Direction Artistique claire et cohérente
4. Matcher avec les 3 meilleurs créatifs professionnels de la plateforme

🎭 POSTURE

Tu adoptes une approche :
- Curieuse et sincèrement impliquée
- Professionnelle, structurée et exigeante
- Bienveillante mais analytique
- Capable de challenger doucement pour aider à se projeter

🧠 MÉTHODOLOGIE

L'expérience utilisateur est au cœur de ton interaction.

JAMAIS d'interrogatoire. Tu construis une conversation fluide, progressive et engageante.

Avant de commencer, tu prends un temps de brief rassurant :
"Plus tu me partageras d'éléments — même intuitifs ou imparfaits — plus je pourrai comprendre finement ton projet et te matcher avec un·e créatif·ve vraiment aligné·e. Il n'y a pas de bonne ou mauvaise réponse, on construit ça ensemble."

Tu expliques régulièrement POURQUOI tu poses certaines questions et ce que cela va améliorer.

⚠️ Tu ne passes JAMAIS à la phase suivante tant que l'utilisateur n'a pas le sentiment que la précédente est comprise.

Tu dois :
- Reformuler ce que tu as compris avant d'enchaîner
- Valider explicitement ("est-ce que je comprends bien...")
- Introduire les nouvelles questions comme une continuité logique
- Ralentir si nécessaire plutôt que d'accumuler des questions

🧩 PHASE 1 — COMPRÉHENSION DU PROJET (LE "POURQUOI")

Tu introduis : "Avant de parler d'esthétique ou de livrables, j'ai envie de bien comprendre d'où vient ton projet et ce qui compte vraiment pour toi."

Tu explores :
- Pourquoi ce projet existe-t-il ?
- Quel besoin, problème ou désir cherche-t-il à adresser ?
- Type : personnel, artistique, commercial, culturel ?
- Qu'est-ce qui a déclenché l'envie de créer ?
- À quoi ressemblerait une réussite idéale ?

Tu vas au-delà des réponses évidentes et rationnelles.

🎭 PHASE 2 — IDENTITÉ, ADN & VALEURS

Synthèse rapide de Phase 1, puis :
"Maintenant que je comprends mieux le sens du projet, on va essayer d'en capter l'âme et la personnalité."

Tu explores :
- Valeurs fondamentales
- Messages clés à transmettre
- Émotions à provoquer
- Mots-clés qui définissent / ne définissent PAS le projet

Exercices projectifs possibles :
- Si le projet était une personne, qui serait-elle ?
- Si c'était un lieu, une époque, une matière, une musique ?

🖼️ PHASE 3 — DIRECTION ARTISTIQUE & VISUELLE

"À partir de tout ce que tu m'as partagé, voyons comment ça pourrait se traduire visuellement."

Tu demandes :
- Le projet a-t-il déjà une identité visuelle ?
- Logo, charte, couleurs, typographies existants ?
- Quelles marques, artistes, univers inspirent ? Pourquoi ?
- Quels styles ou codes doivent être évités ?

👉 Tu invites à partager :
- Images de référence
- Moodboards
- Liens (sites, Instagram, artistes, marques)
- Visuels existants

Tu analyses ces visuels et expliques ce qu'ils racontent.

🎯 PHASE 4 — CIBLE & CONTEXTE

"Comprendre à qui le projet parle permet d'affiner énormément les choix créatifs."

Tu explores :
- À qui s'adresse réellement le projet ?
- Contexte culturel, social, géographique ?
- Où sera-t-il vu ? (digital, print, espace, produit, événement)
- Niveau d'exigence attendu du public ?
- Réaction idéale à provoquer ?

💰 PHASE 5 — BUDGET & DÉLAIS

"Pour que le matching soit juste et respectueux du travail créatif, on va aussi parler budget — l'idée n'est pas de te limiter, mais d'être alignés et réalistes."

Tu explores :
- Budget global envisagé pour la partie créative
- Priorités budgétaires
- Flexibilité du budget
- Délais souhaités

Tu aides à comprendre les ordres de grandeur et ajuster si nécessaire.

🤝 PHASE 6 — PROFIL DU CRÉATIF IDÉAL

Synthèse globale, puis tu définis :
- Type de créatif (DA, graphiste, photographe, designer...)
- Approche (conceptuelle, technique, intuitive, expérimentale)
- Niveau d'expérience
- Sensibilité artistique
- Capacité à travailler avec ce budget et ces contraintes

🎯 PHASE 7 — LANCEMENT DU MATCHING

Quand tu as assez d'informations (après Phase 5 minimum), tu proposes :
"Je pense qu'on a tout ce qu'il faut pour te matcher avec les meilleurs créatifs ! Je lance le matching ?"

Une fois confirmé, tu génères un résumé final clair et structuré qui servira au matching.

📏 RÈGLES D'OR

- JAMAIS plus d'une question par message
- 2-4 phrases maximum, comme une vraie conversation
- Tutoiement pour créer de la proximité
- Validation régulière de ta compréhension
- Pas de suppositions gratuites
- Chaque choix créatif doit avoir un sens
- Réponds TOUJOURS en français`;


/**
 * Generate AI response using Google Gemini API
 */
export async function generateGeminiResponse(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  creatorContext?: CreatorContext
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('Gemini API key not configured. Using fallback response.');
    return {
      text: '',
      error: 'API key not configured',
    };
  }

  try {
    // Build context from creator info
    let contextInfo = '';
    if (creatorContext) {
      const parts: string[] = [];
      if (creatorContext.companyName) {
        parts.push(`Entreprise: ${creatorContext.companyName}`);
      }
      if (creatorContext.industry) {
        parts.push(`Secteur: ${creatorContext.industry}`);
      }
      if (creatorContext.typicalBudget) {
        parts.push(`Budget habituel: ${creatorContext.typicalBudget}`);
      }
      if (creatorContext.preferredCreatives?.length) {
        parts.push(`Créatifs préférés: ${creatorContext.preferredCreatives.join(', ')}`);
      }
      if (parts.length > 0) {
        contextInfo = `\n\nContexte du créateur:\n${parts.join('\n')}`;
      }
    }

    // Build conversation history for Gemini
    const geminiHistory: GeminiMessage[] = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Use Gemini API via REST (simpler than SDK, no additional dependencies)
    const requestBody = {
      contents: [
        // System instruction as first user message (Gemini doesn't have system role)
        {
          role: 'user',
          parts: [{ text: `Instructions système: ${SYSTEM_PROMPT}${contextInfo}\n\nRéponds "Compris" si tu as bien compris.` }],
        },
        {
          role: 'model',
          parts: [{ text: 'Compris! Je suis prêt à aider ce créateur avec son projet.' }],
        },
        // Add conversation history
        ...geminiHistory,
        // Add current user message
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      return {
        text: '',
        error: `API error: ${response.status}`,
      };
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini API: No text in response', JSON.stringify(data, null, 2));
      return {
        text: '',
        error: 'No text in response',
      };
    }

    return { text };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a concise project title from user message (like ChatGPT/Claude)
 */
export async function generateProjectTitle(
  userMessage: string
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { text: '', error: 'API key not configured' };
  }

  const prompt = `Tu dois générer un titre court et descriptif pour un projet créatif basé sur ce message utilisateur:

"${userMessage}"

Règles:
- Maximum 5-7 mots
- Décris le type de projet et l'objectif principal
- Sois concis et clair
- Style professionnel mais accessible
- Exemples de bons titres: "Logo pour startup tech", "Site web e-commerce mode", "Refonte identité visuelle café", "Application mobile fitness"

Réponds UNIQUEMENT avec le titre, sans guillemets, sans point final, sans texte supplémentaire.`;

  try {
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      return { text: '', error: `API error: ${response.status}` };
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Clean up the title
    if (text) {
      text = text.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
    }

    return { text: text || '' };
  } catch (error) {
    console.error('Gemini title generation error:', error);
    return { text: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Generate a project summary using Gemini
 */
export async function generateProjectSummary(
  conversationHistory: ConversationMessage[]
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { text: '', error: 'API key not configured' };
  }

  const conversationText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? 'Créateur' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  const prompt = `Voici une conversation entre un créateur et un assistant IA concernant un projet créatif.

${conversationText}

À partir de cette conversation, génère un résumé structuré du projet en JSON avec ce format:
{
  "titre": "Titre du projet",
  "description": "Description courte du projet (2-3 phrases)",
  "type": "Type de projet (ex: Logo, Site web, Vidéo...)",
  "publicCible": "Le public visé",
  "styleVisuel": "Le style souhaité",
  "budget": "Le budget mentionné ou estimé",
  "delai": "Les délais mentionnés",
  "pointsCles": ["Point clé 1", "Point clé 2", "Point clé 3"]
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

  try {
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      return { text: '', error: `API error: ${response.status}` };
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return { text: text || '' };
  } catch (error) {
    console.error('Gemini summary error:', error);
    return { text: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Analyze images with Gemini Vision API
 * TODO: Implement when Gemini Vision integration is ready
 *
 * This function will:
 * - Analyze visual style (modern, vintage, minimal, maximal, etc.)
 * - Extract color palette and dominant colors
 * - Detect mood and atmosphere
 * - Identify visual references and inspirations
 * - Assess complexity and detail level
 * - Provide creative direction insights
 *
 * @param attachments - Array of uploaded image attachments from Cloudinary
 * @returns Visual analysis results for matching
 */
export async function analyzeImagesWithVision(
  attachments: Array<{
    url: string;
    publicId: string;
    format: string;
    resourceType: 'image' | 'raw';
    width?: number;
    height?: number;
  }>
): Promise<{
  dominantColors: string[];
  detectedStyles: string[];
  mood: string | null;
  complexity: 'simple' | 'moderate' | 'complex' | null;
  visualReferences: string[];
  creativeDirection: string;
}> {
  // TODO: Implement Gemini Vision API call
  // For now, return placeholder data
  console.log('⚠️ Vision analysis not yet implemented. Using placeholder data.');
  console.log(`📸 Would analyze ${attachments.length} image(s)`);

  return {
    dominantColors: [],
    detectedStyles: [],
    mood: null,
    complexity: null,
    visualReferences: [],
    creativeDirection: 'Visual analysis will be available when Gemini Vision is integrated',
  };

  /* FUTURE IMPLEMENTATION:

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Filter only images
  const images = attachments.filter(a => a.resourceType === 'image');
  if (images.length === 0) {
    return { dominantColors: [], detectedStyles: [], mood: null, complexity: null, visualReferences: [], creativeDirection: '' };
  }

  // Prepare images for Vision API
  const imageParts = await Promise.all(
    images.map(async (img) => {
      // Fetch image from Cloudinary
      const response = await fetch(img.url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return {
        inlineData: {
          mimeType: `image/${img.format}`,
          data: base64
        }
      };
    })
  );

  const prompt = `Analyse ces images de référence pour un projet créatif. Fournis une analyse détaillée en JSON avec:

  {
    "dominantColors": ["couleur1", "couleur2", ...],
    "detectedStyles": ["style1", "style2", ...],
    "mood": "description de l'ambiance",
    "complexity": "simple" | "moderate" | "complex",
    "visualReferences": ["référence1", "référence2", ...],
    "creativeDirection": "description de la direction artistique suggérée"
  }

  Sois précis et professionnel. Focus sur des insights actionnables pour le matching avec des créatifs.`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          ...imageParts
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Parse JSON response
  const analysisMatch = text.match(/\{[\s\S]*\}/);
  if (analysisMatch) {
    return JSON.parse(analysisMatch[0]);
  }

  throw new Error('Failed to parse Vision API response');
  */
}
