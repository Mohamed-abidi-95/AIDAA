// ============================================================================
// CHATBOT CONTROLLER — chatbot.controller.js
// ============================================================================
// Module IA (MVP) — Chatbot FAQ + Recommandation contenu + Garde-fous urgence
// Respecte : consentement parental obligatoire, anonymisation, audit RGPD
// ============================================================================

const chatbotModel  = require('../models/chatbot.model');
const { query }     = require('../config/db');
const { isEmergency, EMERGENCY_RESPONSE } = require('../config/emergencyKeywords');
const { askGemini, isGeminiEnabled }      = require('../config/gemini');

// ── Helpers de normalisation ──────────────────────────────────────────────

/**
 * Normalise un texte : minuscules, sans diacritiques, tokenize.
 * @param {string} text
 * @returns {string[]} tokens
 */
const tokenize = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime diacritiques FR
    .replace(/[^\w\s\u0600-\u06ff]/g, ' ') // garde latin + arabe
    .split(/\s+/)
    .filter((t) => t.length > 2); // ignore mots < 3 chars
};

// Mots-clés indiquant une intention de recommandation de contenu
const RECOMMENDATION_KEYWORDS = [
  'activite', 'activites', 'exercice', 'exercices',
  'video', 'videos', 'jeu', 'jeux',
  'contenu', 'contenus', 'ressource', 'ressources',
  'apprendre', 'apprentissage', 'aide',
  'recommendation', 'recommande', 'propose',
  'نشاط', 'تمرين', 'فيديو', 'لعبة', 'محتوى',
];

// Salutations
const GREETING_KEYWORDS = [
  'bonjour', 'salut', 'bonsoir', 'allo', 'hello', 'hi',
  'مرحبا', 'السلام', 'اهلا', 'صباح الخير', 'مساء الخير',
];

const containsAny = (tokens, keywords) =>
  tokens.some((t) => keywords.includes(t));

// ============================================================================
// POST /api/chatbot/consent
// Enregistre le consentement parental obligatoire (RGPD / loi tunisienne)
// ============================================================================
const giveConsent = async (req, res) => {
  try {
    const parentId  = req.user.id;
    const ip        = req.ip || req.headers['x-forwarded-for'] || null;
    const userAgent = req.headers['user-agent'] || null;

    // Vérifier si déjà consenti (idempotent)
    const already = await chatbotModel.hasConsent(parentId);
    if (already) {
      return res.status(200).json({
        success: true,
        message: 'Consentement déjà enregistré.',
        alreadyConsented: true,
      });
    }

    await chatbotModel.saveConsent(parentId, ip, userAgent);

    // Audit dans activity_logs
    await query(
      `INSERT INTO activity_logs (child_id, content_id, action, created_at)
       VALUES (NULL, NULL, 'chatbot_consent', NOW())`,
      []
    ).catch(() => {}); // non bloquant

    return res.status(201).json({
      success: true,
      message: 'Consentement enregistré. Vous pouvez utiliser le chatbot.',
      alreadyConsented: false,
    });
  } catch (error) {
    console.error('[chatbot.controller] giveConsent:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du consentement.' });
  }
};

// ============================================================================
// GET /api/chatbot/consent/status
// Vérifie si le parent a donné son consentement
// ============================================================================
const getConsentStatus = async (req, res) => {
  try {
    const consented = await chatbotModel.hasConsent(req.user.id);
    return res.status(200).json({ success: true, consented });
  } catch (error) {
    console.error('[chatbot.controller] getConsentStatus:', error);
    return res.status(500).json({ success: false, message: 'Erreur.' });
  }
};

// ============================================================================
// POST /api/chatbot/session
// Démarre une session chatbot (vérifie le consentement + appartenance enfant)
// Body: { child_id? }
// ============================================================================
const startSession = async (req, res) => {
  try {
    const parentId = req.user.id;

    // ── Vérification consentement obligatoire ─────────────────────────────
    const consented = await chatbotModel.hasConsent(parentId);
    if (!consented) {
      return res.status(403).json({
        success: false,
        message: 'Consentement parental requis avant d\'utiliser le chatbot.',
        requiresConsent: true,
      });
    }

    // ── Validation optionnelle de l'enfant ────────────────────────────────
    let childId = null;
    if (req.body.child_id) {
      const childRows = await query(
        `SELECT id, participant_category, age
         FROM children
         WHERE id = ? AND parent_id = ?`,
        [req.body.child_id, parentId]
      );
      if (childRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Enfant introuvable ou non autorisé.' });
      }
      childId = childRows[0].id;
    }

    const sessionId = await chatbotModel.createSession(parentId, childId);

    return res.status(201).json({
      success: true,
      message: 'Session démarrée.',
      data: { sessionId },
    });
  } catch (error) {
    console.error('[chatbot.controller] startSession:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du démarrage de la session.' });
  }
};

// ============================================================================
// POST /api/chatbot/message
// ============================================================================
// Envoie un message et obtient une réponse du chatbot.
// Pipeline : Emergency → Greeting → FAQ matching → Contenu recommandé → Fallback
// Body: { sessionId, message, lang? }
// ============================================================================
const sendMessage = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { sessionId, message, lang = 'fr' } = req.body;
    const language = ['fr', 'ar'].includes(lang) ? lang : 'fr';

    // ── Validations basiques ──────────────────────────────────────────────
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId requis.' });
    }
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message vide.' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message trop long (max 1000 caractères).' });
    }

    // ── Vérifier l'appartenance de la session ─────────────────────────────
    const session = await chatbotModel.getSession(sessionId, parentId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session introuvable ou expirée.' });
    }

    // ── Sauvegarder le message utilisateur ───────────────────────────────
    const tokens = tokenize(message);

    // ══════════════════════════════════════════════════════════════════════
    // PIPELINE DE TRAITEMENT
    // ══════════════════════════════════════════════════════════════════════

    // ── ÉTAPE 1 : Garde-fou urgence ───────────────────────────────────────
    if (isEmergency(message)) {
      const emergencyResponse = EMERGENCY_RESPONSE[language] || EMERGENCY_RESPONSE.fr;

      await Promise.all([
        chatbotModel.saveMessage(sessionId, 'user',  message,         'emergency'),
        chatbotModel.saveMessage(sessionId, 'bot',   emergencyResponse, 'emergency'),
      ]);

      // Log audit urgence
      await query(
        `INSERT INTO activity_logs (child_id, content_id, action, created_at)
         VALUES (NULL, NULL, 'chatbot_emergency_triggered', NOW())`,
        []
      ).catch(() => {});

      return res.status(200).json({
        success: true,
        intent: 'emergency',
        response: emergencyResponse,
        explainability: {
          reason: 'Mots-clés d\'urgence détectés. Refus automatique — redirection vers secours.',
          guardrail: true,
        },
      });
    }

    // ── ÉTAPE 2 : Salutation ──────────────────────────────────────────────
    if (containsAny(tokens, GREETING_KEYWORDS)) {
      const greetingResponse = language === 'ar'
        ? `مرحباً بك! 👋 أنا مساعد AIDAA الذكي.
يمكنني مساعدتك في:
• الإجابة على أسئلتك حول التوحد والتواصل
• اقتراح أنشطة ومحتوى مناسب لطفلك
• تقديم معلومات حول الموارد المتاحة

ما الذي تودّ معرفته اليوم؟`
        : `Bonjour ! 👋 Je suis l'assistant IA d'AIDAA.
Je peux vous aider à :
• Répondre à vos questions sur l'autisme et la communication
• Suggérer des activités et contenus adaptés à votre enfant
• Vous orienter vers des ressources thérapeutiques

Que souhaitez-vous savoir aujourd'hui ?`;

      await Promise.all([
        chatbotModel.saveMessage(sessionId, 'user', message,         'greeting'),
        chatbotModel.saveMessage(sessionId, 'bot',  greetingResponse, 'greeting'),
      ]);

      return res.status(200).json({
        success: true,
        intent: 'greeting',
        response: greetingResponse,
        suggestions: language === 'ar'
          ? ['كيف أستخدم بطاقات AAC؟', 'اقترح لي نشاطاً', 'حقوق طفلي المدرسية']
          : ['Comment utiliser les pictogrammes AAC ?', 'Suggère-moi une activité', 'Droits scolaires de mon enfant'],
      });
    }

    // ── ÉTAPE 3 : Recommandation de contenu ──────────────────────────────
    if (containsAny(tokens, RECOMMENDATION_KEYWORDS)) {
      const participantCategory = session.participant_category || 'enfant';
      const contents = await chatbotModel.getContentForChild(
        session.child_id,
        participantCategory,
        3
      );

      let botResponse;
      let responseData = null;

      if (contents.length > 0) {
        const listFr = contents.map((c, i) =>
          `${i + 1}. ${c.emoji || '📌'} **${c.title}** (${c.type}) — ${c.description ? c.description.substring(0, 80) + '...' : 'Voir le contenu'}`
        ).join('\n');

        const listAr = contents.map((c, i) =>
          `${i + 1}. ${c.emoji || '📌'} **${c.title}** (${c.type})`
        ).join('\n');

        botResponse = language === 'ar'
          ? `إليك ${contents.length} محتوى مقترح لطفلك:\n\n${listAr}\n\nهذه المقترحات مبنية على ملف طفلك ومستواه الحالي.`
          : `Voici ${contents.length} contenu(s) recommandé(s) pour votre enfant :\n\n${listFr}\n\nCes suggestions sont basées sur le profil et le niveau de votre enfant.`;

        responseData = contents.map((c) => ({
          id: c.id,
          title: c.title,
          type: c.type,
          emoji: c.emoji,
          description: c.description,
          url: c.url,
        }));
      } else {
        botResponse = language === 'ar'
          ? 'لم أجد محتوى مناسباً في الوقت الحالي. يمكنك الاطلاع على قسم المحتوى مباشرة.'
          : 'Je n\'ai pas trouvé de contenu adapté pour le moment. Consultez directement la section Contenu.';
      }

      await Promise.all([
        chatbotModel.saveMessage(sessionId, 'user', message,     'recommendation'),
        chatbotModel.saveMessage(sessionId, 'bot',  botResponse, 'recommendation'),
      ]);

      return res.status(200).json({
        success: true,
        intent: 'recommendation',
        response: botResponse,
        data: responseData,
        explainability: {
          reason: `Recommandation basée sur : profil "${participantCategory}", contenus non encore consultés, niveau croissant.`,
          algorithm: 'rule-based-profile-filter',
        },
      });
    }

    // ── ÉTAPE 4 : Matching FAQ ────────────────────────────────────────────
    const faqMatch = await chatbotModel.searchFaq(tokens, language);

    if (faqMatch) {
      const answer = language === 'ar' && faqMatch.answer_ar
        ? faqMatch.answer_ar
        : faqMatch.answer_fr;

      const question = language === 'ar' && faqMatch.question_ar
        ? faqMatch.question_ar
        : faqMatch.question_fr;

      const botResponse = answer;

      await Promise.all([
        chatbotModel.saveMessage(sessionId, 'user', message,     'faq'),
        chatbotModel.saveMessage(sessionId, 'bot',  botResponse, 'faq'),
      ]);

      return res.status(200).json({
        success: true,
        intent: 'faq',
        response: botResponse,
        source: {
          category: faqMatch.category,
          question: question,
          matchScore: faqMatch.score,
        },
        explainability: {
          reason: `Correspondance FAQ trouvée dans la catégorie "${faqMatch.category}" avec un score de ${faqMatch.score} mot(s)-clé(s) commun(s).`,
          algorithm: 'keyword-matching',
          geminiUsed: false,
        },
      });
    }

    // ── ÉTAPE 5 : Gemini AI (si clé disponible) ──────────────────────────
    if (isGeminiEnabled()) {
      try {
        // Charger l'historique de conversation pour le contexte
        const conversationHistory = await chatbotModel.getSessionHistory(sessionId);
        const categories = await chatbotModel.getAllFaqCategories();

        const childInfo = session.child_id ? {
          name: session.child_name || 'Enfant',
          age: session.age || null,
          participant_category: session.participant_category || 'enfant',
        } : null;

        const geminiResponse = await askGemini(message, {
          lang: language,
          faqCategories: categories,
          child: childInfo,
          conversationHistory,
        });

        if (geminiResponse) {
          await Promise.all([
            chatbotModel.saveMessage(sessionId, 'user', message,        'faq'),
            chatbotModel.saveMessage(sessionId, 'bot',  geminiResponse, 'faq'),
          ]);

          return res.status(200).json({
            success: true,
            intent: 'faq',
            response: geminiResponse,
            explainability: {
              reason: 'Réponse générée par Gemini 1.5 Flash avec contexte AIDAA.',
              algorithm: 'gemini-1.5-flash',
              geminiUsed: true,
            },
          });
        }
      } catch (geminiErr) {
        console.warn('[chatbot.controller] Gemini error, fallback FAQ:', geminiErr.message);
      }
    }

    // ── ÉTAPE 6 : Fallback ────────────────────────────────────────────────
    const categories = await chatbotModel.getAllFaqCategories();
    const catList = categories.join(', ');

    const fallbackResponse = language === 'ar'
      ? `لم أفهم سؤالك تماماً. يمكنني مساعدتك في المواضيع التالية:\n${catList}\n\nجرّب إعادة صياغة سؤالك أو اكتب "اقترح نشاطاً".`
      : `Je n'ai pas bien compris votre question. Je peux vous aider sur :\n📚 ${catList}\n\nEssayez de reformuler ou écrivez "suggère une activité".`;

    await Promise.all([
      chatbotModel.saveMessage(sessionId, 'user', message,          'unknown'),
      chatbotModel.saveMessage(sessionId, 'bot',  fallbackResponse,  'unknown'),
    ]);

    return res.status(200).json({
      success: true,
      intent: 'unknown',
      response: fallbackResponse,
      suggestions: language === 'ar'
        ? ['كيف أتواصل مع طفلي؟', 'اقترح لي نشاطاً', 'ما هو نظام AAC؟']
        : ['Comment communiquer avec mon enfant ?', 'Suggère une activité', 'Qu\'est-ce que l\'AAC ?'],
    });

  } catch (error) {
    console.error('[chatbot.controller] sendMessage:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du traitement du message.' });
  }
};

// ============================================================================
// GET /api/chatbot/session/:sessionId/history
// Historique des messages — anonymisé (pas de child_id retourné)
// ============================================================================
const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await chatbotModel.getSession(sessionId, req.user.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session introuvable.' });
    }

    const messages = await chatbotModel.getSessionHistory(sessionId);

    return res.status(200).json({
      success: true,
      data: {
        sessionId: parseInt(sessionId),
        startedAt: session.started_at,
        endedAt: session.ended_at,
        // anonymisé : child_id non retourné
        messages,
      },
    });
  } catch (error) {
    console.error('[chatbot.controller] getHistory:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'historique.' });
  }
};

// ============================================================================
// DELETE /api/chatbot/session/:sessionId
// Clôture une session
// ============================================================================
const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await chatbotModel.getSession(sessionId, req.user.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session introuvable.' });
    }

    await chatbotModel.closeSession(sessionId);

    return res.status(200).json({
      success: true,
      message: 'Session clôturée.',
    });
  } catch (error) {
    console.error('[chatbot.controller] endSession:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la clôture.' });
  }
};

// ============================================================================
// GET /api/chatbot/faq/categories
// Liste les catégories FAQ disponibles
// ============================================================================
const getFaqCategories = async (req, res) => {
  try {
    const categories = await chatbotModel.getAllFaqCategories();
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('[chatbot.controller] getFaqCategories:', error);
    return res.status(500).json({ success: false, message: 'Erreur.' });
  }
};

// ============================================================================
// GET /api/chatbot/recommend/:childId
// Recommandation directe de contenu pour un enfant (sans session)
// ============================================================================
const getRecommendations = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { childId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    // Vérifier appartenance
    const childRows = await query(
      `SELECT id, participant_category, age, name
       FROM children WHERE id = ? AND parent_id = ?`,
      [childId, parentId]
    );
    if (childRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enfant introuvable.' });
    }

    const child = childRows[0];
    const contents = await chatbotModel.getContentForChild(
      child.id,
      child.participant_category || 'enfant',
      limit
    );

    return res.status(200).json({
      success: true,
      data: {
        child: {
          id: child.id,
          name: child.name,
          category: child.participant_category,
          age: child.age,
        },
        recommendations: contents,
        algorithm: {
          type: 'rule-based-profile-filter',
          description: 'Contenus filtrés par catégorie de participant, non encore consultés, triés par niveau croissant.',
        },
      },
    });
  } catch (error) {
    console.error('[chatbot.controller] getRecommendations:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la recommandation.' });
  }
};

module.exports = {
  giveConsent,
  getConsentStatus,
  startSession,
  sendMessage,
  getHistory,
  endSession,
  getFaqCategories,
  getRecommendations,
};

