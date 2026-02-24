const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();

// --- CONFIGURATION MONGODB ---
const mongouRI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';
mongoose.connect(mongouRI);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'genlove-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongouRI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === 'production' }
}));

// --- MODÈLE UTILISATEUR MIS À JOUR ---
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    genotype: String,
    bloodGroup: String,
    dob: String,
    residence: String,
    region: String,
    desireChild: String,
    isVerified: { type: Boolean, default: false }, // Badge "Laboratoire Agréé"
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// 1. Écran de choix après la charte
app.get('/signup-choice', (req, res) => {
    res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:40px; background:#f4f7f6; min-height:100vh;">
            <h2 style="color:#1a2a44;">Comment souhaitez-vous vous inscrire ?</h2>
            <div style="margin-top:30px;">
                <button onclick="window.location.href='/signup-qr'" style="display:block; width:100%; max-width:300px; margin:10px auto; padding:20px; background:#28a745; color:white; border:none; border-radius:15px; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(40,167,69,0.3);">
                    ⚡ Via Certificat Médical<br><small style="font-weight:normal;">(Profil certifié par labo)</small>
                </button>
                <p style="margin:15px 0; color:#666;">OU</p>
                <button onclick="window.location.href='/signup-manual'" style="display:block; width:100%; max-width:300px; margin:10px auto; padding:15px; background:#fff; color:#007bff; border:2px solid #007bff; border-radius:15px; font-weight:bold; cursor:pointer;">
                    Saisie Manuelle
                </button>
            </div>
        </div>
    `);
});

// 2. Inscription par QR Code
app.get('/signup-qr', (req, res) => {
    res.send(`
        <script src="https://unpkg.com/html5-qrcode"></script>
        <div style="max-width:500px; margin:auto; font-family:sans-serif; padding:20px;">
            <h3 style="text-align:center;">Scanner votre certificat</h3>
            <div id="reader" style="width:100%; border-radius:15px; overflow:hidden; background:#000;"></div>
            
            <form action="/api/register" method="POST" style="margin-top:20px;">
                <input type="hidden" name="isVerified" value="true">
                
                <div style="background:#e9f7ef; padding:15px; border-radius:10px; margin-bottom:15px;">
                    <p style="font-size:12px; color:#28a745; margin:0 0 10px 0;">✔ Champs remplis automatiquement après scan</p>
                    <input type="text" id="fn" name="firstName" placeholder="Prénom" readonly required style="width:100%; margin:5px 0; padding:10px; border:1px solid #ccc;">
                    <input type="text" id="ln" name="lastName" placeholder="Nom" readonly required style="width:100%; margin:5px 0; padding:10px; border:1px solid #ccc;">
                    <input type="text" id="gt" name="genotype" placeholder="Génotype" readonly required style="width:100%; margin:5px 0; padding:10px; border:1px solid #ccc;">
                    <input type="text" id="bg" name="bloodGroup" placeholder="Groupe sanguin" readonly required style="width:100%; margin:5px 0; padding:10px; border:1px solid #ccc;">
                    
                    <div style="display:flex; gap:5px; margin-top:5px;">
                        <input type="text" id="d" placeholder="JJ" readonly style="width:30%; padding:10px; border:1px solid #ccc;">
                        <input type="text" id="m" placeholder="MM" readonly style="width:30%; padding:10px; border:1px solid #ccc;">
                        <input type="text" id="y" placeholder="AAAA" readonly style="width:40%; padding:10px; border:1px solid #ccc;">
                    </div>
                    <input type="hidden" id="dob" name="dob">
                </div>

                <input type="text" name="residence" placeholder="Résidence actuelle" required style="width:100%; margin:10px 0; padding:12px; border:1px solid #ddd; border-radius:8px;">
                <input type="text" name="region" placeholder="Région" required style="width:100%; margin:10px 0; padding:12px; border:1px solid #ddd; border-radius:8px;">
                
                <label style="display:block; margin:10px 0 5px;">Projet de vie : Désir d'enfant ?</label>
                <select name="desireChild" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; margin-bottom:20px;">
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                </select>

                <button type="submit" style="width:100%; padding:15px; background:#ff416c; color:white; border:none; border-radius:30px; font-weight:bold; cursor:pointer;">Créer mon profil vérifié ✅</button>
            </form>
        </div>

        <script>
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
            scanner.render((decodedText) => {
                try {
                    const data = decodedText.split('|'); // Format: Prénom|Nom|Génotype|Groupe|JJ/MM/AAAA
                    document.getElementById('fn').value = data[0];
                    document.getElementById('ln').value = data[1];
                    document.getElementById('gt').value = data[2];
                    document.getElementById('bg').value = data[3];
                    document.getElementById('dob').value = data[4];
                    
                    const dateParts = data[4].split('/');
                    document.getElementById('d').value = dateParts[0];
                    document.getElementById('m').value = dateParts[1];
                    document.getElementById('y').value = dateParts[2];
                    
                    scanner.clear();
                    alert("Certification validée !");
                } catch(e) { alert("Format QR Code invalide"); }
            });
        </script>
    `);
});

// 3. Traitement Final de l'inscription (POST)
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        req.session.userId = newUser._id;
        res.redirect('/profile');
    } catch (e) {
        res.status(500).send("Erreur : " + e.message);
    }
});

// 4. Exemple d'affichage du Badge Certifié sur le profil
app.get('/profile', async (req, res) => {
    if (!req.session.userId) return res.redirect('/signup-choice');
    const user = await User.findById(req.session.userId);
    res.send(`
        <div style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2>${user.firstName} ${user.lastName}</h2>
            ${user.isVerified ? 
                '<div style="color:green; font-weight:bold; background:#e9f7ef; display:inline-block; padding:10px 20px; border-radius:20px; border:1px solid #28a745;">✓ CERTIFIÉ PAR UN LABORATOIRE AGRÉÉ</div>' 
                : '<div style="color:#666;">Profil Standard</div>'}
            <p>Génotype : ${user.genotype}</p>
            <p>Résidence : ${user.residence}</p>
        </div>
    `);
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Serveur démarré sur le port 3000");
});
