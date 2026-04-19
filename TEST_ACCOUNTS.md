# AIDAA — Comptes de test

> Importer `setup_complete.sql` dans phpMyAdmin pour créer tous ces comptes.

---

## 👤 Admin

| Nom | Email | Mot de passe |
|-----|-------|-------------|
| Admin AIDAA | admin@aidaa.com | admin123 |

---

## 👨‍👩‍👧 Parents — mot de passe : `parent123`

| Nom | Email | Enfant(s) | Professionnel lié |
|-----|-------|-----------|-------------------|
| Parent Test | parent@aidaa.com | Test Child 1 | Dr. Professional Test |
| Sarah Johnson | sarah.johnson@aidaa.com | Emma Johnson, Lucas Johnson | Dr. Abderrahman Sbai |
| Mohamed Trabelsi | mohamed.trabelsi@aidaa.com | Youssef Trabelsi | Dr. Fatima Mansour |
| Leila Ben Ali | leila.benali@aidaa.com | Nour Ben Ali | Dr. Karim Hamdi |
| Amine Bouazizi | amine.bouazizi@aidaa.com | Adam Bouazizi | Dr. Professional Test |
| Fatma Jebali | fatma.jebali@aidaa.com | Lina Jebali | Dr. Professional Test |
| Karim Zouari | karim.zouari@aidaa.com | Hamza Zouari | Dr. Professional Test |
| Sana Maaref | sana.maaref@aidaa.com | Yasmine Maaref | Dr. Professional Test |
| Nabil Ferchichi | nabil.ferchichi@aidaa.com | Sami Ferchichi | Dr. Professional Test |
| Rania Mhiri | rania.mhiri@aidaa.com | Dina Mhiri | Dr. Professional Test |
| Sofiane Khelifi | sofiane.khelifi@aidaa.com | Mehdi Khelifi | Dr. Abderrahman Sbai |
| Amira Sassi | amira.sassi@aidaa.com | Rym Sassi | Dr. Abderrahman Sbai |
| Bilel Gharbi | bilel.gharbi@aidaa.com | Karim Gharbi | Dr. Abderrahman Sbai |
| Olfa Belhaj | olfa.belhaj@aidaa.com | Sara Belhaj | Dr. Abderrahman Sbai |
| Tarek Haddad | tarek.haddad@aidaa.com | Anas Haddad | Dr. Abderrahman Sbai |
| Mouna Dridi | mouna.dridi@aidaa.com | Amir Dridi | Dr. Fatima Mansour |
| Yassine Chebbi | yassine.chebbi@aidaa.com | Ghofrane Chebbi | Dr. Fatima Mansour |
| Rim Nasri | rim.nasri@aidaa.com | Ziad Nasri | Dr. Fatima Mansour |
| Khaled Rejeb | khaled.rejeb@aidaa.com | Farah Rejeb | Dr. Fatima Mansour |
| Sonia Hammami | sonia.hammami@aidaa.com | Wassim Hammami | Dr. Fatima Mansour |
| Adel Bouslama | adel.bouslama@aidaa.com | Nour Bouslama | Dr. Fatima Mansour |
| Hajer Khalfallah | hajer.khalfallah@aidaa.com | Malek Khalfallah | Dr. Karim Hamdi |
| Walid Chaouch | walid.chaouch@aidaa.com | Islem Chaouch | Dr. Karim Hamdi |
| Ines Tlili | ines.tlili@aidaa.com | Cyrine Tlili | Dr. Karim Hamdi |
| Omar Baccar | omar.baccar@aidaa.com | Rami Baccar | Dr. Karim Hamdi |
| Salma Ouertani | salma.ouertani@aidaa.com | Ghada Ouertani | Dr. Karim Hamdi |
| Fares Boughanmi | fares.boughanmi@aidaa.com | Seif Boughanmi | Dr. Karim Hamdi |
| Nadya Oueslati | nadya.oueslati@aidaa.com | Lara Oueslati | Dr. Amina Chaabane |
| Bassem Letaief | bassem.letaief@aidaa.com | Imed Letaief | Dr. Amina Chaabane |
| Dorsaf Ayari | dorsaf.ayari@aidaa.com | Malak Ayari | Dr. Amina Chaabane |
| Mourad Karray | mourad.karray@aidaa.com | Skander Karray | Dr. Amina Chaabane |
| Hela Ghannouchi | hela.ghannouchi@aidaa.com | Alia Ghannouchi | Dr. Amina Chaabane |
| Zied Labidi | zied.labidi@aidaa.com | Chaima Labidi | Dr. Amina Chaabane |
| Nadia Sfaxi | nadia.sfaxi@aidaa.com | Tarek Sfaxi | Dr. Amina Chaabane |

---

## 🩺 Professionnels — mot de passe : `professional123`

| Nom | Email | Spécialité | Enfants suivis |
|-----|-------|-----------|----------------|
| Dr. Professional Test | professional@aidaa.com | Orthophonie | Test Child 1, Adam Bouazizi, Lina Jebali, Hamza Zouari, Yasmine Maaref, Sami Ferchichi, Dina Mhiri |
| Dr. Abderrahman Sbai | abderrahman.sbai@aidaa.com | Psychologie | Emma Johnson, Lucas Johnson, Mehdi Khelifi, Rym Sassi, Karim Gharbi, Sara Belhaj, Anas Haddad |
| Dr. Fatima Mansour | fatima.mansour@aidaa.com | Orthopedagogie | Youssef Trabelsi, Amir Dridi, Ghofrane Chebbi, Ziad Nasri, Farah Rejeb, Wassim Hammami, Nour Bouslama |
| Dr. Karim Hamdi | karim.hamdi@aidaa.com | Neuropsychologie | Nour Ben Ali, Malek Khalfallah, Islem Chaouch, Cyrine Tlili, Rami Baccar, Ghada Ouertani, Seif Boughanmi |
| Dr. Amina Chaabane | amina.chaabane@aidaa.com | Ergotherapie | Lara Oueslati, Imed Letaief, Malak Ayari, Skander Karray, Alia Ghannouchi, Chaima Labidi, Tarek Sfaxi |

---

## 🚀 Lancer le projet (PC de ton ami)

### 1. Cloner le repo
```bash
git clone https://github.com/Mohamed-abidi-95/AIDAA.git
cd AIDAA
```

### 2. Importer la base de données
- Ouvrir **phpMyAdmin**
- Supprimer `aidaa_db` si elle existe déjà
- Importer `setup_complete.sql` → tout sera créé automatiquement

### 3. Configurer le `.env` backend
Créer le fichier `backend/.env` :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=aidaa_db
JWT_SECRET=aidaa_secret_key
PORT=5000
```

### 4. Lancer le backend
```bash
cd backend
npm install
npm start
# → http://localhost:5000/health
```

### 5. Lancer le frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📊 Statistiques base de données

| Table | Quantité |
|-------|----------|
| Utilisateurs | 40 (1 admin + 34 parents + 5 pros) |
| Participants (enfants/jeunes) | 35 |
| Invitations actives | 34 |
| Contenus (vidéo/audio/activité) | 11 |
| Logs d'activités | ~280 |
| Messages | 15 |
| Notes professionnelles | ~40 |
| Séquences guidées | 5 |
| Symboles AAC | 30 |
| Badges | 6 |
| Jeux | 3 |
