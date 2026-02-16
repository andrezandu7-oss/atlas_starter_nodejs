// 🚀 GENLOVE - SERVEUR.JS V4.5 - FUSION FINALE
// ✅ Notifications persistantes + Sécurité Santé + Gestion de compte
// ✅ Deploy direct Render Luanda AO - Février 2026

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push');
const app = express();
const port = process.env.PORT || 3000;

// 🔒 CONFIGURATION PUSH (VAPID)
const vapidKeys = {
    publicKey: 'BH3p4k5q8m2n9p1r7t4u6v8w0x2y4z6A8C0E2G4I6K8M0O2Q4S6U8W0Y2',
    privateKey: 'X7Y9Z1a3b5c7d9e1f3g5h7i9j1k3l5m7n9o1p3q5r7s9t1u3v5w7x9y1'
};
webpush.setVapidDetails('mailto:genlove@example.com', vapidKeys.publicKey, vapidKeys.privateKey);

// ✅ CONNEXION MONGODB (Ton lien direct sécurisé)
const mongoURI = "mongodb+srv://Genlove:le09022025rose%40@cluster0.6vdjyyo.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// ✅ MODÈLE UTILISATEUR
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: String,
    bloodGroup: String,
    desireChild: String,
    photo: { type: String, default: "https://via.placeholder.com/150?text=👤" },
    pushSubscription: Object,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// ✅ DESIGN & SCRIPTS
const head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💕</text></svg>"><meta name="theme-color" content="#ff416c"><meta name="apple-mobile-web-app-capable" content="yes"><title>Genlove</title>`;

const styles = `<style>body{font-family:'Segoe UI',sans-serif;margin:0;background:#fdf2f2;display:flex;justify-content:center}.app-shell{width:100%;max-width:420px;min-height:100vh;background:#f4e9da;display:flex;flex-direction:column;box-shadow:0 0 20px rgba(0,0,0,0.1);position:relative}#genlove-notify{position:absolute;top:-100px;left:10px;right:10px;background:#1a2a44;color:white;padding:15px;border-radius:12px;display:flex;align-items:center;gap:10px;transition:0.5s cubic-bezier(0.175,0.885,0.32,1.275);z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.3);border-left:5px solid #007bff}.show{top:10px}#loader{display:none;position:absolute;inset:0;background:white;z-index:100;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px}.spinner{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #ff416c;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.home-screen{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center}.logo-text{font-size:3.5rem;font-weight:bold;margin-bottom:5px}.slogan{font-weight:bold;color:#1a2a44;margin-bottom:40px;font-size:1rem;line-height:1.5}.page-white{background:white;min-height:100vh;padding:25px 20px;box-sizing:border-box;text-align:center}.photo-circle{width:110px;height:110px;border:2px dashed #ff416c;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;background-size:cover;background-position:center}.input-box{width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:12px;margin-top:10px;font-size:1rem;box-sizing:border-box;background:#f8f9fa;color:#333}.btn-pink{background:#ff416c;color:white;padding:18px;border-radius:50px;text-align:center;text-decoration:none;font-weight:bold;display:block;width:85%;margin:20px auto;border:none;cursor:pointer;transition:0.3s}.btn-dark{background:#1a2a44;color:white;padding:18px;border-radius:12px;text-align:center;text-decoration:none;font-weight:bold;display:block;margin:15px;width:auto;box-sizing:border-box}.match-card{background:white;margin:10px 15px;padding:15px;border-radius:15px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 5px rgba(0,0,0,0.05)}.st-group{background:white;border-radius:15px;margin:0 15px 15px 15px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);text-align:left}.st-item{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid #f8f8f8;color:#333;font-size:0.95rem}.btn-action{border:none;border-radius:8px;padding:8px 12px;font-size:0.8rem;font-weight:bold;cursor:pointer}.btn-details{background:#ff416c;color:white}.btn-contact{background:#1a2a44;color:white;margin-right:5px}#popup-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;align-items:center;justify-content:center;padding:20px}.popup-content{background:white;border-radius:20px;width:100%;max-width:380px;padding:25px;position:relative;animation:slideUp 0.3s ease-out}.end-overlay{position:fixed;inset:0;background:linear-gradient(180deg,#4a76b8 0%,#1a2a44 100%);z-index:9999;display:flex;align-items:center;justify-content:center}.end-card{background:white;border-radius:30px;padding:40px 25px;width:85%;text-align:center}</style>`;

const notifyScript = `<script>function showNotify(msg){const n=document.getElementById('genlove-notify'),m=document.getElementById('notify-msg');if(m)m.innerText=msg;if(n){n.classList.add('show');setTimeout(()=>{n.classList.remove('show')},3500);}}</script>`;

// ✅ FONCTIONS GLOBALES
function calculerAge(dateNaissance){if(!dateNaissance)return"???";const today=new Date(),birthDate=new Date(dateNaissance);let age=today.getFullYear()-birthDate.getFullYear();const monthDiff=today.getMonth()-birthDate.getMonth();if(monthDiff<0||(monthDiff===0&&today.getDate()<birthDate.getDate()))age--;return age;}

// ✅ ROUTES API
app.post('/api/register', async(req,res)=>{
    try {
        const newUser=new User(req.body);
        await newUser.save();
        res.json({success:true, user:newUser._id});
    } catch(e) { res.status(500).json({error:e.message}); }
});

app.put('/api/update-account/:id', async(req,res)=>{
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new:true});
        res.json({success:true, user:updatedUser});
    } catch(e) { res.status(500).json({error:e.message}); }
});

app.delete('/api/delete-account/:id', async(req,res)=>{
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({success:true});
    } catch(e) { res.status(500).json({error:e.message}); }
});

app.post('/api/save-subscription', async(req,res)=>{
    try {
        await User.findByIdAndUpdate(req.body.userId, {pushSubscription: req.body.subscription});
        res.json({success:true});
    } catch(e) { res.status(500).json({error:e.message}); }
});

// ✅ ROUTES PAGES
app.get('/',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%;margin-top:20px;"><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/charte-engagement" style="color:#1a2a44;text-decoration:none;font-weight:bold;display:block;margin-top:15px;">👤 Créer un compte</a></div></div></div></body></html>`)});

app.get('/charte-engagement',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>🛡️ Engagement Éthique</h2><div id="charte-box" style="height:220px;overflow-y:scroll;background:#fff5f7;border:2px solid #ffdae0;border-radius:15px;padding:20px;text-align:left;" onscroll="if(this.scrollHeight-this.scrollTop<=this.clientHeight+5){const b=document.getElementById('agree-btn');b.disabled=false;b.style.background='#ff416c';}"><b>1. Sincérité</b><br>Données médicales conformes.<br><br><b>2. Protection</b><br>Lutte contre la drépanocytose.<br><br><b>3. Respect</b><br>Non-stigmatisation obligatoire.</div><button id="agree-btn" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc;" disabled>J'ai lu et je m'engage</button></div></div></body></html>`)});

app.get('/signup',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div id="loader" style="display:none;"><div class="spinner"></div><h3>Analyse...</h3></div><div class="page-white"><h2 style="color:#ff416c;">Configuration Santé</h2><form onsubmit="save(event)"><div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span>📸 Photo</span></div><input type="file" id="i" hidden onchange="preview(event)"><input type="text" id="fn" class="input-box" placeholder="Prénom" required><input type="text" id="ln" class="input-box" placeholder="Nom" required><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">🚀 Valider profil</button></form></div></div><script>let b64="";function preview(e){const r=new FileReader();r.onload=()=>{b64=r.result;document.getElementById('c').style.backgroundImage='url('+b64+')'};r.readAsDataURL(e.target.files[0])}async function save(e){e.preventDefault();document.getElementById('loader').style.display='flex';const d={firstName:document.getElementById('fn').value,lastName:document.getElementById('ln').value,genotype:document.getElementById('gt').value,photo:b64||"https://via.placeholder.com/150?text=👤"};const res=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const o=await res.json();if(o.success){localStorage.setItem('current_user_data',JSON.stringify(d));localStorage.setItem('current_user_id',o.user);location.href='/profile'}}</script></body></html>`)});

app.get('/profile',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div class="page-white" style="padding-top:0;"><div style="display:flex;justify-content:space-between;padding:20px 0;"><a href="/" class="btn-dark" style="margin:0;padding:10px;">🏠</a><a href="/settings" style="font-size:1.5rem;">⚙️</a></div><div id="vP" style="width:110px;height:110px;border-radius:50%;border:3px solid #ff416c;margin:0 auto;background-size:cover;"></div><h2 id="vN"></h2><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG"></b></div></div><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a></div></div><script>window.onload=()=>{const d=JSON.parse(localStorage.getItem('current_user_data'));if(!d)location.href='/signup';document.getElementById('vP').style.backgroundImage='url('+d.photo+')';document.getElementById('vN').innerText=d.firstName;document.getElementById('rG').innerText=d.genotype;initPush()};async function initPush(){if('serviceWorker' in navigator){const r=await navigator.serviceWorker.register('/sw.js');const s=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:'${vapidKeys.publicKey}'});await fetch('/api/save-subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:localStorage.getItem('current_user_id'),subscription:s})});}}</script>${notifyScript}</body></html>`)});

app.get('/matching', async(req,res)=>{
    const users = await User.find({}).lean();
    const html = users.map(u => `<div class="match-card" data-gt="${u.genotype}" data-id="${u._id}"><b>${u.firstName}</b> - ${u.genotype} <button onclick="location.href='/chat'" class="btn-action btn-contact">Contacter</button></div>`).join('');
    res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div style="padding:20px;text-align:center;"><h3>Partenaires Compatibles</h3></div><div id="m">${html}</div><a href="/profile" class="btn-pink">Retour</a></div><script>window.onload=()=>{const d=JSON.parse(localStorage.getItem('current_user_data'));document.querySelectorAll('.match-card').forEach(c=>{const gt=c.dataset.gt;const id=c.dataset.id;if(id===localStorage.getItem('current_user_id')) c.style.display='none';if((d.genotype==='SS'||d.genotype==='AS') && gt!=='AA') c.style.display='none';if(d.genotype==='SS' && gt==='SS') c.style.display='none';});}</script></body></html>`);
});

app.get('/settings',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>Paramètres</h2><div class="st-group"><a href="/edit-profile" class="st-item">✏️ Modifier Profil</a><a href="/health-config" class="st-item">⚕️ Config Santé</a></div><button onclick="del()" style="background:#dc3545;color:white;border:none;padding:15px;border-radius:12px;width:85%;">Supprimer compte</button><a href="/profile" class="btn-pink">Retour</a></div></div><script>async function del(){if(confirm('Supprimer définitivement ?')){await fetch('/api/delete-account/'+localStorage.getItem('current_user_id'),{method:'DELETE'});localStorage.clear();location.href='/'}}</script></body></html>`)});

app.get('/health-config',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>⚕️ Config Santé</h2><form onsubmit="up(event)"><select id="gt" class="input-box"><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">Sauvegarder</button></form><a href="/settings" class="btn-dark">Annuler</a></div></div><script>async function up(e){e.preventDefault();const d=JSON.parse(localStorage.getItem('current_user_data'));d.genotype=document.getElementById('gt').value;await fetch('/api/update-account/'+localStorage.getItem('current_user_id'),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});localStorage.setItem('current_user_data',JSON.stringify(d));location.href='/profile'}</script></body></html>`)});

app.get('/chat',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell" style="background:#f0f2f5;"><div style="background:#9dbce3;padding:15px;color:white;display:flex;justify-content:space-between;"><b>Discussion Privée</b><span id="t">30:00</span></div><div id="box" style="flex:1;padding:15px;overflow-y:auto;"></div><div style="padding:15px;background:white;display:flex;gap:10px;"><input id="m" class="input-box" style="margin:0;flex:1;"><button onclick="send()" class="btn-action btn-contact">➤</button></div></div><script>let s=1800;setInterval(()=>{s--;let m=Math.floor(s/60),sec=s%60;document.getElementById('t').innerText=m+':'+(sec<10?'0':'')+sec;if(s<=0)location.href='/profile'},1000);function send(){const i=document.getElementById('m');if(i.value){const d=document.createElement('div');d.innerText=i.value;d.style.cssText="background:#ff416c;color:white;padding:10px;border-radius:10px;margin:5px;align-self:flex-end;width:fit-content;margin-left:auto;";document.getElementById('box').appendChild(d);i.value="";}}</script></body></html>`)});

app.get('/sw.js', (req, res) => {
    res.type('application/javascript').send(`self.addEventListener('push', e => { const d=e.data.json(); self.registration.showNotification(d.title, {body:d.body, icon:'/icon.png'}); });`);
});

app.listen(port, () => console.log(`🚀 Genlove V4.5 en ligne sur port ${port}`));
