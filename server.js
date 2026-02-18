const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// ============================================
// CONNEXION MONGODB
// ============================================
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
.catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// ============================================
// MODÈLES DE DONNÉES
// ============================================
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    desireChild: String,
    photo: String,
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STYLES CSS PARTAGÉS
// ============================================
const styles = `
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
        margin: 0; 
        background: #fdf2f2; 
        display: flex; 
        justify-content: center; 
        min-height: 100vh;
    }
    
    .app-shell { 
        width: 100%; 
        max-width: 420px; 
        min-height: 100vh; 
        background: #f4e9da; 
        display: flex; 
        flex-direction: column; 
        box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        position: relative; 
    }
    
    #genlove-notify { 
        position: fixed; 
        top: -100px; 
        left: 50%; 
        transform: translateX(-50%);
        width: 90%;
        max-width: 380px;
        background: #1a2a44; 
        color: white; 
        padding: 15px 20px; 
        border-radius: 50px; 
        display: flex; 
        align-items: center; 
        gap: 10px; 
        transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        z-index: 9999; 
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
        border-left: 5px solid #ff416c; 
        font-weight: 500;
    }
    
    #genlove-notify.show { 
        top: 20px; 
    }
    
    #loader { 
        display: none; 
        position: fixed; 
        inset: 0; 
        background: rgba(255,255,255,0.95); 
        z-index: 10000; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        text-align: center; 
        padding: 20px; 
        backdrop-filter: blur(5px);
    }
    
    .spinner { 
        width: 60px; 
        height: 60px; 
        border: 5px solid #f3f3f3; 
        border-top: 5px solid #ff416c; 
        border-radius: 50%; 
        animation: spin 1s linear infinite; 
        margin-bottom: 20px; 
    }
    
    @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
    }
    
    .home-screen { 
        flex: 1; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        padding: 30px; 
        text-align: center; 
        background: linear-gradient(135deg, #fff5f7 0%, #f4e9da 100%);
    }
    
    .logo-text { 
        font-size: 4rem; 
        font-weight: 800; 
        margin-bottom: 10px; 
        letter-spacing: -1px;
        text-shadow: 3px 3px 0 rgba(255,65,108,0.1);
    }
    
    .slogan { 
        font-weight: 600; 
        color: #1a2a44; 
        margin-bottom: 40px; 
        font-size: 1rem; 
        line-height: 1.6;
        padding: 0 20px;
    }
    
    .page-white { 
        background: white; 
        min-height: 100vh; 
        padding: 25px 20px; 
        box-sizing: border-box; 
        text-align: center; 
    }
    
    .photo-circle { 
        width: 130px; 
        height: 130px; 
        border: 3px dashed #ff416c; 
        border-radius: 50%; 
        margin: 0 auto 20px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        position: relative; 
        cursor: pointer; 
        background-size: cover; 
        background-position: center; 
        transition: all 0.3s;
        overflow: hidden;
    }
    
    .photo-circle:hover {
        transform: scale(1.05);
        border-color: #1a2a44;
    }
    
    .input-box { 
        width: 100%; 
        padding: 15px; 
        border: 2px solid #e2e8f0; 
        border-radius: 15px; 
        margin-top: 12px; 
        font-size: 1rem; 
        box-sizing: border-box; 
        background: #f8f9fa; 
        color: #333; 
        transition: all 0.3s;
    }
    
    .input-box:focus {
        border-color: #ff416c;
        outline: none;
        box-shadow: 0 0 0 3px rgba(255,65,108,0.1);
    }
    
    .serment-container { 
        margin-top: 25px; 
        padding: 20px; 
        background: #fff5f7; 
        border-radius: 15px; 
        border: 2px solid #ffdae0; 
        text-align: left; 
        display: flex; 
        gap: 15px; 
        align-items: flex-start; 
    }
    
    .serment-text { 
        font-size: 0.85rem; 
        color: #1a2a44; 
        line-height: 1.5; 
    }
    
    .btn-pink { 
        background: #ff416c; 
        color: white; 
        padding: 18px 25px; 
        border-radius: 60px; 
        text-align: center; 
        text-decoration: none; 
        font-weight: 700; 
        font-size: 1.1rem; 
        display: block; 
        width: 85%; 
        margin: 20px auto; 
        border: none; 
        cursor: pointer; 
        transition: all 0.3s; 
        box-shadow: 0 10px 20px rgba(255,65,108,0.2);
    }
    
    .btn-pink:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 15px 25px rgba(255,65,108,0.3);
    }
    
    .btn-pink:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .btn-dark { 
        background: #1a2a44; 
        color: white; 
        padding: 18px 25px; 
        border-radius: 60px; 
        text-align: center; 
        text-decoration: none; 
        font-weight: 700; 
        font-size: 1.1rem; 
        display: block; 
        margin: 15px; 
        box-sizing: border-box; 
        transition: all 0.3s;
        box-shadow: 0 10px 20px rgba(26,42,68,0.2);
    }
    
    .btn-dark:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 25px rgba(26,42,68,0.3);
    }
    
    .btn-action { 
        border: none; 
        border-radius: 25px; 
        padding: 10px 16px; 
        font-size: 0.85rem; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s; 
    }
    
    .btn-contact { 
        background: #ff416c; 
        color: white; 
    }
    
    .btn-contact:hover {
        background: #ff1f4f;
        transform: scale(1.02);
    }
    
    .btn-details { 
        background: #1a2a44; 
        color: white; 
    }
    
    .btn-details:hover {
        background: #0f1a2c;
    }
    
    .btn-block { 
        background: #dc3545; 
        color: white; 
    }
    
    .btn-block:hover {
        background: #c82333;
    }
    
    #popup-overlay { 
        display: none; 
        position: fixed; 
        inset: 0; 
        background: rgba(0,0,0,0.8); 
        z-index: 10000; 
        align-items: center; 
        justify-content: center; 
        padding: 20px; 
        backdrop-filter: blur(5px);
    }
    
    .popup-content { 
        background: white; 
        border-radius: 30px; 
        width: 100%; 
        max-width: 380px; 
        padding: 30px 25px; 
        position: relative; 
        text-align: left; 
        animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        max-height: 90vh;
        overflow-y: auto;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .close-popup { 
        position: absolute; 
        top: 15px; 
        right: 15px; 
        font-size: 1.8rem; 
        cursor: pointer; 
        color: #666; 
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #f0f0f0;
        transition: background 0.3s;
    }
    
    .close-popup:hover {
        background: #e0e0e0;
    }
    
    .st-group { 
        background: white; 
        border-radius: 20px; 
        margin: 0 15px 15px 15px; 
        overflow: hidden; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.03); 
        text-align: left; 
    }
    
    .st-item { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 16px 20px; 
        border-bottom: 1px solid #f8f8f8; 
        color: #333; 
        font-size: 0.95rem; 
    }
    
    .st-item:last-child {
        border-bottom: none;
    }
    
    .switch { 
        position: relative; 
        display: inline-block; 
        width: 50px; 
        height: 24px; 
    }
    
    .switch input { 
        opacity: 0; 
        width: 0; 
        height: 0; 
    }
    
    .slider { 
        position: absolute; 
        cursor: pointer; 
        inset: 0; 
        background-color: #ccc; 
        transition: .4s; 
        border-radius: 24px; 
    }
    
    .slider:before { 
        position: absolute; 
        content: ""; 
        height: 18px; 
        width: 18px; 
        left: 3px; 
        bottom: 3px; 
        background-color: white; 
        transition: .4s; 
        border-radius: 50%; 
    }
    
    input:checked + .slider { 
        background-color: #ff416c; 
    }
    
    input:checked + .slider:before { 
        transform: translateX(26px); 
    }
    
    .match-card { 
        background: white; 
        margin: 15px; 
        padding: 20px; 
        border-radius: 25px; 
        display: flex; 
        align-items: center; 
        gap: 15px; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.03); 
        transition: all 0.3s;
        border: 1px solid rgba(255,65,108,0.1);
    }
    
    .match-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(255,65,108,0.15);
    }
    
    .match-photo-blur { 
        width: 70px; 
        height: 70px; 
        border-radius: 50%; 
        background: #f0f0f0; 
        filter: blur(5px); 
    }
    
    .end-overlay { 
        position: fixed; 
        inset: 0; 
        background: linear-gradient(135deg, #ff416c 0%, #1a2a44 100%); 
        z-index: 9999; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
    }
    
    .end-card { 
        background: white; 
        border-radius: 40px; 
        padding: 50px 30px; 
        width: 85%; 
        text-align: center; 
        box-shadow: 0 20px 40px rgba(0,0,0,0.2); 
    }
    
    .inbox-item { 
        background: white; 
        margin: 10px 15px; 
        padding: 18px; 
        border-radius: 20px; 
        display: flex; 
        align-items: center; 
        gap: 15px; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.03); 
        cursor: pointer; 
        transition: all 0.3s;
    }
    
    .inbox-item:hover { 
        background: #fff5f7; 
        transform: translateY(-2px);
    }
    
    .last-message { 
        font-size: 0.85rem; 
        color: #666; 
        margin-top: 5px; 
    }
    
    .timestamp { 
        font-size: 0.7rem; 
        color: #999; 
    }
    
    .chat-messages { 
        flex: 1; 
        padding: 20px; 
        background: #f5f7fb; 
        overflow-y: auto; 
        display: flex; 
        flex-direction: column; 
        gap: 10px; 
    }
    
    .bubble { 
        padding: 12px 18px; 
        border-radius: 20px; 
        max-width: 75%; 
        line-height: 1.4; 
        word-wrap: break-word;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .received { 
        background: white; 
        align-self: flex-start; 
        border-bottom-left-radius: 5px;
    }
    
    .sent { 
        background: #ff416c; 
        color: white; 
        align-self: flex-end; 
        border-bottom-right-radius: 5px;
    }
    
    .input-area { 
        padding: 15px 20px; 
        display: flex; 
        gap: 10px; 
        background: white; 
        border-top: 1px solid #eee; 
    }
    
    .chat-header { 
        background: #1a2a44; 
        color: white; 
        padding: 15px 20px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 420px) {
        .app-shell {
            max-width: 100%;
        }
        .btn-pink, .btn-dark {
            width: 90%;
            padding: 16px 20px;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    
    .text-center { text-align: center; }
    .mt-20 { margin-top: 20px; }
    .mb-20 { margin-bottom: 20px; }
    .p-20 { padding: 20px; }
</style>
`;

// ============================================
// SCRIPT DE NOTIFICATION PARTAGÉ
// ============================================
const notifyScript = `
<script>
    function showNotify(msg, type = 'info') {
        const n = document.getElementById('genlove-notify');
        const m = document.getElementById('notify-msg');
        if(m) m.innerText = msg;
        if(n) {
            n.style.backgroundColor = type === 'success' ? '#4CAF50' : '#1a2a44';
            n.classList.add('show');
        }
        setTimeout(() => { 
            if(n) n.classList.remove('show'); 
        }, 3000);
    }
    
    function showLoader() {
        document.getElementById('loader').style.display = 'flex';
    }
    
    function hideLoader() {
        document.getElementById('loader').style.display = 'none';
    }
    
    window.addEventListener('online', () => showNotify('📶 Connecté', 'success'));
    window.addEventListener('offline', () => showNotify('📴 Hors ligne', 'error'));
    
    window.addEventListener('beforeunload', (e) => {
        if (document.getElementById('messageInput')?.value) {
            e.preventDefault();
            e.returnValue = 'Vous avez un message en cours de rédaction.';
        }
    });
</script>
`;

// ============================================
// FONCTIONS UTILITAIRES (UNE SEULE FOIS !)
// ============================================
function calculerAge(dateNaissance) {
    if (!dateNaissance) return "??";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function calculateCompatibility(user1, user2) {
    let score = 50;
    
    if (user1.genotype === 'AA') {
        if (user2.genotype === 'AA') score += 30;
        else if (user2.genotype === 'AS') score += 15;
        else score -= 20;
    } else if (user1.genotype === 'AS') {
        if (user2.genotype === 'AA') score += 25;
        else if (user2.genotype === 'AS') score += 5;
        else score -= 30;
    } else {
        if (user2.genotype === 'AA') score += 20;
        else score -= 40;
    }
    
    const age1 = calculerAge(user1.dob);
    const age2 = calculerAge(user2.dob);
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 5;
    else if (ageDiff > 15) score -= 10;
    
    return Math.min(100, Math.max(0, Math.round(score)));
}

function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return \`Il y a \${diffMins} min\`;
    if (diffHours < 24) return \`Il y a \${diffHours} h\`;
    if (diffDays === 1) return 'Hier';
    return date.toLocaleDateString();
}

// ============================================
// DÉBUT DES ROUTES - INSÉREZ VOS ROUTES ICI
// ============================================

/* ===== COPIEZ TOUTES VOS ROUTES ICI ===== */
/* app.get('/', ...) */
/* app.get('/charte-engagement', ...) */
/* app.get('/signup', ...) */
/* app.get('/profile', ...) */
/* app.get('/matching', ...) */
/* app.get('/inbox', ...) */
/* app.get('/chat', ...) */
/* app.get('/settings', ...) */
/* Toutes les routes API */
/* ======================================== */

// ============================================
// FIN DES ROUTES - DÉMARRAGE DU SERVEUR
// ============================================

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
    console.log(\`🚀 Genlove démarré avec succès !\`);
    console.log(\`📱 Application accessible sur http://localhost:\${port}\`);
    console.log(\`💾 Base de données: \${mongoose.connection.readyState === 1 ? 'Connectée ✅' : 'Déconnectée ❌'}\`);
    console.log(\`⚙️ Mode: \${process.env.NODE_ENV || 'development'}\`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
    console.log('\n🔌 Arrêt du serveur...');
    mongoose.connection.close(() => {
        console.log('✅ Déconnexion MongoDB réussie');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🔌 Arrêt du serveur...');
    mongoose.connection.close(() => {
        console.log('✅ Déconnexion MongoDB réussie');
        process.exit(0);
    });
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
    console.error('❌ Erreur non capturée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejetée non gérée:', reason);
});

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.stack);
    res.status(500).json({ 
        error: 'Une erreur est survenue',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Route 404 pour les chemins non trouvés
app.use((req, res) => {
    res.status(404).send(\`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page non trouvée - Genlove</title>
            \${styles}
        </head>
        <body>
            <div class="app-shell">
                <div style="text-align: center; padding: 50px 20px;">
                    <span style="font-size: 5rem;">😕</span>
                    <h2 style="color: #1a2a44; margin: 20px 0;">Page non trouvée</h2>
                    <p style="color: #666; margin-bottom: 30px;">La page que vous recherchez n'existe pas ou a été déplacée.</p>
                    <a href="/" class="btn-pink" style="width: auto; display: inline-block; padding: 15px 40px;">
                        Retour à l'accueil
                    </a>
                </div>
            </div>
        </body>
        </html>
    \`);
});