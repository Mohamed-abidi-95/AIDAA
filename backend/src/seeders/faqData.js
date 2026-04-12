// ============================================================================
// FAQ SEEDER — faqData.js
// ============================================================================
// Insère les entrées FAQ validées dans la table faq_entries.
// Usage : node src/seeders/faqData.js
// ============================================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query } = require('../config/db');

const FAQ_ENTRIES = [
  // ── Catégorie 1 : Communication & AAC ────────────────────────────────────
  {
    category: 'Communication & AAC',
    question_fr: 'Comment utiliser les pictogrammes avec mon enfant autiste ?',
    question_ar: 'كيف أستخدم الصور التواصلية (بيكتوغرام) مع طفلي التوحدي؟',
    answer_fr: `Les pictogrammes AAC (Communication Alternative et Améliorée) sont des images symboliques qui aident votre enfant à exprimer ses besoins et émotions.

**Comment commencer :**
1. Choisissez 5 à 10 pictogrammes simples (manger, boire, jouer, dormir, toilettes)
2. Placez-les dans un endroit accessible à l'enfant
3. Montrez toujours le pictogramme en même temps que vous dites le mot
4. Récompensez chaque tentative de communication
5. Augmentez progressivement le nombre de symboles

Dans l'application AIDAA, vous trouverez une bibliothèque de pictogrammes adaptés à votre enfant dans la section **AAC**.`,
    answer_ar: `الصور التواصلية (AAC) هي رموز مصورة تساعد طفلك على التعبير عن احتياجاته ومشاعره.

**كيف تبدأ:**
1. اختر 5 إلى 10 صور بسيطة (أكل، شرب، لعب، نوم، حمام)
2. ضعها في مكان يسهل وصول الطفل إليه
3. أظهر الصورة دائماً مع النطق بالكلمة
4. كافئ كل محاولة للتواصل
5. زد عدد الرموز تدريجياً

في تطبيق AIDAA، ستجد مكتبة صور تواصلية في قسم **AAC**.`,
    keywords_json: JSON.stringify(['pictogramme', 'aac', 'communication', 'image', 'symbole', 'alternative', 'augmentative', 'صور', 'تواصل', 'بيكتوغرام']),
  },
  {
    category: 'Communication & AAC',
    question_fr: 'Mon enfant ne parle pas encore, est-ce normal avec l\'autisme ?',
    question_ar: 'طفلي لا يتكلم بعد، هل هذا طبيعي مع التوحد؟',
    answer_fr: `Le retard ou l'absence de langage verbal est fréquent dans l'autisme, mais chaque enfant est unique.

**Ce que vous pouvez faire :**
• Consultez un **orthophoniste** spécialisé en communication alternative
• Utilisez les pictogrammes AAC pour faciliter la communication
• Parlez lentement et clairement, en utilisant des phrases courtes
• Créez des routines visuelles pour structurer la journée
• Encouragez toute forme de communication (gestes, regards, sons)

L'absence de parole ne signifie pas l'absence de capacité à communiquer. De nombreux enfants autistes développent des formes alternatives efficaces.`,
    answer_ar: `تأخر أو غياب الكلام شائع في التوحد، لكن كل طفل مختلف.

**ما يمكنك فعله:**
• استشر **أخصائي النطق واللغة** المتخصص في التواصل البديل
• استخدم الصور التواصلية (AAC) لتسهيل التعبير
• تكلم ببطء وبجمل قصيرة وواضحة
• أنشئ جداول يومية بصرية لتنظيم اليوم
• شجّع أي شكل من أشكال التواصل (إشارات، نظرات، أصوات)

غياب الكلام لا يعني غياب القدرة على التواصل.`,
    keywords_json: JSON.stringify(['parle', 'langage', 'verbal', 'retard', 'muet', 'communication', 'yتكلم', 'كلام', 'لغة', 'نطق']),
  },
  {
    category: 'Communication & AAC',
    question_fr: 'Comment aider mon enfant à mieux comprendre les consignes ?',
    question_ar: 'كيف أساعد طفلي على فهم التعليمات بشكل أفضل؟',
    answer_fr: `Pour améliorer la compréhension des consignes chez un enfant autiste :

• **Simplifiez** : donnez une consigne à la fois, en phrases courtes
• **Visualisez** : accompagnez toujours la consigne d'un pictogramme ou geste
• **Répétez** : répétez calmement sans élever la voix
• **Montrez** : démontrez l'action plutôt que de l'expliquer
• **Attendez** : laissez du temps de traitement (10-15 secondes)
• **Structurez** : créez des routines prévisibles pour les activités répétées`,
    answer_ar: `لتحسين فهم التعليمات عند طفلك التوحدي:

• **بسّط**: أعطِ تعليمة واحدة في كل مرة، بجمل قصيرة
• **استعن بالصور**: أرفق دائماً التعليمة بصورة أو إشارة
• **كرّر**: كرر بهدوء دون رفع الصوت
• **أظهر**: أثبت الفعل بدلاً من شرحه
• **انتظر**: أعطِ وقتاً للمعالجة (10-15 ثانية)
• **نظّم**: ابنِ روتيناً متوقعاً للأنشطة المتكررة`,
    keywords_json: JSON.stringify(['consigne', 'comprendre', 'compréhension', 'instruction', 'ordre', 'تعليمة', 'فهم', 'أوامر']),
  },

  // ── Catégorie 2 : Gestion des comportements ──────────────────────────────
  {
    category: 'Gestion des comportements',
    question_fr: 'Mon enfant fait des crises, que faire ?',
    question_ar: 'طفلي يصاب بنوبات (كرايزس)، ماذا أفعل؟',
    answer_fr: `Les crises (meltdowns) sont des réponses à une surcharge sensorielle ou émotionnelle. Voici comment réagir :

**Pendant la crise :**
1. Restez **calme** — votre calme aide l'enfant à se réguler
2. **Réduisez** les stimulations (lumières, sons, monde)
3. Assurez la **sécurité** sans contenir physiquement si possible
4. Ne donnez **pas de consignes** pendant la crise
5. **Attendez** que la tempête passe

**Après la crise :**
• Proposez un espace calme et rassurant
• Ne punissez pas — la crise n'est pas intentionnelle
• Notez les **déclencheurs** pour les anticiper à l'avenir

**Prévention :** créez un planning visuel, avertissez à l'avance des changements.`,
    answer_ar: `النوبات (Meltdowns) هي ردود فعل على حمل حسي أو عاطفي زائد. إليك كيفية التصرف:

**خلال النوبة:**
1. ابقَ **هادئاً** — هدوؤك يساعد طفلك على التنظيم الذاتي
2. **قلّل** المحفزات (أضواء، أصوات، ازدحام)
3. ضمن **السلامة** دون تقييد جسدي إن أمكن
4. لا تعطِ **تعليمات** خلال النوبة
5. **انتظر** حتى تمر العاصفة

**بعد النوبة:**
• قدّم مكاناً هادئاً ومطمئناً
• لا تعاقب — النوبة ليست متعمدة
• سجّل **المحفزات** لتجنبها مستقبلاً

**الوقاية:** أنشئ جدولاً بصرياً، وأخبره مسبقاً بأي تغييرات.`,
    keywords_json: JSON.stringify(['crise', 'meltdown', 'comportement', 'colère', 'agitation', 'explosion', 'نوبة', 'أزمة', 'سلوك', 'غضب']),
  },
  {
    category: 'Gestion des comportements',
    question_fr: 'Comment gérer les comportements répétitifs (stéréotypies) ?',
    question_ar: 'كيف أتعامل مع السلوكيات التكرارية (ستيريوتايبي)؟',
    answer_fr: `Les stéréotypies (mouvements répétitifs) ont souvent une fonction régulatrice pour l'enfant autiste.

**Comprendre avant d'intervenir :**
• Elles réduisent le stress et régulent les émotions
• Elles ne doivent être redirigées que si elles sont dangereuses ou très gênantes socialement

**Stratégies :**
• Identifiez la **fonction** (autorégulation, stimulation sensorielle)
• Proposez des **alternatives sécurisées** (balancer, presser une balle anti-stress)
• Aménagez des moments dédiés à ces comportements
• Consultez un **ergothérapeute** pour un bilan sensoriel`,
    answer_ar: `السلوكيات التكرارية (Stéréotypies) غالباً ما تؤدي وظيفة تنظيمية للطفل التوحدي.

**افهم قبل أن تتدخل:**
• تخفف من التوتر وتنظم المشاعر
• لا ينبغي توجيهها إلا إذا كانت خطرة أو مزعجة اجتماعياً جداً

**الاستراتيجيات:**
• حدد **الوظيفة** (تنظيم ذاتي، تحفيز حسي)
• اقترح **بدائل آمنة** (تأرجح، ضغط كرة مضاد للتوتر)
• خصص أوقاتاً لهذه السلوكيات
• استشر **معالجاً وظيفياً** لتقييم حسي`,
    keywords_json: JSON.stringify(['stéréotypie', 'répétitif', 'balancement', 'flapping', 'tics', 'تكراري', 'حركات', 'تكرار']),
  },
  {
    category: 'Gestion des comportements',
    question_fr: 'Mon enfant mord ou frappe, comment réagir ?',
    question_ar: 'طفلي يعض أو يضرب، كيف أتصرف؟',
    answer_fr: `Les comportements agressifs chez l'enfant autiste sont souvent une forme de communication d'une détresse.

**Réaction immédiate :**
1. Restez calme, ton neutre
2. Mettez-vous en sécurité et mettez l'enfant en sécurité
3. Ne punissez pas physiquement
4. Évitez les longues explications verbales

**Comprendre la cause :**
• Surcharge sensorielle ?
• Frustration communicationnelle ?
• Besoin non satisfait ?

**Plan à long terme :**
• Travaillez avec un **behavioriste** (ABA) ou psychologue
• Enseignez des alternatives à l'agression (pictogrammes "j'ai besoin d'aide")
• Tenez un journal des incidents`,
    answer_ar: `السلوكيات العدوانية عند الطفل التوحدي غالباً ما تكون شكلاً من أشكال التعبير عن ضائقة.

**رد الفعل الفوري:**
1. ابقَ هادئاً بنبرة محايدة
2. اضمن سلامتك وسلامة الطفل
3. لا تعاقب جسدياً
4. تجنب الشرح اللفظي المطوّل

**فهم السبب:**
• حمل حسي زائد؟
• إحباط تواصلي؟
• حاجة غير مشبعة؟

**الخطة على المدى البعيد:**
• تعاون مع **معالج سلوكي** أو طبيب نفسي
• علّم بدائل للعدوان (صورة تواصلية "أحتاج مساعدة")
• احتفظ بسجل الحوادث`,
    keywords_json: JSON.stringify(['mord', 'frappe', 'agression', 'violence', 'agressif', 'عنف', 'يضرب', 'يعض', 'عدوان']),
  },

  // ── Catégorie 3 : Activités quotidiennes ─────────────────────────────────
  {
    category: 'Activités quotidiennes',
    question_fr: 'Quelles activités recommandez-vous pour un enfant de 4 à 6 ans autiste ?',
    question_ar: 'ما الأنشطة الموصى بها لطفل توحدي بين 4 و6 سنوات؟',
    answer_fr: `Pour les enfants autistes de 4 à 6 ans, privilégiez des activités structurées et sensoriellement adaptées :

**Activités recommandées :**
• 🎨 **Arts créatifs** : peinture aux doigts, modelage, collage
• 🧩 **Puzzles simples** : 4 à 12 pièces, thèmes familiers
• 🎵 **Musique et rythme** : frapper dans les mains, instruments simples
• 🌿 **Jeux sensoriels** : bac à sable, eau, textures variées
• 📚 **Livres d'images** : histoires courtes avec pictogrammes
• 🏃 **Motricité globale** : toboggan, balançoire, parcours moteur

Dans l'application AIDAA, explorez la section **Activités** pour des contenus adaptés au profil de votre enfant.`,
    answer_ar: `للأطفال التوحديين من 4 إلى 6 سنوات، فضّل الأنشطة المنظمة والمكيّفة حسياً:

**الأنشطة الموصى بها:**
• 🎨 **الفنون الإبداعية**: الرسم بالأصابع، العجين، اللصق
• 🧩 **الأحجية البسيطة**: 4 إلى 12 قطعة، مواضيع مألوفة
• 🎵 **الموسيقى والإيقاع**: التصفيق، آلات بسيطة
• 🌿 **الألعاب الحسية**: صندوق رمل، ماء، ملمسات متنوعة
• 📚 **كتب الصور**: قصص قصيرة مع بيكتوغرام
• 🏃 **الحركة الكبرى**: زحليقة، أرجوحة، مسارات حركية`,
    keywords_json: JSON.stringify(['activité', 'activites', '4', '5', '6', 'ans', 'jeune', 'enfant', 'jeu', 'jeux', 'نشاط', 'لعبة', 'طفل', 'سنوات']),
  },
  {
    category: 'Activités quotidiennes',
    question_fr: 'Comment établir une routine quotidienne pour mon enfant autiste ?',
    question_ar: 'كيف أنشئ روتيناً يومياً لطفلي التوحدي؟',
    answer_fr: `Les routines sont essentielles pour les enfants autistes car elles réduisent l'anxiété et augmentent l'autonomie.

**Comment créer une routine efficace :**
1. **Listez** les activités quotidiennes (réveil, repas, école, bain, coucher)
2. **Créez un planning visuel** avec pictogrammes pour chaque étape
3. **Respectez les horaires** autant que possible
4. **Annoncez les changements** à l'avance avec un pictogramme "changement"
5. **Utilisez un minuteur** visuel pour les transitions

**Outils utiles :**
• Tableau de routine illustré
• Minuteur visuel (Time Timer)
• Application AIDAA → section **Séquences guidées**`,
    answer_ar: `الروتين ضروري للأطفال التوحديين لأنه يقلل القلق ويزيد الاستقلالية.

**كيف تنشئ روتيناً فعّالاً:**
1. **أدرج** الأنشطة اليومية (الاستيقاظ، الوجبات، المدرسة، الاستحمام، النوم)
2. **أنشئ جدولاً بصرياً** مع بيكتوغرام لكل خطوة
3. **التزم بالمواعيد** قدر الإمكان
4. **أخبر مسبقاً بالتغييرات** مع صورة "تغيير"
5. **استخدم مؤقتاً بصرياً** للانتقالات`,
    keywords_json: JSON.stringify(['routine', 'quotidien', 'planning', 'horaire', 'programme', 'journée', 'روتين', 'يومي', 'جدول', 'برنامج']),
  },
  {
    category: 'Activités quotidiennes',
    question_fr: 'Comment enseigner l\'autonomie (toilettes, repas) à mon enfant autiste ?',
    question_ar: 'كيف أعلّم الاستقلالية (الحمام، الوجبات) لطفلي التوحدي؟',
    answer_fr: `L'apprentissage de l'autonomie nécessite une approche structurée et patiente :

**Pour les toilettes :**
• Créez une séquence visuelle étape par étape
• Utilisez le même vocabulaire à chaque fois
• Récompensez chaque réussite immédiatement
• Soyez régulier sur les horaires (toutes les 2h au début)

**Pour les repas :**
• Utilisez des ustensiles adaptés (cuillères larges, assiettes compartimentées)
• Introduisez les aliments un par un, sans forcer
• Créez un rituel du repas (même place, même ordre)
• Valorisez les petits progrès`,
    answer_ar: `تعلّم الاستقلالية يتطلب نهجاً منظماً وصبوراً:

**للحمام:**
• أنشئ تسلسلاً بصرياً خطوة بخطوة
• استخدم نفس المفردات في كل مرة
• كافئ كل نجاح فوراً
• كن منتظماً في المواعيد (كل ساعتين في البداية)

**للوجبات:**
• استخدم أدوات مكيّفة (ملاعق عريضة، أطباق مقسّمة)
• قدّم الأطعمة واحداً تلو الآخر، دون إجبار
• أنشئ طقوساً للوجبة (نفس المكان، نفس الترتيب)
• قدّر التقدم الصغير`,
    keywords_json: JSON.stringify(['autonomie', 'toilettes', 'propreté', 'repas', 'manger', 'indépendance', 'استقلالية', 'حمام', 'وجبة', 'أكل']),
  },

  // ── Catégorie 4 : Ressources thérapeutiques ──────────────────────────────
  {
    category: 'Ressources thérapeutiques',
    question_fr: 'Comment trouver un orthophoniste spécialisé en autisme en Tunisie ?',
    question_ar: 'كيف أجد أخصائي نطق متخصصاً في التوحد في تونس؟',
    answer_fr: `Pour trouver un orthophoniste spécialisé en autisme en Tunisie :

**Ressources officielles :**
• **Ordre National des Orthophonistes de Tunisie** — pour la liste des praticiens agréés
• **INPE** (Institut National de Protection de l'Enfance) — Tel: 71 391 666
• **Hôpital Razi** (La Manouba) — Service de pédopsychiatrie
• **Hôpital d'Enfants de Tunis** — Service pédiatrique

**Associations :**
• Association Tunisienne pour la Défense des Droits des Personnes Autistes (ATDDPA)
• Association Autisme Tunisie

**Conseils :**
• Demandez une prise en charge précoce (avant 5 ans est optimal)
• Privilégiez un professionnel formé à la CAA (Communication Augmentée et Alternative)
• Assurez-vous que le professionnel est inscrit dans votre réseau CNAM si applicable`,
    answer_ar: `للعثور على أخصائي نطق متخصص في التوحد في تونس:

**مصادر رسمية:**
• **هيئة أخصائيي النطق واللغة التونسية** — قائمة الممارسين المعتمدين
• **المعهد الوطني لحماية الطفولة (INPE)** — الهاتف: 71 391 666
• **مستشفى الرازي** (المنوبة) — قسم طب نفس الأطفال
• **مستشفى الأطفال بتونس** — القسم الطبي للأطفال

**الجمعيات:**
• الجمعية التونسية للدفاع عن حقوق ذوي التوحد
• جمعية التوحد تونس

**نصائح:**
• اطلب التدخل المبكر (قبل 5 سنوات أمثل)
• فضّل أخصائياً مدرّباً على التواصل البديل والمعزّز`,
    keywords_json: JSON.stringify(['orthophoniste', 'orthophonie', 'thérapeute', 'spécialiste', 'tunisie', 'trouver', 'أخصائي', 'نطق', 'تونس', 'علاج']),
  },
  {
    category: 'Ressources thérapeutiques',
    question_fr: 'Qu\'est-ce que la thérapie ABA et est-elle adaptée à mon enfant ?',
    question_ar: 'ما هو علاج ABA وهل هو مناسب لطفلي؟',
    answer_fr: `L'Analyse Comportementale Appliquée (ABA) est une approche thérapeutique fondée sur la science du comportement.

**Principes :**
• Enseigne de nouvelles compétences par le renforcement positif
• Réduit les comportements problématiques en identifiant leurs causes
• Individualisée selon les besoins de chaque enfant

**Avantages documentés :**
• Amélioration du langage et de la communication
• Développement des compétences sociales
• Augmentation de l'autonomie

**Points d'attention :**
• L'ABA intensive (40h/semaine) est controversée — privilégiez une approche naturelle et play-based
• Demandez un thérapeute certifié BCBA ou équivalent
• Assurez-vous que l'approche respecte la dignité de l'enfant`,
    answer_ar: `تحليل السلوك التطبيقي (ABA) نهج علاجي مبني على علم السلوك.

**المبادئ:**
• يعلّم مهارات جديدة عبر التعزيز الإيجابي
• يقلل السلوكيات الإشكالية بتحديد أسبابها
• مخصص حسب احتياجات كل طفل

**الفوائد الموثقة:**
• تحسين اللغة والتواصل
• تنمية المهارات الاجتماعية
• زيادة الاستقلالية

**نقاط للانتباه:**
• ABA المكثف (40 ساعة/أسبوع) مثير للجدل — فضّل النهج الطبيعي القائم على اللعب
• اطلب معالجاً معتمداً BCBA أو ما يعادله`,
    keywords_json: JSON.stringify(['aba', 'behavioriste', 'comportemental', 'bcba', 'thérapie', 'علاج', 'سلوكي', 'تحليل']),
  },
  {
    category: 'Ressources thérapeutiques',
    question_fr: 'Qu\'est-ce que l\'ergothérapie et comment aide-t-elle les enfants autistes ?',
    question_ar: 'ما هو العلاج الوظيفي وكيف يساعد الأطفال التوحديين؟',
    answer_fr: `L'ergothérapie aide les enfants autistes à développer les compétences nécessaires pour les activités quotidiennes.

**Domaines d'intervention :**
• **Intégration sensorielle** : traitement des hypersensibilités/hyposensibilités
• **Motricité fine** : écriture, manipulation d'objets, autonomie
• **Activités de la vie quotidienne** : s'habiller, manger, hygiène
• **Jeux et participation sociale** : apprendres les jeux, interaction avec les pairs

**Signes qu'un bilan ergothérapique est utile :**
• Hypersensibilité aux sons, lumières, textures
• Difficultés à tenir un crayon ou boutonner
• Problèmes d'équilibre ou de coordination
• Résistance à certaines sensations (coupes de cheveux, brossage de dents)`,
    answer_ar: `العلاج الوظيفي يساعد الأطفال التوحديين على تطوير المهارات اللازمة للأنشطة اليومية.

**مجالات التدخل:**
• **التكامل الحسي**: معالجة فرط الحساسية/نقص الحساسية
• **الحركة الدقيقة**: الكتابة، التعامل مع الأشياء، الاستقلالية
• **أنشطة الحياة اليومية**: اللباس، الأكل، النظافة
• **الألعاب والمشاركة الاجتماعية**`,
    keywords_json: JSON.stringify(['ergothérapie', 'ergothérapeute', 'sensoriel', 'motricité', 'intégration', 'علاج وظيفي', 'حسي', 'حركة']),
  },

  // ── Catégorie 5 : Droits et scolarisation ────────────────────────────────
  {
    category: 'Droits et scolarisation',
    question_fr: 'Quels sont les droits scolaires de mon enfant autiste en Tunisie ?',
    question_ar: 'ما هي الحقوق المدرسية لطفلي التوحدي في تونس؟',
    answer_fr: `En Tunisie, la loi garantit le droit à l'éducation pour tous les enfants, y compris ceux en situation de handicap.

**Textes de référence :**
• Loi n° 2002-80 du 23 juillet 2002 relative à la protection des personnes handicapées
• Loi d'orientation de l'éducation et de l'enseignement scolaire

**Droits de votre enfant :**
• **Scolarisation dans une école ordinaire** avec aménagements raisonnables
• **Accès aux classes d'intégration** dans certaines écoles spécialisées
• **Plan d'accompagnement personnalisé** (PAP équivalent)
• **Adaptation des examens** (temps supplémentaire, support adapté)

**Démarches :**
1. Contactez l'**Inspecteur de l'éducation** de votre région
2. Obtenez un **certificat médical** d'un médecin spécialiste
3. Demandez une réunion avec la direction de l'école`,
    answer_ar: `في تونس، يضمن القانون حق التعليم لجميع الأطفال، بمن فيهم ذوو الإعاقة.

**المراجع القانونية:**
• القانون عدد 2002-80 المؤرخ في 23 يوليو 2002 المتعلق بحماية ذوي الإعاقة
• قانون توجيه التربية والتعليم المدرسي

**حقوق طفلك:**
• **التمدرس في مدرسة عادية** مع ترتيبات معقولة
• **الوصول لفصول الدمج** في بعض المدارس المتخصصة
• **خطة مرافقة شخصية** (ما يعادل PAP)
• **تكييف الامتحانات** (وقت إضافي، دعم مكيّف)`,
    keywords_json: JSON.stringify(['droit', 'école', 'scolarisation', 'loi', 'handicap', 'tunisie', 'حق', 'مدرسة', 'تمدرس', 'قانون']),
  },
  {
    category: 'Droits et scolarisation',
    question_fr: 'Comment préparer mon enfant à son premier jour d\'école ?',
    question_ar: 'كيف أجهّز طفلي ليومه المدرسي الأول؟',
    answer_fr: `La transition vers l'école est une étape importante qui nécessite une préparation soigneuse :

**Avant l'école :**
• Visitez l'école **plusieurs fois** avant la rentrée
• Rencontrez l'enseignant(e) pour expliquer les besoins de votre enfant
• Créez un **story-board** visuel sur la journée à l'école
• Pratiquez la routine matinale (réveil → habillage → petit-déjeuner → école)
• Préparez un **objet réconfortant** (jouet, peluche) si autorisé

**Le jour J :**
• Restez calme et positif
• Évitez les adieux prolongés
• Convenez d'un signe de séparation rituel

**Communication avec l'école :**
• Donnez un **carnet de liaison** pour les retours quotidiens
• Partagez les pictogrammes que votre enfant utilise`,
    answer_ar: `الانتقال إلى المدرسة خطوة مهمة تتطلب تحضيراً دقيقاً:

**قبل المدرسة:**
• زر المدرسة **عدة مرات** قبل الدخول
• التقِ بالمعلم/ة لشرح احتياجات طفلك
• أنشئ **قصة مصورة** عن اليوم المدرسي
• مارس الروتين الصباحي (استيقاظ، ارتداء الملابس، فطور، مدرسة)
• جهّز **شيئاً مريحاً** (لعبة، دمية) إن سُمح بذلك

**يوم الدخول:**
• ابقَ هادئاً وإيجابياً
• تجنب وداعاً مطوّلاً
• اتفق على إيماءة وداع طقوسية`,
    keywords_json: JSON.stringify(['école', 'rentrée', 'premier jour', 'préparation', 'transition', 'مدرسة', 'يوم أول', 'دخول مدرسي', 'تحضير']),
  },

  // ── Catégorie 6 : Santé et bien-être ─────────────────────────────────────
  {
    category: 'Santé et bien-être',
    question_fr: 'Comment aider mon enfant autiste à mieux dormir ?',
    question_ar: 'كيف أساعد طفلي التوحدي على النوم بشكل أفضل؟',
    answer_fr: `Les troubles du sommeil sont très fréquents chez les enfants autistes (50 à 80%).

**Stratégies efficaces :**
• **Routine du coucher** : même séquence chaque soir (bain → pyjama → histoire → lumière tamisée → dodo)
• **Environnement sensoriel** : lumière tamisée, bruit blanc, température confortable, couvertures lestées si utile
• **Limiter les écrans** : 1-2h avant le coucher minimum
• **Activité physique** en journée pour favoriser la fatigue naturelle
• **Mélatonine** : à discuter avec le pédiatre (souvent utile mais nécessite prescription)

**Consultation médicale** si troubles persistants > 1 mois.`,
    answer_ar: `اضطرابات النوم شائعة جداً عند الأطفال التوحديين (50 إلى 80%).

**استراتيجيات فعّالة:**
• **روتين النوم**: نفس التسلسل كل ليلة (استحمام → بيجاما → قصة → إضاءة خافتة → نوم)
• **البيئة الحسية**: إضاءة خافتة، ضجيج أبيض، حرارة مريحة، بطانيات ثقيلة إن كانت مفيدة
• **تحديد الشاشات**: 1-2 ساعة قبل النوم على الأقل
• **النشاط البدني** نهاراً لتعزيز التعب الطبيعي
• **الميلاتونين**: ناقش مع طبيب الأطفال (مفيد غالباً لكن يحتاج وصفة)`,
    keywords_json: JSON.stringify(['sommeil', 'dormir', 'nuit', 'insomnie', 'mélatonine', 'coucher', 'نوم', 'ليل', 'أرق', 'ميلاتونين']),
  },
  {
    category: 'Santé et bien-être',
    question_fr: 'Quels aliments sont recommandés pour un enfant autiste ?',
    question_ar: 'ما الأطعمة الموصى بها لطفل توحدي؟',
    answer_fr: `Il n'existe pas de "régime autisme" prouvé scientifiquement, mais certains points nutritionnels sont importants :

**Points nutritionnels clés :**
• Évitez les carences (zinc, oméga-3, vitamine D, magnésium) — bilan sanguin régulier
• Maintenez une alimentation équilibrée et variée
• Gérez les sélectivités alimentaires progressivement sans forcer

**Approche pratique pour les sélectivités :**
• Introduisez les nouveaux aliments en **petites quantités** à côté des aliments acceptés
• Jouez avec les textures (mixer, couper différemment)
• Impliquez l'enfant dans la préparation

**Consulter :** un nutritionniste pédiatrique si sélectivité sévère ou carences constatées.`,
    answer_ar: `لا يوجد "نظام غذائي للتوحد" مُثبت علمياً، لكن هناك نقاط تغذوية مهمة:

**نقاط تغذوية أساسية:**
• تجنب نقص المعادن (زنك، أوميغا-3، فيتامين D، مغنيزيوم) — تحاليل دورية
• حافظ على نظام غذائي متوازن ومتنوع
• تعامل مع الانتقائية الغذائية تدريجياً دون إجبار

**نهج عملي للانتقائية:**
• قدّم الأطعمة الجديدة بـ**كميات صغيرة** بجانب الأطعمة المقبولة
• العب مع الملمسات (هرس، تقطيع بشكل مختلف)
• أشرك الطفل في التحضير`,
    keywords_json: JSON.stringify(['alimentation', 'aliments', 'nourriture', 'régime', 'nutrition', 'manger', 'غذاء', 'أكل', 'طعام', 'تغذية']),
  },

  // ── Catégorie 7 : Application AIDAA ──────────────────────────────────────
  {
    category: 'Application AIDAA',
    question_fr: 'Comment utiliser l\'application AIDAA pour suivre les progrès de mon enfant ?',
    question_ar: 'كيف أستخدم تطبيق AIDAA لمتابعة تقدم طفلي؟',
    answer_fr: `L'application AIDAA vous permet de suivre le développement de votre enfant de manière structurée.

**Fonctionnalités principales :**
• 📊 **Tableau de bord** : suivi global des activités et progrès
• 📝 **Journal d'activités** : enregistrez les séances et observations
• 🎯 **Contenus adaptés** : vidéos et activités selon le profil de votre enfant
• 💬 **Communication pro** : échangez avec le professionnel suivi de votre enfant
• 🏅 **Gamification** : badges et récompenses pour motiver l'enfant
• 📅 **Téléconsultations** : planifiez des consultations à distance

**Pour commencer :**
1. Complétez le profil de votre enfant (section "Mon enfant")
2. Explorez les contenus recommandés
3. Connectez un professionnel de soin via "Mes professionnels"`,
    answer_ar: `تطبيق AIDAA يتيح لك متابعة تطور طفلك بشكل منظم.

**الميزات الرئيسية:**
• 📊 **لوحة المتابعة**: تتبع شامل للأنشطة والتقدم
• 📝 **سجل الأنشطة**: دوّن الجلسات والملاحظات
• 🎯 **محتوى مكيّف**: فيديوهات وأنشطة حسب ملف طفلك
• 💬 **التواصل المهني**: تبادل مع المختص المتابع لطفلك
• 🏅 **التلعيب**: شارات ومكافآت لتحفيز الطفل
• 📅 **الاستشارات عن بُعد**: خطط مواعيد افتراضية`,
    keywords_json: JSON.stringify(['aidaa', 'application', 'app', 'utiliser', 'fonctionnalité', 'tطبيق', 'استخدام', 'ميزات']),
  },
  {
    category: 'Application AIDAA',
    question_fr: 'Comment partager le suivi de mon enfant avec son thérapeute sur AIDAA ?',
    question_ar: 'كيف أشارك متابعة طفلي مع معالجه على AIDAA؟',
    answer_fr: `AIDAA permet de connecter parents et professionnels pour un suivi coordonné.

**Étapes pour partager avec un thérapeute :**
1. Accédez à la section **"Mes professionnels"** dans votre espace parent
2. Cliquez sur **"Inviter un professionnel"**
3. Saisissez le nom et l'email de votre thérapeute
4. Le professionnel recevra un email d'invitation pour rejoindre AIDAA
5. Une fois connecté, il pourra accéder aux données partagées de votre enfant

**Données partagées :**
• Historique des activités et progrès
• Notes et observations
• Contenus consultés

**Confidentialité :** Vous contrôlez l'accès et pouvez révoquer à tout moment.`,
    answer_ar: `AIDAA يتيح ربط الآباء والمختصين لمتابعة منسقة.

**خطوات المشاركة مع المعالج:**
1. اذهب إلى قسم **"مختصيّ"** في فضائك الأبوي
2. انقر على **"دعوة مختص"**
3. أدخل اسم وبريد معالجك الإلكتروني
4. سيتلقى المختص بريداً إلكترونياً دعوة للانضمام لـ AIDAA
5. بمجرد تسجيله، يمكنه الاطلاع على البيانات المشتركة لطفلك

**البيانات المشتركة:** تاريخ الأنشطة والتقدم، الملاحظات، المحتوى المستشار.
**السرية:** أنت تتحكم في الوصول ويمكنك سحبه في أي وقت.`,
    keywords_json: JSON.stringify(['partager', 'thérapeute', 'professionnel', 'inviter', 'suivi', 'مشاركة', 'معالج', 'مختص', 'دعوة']),
  },
];

async function seed() {
  console.log('[FAQ Seeder] 🌱 Insertion des entrées FAQ...');

  // Créer la table si elle n'existe pas
  await query(`
    CREATE TABLE IF NOT EXISTS faq_entries (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      category     VARCHAR(100) NOT NULL,
      question_fr  TEXT NOT NULL,
      question_ar  TEXT,
      answer_fr    TEXT NOT NULL,
      answer_ar    TEXT,
      keywords_json JSON,
      is_active    TINYINT(1) NOT NULL DEFAULT 1,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Vider la table pour éviter les doublons en cas de re-seed
  await query('DELETE FROM faq_entries', []);
  console.log('[FAQ Seeder] 🗑️  Table faq_entries vidée.');

  let count = 0;
  for (const entry of FAQ_ENTRIES) {
    await query(
      `INSERT INTO faq_entries
         (category, question_fr, question_ar, answer_fr, answer_ar, keywords_json, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        entry.category,
        entry.question_fr,
        entry.question_ar || null,
        entry.answer_fr,
        entry.answer_ar || null,
        entry.keywords_json,
      ]
    );
    count++;
    console.log(`[FAQ Seeder] ✅ (${count}/${FAQ_ENTRIES.length}) ${entry.category} — ${entry.question_fr.substring(0, 60)}...`);
  }

  console.log(`\n[FAQ Seeder] 🎉 ${count} entrées FAQ insérées avec succès !`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[FAQ Seeder] ❌ Erreur:', err);
  process.exit(1);
});

