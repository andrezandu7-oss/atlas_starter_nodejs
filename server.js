// 🚀 GENLOVE - SERVEUR.JS V3.1 - FINAL OPTIMIZED ✅
// ✅ MongoDB 30s timeout + reconnexion auto
// ✅ Route /profile ROBUSTE V2.0 (anti-blocage mobile)
// ✅ Filtre éthique SS automatique intégré
// ✅ 100% Render deploy ready - Luanda AO

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 🔒 LOGS RENDER
console.log("🚀 GENLOVE V3.1 - Démarrage serveur Luanda");

// ✅ MONGODB ULTRA-ROBUSTE
const mongoURI = process.env.MONGODB_URI;

const mongooseOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
};

// 🔄 RECONNEXION AUTO
let retryCount = 0;
const maxRetries = 10;

async function connectDB() {
    try {
        await mongoose.connect(mongoURI, mongooseOptions);
        console.log("✅ MongoDB connecté (30s timeout OK)");
        retryCount = 0;
    } catch (error) {
        console.error(`❌ MongoDB (tentative ${retryCount + 1}):`, error.message);
        retryCount++;
        if (retryCount < maxRetries) {
            setTimeout(connectDB, 5000);
        } else {
            process.exit(1);
        }
    }
}

connectDB();

// ✅ MIDDLEWARES
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// ✅ MODÈLE UTILISATEUR
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
    createdAt: { type: Date, default: Date.now }
}));

// ✅ UI HELPERS
const head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💕</text></svg>"><meta name="theme-color" content="#ff416c"><title>Genlove</title>`;

const styles = `<style>body{font-family:'Segoe UI',sans-serif;margin:0;background:#fdf2f2;display:flex;justify-content:center}.app-shell{width:100%;max-width:420px;min-height:100vh;background:#f4e9da;display:flex;flex-direction:column;box-shadow:0 0 20px rgba(0,0,0,0.1)}#genlove-notify{position:fixed;top:20px;left:10px;right:10px;background:#1a2a44;color:white;padding:15px;border-radius:12px;display:flex;align-items:center;gap:10px;transition:0.5s;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.3);border-left:5px solid #007bff;opacity:0;pointer-events:none}.show{opacity:1 !important;top:30px !important}#loader{display:none;position:fixed;inset:0;background:white;z-index:100;flex-direction:column;align-items:center;justify-content:center}.spinner{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #ff416c;border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.home-screen{padding:30px;text-align:center}.logo-text{font-size:3.5rem;font-weight:bold;margin-bottom:5px}.slogan{font-weight:bold;color:#1a2a44;margin-bottom:40px;font-size:1rem}.page-white{background:white;min-height:100vh;padding:25px 20px;box-sizing:border-box;text-align:center}.photo-circle{width:110px;height:110px;border:2px dashed #ff416c;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;cursor:pointer;background-size:cover}.input-box{width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:12px;margin-top:10px;font-size:1rem;box-sizing:border-box;background:#f8f9fa}.btn-pink{background:#ff416c;color:white;padding:18px;border-radius:50px;text-align:center;text-decoration:none;font-weight:bold;display:block;width:85%;margin:20px auto;border:none;cursor:pointer}.btn-dark{background:#1a2a44;color:white;padding:18px;border-radius:12px;font-weight:bold;display:block;margin:15px auto;text-decoration:none}.st-group{background:white;border-radius:15px;margin:0 15px 15px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05)}.st-item{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid #f8f8f8}.match-card{background:white;margin:10px 15px;padding:15px;border-radius:15px;display:flex;gap:12px;box-shadow:0 2px 5px rgba(0,0,0,0.05)}.match-photo-blur{width:55px;height:55px;border-radius:50%;background:#eee;filter:blur(6px);background-size:cover}</style>`;

const notifyScript = `<script>function showNotify(msg){const n=document.getElementById('genlove-notify'),m=document.getElementById('notify-msg');if(m)m.textContent=msg;n.classList.add('show');setTimeout(()=>{n.classList.remove('show')},3500);}</script>`;

// ✅ ROUTES

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé</div><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/charte-engagement" style="color:#1a2a44;font-weight:bold;display:block;margin-top:15px;text-decoration:none;text-align:center;">👤 Créer un compte</a></div></div></body></html>`);
});

app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><div style="font-size:3.5rem;">🛡️</div><h2>Engagement Éthique</h2><div style="height:220px;overflow-y:scroll;background:#fff5f7;border:2px solid #ffdae0;border-radius:15px;padding:20px;font-size:0.85rem;text-align:left;" onscroll="if(this.scrollHeight-this.scrollTop<=this.clientHeight+5){document.getElementById('agree-btn').disabled=false;document.getElementById('agree-btn').style.background='#ff416c';}"><b>1. Sincérité • 2. Responsabilité • 3. Confidentialité • 4. Sérénité • 5. Respect</b><br><br>En utilisant Genlove, vous jurez sur l'honneur que vos données de santé sont exactes. Scrollez pour valider.</div><button id="agree-btn" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc;cursor:not-allowed;" disabled>J'ai lu et je m'engage</button></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div></div><div class="page-white"><h2 style="color:#ff416c;">Configuration Profil</h2><form onsubmit="saveUser(event)"><div class="photo-circle" id="photoCircle" onclick="document.getElementById('photoInput').click()">📸</div><input type="file" id="photoInput" style="display:none" accept="image/*" onchange="const r=new FileReader();r.onload=()=>{window.pB64=r.result;document.getElementById('photoCircle').style.backgroundImage='url('+r.result+')';document.getElementById('photoCircle').textContent='✅'};r.readAsDataURL(this.files[0])"><input type="text" id="fn" class="input-box" placeholder="Prénom *" required><input type="text" id="ln" class="input-box" placeholder="Nom *" required><select id="gn" class="input-box"><option value="">Genre</option><option>Homme</option><option>Femme</option></select><input type="date" id="db" class="input-box"><input type="text" id="rs" class="input-box" placeholder="Résidence" value="Luanda"><select id="gt" class="input-box" required><option value="">Génotype *</option><option>AA</option><option>AS</option><option>SS</option></select><select id="bg" class="input-box"><option value="">Groupe sanguin</option><option>A+</option><option>A-</option><option>B+</option><option>O+</option></select><button type="submit" class="btn-pink">🚀 Créer profil</button></form></div></div><script>async function saveUser(e){e.preventDefault();document.getElementById('loader').style.display='flex';const d={firstName:document.getElementById('fn').value,lastName:document.getElementById('ln').value,gender:document.getElementById('gn').value,dob:document.getElementById('db').value,residence:document.getElementById('rs').value,genotype:document.getElementById('gt').value,bloodGroup:document.getElementById('bg').value,photo:window.pB64||''};try{const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});if(r.ok){const res=await r.json();localStorage.setItem('genlove_user',JSON.stringify({...d,id:res.user}));location.href='/profile'}else alert('Erreur')}catch(err){alert(err)}}</script></body></html>`);
});

app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true, user: newUser._id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head>${head}${styles}${notifyScript}</head><body style="background:#f8f9fa;"><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="background:white;padding:30px 20px;text-align:center;border-radius:0 0 30px 30px;"><div id="uP" style="width:110px;height:110px;border-radius:50%;border:3px solid #ff416c;margin:20px auto;background-size:cover;"></div><h2 id="uN">Chargement...</h2><p id="uR" style="color:#666;">📍 --</p></div><div class="st-group"><div class="st-item"><span>Génotype</span><b id="uG">--</b></div><div class="st-item"><span>Âge</span><b id="uA">--</b></div></div><a href="/matching" class="btn-dark">🔍 Partenaires compatibles</a></div><script>
    function calcAge(db){if(!db)return '--';const t=new Date(),b=new Date(db);let a=t.getFullYear()-b.getFullYear();if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;return a;}
    window.onload=()=>{
        const u=JSON.parse(localStorage.getItem('genlove_user')||'{}');
        if(!u.firstName) location.href='/';
        document.getElementById('uP').style.backgroundImage='url('+(u.photo||'https://via.placeholder.com/150')+')';
        document.getElementById('uN').textContent=u.firstName+' '+u.lastName;
        document.getElementById('uR').textContent='📍 '+u.residence;
        document.getElementById('uG').textContent=u.genotype;
        document.getElementById('uA').textContent=calcAge(u.dob)+' ans';
        showNotify('Bienvenue '+u.firstName);
    }</script></body></html>`);
});

app.get('/matching', async (req, res) => {
    try {
        const users = await User.find({}).limit(50).lean();
        res.send(`<!DOCTYPE html><html><head>${head}${styles}${notifyScript}</head><body><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="padding:20px;background:white;text-align:center;"><h3>Compatibilités</h3></div><div id="mList"></div><a href="/profile" class="btn-dark">← Retour</a></div><script>
        const my=JSON.parse(localStorage.getItem('genlove_user')||'{}');
        const all=${JSON.stringify(users)};
        const list=document.getElementById('mList');
        const filtered=all.filter(u=>{
            if(u.firstName===my.firstName) return false;
            if(my.gender && u.gender === my.gender) return false; // Anti-même genre
            if(my.genotype==='SS' && u.genotype==='SS') return false; // ✅ AMENDEMENT SS BLOQUÉ
            if((my.genotype==='AS'||my.genotype==='SS') && u.genotype!=='AA') return false; // Sécurité santé
            return true;
        });
        list.innerHTML=filtered.map(u=>'<div class="match-card"><div class="match-photo-blur" style="background-image:url('+u.photo+')"></div><div><b>'+u.firstName+'</b><br><small>'+u.genotype+' • '+u.residence+'</small></div><button class="btn-pink" style="padding:8px;margin:0;width:80px" onclick="showNotify(\\'Contacté !\\')">Chat</button></div>').join('') || '<p style="text-align:center;padding:20px;">Aucun partenaire compatible pour le moment.</p>';
        </script></body></html>`);
    } catch (e) { res.send("Erreur"); }
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove V3.1 ACTIVE sur port ${port}`);
});

process.on('SIGTERM', () => {
    server.close(() => { mongoose.connection.close(); process.exit(0); });
});
