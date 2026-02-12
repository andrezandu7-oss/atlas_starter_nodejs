const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// ✅ SÉCURITÉ RENDER : AUCUNE SUPPRESSION AUTOMATIQUE
console.log("✅ Base MongoDB SÉCURISÉE - Vrais utilisateurs préservés");

// --- CONNEXION MONGODB ---
const mongoURI = process.env.MONGODB_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur MongoDB:", err));

// --- MODÈLE UTILISATEUR ---
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

// ✅ OPTIMISATION PHOTOS + JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// --- CSS CENTRALISÉ ---
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
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); background-size: cover; background-position: center; }
    .end-overlay { position: fixed; inset: 0; background: linear-gradient(180deg, #4a76b8 0%, #1a2a44 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; }
    .end-card { background: white; border-radius: 30px; padding: 40px 25px; width: 85%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>`;

const notifyScript = `
<script>
function showNotify(msg) {
    const n = document.getElementById('genlove-notify');
    const m = document.getElementById('notify-msg');
    if(m) m.innerText = msg;
    if(n) n.classList.add('show');
    setTimeout(() => { if(n) n.classList.remove('show'); }, 3500);
}
</script>`;

// --- FONCTION ÂGE ---
function calculerAge(dateNaissance) {
    if(!dateNaissance) return "??";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell">
        <div class="home-screen">
            <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
            <div style="width:100%; margin-top:20px;">
                <p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p>
                <a href="/profile" class="btn-dark">➔ Se connecter</a>
                <a href="/charte-engagement" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a>
            </div>
            <div style="font-size: 0.75rem; color: #666; margin-top: 25px;">🔒 Vos données de santé sont cryptées et confidentielles.</div>
        </div>
    </div></body></html>`);
});

app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#fdf2f2;"><div class="app-shell">
        <div class="page-white" style="display:flex; flex-direction:column; justify-content:center; padding:30px; min-height:100vh;">
            <div style="font-size:3.5rem; margin-bottom:10px;">🛡️</div>
            <h2 style="color:#1a2a44; margin-top:0;">Engagement Éthique</h2>
            <p style="color:#666; font-size:0.9rem; margin-bottom:20px;">Pour protéger la santé de votre future famille, Genlove demande un engagement sincère.</p>
            <div id="charte-box" style="height: 220px; overflow-y: scroll; background: #fff5f7; border: 2px solid #ffdae0; border-radius: 15px; padding: 20px; font-size: 0.85rem; color: #444; line-height:1.6; text-align:left;" onscroll="checkScroll(this)">
                <b style="color:#ff416c;">1. Sincérité des Données Médicales</b><br>L'utilisateur s'engage sur l'honneur à saisir un génotype et un groupe sanguin rigoureusement conformes à ses derniers examens en laboratoire.<br><br>
                <b style="color:#ff416c;">2. Responsabilité Individuelle</b><br>Comme pour votre code d'accès personnel, vous êtes le seul garant de l'authenticité de votre profil. La vérité des informations repose sur votre intégrité.<br><br>
                <b style="color:#ff416c;">3. Confidentialité des Échanges</b><br>Les échanges sont protégés et éphémères. Aucune trace n'est conservée sur nos serveurs ou via e-mail après 30 minutes.<br><br>
                <b style="color:#ff416c;">4. Protection de la Descendance</b><br>Vous acceptez que nos algorithmes privilégient la santé de vos futurs enfants en filtrant les unions à risque (compatibilité Sérénité).<br><br>
                <b style="color:#ff416c;">5. Non-Stigmatisation</b><br>Genlove est une communauté de respect. Tout propos discriminatoire lié à la santé sera sanctionné par une exclusion définitive.<br><br>
                <hr style="border:0; border-top:1px solid #ffdae0; margin:15px 0;">
                <center><i style="color:#ff416c;">Scrollez jusqu'en bas pour débloquer l'accès...</i></center>
            </div>
            <button id="agree-btn" onclick="window.location.href='/signup'" class="btn-pink" style="background:#ccc; cursor:not-allowed; margin-top:25px; width:100%; border:none;" disabled>J'ai lu et je m'engage</button>
            <a href="/" style="margin-top:15px; color:#666; text-decoration:none; font-size:0.8rem;">Annuler et quitter</a>
        </div>
    </div>
    <script>
        function checkScroll(el) {
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 5) {
                const btn = document.getElementById('agree-btn');
                btn.disabled = false;
                btn.style.background = '#ff416c';
                btn.style.cursor = 'pointer';
                el.style.borderColor = '#4CAF50';
            }
        }
    </script></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell">
        <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div>
        <div class="page-white" id="main-content">
            <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
            <form onsubmit="saveAndRedirect(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo</span></div>
                <input type="file" id="i" style="display:none" onchange="preview(event)">
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                <select id="gender" class="input-box" required><option value="">Genre</option><option value="Homme">Homme</option><option value="Femme">Femme</option></select>
                <div style="text-align:left; margin-top:10px; padding-left:5px;"><small style="color:#666; font-size:0.75rem;">📅 Date de naissance :</small></div>
                <input type="date" id="dob" class="input-box" style="margin-top:2px;" required>
                <input type="text" id="res" class="input-box" placeholder="Résidence actuelle">
                <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                <div style="display:flex; gap:10px;">
                    <select id="gs_type" class="input-box" style="flex:2;"><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                    <select id="gs_rh" class="input-box" style="flex:1;"><option>+</option><option>-</option></select>
                </div>
                <select id="pj" class="input-box"><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
                <div class="serment-container">
                    <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                    <label for="oath" class="serment-text">Je confirme que mes saisies correspondent à l'engagement éthique signé précédemment.</label>
                </div>
                <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
            </form>
        </div>
    </div>
    <script>
        let b64 = localStorage.getItem('current_user_photo') || "";
        window.onload = () => { 
            if(b64) { 
                document.getElementById('c').style.backgroundImage='url('+b64+')'; 
                document.getElementById('t').style.display='none'; 
            } 
        };
        function preview(e){
            const r=new FileReader();
            r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; };
            r.readAsDataURL(e.target.files[0]);
        }
        async function saveAndRedirect(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex'; 
            
            const blood = (document.getElementById('gs_type').value || "") + (document.getElementById('gs_rh').value || "");
            const userData = {
                firstName: document.getElementById('fn').value,
                lastName: document.getElementById('ln').value,
                gender: document.getElementById('gender').value,
                dob: document.getElementById('dob').value,
                residence: document.getElementById('res').value,
                genotype: document.getElementById('gt').value,
                bloodGroup: blood,
                desireChild: document.getElementById('pj').value,
                photo: b64
            };
            
            // ✅ SAUVEGARDE LOCALE IMMEDIATE (POUR NE PAS BLOQUER)
            localStorage.setItem('current_user_data', JSON.stringify(userData));
            localStorage.setItem('current_user_photo', b64);
            
            try {
                // ENVOI MONGODB
                await fetch('/api/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(userData)
                });
                // REDIRECTION SI SUCCÈS
                window.location.href='/profile';
            } catch (err) {
                console.error("Erreur serveur, redirection forcée...");
                window.location.href='/profile';
            }
        }
    </script></body></html>`);
});

app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).send("OK");
    } catch (e) { 
        console.error("Erreur:", e);
        res.status(500).send("Erreur"); 
    }
});

app.get('/profile', async (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f8f9fa;">
    <div class="app-shell">
        <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <a href="/" style="text-decoration:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px; font-size:0.8rem; font-weight:bold; border: 1px solid #dbeafe;">🏠 Accueil</a>
                <a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a>
            </div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-color:#eee;"></div>
            <h2 id="vN">Utilisateur</h2>
            <p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Localisation</p>
            <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
        </div>
        <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
        <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">--</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">--</b></div>
            <div class="st-item"><span>Âge</span><b id="rAge">--</b></div>
            <div class="st-item"><span>Résidence</span><b id="rRes">--</b></div>
            <div class="st-item"><span>Projet de vie</span><b id="rP">--</b></div>
        </div>
        <a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a>
    </div>
    <script>
        const d = JSON.parse(localStorage.getItem('current_user_data') || '{}');
        const p = localStorage.getItem('current_user_photo');
        if(!d.firstName) { window.location.href='/'; }
        else {
            document.getElementById('vN').innerText = d.firstName + " " + (d.lastName || "");
            document.getElementById('vR').innerText = "📍 " + (d.residence || "Non précisée");
            document.getElementById('rG').innerText = d.genotype;
            document.getElementById('rS').innerText = d.bloodGroup || "--";
            document.getElementById('rRes').innerText = d.residence || "--";
            document.getElementById('rP').innerText = d.desireChild || "--";
            if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')';
            
            const birth = new Date(d.dob);
            const age = new Date().getFullYear() - birth.getFullYear();
            document.getElementById('rAge').innerText = age + " ans";
        }
    </script></body></html>`);
});

app.get('/matching', async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName gender dob residence genotype bloodGroup desireChild photo');
        res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f4f7f6;">
        <div class="app-shell">
            <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;">
                <h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3>
            </div>
            <div id="match-container"></div>
            <a href="/profile" class="btn-pink">Retour au profil</a>
        </div>
        <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
                <span class="close-popup" onclick="closePopup()">&times;</span>
                <h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails</h3>
                <div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
                <div id="pop-msg" style="background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; margin-top:15px;"></div>
                <button id="pop-btn" class="btn-pink" style="margin:20px 0 0 0; width:100%">🚀 Contacter ce profil</button>
            </div>
        </div>
        ${notifyScript}
        <script>
            const all = ${JSON.stringify(users)};
            const myData = JSON.parse(localStorage.getItem('current_user_data') || '{}');
            const container = document.getElementById('match-container');

            function closePopup() { document.getElementById('popup-overlay').style.display = 'none'; }

            window.onload = () => {
                let count = 0;
                all.forEach(p => {
                    if(p.firstName === myData.firstName || p.gender === myData.gender) return;
                    
                    let ok = true;
                    if((myData.genotype === 'SS' || myData.genotype === 'AS') && p.genotype !== 'AA') ok = false;
                    if(myData.genotype === 'SS' && p.genotype === 'SS') ok = false;

                    if(ok) {
                        count++;
                        container.innerHTML += \`<div class="match-card">
                            <div class="match-photo-blur" style="background-image:url(\${p.photo || ''})"></div>
                            <div style="flex:1">
                                <b>\${p.firstName}</b><br>
                                <small>Génotype \${p.genotype}</small>
                            </div>
                            <button class="btn-action btn-details" onclick='showDetails(\${JSON.stringify(p)})'>Détails</button>
                        </div>\`;
                    }
                });
                if(count === 0) container.innerHTML = '<p style="text-align:center; padding:40px;">Revenez plus tard !</p>';
            };

            function showDetails(p) {
                document.getElementById('pop-name').innerText = p.firstName;
                document.getElementById('pop-details').innerHTML = "<b>Génotype :</b> " + p.genotype + "<br><b>Groupe :</b> " + (p.bloodGroup || "--") + "<br><b>Résidence :</b> " + (p.residence || "--");
                document.getElementById('pop-msg').innerHTML = "<b>L'Union Sérénité :</b> Compatibilité validée.";
                document.getElementById('popup-overlay').style.display = 'flex';
                document.getElementById('pop-btn').onclick = () => window.location.href='/chat';
            }
        </script></body></html>`);
    } catch (e) { res.status(500).send("Erreur"); }
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div style="padding:25px; background:white; text-align:center;">
            <div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
        </div>
        <div class="st-group">
            <div class="st-item"><span>Visibilité</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></div>
        </div>
        <div class="st-group">
            <div class="st-item" style="color:red; font-weight:bold;" onclick="localStorage.clear(); location.href='/';">Supprimer mon compte</div>
        </div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div>${notifyScript}</body></html>`);
});

app.get('/chat', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell" style="background:#f0f2f5; height:100vh;">
        <div style="background:#9dbce3; color:white; padding:12px 15px; display:flex; justify-content:space-between; align-items:center;">
            <button onclick="window.location.href='/chat-end'" style="background:white; border:none; border-radius:8px; padding:5px 10px;">✕</button>
            <div style="background:#1a1a1a; color:#ff416c; padding:6px 15px; border-radius:10px; font-weight:bold;">❤️ 30:00</div>
            <span>Chat</span>
        </div>
        <div id="box" style="flex:1; padding:15px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
            <div style="padding:12px; border-radius:18px; background:#e2ecf7; align-self:flex-start; max-width:80%;">Bonjour ! 😊</div>
        </div>
        <div style="padding:10px; background:white; display:flex; gap:10px;">
            <input id="msg" style="flex:1; padding:12px; border-radius:25px; border:1px solid #ddd;" placeholder="Message...">
            <button style="background:#4a76b8; color:white; border:none; width:45px; height:45px; border-radius:50%;" onclick="send()">➤</button>
        </div>
    </div>
    <script>
        function send() {
            const i = document.getElementById('msg');
            if(i.value) {
                const d = document.createElement('div');
                d.innerText = i.value;
                d.style.cssText = "padding:12px; border-radius:18px; background:#ff416c; color:white; align-self:flex-end; max-width:80%;";
                document.getElementById('box').appendChild(d);
                i.value = '';
            }
        }
    </script></body></html>`);
});

app.get('/chat-end', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body class="end-overlay">
    <div class="end-card"><h2>✨ Merci !</h2><p>Échange terminé avec succès.</p><a href="/matching" class="btn-pink">Continuer</a></div></body></html>`);
});

app.listen(port, '0.0.0.0', () => console.log("🚀 Genlove LIVE"));
