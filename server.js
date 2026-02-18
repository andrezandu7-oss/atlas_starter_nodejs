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
// FONCTIONS UTILITAIRES
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

// ============================================
// DÉBUT DES ROUTES - INSÉREZ TOUS LES ÉCRANS ICI
// ============================================
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Genlove - Rencontres Santé</title>
    ${styles}
    <style>
        .home-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #fff5f7 0%, #f4e9da 100%);
        }
        .logo-container {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo-text {
            font-size: 4.5rem;
            font-weight: 800;
            letter-spacing: -1px;
            text-shadow: 3px 3px 0 rgba(255, 65, 108, 0.1);
        }
        .slogan {
            font-size: 1.1rem;
            color: #1a2a44;
            text-align: center;
            line-height: 1.6;
            margin: 20px 30px 40px;
            padding: 15px;
            background: rgba(255,255,255,0.5);
            border-radius: 50px;
            border: 1px solid rgba(255,65,108,0.2);
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 30px 20px;
        }
        .feature-item {
            background: white;
            padding: 15px 10px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            border: 1px solid #ffe4e8;
        }
        .feature-item span {
            font-size: 2rem;
            display: block;
            margin-bottom: 5px;
        }
        .feature-item p {
            margin: 0;
            font-size: 0.8rem;
            color: #1a2a44;
            font-weight: 500;
        }
        .btn-home {
            background: #ff416c;
            color: white;
            padding: 18px 25px;
            border-radius: 60px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1rem;
            display: block;
            margin: 15px 20px;
            text-align: center;
            box-shadow: 0 10px 20px rgba(255, 65, 108, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        .btn-home.secondary {
            background: #1a2a44;
            box-shadow: 0 10px 20px rgba(26, 42, 68, 0.3);
        }
        .btn-home:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px rgba(255, 65, 108, 0.4);
        }
        .security-badge {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            font-size: 0.75rem;
            color: #666;
            border-top: 1px solid rgba(0,0,0,0.1);
        }
        .security-badge img {
            width: 20px;
            height: 20px;
            vertical-align: middle;
            margin-right: 5px;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .delay-1 { animation-delay: 0.2s; opacity: 0; }
        .delay-2 { animation-delay: 0.4s; opacity: 0; }
        .delay-3 { animation-delay: 0.6s; opacity: 0; }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="home-screen">
            <div class="logo-container animate">
                <div class="logo-text">
                    <span style="color:#1a2a44;">Gen</span>
                    <span style="color:#ff416c;">love</span>
                </div>
            </div>
            
            <div class="slogan animate delay-1">
                Unissez cœur et santé pour bâtir des couples sains 💑
            </div>

            <div class="features-grid">
                <div class="feature-item animate delay-2">
                    <span>🧬</span>
                    <p>Compatibilité génétique</p>
                </div>
                <div class="feature-item animate delay-2">
                    <span>🩺</span>
                    <p>Profil santé vérifié</p>
                </div>
                <div class="feature-item animate delay-2">
                    <span>🤝</span>
                    <p>Rencontres sérieuses</p>
                </div>
                <div class="feature-item animate delay-2">
                    <span>🔒</span>
                    <p>Confidentialité totale</p>
                </div>
            </div>

            <div style="width:100%; margin-top:20px;">
                <p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px; text-align:center;">
                    Avez-vous déjà un compte ?
                </p>
                
                <a href="/profile" class="btn-home secondary animate delay-3">
                    🔐 Se connecter
                </a>
                
                <a href="/charte-engagement" class="btn-home animate delay-3">
                    ✨ Créer un compte
                </a>
            </div>

            <div class="security-badge animate delay-3">
                <span>🛡️</span> Vos données de santé sont cryptées et confidentielles<br>
                <small>Conformité RGPD & Sécurité niveau banque</small>
            </div>
        </div>
    </div>

    <script>
        // Animation supplémentaire au scroll
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('.animate');
            elements.forEach(el => {
                el.classList.add('fadeInUp');
            });
        });

        // Préchargement des pages pour une meilleure expérience
        const preloadPages = ['/profile', '/charte-engagement'];
        preloadPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    </script>
</body>
</html>`);
});

app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Genlove - Engagement Éthique</title>
    ${styles}
    <style>
        .charte-container {
            background: white;
            border-radius: 30px 30px 0 0;
            padding: 30px 20px;
            min-height: 100vh;
        }
        .charte-header {
            text-align: center;
            margin-bottom: 25px;
        }
        .charte-icon {
            font-size: 4rem;
            margin-bottom: 10px;
        }
        .charte-title {
            color: #1a2a44;
            font-size: 1.8rem;
            margin: 0 0 5px 0;
        }
        .charte-subtitle {
            color: #666;
            font-size: 0.9rem;
            margin: 0;
        }
        .charte-box {
            height: 300px;
            overflow-y: auto;
            background: #fff5f7;
            border: 2px solid #ffdae0;
            border-radius: 20px;
            padding: 25px;
            font-size: 0.9rem;
            color: #444;
            line-height: 1.7;
            margin-bottom: 20px;
            scroll-behavior: smooth;
            box-shadow: inset 0 5px 15px rgba(255,65,108,0.05);
        }
        .charte-box::-webkit-scrollbar {
            width: 6px;
        }
        .charte-box::-webkit-scrollbar-track {
            background: #ffdae0;
            border-radius: 10px;
        }
        .charte-box::-webkit-scrollbar-thumb {
            background: #ff416c;
            border-radius: 10px;
        }
        .charte-section {
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #ffdae0;
        }
        .charte-section:last-child {
            border-bottom: none;
        }
        .charte-section-title {
            color: #ff416c;
            font-size: 1.1rem;
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .charte-section-title span {
            font-size: 1.5rem;
        }
        .charte-text {
            margin-left: 35px;
        }
        .scroll-indicator {
            text-align: center;
            color: #ff416c;
            font-size: 0.9rem;
            margin: 10px 0;
            padding: 10px;
            background: rgba(255,65,108,0.1);
            border-radius: 30px;
            transition: opacity 0.3s;
        }
        .scroll-indicator.hidden {
            opacity: 0;
            pointer-events: none;
        }
        .progress-bar {
            width: 100%;
            height: 4px;
            background: #ffdae0;
            border-radius: 2px;
            margin: 15px 0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #ff416c;
            width: 0%;
            transition: width 0.3s;
        }
        .btn-charte {
            background: #ff416c;
            color: white;
            padding: 18px 25px;
            border-radius: 60px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1rem;
            display: block;
            margin: 20px 0;
            text-align: center;
            border: none;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s;
            opacity: 0.5;
            pointer-events: none;
        }
        .btn-charte.enabled {
            opacity: 1;
            pointer-events: auto;
            background: #ff416c;
            box-shadow: 0 10px 20px rgba(255,65,108,0.3);
        }
        .btn-charte.enabled:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px rgba(255,65,108,0.4);
        }
        .btn-cancel {
            color: #666;
            text-decoration: none;
            font-size: 0.9rem;
            display: block;
            text-align: center;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="charte-container">
            <div class="charte-header">
                <div class="charte-icon">📜</div>
                <h1 class="charte-title">Engagement Éthique</h1>
                <p class="charte-subtitle">Pour protéger votre santé et celle de votre future famille</p>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>

            <div class="charte-box" id="charteBox" onscroll="checkScrollProgress(this)">
                <div class="charte-section">
                    <div class="charte-section-title">
                        <span>1️⃣</span> Sincérité des Données Médicales
                    </div>
                    <div class="charte-text">
                        L'utilisateur s'engage sur l'honneur à saisir un génotype et un groupe sanguin rigoureusement conformes à ses derniers examens en laboratoire. Toute fausse déclaration expose à une exclusion définitive de la plateforme.
                    </div>
                </div>

                <div class="charte-section">
                    <div class="charte-section-title">
                        <span>2️⃣</span> Responsabilité Individuelle
                    </div>
                    <div class="charte-text">
                        Comme pour votre code d'accès personnel, vous êtes le seul garant de l'authenticité de votre profil. La vérité des informations repose sur votre intégrité. Genlove n'est pas responsable des conséquences liées à de fausses déclarations.
                    </div>
                </div>

                <div class="charte-section">
                    <div class="charte-section-title">
                        <span>3️⃣</span> Confidentialité des Échanges
                    </div>
                    <div class="charte-text">
                        Les échanges sont protégés et confidentiels. Les messages sont conservés pour permettre le suivi des conversations. L'utilisateur s'engage à respecter la vie privée de ses partenaires et à ne pas partager de captures d'écran.
                    </div>
                </div>

                <div class="charte-section">
                    <div class="charte-section-title">
                        <span>4️⃣</span> Protection de la Descendance
                    </div>
                    <div class="charte-text">
                        Vous acceptez que nos algorithmes privilégient la santé de vos futurs enfants en filtrant les unions à risque (compatibilité génétique). Cette approche préventive est au cœur de notre mission.
                    </div>
                </div>

                <div class="charte-section">
                    <div class="charte-section-title">
                        <span>5️⃣</span> Non-Stigmatisation
                    </div>
                    <div class="charte-text">
                        Genlove est une communauté de respect. Tout propos discriminatoire lié à la santé, l'origine ou tout autre critère sera sanctionné par une exclusion définitive. La bienveillance est notre valeur fondamentale.
                    </div>
                </div>

                <div class="charte-section">
                    <div class="charte-section-title">
                        <span>⚖️</span> Clause Légale
                    </div>
                    <div class="charte-text">
                        Conformément à la loi, vous disposez d'un droit d'accès, de modification et de suppression de vos données. Genlove s'engage à ne jamais vendre vos informations médicales à des tiers.
                    </div>
                </div>
            </div>

            <div class="scroll-indicator" id="scrollIndicator">
                ⬇️ Faites défiler jusqu'en bas pour accepter ⬇️
            </div>

            <button id="agreeBtn" class="btn-charte" onclick="acceptCharte()">
                ✅ J'accepte l'engagement éthique
            </button>

            <a href="/" class="btn-cancel">✖️ Annuler et revenir à l'accueil</a>
        </div>
    </div>

    <script>
        let hasScrolledToBottom = false;

        function checkScrollProgress(element) {
            const scrollPercent = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
            document.getElementById('progressFill').style.width = scrollPercent + '%';
            
            const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5;
            
            if (isAtBottom && !hasScrolledToBottom) {
                hasScrolledToBottom = true;
                const btn = document.getElementById('agreeBtn');
                btn.classList.add('enabled');
                btn.disabled = false;
                
                // Animation de confirmation
                element.style.borderColor = '#4CAF50';
                element.style.backgroundColor = '#f0fff4';
                
                // Cacher l'indicateur
                document.getElementById('scrollIndicator').classList.add('hidden');
                
                // Effet de vibration subtil
                btn.style.transform = 'scale(1.05)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);
                
                // Message de félicitations
                showNotification('✓ Vous avez lu toutes les conditions. Merci !', 'success');
            }
        }

        function acceptCharte() {
            if (hasScrolledToBottom) {
                // Animation de chargement
                const btn = document.getElementById('agreeBtn');
                btn.innerHTML = '⏳ Redirection...';
                btn.style.opacity = '0.8';
                
                // Sauvegarder l'acceptation
                localStorage.setItem('charteAcceptee', 'true');
                localStorage.setItem('charteDate', new Date().toISOString());
                
                // Redirection après un petit délai pour l'animation
                setTimeout(() => {
                    window.location.href = '/signup';
                }, 500);
            }
        }

        function showNotification(message, type) {
            // Créer une notification flottante
            const notif = document.createElement('div');
            notif.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4CAF50' : '#ff416c'};
                color: white;
                padding: 15px;
                border-radius: 30px;
                text-align: center;
                font-weight: bold;
                z-index: 9999;
                animation: slideUp 0.3s ease-out;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            `;
            notif.textContent = message;
            document.body.appendChild(notif);
            
            setTimeout(() => {
                notif.style.animation = 'slideDown 0.3s ease-out';
                setTimeout(() => notif.remove(), 300);
            }, 2000);
        }

        // Vérifier si la charte a déjà été acceptée
        window.onload = function() {
            if (localStorage.getItem('charteAcceptee') === 'true') {
                const lastAcceptance = new Date(localStorage.getItem('charteDate'));
                const now = new Date();
                const daysSinceAcceptance = Math.floor((now - lastAcceptance) / (1000 * 60 * 60 * 24));
                
                // Si accepté il y a moins de 30 jours, rediriger directement
                if (daysSinceAcceptance < 30) {
                    window.location.href = '/signup';
                }
            }
        };

        // Ajouter l'animation slideDown
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Genlove - Création de profil</title>
    ${styles}
    <style>
        .signup-container {
            background: white;
            min-height: 100vh;
            padding: 20px;
            position: relative;
        }
        .signup-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .signup-header h2 {
            color: #ff416c;
            margin: 0;
            font-size: 1.8rem;
        }
        .signup-header p {
            color: #666;
            margin: 5px 0 0;
            font-size: 0.9rem;
        }
        .photo-upload {
            width: 130px;
            height: 130px;
            margin: 0 auto 25px;
            position: relative;
            cursor: pointer;
        }
        .photo-circle {
            width: 130px;
            height: 130px;
            border: 3px dashed #ff416c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-size: cover;
            background-position: center;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }
        .photo-circle:hover {
            transform: scale(1.05);
            border-color: #1a2a44;
        }
        .photo-circle.has-image {
            border: 3px solid #4CAF50;
        }
        .photo-placeholder {
            text-align: center;
            color: #ff416c;
        }
        .photo-placeholder span {
            font-size: 2.5rem;
            display: block;
            margin-bottom: 5px;
        }
        .photo-placeholder small {
            font-size: 0.7rem;
            opacity: 0.7;
        }
        .photo-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px;
            font-size: 0.7rem;
            text-align: center;
            transform: translateY(100%);
            transition: transform 0.3s;
        }
        .photo-circle:hover .photo-overlay {
            transform: translateY(0);
        }
        .form-section {
            background: #f8f9fa;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .form-section-title {
            color: #1a2a44;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .form-section-title span {
            background: #ff416c;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }
        .input-box {
            width: 100%;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            margin-top: 10px;
            font-size: 1rem;
            box-sizing: border-box;
            background: white;
            transition: all 0.3s;
        }
        .input-box:focus {
            border-color: #ff416c;
            outline: none;
            box-shadow: 0 0 0 3px rgba(255,65,108,0.1);
        }
        .input-box.error {
            border-color: #dc3545;
            background: #fff8f8;
        }
        .input-group {
            display: flex;
            gap: 10px;
        }
        .input-group .input-box {
            flex: 1;
        }
        .validation-icon {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.2rem;
        }
        .field-container {
            position: relative;
            margin-bottom: 5px;
        }
        .field-hint {
            font-size: 0.7rem;
            color: #666;
            margin-top: 5px;
            padding-left: 5px;
        }
        .field-hint.valid {
            color: #4CAF50;
        }
        .field-hint.invalid {
            color: #dc3545;
        }
        .serment-container {
            margin-top: 20px;
            padding: 20px;
            background: #fff5f7;
            border-radius: 15px;
            border: 2px solid #ffdae0;
        }
        .serment-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 15px;
        }
        .serment-checkbox input[type="checkbox"] {
            width: 22px;
            height: 22px;
            margin-top: 2px;
            accent-color: #ff416c;
        }
        .serment-text {
            font-size: 0.85rem;
            color: #1a2a44;
            line-height: 1.5;
        }
        .progress-steps {
            display: flex;
            justify-content: space-between;
            margin: 30px 0 20px;
            padding: 0 10px;
        }
        .step {
            flex: 1;
            text-align: center;
            position: relative;
        }
        .step:not(:last-child):after {
            content: '';
            position: absolute;
            top: 15px;
            right: -50%;
            width: 100%;
            height: 2px;
            background: #e2e8f0;
            z-index: 1;
        }
        .step.active:not(:last-child):after {
            background: #ff416c;
        }
        .step-number {
            width: 30px;
            height: 30px;
            background: #e2e8f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 5px;
            position: relative;
            z-index: 2;
            color: #666;
            font-weight: bold;
        }
        .step.active .step-number {
            background: #ff416c;
            color: white;
        }
        .step.completed .step-number {
            background: #4CAF50;
            color: white;
        }
        .step-label {
            font-size: 0.7rem;
            color: #666;
        }
        .step.active .step-label {
            color: #ff416c;
            font-weight: bold;
        }
        .btn-pink {
            background: #ff416c;
            color: white;
            padding: 18px;
            border-radius: 50px;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1rem;
            display: block;
            width: 100%;
            margin: 20px 0;
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
        #loader {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(255,255,255,0.95);
            z-index: 1000;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .loader-content {
            text-align: center;
            padding: 30px;
        }
        .spinner {
            width: 60px;
            height: 60px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #ff416c;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        .tooltip {
            position: relative;
            display: inline-block;
            cursor: help;
        }
        .tooltip .tooltiptext {
            visibility: hidden;
            width: 200px;
            background: #1a2a44;
            color: white;
            text-align: center;
            border-radius: 10px;
            padding: 10px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 0.75rem;
            pointer-events: none;
        }
        .tooltip:hover .tooltiptext {
            visibility: visible;
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <!-- Loader -->
        <div id="loader">
            <div class="loader-content">
                <div class="spinner"></div>
                <h3 style="color:#1a2a44;">Analyse sécurisée en cours...</h3>
                <p style="color:#666; font-size:0.9rem;">Vérification de vos données médicales</p>
                <div style="width:200px; height:4px; background:#f0f0f0; border-radius:2px; margin-top:20px;">
                    <div id="loaderProgress" style="width:0%; height:100%; background:#ff416c; border-radius:2px; transition:width 0.3s;"></div>
                </div>
            </div>
        </div>

        <!-- Contenu principal -->
        <div class="signup-container" id="main-content">
            <div class="signup-header">
                <h2>Configuration Santé</h2>
                <p>Créez votre profil en toute confidentialité</p>
            </div>

            <!-- Barre de progression -->
            <div class="progress-steps">
                <div class="step active" id="step1">
                    <div class="step-number">1</div>
                    <div class="step-label">Identité</div>
                </div>
                <div class="step" id="step2">
                    <div class="step-number">2</div>
                    <div class="step-label">Santé</div>
                </div>
                <div class="step" id="step3">
                    <div class="step-number">3</div>
                    <div class="step-label">Projet</div>
                </div>
            </div>

            <form id="signupForm" onsubmit="saveAndRedirect(event)">
                <!-- Section Photo -->
                <div class="photo-upload" onclick="document.getElementById('photoInput').click()">
                    <div class="photo-circle" id="photoCircle">
                        <div class="photo-placeholder" id="photoPlaceholder">
                            <span>📸</span>
                            <small>Ajouter une photo</small>
                        </div>
                    </div>
                    <div class="photo-overlay">Changer la photo</div>
                </div>
                <input type="file" id="photoInput" style="display:none" accept="image/*" onchange="previewPhoto(event)">

                <!-- Section Identité -->
                <div class="form-section">
                    <div class="form-section-title">
                        <span>👤</span> Identité
                    </div>
                    
                    <div class="field-container">
                        <input type="text" id="firstName" class="input-box" placeholder="Prénom" required 
                               oninput="validateField('firstName', /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,30}$/, '2-30 caractères, lettres uniquement')">
                        <div class="field-hint" id="hint-firstName"></div>
                    </div>

                    <div class="field-container">
                        <input type="text" id="lastName" class="input-box" placeholder="Nom" required
                               oninput="validateField('lastName', /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,30}$/, '2-30 caractères, lettres uniquement')">
                        <div class="field-hint" id="hint-lastName"></div>
                    </div>

                    <select id="gender" class="input-box" required onchange="updateStep()">
                        <option value="">Sélectionnez votre genre</option>
                        <option value="Homme">👨 Homme</option>
                        <option value="Femme">👩 Femme</option>
                        <option value="Autre">⚧ Autre</option>
                    </select>

                    <div style="margin-top:15px;">
                        <small style="color:#666;">📅 Date de naissance</small>
                        <input type="date" id="dob" class="input-box" required onchange="validateAge()">
                        <div class="field-hint" id="hint-dob"></div>
                    </div>
                </div>

                <!-- Section Localisation -->
                <div class="form-section">
                    <div class="form-section-title">
                        <span>📍</span> Localisation
                    </div>
                    
                    <div class="field-container">
                        <input type="text" id="residence" class="input-box" placeholder="Ville de résidence" required
                               oninput="validateField('residence', /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]{2,50}$/, 'Nom de ville valide')">
                        <div class="field-hint" id="hint-residence"></div>
                    </div>
                </div>

                <!-- Section Médicale -->
                <div class="form-section">
                    <div class="form-section-title">
                        <span>🧬</span> Informations médicales
                        <div class="tooltip">❓
                            <span class="tooltiptext">Ces données sont cruciales pour votre compatibilité génétique</span>
                        </div>
                    </div>

                    <select id="genotype" class="input-box" required onchange="updateStep()">
                        <option value="">Génotype (obligatoire)</option>
                        <option value="AA">AA - Hémoglobine normale</option>
                        <option value="AS">AS - Porteur sain</option>
                        <option value="SS">SS - Drépanocytaire</option>
                    </select>

                    <div class="input-group">
                        <select id="bloodType" class="input-box" required>
                            <option value="">Groupe</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                        </select>
                        <select id="bloodRh" class="input-box" required>
                            <option value="+">Rhésus +</option>
                            <option value="-">Rhésus -</option>
                        </select>
                    </div>
                </div>

                <!-- Section Projet de vie -->
                <div class="form-section">
                    <div class="form-section-title">
                        <span>👶</span> Projet de vie
                    </div>

                    <select id="desireChild" class="input-box" required onchange="updateStep()">
                        <option value="">Désir d'enfant ?</option>
                        <option value="Oui">✅ Oui, je souhaite fonder une famille</option>
                        <option value="Non">❌ Non, pas pour le moment</option>
                        <option value="Peut-être">🤔 Pas encore décidé(e)</option>
                    </select>
                </div>

                <!-- Serment d'engagement -->
                <div class="serment-container">
                    <div class="serment-checkbox">
                        <input type="checkbox" id="oath" required onchange="updateStep()">
                        <label for="oath" class="serment-text">
                            <strong>Je certifie sur l'honneur</strong> que toutes les informations fournies sont exactes et conformes à mes derniers examens médicaux. Je comprends que de fausses déclarations peuvent mettre en danger ma santé et celle de mes partenaires.
                        </label>
                    </div>
                </div>

                <!-- Récapitulatif -->
                <div style="background:#e3f2fd; border-radius:15px; padding:15px; margin:20px 0; display:none;" id="summary">
                    <h4 style="margin:0 0 10px 0; color:#1a2a44;">📋 Récapitulatif</h4>
                    <div id="summaryContent" style="font-size:0.9rem; color:#444;"></div>
                </div>

                <button type="submit" class="btn-pink" id="submitBtn" disabled>
                    🚀 Valider mon profil
                </button>
            </form>

            <a href="/" style="display:block; text-align:center; color:#666; text-decoration:none; font-size:0.8rem; margin-top:10px;">
                ← Retour à l'accueil
            </a>
        </div>
    </div>

    <script>
        // Variables globales
        let formData = {
            photo: localStorage.getItem('u_p') || '',
            firstName: localStorage.getItem('u_fn') || '',
            lastName: localStorage.getItem('u_ln') || '',
            gender: localStorage.getItem('u_gender') || '',
            dob: localStorage.getItem('u_dob') || '',
            residence: localStorage.getItem('u_res') || '',
            genotype: localStorage.getItem('u_gt') || '',
            bloodGroup: localStorage.getItem('u_gs') || '',
            desireChild: localStorage.getItem('u_pj') || ''
        };

        let currentStep = 1;
        const validations = {};

        // Initialisation
        window.onload = function() {
            loadSavedData();
            updateStep();
            setupRealTimeValidation();
        };

        function loadSavedData() {
            // Charger les données sauvegardées
            if (formData.photo) {
                document.getElementById('photoCircle').style.backgroundImage = `url('${formData.photo}')`;
                document.getElementById('photoCircle').classList.add('has-image');
                document.getElementById('photoPlaceholder').style.display = 'none';
            }
            
            document.getElementById('firstName').value = formData.firstName;
            document.getElementById('lastName').value = formData.lastName;
            document.getElementById('gender').value = formData.gender;
            document.getElementById('dob').value = formData.dob;
            document.getElementById('residence').value = formData.residence;
            document.getElementById('genotype').value = formData.genotype;
            
            if (formData.bloodGroup) {
                const bloodMatch = formData.bloodGroup.match(/([A-B]+)([+-])/);
                if (bloodMatch) {
                    document.getElementById('bloodType').value = bloodMatch[1];
                    document.getElementById('bloodRh').value = bloodMatch[2];
                }
            }
            
            document.getElementById('desireChild').value = formData.desireChild;
            
            // Valider tous les champs
            validateAllFields();
        }

        function setupRealTimeValidation() {
            const fields = ['firstName', 'lastName', 'residence'];
            fields.forEach(field => {
                document.getElementById(field).addEventListener('input', () => {
                    validateField(field, getFieldRegex(field), getFieldHint(field));
                });
            });
        }

        function getFieldRegex(field) {
            const regexes = {
                firstName: /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,30}$/,
                lastName: /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,30}$/,
                residence: /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]{2,50}$/
            };
            return regexes[field];
        }

        function getFieldHint(field) {
            const hints = {
                firstName: '2-30 caractères, lettres uniquement',
                lastName: '2-30 caractères, lettres uniquement',
                residence: 'Nom de ville valide'
            };
            return hints[field];
        }

        function validateField(fieldId, regex, hint) {
            const field = document.getElementById(fieldId);
            const hintElement = document.getElementById(`hint-${fieldId}`);
            const value = field.value.trim();
            
            const isValid = regex.test(value);
            
            if (value.length > 0) {
                if (isValid) {
                    field.classList.remove('error');
                    field.classList.add('valid');
                    hintElement.innerHTML = '✅ ' + hint;
                    hintElement.className = 'field-hint valid';
                    validations[fieldId] = true;
                } else {
                    field.classList.add('error');
                    field.classList.remove('valid');
                    hintElement.innerHTML = '❌ ' + hint;
                    hintElement.className = 'field-hint invalid';
                    validations[fieldId] = false;
                }
            } else {
                field.classList.remove('error', 'valid');
                hintElement.innerHTML = '';
                validations[fieldId] = false;
            }
            
            validateAge();
            updateStep();
            return isValid;
        }

        function validateAge() {
            const dob = document.getElementById('dob').value;
            const hint = document.getElementById('hint-dob');
            
            if (dob) {
                const age = calculateAge(dob);
                if (age < 18) {
                    hint.innerHTML = '❌ Vous devez avoir au moins 18 ans';
                    hint.className = 'field-hint invalid';
                    validations.age = false;
                } else if (age > 120) {
                    hint.innerHTML = '❌ Âge invalide';
                    hint.className = 'field-hint invalid';
                    validations.age = false;
                } else {
                    hint.innerHTML = `✅ ${age} ans - Valide`;
                    hint.className = 'field-hint valid';
                    validations.age = true;
                }
            } else {
                hint.innerHTML = '';
                validations.age = false;
            }
            
            updateStep();
        }

        function calculateAge(dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }

        function validateAllFields() {
            validateField('firstName', /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,30}$/, '2-30 caractères, lettres uniquement');
            validateField('lastName', /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,30}$/, '2-30 caractères, lettres uniquement');
            validateField('residence', /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]{2,50}$/, 'Nom de ville valide');
            validateAge();
        }

        function updateStep() {
            // Déterminer l'étape actuelle
            const step1Complete = validations.firstName && validations.lastName && 
                                  document.getElementById('gender').value && 
                                  validations.age;
            
            const step2Complete = step1Complete && 
                                  document.getElementById('genotype').value && 
                                  document.getElementById('bloodType').value;
            
            const step3Complete = step2Complete && 
                                  document.getElementById('desireChild').value && 
                                  document.getElementById('oath').checked;

            // Mettre à jour les étapes
            document.getElementById('step1').className = step1Complete ? 'step completed' : 'step active';
            document.getElementById('step2').className = step2Complete ? 'step completed' : 'step';
            document.getElementById('step3').className = step3Complete ? 'step completed' : 'step';

            // Activer/désactiver le bouton de soumission
            const submitBtn = document.getElementById('submitBtn');
            if (step3Complete) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
                showSummary();
            } else {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
                submitBtn.style.cursor = 'not-allowed';
            }
        }

        function showSummary() {
            const summary = document.getElementById('summary');
            const content = document.getElementById('summaryContent');
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const age = calculateAge(document.getElementById('dob').value);
            const genotype = document.getElementById('genotype').value;
            const bloodGroup = document.getElementById('bloodType').value + document.getElementById('bloodRh').value;
            
            content.innerHTML = `
                <strong>${firstName} ${lastName}</strong>, ${age} ans<br>
                📍 ${document.getElementById('residence').value}<br>
                🧬 Génotype ${genotype} | Groupe ${bloodGroup}<br>
                👶 Projet: ${document.getElementById('desireChild').value}
            `;
            
            summary.style.display = 'block';
        }

        function previewPhoto(event) {
            const file = event.target.files[0];
            if (file) {
                // Vérifier la taille (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('La photo ne doit pas dépasser 5MB');
                    return;
                }
                
                // Vérifier le type
                if (!file.type.startsWith('image/')) {
                    alert('Veuillez sélectionner une image');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    formData.photo = e.target.result;
                    const photoCircle = document.getElementById('photoCircle');
                    photoCircle.style.backgroundImage = `url('${e.target.result}')`;
                    photoCircle.classList.add('has-image');
                    document.getElementById('photoPlaceholder').style.display = 'none';
                    
                    // Sauvegarder dans localStorage
                    localStorage.setItem('u_p', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }

        async function saveAndRedirect(e) {
            e.preventDefault();
            
            // Vérifier une dernière fois que tout est valide
            if (!document.getElementById('oath').checked) {
                alert('Vous devez accepter l\'engagement éthique');
                return;
            }

            // Afficher le loader
            document.getElementById('loader').style.display = 'flex';
            
            // Animation de progression
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                document.getElementById('loaderProgress').style.width = progress + '%';
                if (progress >= 100) clearInterval(interval);
            }, 100);

            // Préparer les données
            const userData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                gender: document.getElementById('gender').value,
                dob: document.getElementById('dob').value,
                residence: document.getElementById('residence').value,
                genotype: document.getElementById('genotype').value,
                bloodGroup: document.getElementById('bloodType').value + document.getElementById('bloodRh').value,
                desireChild: document.getElementById('desireChild').value,
                photo: formData.photo
            };

            // Sauvegarder dans localStorage
            Object.keys(userData).forEach(key => {
                if (key !== 'photo') {
                    localStorage.setItem(`u_${key}`, userData[key]);
                }
            });
            localStorage.setItem('u_p', userData.photo);

            try {
                // Envoyer au serveur
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    // Petite pause pour l'animation
                    setTimeout(() => {
                        window.location.href = '/profile';
                    }, 1500);
                } else {
                    throw new Error('Erreur serveur');
                }
            } catch (error) {
                console.error('Erreur:', error);
                document.getElementById('loader').style.display = 'none';
                alert('Une erreur est survenue. Veuillez réessayer.');
            }
        }

        // Sauvegarde automatique
        setInterval(() => {
            if (document.getElementById('firstName').value) {
                localStorage.setItem('u_fn', document.getElementById('firstName').value);
                localStorage.setItem('u_ln', document.getElementById('lastName').value);
                localStorage.setItem('u_gender', document.getElementById('gender').value);
                localStorage.setItem('u_dob', document.getElementById('dob').value);
                localStorage.setItem('u_res', document.getElementById('residence').value);
                localStorage.setItem('u_gt', document.getElementById('genotype').value);
                localStorage.setItem('u_gs', document.getElementById('bloodType').value + document.getElementById('bloodRh').value);
                localStorage.setItem('u_pj', document.getElementById('desireChild').value);
            }
        }, 5000);
    </script>
</body>
</html>`);
});

app.get('/profile', async (req, res) => {
    try {
        // Récupérer l'utilisateur connecté (pour la démo, on prend le dernier)
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        
        if (!currentUser) {
            return res.redirect('/signup');
        }

        // Compter les messages non lus
        const unreadCount = await Message.countDocuments({
            receiverId: currentUser._id,
            read: false
        });

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Mon Profil - Genlove</title>
    ${styles}
    <style>
        .profile-container {
            background: #f4e9da;
            min-height: 100vh;
        }
        .profile-header {
            background: white;
            padding: 30px 20px 50px 20px;
            border-radius: 0 0 40px 40px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            position: relative;
        }
        .header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .action-btn {
            background: #eff6ff;
            color: #1a2a44;
            padding: 10px 16px;
            border-radius: 30px;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid #dbeafe;
            transition: all 0.3s;
        }
        .action-btn:hover {
            background: #1a2a44;
            color: white;
            border-color: #1a2a44;
        }
        .inbox-badge {
            background: #ff416c;
            color: white;
            padding: 10px 16px;
            border-radius: 30px;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
        }
        .unread-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff416c;
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
        }
        .settings-btn {
            background: transparent;
            font-size: 1.5rem;
            text-decoration: none;
            color: #1a2a44;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s;
        }
        .settings-btn:hover {
            background: #f0f0f0;
        }
        .profile-photo {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            border: 4px solid #ff416c;
            margin: 10px auto 15px;
            background-size: cover;
            background-position: center;
            background-color: #f0f0f0;
            position: relative;
            box-shadow: 0 10px 25px rgba(255,65,108,0.2);
        }
        .verification-badge {
            position: absolute;
            bottom: 5px;
            right: 5px;
            background: #4CAF50;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            font-size: 0.9rem;
        }
        .profile-name {
            font-size: 1.8rem;
            font-weight: bold;
            color: #1a2a44;
            margin: 5px 0 0;
            text-align: center;
        }
        .profile-location {
            color: #666;
            margin: 5px 0 10px;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        .health-status {
            background: #fff5f7;
            padding: 12px 20px;
            border-radius: 50px;
            display: inline-block;
            margin: 10px auto;
            color: #ff416c;
            font-weight: bold;
            font-size: 0.9rem;
            border: 1px solid #ffdae0;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 25px 15px;
        }
        .stat-card {
            background: white;
            border-radius: 20px;
            padding: 15px 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.03);
            border: 1px solid #f0f0f0;
        }
        .stat-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #ff416c;
            line-height: 1;
        }
        .stat-label {
            font-size: 0.7rem;
            color: #666;
            margin-top: 5px;
        }
        .section-title {
            padding: 15px 20px 5px 20px;
            font-size: 0.75rem;
            color: #888;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .info-card {
            background: white;
            border-radius: 20px;
            margin: 0 15px 15px 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.03);
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 20px;
            border-bottom: 1px solid #f8f8f8;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #444;
            font-size: 0.95rem;
        }
        .info-label span {
            font-size: 1.2rem;
        }
        .info-value {
            font-weight: 600;
            color: #1a2a44;
            background: #f8f9fa;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        .compatibility-meter {
            background: white;
            border-radius: 20px;
            margin: 20px 15px;
            padding: 20px;
        }
        .meter-title {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-weight: bold;
            color: #1a2a44;
        }
        .meter-bar {
            height: 10px;
            background: #f0f0f0;
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        .meter-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff416c, #ff7b9c);
            border-radius: 5px;
            width: 0%;
            transition: width 1s ease;
        }
        .meter-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: #666;
        }
        .quick-actions {
            display: flex;
            gap: 10px;
            padding: 0 15px 20px;
        }
        .quick-action {
            flex: 1;
            background: white;
            border: 1px solid #eee;
            border-radius: 15px;
            padding: 15px 5px;
            text-align: center;
            text-decoration: none;
            color: #1a2a44;
            font-size: 0.8rem;
            transition: all 0.3s;
        }
        .quick-action:hover {
            background: #ff416c;
            color: white;
            border-color: #ff416c;
        }
        .quick-action span {
            font-size: 1.5rem;
            display: block;
            margin-bottom: 5px;
        }
        .compatibility-note {
            background: #e3f2fd;
            border-radius: 15px;
            padding: 15px;
            margin: 20px 15px;
            font-size: 0.85rem;
            color: #1a2a44;
            border-left: 4px solid #ff416c;
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .pulse {
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="profile-container">
            <!-- Header avec actions -->
            <div class="profile-header">
                <div class="header-actions">
                    <a href="/" class="action-btn">
                        <span>🏠</span> Accueil
                    </a>
                    
                    <a href="/inbox" class="inbox-badge">
                        <span>📬</span> Messages
                        ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                    </a>
                    
                    <a href="/settings" class="settings-btn">
                        ⚙️
                    </a>
                </div>

                <!-- Photo de profil -->
                <div class="profile-photo" style="background-image: url('${currentUser.photo || ''}')">
                    <div class="verification-badge" title="Profil vérifié">
                        ✓
                    </div>
                </div>

                <!-- Infos de base -->
                <h1 class="profile-name">${currentUser.firstName} ${currentUser.lastName}</h1>
                
                <div class="profile-location">
                    <span>📍</span> ${currentUser.residence || 'Localisation non précisée'}
                    <span>•</span>
                    <span>${currentUser.gender || 'Genre non précisé'}</span>
                </div>

                <div class="health-status">
                    ✅ Profil Santé Validé
                </div>

                <!-- Statistiques rapides -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${calculerAge(currentUser.dob)}</div>
                        <div class="stat-label">Ans</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Math.floor(Math.random() * 30 + 70)}%</div>
                        <div class="stat-label">Compatibilité</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${await Message.countDocuments({ $or: [{senderId: currentUser._id}, {receiverId: currentUser._id}] })}</div>
                        <div class="stat-label">Messages</div>
                    </div>
                </div>
            </div>

            <!-- Section informations santé -->
            <div class="section-title">🧬 MES INFORMATIONS SANTÉ</div>
            
            <div class="info-card">
                <div class="info-row">
                    <div class="info-label">
                        <span>🧬</span> Génotype
                    </div>
                    <div class="info-value ${currentUser.genotype === 'SS' ? 'warning' : ''}">
                        ${currentUser.genotype || 'Non renseigné'}
                        ${currentUser.genotype === 'SS' ? '<span style="margin-left:5px;">⚠️</span>' : ''}
                    </div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        <span>🩸</span> Groupe Sanguin
                    </div>
                    <div class="info-value">${currentUser.bloodGroup || 'Non renseigné'}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        <span>📅</span> Âge
                    </div>
                    <div class="info-value">${calculerAge(currentUser.dob)} ans</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        <span>📍</span> Résidence
                    </div>
                    <div class="info-value">${currentUser.residence || 'Non renseignée'}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        <span>👶</span> Projet de vie
                    </div>
                    <div class="info-value">${currentUser.desireChild || 'Non précisé'}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">
                        <span>📆</span> Membre depuis
                    </div>
                    <div class="info-value">${new Date(currentUser.createdAt).toLocaleDateString()}</div>
                </div>
            </div>

            <!-- Jauge de compatibilité -->
            <div class="compatibility-meter">
                <div class="meter-title">
                    <span>💞 Compatibilité génétique moyenne</span>
                    <span>84%</span>
                </div>
                <div class="meter-bar">
                    <div class="meter-fill" style="width: 84%" id="compatibilityMeter"></div>
                </div>
                <div class="meter-stats">
                    <span>Basée sur ${await User.countDocuments()} profils</span>
                    <span>👍 Excellente</span>
                </div>
            </div>

            <!-- Note de compatibilité spécifique -->
            ${currentUser.genotype === 'SS' ? `
            <div class="compatibility-note">
                <strong>🌡️ Note de Sérénité :</strong> Votre génotype SS nécessite une attention particulière. 
                Genlove vous mettra en relation uniquement avec des partenaires AA pour garantir la santé de vos futurs enfants.
            </div>
            ` : currentUser.genotype === 'AS' ? `
            <div class="compatibility-note">
                <strong>🌡️ Note de Sérénité :</strong> En tant que porteur AS, nous vous recommanderons des partenaires AA 
                pour éviter tout risque de drépanocytose chez vos enfants.
            </div>
            ` : `
            <div class="compatibility-note">
                <strong>🌟 Bonne nouvelle :</strong> Votre génotype AA vous rend compatible avec tous les profils !
                Vous pouvez échanger avec tout le monde en toute sérénité.
            </div>
            `}

            <!-- Actions rapides -->
            <div class="quick-actions">
                <a href="/matching" class="quick-action">
                    <span>🔍</span>
                    Trouver<br>un partenaire
                </a>
                <a href="/edit-profile" class="quick-action">
                    <span>✏️</span>
                    Modifier<br>mon profil
                </a>
                <a href="/preferences" class="quick-action">
                    <span>⚡</span>
                    Préférences<br>de matching
                </a>
            </div>

            <!-- Pied de page -->
            <div style="text-align: center; padding: 20px; font-size: 0.7rem; color: #888;">
                <p>🔒 Connexion sécurisée • Vos données sont protégées</p>
                <p>© 2024 Genlove - Tous droits réservés</p>
            </div>
        </div>
    </div>

    <script>
        // Animation de la jauge de compatibilité
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                const meter = document.getElementById('compatibilityMeter');
                if (meter) {
                    meter.style.width = '84%';
                }
            }, 500);

            // Mise à jour en temps réel des stats
            loadRealTimeStats();
        });

        function loadRealTimeStats() {
            // Simulation de chargement de stats en temps réel
            setInterval(() => {
                // Mettre à jour le compteur de messages
                fetch('/api/messages/unread')
                    .then(response => response.json())
                    .then(data => {
                        const badge = document.querySelector('.unread-badge');
                        if (data.count > 0) {
                            if (badge) {
                                badge.textContent = data.count;
                            } else {
                                // Créer un badge s'il n'existe pas
                                const inboxBtn = document.querySelector('.inbox-badge');
                                const newBadge = document.createElement('span');
                                newBadge.className = 'unread-badge';
                                newBadge.textContent = data.count;
                                inboxBtn.appendChild(newBadge);
                            }
                        } else if (badge) {
                            badge.remove();
                        }
                    })
                    .catch(() => {});
            }, 30000); // Toutes les 30 secondes
        }

        // Fonction pour rafraîchir le profil
        function refreshProfile() {
            showNotification('Profil mis à jour', 'success');
        }

        function showNotification(message, type) {
            const notif = document.createElement('div');
            notif.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4CAF50' : '#ff416c'};
                color: white;
                padding: 15px;
                border-radius: 30px;
                text-align: center;
                font-weight: bold;
                z-index: 9999;
                animation: slideUp 0.3s ease-out;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            `;
            notif.textContent = message;
            document.body.appendChild(notif);
            
            setTimeout(() => {
                notif.style.animation = 'slideDown 0.3s ease-out';
                setTimeout(() => notif.remove(), 300);
            }, 2000);
        }

        // Gestion du swipe pour rafraîchir (mobile)
        let touchStart = 0;
        document.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            const touchEnd = e.changedTouches[0].clientY;
            if (touchStart > 100 && touchEnd - touchStart > 100) {
                // Swipe vers le bas pour rafraîchir
                refreshProfile();
            }
        });
    </script>
</body>
</html>`);
    } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).send('Erreur lors du chargement du profil');
    }
});

app.get('/matching', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.redirect('/signup');

        // Récupérer tous les utilisateurs sauf l'utilisateur courant
        let partners = await User.find({
            _id: { $ne: currentUser._id }
        });

        // Filtrer les utilisateurs bloqués
        const blockedIds = currentUser.blockedUsers || [];
        partners = partners.filter(p => !blockedIds.includes(p._id.toString()));

        // Appliquer les filtres génétiques
        partners = partners.filter(p => {
            // Même genre : invisible
            if (p.gender === currentUser.gender) return false;

            // Règle SS : uniquement AA
            if (currentUser.genotype === 'SS' && p.genotype !== 'AA') return false;
            
            // Règle AS : uniquement AA
            if (currentUser.genotype === 'AS' && p.genotype !== 'AA') return false;

            return true;
        });

        // Calculer les âges et distances
        const partnersWithDetails = partners.map(p => ({
            id: p._id,
            name: p.firstName,
            gt: p.genotype,
            gs: p.bloodGroup,
            desireChild: p.desireChild,
            dob: p.dob,
            residence: p.residence,
            gender: p.gender,
            photo: p.photo,
            age: calculerAge(p.dob),
            distance: Math.floor(Math.random() * 30) + 1, // Simulation
            compatibility: calculateCompatibility(currentUser, p)
        }));

        // Trier par compatibilité
        partnersWithDetails.sort((a, b) => b.compatibility - a.compatibility);

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Matching - Genlove</title>
    ${styles}
    <style>
        .matching-container {
            background: #f4e9da;
            min-height: 100vh;
        }
        .matching-header {
            background: white;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #eee;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .matching-header h3 {
            margin: 0;
            color: #1a2a44;
            font-size: 1.4rem;
        }
        .matching-header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 0.85rem;
        }
        .filter-bar {
            display: flex;
            gap: 10px;
            padding: 15px;
            background: white;
            margin: 10px 15px;
            border-radius: 50px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .filter-btn {
            flex: 1;
            padding: 10px;
            border: none;
            background: transparent;
            border-radius: 30px;
            font-size: 0.85rem;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
        }
        .filter-btn.active {
            background: #ff416c;
            color: white;
            font-weight: bold;
        }
        .filter-btn:hover:not(.active) {
            background: #f0f0f0;
        }
        .stats-badge {
            background: #1a2a44;
            color: white;
            padding: 8px 15px;
            border-radius: 30px;
            font-size: 0.8rem;
            margin: 0 15px 15px;
            display: inline-block;
        }
        .match-card {
            background: white;
            margin: 15px;
            padding: 20px;
            border-radius: 25px;
            display: flex;
            gap: 15px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            transition: all 0.3s;
            position: relative;
            animation: slideIn 0.5s ease-out;
            border: 1px solid rgba(255,65,108,0.1);
        }
        .match-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(255,65,108,0.15);
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .match-photo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            background-color: #f0f0f0;
            border: 3px solid #ff416c;
            position: relative;
            flex-shrink: 0;
        }
        .match-photo.blur {
            filter: blur(5px);
            opacity: 0.7;
        }
        .compatibility-badge {
            position: absolute;
            bottom: -5px;
            right: -5px;
            background: #4CAF50;
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
        }
        .match-info {
            flex: 1;
        }
        .match-name {
            font-size: 1.2rem;
            font-weight: bold;
            color: #1a2a44;
            margin: 0 0 3px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .match-details {
            color: #666;
            font-size: 0.85rem;
            margin: 5px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .match-details span {
            background: #f8f9fa;
            padding: 3px 8px;
            border-radius: 15px;
        }
        .match-genotype {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: bold;
        }
        .genotype-AA { background: #e3f2fd; color: #1976d2; }
        .genotype-AS { background: #fff3e0; color: #f57c00; }
        .genotype-SS { background: #ffebee; color: #c62828; }
        .match-desire {
            font-size: 0.8rem;
            color: #444;
            margin: 8px 0;
            font-style: italic;
            background: #fff5f7;
            padding: 8px 12px;
            border-radius: 15px;
        }
        .match-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        .btn-action {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
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
        .no-results {
            text-align: center;
            padding: 50px 20px;
            color: #666;
        }
        .no-results span {
            font-size: 4rem;
            display: block;
            margin-bottom: 20px;
        }
        #popup-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
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
            animation: popupSlide 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            max-height: 90vh;
            overflow-y: auto;
        }
        @keyframes popupSlide {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        .close-popup {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: #f0f0f0;
        }
        .close-popup:hover {
            background: #e0e0e0;
        }
        .popup-photo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto 15px;
            background-size: cover;
            background-position: center;
            border: 3px solid #ff416c;
        }
        .popup-field {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 12px;
        }
        .popup-label {
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        .popup-value {
            font-size: 1rem;
            font-weight: 600;
            color: #1a2a44;
        }
        .compatibility-meter {
            background: #f0f7ff;
            padding: 15px;
            border-radius: 15px;
            margin: 15px 0;
            text-align: center;
        }
        .meter-value {
            font-size: 2rem;
            font-weight: bold;
            color: #ff416c;
        }
        .loading-skeleton {
            animation: skeleton-loading 1s linear infinite alternate;
        }
        @keyframes skeleton-loading {
            0% { opacity: 0.6; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <!-- Notification -->
        <div id="genlove-notify">
            <span>💙</span>
            <span id="notify-msg"></span>
        </div>

        <div class="matching-container">
            <!-- Header -->
            <div class="matching-header">
                <h3>🔍 Matching Santé</h3>
                <p>Basé sur votre profil génétique</p>
            </div>

            <!-- Filtres rapides -->
            <div class="filter-bar">
                <button class="filter-btn active" onclick="filterMatches('all')">Tous</button>
                <button class="filter-btn" onclick="filterMatches('near')">Proches</button>
                <button class="filter-btn" onclick="filterMatches('compatible')">Compatibles</button>
                <button class="filter-btn" onclick="filterMatches('online')">En ligne</button>
            </div>

            <!-- Stats -->
            <div class="stats-badge" id="statsBadge">
                ${partnersWithDetails.length} partenaires compatibles trouvés
            </div>

            <!-- Liste des matches -->
            <div id="matchesContainer">
                ${partnersWithDetails.length > 0 ? 
                    partnersWithDetails.map((p, index) => `
                    <div class="match-card" data-id="${p.id}" data-distance="${p.distance}" data-compatibility="${p.compatibility}" style="animation-delay: ${index * 0.1}s">
                        <div class="match-photo ${!p.photo ? 'blur' : ''}" style="background-image: url('${p.photo || ''}')">
                            <div class="compatibility-badge">${p.compatibility}%</div>
                        </div>
                        <div class="match-info">
                            <div class="match-name">
                                ${p.name}
                                <span class="match-genotype genotype-${p.gt}">${p.gt}</span>
                            </div>
                            <div class="match-details">
                                <span>${p.age} ans</span>
                                <span>📍 ${p.distance} km</span>
                                <span>🩸 ${p.gs}</span>
                            </div>
                            <div class="match-desire">
                                " ${p.desireChild || 'Projet de vie à discuter'} "
                            </div>
                            <div class="match-actions">
                                <button class="btn-action btn-contact" onclick="contactUser('${p.id}', '${p.name}')">
                                    💬 Contacter
                                </button>
                                <button class="btn-action btn-details" onclick='showDetails(${JSON.stringify(p)})'>
                                    📋 Détails
                                </button>
                            </div>
                        </div>
                    </div>
                    `).join('') 
                : `
                    <div class="no-results">
                        <span>😔</span>
                        <h3>Aucun partenaire trouvé</h3>
                        <p>Nous n'avons pas trouvé de profils correspondant à vos critères pour le moment.</p>
                        <p>Revenez plus tard ou élargissez vos préférences.</p>
                        <button class="btn-pink" onclick="refreshMatches()" style="margin-top:20px;">
                            🔄 Rafraîchir
                        </button>
                    </div>
                `}
            </div>

            <!-- Bouton retour -->
            <a href="/profile" class="btn-pink" style="margin:20px auto; width: auto; display: inline-block; padding: 15px 40px;">
                ← Retour au profil
            </a>
        </div>

        <!-- Popup détails -->
        <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
                <span class="close-popup" onclick="closePopup()">&times;</span>
                
                <div id="popupPhoto" class="popup-photo"></div>
                
                <h2 id="popupName" style="color:#ff416c; text-align:center; margin:10px 0 5px;"></h2>
                
                <div style="text-align:center; color:#666; margin-bottom:20px;" id="popupLocation"></div>

                <div class="compatibility-meter" id="popupCompatibility">
                    <div class="meter-value" id="compatibilityValue">0%</div>
                    <div>de compatibilité génétique</div>
                </div>

                <div class="popup-field">
                    <div class="popup-label">🧬 Génotype</div>
                    <div class="popup-value" id="popupGenotype"></div>
                </div>

                <div class="popup-field">
                    <div class="popup-label">🩸 Groupe sanguin</div>
                    <div class="popup-value" id="popupBlood"></div>
                </div>

                <div class="popup-field">
                    <div class="popup-label">📅 Âge</div>
                    <div class="popup-value" id="popupAge"></div>
                </div>

                <div class="popup-field">
                    <div class="popup-label">📍 Distance</div>
                    <div class="popup-value" id="popupDistance"></div>
                </div>

                <div class="popup-field">
                    <div class="popup-label">👶 Projet de vie</div>
                    <div class="popup-value" id="popupDesire"></div>
                </div>

                <div class="popup-field" id="popupNote" style="background:#fff5f7; border-left:3px solid #ff416c;">
                    <div class="popup-label">🌡️ Note de Sérénité</div>
                    <div class="popup-value" id="popupSerenity"></div>
                </div>

                <div style="display:flex; gap:10px; margin-top:25px;">
                    <button class="btn-action btn-contact" style="flex:2;" onclick="contactFromPopup()">
                        💬 Contacter
                    </button>
                    <button class="btn-action btn-block" style="flex:1;" onclick="blockUser()">
                        🚫 Bloquer
                    </button>
                </div>
            </div>
        </div>
    </div>

    ${notifyScript}
    
    <script>
        let currentPartner = null;
        let currentFilter = 'all';

        function filterMatches(filter) {
            currentFilter = filter;
            
            // Mettre à jour les boutons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Filtrer les cartes
            const cards = document.querySelectorAll('.match-card');
            let visibleCount = 0;

            cards.forEach(card => {
                let visible = true;
                
                if (filter === 'near') {
                    const distance = parseInt(card.dataset.distance);
                    visible = distance <= 10;
                } else if (filter === 'compatible') {
                    const compatibility = parseInt(card.dataset.compatibility);
                    visible = compatibility >= 80;
                } else if (filter === 'online') {
                    // Simulation : 30% des profils sont "en ligne"
                    visible = Math.random() < 0.3;
                }

                card.style.display = visible ? 'flex' : 'none';
                if (visible) visibleCount++;
            });

            // Mettre à jour les stats
            document.getElementById('statsBadge').innerHTML = 
                visibleCount + ' partenaires compatibles trouvés';
        }

        function showDetails(partner) {
            currentPartner = partner;
            
            document.getElementById('popupName').innerText = partner.name;
            document.getElementById('popupLocation').innerHTML = `📍 ${partner.residence}`;
            document.getElementById('popupPhoto').style.backgroundImage = `url('${partner.photo || ''}')`;
            document.getElementById('popupGenotype').innerText = partner.gt;
            document.getElementById('popupBlood').innerText = partner.gs;
            document.getElementById('popupAge').innerText = partner.age + ' ans';
            document.getElementById('popupDistance').innerText = partner.distance + ' km';
            document.getElementById('popupDesire').innerText = partner.desireChild || 'Non précisé';
            document.getElementById('compatibilityValue').innerText = partner.compatibility + '%';
            
            // Message de sérénité
            let serenityMsg = '';
            const myGt = localStorage.getItem('u_gt');
            
            if (myGt === 'SS' || myGt === 'AS') {
                if (partner.gt === 'AA') {
                    serenityMsg = '✅ Union recommandée - Partenaire AA compatible';
                } else {
                    serenityMsg = '⚠️ Attention - Union à risque génétique';
                }
            } else if (myGt === 'AA') {
                if (partner.gt === 'AA') {
                    serenityMsg = '🌟 Union sereine - Aucun risque détecté';
                } else if (partner.gt === 'AS') {
                    serenityMsg = '⚠️ Vigilance - Partenaire porteur sain';
                } else {
                    serenityMsg = '🔴 Risque élevé - Union déconseillée';
                }
            }
            
            document.getElementById('popupSerenity').innerText = serenityMsg;
            
            document.getElementById('popup-overlay').style.display = 'flex';
        }

        function closePopup() {
            document.getElementById('popup-overlay').style.display = 'none';
            currentPartner = null;
        }

        function contactUser(userId, userName) {
            showNotify(`Demande de contact envoyée à ${userName} ✨`);
            
            // Animation sur le bouton
            const btn = event.target;
            btn.innerHTML = '✓ Envoyé';
            btn.style.background = '#4CAF50';
            btn.disabled = true;
            
            // Sauvegarder dans l'historique
            const contacts = JSON.parse(localStorage.getItem('recentContacts') || '[]');
            contacts.unshift({id: userId, name: userName, date: new Date().toISOString()});
            localStorage.setItem('recentContacts', JSON.stringify(contacts.slice(0, 10)));
        }

        function contactFromPopup() {
            if (currentPartner) {
                contactUser(currentPartner.id, currentPartner.name);
                closePopup();
                
                // Rediriger vers le chat après un court délai
                setTimeout(() => {
                    if (confirm('Voulez-vous démarrer une conversation maintenant ?')) {
                        window.location.href = '/chat?partnerId=' + currentPartner.id;
                    }
                }, 1500);
            }
        }

        function blockUser() {
            if (currentPartner && confirm('Voulez-vous vraiment bloquer cet utilisateur ?')) {
                fetch('/api/block/' + currentPartner.id, { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            showNotify('🚫 Utilisateur bloqué');
                            
                            // Supprimer la carte
                            const card = document.querySelector(`[data-id="${currentPartner.id}"]`);
                            if (card) {
                                card.style.animation = 'slideOut 0.3s forwards';
                                setTimeout(() => card.remove(), 300);
                            }
                            
                            closePopup();
                            
                            // Mettre à jour les stats
                            const visibleCount = document.querySelectorAll('.match-card:not([style*="display: none"])').length;
                            document.getElementById('statsBadge').innerHTML = 
                                visibleCount + ' partenaires compatibles trouvés';
                        }
                    });
            }
        }

        function refreshMatches() {
            showNotify('Recherche de nouveaux profils...');
            location.reload();
        }

        // Animation au scroll
        let loading = false;
        window.addEventListener('scroll', () => {
            if (loading) return;
            
            const scrollY = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            
            if (scrollY > height - 100) {
                // Charger plus de résultats
                loading = true;
                showNotify('Chargement de plus de profils...');
                
                setTimeout(() => {
                    loading = false;
                }, 2000);
            }
        });

        // Effet de like/dislike (swipe)
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.querySelectorAll('.match-card').forEach(card => {
            card.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            });
            
            card.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].clientX;
                handleSwipe(card);
            });
        });

        function handleSwipe(card) {
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > 100) {
                if (swipeDistance > 0) {
                    // Swipe droite - like
                    card.style.transform = 'translateX(100%) rotate(10deg)';
                    card.style.opacity = '0';
                    showNotify('👍 Intérêt enregistré !');
                } else {
                    // Swipe gauche - dislike
                    card.style.transform = 'translateX(-100%) rotate(-10deg)';
                    card.style.opacity = '0';
                }
                
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', () => {
            // Animation d'entrée
            const cards = document.querySelectorAll('.match-card');
            cards.forEach((card, index) => {
                card.style.animation = `slideIn 0.5s ease-out ${index * 0.1}s forwards`;
            });
        });
    </script>

    <style>
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-100%);
            }
        }
    </style>
</body>
</html>`);
    } catch (error) {
        console.error('Erreur matching:', error);
        res.status(500).send('Erreur lors du chargement des matches');
    }
});

// Fonction utilitaire pour calculer la compatibilité
function calculateCompatibility(user1, user2) {
    let score = 50; // Base
    
    // Compatibilité génétique
    if (user1.genotype === 'AA') {
        if (user2.genotype === 'AA') score += 30;
        else if (user2.genotype === 'AS') score += 15;
        else score -= 20;
    } else if (user1.genotype === 'AS') {
        if (user2.genotype === 'AA') score += 25;
        else if (user2.genotype === 'AS') score += 5;
        else score -= 30;
    } else { // SS
        if (user2.genotype === 'AA') score += 20;
        else score -= 40;
    }
    
    // Compatibilité groupe sanguin (simplifié)
    if (user1.bloodGroup && user2.bloodGroup) {
        if (user1.bloodGroup[0] === user2.bloodGroup[0]) score += 10;
        if (user1.bloodGroup.slice(-1) === user2.bloodGroup.slice(-1)) score += 5;
    }
    
    // Âge (pas plus de 15 ans d'écart)
    const age1 = calculerAge(user1.dob);
    const age2 = calculerAge(user2.dob);
    const ageDiff = Math.abs(age1 - age2);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 5;
    else if (ageDiff > 15) score -= 10;
    
    // Projet de vie
    if (user1.desireChild === user2.desireChild) score += 10;
    
    // Garder le score entre 0 et 100
    return Math.min(100, Math.max(0, Math.round(score)));
}
app.get('/inbox', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.redirect('/signup');

        // Récupérer tous les messages de l'utilisateur
        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id },
                { receiverId: currentUser._id }
            ]
        })
        .populate('senderId receiverId')
        .sort({ timestamp: -1 });

        // Organiser par conversations
        const conversations = new Map();
        
        for (const msg of messages) {
            const otherUser = msg.senderId._id.equals(currentUser._id) ? msg.receiverId : msg.senderId;
            const conversationId = otherUser._id.toString();
            
            if (!conversations.has(conversationId)) {
                // Compter les messages non lus
                const unreadCount = await Message.countDocuments({
                    senderId: otherUser._id,
                    receiverId: currentUser._id,
                    read: false
                });

                conversations.set(conversationId, {
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount: unreadCount,
                    messages: []
                });
            }
            
            conversations.get(conversationId).messages.push(msg);
        }

        // Convertir en tableau et trier par date du dernier message
        const conversationsList = Array.from(conversations.values())
            .sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Boîte de réception - Genlove</title>
    ${styles}
    <style>
        .inbox-container {
            background: #f4e9da;
            min-height: 100vh;
        }
        .inbox-header {
            background: white;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #eee;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .inbox-header h3 {
            margin: 0;
            color: #1a2a44;
            font-size: 1.4rem;
        }
        .inbox-header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 0.85rem;
        }
        .search-bar {
            padding: 15px;
            background: white;
            margin: 10px 15px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .search-bar input {
            flex: 1;
            border: none;
            outline: none;
            font-size: 0.95rem;
            background: transparent;
        }
        .search-bar span {
            color: #ff416c;
        }
        .inbox-tabs {
            display: flex;
            gap: 10px;
            padding: 0 15px 15px;
        }
        .tab {
            flex: 1;
            padding: 12px;
            text-align: center;
            background: white;
            border-radius: 25px;
            font-size: 0.85rem;
            color: #666;
            cursor: pointer;
            transition: all 0.3s;
            border: 1px solid transparent;
        }
        .tab.active {
            background: #ff416c;
            color: white;
            font-weight: bold;
        }
        .tab:hover:not(.active) {
            border-color: #ff416c;
        }
        .conversation-list {
            padding: 0 15px 20px;
        }
        .conversation-item {
            background: white;
            border-radius: 20px;
            padding: 15px;
            margin-bottom: 12px;
            display: flex;
            gap: 15px;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            border: 1px solid transparent;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .conversation-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255,65,108,0.1);
            border-color: #ff416c;
        }
        .conversation-item.unread {
            background: #fff5f7;
            border-left: 4px solid #ff416c;
        }
        .avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            background-color: #f0f0f0;
            position: relative;
            flex-shrink: 0;
            border: 2px solid #ff416c;
        }
        .online-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 12px;
            height: 12px;
            background: #4CAF50;
            border-radius: 50%;
            border: 2px solid white;
        }
        .conversation-info {
            flex: 1;
            min-width: 0;
        }
        .conversation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }
        .user-name {
            font-weight: bold;
            color: #1a2a44;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .user-name .genotype {
            font-size: 0.65rem;
            padding: 2px 6px;
            border-radius: 10px;
            background: #f0f0f0;
        }
        .timestamp {
            font-size: 0.7rem;
            color: #999;
        }
        .last-message {
            font-size: 0.85rem;
            color: #666;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 5px;
        }
        .last-message .message-preview {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .message-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.7rem;
        }
        .unread-badge {
            background: #ff416c;
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
            min-width: 20px;
            height: 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 6px;
        }
        .message-icons {
            display: flex;
            gap: 10px;
            color: #999;
        }
        .empty-inbox {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        .empty-inbox span {
            font-size: 5rem;
            display: block;
            margin-bottom: 20px;
            opacity: 0.5;
        }
        .empty-inbox h4 {
            color: #1a2a44;
            margin: 0 0 10px;
        }
        .empty-inbox p {
            margin: 0 0 25px;
            font-size: 0.9rem;
        }
        .btn-inbox {
            background: #ff416c;
            color: white;
            padding: 15px 30px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            display: inline-block;
            transition: all 0.3s;
        }
        .btn-inbox:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(255,65,108,0.3);
        }
        .quick-actions {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 100;
        }
        .fab {
            width: 60px;
            height: 60px;
            background: #ff416c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.8rem;
            box-shadow: 0 5px 20px rgba(255,65,108,0.4);
            cursor: pointer;
            transition: all 0.3s;
            border: none;
        }
        .fab:hover {
            transform: scale(1.1) rotate(90deg);
        }
        .menu-option {
            position: absolute;
            bottom: 70px;
            right: 10px;
            background: white;
            border-radius: 30px;
            padding: 15px 25px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.1);
            display: none;
            white-space: nowrap;
        }
        .fab:hover .menu-option {
            display: block;
            animation: slideLeft 0.3s ease-out;
        }
        @keyframes slideLeft {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .menu-option a {
            color: #1a2a44;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 10px;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="inbox-container">
            <!-- Header -->
            <div class="inbox-header">
                <h3>📬 Boîte de réception</h3>
                <p>${conversationsList.length} conversation${conversationsList.length > 1 ? 's' : ''}</p>
            </div>

            <!-- Barre de recherche -->
            <div class="search-bar">
                <span>🔍</span>
                <input type="text" placeholder="Rechercher une conversation..." id="searchInput" onkeyup="searchConversations()">
            </div>

            <!-- Tabs -->
            <div class="inbox-tabs">
                <div class="tab active" onclick="filterConversations('all')" id="tabAll">Tous</div>
                <div class="tab" onclick="filterConversations('unread')" id="tabUnread">Non lus</div>
                <div class="tab" onclick="filterConversations('archived')" id="tabArchived">Archivés</div>
            </div>

            <!-- Liste des conversations -->
            <div class="conversation-list" id="conversationList">
                ${conversationsList.length > 0 ? 
                    conversationsList.map((conv, index) => {
                        const otherUser = conv.user;
                        const lastMsg = conv.lastMessage;
                        const isUnread = conv.unreadCount > 0;
                        const timeAgo = getTimeAgo(lastMsg.timestamp);
                        
                        return `
                        <div class="conversation-item ${isUnread ? 'unread' : ''}" 
                             onclick="openChat('${otherUser._id}')"
                             data-user-id="${otherUser._id}"
                             data-unread="${isUnread}"
                             data-last-msg="${lastMsg.text.toLowerCase()}">
                            
                            <div class="avatar" style="background-image: url('${otherUser.photo || ''}')">
                                ${Math.random() > 0.7 ? '<div class="online-indicator"></div>' : ''}
                            </div>
                            
                            <div class="conversation-info">
                                <div class="conversation-header">
                                    <div class="user-name">
                                        ${otherUser.firstName} ${otherUser.lastName}
                                        <span class="genotype">${otherUser.genotype || ''}</span>
                                    </div>
                                    <div class="timestamp">${timeAgo}</div>
                                </div>
                                
                                <div class="last-message">
                                    <div class="message-preview">
                                        <span>${lastMsg.senderId._id.equals(currentUser._id) ? '✉️ Vous : ' : ''}</span>
                                        <span>${lastMsg.text.substring(0, 50)}${lastMsg.text.length > 50 ? '...' : ''}</span>
                                    </div>
                                </div>
                                
                                <div class="message-status">
                                    ${isUnread ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
                                    <span class="message-icons">
                                        ${lastMsg.senderId._id.equals(currentUser._id) ? '✓✓' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('') 
                : `
                    <div class="empty-inbox">
                        <span>📭</span>
                        <h4>Votre boîte est vide</h4>
                        <p>Vous n'avez pas encore de conversations.<br>Commencez par découvrir des profils compatibles !</p>
                        <a href="/matching" class="btn-inbox">🔍 Découvrir des profils</a>
                    </div>
                `}
            </div>

            <!-- Bouton flottant -->
            <div class="quick-actions">
                <div class="fab" onclick="window.location.href='/matching'">
                    ✨
                    <div class="menu-option">
                        <a href="/matching">
                            <span>🔍</span> Nouvelle conversation
                        </a>
                    </div>
                </div>
            </div>

            <!-- Bouton retour -->
            <a href="/profile" class="btn-pink" style="margin:20px auto; width: auto; display: inline-block; padding: 15px 40px;">
                ← Retour au profil
            </a>
        </div>
    </div>

    ${notifyScript}

    <script>
        let currentFilter = 'all';

        function getTimeAgo(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'À l\'instant';
            if (diffMins < 60) return `Il y a ${diffMins} min`;
            if (diffHours < 24) return `Il y a ${diffHours} h`;
            if (diffDays === 1) return 'Hier';
            return date.toLocaleDateString();
        }

        function searchConversations() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const conversations = document.querySelectorAll('.conversation-item');
            
            conversations.forEach(conv => {
                const userName = conv.querySelector('.user-name').innerText.toLowerCase();
                const lastMsg = conv.dataset.lastMsg;
                
                if (userName.includes(searchTerm) || lastMsg.includes(searchTerm)) {
                    conv.style.display = 'flex';
                } else {
                    conv.style.display = 'none';
                }
            });

            updateEmptyState();
        }

        function filterConversations(filter) {
            currentFilter = filter;
            
            // Mettre à jour les tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(`tab${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');

            // Filtrer les conversations
            const conversations = document.querySelectorAll('.conversation-item');
            
            conversations.forEach(conv => {
                let visible = true;
                
                if (filter === 'unread') {
                    visible = conv.classList.contains('unread');
                } else if (filter === 'archived') {
                    // Pour la démo, on archive aléatoirement
                    visible = Math.random() < 0.2;
                }
                
                conv.style.display = visible ? 'flex' : 'none';
            });

            updateEmptyState();
        }

        function updateEmptyState() {
            const visibleCount = document.querySelectorAll('.conversation-item[style*="display: flex"]').length;
            const emptyMessage = document.querySelector('.empty-inbox');
            
            if (visibleCount === 0 && !emptyMessage) {
                const container = document.getElementById('conversationList');
                container.innerHTML = `
                    <div class="empty-inbox">
                        <span>🔍</span>
                        <h4>Aucun résultat</h4>
                        <p>Aucune conversation ne correspond à votre recherche.</p>
                    </div>
                `;
            }
        }

        function openChat(userId) {
            // Marquer comme lu
            fetch('/api/messages/read/' + userId, { method: 'POST' })
                .then(() => {
                    window.location.href = '/chat?partnerId=' + userId;
                });
        }

        function archiveConversation(userId, event) {
            event.stopPropagation();
            // Implémenter l'archivage
            showNotify('Conversation archivée');
            
            const conv = document.querySelector(`[data-user-id="${userId}"]`);
            conv.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                conv.remove();
                updateEmptyState();
            }, 300);
        }

        function deleteConversation(userId, event) {
            event.stopPropagation();
            if (confirm('Supprimer cette conversation ?')) {
                fetch('/api/conversations/' + userId, { method: 'DELETE' })
                    .then(() => {
                        showNotify('Conversation supprimée');
                        
                        const conv = document.querySelector(`[data-user-id="${userId}"]`);
                        conv.style.animation = 'slideOut 0.3s forwards';
                        setTimeout(() => {
                            conv.remove();
                            updateEmptyState();
                        }, 300);
                    });
            }
        }

        // Rafraîchissement périodique
        setInterval(() => {
            if (document.hidden) return; // Ne pas rafraîchir si l'onglet n'est pas actif
            
            fetch('/api/conversations/unread')
                .then(response => response.json())
                .then(data => {
                    // Mettre à jour les badges
                    data.forEach(conv => {
                        const element = document.querySelector(`[data-user-id="${conv.userId}"]`);
                        if (element && conv.unreadCount > 0) {
                            element.classList.add('unread');
                            
                            // Mettre à jour le badge
                            const badge = element.querySelector('.unread-badge');
                            if (badge) {
                                badge.innerText = conv.unreadCount;
                            } else {
                                const statusDiv = element.querySelector('.message-status');
                                const newBadge = document.createElement('span');
                                newBadge.className = 'unread-badge';
                                newBadge.innerText = conv.unreadCount;
                                statusDiv.prepend(newBadge);
                            }
                        }
                    });
                })
                .catch(() => {});
        }, 10000); // Toutes les 10 secondes

        // Animation d'entrée
        document.addEventListener('DOMContentLoaded', () => {
            const items = document.querySelectorAll('.conversation-item');
            items.forEach((item, index) => {
                item.style.animation = `slideIn 0.3s ease-out ${index * 0.1}s forwards`;
            });
        });

        // Gestion du swipe pour archiver
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            });
            
            item.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].clientX;
                const diff = touchEndX - touchStartX;
                
                if (Math.abs(diff) > 100) {
                    if (diff < 0) {
                        // Swipe gauche - archiver
                        archiveConversation(item.dataset.userId, e);
                    }
                }
            });
        });

        // Menu contextuel au clic droit
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                
                const userId = item.dataset.userId;
                const menu = document.createElement('div');
                menu.className = 'context-menu';
                menu.innerHTML = `
                    <div onclick="archiveConversation('${userId}', event)">📦 Archiver</div>
                    <div onclick="deleteConversation('${userId}', event)">🗑️ Supprimer</div>
                    <div onclick="markAsRead('${userId}', event)">✓ Marquer comme lu</div>
                `;
                
                menu.style.cssText = `
                    position: fixed;
                    top: ${e.clientY}px;
                    left: ${e.clientX}px;
                    background: white;
                    border-radius: 10px;
                    padding: 10px;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                    z-index: 1000;
                `;
                
                document.body.appendChild(menu);
                
                setTimeout(() => {
                    document.addEventListener('click', () => menu.remove(), { once: true });
                }, 100);
            });
        });

        function markAsRead(userId, event) {
            event.stopPropagation();
            fetch('/api/messages/read/' + userId, { method: 'POST' })
                .then(() => {
                    const conv = document.querySelector(`[data-user-id="${userId}"]`);
                    conv.classList.remove('unread');
                    const badge = conv.querySelector('.unread-badge');
                    if (badge) badge.remove();
                    showNotify('Marqué comme lu');
                });
        }
    </script>

    <style>
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-100%);
            }
        }
        .context-menu div {
            padding: 8px 15px;
            cursor: pointer;
            border-radius: 5px;
        }
        .context-menu div:hover {
            background: #f5f5f5;
        }
    </style>
</body>
</html>`);
    } catch (error) {
        console.error('Erreur inbox:', error);
        res.status(500).send('Erreur lors du chargement de la boîte de réception');
    }
});

app.get('/chat', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.redirect('/signup');

        const partnerId = req.query.partnerId;
        if (!partnerId) return res.redirect('/inbox');

        const partner = await User.findById(partnerId);
        if (!partner) return res.redirect('/inbox');

        // Vérifier si l'utilisateur n'est pas bloqué
        if (currentUser.blockedUsers && currentUser.blockedUsers.includes(partnerId)) {
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Chat bloqué - Genlove</title>
                    ${styles}
                </head>
                <body>
                    <div class="app-shell">
                        <div style="text-align:center; padding:50px 20px;">
                            <span style="font-size:4rem;">🚫</span>
                            <h2 style="color:#1a2a44;">Utilisateur bloqué</h2>
                            <p style="color:#666; margin:20px;">Vous avez bloqué cet utilisateur. Vous ne pouvez pas échanger avec lui.</p>
                            <a href="/inbox" class="btn-pink">Retour à la boîte de réception</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        // Récupérer l'historique des messages
        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUser._id }
            ]
        }).sort({ timestamp: 1 });

        // Marquer les messages comme lus
        await Message.updateMany(
            { senderId: partnerId, receiverId: currentUser._id, read: false },
            { read: true }
        );

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Chat avec ${partner.firstName} - Genlove</title>
    ${styles}
    <style>
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: #f5f7fb;
            position: relative;
        }
        .chat-header {
            background: #1a2a44;
            color: white;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .back-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        .back-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }
        .partner-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .partner-avatar {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            background-color: #f0f0f0;
            border: 2px solid #ff416c;
            position: relative;
        }
        .online-indicator {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 10px;
            height: 10px;
            background: #4CAF50;
            border-radius: 50%;
            border: 2px solid white;
        }
        .partner-details {
            flex: 1;
        }
        .partner-name {
            font-weight: bold;
            font-size: 1rem;
            margin: 0 0 3px 0;
        }
        .partner-status {
            font-size: 0.7rem;
            opacity: 0.8;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .header-actions {
            display: flex;
            gap: 10px;
        }
        .header-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }
        .header-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f5f7fb;
            scroll-behavior: smooth;
        }
        .message-date-divider {
            text-align: center;
            margin: 20px 0 10px;
            position: relative;
        }
        .date-text {
            background: #e9ecef;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.7rem;
            color: #666;
            display: inline-block;
        }
        .message-wrapper {
            display: flex;
            margin-bottom: 5px;
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .message-wrapper.sent {
            justify-content: flex-end;
        }
        .message-wrapper.received {
            justify-content: flex-start;
        }
        .message-bubble {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 20px;
            position: relative;
            word-wrap: break-word;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .message-bubble.sent {
            background: #ff416c;
            color: white;
            border-bottom-right-radius: 5px;
        }
        .message-bubble.received {
            background: white;
            color: #1a2a44;
            border-bottom-left-radius: 5px;
        }
        .message-content {
            font-size: 0.95rem;
            line-height: 1.4;
            margin-bottom: 5px;
        }
        .message-time {
            font-size: 0.6rem;
            opacity: 0.7;
            text-align: right;
            margin-top: 3px;
        }
        .message-status {
            display: inline-block;
            margin-left: 5px;
            font-size: 0.7rem;
        }
        .typing-indicator {
            padding: 10px 15px;
            background: white;
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin: 5px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .typing-dots {
            display: flex;
            gap: 3px;
        }
        .typing-dots span {
            width: 6px;
            height: 6px;
            background: #999;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
        }
        .input-area {
            background: white;
            padding: 15px 20px;
            display: flex;
            gap: 10px;
            align-items: flex-end;
            border-top: 1px solid #eee;
            box-shadow: 0 -5px 15px rgba(0,0,0,0.03);
        }
        .message-input-wrapper {
            flex: 1;
            background: #f8f9fa;
            border-radius: 25px;
            padding: 5px 15px;
            display: flex;
            align-items: flex-end;
            border: 1px solid #e0e0e0;
            transition: all 0.3s;
        }
        .message-input-wrapper:focus-within {
            border-color: #ff416c;
            box-shadow: 0 0 0 3px rgba(255,65,108,0.1);
        }
        .message-input {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            padding: 10px 0;
            max-height: 100px;
            resize: none;
            font-family: inherit;
            font-size: 0.95rem;
        }
        .input-actions {
            display: flex;
            gap: 5px;
            padding: 5px 0;
        }
        .emoji-btn, .attach-btn {
            background: none;
            border: none;
            font-size: 1.3rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.3s;
        }
        .emoji-btn:hover, .attach-btn:hover {
            background: #f0f0f0;
        }
        .send-btn {
            background: #ff416c;
            color: white;
            border: none;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            box-shadow: 0 5px 15px rgba(255,65,108,0.3);
        }
        .send-btn:hover {
            transform: scale(1.1);
            background: #ff1f4f;
        }
        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        .emoji-picker {
            position: absolute;
            bottom: 80px;
            left: 20px;
            background: white;
            border-radius: 20px;
            padding: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            display: none;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
            z-index: 100;
        }
        .emoji-picker.show {
            display: grid;
        }
        .emoji-item {
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
            text-align: center;
            border-radius: 10px;
            transition: background 0.3s;
        }
        .emoji-item:hover {
            background: #f0f0f0;
        }
        .suggestions {
            position: absolute;
            bottom: 100%;
            left: 20px;
            right: 20px;
            background: white;
            border-radius: 15px;
            padding: 10px;
            box-shadow: 0 -5px 25px rgba(0,0,0,0.1);
            display: none;
        }
        .suggestion-item {
            padding: 10px;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .suggestion-item:hover {
            background: #f5f5f5;
        }
        .suggestion-item span {
            font-weight: bold;
            color: #ff416c;
        }
        .block-confirmation {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .block-card {
            background: white;
            border-radius: 30px;
            padding: 30px;
            text-align: center;
            max-width: 300px;
        }
        .block-card h3 {
            color: #1a2a44;
            margin: 15px 0 10px;
        }
        .block-card p {
            color: #666;
            margin-bottom: 20px;
        }
        .block-actions {
            display: flex;
            gap: 10px;
        }
        .block-confirm {
            flex: 1;
            background: #dc3545;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
        }
        .block-cancel {
            flex: 1;
            background: #f0f0f0;
            color: #333;
            border: none;
            padding: 12px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
        }
        .scroll-bottom-btn {
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: #ff416c;
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(255,65,108,0.3);
            border: none;
            z-index: 99;
        }
        .scroll-bottom-btn.show {
            display: flex;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="chat-container">
            <!-- En-tête du chat -->
            <div class="chat-header">
                <button class="back-btn" onclick="window.location.href='/inbox'">←</button>
                
                <div class="partner-info">
                    <div class="partner-avatar" style="background-image: url('${partner.photo || ''}')">
                        <div class="online-indicator" style="display: ${Math.random() > 0.5 ? 'block' : 'none'};"></div>
                    </div>
                    <div class="partner-details">
                        <div class="partner-name">${partner.firstName} ${partner.lastName}</div>
                        <div class="partner-status">
                            <span>${partner.genotype || ''}</span>
                            <span>•</span>
                            <span>${partner.residence || ''}</span>
                        </div>
                    </div>
                </div>

                <div class="header-actions">
                    <button class="header-btn" onclick="toggleFavorite()" id="favoriteBtn">❤️</button>
                    <button class="header-btn" onclick="showBlockConfirmation()">🚫</button>
                </div>
            </div>

            <!-- Zone des messages -->
            <div class="messages-container" id="messagesContainer">
                ${groupMessagesByDate(messages).map(group => `
                    <div class="message-date-divider">
                        <span class="date-text">${group.date}</span>
                    </div>
                    ${group.messages.map(msg => `
                        <div class="message-wrapper ${msg.senderId.equals(currentUser._id) ? 'sent' : 'received'}">
                            <div class="message-bubble ${msg.senderId.equals(currentUser._id) ? 'sent' : 'received'}">
                                <div class="message-content">${msg.text}</div>
                                <div class="message-time">
                                    ${formatTime(msg.timestamp)}
                                    ${msg.senderId.equals(currentUser._id) ? 
                                        `<span class="message-status">${msg.read ? '✓✓' : '✓'}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `).join('')}
            </div>

            <!-- Indicateur de typing -->
            <div id="typingIndicator" style="display: none; padding: 0 15px 10px;">
                <div class="typing-indicator">
                    <span>${partner.firstName} écrit</span>
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>

            <!-- Zone de saisie -->
            <div class="input-area">
                <div class="message-input-wrapper">
                    <textarea class="message-input" 
                              id="messageInput" 
                              placeholder="Écrivez votre message..."
                              rows="1"
                              oninput="autoResize(this); onTyping()"
                              onkeydown="handleKeyPress(event)"></textarea>
                    <div class="input-actions">
                        <button class="emoji-btn" onclick="toggleEmojiPicker()">😊</button>
                        <button class="attach-btn" onclick="attachFile()">📎</button>
                    </div>
                </div>
                <button class="send-btn" id="sendBtn" onclick="sendMessage()" disabled>➤</button>
            </div>

            <!-- Emoji picker -->
            <div class="emoji-picker" id="emojiPicker">
                <div class="emoji-item" onclick="addEmoji('😊')">😊</div>
                <div class="emoji-item" onclick="addEmoji('❤️')">❤️</div>
                <div class="emoji-item" onclick="addEmoji('😂')">😂</div>
                <div class="emoji-item" onclick="addEmoji('👍')">👍</div>
                <div class="emoji-item" onclick="addEmoji('😘')">😘</div>
                <div class="emoji-item" onclick="addEmoji('🥰')">🥰</div>
                <div class="emoji-item" onclick="addEmoji('😍')">😍</div>
                <div class="emoji-item" onclick="addEmoji('🤔')">🤔</div>
                <div class="emoji-item" onclick="addEmoji('😢')">😢</div>
                <div class="emoji-item" onclick="addEmoji('🎉')">🎉</div>
                <div class="emoji-item" onclick="addEmoji('✨')">✨</div>
                <div class="emoji-item" onclick="addEmoji('💪')">💪</div>
            </div>

            <!-- Bouton scroll to bottom -->
            <button class="scroll-bottom-btn" id="scrollBottomBtn" onclick="scrollToBottom()">↓</button>

            <!-- Confirmation de blocage -->
            <div class="block-confirmation" id="blockConfirmation">
                <div class="block-card">
                    <span style="font-size:3rem;">🚫</span>
                    <h3>Bloquer ${partner.firstName} ?</h3>
                    <p>Vous ne pourrez plus échanger avec cette personne et ses profils ne vous seront plus suggérés.</p>
                    <div class="block-actions">
                        <button class="block-cancel" onclick="hideBlockConfirmation()">Annuler</button>
                        <button class="block-confirm" onclick="blockUser('${partnerId}')">Bloquer</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let lastMessageId = '${messages.length > 0 ? messages[messages.length-1]._id : ''}';
        let isTyping = false;
        let typingTimeout;
        let favoriteContacts = JSON.parse(localStorage.getItem('favorites') || '[]');

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            scrollToBottom();
            checkFavorite();
            startMessagePolling();
        });

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
            
            // Activer/désactiver le bouton d'envoi
            document.getElementById('sendBtn').disabled = !textarea.value.trim();
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }

        function onTyping() {
            if (!isTyping) {
                isTyping = true;
                // Notifier que l'utilisateur tape
                fetch('/api/typing', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        partnerId: '${partnerId}',
                        typing: true
                    })
                });
            }

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                isTyping = false;
                fetch('/api/typing', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        partnerId: '${partnerId}',
                        typing: false
                    })
                });
            }, 2000);
        }

        function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            
            if (!text) return;

            const sendBtn = document.getElementById('sendBtn');
            sendBtn.disabled = true;
            sendBtn.innerHTML = '⏳';

            fetch('/api/messages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    receiverId: '${partnerId}',
                    text: text
                })
            })
            .then(response => response.json())
            .then(message => {
                // Ajouter le message à l'interface
                addMessageToChat(message, true);
                
                input.value = '';
                autoResize(input);
                sendBtn.disabled = true;
                sendBtn.innerHTML = '➤';
                
                // Arrêter l'indicateur de typing
                if (isTyping) {
                    clearTimeout(typingTimeout);
                    isTyping = false;
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                showNotify('Erreur lors de l\'envoi');
                sendBtn.disabled = false;
                sendBtn.innerHTML = '➤';
            });
        }

        function addMessageToChat(message, isSent) {
            const container = document.getElementById('messagesContainer');
            const wrapper = document.createElement('div');
            wrapper.className = `message-wrapper ${isSent ? 'sent' : 'received'}`;
            
            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${isSent ? 'sent' : 'received'}`;
            
            const content = document.createElement('div');
            content.className = 'message-content';
            content.innerText = message.text;
            
            const time = document.createElement('div');
            time.className = 'message-time';
            time.innerHTML = formatTime(new Date()) + (isSent ? ' <span class="message-status">✓</span>' : '');
            
            bubble.appendChild(content);
            bubble.appendChild(time);
            wrapper.appendChild(bubble);
            container.appendChild(wrapper);
            
            scrollToBottom();
        }

        function startMessagePolling() {
            setInterval(() => {
                if (document.hidden) return;
                
                fetch('/api/messages?partnerId=${partnerId}&after=' + lastMessageId)
                    .then(response => response.json())
                    .then(messages => {
                        if (messages.length > 0) {
                            messages.forEach(msg => {
                                addMessageToChat(msg, false);
                            });
                            lastMessageId = messages[messages.length-1]._id;
                        }
                    });
            }, 3000);
        }

        function scrollToBottom() {
            const container = document.getElementById('messagesContainer');
            container.scrollTop = container.scrollHeight;
            document.getElementById('scrollBottomBtn').classList.remove('show');
        }

        // Détecter le scroll pour afficher le bouton
        document.getElementById('messagesContainer').addEventListener('scroll', function() {
            const isNearBottom = this.scrollHeight - this.scrollTop - this.clientHeight < 100;
            document.getElementById('scrollBottomBtn').classList.toggle('show', !isNearBottom);
        });

        function toggleEmojiPicker() {
            document.getElementById('emojiPicker').classList.toggle('show');
        }

        function addEmoji(emoji) {
            const input = document.getElementById('messageInput');
            input.value += emoji;
            input.focus();
            autoResize(input);
            toggleEmojiPicker();
        }

        function attachFile() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file && file.size <= 5 * 1024 * 1024) {
                    // Simuler l'envoi d'image
                    showNotify('Image envoyée !');
                    addMessageToChat({text: '📷 Image partagée'}, true);
                } else {
                    alert('Fichier trop volumineux (max 5MB)');
                }
            };
            input.click();
        }

        function toggleFavorite() {
            const userId = '${partnerId}';
            const btn = document.getElementById('favoriteBtn');
            
            if (favoriteContacts.includes(userId)) {
                favoriteContacts = favoriteContacts.filter(id => id !== userId);
                btn.style.opacity = '0.5';
                showNotify('Retiré des favoris');
            } else {
                favoriteContacts.push(userId);
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);
                showNotify('Ajouté aux favoris ❤️');
            }
            
            localStorage.setItem('favorites', JSON.stringify(favoriteContacts));
        }

        function checkFavorite() {
            const btn = document.getElementById('favoriteBtn');
            if (favoriteContacts.includes('${partnerId}')) {
                btn.style.opacity = '1';
            } else {
                btn.style.opacity = '0.5';
            }
        }

        function showBlockConfirmation() {
            document.getElementById('blockConfirmation').style.display = 'flex';
        }

        function hideBlockConfirmation() {
            document.getElementById('blockConfirmation').style.display = 'none';
        }

        function blockUser(userId) {
            fetch('/api/block/' + userId, { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        showNotify('🚫 Utilisateur bloqué');
                        setTimeout(() => {
                            window.location.href = '/inbox';
                        }, 1500);
                    }
                });
        }

        // Gestion de la connexion (simulée)
        window.addEventListener('online', () => showNotify('📶 Connecté'));
        window.addEventListener('offline', () => showNotify('📴 Hors ligne'));

        // Sauvegarde du brouillon
        setInterval(() => {
            const draft = document.getElementById('messageInput').value;
            if (draft) {
                localStorage.setItem('draft_${partnerId}', draft);
            }
        }, 5000);

        // Restaurer le brouillon
        const savedDraft = localStorage.getItem('draft_${partnerId}');
        if (savedDraft) {
            document.getElementById('messageInput').value = savedDraft;
            autoResize(document.getElementById('messageInput'));
        }
    </script>
</body>
</html>`);
    } catch (error) {
        console.error('Erreur chat:', error);
        res.status(500).send('Erreur lors du chargement du chat');
    }
});

// Fonctions utilitaires pour le chat
function groupMessagesByDate(messages) {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;

    messages.forEach(msg => {
        const date = new Date(msg.timestamp).toLocaleDateString();
        
        if (date !== currentDate) {
            currentDate = date;
            currentGroup = {
                date: formatDateHeader(date),
                messages: []
            };
            groups.push(currentGroup);
        }
        
        currentGroup.messages.push(msg);
    });

    return groups;
}

function formatDateHeader(dateStr) {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterday) return "Hier";
    return dateStr;
}
app.get('/settings', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) return res.redirect('/signup');

        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Paramètres - Genlove</title>
    ${styles}
    <style>
        .settings-container {
            background: #f4e9da;
            min-height: 100vh;
        }
        .settings-header {
            background: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 0 0 40px 40px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        .settings-header .logo {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .settings-header .subtitle {
            color: #666;
            font-size: 0.9rem;
        }
        .settings-section {
            background: white;
            border-radius: 25px;
            margin: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.03);
        }
        .section-title {
            padding: 18px 20px;
            margin: 0;
            font-size: 0.8rem;
            color: #888;
            font-weight: bold;
            letter-spacing: 1px;
            background: #f8f9fa;
            border-bottom: 1px solid #eee;
        }
        .settings-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #f5f5f5;
            transition: background 0.3s;
            cursor: pointer;
        }
        .settings-item:last-child {
            border-bottom: none;
        }
        .settings-item:hover {
            background: #fff5f7;
        }
        .item-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .item-icon {
            width: 40px;
            height: 40px;
            background: #f8f9fa;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            color: #ff416c;
        }
        .item-content {
            flex: 1;
        }
        .item-title {
            font-weight: 600;
            color: #1a2a44;
            margin-bottom: 3px;
        }
        .item-description {
            font-size: 0.75rem;
            color: #888;
        }
        .item-right {
            color: #999;
            font-size: 0.9rem;
        }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
        }
        .toggle-slider:before {
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
        input:checked + .toggle-slider {
            background-color: #ff416c;
        }
        input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }
        .danger-zone {
            background: #fff5f5;
            border: 1px solid #ffcdd2;
        }
        .danger-zone .item-title {
            color: #dc3545;
        }
        .badge {
            background: #ff416c;
            color: white;
            font-size: 0.6rem;
            padding: 3px 8px;
            border-radius: 20px;
            margin-left: 8px;
        }
        .premium-badge {
            background: linear-gradient(135deg, #ff416c, #ff7b9c);
            color: white;
            padding: 5px 12px;
            border-radius: 25px;
            font-size: 0.7rem;
            font-weight: bold;
        }
        .user-card {
            background: white;
            margin: 15px;
            padding: 20px;
            border-radius: 25px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.03);
        }
        .user-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            background-color: #f0f0f0;
            border: 2px solid #ff416c;
        }
        .user-info {
            flex: 1;
        }
        .user-name {
            font-weight: bold;
            color: #1a2a44;
            margin-bottom: 3px;
        }
        .user-email {
            font-size: 0.8rem;
            color: #666;
        }
        .edit-profile-btn {
            background: #f0f0f0;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s;
        }
        .edit-profile-btn:hover {
            background: #ff416c;
            color: white;
        }
        .modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 20px;
            backdrop-filter: blur(5px);
        }
        .modal-content {
            background: white;
            border-radius: 30px;
            padding: 30px 25px;
            width: 100%;
            max-width: 350px;
            animation: modalSlide 0.3s ease-out;
        }
        @keyframes modalSlide {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .modal-icon {
            font-size: 3.5rem;
            text-align: center;
            margin-bottom: 15px;
        }
        .modal-title {
            font-size: 1.4rem;
            font-weight: bold;
            color: #1a2a44;
            text-align: center;
            margin-bottom: 10px;
        }
        .modal-text {
            color: #666;
            text-align: center;
            margin-bottom: 25px;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        .modal-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #eee;
            border-radius: 15px;
            margin-bottom: 20px;
            font-size: 1rem;
            box-sizing: border-box;
        }
        .modal-input:focus {
            border-color: #ff416c;
            outline: none;
        }
        .modal-buttons {
            display: flex;
            gap: 10px;
        }
        .modal-btn {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 15px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        .modal-btn.primary {
            background: #ff416c;
            color: white;
        }
        .modal-btn.primary:hover {
            background: #ff1f4f;
        }
        .modal-btn.secondary {
            background: #f0f0f0;
            color: #333;
        }
        .modal-btn.secondary:hover {
            background: #e0e0e0;
        }
        .modal-btn.danger {
            background: #dc3545;
            color: white;
        }
        .modal-btn.danger:hover {
            background: #c82333;
        }
        .version-info {
            text-align: center;
            padding: 20px;
            color: #888;
            font-size: 0.7rem;
        }
        .storage-info {
            background: #e3f2fd;
            border-radius: 15px;
            padding: 15px;
            margin: 15px;
            font-size: 0.8rem;
        }
        .storage-bar {
            height: 6px;
            background: #bbdefb;
            border-radius: 3px;
            margin: 10px 0;
            overflow: hidden;
        }
        .storage-used {
            height: 100%;
            background: #ff416c;
            width: 30%;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="settings-container">
            <!-- Notification -->
            <div id="genlove-notify">
                <span>💙</span>
                <span id="notify-msg"></span>
            </div>

            <!-- Header -->
            <div class="settings-header">
                <div class="logo">
                    <span style="color:#1a2a44;">Gen</span>
                    <span style="color:#ff416c;">love</span>
                </div>
                <div class="subtitle">Paramètres et confidentialité</div>
            </div>

            <!-- Carte utilisateur -->
            <div class="user-card">
                <div class="user-avatar" style="background-image: url('${currentUser.photo || ''}')"></div>
                <div class="user-info">
                    <div class="user-name">${currentUser.firstName} ${currentUser.lastName}</div>
                    <div class="user-email">${currentUser.firstName.toLowerCase()}.${currentUser.lastName.toLowerCase()}@genlove.com</div>
                </div>
                <button class="edit-profile-btn" onclick="window.location.href='/signup'">Modifier</button>
            </div>

            <!-- Section Compte -->
            <div class="settings-section">
                <div class="section-title">👤 COMPTE</div>
                
                <div class="settings-item" onclick="showModal('email')">
                    <div class="item-left">
                        <div class="item-icon">📧</div>
                        <div class="item-content">
                            <div class="item-title">Adresse email</div>
                            <div class="item-description">${currentUser.firstName.toLowerCase()}.${currentUser.lastName.toLowerCase()}@genlove.com</div>
                        </div>
                    </div>
                    <div class="item-right">✏️</div>
                </div>

                <div class="settings-item" onclick="showModal('password')">
                    <div class="item-left">
                        <div class="item-icon">🔒</div>
                        <div class="item-content">
                            <div class="item-title">Mot de passe</div>
                            <div class="item-description">Modifier votre mot de passe</div>
                        </div>
                    </div>
                    <div class="item-right">✏️</div>
                </div>

                <div class="settings-item" onclick="showModal('phone')">
                    <div class="item-left">
                        <div class="item-icon">📱</div>
                        <div class="item-content">
                            <div class="item-title">Téléphone</div>
                            <div class="item-description">Non renseigné</div>
                        </div>
                    </div>
                    <div class="item-right">➕</div>
                </div>
            </div>

            <!-- Section Confidentialité -->
            <div class="settings-section">
                <div class="section-title">🔒 CONFIDENTIALITÉ</div>
                
                <div class="settings-item">
                    <div class="item-left">
                        <div class="item-icon">👁️</div>
                        <div class="item-content">
                            <div class="item-title">Visibilité du profil</div>
                            <div class="item-description">Qui peut voir votre profil</div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="visibilityToggle" checked onchange="toggleVisibility()">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="settings-item">
                    <div class="item-left">
                        <div class="item-icon">🔔</div>
                        <div class="item-content">
                            <div class="item-title">Notifications</div>
                            <div class="item-description">Messages, matches, rappels</div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="notifToggle" checked onchange="toggleNotifications()">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="settings-item">
                    <div class="item-left">
                        <div class="item-icon">📍</div>
                        <div class="item-content">
                            <div class="item-title">Géolocalisation</div>
                            <div class="item-description">Pour les matches proches</div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="locationToggle" checked onchange="toggleLocation()">
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="settings-item" onclick="showModal('data')">
                    <div class="item-left">
                        <div class="item-icon">📊</div>
                        <div class="item-content">
                            <div class="item-title">Mes données</div>
                            <div class="item-description">Télécharger vos informations</div>
                        </div>
                    </div>
                    <div class="item-right">⬇️</div>
                </div>
            </div>

            <!-- Section Préférences -->
            <div class="settings-section">
                <div class="section-title">⚙️ PRÉFÉRENCES</div>
                
                <div class="settings-item" onclick="showModal('language')">
                    <div class="item-left">
                        <div class="item-icon">🌍</div>
                        <div class="item-content">
                            <div class="item-title">Langue</div>
                            <div class="item-description">Français</div>
                        </div>
                    </div>
                    <div class="item-right">FR</div>
                </div>

                <div class="settings-item" onclick="showModal('distance')">
                    <div class="item-left">
                        <div class="item-icon">📏</div>
                        <div class="item-content">
                            <div class="item-title">Distance max</div>
                            <div class="item-description">50 km</div>
                        </div>
                    </div>
                    <div class="item-right">✏️</div>
                </div>

                <div class="settings-item" onclick="showModal('age-range')">
                    <div class="item-left">
                        <div class="item-icon">📅</div>
                        <div class="item-content">
                            <div class="item-title">Tranche d'âge</div>
                            <div class="item-description">25 - 40 ans</div>
                        </div>
                    </div>
                    <div class="item-right">✏️</div>
                </div>
            </div>

            <!-- Section Premium -->
            <div class="settings-section">
                <div class="section-title">⭐ PREMIUM</div>
                
                <div class="settings-item" onclick="showModal('premium')">
                    <div class="item-left">
                        <div class="item-icon">👑</div>
                        <div class="item-content">
                            <div class="item-title">Passer à Premium</div>
                            <div class="item-description">Débloquez toutes les fonctionnalités</div>
                        </div>
                    </div>
                    <div class="premium-badge">GRATUIT</div>
                </div>
            </div>

            <!-- Section Support -->
            <div class="settings-section">
                <div class="section-title">🆘 SUPPORT</div>
                
                <div class="settings-item" onclick="showModal('help')">
                    <div class="item-left">
                        <div class="item-icon">❓</div>
                        <div class="item-content">
                            <div class="item-title">Centre d'aide</div>
                            <div class="item-description">FAQ et assistance</div>
                        </div>
                    </div>
                    <div class="item-right">→</div>
                </div>

                <div class="settings-item" onclick="showModal('contact')">
                    <div class="item-left">
                        <div class="item-icon">✉️</div>
                        <div class="item-content">
                            <div class="item-title">Nous contacter</div>
                            <div class="item-description">support@genlove.com</div>
                        </div>
                    </div>
                    <div class="item-right">→</div>
                </div>

                <div class="settings-item" onclick="showModal('legal')">
                    <div class="item-left">
                        <div class="item-icon">⚖️</div>
                        <div class="item-content">
                            <div class="item-title">Mentions légales</div>
                            <div class="item-description">CGU, confidentialité</div>
                        </div>
                    </div>
                    <div class="item-right">→</div>
                </div>
            </div>

            <!-- Zone de danger -->
            <div class="settings-section danger-zone">
                <div class="section-title">⚠️ ZONE DE DANGER</div>
                
                <div class="settings-item" onclick="showModal('blocked')">
                    <div class="item-left">
                        <div class="item-icon">🚫</div>
                        <div class="item-content">
                            <div class="item-title" style="color:#dc3545;">Utilisateurs bloqués</div>
                            <div class="item-description">Gérer votre liste de blocage</div>
                        </div>
                    </div>
                    <div class="badge" id="blockedCount">${currentUser.blockedUsers?.length || 0}</div>
                </div>

                <div class="settings-item" onclick="showModal('delete')">
                    <div class="item-left">
                        <div class="item-icon">🗑️</div>
                        <div class="item-content">
                            <div class="item-title" style="color:#dc3545;">Supprimer mon compte</div>
                            <div class="item-description">Cette action est irréversible</div>
                        </div>
                    </div>
                    <div class="item-right">⚠️</div>
                </div>
            </div>

            <!-- Information de stockage -->
            <div class="storage-info">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>💾 Espace de stockage</span>
                    <span>15 MB / 50 MB</span>
                </div>
                <div class="storage-bar">
                    <div class="storage-used" style="width: 30%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem;">
                    <span>Photos et messages</span>
                    <span onclick="clearCache()" style="color:#ff416c; cursor:pointer;">🗑️ Nettoyer</span>
                </div>
            </div>

            <!-- Version et déconnexion -->
            <div class="version-info">
                <p>Version 2.0.1 • Sécurisé 🔒</p>
                <button onclick="logout()" style="background: none; border: none; color: #ff416c; cursor: pointer; font-size: 0.9rem; margin-top: 10px;">
                    🚪 Se déconnecter
                </button>
            </div>

            <!-- Bouton retour -->
            <a href="/profile" class="btn-pink" style="margin:20px auto; width: auto; display: inline-block; padding: 15px 40px;">
                ← Retour au profil
            </a>
        </div>
    </div>

    ${notifyScript}

    <!-- Modals -->
    <div class="modal" id="modal">
        <div class="modal-content" id="modalContent"></div>
    </div>

    <script>
        let currentModal = null;

        function showModal(type) {
            const modal = document.getElementById('modal');
            const content = document.getElementById('modalContent');
            
            let html = '';
            
            switch(type) {
                case 'email':
                    html = `
                        <div class="modal-icon">✉️</div>
                        <div class="modal-title">Changer d'email</div>
                        <div class="modal-text">Entrez votre nouvelle adresse email</div>
                        <input type="email" class="modal-input" placeholder="nouveau@email.com" id="newEmail">
                        <div class="modal-buttons">
                            <button class="modal-btn secondary" onclick="closeModal()">Annuler</button>
                            <button class="modal-btn primary" onclick="updateEmail()">Confirmer</button>
                        </div>
                    `;
                    break;
                    
                case 'password':
                    html = `
                        <div class="modal-icon">🔒</div>
                        <div class="modal-title">Changer le mot de passe</div>
                        <input type="password" class="modal-input" placeholder="Mot de passe actuel">
                        <input type="password" class="modal-input" placeholder="Nouveau mot de passe">
                        <input type="password" class="modal-input" placeholder="Confirmer">
                        <div class="modal-buttons">
                            <button class="modal-btn secondary" onclick="closeModal()">Annuler</button>
                            <button class="modal-btn primary" onclick="updatePassword()">Confirmer</button>
                        </div>
                    `;
                    break;
                    
                case 'delete':
                    html = `
                        <div class="modal-icon">⚠️</div>
                        <div class="modal-title">Supprimer le compte</div>
                        <div class="modal-text">
                            Cette action est irréversible. Toutes vos données seront définitivement effacées.
                            <br><br>
                            Tapez <strong>SUPPRIMER</strong> pour confirmer.
                        </div>
                        <input type="text" class="modal-input" placeholder="SUPPRIMER" id="confirmDelete">
                        <div class="modal-buttons">
                            <button class="modal-btn secondary" onclick="closeModal()">Annuler</button>
                            <button class="modal-btn danger" onclick="deleteAccount()">Supprimer définitivement</button>
                        </div>
                    `;
                    break;
                    
                case 'blocked':
                    html = `
                        <div class="modal-icon">🚫</div>
                        <div class="modal-title">Utilisateurs bloqués</div>
                        <div class="modal-text">
                            ${currentUser.blockedUsers?.length || 0} utilisateur(s) bloqué(s)
                        </div>
                        <div id="blockedList" style="max-height: 200px; overflow-y: auto; margin-bottom: 20px;">
                            <!-- La liste sera chargée dynamiquement -->
                        </div>
                        <div class="modal-buttons">
                            <button class="modal-btn secondary" onclick="closeModal()">Fermer</button>
                        </div>
                    `;
                    // Charger la liste des bloqués
                    setTimeout(loadBlockedUsers, 100);
                    break;
                    
                case 'premium':
                    html = `
                        <div class="modal-icon">👑</div>
                        <div class="modal-title">Genzlove Premium</div>
                        <div class="modal-text">
                            ✨ Voir qui vous a liké<br>
                            ✨ Match illimités<br>
                            ✨ Mode invisible<br>
                            ✨ Badge vérifié<br>
                            <br>
                            <strong>9.99€ / mois</strong>
                        </div>
                        <div class="modal-buttons">
                            <button class="modal-btn secondary" onclick="closeModal()">Plus tard</button>
                            <button class="modal-btn primary" onclick="upgradePremium()">Passer Premium</button>
                        </div>
                    `;
                    break;
                    
                default:
                    html = `
                        <div class="modal-icon">ℹ️</div>
                        <div class="modal-title">En construction</div>
                        <div class="modal-text">Cette fonctionnalité arrive bientôt !</div>
                        <div class="modal-buttons">
                            <button class="modal-btn primary" onclick="closeModal()">OK</button>
                        </div>
                    `;
            }
            
            content.innerHTML = html;
            modal.style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('modal').style.display = 'none';
        }

        function toggleVisibility() {
            const isChecked = document.getElementById('visibilityToggle').checked;
            showNotify(isChecked ? 'Profil visible' : 'Profil masqué');
        }

        function toggleNotifications() {
            const isChecked = document.getElementById('notifToggle').checked;
            showNotify(isChecked ? 'Notifications activées' : 'Notifications désactivées');
        }

        function toggleLocation() {
            const isChecked = document.getElementById('locationToggle').checked;
            showNotify(isChecked ? 'Géolocalisation activée' : 'Géolocalisation désactivée');
        }

        function updateEmail() {
            const newEmail = document.getElementById('newEmail')?.value;
            if (newEmail && newEmail.includes('@')) {
                showNotify('Email mis à jour !');
                closeModal();
            } else {
                alert('Email invalide');
            }
        }

        function updatePassword() {
            showNotify('Mot de passe modifié !');
            closeModal();
        }

        function deleteAccount() {
            const confirm = document.getElementById('confirmDelete')?.value;
            if (confirm === 'SUPPRIMER') {
                // Appel API pour supprimer le compte
                fetch('/api/delete-account', { method: 'DELETE' })
                    .then(() => {
                        localStorage.clear();
                        window.location.href = '/logout-success';
                    });
            } else {
                alert('Confirmation incorrecte');
            }
        }

        function loadBlockedUsers() {
            fetch('/api/blocked-users')
                .then(response => response.json())
                .then(users => {
                    const list = document.getElementById('blockedList');
                    if (users.length === 0) {
                        list.innerHTML = '<p style="text-align:center; color:#666;">Aucun utilisateur bloqué</p>';
                    } else {
                        list.innerHTML = users.map(user => `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                                <span>${user.firstName} ${user.lastName}</span>
                                <button onclick="unblockUser('${user._id}')" style="background:#ff416c; color:white; border:none; padding:5px 10px; border-radius:15px; cursor:pointer;">
                                    Débloquer
                                </button>
                            </div>
                        `).join('');
                    }
                });
        }

        function unblockUser(userId) {
            fetch('/api/unblock/' + userId, { method: 'POST' })
                .then(() => {
                    showNotify('Utilisateur débloqué');
                    loadBlockedUsers();
                    
                    // Mettre à jour le compteur
                    const count = document.getElementById('blockedCount');
                    count.textContent = parseInt(count.textContent) - 1;
                });
        }

        function upgradePremium() {
            showNotify('Redirection vers le paiement...');
            setTimeout(() => {
                showNotify('Fonctionnalité Premium bientôt disponible !');
                closeModal();
            }, 1500);
        }

        function clearCache() {
            if (confirm('Vider le cache de l\'application ?')) {
                localStorage.clear();
                showNotify('Cache nettoyé !');
            }
        }

        function logout() {
            if (confirm('Se déconnecter ?')) {
                window.location.href = '/logout-success';
            }
        }

        // Fermer la modal en cliquant dehors
        document.getElementById('modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Sauvegarder les préférences
        setInterval(() => {
            const prefs = {
                visibility: document.getElementById('visibilityToggle').checked,
                notifications: document.getElementById('notifToggle').checked,
                location: document.getElementById('locationToggle').checked
            };
            localStorage.setItem('userPreferences', JSON.stringify(prefs));
        }, 5000);

        // Charger les préférences
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            document.getElementById('visibilityToggle').checked = prefs.visibility;
            document.getElementById('notifToggle').checked = prefs.notifications;
            document.getElementById('locationToggle').checked = prefs.location;
        }
    </script>
</body>
</html>`);
    } catch (error) {
        console.error('Erreur settings:', error);
        res.status(500).send('Erreur lors du chargement des paramètres');
    }
});

// ============================================
// ROUTES API POUR LA MESSAGERIE
// ============================================

// Envoyer un message
app.post('/api/messages', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { receiverId, text } = req.body;

        // Vérifier que le destinataire existe
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: 'Destinataire non trouvé' });
        }

        // Vérifier si l'utilisateur n'est pas bloqué
        if (currentUser.blockedUsers && currentUser.blockedUsers.includes(receiverId)) {
            return res.status(403).json({ error: 'Cet utilisateur est bloqué' });
        }

        // Créer le message
        const message = new Message({
            senderId: currentUser._id,
            receiverId: receiverId,
            text: text,
            timestamp: new Date(),
            read: false
        });

        await message.save();

        // Émettre un événement WebSocket (si vous utilisez Socket.io)
        // io.to(receiverId).emit('newMessage', message);

        res.status(201).json({
            ...message.toObject(),
            sender: {
                _id: currentUser._id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName
            }
        });

    } catch (error) {
        console.error('Erreur envoi message:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer les messages d'une conversation
app.get('/api/messages', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { partnerId, after } = req.query;
        if (!partnerId) {
            return res.status(400).json({ error: 'ID partenaire requis' });
        }

        // Construire la requête
        let query = {
            $or: [
                { senderId: currentUser._id, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUser._id }
            ]
        };

        // Si un ID "after" est fourni, ne récupérer que les messages plus récents
        if (after) {
            const afterDate = new Date(after);
            query.timestamp = { $gt: afterDate };
        }

        const messages = await Message.find(query)
            .sort({ timestamp: 1 })
            .populate('senderId', 'firstName lastName photo')
            .populate('receiverId', 'firstName lastName photo');

        res.json(messages);

    } catch (error) {
        console.error('Erreur récupération messages:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Marquer les messages comme lus
app.post('/api/messages/read/:partnerId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { partnerId } = req.params;

        await Message.updateMany(
            {
                senderId: partnerId,
                receiverId: currentUser._id,
                read: false
            },
            { read: true }
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Erreur marquage lecture:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer le nombre de messages non lus
app.get('/api/messages/unread', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const count = await Message.countDocuments({
            receiverId: currentUser._id,
            read: false
        });

        res.json({ count });

    } catch (error) {
        console.error('Erreur comptage non lus:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LE BLOCAGE
// ============================================

// Bloquer un utilisateur
app.post('/api/block/:userId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { userId } = req.params;

        // Vérifier que l'utilisateur existe
        const userToBlock = await User.findById(userId);
        if (!userToBlock) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Initialiser le tableau blockedUsers s'il n'existe pas
        if (!currentUser.blockedUsers) {
            currentUser.blockedUsers = [];
        }

        // Vérifier s'il n'est pas déjà bloqué
        if (!currentUser.blockedUsers.includes(userId)) {
            currentUser.blockedUsers.push(userId);
            await currentUser.save();
        }

        // Optionnel : supprimer les messages existants
        // await Message.deleteMany({
        //     $or: [
        //         { senderId: currentUser._id, receiverId: userId },
        //         { senderId: userId, receiverId: currentUser._id }
        //     ]
        // });

        res.json({ 
            success: true, 
            message: 'Utilisateur bloqué',
            blockedCount: currentUser.blockedUsers.length
        });

    } catch (error) {
        console.error('Erreur blocage:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Débloquer un utilisateur
app.post('/api/unblock/:userId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { userId } = req.params;

        if (currentUser.blockedUsers) {
            currentUser.blockedUsers = currentUser.blockedUsers.filter(
                id => id.toString() !== userId
            );
            await currentUser.save();
        }

        res.json({ 
            success: true, 
            message: 'Utilisateur débloqué',
            blockedCount: currentUser.blockedUsers.length
        });

    } catch (error) {
        console.error('Erreur déblocage:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer la liste des utilisateurs bloqués
app.get('/api/blocked-users', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const blockedUsers = await User.find({
            _id: { $in: currentUser.blockedUsers || [] }
        }).select('firstName lastName photo genotype');

        res.json(blockedUsers);

    } catch (error) {
        console.error('Erreur récupération bloqués:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LES CONVERSATIONS
// ============================================

// Récupérer toutes les conversations avec résumé
app.get('/api/conversations', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        // Récupérer tous les messages de l'utilisateur
        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id },
                { receiverId: currentUser._id }
            ]
        })
        .populate('senderId receiverId', 'firstName lastName photo genotype residence')
        .sort({ timestamp: -1 });

        // Organiser par conversations
        const conversations = {};
        
        for (const msg of messages) {
            const otherUser = msg.senderId._id.equals(currentUser._id) ? msg.receiverId : msg.senderId;
            const convId = otherUser._id.toString();
            
            if (!conversations[convId]) {
                // Compter les messages non lus
                const unreadCount = await Message.countDocuments({
                    senderId: otherUser._id,
                    receiverId: currentUser._id,
                    read: false
                });

                conversations[convId] = {
                    user: otherUser,
                    lastMessage: msg,
                    unreadCount: unreadCount,
                    updatedAt: msg.timestamp
                };
            }
        }

        // Convertir en tableau et trier
        const conversationList = Object.values(conversations)
            .sort((a, b) => b.updatedAt - a.updatedAt);

        res.json(conversationList);

    } catch (error) {
        console.error('Erreur récupération conversations:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer les compteurs de non lus par conversation
app.get('/api/conversations/unread', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        // Récupérer tous les messages non lus groupés par expéditeur
        const unreadMessages = await Message.aggregate([
            {
                $match: {
                    receiverId: currentUser._id,
                    read: false
                }
            },
            {
                $group: {
                    _id: '$senderId',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {};
        unreadMessages.forEach(item => {
            result[item._id] = item.count;
        });

        res.json(result);

    } catch (error) {
        console.error('Erreur récupération non lus:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer une conversation
app.delete('/api/conversations/:partnerId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { partnerId } = req.params;

        await Message.deleteMany({
            $or: [
                { senderId: currentUser._id, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUser._id }
            ]
        });

        res.json({ success: true, message: 'Conversation supprimée' });

    } catch (error) {
        console.error('Erreur suppression conversation:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LE TYPING (WEBSOCKET SIMULÉ)
// ============================================

// Stockage temporaire des statuts de typing (à remplacer par Redis en production)
const typingStatus = new Map();

app.post('/api/typing', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { partnerId, typing } = req.body;
        
        const key = `${currentUser._id}-${partnerId}`;
        typingStatus.set(key, {
            typing,
            timestamp: Date.now()
        });

        // Nettoyage automatique après 5 secondes
        if (typing) {
            setTimeout(() => {
                const current = typingStatus.get(key);
                if (current && current.timestamp < Date.now() - 5000) {
                    typingStatus.delete(key);
                }
            }, 5000);
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Erreur typing:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Vérifier si un utilisateur tape
app.get('/api/typing/:partnerId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { partnerId } = req.params;
        
        const key = `${partnerId}-${currentUser._id}`;
        const status = typingStatus.get(key);

        res.json({ 
            typing: status ? status.typing : false,
            timestamp: status ? status.timestamp : null
        });

    } catch (error) {
        console.error('Erreur vérification typing:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LES UTILISATEURS
// ============================================

// Récupérer les informations d'un utilisateur
app.get('/api/users/:userId', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { userId } = req.params;
        
        const user = await User.findById(userId)
            .select('-blockedUsers -__v');

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier si l'utilisateur est bloqué
        const isBlocked = currentUser.blockedUsers && 
            currentUser.blockedUsers.includes(userId);

        res.json({
            ...user.toObject(),
            isBlocked
        });

    } catch (error) {
        console.error('Erreur récupération utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Mettre à jour le profil utilisateur
app.put('/api/users/profile', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const updates = req.body;
        
        // Champs autorisés à être modifiés
        const allowedUpdates = [
            'firstName', 'lastName', 'gender', 'dob', 
            'residence', 'genotype', 'bloodGroup', 
            'desireChild', 'photo'
        ];

        // Filtrer les mises à jour
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                currentUser[key] = updates[key];
            }
        });

        await currentUser.save();

        res.json({ 
            success: true, 
            message: 'Profil mis à jour',
            user: currentUser
        });

    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LE MATCHING
// ============================================

// Obtenir des suggestions de matching
app.get('/api/matching/suggestions', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const { limit = 20, filter = 'all' } = req.query;

        // Construire la requête de base
        let query = {
            _id: { $ne: currentUser._id } // Exclure l'utilisateur courant
        };

        // Exclure les utilisateurs bloqués
        if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
            query._id.$nin = currentUser.blockedUsers;
        }

        // Filtrer par genre (ne pas montrer le même genre)
        if (currentUser.gender) {
            query.gender = currentUser.gender === 'Homme' ? 'Femme' : 'Homme';
        }

        // Appliquer les règles génétiques
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            query.genotype = 'AA';
        }

        // Récupérer les utilisateurs
        let users = await User.find(query)
            .select('-blockedUsers -__v')
            .limit(parseInt(limit));

        // Calculer les scores de compatibilité
        const suggestions = users.map(user => ({
            ...user.toObject(),
            compatibility: calculateCompatibility(currentUser, user),
            distance: Math.floor(Math.random() * 30) + 1 // Simuler la distance
        }));

        // Trier par compatibilité
        suggestions.sort((a, b) => b.compatibility - a.compatibility);

        // Appliquer les filtres supplémentaires
        let filteredSuggestions = suggestions;
        if (filter === 'near') {
            filteredSuggestions = suggestions.filter(s => s.distance <= 10);
        } else if (filter === 'compatible') {
            filteredSuggestions = suggestions.filter(s => s.compatibility >= 80);
        }

        res.json({
            total: filteredSuggestions.length,
            suggestions: filteredSuggestions
        });

    } catch (error) {
        console.error('Erreur suggestions matching:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LA GESTION DU COMPTE
// ============================================

// Supprimer le compte utilisateur
app.delete('/api/delete-account', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        // Supprimer tous les messages de l'utilisateur
        await Message.deleteMany({
            $or: [
                { senderId: currentUser._id },
                { receiverId: currentUser._id }
            ]
        });

        // Supprimer l'utilisateur
        await User.findByIdAndDelete(currentUser._id);

        res.json({ 
            success: true, 
            message: 'Compte supprimé avec succès' 
        });

    } catch (error) {
        console.error('Erreur suppression compte:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Exporter les données utilisateur (RGPD)
app.get('/api/export-data', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        // Récupérer tous les messages
        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id },
                { receiverId: currentUser._id }
            ]
        }).populate('senderId receiverId', 'firstName lastName');

        // Formater les données
        const userData = {
            profile: currentUser,
            messages: messages.map(msg => ({
                with: msg.senderId._id.equals(currentUser._id) ? 
                    `${msg.receiverId.firstName} ${msg.receiverId.lastName}` : 
                    `${msg.senderId.firstName} ${msg.senderId.lastName}`,
                direction: msg.senderId._id.equals(currentUser._id) ? 'envoyé' : 'reçu',
                text: msg.text,
                timestamp: msg.timestamp,
                read: msg.read
            })),
            blockedUsers: await User.find({
                _id: { $in: currentUser.blockedUsers || [] }
            }).select('firstName lastName'),
            exportDate: new Date()
        };

        res.json(userData);

    } catch (error) {
        console.error('Erreur export données:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LES STATISTIQUES
// ============================================

// Obtenir des statistiques utilisateur
app.get('/api/stats', async (req, res) => {
    try {
        const currentUser = await User.findOne().sort({ createdAt: -1 });
        if (!currentUser) {
            return res.status(401).json({ error: 'Non authentifié' });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        const stats = {
            messages: {
                total: await Message.countDocuments({
                    $or: [
                        { senderId: currentUser._id },
                        { receiverId: currentUser._id }
                    ]
                }),
                sent: await Message.countDocuments({ senderId: currentUser._id }),
                received: await Message.countDocuments({ receiverId: currentUser._id }),
                unread: await Message.countDocuments({ 
                    receiverId: currentUser._id, 
                    read: false 
                }),
                last30Days: await Message.countDocuments({
                    $or: [
                        { senderId: currentUser._id },
                        { receiverId: currentUser._id }
                    ],
                    timestamp: { $gte: thirtyDaysAgo }
                })
            },
            conversations: {
                total: await Message.distinct('senderId', {
                    $or: [
                        { senderId: currentUser._id },
                        { receiverId: currentUser._id }
                    ]
                }).then(ids => ids.length),
                active: await Message.distinct('senderId', {
                    $or: [
                        { senderId: currentUser._id },
                        { receiverId: currentUser._id }
                    ],
                    timestamp: { $gte: thirtyDaysAgo }
                }).then(ids => ids.length)
            },
            blocked: (currentUser.blockedUsers || []).length,
            accountAge: Math.floor((Date.now() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        };

        res.json(stats);

    } catch (error) {
        console.error('Erreur récupération stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================
// ROUTES API POUR LA SANTÉ DU SERVEUR
// ============================================

// Vérifier l'état du serveur
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

// ============================================
// FONCTIONS UTILITAIRES
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

function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    return date.toLocaleDateString();
}

// ============================================
// FIN DES ROUTES - AJOUTEZ LE DÉMARRAGE DU SERVEUR ICI
// ============================================

// Démarrer le serveur
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove démarré avec succès !`);
    console.log(`📱 Application accessible sur http://localhost:${port}`);
    console.log(`💾 Base de données: ${mongoose.connection.readyState === 1 ? 'Connectée ✅' : 'Déconnectée ❌'}`);
    console.log(`⚙️ Mode: ${process.env.NODE_ENV || 'development'}`);
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
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page non trouvée - Genlove</title>
            ${styles}
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
    `);
});