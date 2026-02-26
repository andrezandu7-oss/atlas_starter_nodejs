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


