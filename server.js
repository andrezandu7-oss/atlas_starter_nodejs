const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3000;

// --- CONNEXION MONGODB ---
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté MongoDB Genlove !"))
    .catch(err => console.error("❌ MongoDB:", err));

// --- SCHÉMAS ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    desireChild: String,
    photo: String,
    sessionId: String, // Simple auth
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const styles = `...`; // Garde tes styles identiques (trop long, copy de l'original)

const notifyScript = `...`; // Identique

function calculerAge(dateNaissance) {
    if(!dateNaissance) return "??";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

// Middleware simple auth (à améliorer JWT)
function requireAuth(req, res, next) {
    const sessionId = req.query.session || req.body.sessionId;
    if (!sessionId) return res.redirect('/profile?error=no-session');
    User.findOne({ sessionId }).then(user => {
        if (!user) return res.redirect('/profile?error=invalid-session');
        req.user = user;
        next();
    });
}

// Routes inchangées jusqu'à /signup (ajout email/password)
app.get('/', (req, res) => { /* identique */ });
app.get('/charte-engagement', (req, res) => { /* identique */ });

app.get('/signup', (req, res) => {
    // HTML identique + champs email/password avant prénom
    res.send(`... <input type="email" id="email" class="input-box" placeholder="Email" required>
    <input type="password" id="password" class="input-box" placeholder="Mot de passe sécurisé" required>
    ... reste identique`);
});

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, ...userData } = req.body;
        const hashedPw = await bcrypt.hash(password, 10);
        const newUser = new User({ ...userData, email, password: hashedPw, sessionId: Math.random().toString(36).slice(2) });
        await newUser.save();
        res.json({ success: true, sessionId: newUser.sessionId });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/profile', requireAuth, async (req, res) => {
    const user = req.user;
    // Remplace localStorage par user data
    res.send(`... <script>
        document.getElementById('vN').innerText = "${user.firstName} ${user.lastName}";
        document.getElementById('vR').innerText = "📍 ${user.residence} (${user.gender})";
        document.getElementById('rG').innerText = "${user.genotype}";
        // ... pareil pour autres champs
        const age = ${calculerAge(user.dob)};
        document.getElementById('rAge').innerText = age + ' ans';
    </script>`);
});

app.get('/matching', requireAuth, async (req, res) => {
    const myUser = req.user;
    const myGender = myUser.gender === 'Homme' ? 'Femme' : 'Homme'; // Opposé
    const myGt = myUser.genotype;

    // Query DB réels : opposé genre, Luanda proche, compatible
    let matchQuery = {
        gender: myGender,
        residence: { $regex: 'Luanda', $options: 'i' } // Proche Luanda
    };
    if (myGt === 'SS' || myGt === 'AS') matchQuery.genotype = 'AA'; // Priorité sérénité

    const partners = await User.find(matchQuery).limit(20).select('-password -sessionId -email'); // Exclude sensibles
    const partnersWithAge = partners.map(p => ({
        id: p._id.toString().slice(-4),
        name: `${p.firstName} ${p.lastName.slice(0,1)}.`,
        dob: p.dob,
        res: p.residence,
        gender: p.gender,
        gt: p.genotype,
        gs: p.bloodGroup,
        pj: p.desireChild,
        age: calculerAge(p.dob),
        distance: Math.floor(Math.random() * 15) + 1 // Estime
    })).filter(p => p.age > 18 && p.age < 50); // Filtres logiques

    if (partnersWithAge.length === 0) {
        // Pas de matches ? Message + invite plus users
        res.send(`... <div>Pas encore de partenaires compatibles à Luanda. Invitez des amis !</div>`);
        return;
    }

    // HTML matches comme avant, mais data-partner-id réel
    const matchesHTML = partnersWithAge.map(p => `<div class="match-card" data-id="${p.id}" data-gt="${p.gt}" ...`).join('');
    res.send(`... ${matchesHTML} ...`);
});

// Autres routes identiques (/settings, /chat etc.), ajoute requireAuth où besoin
// Ex: app.get('/chat', requireAuth, ...)

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove DB réel sur port ${port}`);
});