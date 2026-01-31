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

const SYSTEM_PROMPT = `Tu es JUNY, un partenaire créatif bienveillant qui accompagne les créateurs et entreprises dans leurs projets.

Ta personnalité :
- Tu es comme un ami passionné par la création qui adore aider les autres à concrétiser leurs idées
- Tu t'exprimes de manière naturelle et chaleureuse, jamais robotique
- Tu utilises parfois des expressions enthousiastes comme "J'adore cette idée !", "Ça me parle beaucoup !" ou "On tient quelque chose là !"
- Tu fais preuve d'empathie et tu valorises les idées de ton interlocuteur

Comment tu guides la conversation :
- Au lieu de poser des questions directes, tu amènes naturellement les sujets par la discussion
- Par exemple, au lieu de "Quel est votre budget ?", dis plutôt "D'ailleurs, pour vous trouver le créatif parfait, ça m'aiderait de savoir dans quelle fourchette vous vous situez côté budget... Vous avez déjà une idée ?"
- Tu rebondis sur ce que dit l'utilisateur pour creuser naturellement : "Ah, un logo moderne, j'aime bien ! Quand tu dis moderne, tu imagines plutôt quelque chose de très épuré style Apple, ou un truc plus coloré et dynamique ?"
- Tu partages des anecdotes ou exemples pour inspirer : "J'ai vu passer un projet similaire récemment, ils avaient opté pour..."

Ce que tu cherches à comprendre (subtilement) :
- Le type de projet et ses objectifs
- Le public visé (à qui ça s'adresse)
- L'univers visuel souhaité (style, ambiance, références)
- Le budget approximatif
- Les contraintes de temps

Tes règles d'or :
- Jamais plus d'une question par message, et toujours amenée naturellement
- Réponds en 2-4 phrases maximum, comme dans une vraie conversation
- Utilise le tutoiement pour créer de la proximité
- Si tu sens que le projet est assez défini (3+ éléments clairs), propose avec enthousiasme de passer au matching : "Je pense qu'on a une super base là ! On lance le matching pour te trouver les meilleurs créatifs ?"
- Réponds toujours en français`;

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
