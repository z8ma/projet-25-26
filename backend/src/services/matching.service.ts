import { geminiService } from './gemini.service.js';

export interface MatchingAnalysis {
  requiredSkills: string[];
  preferredProfessions: string[];
  projectComplexity: 'simple' | 'medium' | 'complex';
  styleKeywords: string[];
  estimatedDuration: string;
  specificRequirements: string[];
  budgetSuggestion?: string;
}

export class MatchingService {
  /**
   * Analyze conversation to extract matching criteria using AI
   */
  async analyzeConversationForMatching(
    conversationMessages: Array<{ role: string; content: string }>,
    creatorPreferences?: {
      industry?: string;
      preferredCreatives?: string[];
      typicalBudget?: string;
    }
  ): Promise<MatchingAnalysis> {
    try {
      const conversationText = conversationMessages
        .map((m) => `${m.role === 'user' ? 'Créateur' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

      const prompt = `Tu es un expert en matching de projets créatifs avec des professionnels. Analyse cette conversation de brainstorming entre un créateur et un assistant IA.

CONVERSATION:
${conversationText}

${creatorPreferences ? `\nPRÉFÉRENCES DU CRÉATEUR:
- Industrie: ${creatorPreferences.industry || 'Non spécifié'}
- Budget typique: ${creatorPreferences.typicalBudget || 'Non spécifié'}
- Types de créatifs préférés: ${creatorPreferences.preferredCreatives?.join(', ') || 'Aucun'}` : ''}

Analyse cette conversation et extrais les informations suivantes sous forme de JSON strict (pas de markdown, juste le JSON):

{
  "requiredSkills": ["liste des compétences techniques nécessaires (ex: Photoshop, Illustrator, After Effects, Figma, etc.)"],
  "preferredProfessions": ["liste des métiers créatifs nécessaires (ex: Graphiste, Designer UX/UI, Motion Designer, Illustrateur, Développeur Web, etc.)"],
  "projectComplexity": "simple|medium|complex (évalue la complexité du projet)",
  "styleKeywords": ["mots-clés décrivant le style recherché (ex: minimaliste, coloré, moderne, élégant, etc.)"],
  "estimatedDuration": "durée estimée du projet (ex: 1-2 semaines, 1 mois, 2-3 mois)",
  "specificRequirements": ["exigences spécifiques mentionnées (ex: responsive design, animation fluide, etc.)"],
  "budgetSuggestion": "suggestion de budget basée sur la complexité (optionnel)"
}

Sois précis et base-toi uniquement sur ce qui est mentionné dans la conversation. Si une information n'est pas claire, fais une estimation raisonnable basée sur le contexte.`;

      const analysis = await geminiService.generateText(prompt);

      // Parse the JSON response
      const cleanedResponse = analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedAnalysis: MatchingAnalysis = JSON.parse(cleanedResponse);

      return parsedAnalysis;
    } catch (error) {
      console.error('Error analyzing conversation for matching:', error);

      // Return default analysis in case of error
      return {
        requiredSkills: [],
        preferredProfessions: [],
        projectComplexity: 'medium',
        styleKeywords: [],
        estimatedDuration: 'Non déterminé',
        specificRequirements: [],
      };
    }
  }

  /**
   * Calculate enhanced match score using AI analysis
   */
  calculateEnhancedMatchScore(
    professional: any,
    analysis: MatchingAnalysis,
    creatorBudget?: string,
    creatorPreferences?: {
      industry?: string;
      preferredCreatives?: string[];
    }
  ): { score: number; reasons: string[] } {
    let score = 50; // Base score
    const reasons: string[] = [];

    // === SKILLS MATCH (up to +30 points) ===
    if (analysis.requiredSkills.length > 0 && professional.softwareSkills) {
      const professionalSkills = professional.softwareSkills.map((s: any) =>
        s.name.toLowerCase()
      );

      const matchedSkills = analysis.requiredSkills.filter((reqSkill) =>
        professionalSkills.some((profSkill: string) =>
          profSkill.includes(reqSkill.toLowerCase()) ||
          reqSkill.toLowerCase().includes(profSkill)
        )
      );

      if (matchedSkills.length > 0) {
        const skillScore = Math.min((matchedSkills.length / analysis.requiredSkills.length) * 30, 30);
        score += skillScore;
        reasons.push(`Maîtrise ${matchedSkills.length}/${analysis.requiredSkills.length} compétences requises`);
      }
    }

    // === PROFESSION MATCH (up to +25 points) ===
    if (analysis.preferredProfessions.length > 0 && professional.professions) {
      const professionalProfessions = professional.professions.map((p: any) =>
        p.profession.name.toLowerCase()
      );

      const matchedProfessions = analysis.preferredProfessions.filter((reqProf) =>
        professionalProfessions.some((profProf: string) =>
          profProf.includes(reqProf.toLowerCase()) ||
          reqProf.toLowerCase().includes(profProf)
        )
      );

      if (matchedProfessions.length > 0) {
        score += 25;
        reasons.push(`Métier correspondant: ${matchedProfessions.join(', ')}`);
      }
    }

    // === COMPLEXITY MATCH (up to +15 points) ===
    if (professional.experienceYears) {
      const complexityRequirement = {
        simple: 1,
        medium: 3,
        complex: 5,
      }[analysis.projectComplexity];

      if (professional.experienceYears >= complexityRequirement) {
        const complexityScore = analysis.projectComplexity === 'complex' ? 15 :
                               analysis.projectComplexity === 'medium' ? 10 : 5;
        score += complexityScore;
        reasons.push(`Expérience adaptée pour un projet ${analysis.projectComplexity}`);
      }
    }

    // === STYLE MATCH via Portfolio Tags (up to +15 points) ===
    if (analysis.styleKeywords.length > 0 && professional.portfolios) {
      let styleMatchCount = 0;

      for (const portfolio of professional.portfolios) {
        if (portfolio.tags) {
          const portfolioTags = portfolio.tags.map((t: any) => t.name.toLowerCase());
          const matchedStyles = analysis.styleKeywords.filter((style) =>
            portfolioTags.some((tag: string) =>
              tag.includes(style.toLowerCase()) ||
              style.toLowerCase().includes(tag)
            )
          );
          styleMatchCount += matchedStyles.length;
        }
      }

      if (styleMatchCount > 0) {
        score += Math.min(styleMatchCount * 5, 15);
        reasons.push(`Portfolio correspond au style recherché`);
      }
    }

    // === BUDGET COMPATIBILITY (up to +10 points) ===
    if (creatorBudget && professional.minimumBudget) {
      const budgetValue = this.getBudgetValue(creatorBudget);
      const profMinBudget = Number(professional.minimumBudget);

      if (profMinBudget > 0 && budgetValue >= profMinBudget) {
        score += 10;
        reasons.push('Budget compatible');
      } else if (profMinBudget > budgetValue) {
        score -= 20; // Penalty if budget doesn't match
        reasons.push('Budget insuffisant');
      }
    }

    // === PREFERRED CREATIVES BONUS (up to +10 points) ===
    if (creatorPreferences?.preferredCreatives && professional.professions) {
      const matchesPreference = creatorPreferences.preferredCreatives.some((pref) =>
        professional.professions.some((p: any) =>
          p.profession.name.toLowerCase().includes(pref.toLowerCase())
        )
      );

      if (matchesPreference) {
        score += 10;
        reasons.push('Type de créatif préféré par le client');
      }
    }

    // === AVAILABILITY BONUS (up to +10 points) ===
    if (professional.availability === 'Disponible') {
      score += 10;
      reasons.push('Disponible immédiatement');
    } else if (professional.availability === 'Partiellement disponible') {
      score += 5;
    }

    // === PORTFOLIO QUALITY (up to +10 points) ===
    if (professional.portfolios && professional.portfolios.length > 0) {
      const portfolioScore = Math.min(professional.portfolios.length * 2, 10);
      score += portfolioScore;
      reasons.push(`${professional.portfolios.length} projets en portfolio`);
    }

    // === PREMIUM BONUS (+5 points) ===
    if (professional.isPremium) {
      score += 5;
      reasons.push('Profil Premium vérifié');
    }

    return {
      score: Math.min(Math.max(score, 0), 100), // Clamp between 0-100
      reasons,
    };
  }

  /**
   * Helper: Convert budget string to numeric value
   */
  private getBudgetValue(budget: string): number {
    const budgetMap: Record<string, number> = {
      '<1k': 1000,
      '1-5k': 5000,
      '5-10k': 10000,
      '10-25k': 25000,
      '25-50k': 50000,
      '50k+': 100000,
    };
    return budgetMap[budget] || 0;
  }
}

export const matchingService = new MatchingService();
