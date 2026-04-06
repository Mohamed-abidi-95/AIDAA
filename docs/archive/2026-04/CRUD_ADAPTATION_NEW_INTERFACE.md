# 🔄 **ADAPTATION CRUD - NOUVELLE INTERFACE CHILD**

**Date:** April 5, 2026  
**Objectif:** Adapter le CRUD pour supporter la nouvelle interface du prototype

---

## 📋 **STRUCTURE DE DONNÉES REQUISE**

### **Content Table (Existant - Vérifier les champs)**

```sql
CREATE TABLE content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type ENUM('video','activity','audio') NOT NULL,
  category VARCHAR(100),
  age_group VARCHAR(50),
  level INT DEFAULT 1,
  url TEXT,
  description TEXT,
  emoji VARCHAR(10),                 -- ✅ AJOUTER POUR PROTOTYPE
  duration VARCHAR(20),              -- ✅ AJOUTER POUR VIDEOS
  steps INT,                         -- ✅ AJOUTER POUR ACTIVITIES
  minutes INT,                       -- ✅ AJOUTER POUR ACTIVITIES
  emoji_color VARCHAR(20),           -- ✅ AJOUTER POUR ACTIVITIES
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🎯 **DONNÉES REQUISES PAR LE PROTOTYPE**

### **Pour les VIDÉOS:**
```javascript
{
  id: number,
  emoji: string,              // 🗣️, 😊, 🧩, 🍎
  title: string,              // "Apprendre à dire bonjour"
  category: string,           // "Communication", "Émotions", "Social", "Autonomie"
  categoryColor: string,      // "#f97316"
  duration: string,           // "3 min", "5 min"
  url: string,                // Backend URL
  description: string
}
```

### **Pour les ACTIVITÉS:**
```javascript
{
  id: number,
  emoji: string,              // 🌱, 🎨, 🎵
  emojiColor: string,         // "#d1fae5", "#fce7f3", "#e0f2fe"
  title: string,              // "Séquence du matin"
  steps: number,              // 5, 8, 6
  minutes: number,            // 15, 20, 10
  url: string,                // Backend URL
  description: string
}
```

---

## 🔄 **ENDPOINTS À ADAPTER**

### **1. GET /api/content (Existant - À Améliorer)**

**Ancien:**
```javascript
GET /api/content
Response: { id, title, type, category, url, description }
```

**Nouveau:**
```javascript
GET /api/content?type=video
Response: [
  {
    id: 1,
    emoji: "🗣️",
    title: "Apprendre à dire bonjour",
    category: "Communication",
    categoryColor: "#f97316",
    duration: "3 min",
    url: "http://...",
    description: "..."
  }
]

GET /api/content?type=activity
Response: [
  {
    id: 1,
    emoji: "🌱",
    emojiColor: "#d1fae5",
    title: "Séquence du matin",
    steps: 5,
    minutes: 15,
    url: "http://...",
    description: "..."
  }
]
```

### **2. POST /api/content (Existant - À Améliorer)**

**Nouveau Body:**
```javascript
POST /api/content
Body: {
  title: "Apprendre à dire bonjour",
  type: "video",
  category: "Communication",
  categoryColor: "#f97316",
  duration: "3 min",
  emoji: "🗣️",
  url: "http://...",
  description: "...",
  age_group: "4-6",
  level: 1
}
```

---

## 📝 **MIGRATIONS REQUISES**

### **1. Ajouter Colonnes à la Table content**

```sql
ALTER TABLE content
ADD COLUMN emoji VARCHAR(10) DEFAULT NULL,
ADD COLUMN duration VARCHAR(20) DEFAULT NULL,
ADD COLUMN steps INT DEFAULT NULL,
ADD COLUMN minutes INT DEFAULT NULL,
ADD COLUMN emoji_color VARCHAR(20) DEFAULT NULL,
ADD COLUMN category_color VARCHAR(20) DEFAULT '#f97316';
```

### **2. Insérer Données d'Exemple**

```sql
-- Videos
INSERT INTO content (title, type, category, category_color, emoji, duration, url, description, age_group, level)
VALUES 
('Apprendre à dire bonjour', 'video', 'Communication', '#f97316', '🗣️', '3 min', 'http://...', 'Apprenez à dire bonjour poliment', '4-6', 1),
('Reconnaître les émotions', 'video', 'Émotions', '#f97316', '😊', '5 min', 'http://...', 'Identifiez les différentes émotions', '4-6', 1),
('Jouer ensemble c\'est amusant', 'video', 'Social', '#f97316', '🧩', '4 min', 'http://...', 'Les bénéfices du jeu social', '4-6', 1),
('Préparer mon petit-déjeuner', 'video', 'Autonomie', '#f97316', '🍎', '6 min', 'http://...', 'Étapes pour préparer le petit-déj', '4-6', 1);

-- Activities
INSERT INTO content (title, type, emoji, emoji_color, steps, minutes, url, description, age_group, level)
VALUES 
('Séquence du matin', 'activity', '🌱', '#d1fae5', 5, 15, 'http://...', 'Routine matinale structurée', '4-6', 1),
('Créer avec les couleurs', 'activity', '🎨', '#fce7f3', 8, 20, 'http://...', 'Activité créative avec couleurs', '4-6', 1),
('Écouter et répéter', 'activity', '🎵', '#e0f2fe', 6, 10, 'http://...', 'Jeu d\'écoute et prononciation', '4-6', 1);
```

---

## 💻 **MODIFICATIONS BACKEND REQUISES**

### **1. Model - content.model.js**

Ajouter fonction pour formater les données:

```javascript
const formatContent = (content) => {
  if (content.type === 'video') {
    return {
      id: content.id,
      emoji: content.emoji,
      title: content.title,
      category: content.category,
      categoryColor: content.category_color,
      duration: content.duration,
      url: content.url,
      description: content.description
    };
  } else if (content.type === 'activity') {
    return {
      id: content.id,
      emoji: content.emoji,
      emojiColor: content.emoji_color,
      title: content.title,
      steps: content.steps,
      minutes: content.minutes,
      url: content.url,
      description: content.description
    };
  }
  return content;
};
```

### **2. Controller - content.controller.js**

Modifier getAll pour formater les réponses:

```javascript
const getAll = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      age_group: req.query.age_group,
      level: req.query.level,
    };

    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    let content = await contentModel.getAll(filters);
    
    // Format content based on type
    content = content.map(item => formatContent(item));

    res.status(200).json({
      success: true,
      message: 'Content retrieved successfully',
      data: content,
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content',
      error: error.message,
    });
  }
};
```

---

## 🎯 **UTILISATION DANS LE FRONTEND**

### **Exemple: Fetch Videos pour le Prototype**

```typescript
// Dans ChildDashboard.tsx ou un hook
const fetchVideos = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/content?type=video');
    const data = await res.json();
    if (data.success) {
      setVideos(data.data); // Format: { id, emoji, title, category, categoryColor, duration }
    }
  } catch (err) {
    console.error('Error fetching videos:', err);
  }
};

const fetchActivities = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/content?type=activity');
    const data = await res.json();
    if (data.success) {
      setActivities(data.data); // Format: { id, emoji, emojiColor, title, steps, minutes }
    }
  } catch (err) {
    console.error('Error fetching activities:', err);
  }
};
```

---

## 📊 **CHECKLIST ADAPTATION CRUD**

- [ ] Ajouter colonnes à la table content (emoji, duration, steps, minutes, emoji_color, category_color)
- [ ] Insérer données d'exemple (4 vidéos + 3 activités)
- [ ] Modifier content.model.js - Ajouter formatContent()
- [ ] Modifier content.controller.js - Appliquer formatContent() dans getAll
- [ ] Tester GET /api/content?type=video
- [ ] Tester GET /api/content?type=activity
- [ ] Intégrer dans ChildDashboard.tsx
- [ ] Vérifier les données affichées

---

## 🚀 **PROCHAINES ÉTAPES**

1. **Exécuter migrations SQL** - Ajouter colonnes
2. **Insérer données d'exemple** - 7 items
3. **Modifier backend** - Format responses
4. **Tester endpoints** - Postman/Thunder Client
5. **Intégrer au frontend** - Fetch et afficher
6. **Vérifier styling** - Colors et emojis corrects

---

**Cette adaptation CRUD rendra le prototype 100% fonctionnel!** ✅

