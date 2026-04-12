// ============================================================================
// EMERGENCY KEYWORDS — emergencyKeywords.js
// ============================================================================
// Mots-clés déclenchant le garde-fou d'urgence dans le chatbot.
// Couvre : Français · Arabe MSA · Dialecte tunisien
// ATTENTION : ne jamais répondre médicalement à ces situations.
// ============================================================================

const EMERGENCY_KEYWORDS = [
  // ── Français ──────────────────────────────────────────────────────────────
  'urgence', 'urgent', 'danger', 'dangereux',
  'blessé', 'blessure', 'accident',
  'suicide', 'suicidaire', 'se suicider',
  'automutilation', 'se faire du mal', 'se blesser',
  'crise', 'crise grave', 'convulsion', 'convulsions',
  'inconscient', 'ne respire plus', 'ne répond plus',
  'violence', 'maltraitance', 'abus',
  'empoisonnement', 'intoxication', 'avalé', 'ingéré',
  'noyade', 'étouffement',
  'appel au secours', 'au secours', 'aidez-moi',
  'en danger', 'vie en danger',
  'hospitalisation urgente',

  // ── Arabe MSA ─────────────────────────────────────────────────────────────
  'طارئ', 'طوارئ', 'خطر', 'خطير',
  'مساعدة', 'النجدة', 'أغثني',
  'انتحار', 'إيذاء النفس',
  'إغماء', 'فقدان الوعي',
  'تشنج', 'تشنجات',
  'عنف', 'إساءة',
  'تسمم', 'ابتلع',
  'اختناق', 'غرق',

  // ── Dialecte tunisien ─────────────────────────────────────────────────────
  'el ghawth', 'njdouni', 'nsaaed', 'tol3et fi',
  'mreydh', 'bech ymout', 'mouch fahm',
  'taabt', 'ضرورة', 'انهيار',
];

// Numéros d'urgence Tunisie
const EMERGENCY_CONTACTS = {
  fr: [
    { label: 'SAMU Tunisie',             number: '190' },
    { label: 'Police Secours',           number: '197' },
    { label: 'Protection civile',        number: '198' },
    { label: 'Aide aux enfants (INPE)',  number: '71 391 666' },
    { label: 'Ligne écoute psychologique', number: '80 100 400' },
  ],
  ar: [
    { label: 'الإسعاف التونسي',          number: '190' },
    { label: 'الشرطة',                  number: '197' },
    { label: 'الحماية المدنية',         number: '198' },
    { label: 'حماية الطفولة (INPE)',    number: '71 391 666' },
    { label: 'خط الدعم النفسي',         number: '80 100 400' },
  ],
};

const EMERGENCY_RESPONSE = {
  fr: `⚠️ **Situation d'urgence détectée**

Je ne suis pas habilité à répondre à des situations médicales ou de danger immédiat.

**Contactez immédiatement :**
${EMERGENCY_CONTACTS.fr.map(c => `• ${c.label} : **${c.number}**`).join('\n')}

Si votre enfant est en danger immédiat, appelez le **190** (SAMU) maintenant.
Pour un soutien psychologique, contactez le **80 100 400**.`,

  ar: `⚠️ **تم رصد حالة طارئة**

لست مؤهلاً للرد على الحالات الطبية الخطيرة أو المواقف الطارئة.

**اتصل فوراً بـ :**
${EMERGENCY_CONTACTS.ar.map(c => `• ${c.label} : **${c.number}**`).join('\n')}

إذا كان طفلك في خطر فوري، اتصل بـ **190** (الإسعاف) الآن.`,
};

/**
 * Vérifie si un texte contient un mot-clé d'urgence.
 * @param {string} text
 * @returns {boolean}
 */
const isEmergency = (text) => {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // supprime les diacritiques français

  return EMERGENCY_KEYWORDS.some((kw) => {
    const normalizedKw = kw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(normalizedKw);
  });
};

module.exports = {
  EMERGENCY_KEYWORDS,
  EMERGENCY_CONTACTS,
  EMERGENCY_RESPONSE,
  isEmergency,
};

