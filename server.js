const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// CONNEXION MONGODB (Utilise ton URI déjà configurée)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB sur Render"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

// CONFIGURATION SESSION
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET || 'genlove-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: true, sameSite: 'lax' }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MODÈLES
const userSchema = new mongoose.Schema({
    firstName: String, lastName: String, gender: String,
    dob: String, // Date de naissance corrigée
    residence: String, region: String, genotype: String,
    bloodGroup: String, photo: String,
    isVerified: { type: Boolean, default: false }, // Pour le Badge Bleu
    language: { type: String, default: 'fr' }
});
const User = mongoose.model('User', userSchema);

// DICTIONNAIRE DES 6 LANGUES
const translations = {
    fr: { app: 'Genlove', matching: 'Partenaires Compatibles', verified: 'Profil Certifié', age: 'ans', send: 'Envoyer', health_alert: 'Alerte Santé', blocked_ss: 'Action bloquée : Risque de transmission (SS+SS).', born: 'Né(e) le' },
    en: { app: 'Genlove', matching: 'Compatible Partners', verified: 'Verified Profile', age: 'yrs', send: 'Send', health_alert: 'Health Alert', blocked_ss: 'Action blocked: Risk of transmission (SS+SS).', born: 'Born on' },
    es: { app: 'Genlove', matching: 'Parejas Compatibles', verified: 'Perfil Verificado', age: 'años', send: 'Enviar', health_alert: 'Alerta de Salud', blocked_ss: 'Acción bloqueada: Riesgo de transmisión (SS+SS).', born: 'Nacido el' },
    pt: { app: 'Genlove', matching: 'Parceiros Compatíveis', verified: 'Perfil Certificado', age: 'anos', send: 'Enviar', health_alert: 'Alerta de Saúde', blocked_ss: 'Ação bloqueada: Risco de transmissão (SS+SS).', born: 'Nascido em' },
    ar: { app: 'جينلوف', matching: 'الشركاء المتوافقون', verified: 'ملف موثق', age: 'سنة', send: 'إرسال', health_alert: 'تنبيه صحي', blocked_ss: 'الإجراء محظور: خطر انتقال العدوى (SS+SS).', born: 'مولود في' },
    zh: { app: '真爱基因', matching: '兼容的伴侣', verified: '已认证档案', age: '岁', send: '发送', health_alert: '健康警报', blocked_ss: '操作已被锁定：遗传风险 (SS+SS)。', born: '出生于' }
};

// Middleware Langue
app.use((req, res, next) => {
    req.lang = req.session.lang || 'fr';
    res.locals.t = translations[req.lang];
    next();
});


// INSCRIPTION PAR CERTIFICAT (QR)
app.post('/api/signup-qr', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User({
            ...data,
            isVerified: true, // Badge bleu activé car certificat médical
            dob: data.dob // On récupère la date brute du scan
        });
        await newUser.save();
        req.session.userId = newUser._id;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// INSCRIPTION MANUELLE
app.post('/api/signup-manual', async (req, res) => {
    try {
        const { day, month, year, ...rest } = req.body;
        const newUser = new User({
            ...rest,
            dob: `${day}/${month}/${year}`, // Reconstruction propre de la date
            isVerified: false // Pas de badge car pas de certificat scané
        });
        await newUser.save();
        req.session.userId = newUser._id;
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// CHANGEMENT DE LANGUE DYNAMIQUE
app.get('/lang/:lang', (req, res) => {
    if (translations[req.params.lang]) {
        req.session.lang = req.params.lang;
    }
    res.redirect('back');
});

app.get('/matching', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const t = translations[req.session.lang || 'fr'];
    
    // Règle SS+SS Bloquée
    let compatibles = ['AA', 'AS', 'SS', 'AC', 'SC'];
    if (user.genotype === 'SS') compatibles = ['AA'];
    if (user.genotype === 'AS') compatibles = ['AA'];

    const matches = await User.find({
        _id: { $ne: user._id },
        gender: user.gender === 'Homme' ? 'Femme' : 'Homme',
        genotype: { $in: compatibles }
    });

    let cards = matches.map(m => {
        // Badge Bleu SVG si vérifié
        const badge = m.isVerified ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2" style="margin-left:5px;">
                <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
            </svg>` : '';

        return `
            <div class="card">
                <img src="${m.photo}">
                <h3>${m.firstName} ${badge}</h3>
                <p>${m.genotype} • ${m.residence}</p>
                <button>${t.send}</button>
            </div>`;
    }).join('');

    res.send(renderPage(`<h2>${t.matching}</h2><div class="grid">${cards}</div>`, req.session.lang));
});

app.get('/profile', async (req, res) => {
    const user = await User.findById(req.session.userId);
    const t = translations[req.session.lang || 'fr'];

    const content = `
        <div class="profile">
            <img src="${user.photo}" class="avatar">
            <h1>${user.firstName} ${user.isVerified ? '✅' : ''}</h1>
            <p>${t.born}: ${user.dob}</p>
            <p>Génotype: ${user.genotype}</p>
            ${user.genotype === 'SS' ? `<div class="alert">⚠️ ${t.health_alert}: ${t.blocked_ss}</div>` : ''}
            <div class="langs">
                <a href="/lang/fr">FR</a> <a href="/lang/en">EN</a> <a href="/lang/es">ES</a> 
                <a href="/lang/pt">PT</a> <a href="/lang/ar">AR</a> <a href="/lang/zh">ZH</a>
            </div>
        </div>`;
    res.send(renderPage(content, req.session.lang));
});

function renderPage(content, lang) {
    return `<html>
    <head>
        <style>
            body { font-family: sans-serif; text-align: center; background: #f4f4f4; }
            .grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
            .card { background: white; padding: 15px; border-radius: 15px; width: 200px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .card img { width: 100%; border-radius: 10px; }
            .alert { background: #fee; color: #c00; padding: 10px; border-radius: 5px; margin: 10px; }
            .verified-badge { vertical-align: middle; }
        </style>
    </head>
    <body>${content}</body></html>`;
}

app.listen(port, '0.0.0.0', () => console.log(`Genlove Ready on port ${port}`));


