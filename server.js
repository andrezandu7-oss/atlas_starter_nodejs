const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// --- CONNEXION MONGODB ---
const mongoURI = process.env.MONGODB_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

// --- MODÈLE UTILISATEUR (Adapté à tes écrans) ---
const User = mongoose.model('User', new mongoose.Schema({
    firstName: String,
    lastName: String,
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    desireChild: String,
    photo: String
}, { timestamps: true }));

// ✅ CONFIGURATION SERVEUR (Indispensable pour les photos)
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// --- LOGIQUE DE STYLE ---
const styles = `<style>
    body { font-family: sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; position: relative; display: flex; flex-direction: column; }
    #loader { display: none; position: fixed; inset: 0; background: white; z-index: 1000; flex-direction: column; align-items: center; justify-content: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .page { padding: 20px; text-align: center; background: white; min-height: 100vh; }
    .input-box { width: 100%; padding: 12px; margin-top: 10px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; }
    .btn-pink { background: #ff416c; color: white; padding: 15px; border-radius: 30px; border: none; width: 100%; font-weight: bold; margin-top: 20px; cursor: pointer; }
    .match-card { background: white; margin: 10px; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .p-img { width: 50px; height: 50px; border-radius: 50%; background: #eee; background-size: cover; }
</style>`;

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width">${styles}</head><body>
    <div class="app-shell"><div class="page" style="display:flex;flex-direction:column;justify-content:center;">
        <h1>Genlove</h1>
        <p>Unissez cœur et santé</p>
        <button class="btn-pink" onclick="window.location.href='/signup'">Créer mon profil</button>
        <button style="margin-top:10px; background:none; border:none; color:#666;" onclick="window.location.href='/profile'">Déjà inscrit ? Voir mon profil</button>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width">${styles}</head><body>
    <div id="loader"><div class="spinner"></div><p>Analyse sécurisée...</p></div>
    <div class="app-shell"><div class="page">
        <h2>Inscription</h2>
        <form onsubmit="save(event)">
            <input type="file" id="i" accept="image/*" onchange="preview(event)" style="margin-bottom:10px;">
            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom" required>
            <select id="gender" class="input-box"><option value="Homme">Homme</option><option value="Femme">Femme</option></select>
            <input type="date" id="dob" class="input-box" required>
            <select id="gt" class="input-box"><option>AA</option><option>AS</option><option>SS</option></select>
            <input type="text" id="res" class="input-box" placeholder="Ville">
            <button type="submit" class="btn-pink">Valider mon profil</button>
        </form>
    </div></div>
    <script>
        let b64 = "";
        function preview(e){
            const reader = new FileReader();
            reader.onload = () => { b64 = reader.result; };
            reader.readAsDataURL(e.target.files[0]);
        }
        async function save(e){
            e.preventDefault();
            document.getElementById('loader').style.display = 'flex';
            const data = {
                firstName: document.getElementById('fn').value,
                lastName: document.getElementById('ln').value,
                gender: document.getElementById('gender').value,
                dob: document.getElementById('dob').value,
                residence: document.getElementById('res').value,
                genotype: document.getElementById('gt').value,
                photo: b64
            };
            // On stocke en local pour affichage immédiat
            localStorage.setItem('user', JSON.stringify(data));
            
            try {
                await fetch('/api/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
            } catch(e) {}
            
            window.location.href = '/profile';
        }
    </script></body></html>`);
});

app.post('/api/register', async (req, res) => {
    try {
        const u = new User(req.body);
        await u.save();
        res.sendStatus(200);
    } catch(e) { res.sendStatus(500); }
});

app.get('/profile', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width">${styles}</head><body>
    <div class="app-shell"><div class="page">
        <div id="u-img" style="width:100px;height:100px;border-radius:50%;margin:auto;background-size:cover;border:3px solid #ff416c;"></div>
        <h2 id="u-name"></h2>
        <div style="text-align:left; background:#f9f9f9; padding:15px; border-radius:10px;">
            <p><b>Génotype:</b> <span id="u-gt"></span></p>
            <p><b>Ville:</b> <span id="u-res"></span></p>
        </div>
        <button class="btn-pink" onclick="window.location.href='/matching'">🔍 Chercher un partenaire</button>
    </div></div>
    <script>
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if(!u.firstName) window.location.href = '/signup';
        document.getElementById('u-name').innerText = u.firstName + ' ' + u.lastName;
        document.getElementById('u-gt').innerText = u.genotype;
        document.getElementById('u-res').innerText = u.residence;
        if(u.photo) document.getElementById('u-img').style.backgroundImage = 'url('+u.photo+')';
    </script></body></html>`);
});

app.get('/matching', async (req, res) => {
    const users = await User.find().limit(20);
    res.send(`<html><head><meta name="viewport" content="width=device-width">${styles}</head><body>
    <div class="app-shell">
        <h3 style="text-align:center;">Partenaires Compatibles</h3>
        <div id="list"></div>
        <button class="btn-pink" onclick="window.location.href='/profile'">Mon profil</button>
    </div>
    <script>
        const me = JSON.parse(localStorage.getItem('user') || '{}');
        const all = ${JSON.stringify(users)};
        const list = document.getElementById('list');
        
        all.forEach(p => {
            // RÈGLES DE MATCHING
            if(p.firstName === me.firstName) return; // Ne pas se voir soi-même
            if(p.gender === me.gender) return;      // Homme voit Femme (et inversement)
            
            let compat = true;
            if((me.genotype === 'SS' || me.genotype === 'AS') && p.genotype !== 'AA') compat = false;
            
            if(compat) {
                list.innerHTML += \`<div class="match-card">
                    <div class="p-img" style="background-image:url(\${p.photo})"></div>
                    <div><b>\${p.firstName}</b><br><small>Génotype \${p.genotype}</small></div>
                </div>\`;
            }
        });
    </script></body></html>`);
});

app.listen(port, () => console.log("Serveur actif"));
