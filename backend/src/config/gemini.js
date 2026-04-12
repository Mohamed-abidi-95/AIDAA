// ============================================================================
// GEMINI AI CLIENT — gemini.js
// ============================================================================
// Appelle l'API Gemini 1.5 Flash (gratuit) via fetch natif Node.js 18+.
// Fonctionne sans dépendance externe — utilise le fetch natif.
// Laisser GEMINI_API_KEY vide → retourne null (fallback FAQ keyword-matching).
// ============================================================================

const GEMINI_MODEL  = 'gemini-1.5-flash';
const GEMINI_URL    = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Timeout Gemini (ms)
const GEMINI_TIMEOUT = 15000;

/**
 * Vérifie si Gemini est configuré.
 * @returns {boolean}
 */
const isGeminiEnabled = () => Boolean(process.env.GEMINI_API_KEY?.trim());

/**
 * Construit le system prompt AIDAA pour Gemini.
 * @param {object} opts
 * @param {string} opts.lang       - 'fr' | 'ar'
 * @param {string[]} opts.faqCategories - catégories FAQ disponibles
 * @param {object|null} opts.child - { name, age, participant_category }
 * @returns {string}
 */
const buildSystemPrompt = ({ lang = 'fr', faqCategories = [], child = null }) => {
  const faqList = faqCategories.length > 0
    ? faqCategories.join(', ')
    : 'Communication & AAC, Gestion des comportements, Activités quotidiennes, Ressources thérapeutiques, Droits et scolarisation, Santé et bien-être';

  const childCtx = child
    ? `L'enfant concerné s'appelle ${child.name}, il a ${child.age} ans, catégorie : ${child.participant_category}.`
    : "Aucun enfant sélectionné pour cette session.";

  const langInstruction = lang === 'ar'
    ? "Réponds TOUJOURS en arabe (arabe standard moderne, clair et accessible)."
    : "Réponds TOUJOURS en français, de façon claire et bienveillante.";

  return `Tu es l'assistant parental IA d'AIDAA, une application d'accompagnement des parents d'enfants avec Troubles du Spectre Autistique (TSA) en Tunisie.

${langInstruction}

CONTEXTE ENFANT :
${childCtx}

TON RÔLE :
- Répondre aux questions des parents sur l'autisme, la communication AAC, les thérapies, la scolarisation, les comportements
- Proposer des recommandations d'activités et de contenus adaptés au profil de l'enfant
- Orienter vers les ressources tunisiennes disponibles (INPE, hôpital Razi, associations...)
- Soutenir émotionnellement le parent avec empathie et bienveillance

CATÉGORIES FAQ DISPONIBLES DANS AIDAA :
${faqList}

RÈGLES ABSOLUES :
1. Si la question concerne une urgence médicale, un danger physique, une automutilation ou un risque immédiat pour l'enfant → réponds UNIQUEMENT avec : "⚠️ Situation d'urgence. Appelez le 190 (SAMU) ou le 71 391 666 (INPE) immédiatement." — Ne fournis aucune autre information.
2. Ne fournis JAMAIS de diagnostic médical.
3. Ne recommande JAMAIS de médicaments ou de doses.
4. Restes dans le domaine de l'autisme et du soutien parental.
5. Garde tes réponses concises (maximum 300 mots) et structurées avec des points si nécessaire.
6. Si tu ne sais pas, dis-le honnêtement et suggère de consulter un professionnel.

Tu es prêt à aider le parent.`;
};

/**
 * Envoie un message à Gemini et retourne la réponse texte.
 * @param {string} userMessage
 * @param {object} opts - { lang, faqCategories, child, conversationHistory }
 * @returns {Promise<string|null>} texte de réponse ou null si désactivé/erreur
 */
const askGemini = async (userMessage, opts = {}) => {
  if (!isGeminiEnabled()) return null;

  const apiKey = process.env.GEMINI_API_KEY.trim();
  const systemPrompt = buildSystemPrompt(opts);
  const { conversationHistory = [] } = opts;

  // Construire l'historique de conversation (max 10 derniers messages)
  const history = conversationHistory.slice(-10).map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.message_text }],
  }));

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      ...history,
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[Gemini] HTTP ${response.status}:`, errBody.substring(0, 200));
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn('[Gemini] Réponse vide ou bloquée:', JSON.stringify(data?.promptFeedback || {}));
      return null;
    }

    return text.trim();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn('[Gemini] Timeout après', GEMINI_TIMEOUT, 'ms');
    } else {
      console.error('[Gemini] Erreur fetch:', err.message);
    }
    return null;
  }
};

module.exports = { isGeminiEnabled, askGemini, buildSystemPrompt };

