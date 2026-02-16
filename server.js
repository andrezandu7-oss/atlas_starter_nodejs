// 🚀 GENLOVE - SERVEUR.JS V4.5 COMPLET
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');
const app = express();
const port = process.env.PORT || 3000;

// 🔒 SÉCURITÉ MONGODB
const mongoURI = "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connecté"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// 👤 MODÈLE UTILISATEUR
const User = mongoose.model('User', new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    desireChild: String,
    photo: { type: String, default: "https://via.placeholder.com/150?text=👤" },
    subscriptionToken: Object,
    createdAt: { type: Date, default: Date.now }
}));

// 🎨 DESIGN GLOBAL
const head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💕</text></svg>"><title>Genlove</title>`;
const styles = `<style>body{font-family:'Segoe UI',sans-serif;margin:0;background:#fdf2f2;display:flex;justify-content:center}.app-shell{width:100%;max-width:420px;min-height:100vh;background:#f4e9da;display:flex;flex-direction:column;box-shadow:0 0 20px rgba(0,0,0,0.1);position:relative}.page-white{background:white;flex:1;padding:25px;text-align:center}.btn-pink{background:#ff416c;color:white;padding:18px;border-radius:50px;text-align:center;font-weight:bold;display:block;width:85%;margin:20px auto;border:none;cursor:pointer;text-decoration:none}.btn-dark{background:#1a2a44;color:white;padding:18px;border-radius:12px;text-align:center;font-weight:bold;display:block;margin:15px;text-decoration:none}.input-box{width:100%;padding:14px;border:1px solid #ddd;border-radius:12px;margin-top:10px;box-sizing:border-box}.photo-circle{width:110px;height:110px;border:2px dashed #ff416c;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background-size:cover;background-position:center;cursor:pointer}.match-card{background:white;margin:10px;padding:15px;border-radius:15px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 5px rgba(0,0,0,0.05)}#loader{display:none;position:absolute;inset:0;background:white;z-index:100;flex-direction:column;align-items:center;justify-content:center}.spinner{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #ff416c;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`;

// 🔌 API ROUTES
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true, user: newUser._id });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/delete-account/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Erreur" }); }
});

// 🏠 ACCUEIL
app.get('/', (req, res) => res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:30px;"><h1 style="font-size:3rem;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1><p>Unissez cœur et santé</p><a href="/profile" class="btn-dark">Se connecter</a><a href="/charte-engagement" style="color:#1a2a44;font-weight:bold;text-decoration:none;">Créer un compte</a></div></div></body></html>`));

// 🛡️ CHARTE
app.get('/charte-engagement', (req, res) => res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>🛡️ Engagement</h2><div style="height:200px;overflow-y:scroll;background:#fff5f7;padding:15px;text-align:left;border-radius:10px;" onscroll="if(this.scrollHeight-this.scrollTop<=this.clientHeight+5){const b=document.getElementById('btn');b.disabled=false;b.style.background='#ff416c';}"><b>1. Sincérité</b><br>Je jure que mes données de génotype sont vraies.<br><br><b>2. Éthique</b><br>Je protège ma future famille.<br><br><i>Scrollez jusqu'en bas pour valider...</i></div><button id="btn" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc;" disabled>J'ai lu et j'accepte</button></div></div></body></html>`));

// 📝 SIGNUP
app.get('/signup', (req, res) => res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse...</h3></div><div class="page-white"><h2>⚕️ Santé</h2><form onsubmit="save(event)"><div class="photo-circle" id="p" onclick="document.getElementById('i').click()">📸</div><input type="file" id="i" hidden onchange="prev(event)"><input id="fn" class="input-box" placeholder="Prénom" required><input id="ln" class="input-box" placeholder="Nom" required><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">Valider Profil</button></form></div></div><script>let b64="";function prev(e){const r=new FileReader();r.onload=()=>{b64=r.result;document.getElementById('p').style.backgroundImage='url('+b64+')'};r.readAsDataURL(e.target.files[0])}async function save(e){e.preventDefault();document.getElementById('loader').style.display='flex';const d={firstName:document.getElementById('fn').value,lastName:document.getElementById('ln').value,genotype:document.getElementById('gt').value,photo:b64};const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const o=await r.json();if(o.success){localStorage.setItem('user_id',o.user);localStorage.setItem('user_data',JSON.stringify(d));location.href='/profile'}}</script></body></html>`));

// 👤 PROFIL
app.get('/profile', (req, res) => res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><div id="vP" style="width:120px;height:120px;border-radius:50%;margin:20px auto;background-size:cover;border:3px solid #ff416c;"></div><h2 id="vN"></h2><p>Génotype: <b id="vG"></b></p><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a><a href="/settings" style="display:block;margin-top:20px;color:#666;">Paramètres</a></div></div><script>window.onload=()=>{const d=JSON.parse(localStorage.getItem('user_data'));if(!d)location.href='/signup';document.getElementById('vP').style.backgroundImage='url('+d.photo+')';document.getElementById('vN').innerText=d.firstName;document.getElementById('vG').innerText=d.genotype;}</script></body></html>`));

// 🔍 MATCHING (FILTRAGE SS/AS)
app.get('/matching', async (req, res) => {
    const users = await User.find({}).lean();
    const list = users.map(u => `<div class="match-card" data-gt="${u.genotype}" data-id="${u._id}"><div style="width:50px;height:50px;border-radius:50%;background-image:url('${u.photo}');background-size:cover;"></div><div><b>${u.firstName}</b><br><small>${u.genotype}</small></div><button onclick="alert('Demande envoyée!')" style="margin-left:auto;background:#1a2a44;color:white;border:none;padding:8px;border-radius:5px;">Contact</button></div>`).join('');
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><h3>Partenaires Compatibles</h3><div id="l">${list}</div><a href="/profile" class="btn-pink">Retour</a></div><script>window.onload=()=>{const my=JSON.parse(localStorage.getItem('user_data'));const myId=localStorage.getItem('user_id');document.querySelectorAll('.match-card').forEach(c=>{if(c.dataset.id===myId) c.style.display='none';const gt=c.dataset.gt;if((my.genotype==='SS'||my.genotype==='AS') && gt!=='AA') c.style.display='none';});}</script></body></html>`);
});

// ⚙️ SETTINGS
app.get('/settings', (req, res) => res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><button onclick="del()" style="background:#dc3545;" class="btn-pink">Supprimer mon compte</button><a href="/profile" class="btn-dark">Retour</a></div></div><script>async function del(){if(confirm('Supprimer définitivement ?')){await fetch('/api/delete-account/'+localStorage.getItem('user_id'),{method:'DELETE'});localStorage.clear();location.href='/'}}</script></body></html>`));

// 🛰️ SERVICE WORKER
app.get('/sw.js', (req, res) => {
    res.type('application/javascript').send("self.addEventListener('push', e => { const d = e.data.json(); self.registration.showNotification(d.title, {body: d.body}); });");
});

app.listen(port, () => console.log(`🚀 Serveur V4.5 ON`));
