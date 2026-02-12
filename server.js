const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// --- CONNEXION MONGODB SÉCURISÉE ---
const mongoURI = process.env.MONGODB_URI; 

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// --- MODÈLE DE DONNÉES ---
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

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s; z-index: 9999; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; box-sizing: border-box; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); background-size: cover; }
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; }
    .end-overlay { position: fixed; inset: 0; background: linear-gradient(180deg, #4a76b8 0%, #1a2a44 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; }
    .end-card { background: white; border-radius: 30px; padding: 40px 25px; width: 85%; text-align: center; }
</style>
`;

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé</div><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/charte-engagement" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></body></html>`);
});

app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="page-white"><h2>Engagement Éthique</h2><div id="charte-box" style="height:250px; overflow-y:scroll; background:#fff5f7; padding:20px; text-align:left; font-size:0.85rem;" onscroll="if(this.scrollHeight - this.scrollTop <= this.clientHeight + 5) { document.getElementById('ag').disabled=false; document.getElementById('ag').style.background='#ff416c'; }"><b>1. Sincérité :</b> Je jure que mon génotype est exact.<br><br><b>2. Protection :</b> Genlove limite les unions à risque.<br><br><b>3. Respect :</b> Aucune discrimination tolérée.<br><br><i>Scrollez pour continuer...</i></div><button id="ag" disabled onclick="location.href='/signup'" class="btn-pink" style="background:#ccc; margin-top:25px; width:100%;">J'ai lu et je m'engage</button></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div><div class="page-white"><h2 style="color:#ff416c;">Profil Santé</h2><form onsubmit="save(event)"><div class="photo-circle" id="c" onclick="document.getElementById('i').click()">📸 Photo</div><input type="file" id="i" hidden onchange="preview(event)"><input type="text" id="fn" class="input-box" placeholder="Prénom" required><input type="text" id="ln" class="input-box" placeholder="Nom" required><select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select><input type="date" id="dob" class="input-box" required><input type="text" id="res" class="input-box" placeholder="Résidence"><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">🚀 Valider mon profil</button></form></div></div><script>let b64=""; function preview(e){const r=new FileReader(); r.onload=()=>{b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('c').innerText='';}; r.readAsDataURL(e.target.files[0]);} async function save(e){e.preventDefault(); document.getElementById('loader').style.display='flex'; const data={firstName:document.getElementById('fn').value, lastName:document.getElementById('ln').value, gender:document.getElementById('gender').value, dob:document.getElementById('dob').value, residence:document.getElementById('res').value, genotype:document.getElementById('gt').value, photo:b64}; localStorage.setItem('current_user_data', JSON.stringify(data)); await fetch('/api/register', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)}); location.href='/profile';}</script></body></html>`);
});

app.post('/api/register', async (req, res) => {
    try { const newUser = new User(req.body); await newUser.save(); res.status(200).send("OK"); } catch (e) { res.status(500).send("Erreur"); }
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="page-white"><div id="vP" class="photo-circle" style="border-style:solid;"></div><h2 id="vN">Utilisateur</h2><p id="vR" style="color:gray;">📍 Localisation</p><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG">--</b></div></div><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a><a href="/" onclick="localStorage.clear()" style="color:gray; text-decoration:none; font-size:0.8rem;">Déconnexion</a></div></div><script>const d = JSON.parse(localStorage.getItem('current_user_data')); if(d){document.getElementById('vN').innerText=d.firstName; document.getElementById('rG').innerText=d.genotype; if(d.photo) document.getElementById('vP').style.backgroundImage='url('+d.photo+')';} else {location.href='/';}</script></body></html>`);
});

app.get('/matching', async (req, res) => {
    const users = await User.find();
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="genlove-notify" style="position:fixed; width:380px; left:50%; transform:translateX(-50%);">💙 <span id="notify-msg"></span></div><h3 style="text-align:center; padding:15px; background:white;">Partenaires Compatibles</h3><div id="list"></div><a href="/profile" class="btn-pink">Retour Profil</a></div><div id="popup-overlay" onclick="this.style.display='none'"><div class="popup-content" onclick="event.stopPropagation()"><h3>Détails</h3><div id="pop-details"></div><button class="btn-pink" onclick="location.href='/chat'">🚀 Contacter</button></div></div>${notifyScript}<script>
    const all = ${JSON.stringify(users)};
    const my = JSON.parse(localStorage.getItem('current_user_data'));
    const container = document.getElementById('list');

    all.forEach(u => {
        if(u.firstName === my.firstName) return; 
        if(u.gender === my.gender) return;

        let ok = true;
        // LOGIQUE SANTÉ STRICTE
        if((my.genotype==='SS' || my.genotype==='AS') && u.genotype!=='AA') ok=false;
        if(my.genotype==='SS' && u.genotype==='SS') ok=false; // Blocage automatique SS

        if(ok){
            container.innerHTML += \`<div class="match-card">
                <div class="match-photo-blur" style="background-image:url(\${u.photo})"></div>
                <div style="flex:1"><b>\${u.firstName}</b><br><small>Génotype \${u.genotype}</small></div>
                <button class="btn-pink" style="width:auto; margin:0; padding:10px;" onclick="showNotify('Demande envoyée !')">Détails</button>
            </div>\`;
        }
    });
    </script></body></html>`);
});

app.get('/chat', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell" style="background:white;"><div style="background:#9dbce3; color:white; padding:15px; text-align:center;">❤️ Chat Éphémère (30:00)</div><div style="flex:1; padding:20px; color:gray;">Début de la conversation sécurisée...</div><button onclick="location.href='/chat-end'" class="btn-pink">Terminer</button></div></body></html>`);
});

app.get('/chat-end', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body class="end-overlay"><div class="end-card"><h2>Merci pour cet échange</h2><a href="/matching" class="btn-pink">Retour</a></div></body></html>`);
});

app.listen(port, '0.0.0.0', () => console.log("🚀 Genlove Live"));
