// 🚀 GENLOVE - SERVEUR.JS V4.5 - DESIGN ORIGINAL + INSTALLATION PWA ✅
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 🔒 CONNEXION MONGODB (Version Hardcoded pour Render)
const mongoURI = "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0"; 
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove V4.5 !"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// ✅ MODÈLE UTILISATEUR
const User = mongoose.model('User', new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String, dob: String, residence: String, genotype: String,
    bloodGroup: String, desireChild: String,
    photo: { type: String, default: "https://via.placeholder.com/150?text=👤" },
    createdAt: { type: Date, default: Date.now }
}));

// ✅ META + PWA CONFIG
const head = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💕</text></svg>">
    <meta name="theme-color" content="#ff416c">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="manifest" href="/manifest.json">
    <title>Genlove</title>`;

const styles = `<style>body{font-family:'Segoe UI',sans-serif;margin:0;background:#fdf2f2;display:flex;justify-content:center}.app-shell{width:100%;max-width:420px;min-height:100vh;background:#f4e9da;display:flex;flex-direction:column;box-shadow:0 0 20px rgba(0,0,0,0.1);position:relative}#genlove-notify{position:absolute;top:-100px;left:10px;right:10px;background:#1a2a44;color:white;padding:15px;border-radius:12px;display:flex;align-items:center;gap:10px;transition:0.5s;z-index:9999}.show{top:10px}#loader{display:none;position:absolute;inset:0;background:white;z-index:100;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px}.spinner{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #ff416c;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.home-screen{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center}.logo-text{font-size:3.5rem;font-weight:bold;margin-bottom:5px}.slogan{font-weight:bold;color:#1a2a44;margin-bottom:40px;font-size:1rem}.page-white{background:white;min-height:100vh;padding:25px 20px;box-sizing:border-box;text-align:center}.photo-circle{width:110px;height:110px;border:2px dashed #ff416c;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background-size:cover;background-position:center;cursor:pointer}.input-box{width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:12px;margin-top:10px;box-sizing:border-box;background:#f8f9fa}.btn-pink{background:#ff416c;color:white;padding:18px;border-radius:50px;text-align:center;text-decoration:none;font-weight:bold;display:block;width:85%;margin:20px auto;border:none;cursor:pointer}.btn-dark{background:#1a2a44;color:white;padding:18px;border-radius:12px;text-align:center;text-decoration:none;font-weight:bold;display:block;margin:15px}.match-card{background:white;margin:10px 15px;padding:15px;border-radius:15px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 5px rgba(0,0,0,0.05)}.st-group{background:white;border-radius:15px;margin:0 15px 15px 15px;overflow:hidden;text-align:left}.st-item{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid #f8f8f8;color:#333}</style>`;

// ✅ LOGIQUE SERVEUR (APIs)
app.post('/api/register', async(req,res)=>{ try{ const newUser=new User(req.body); await newUser.save(); res.json({success:true, user:newUser._id}); }catch(e){res.status(500).json({error:e.message});}});
app.put('/api/update-account/:id', async(req,res)=>{ try{ const user=await User.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json({success:true, user}); }catch(e){res.status(500).json({error:"Erreur"});}});
app.delete('/api/delete-account/:id', async(req,res)=>{ try{ await User.findByIdAndDelete(req.params.id); res.json({success:true}); }catch(e){res.status(500).json({error:"Erreur"});}});

// ✅ ROUTES ÉCRANS (Design Original)
app.get('/',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé</div><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/charte-engagement" style="color:#1a2a44;font-weight:bold;text-decoration:none;display:block;margin-top:15px;">👤 Créer un compte</a></div></div><script>if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js');}</script></body></html>`)});

app.get('/charte-engagement',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>🛡️ Engagement</h2><div style="height:200px;overflow-y:scroll;background:#fff5f7;padding:15px;text-align:left;border-radius:15px;" onscroll="if(this.scrollHeight-this.scrollTop<=this.clientHeight+5){const b=document.getElementById('agree');b.disabled=false;b.style.background='#ff416c';}"><b>1. Sincérité</b><br>Données médicales réelles.<br><br><b>2. Éthique</b><br>Je protège ma future famille.<br><br><i>Scrollez pour valider...</i></div><button id="agree" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc;" disabled>J'ai lu et je m'engage</button></div></div></body></html>`)});

app.get('/signup',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>⚕️ Santé</h2><form onsubmit="save(event)"><div class="photo-circle" id="c" onclick="document.getElementById('i').click()">📸</div><input type="file" id="i" hidden onchange="prev(event)"><input id="fn" class="input-box" placeholder="Prénom" required><input id="ln" class="input-box" placeholder="Nom" required><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">🚀 Valider profil</button></form></div></div><script>let b64="";function prev(e){const r=new FileReader();r.onload=()=>{b64=r.result;document.getElementById('c').style.backgroundImage='url('+b64+')'};r.readAsDataURL(e.target.files[0])}async function save(e){e.preventDefault();const d={firstName:document.getElementById('fn').value,lastName:document.getElementById('ln').value,genotype:document.getElementById('gt').value,photo:b64};const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const o=await r.json();if(o.success){localStorage.setItem('current_user_id',o.user);localStorage.setItem('current_user_data',JSON.stringify(d));location.href='/profile'}}</script></body></html>`)});

app.get('/profile',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div style="background:white;padding:30px;text-align:center;border-radius:0 0 30px 30px;"><div id="vP" style="width:110px;height:110px;border-radius:50%;border:3px solid #ff416c;margin:auto;background-size:cover;"></div><h2 id="vN"></h2><p style="color:#007bff;font-weight:bold;">Profil Santé Validé ✅</p></div><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG"></b></div></div><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a><a href="/settings" style="text-align:center;display:block;color:#666;text-decoration:none;">Paramètres ⚙️</a></div><script>window.onload=()=>{const d=JSON.parse(localStorage.getItem('current_user_data'));if(!d)location.href='/signup';document.getElementById('vP').style.backgroundImage='url('+(d.photo||'')+')';document.getElementById('vN').innerText=d.firstName;document.getElementById('rG').innerText=d.genotype;}</script></body></html>`)});

app.get('/matching', async(req,res)=>{
    const users = await User.find({}).lean();
    const list = users.map(u => `<div class="match-card" data-gt="${u.genotype}" data-id="${u._id}"><b>${u.firstName}</b> - ${u.genotype} <button onclick="location.href='/chat'" style="margin-left:auto;">Détails</button></div>`).join('');
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><h3>Partenaires</h3><div id="l">${list}</div><a href="/profile" class="btn-pink">Retour</a></div><script>window.onload=()=>{const my=JSON.parse(localStorage.getItem('current_user_data'));const myId=localStorage.getItem('current_user_id');document.querySelectorAll('.match-card').forEach(c=>{if(c.dataset.id===myId)c.style.display='none';if((my.genotype==='SS'||my.genotype==='AS')&&c.dataset.gt!=='AA')c.style.display='none';});}</script></body></html>`);
});

app.get('/settings', (req,res)=>res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><button onclick="del()" class="btn-pink" style="background:#dc3545;">Supprimer le compte</button><a href="/profile" class="btn-dark">Retour</a></div></div><script>async function del(){if(confirm('Supprimer ?')){await fetch('/api/delete-account/'+localStorage.getItem('current_user_id'),{method:'DELETE'});localStorage.clear();location.href='/'}}</script></body></html>`));

// ✅ PWA FILES (Indispensables pour l'installation sur téléphone)
app.get('/sw.js', (req, res) => {
    res.type('application/javascript').send(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('fetch',e=>e.respondWith(fetch(e.request)));`);
});

app.get('/manifest.json', (req, res) => {
    res.json({
        "short_name": "Genlove",
        "name": "Genlove - Santé & Amour",
        "icons": [{ "src": "https://via.placeholder.com/192?text=💕", "type": "image/png", "sizes": "192x192" }],
        "start_url": "/",
        "background_color": "#fdf2f2",
        "display": "standalone",
        "theme_color": "#ff416c"
    });
});

app.listen(port, '0.0.0.0', () => console.log(`🚀 Genlove V4.5 PWA Ready sur port ${port}`));
