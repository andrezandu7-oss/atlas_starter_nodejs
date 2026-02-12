const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURATION SERVEUR ---
app.use(express.json({ limit: '10mb' })); // Pour les photos
app.use(express.urlencoded({ extended: true }));

// --- CONNEXION MONGODB ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Genlove DB Connectée"))
    .catch(err => console.error("❌ Erreur DB:", err));

// --- MODÈLE UTILISATEUR ---
const User = mongoose.model('User', new mongoose.Schema({
    firstName: String,
    lastName: String,
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    photo: String,
    createdAt: { type: Date, default: Date.now }
}));

// --- CSS CENTRALISÉ ---
const CSS = `
<style>
    :root { --pink: #ff416c; --dark: #1a2a44; --bg: #fdf2f2; }
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: var(--bg); color: var(--dark); }
    .app-shell { max-width: 450px; min-height: 100vh; margin: auto; background: white; display: flex; flex-direction: column; }
    .btn-main { background: var(--pink); color: white; padding: 15px; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; width: 80%; margin: 10px auto; display: block; text-align: center; text-decoration: none; }
    .input-field { width: 90%; padding: 12px; margin: 10px auto; border: 1px solid #ddd; border-radius: 10px; display: block; }
    .card { background: #fff; margin: 10px; padding: 15px; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; align-items: center; }
    .photo-profile { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--pink); margin: 10px auto; }
</style>`;

// --- ROUTES PAGES ---

// 1. Accueil
app.get('/', (req, res) => {
    res.send(`${CSS} <div class="app-shell" style="text-align:center; justify-content:center;">
        <h1>Genlove</h1>
        <p>Unissez cœur et santé</p>
        <a href="/charte-engagement" class="btn-main">Commencer</a>
        <a href="/profile" style="color:var(--dark); text-decoration:none;">Déjà inscrit ? Voir mon profil</a>
    </div>`);
});

// 2. Charte (Sécurité éthique)
app.get('/charte-engagement', (req, res) => {
    res.send(`${CSS} <div class="app-shell" style="padding:20px;">
        <h2>🛡️ Engagement</h2>
        <div style="background:#eee; padding:15px; height:200px; overflow-y:auto;" onscroll="if(this.scrollHeight - this.scrollTop <= this.clientHeight + 5) document.getElementById('btn').disabled=false">
            <p>1. Je certifie l'exactitude de mon génotype.</p>
            <p>2. Je m'engage à respecter la santé de ma future descendance.</p>
            <p>... (Scrollez pour continuer)</p>
        </div>
        <button id="btn" disabled onclick="location.href='/signup'" class="btn-main" style="margin-top:20px;">J'accepte</button>
    </div>`);
});

// 3. Inscription (Saisie des données)
app.get('/signup', (req, res) => {
    res.send(`${CSS} <div class="app-shell">
        <h2 style="text-align:center;">Mon Profil Santé</h2>
        <input type="text" id="fn" class="input-field" placeholder="Prénom">
        <select id="gender" class="input-field"><option value="Homme">Homme</option><option value="Femme">Femme</option></select>
        <select id="gt" class="input-field"><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
        <button onclick="register()" class="btn-main">Valider</button>
        <script>
            async function register() {
                const data = { 
                    firstName: document.getElementById('fn').value, 
                    gender: document.getElementById('gender').value,
                    genotype: document.getElementById('gt').value 
                };
                localStorage.setItem('user', JSON.stringify(data));
                await fetch('/api/users', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) });
                location.href = '/profile';
            }
        </script>
    </div>`);
});

// 4. Profil (Affichage des données stockées)
app.get('/profile', (req, res) => {
    res.send(`${CSS} <div class="app-shell" style="text-align:center; padding:20px;">
        <div id="vP" class="photo-profile"></div>
        <h2 id="vN">Chargement...</h2>
        <p>Génotype: <b id="vG">--</b></p>
        <a href="/matching" class="btn-main">🔍 Chercher un partenaire</a>
        <script>
            const user = JSON.parse(localStorage.getItem('user'));
            if(user) {
                document.getElementById('vN').innerText = user.firstName;
                document.getElementById('vG').innerText = user.genotype;
            } else { location.href = '/'; }
        </script>
    </div>`);
});

// 5. Matching (Le coeur du filtrage santé)
app.get('/matching', async (req, res) => {
    const allUsers = await User.find(); // Récupère les vrais gens de MongoDB
    res.send(`${CSS} <div class="app-shell">
        <h3 style="padding:15px;">Partenaires Compatibles</h3>
        <div id="list"></div>
        <script>
            const my = JSON.parse(localStorage.getItem('user'));
            const matches = ${JSON.stringify(allUsers)};
            const container = document.getElementById('list');

            matches.forEach(u => {
                if(u.firstName === my.firstName) return; // Pas moi
                if(u.gender === my.gender) return;    // Pas le même sexe

                let compatible = true;
                // --- LOGIQUE SANTÉ STRICTE ---
                if((my.genotype === 'SS' || my.genotype === 'AS') && u.genotype !== 'AA') compatible = false;
                if(my.genotype === 'SS' && u.genotype === 'SS') compatible = false; // Sécurité SS vs SS

                if(compatible) {
                    container.innerHTML += \`<div class="card">
                        <b>\${u.firstName}</b> - Génotype: \${u.genotype}
                        <button onclick="location.href='/chat'" style="margin-left:auto;">Message</button>
                    </div>\`;
                }
            });
        </script>
    </div>`);
});

// --- API (ACTIONS) ---
app.post('/api/users', async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.json({ success: true });
});

app.listen(port, () => console.log(`Serveur prêt sur le port ${port}`));
