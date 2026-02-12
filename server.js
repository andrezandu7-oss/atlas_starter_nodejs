const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// --- CONNEXION MONGODB ---
const mongoURI = process.env.MONGODB_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Genlove connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

// --- MODÈLE ---
const User = mongoose.model('User', new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    desireChild: String,
    photo: String,
    createdAt: { type: Date, default: Date.now }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- STYLES ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; box-sizing: border-box; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; transition: 0.5s; z-index: 9999; text-align:center; }
    #genlove-notify.show { top: 20px; }
</style>`;

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div style="text-align:center; margin-top:100px;"><h1>Genlove</h1><p>Unissez cœur et santé</p><a href="/charte-engagement" class="btn-pink">Commencer</a><br><a href="/profile" style="color:#1a2a44;">Mon Profil</a></div></div></body></html>`);
});

app.get('/charte-engagement', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="page-white"><h2>Engagement Éthique</h2><p>Je m'engage à fournir des données de santé réelles pour protéger ma descendance.</p><button onclick="location.href='/signup'" class="btn-pink">J'accepte</button></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="page-white">
    <form onsubmit="register(event)">
        <div class="photo-circle" id="prev" onclick="document.getElementById('file').click()">📸</div>
        <input type="file" id="file" hidden onchange="p(event)">
        <input type="text" id="fn" placeholder="Prénom" class="input-box" required>
        <input type="text" id="ln" placeholder="Nom" class="input-box" required>
        <select id="gen" class="input-box"><option value="Homme">Homme</option><option value="Femme">Femme</option></select>
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <button type="submit" class="btn-pink">Créer mon profil</button>
    </form>
    </div></div>
    <script>
    let b64 = "";
    function p(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('prev').style.backgroundImage='url('+b64+')'; }; r.readAsDataURL(e.target.files[0]); }
    async function register(e){
        e.preventDefault();
        const data = { 
            firstName: document.getElementById('fn').value, 
            lastName: document.getElementById('ln').value, 
            gender: document.getElementById('gen').value, 
            genotype: document.getElementById('gt').value, 
            photo: b64 
        };
        const res = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        const user = await res.json();
        localStorage.setItem('u_id', user._id); // Sauvegarde l'ID MongoDB
        location.href='/profile';
    }
    </script></body></html>`);
});

app.post('/api/register', async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.json(user);
});

app.get('/profile', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell" id="app">
    <div id="content" style="padding:20px; text-align:center;">
        <div id="vP" class="photo-circle" style="border-style:solid;"></div>
        <h2 id="vN">Chargement...</h2>
        <div style="background:white; border-radius:15px; padding:15px; text-align:left; margin-bottom:20px;">
            <p>Génotype : <b id="vG">--</b></p>
        </div>
        <a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a>
        <button onclick="localStorage.clear(); location.href='/';" style="color:red; background:none; border:none;">Supprimer mon compte</button>
    </div>
    <script>
    async function load(){
        const id = localStorage.getItem('u_id');
        if(!id) return location.href='/signup';
        const res = await fetch('/api/user/'+id);
        const u = await res.json();
        document.getElementById('vN').innerText = u.firstName;
        document.getElementById('vG').innerText = u.genotype;
        if(u.photo) document.getElementById('vP').style.backgroundImage = 'url('+u.photo+')';
    }
    load();
    </script></div></body></html>`);
});

app.get('/api/user/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

app.get('/matching', async (req, res) => {
    const users = await User.find().lean();
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div id="genlove-notify">Message envoyé !</div>
    <h3 style="text-align:center;">Compatibilités Santé</h3>
    <div id="list"></div>
    <a href="/profile" class="btn-pink">Mon Profil</a>
    <script>
    const users = ${JSON.stringify(users)};
    const myId = localStorage.getItem('u_id');
    const container = document.getElementById('list');
    
    async function init(){
        const res = await fetch('/api/user/'+myId);
        const me = await res.json();
        let found = 0;

        users.forEach(u => {
            if(u._id === myId) return; // Ne pas se voir soi-même
            if(u.gender === me.gender) return; // Hétérosexualité

            let compatible = true;
            // REGLE SERENITE & SS
            if((me.genotype === 'AS' || me.genotype === 'SS') && u.genotype !== 'AA') compatible = false;
            if(me.genotype === 'SS' && u.genotype === 'SS') compatible = false; // Bloque SS si je suis SS

            if(compatible) {
                found++;
                container.innerHTML += '<div class="match-card">' +
                    '<div style="width:50px; height:50px; border-radius:50%; background-image:url('+(u.photo||'')+'); background-size:cover;"></div>' +
                    '<div style="flex:1"><b>'+u.firstName+'</b><br><small>Génotype '+u.genotype+'</small></div>' +
                    '<button onclick="alert(\\'Demande envoyée !\\')" style="background:#ff416c; color:white; border:none; padding:8px; border-radius:8px;">Contacter</button>' +
                '</div>';
            }
        });
        if(found === 0) container.innerHTML = '<p style="text-align:center; padding:20px;">Aucun partenaire compatible pour le moment.</p>';
    }
    init();
    </script></div></body></html>`);
});

app.listen(port, '0.0.0.0', () => console.log("🚀 Genlove Unifié prêt !"));
