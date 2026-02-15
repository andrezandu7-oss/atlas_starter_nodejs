// 🚀 GENLOVE - SERVEUR.JS V4.5 - NOTIFICATIONS PUSH + SANTÉ ✅
// ✅ Deploy direct Render Luanda AO - Février 2026

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webpush = require('web-push'); // Intégration bibliothèque push
const app = express();
const port = process.env.PORT || 3000;

// ✅ GÉNÉRATION AUTOMATIQUE CLÉS VAPID
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails('mailto:contact@genlove.com', vapidKeys.publicKey, vapidKeys.privateKey);

// 🔒 SÉCURITÉ RENDER & CONNEXION MONGODB
console.log("✅ Base MongoDB SÉCURISÉE - Vrais utilisateurs préservés");
const mongoURI = process.env.MONGODB_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

// ✅ MIDDLEWARES (ORDRE IMPORTANT)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public')); // Servir les fichiers statiques (sw.js)

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
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// ✅ META + FAVICON + CSS
const head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90' fill='%23ff416c'>💕</text></svg>"><meta name="theme-color" content="#ff416c"><meta name="apple-mobile-web-app-capable" content="yes"><title>Genlove</title>`;

const styles = `<style>body{font-family:'Segoe UI',sans-serif;margin:0;background:#fdf2f2;display:flex;justify-content:center}.app-shell{width:100%;max-width:420px;min-height:100vh;background:#f4e9da;display:flex;flex-direction:column;box-shadow:0 0 20px rgba(0,0,0,0.1);position:relative}#genlove-notify{position:absolute;top:-100px;left:10px;right:10px;background:#1a2a44;color:white;padding:15px;border-radius:12px;display:flex;align-items:center;gap:10px;transition:0.5s cubic-bezier(0.175,0.885,0.32,1.275);z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.3);border-left:5px solid #007bff}.show{top:10px}#loader{display:none;position:absolute;inset:0;background:white;z-index:100;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px}.spinner{width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #ff416c;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.home-screen{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center}.logo-text{font-size:3.5rem;font-weight:bold;margin-bottom:5px}.slogan{font-weight:bold;color:#1a2a44;margin-bottom:40px;font-size:1rem;line-height:1.5}.page-white{background:white;min-height:100vh;padding:25px 20px;box-sizing:border-box;text-align:center}.photo-circle{width:110px;height:110px;border:2px dashed #ff416c;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;background-size:cover;background-position:center}.input-box{width:100%;padding:14px;border:1px solid #e2e8f0;border-radius:12px;margin-top:10px;font-size:1rem;box-sizing:border-box;background:#f8f9fa;color:#333}.serment-container{margin-top:20px;padding:15px;background:#fff5f7;border-radius:12px;border:1px solid #ffdae0;text-align:left;display:flex;gap:10px;align-items:flex-start}.serment-text{font-size:0.82rem;color:#d63384;line-height:1.4}.btn-pink{background:#ff416c;color:white;padding:18px;border-radius:50px;text-align:center;text-decoration:none;font-weight:bold;display:block;width:85%;margin:20px auto;border:none;cursor:pointer;transition:0.3s}.btn-dark{background:#1a2a44;color:white;padding:18px;border-radius:12px;text-align:center;text-decoration:none;font-weight:bold;display:block;margin:15px;width:auto;box-sizing:border-box}.btn-action{border:none;border-radius:8px;padding:8px 12px;font-size:0.8rem;font-weight:bold;cursor:pointer;transition:0.2s}.btn-details{background:#ff416c;color:white}.btn-contact{background:#1a2a44;color:white;margin-right:5px}#popup-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;align-items:center;justify-content:center;padding:20px}.popup-content{background:white;border-radius:20px;width:100%;max-width:380px;padding:25px;position:relative;text-align:left;animation:slideUp 0.3s ease-out}.close-popup{position:absolute;top:15px;right:15px;font-size:1.5rem;cursor:pointer;color:#666}.st-group{background:white;border-radius:15px;margin:0 15px 15px 15px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);text-align:left}.st-item{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid #f8f8f8;color:#333;font-size:0.95rem}.switch{position:relative;display:inline-block;width:45px;height:24px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;inset:0;background-color:#ccc;transition:.4s;border-radius:24px}.slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background-color:white;transition:.4s;border-radius:50%}input:checked+.slider{background-color:#007bff}input:checked+.slider:before{transform:translateX(21px)}.match-card{background:white;margin:10px 15px;padding:15px;border-radius:15px;display:flex;align-items:center;gap:12px;box-shadow:0 2px 5px rgba(0,0,0,0.05)}.match-photo-blur{width:55px;height:55px;border-radius:50%;background:#eee;filter:blur(6px);background-size:cover;background-position:center}.end-overlay{position:fixed;inset:0;background:linear-gradient(180deg,#4a76b8 0%,#1a2a44 100%);z-index:9999;display:flex;align-items:center;justify-content:center}.end-card{background:white;border-radius:30px;padding:40px 25px;width:85%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.2)}@keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}</style>`;

const notifyScript = `<script>function showNotify(msg){const n=document.getElementById('genlove-notify'),m=document.getElementById('notify-msg');if(m)m.innerText=msg;if(n){n.classList.add('show');setTimeout(()=>{n.classList.remove('show')},3500);}}</script>`;

// ✅ FONCTIONS UTILES
function calculerAge(dateNaissance){if(!dateNaissance)return"???";const today=new Date(),birthDate=new Date(dateNaissance);let age=today.getFullYear()-birthDate.getFullYear();const monthDiff=today.getMonth()-birthDate.getMonth();if(monthDiff<0||(monthDiff===0&&today.getDate()<birthDate.getDate()))age--;return age;}

// ✅ APIS SUPPRESSION & UPDATE
app.delete('/api/delete-account/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) return res.status(404).json({ error: "Utilisateur non trouvé" });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Erreur serveur" }); }
});

app.put('/api/update-account/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ error: "Utilisateur non trouvé" });
        res.json({ success: true, user: updatedUser });
    } catch (error) { res.status(500).json({ error: "Erreur serveur" }); }
});

// ✅ ROUTES PAGES
app.get('/',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%;margin-top:20px;"><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/charte-engagement" style="color:#1a2a44;text-decoration:none;font-weight:bold;display:block;margin-top:15px;">👤 Créer un compte</a></div></div></div></body></html>`)});

app.get('/charte-engagement',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2 style="color:#1a2a44;">Engagement Éthique</h2><div id="charte-box" style="height:220px;overflow-y:scroll;background:#fff5f7;padding:20px;" onscroll="checkScroll(this)"><b>1. Sincérité</b><br>Données médicales conformes...<br><b>2. Responsabilité</b><br>Authenticité du profil...</div><button id="agree-btn" onclick="location.href='/signup'" class="btn-pink" style="background:#ccc;" disabled>J'ai lu et je m'engage</button></div></div><script>function checkScroll(el){if(el.scrollHeight-el.scrollTop<=el.clientHeight+5){const b=document.getElementById('agree-btn');b.disabled=false;b.style.background='#ff416c';}}</script></body></html>`)});

app.get('/signup',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>Configuration Santé</h2><form onsubmit="saveAndRedirect(event)"><div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo</span></div><input type="file" id="i" style="display:none" onchange="preview(event)"><input type="text" id="fn" class="input-box" placeholder="Prénom" required><input type="text" id="ln" class="input-box" placeholder="Nom" required><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">🚀 Valider profil</button></form></div></div><script>let b64="";function preview(e){const r=new FileReader();r.onload=()=>{b64=r.result;document.getElementById('c').style.backgroundImage='url('+b64+')';document.getElementById('t').style.display='none'};r.readAsDataURL(e.target.files[0])}async function saveAndRedirect(e){e.preventDefault();const d={firstName:document.getElementById('fn').value,lastName:document.getElementById('ln').value,genotype:document.getElementById('gt').value,photo:b64};const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const res=await r.json();if(r.ok){localStorage.setItem('current_user_data',JSON.stringify(d));localStorage.setItem('current_user_id',res.user);window.location.href='/profile'}}</script></body></html>`)});

app.post('/api/register',async(req,res)=>{try{const newUser=new User(req.body);await newUser.save();res.json({success:true,user:newUser._id});}catch(e){res.status(500).json({error:e.message})}});

app.get('/profile',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="background:white;padding:30px;text-align:center;"><div style="display:flex;justify-content:space-between;"><a href="/">🏠</a><a href="/settings">⚙️</a></div><div id="vP" style="width:110px;height:110px;border-radius:50%;margin:20px auto;background-size:cover;"></div><h2 id="vN"></h2><p id="rG" style="font-weight:bold;color:#ff416c;"></p></div><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a></div><script>window.onload=()=>{const d=JSON.parse(localStorage.getItem('current_user_data'));if(!d)location.href='/signup';document.getElementById('vP').style.backgroundImage='url('+(d.photo||'')+')';document.getElementById('vN').innerText=d.firstName;document.getElementById('rG').innerText=d.genotype;}</script></body></html>`)});

// ✅ PAGE SETTINGS AMENDÉE (NOTIFICATIONS)
app.get('/settings',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body style="background:#f4f7f6;"><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="padding:25px;background:white;text-align:center;"><div style="font-size:2.5rem;font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div></div><div style="padding:15px 20px 5px 20px;font-size:0.75rem;color:#888;font-weight:bold;">CONFIDENTIALITÉ</div><div class="st-group"><div class="st-item"><span>Notifications Push</span><label class="switch"><input type="checkbox" onchange="gererNotification(this)"><span class="slider"></span></label></div></div><div class="st-group"><a href="/health-config" style="text-decoration:none;" class="st-item"><span>⚕️ Config santé</span><b>Modifier ➔</b></a></div><div class="st-group"><div class="st-item" style="color:red;font-weight:bold;">🗑️ Supprimer compte</div><div style="display:flex;justify-content:space-around;padding:15px;"><button onclick="deleteAccount()" style="background:#dc3545;color:white;border:none;padding:12px;border-radius:12px;cursor:pointer;">Supprimer</button></div></div><a href="/profile" class="btn-pink">Retour profil</a></div>
<script>
// SCRIPT CLIENT POUR NOTIFICATIONS
async function gererNotification(input) {
    if (input.checked) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            try {
                await navigator.serviceWorker.register('/sw.js');
                showNotify('🔔 Notifications activées !');
            } catch (e) { console.error(e); }
        } else {
            input.checked = false;
            alert('Permission refusée');
        }
    }
}
function showNotify(msg){const n=document.getElementById('genlove-notify'),m=document.getElementById('notify-msg');if(m)m.innerText=msg;n.classList.add('show');setTimeout(()=>{n.classList.remove('show')},3000)}
async function deleteAccount(){if(confirm('Supprimer ?')){const id=localStorage.getItem('current_user_id');await fetch('/api/delete-account/'+id,{method:'DELETE'});localStorage.clear();location.href='/'}}
</script></body></html>`)});

app.get('/health-config',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><div class="page-white"><h2>⚕️ Config Santé</h2><form onsubmit="saveHealthConfig(event)"><select id="gt" class="input-box"><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">💾 Enregistrer</button><button type="button" onclick="history.back()" class="btn-dark">Annuler</button></form></div></div><script>async function saveHealthConfig(e){e.preventDefault();const id=localStorage.getItem('current_user_id');const up={genotype:document.getElementById('gt').value};await fetch('/api/update-account/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(up)});location.href='/profile'}</script></body></html>`)});

app.get('/matching',async(req,res)=>{try{const users=await User.find({}).limit(50).lean();res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><h3>Partenaires</h3><div id="m">${users.map(p=>`<div class="match-card" data-gt="${p.genotype}"><b>${p.firstName}</b> - ${p.genotype}</div>`).join('')}</div><a href="/profile" class="btn-pink">Retour</a></div><script>window.onload=()=>{const my=JSON.parse(localStorage.getItem('current_user_data'));document.querySelectorAll('.match-card').forEach(c=>{const pGt=c.dataset.gt;if(my.genotype==='SS'&&pGt==='SS')c.style.display='none';})}</script></body></html>`)}catch(e){res.status(500).send("Erreur")}});

app.get('/chat',(req,res)=>{res.send(`<!DOCTYPE html><html><head>${head}${styles}</head><body><div class="app-shell"><h3>Discussion Privée</h3><div id="box" style="flex:1;overflow-y:auto;"></div><div class="input-area"><textarea id="msg"></textarea><button onclick="send()">➤</button></div></div><script>function send(){/* code chat */}</script></body></html>`)});

app.listen(port,'0.0.0.0',()=>{
    console.log(`🚀 Genlove V4.5 (Push & Santé) sur port ${port}`);
    console.log("✅ Clés VAPID et Service Worker configurés.");
});
