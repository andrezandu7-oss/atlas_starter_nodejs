const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();

// CONNEXION MONGODB (Utilise votre variable d'environnement sur Render)
const mongouRI = process.env.MONGODB_URI || [span_3](start_span)'mongodb://localhost:27017/genlove';[span_3](end_span)
mongoose.connect(mongouRI);

[span_4](start_span)// CONFIGURATION SESSION[span_4](end_span)
app.use(session({
    secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongouRI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === 'production' }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

[span_5](start_span)// MODÈLE UTILISATEUR[span_5](end_span)
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    genotype: String,
    bloodGroup: String,
    dob: String,
    residence: String,
    region: String,
    desireChild: String,
    [span_6](start_span)isVerified: { type: Boolean, default: false }, // Nouveau champ pour la certification[span_6](end_span)
    language: { type: String, default: 'fr' }
});
const User = mongoose.model('User', userSchema);

// --- ROUTES D'INSCRIPTION ---

// 1. Choix du mode d'inscription (Après la Charte)
app.get('/signup-choice', (req, res) => {
    res.send(`
        <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h2>Choisissez votre mode d'inscription</h2>
            <button onclick="window.location.href='/signup-qr'" style="padding:15px; margin:10px; background:#28a745; color:white; border:none; border-radius:10px; cursor:pointer;">
                Par Certificat Médical (Scanner QR)
            </button><br>
            <button onclick="window.location.href='/signup-manual'" style="padding:15px; margin:10px; background:#007bff; color:white; border:none; border-radius:10px; cursor:pointer;">
                Inscription Manuelle
            </button>
        </div>
    `);
});

// 2. Inscription par QR Code (Utilise la caméra pour lire et remplir)
app.get('/signup-qr', (req, res) => {
    res.send(`
        <script src="https://unpkg.com/html5-qrcode"></script>
        <div style="max-width:500px; margin:auto; font-family:sans-serif;">
            <h3>Scanner le QR Code du certificat</h3>
            <div id="reader" style="width:100%; border-radius:15px; overflow:hidden;"></div>
            
            <form action="/register-verified" method="POST" style="margin-top:20px;">
                <input type="hidden" name="isVerified" value="true">
                <input type="text" id="fn" name="firstName" placeholder="Prénom" readonly required style="width:100%; margin:5px 0; padding:10px;">
                <input type="text" id="ln" name="lastName" placeholder="Nom" readonly required style="width:100%; margin:5px 0; padding:10px;">
                <input type="text" id="gt" name="genotype" placeholder="Génotype" readonly required style="width:100%; margin:5px 0; padding:10px;">
                <input type="text" id="bg" name="bloodGroup" placeholder="Groupe sanguin" readonly required style="width:100%; margin:5px 0; padding:10px;">
                
                <div style="display:flex; gap:5px; margin:5px 0;">
                    <input type="text" id="day" placeholder="JJ" readonly style="width:30%; padding:10px;">
                    <input type="text" id="month" placeholder="MM" readonly style="width:30%; padding:10px;">
                    <input type="text" id="year" placeholder="AAAA" readonly style="width:40%; padding:10px;">
                </div>
                <input type="hidden" id="dob" name="dob">

                <hr>
                <input type="text" name="residence" placeholder="Résidence actuelle" required style="width:100%; margin:5px 0; padding:10px;">
                <input type="text" name="region" placeholder="Région" required style="width:100%; margin:5px 0; padding:10px;">
                <label>Désir d'enfant ?</label>
                <select name="desireChild" style="width:100%; padding:10px;">
                    <option value="Oui">Oui</option>
                    <option value="Non">Non</option>
                </select>
                <button type="submit" style="width:100%; padding:15px; background:#ff416c; color:white; border:none; margin-top:15px;">Finaliser mon profil certifié</button>
            </form>
        </div>

        <script>
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
            scanner.render((text) => {
                // Format attendu: Prenom|Nom|Genotype|Groupe|JJ/MM/AAAA
                const d = text.split('|');
                document.getElementById('fn').value = d[0];
                document.getElementById('ln').value = d[1];
                document.getElementById('gt').value = d[2];
                document.getElementById('bg').value = d[3];
                document.getElementById('dob').value = d[4];
                const date = d[4].split('/');
                document.getElementById('day').value = date[0];
                document.getElementById('month').value = date[1];
                document.getElementById('year').value = date[2];
                alert("Données médicales extraites avec succès !");
                scanner.clear();
            });
        </script>
    `);
});

// 3. Traitement de l'inscription
app.post('/register-verified', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        req.session.userId = user._id;
        res.redirect('/profile');
    } catch (e) { res.status(500).send(e.message); }
});

// Affichage du badge certifié dans le profil
app.get('/profile', async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.send(`
        <div style="padding:20px; font-family:sans-serif;">
            <h1>Profil de ${user.firstName}</h1>
            ${user.isVerified ? '<p style="color:green; font-weight:bold;">✅ Profil vérifié par un laboratoire agréé</p>' : ''}
            <p>Génotype: ${user.genotype}</p>
        </div>
    `);
});

app.listen(process.env.PORT || 3000);
