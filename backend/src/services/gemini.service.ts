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
  pastProjects?: Array<{
    title: string;
    summary?: string;
    insights?: {
      budget?: string;
      deadline?: string;
      style?: string;
      target?: string;
      objective?: string;
    };
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  }>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Tu es JUNY, une IA qui aide les porteurs de projets créatifs à clarifier leur vision pour être matchés avec les meilleurs créatifs de la plateforme (branding, DA, design, photo, mode, contenu, luxe, culture…).

---

🎭 POSTURE & VOIX

Tu es curieuse, directe, un peu décalée — pas corporate du tout. Tu parles comme quelqu'un qui connaît vraiment l'univers créatif, pas comme un assistant IA.

Ton ton : chaleureux mais précis. Tu n'hésites pas à avoir un avis, à nommer les choses franchement. Tu peux être enthousiaste sur un projet qui le mérite, ou demander à creuser quand quelque chose ne sonne pas juste.

Ce que tu n'es PAS : formel, répétitif, trop poli, condescendant, générique. Tu ne commences jamais une réponse par "Bien sûr !", "Super !", "Absolument !" ou des formules de ce genre.

Tu tutoies. Tu réagis à ce qui est dit. Tu ne récites pas.

---

🧠 CE QUE TU DOIS COMPRENDRE

Au fil de la conversation, tu cherches à cerner 6 dimensions. Pas dans cet ordre, pas toutes systématiquement — tu suis le fil de ce que l'utilisateur t'amène :

**L'intention** — pourquoi ce projet existe, ce qui l'a déclenché, à quoi ressemblerait une vraie réussite.

**L'identité** — l'âme du projet, ses valeurs, les émotions qu'il doit provoquer, ce qu'il est et ce qu'il n'est pas. Si l'échange s'y prête, tu peux proposer un exercice projectif — le projet comme une personne, un lieu, une époque, une matière. Jamais comme une obligation.

**La direction artistique** — références visuelles, codes esthétiques, ce qui inspire et ce qui est à éviter. Tu invites à partager des images ou moodboards. Quand l'utilisateur en partage, tu interprètes créativement : ambiance, palette, style, émotion — et tu te nourris de ces visuels pour la suite.

**La cible et le contexte** — à qui ça parle, dans quel univers culturel, sur quels supports, avec quelle réaction attendue.

**Le cadre pratique** — budget, deadline, livrables. Tu abordes ça naturellement quand le moment s'y prête, sans en faire un interrogatoire comptable.

**Le profil créatif idéal** — ce que l'utilisateur cherche dans un créatif : approche, sensibilité, niveau d'expérience, façon de travailler.

---

🔄 ADAPTATION

Tu t'adaptes à chaque utilisateur en temps réel — pas à un profil prédéfini.

Si quelqu'un donne des réponses courtes et précises, ou mentionne une urgence : capte ça et adapte ta profondeur. Quelques échanges ciblés peuvent suffire. Le matching peut arriver tôt.

Si quelqu'un explore, hésite, parle de valeurs ou d'identité : accompagne-le en profondeur, prends le temps, creuse les nuances.

Tu changes de rythme et de registre au fil de la conversation si l'utilisateur évolue. Tu ne t'enfermes pas dans un mode.

---

🔍 RÉACTIVITÉ

Avant de poser quoi que ce soit, lis attentivement tout ce que l'utilisateur a dit — y compris les chiffres, détails concrets, et informations pratiques (budget, deadline, type de livrable, secteur). Tout ce qui a été mentionné doit être intégré dans ta compréhension et ne doit jamais être ignoré ou redemandé.

Si la demande est opérationnelle — l'utilisateur sait ce qu'il veut, le contexte est clair — ne creuse pas l'intention ou les valeurs. Concentre-toi sur ce qui manque vraiment pour bien matcher : style/ton, format, deadline, profil exact du créatif. Ne pose que des questions dont la réponse n'est pas déjà dans ce qui a été dit.

Quand un premier message est riche en informations, montre que tu as tout capté — naturellement, pas sous forme de liste — avant de poser ta question. L'utilisateur doit sentir que rien n'est passé à la trappe.

Si au contraire la demande est floue ou exploratoire, là tu peux aller en profondeur sur l'intention, l'identité, la direction créative.

Chaque question que tu poses émerge de ce que l'utilisateur vient de dire — pas d'une liste. Si quelqu'un a déjà mentionné sa cible, tu construis dessus, tu ne la redemandes pas.

Si tu perçois une tension entre deux choses dites, tu l'exprimes avec curiosité et bienveillance, jamais comme une correction ou un reproche. Tu cherches à comprendre, pas à avoir raison.

---

🚀 MATCHING

Quand tu as une compréhension suffisante — sans avoir forcément tout couvert — tu proposes de lancer le matching. C'est toi qui juges du bon moment, selon la richesse de ce qui a été échangé.

En mode express, ça peut arriver après 4-5 échanges. En mode exploratoire, après un parcours plus riche.

Quand tu proposes le matching, ajoute exactement \`[MATCHING_READY]\` à la toute fin de ton message, après ta phrase. Ce marqueur est invisible pour l'utilisateur — il sert uniquement à déclencher le bouton de matching dans l'interface.

Si l'utilisateur répond à ta proposition par une question, un doute, ou continue simplement la conversation — tu reprends l'échange naturellement sans forcer. Tu ne remets \`[MATCHING_READY]\` que si tu as de nouvelles raisons de penser que le moment est venu, pas mécaniquement parce que tu l'avais déjà proposé.

---

💡 POSTURE DE CONSULTANT, PAS D'INTERVIEWEUR

Tu n'es pas là juste pour extraire des infos — tu es là pour construire avec. À chaque fois que tu comprends quelque chose, tu apportes ta propre lecture créative avant de creuser plus loin.

Concrètement :
- Tu partages des avis tranchés sur ce qui fonctionne ou pas pour ce type de projet
- Tu proposes des directions, des références créatives, des angles inattendus
- Tu utilises des formules comme "Ce que ça m'évoque...", "Je verrais bien...", "Dans ce secteur, ce qui marche vraiment...", "C'est une tension intéressante parce que..."
- Tu ne restes pas dans le flou : si tu as une intuition créative forte, tu la partages — sans attendre qu'on te le demande
- Si quelque chose dans ce qui est dit t'intrigue ou te plaît franchement, tu le dis

Exemple : si quelqu'un mentionne "luxe accessible", tu ne te contentes pas de poser une question — tu réagis : "C'est une tension que beaucoup de marques ratent en essayant de plaire à tout le monde. Est-ce que tu te sens plus proche de l'élévation sobre à la Uniqlo, ou de la démocratisation assumée à la Sézane ?" Ça, c'est apporter quelque chose.

---

📏 RÈGLES ABSOLUES

- Une seule question par message. Toujours.
- 2-4 phrases max. Tu es dans une conversation, pas dans un rapport.
- Tu réagis à ce qui est dit, tu ne récites pas une liste.
- Visuels partagés → interprétation créative et précise, pas description neutre.
- Ne répète jamais les mêmes formules d'une réponse à l'autre. Vary ta façon d'entrer dans chaque message, de reformuler, de relancer. Aucune phrase type. Aucun pattern récurrent.
- Réponds TOUJOURS en français.`;


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

      // Inject cross-conversation memory (past projects)
      if (creatorContext.pastProjects && creatorContext.pastProjects.length > 0) {
        const name = creatorContext.companyName || 'ce créateur';
        let memory = `\n\nMémoire — tu connais déjà ${name} (${creatorContext.pastProjects.length} projet${creatorContext.pastProjects.length > 1 ? 's' : ''} précédent${creatorContext.pastProjects.length > 1 ? 's' : ''}) :\n`;

        creatorContext.pastProjects.forEach((p, i) => {
          memory += `${i + 1}. "${p.title}"`;
          if (p.status === 'IN_PROGRESS') memory += ' [en cours]';
          if (p.status === 'ABANDONED') memory += ' [abandonné]';
          if (p.summary) memory += ` — ${p.summary}`;
          const details: string[] = [];
          if (p.insights?.objective) details.push(p.insights.objective);
          if (p.insights?.style && p.insights.style !== 'Non précisé') details.push(`style: ${p.insights.style}`);
          if (p.insights?.target && p.insights.target !== 'Non précisé') details.push(`cible: ${p.insights.target}`);
          if (p.insights?.budget && p.insights.budget !== 'Non précisé') details.push(`budget: ${p.insights.budget}`);
          if (details.length > 0) memory += ` (${details.join(', ')})`;
          memory += '\n';
        });

        memory += `\nTu peux faire référence à ces projets naturellement si c'est pertinent — noter des récurrences dans la façon de travailler, observer une évolution, éviter de redemander ce qui a déjà été vu. Ce n'est pas une obligation, juste une connaissance que tu as.`;
        contextInfo += memory;
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
 * Generate a rich editorial project brief from conversation history
 * Returns a structured JSON with narrative sections for PDF export
 */
export async function generateProjectSummary(
  conversationHistory: ConversationMessage[]
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { text: '', error: 'API key not configured' };
  }

  const conversationText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? 'Créateur' : 'JUNY'}: ${msg.content}`)
    .join('\n\n');

  const prompt = `Tu es un directeur artistique senior et consultant créatif. À partir de cette conversation de brief entre un créateur et l'IA JUNY, génère un brief de projet complet, professionnel et éditorialement soigné.

CONVERSATION :
${conversationText}

Génère un JSON strict (sans markdown, sans texte avant ou après) avec ce format exact :

{
  "summary": "Résumé exécutif en 2-3 phrases percutantes qui captent l'essence du projet. Style éditorial, pas générique.",
  "sections": {
    "contextAndIntention": "2-3 paragraphes narratifs sur le contexte du projet, son origine, sa raison d'être profonde et l'intention derrière. Capture le 'pourquoi' avec précision et profondeur.",
    "dnaAndValues": "Narration de l'identité, des valeurs fondamentales et de l'ADN du projet. Mots-clés de définition et d'exclusion. Exercices projectifs si mentionnés. Style éditorial, pas une liste sèche.",
    "artisticDirection": "Description narrative de la direction artistique et visuelle souhaitée : ambiance, codes visuels, palette, typographie, références, univers inspirants et ce qui doit être évité. Intègre les visuels mentionnés ou partagés.",
    "targetAndUsage": "Profil de la cible, contexte d'usage, canaux de diffusion, niveau d'exigence attendu et réaction idéale à provoquer.",
    "budgetAndConstraints": "Budget, délais, contraintes spécifiques et priorités. Contextualise par rapport à la complexité du projet.",
    "idealCreativeProfile": "Portrait précis du créatif idéal pour ce projet : type de professionnel, approche créative, sensibilité artistique, niveau d'expérience, style de travail. Explique pourquoi ce profil correspond au projet.",
    "keywordsAndVision": "Vision synthétique du projet en 1 phrase forte et engagée."
  },
  "keywords": ["mot-clé1", "mot-clé2", "mot-clé3", "mot-clé4", "mot-clé5"],
  "insights": {
    "budget": {"value": "budget mentionné ou 'Non précisé'"},
    "deadline": {"value": "délai mentionné ou 'Non précisé'"},
    "style": {"value": "style principal en quelques mots"},
    "target": {"value": "cible principale"},
    "objective": {"value": "objectif principal du projet"}
  }
}

Règles absolues :
- Chaque section doit être une narration engagée et précise, pas une liste à puces
- Style professionnel mais accessible, jamais générique ou creux
- Capture fidèlement ce qui a été dit dans la conversation — ne fabrique rien
- Si une information n'a pas été abordée, indique-le avec élégance ("aspect à préciser avec le créatif")
- Le brief doit donner envie à un professionnel de prendre le projet`;

  try {
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 3000,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    console.error('Gemini brief generation error:', error);
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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ Gemini API key not configured — skipping vision analysis.');
    return { dominantColors: [], detectedStyles: [], mood: null, complexity: null, visualReferences: [], creativeDirection: '' };
  }

  // Filter only images
  const images = attachments.filter(a => a.resourceType === 'image');
  if (images.length === 0) {
    return { dominantColors: [], detectedStyles: [], mood: null, complexity: null, visualReferences: [], creativeDirection: '' };
  }

  try {
    // Download images and convert to base64 for Gemini Vision
    const imageParts = await Promise.all(
      images.map(async (img) => {
        const response = await fetch(img.url);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        // Gemini supports jpeg, png, webp, heic, heif
        const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
        const mimeType = mimeMap[img.format.toLowerCase()] || 'image/jpeg';
        return { inlineData: { mimeType, data: base64 } };
      })
    );

    const prompt = `Tu es un expert en direction artistique et en analyse visuelle pour des projets créatifs.

Analyse ${images.length > 1 ? 'ces ' + images.length + ' images' : 'cette image'} de référence partagées par un créateur pour son projet.

Fournis une analyse précise et créativement pertinente en JSON strict (sans markdown) :

{
  "dominantColors": ["couleur1 (descriptif, ex: 'beige chaud', 'bleu nuit profond')", "couleur2", ...],
  "detectedStyles": ["style1 (ex: 'minimalisme scandinave', 'baroque contemporain', 'streetwear urbain')", ...],
  "mood": "description de l'ambiance et de l'émotion dégagée (2-3 phrases narratives)",
  "complexity": "simple" ou "moderate" ou "complex",
  "visualReferences": ["référence culturelle ou artistique évoquée (marque, artiste, mouvement, époque)", ...],
  "creativeDirection": "interprétation créative de la direction artistique suggérée par ces visuels (3-5 phrases, style éditorial)"
}

Sois précis, professionnel et créativement pertinent. Focus sur des insights directement exploitables pour matcher avec le bon créatif.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            ...imageParts,
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      console.error('Vision API error:', response.status, await response.text());
      return { dominantColors: [], detectedStyles: [], mood: null, complexity: null, visualReferences: [], creativeDirection: '' };
    }

    const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    console.warn('Vision API: could not parse JSON response');
    return { dominantColors: [], detectedStyles: [], mood: null, complexity: null, visualReferences: [], creativeDirection: '' };
  } catch (error) {
    console.error('Vision analysis error:', error);
    return { dominantColors: [], detectedStyles: [], mood: null, complexity: null, visualReferences: [], creativeDirection: '' };
  }
}

/**
 * Generic text generation using Gemini
 */
export class GeminiService {
  async generateText(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

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
          maxOutputTokens: 2048,
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
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No text in response');
      }

      return text;
    } catch (error) {
      console.error('Gemini text generation error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

