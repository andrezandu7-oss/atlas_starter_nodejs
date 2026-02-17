# 💙 Genlove V4.5 - Rencontres Santé

![Version](https://img.shields.io/badge/version-4.5.0-ff416c)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![PWA](https://img.shields.io/badge/PWA-ready-blue)

**Genlove** est une application de rencontres innovante qui base ses recommandations sur la **compatibilité génétique** (génotype AA, AS, SS) pour aider les utilisateurs à former des couples sains et éviter les risques de drépanocytose chez les enfants.

---

## ✨ **Fonctionnalités principales**

### 🔬 **Comptabilité génétique intelligente**
- Inscription avec données médicales (génotype, groupe sanguin)
- Règle stricte : **AS/SS ne voient que des profils AA**
- **AA** peut voir tous les profils
- Blocage automatique des unions à risque (AS+AS, AS+SS, SS+SS)

### 💬 **Messagerie permanente**
- Chat en temps réel avec historique conservé en base de données
- Boîte de réception (`/inbox`) pour retrouver toutes les conversations
- Indicateurs de messages non lus
- Possibilité de **supprimer une conversation**

### 🚫 **Contrôle de la vie privée**
- Bloquer un utilisateur (disparaît du matching et des messages)
- Débloquer à tout moment
- Liste des utilisateurs bloqués

### 📱 **Application installable (PWA)**
- Ajout à l'écran d'accueil sur mobile
- Mode hors-ligne avec page dédiée
- Icône et thème personnalisés

### 🛡️ **Sécurité et confidentialité**
- Données cryptées en transit
- Authentification via localStorage (session utilisateur)
- Suppression définitive du compte possible

---

## 🚀 **Installation rapide**

### Prérequis
- Node.js ≥ 18.0.0
- MongoDB Atlas (gratuit)
- npm ≥ 9.0.0

### Étapes d'installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-username/genlove-v4.5.git
cd genlove-v4.5

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec votre MONGODB_URI

# 4. Lancer l'application
npm start