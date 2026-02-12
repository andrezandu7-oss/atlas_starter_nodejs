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

// Augmentation de la limite pour les photos en Base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- STYLES ET SCRIPTS (Gardés tels quels) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; transition: 0.3s; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; animation: slideUp 0.3s ease-out; }
    .close-popup { position:absolute; top:15px; right:15px; font-size:1.5rem; cursor:pointer; color:#666; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }
    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; background-size: cover; background-position: center; filter: blur(6px); }
</style>
`;

const notifyScript = `
<script>
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        const m = document.getElementById('notify-msg');
        if(m) m.innerText = msg;
        if(n) n.classList.add('show');
        setTimeout(() => { if(n) n.classList.remove('show'); }, 3500);
    }
</script>
`;

// Helper
function calculerAge(dateNaissance) {
    if(!dateNaissance) return "??";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age;
}

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/charte-engagement" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></div></body></html>`);
});

app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div class="page-white" style="display:flex; flex-direction:column; justify-content:center; padding:30px;">
            <h2>🛡️ Engagement Éthique</h2>
            <div id="charte-box" style="height: 250px; overflow-y: scroll; background: #fff5f7; border: 2px solid #ffdae0; border-radius: 15px; padding: 20px; text-align:left; font-size:0.85rem;" onscroll="checkScroll(this)">
                <b>1. Sincérité des Données</b><br>Je jure que mon génotype est exact.<br><br>
                <b>2. Confidentialité</b><br>Je respecterai la vie privée des autres.<br><br>
                <b>3. Sérénité</b><br>Je comprends que Genlove filtre les profils pour protéger ma future descendance.<br><br>
                <center><i>Scrollez pour accepter...</i></center>
            </div>
            <button id="agree-btn" onclick="window.location.href='/signup'" class="btn-pink" style="background:#ccc;" disabled>J'ai lu et je m'engage</button>
        </div>
    </div>
    <script>
        function checkScroll(el) {
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 5) {
                const btn = document.getElementById('agree-btn');
                btn.disabled = false; btn.style.background = '#ff416c';
            }
        }
    </script></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>
    <div class="page-white"><h2>Configuration Santé</h2>
    <form onsubmit="saveAndRedirect(event)">
        <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">📸 Photo</div>
        <input type="file" id="i" style="display:none" onchange="preview(event)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
        <input type="text" id="ln" class="input-box" placeholder="Nom" required>
        <select id="gender" class="input-box"><option value="Homme">Homme</option><option value="Femme">Femme</option></select>
        <input type="date" id="dob" class="input-box">
        <input type="text" id="res" class="input-box" placeholder="Résidence">
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <select id="gs" class="input-box"><option value="">Groupe Sanguin</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select>
        <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
    let b64 = "";
    function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; }; r.readAsDataURL(e.target.files[0]); }
    async function saveAndRedirect(e){
        e.preventDefault();
        const userData = {
            firstName: document.getElementById('fn').value, lastName: document.getElementById('ln').value,
            gender: document.getElementById('gender').value, dob: document.getElementById('dob').value,
            residence: document.getElementById('res').value, genotype: document.getElementById('gt').value,
            bloodGroup: document.getElementById('gs').value, photo: b64
        };
        const res = await fetch('/api/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(userData) });
        const savedUser = await res.json();
        localStorage.setItem('u_id', savedUser._id);
        localStorage.setItem('u_fn', savedUser.firstName);
        localStorage.setItem('u_gt', savedUser.genotype);
        localStorage.setItem('u_gender', savedUser.gender);
        window.location.href='/profile';
    }
    </script></body></html>`);
});

app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json(newUser);
    } catch (e) { res.status(500).send(e); }
});

app.get('/profile', async (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px;">
        <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:auto; background-size:cover;"></div>
        <h2 id="vN">Chargement...</h2>
        <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
    </div>
    <div class="st-group">
        <div class="st-item"><span>Génotype</span><b id="rG">--</b></div>
    </div>
    <a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a>
    <a href="/settings" style="text-align:center; display:block; color:#666;">Paramètres</a>
    </div>
    <script>
        async function load(){
            const id = localStorage.getItem('u_id');
            if(!id) return location.href='/signup';
            const r = await fetch('/api/user/'+id);
            const u = await r.json();
            document.getElementById('vN').innerText = u.firstName;
            document.getElementById('rG').innerText = u.genotype;
            if(u.photo) document.getElementById('vP').style.backgroundImage = 'url('+u.photo+')';
        }
        load();
    </script></body></html>`);
});

app.get('/api/user/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

app.get('/matching', async (req, res) => {
    const users = await User.find().lean();
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
    <h3 style="text-align:center; padding:20px;">Partenaires Compatibles</h3>
    <div id="match-container"></div>
    <a href="/profile" class="btn-pink">Mon Profil</a>
    </div>
    ${notifyScript}
    <script>
        const users = ${JSON.stringify(users)};
        const myId = localStorage.getItem('u_id');
        const myGt = localStorage.getItem('u_gt');
        const myGender = localStorage.getItem('u_gender');
        
        const container = document.getElementById('match-container');
        let count = 0;

        users.forEach(u => {
            if(u._id === myId) return;
            if(u.gender === myGender) return;

            let visible = true;
            // REGLE SERENITE
            if((myGt === 'AS' || myGt === 'SS') && u.genotype !== 'AA') visible = false;
            if(myGt === 'SS' && u.genotype === 'SS') visible = false; // Double sécurité SS

            if(visible) {
                count++;
                container.innerHTML += '<div class="match-card">' +
                    '<div class="match-photo-blur" style="background-image:url('+(u.photo||'')+')"></div>' +
                    '<div style="flex:1"><b>'+u.firstName+'</b><br><small>Génotype '+u.genotype+'</small></div>' +
                    '<button class="btn-action btn-contact" onclick="showNotify(\\'Demande envoyée\\')">Contacter</button>' +
                '</div>';
            }
        });
        if(count === 0) container.innerHTML = '<p style="text-align:center;">Aucun partenaire compatible pour le moment.</p>';
    </script></body></html>`);
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <h2 style="text-align:center;">Paramètres</h2>
    <div class="st-group">
        <div class="st-item" style="color:red; cursor:pointer;" onclick="localStorage.clear(); location.href='/';">Supprimer mon compte</div>
    </div>
    <a href="/profile" class="btn-pink">Retour</a>
    </div></body></html>`);
});

app.listen(port, '0.0.0.0', () => console.log("🚀 Genlove Live sur port " + port));
