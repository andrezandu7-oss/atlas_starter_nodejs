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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- STYLES ET SCRIPTS PARTAGÉS ---
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
    .end-overlay { position: fixed; inset: 0; background: linear-gradient(180deg, #4a76b8 0%, #1a2a44 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; }
    .end-card { background: white; border-radius: 30px; padding: 40px 25px; width: 85%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
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
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/charte-engagement" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div><div style="font-size: 0.75rem; color: #666; margin-top: 25px;">🔒 Vos données de santé sont cryptées et confidentielles.</div></div></div></body></html>`);
});

app.get('/charte-engagement', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#fdf2f2;"><div class="app-shell">
        <div class="page-white" style="display:flex; flex-direction:column; justify-content:center; padding:30px; min-height:100vh;">
            <div style="font-size:3.5rem; margin-bottom:10px;">🛡️</div>
            <h2 style="color:#1a2a44; margin-top:0;">Engagement Éthique</h2>
            <p style="color:#666; font-size:0.9rem; margin-bottom:20px;">Pour protéger la santé de votre future famille, Genlove demande un engagement sincère.</p>
            
            <div id="charte-box" style="height: 220px; overflow-y: scroll; background: #fff5f7; border: 2px solid #ffdae0; border-radius: 15px; padding: 20px; font-size: 0.85rem; color: #444; line-height:1.6; text-align:left;" onscroll="checkScroll(this)">
                <b style="color:#ff416c;">1. Sincérité des Données Médicales</b><br>
                L'utilisateur s'engage sur l'honneur à saisir un génotype et un groupe sanguin rigoureusement conformes à ses derniers examens en laboratoire.<br><br>
                <b style="color:#ff416c;">2. Responsabilité Individuelle</b><br>
                Comme pour votre code d'accès personnel, vous êtes le seul garant de l'authenticité de votre profil. La vérité des informations repose sur votre intégrité.<br><br>
                <b style="color:#ff416c;">3. Confidentialité des Échanges</b><br>
                Les échanges sont protégés et éphémères. Aucune trace n'est conservée sur nos serveurs ou via e-mail après 30 minutes. L'utilisateur respecte la vie privée des partenaires.<br><br>
                <b style="color:#ff416c;">4. Protection de la Descendance</b><br>
                Vous acceptez que nos algorithmes privilégient la santé de vos futurs enfants en filtrant les unions à risque (compatibilité Sérénité).<br><br>
                <b style="color:#ff416c;">5. Non-Stigmatisation</b><br>
                Genlove est une communauté de respect. Tout propos discriminatoire lié à la santé sera sanctionné par une exclusion définitive.<br><br>
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
    </script>
    </body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div><div class="page-white" id="main-content"><h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2><form onsubmit="saveAndRedirect(event)"><div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo</span></div><input type="file" id="i" style="display:none" onchange="preview(event)"><input type="text" id="fn" class="input-box" placeholder="Prénom" required><input type="text" id="ln" class="input-box" placeholder="Nom" required><select id="gender" class="input-box"><option value="">Genre</option><option value="Homme">Homme</option><option value="Femme">Femme</option></select><div style="text-align:left; margin-top:10px; padding-left:5px;"><small style="color:#666; font-size:0.75rem;">📅 Date de naissance :</small></div><input type="date" id="dob" class="input-box" style="margin-top:2px;"><input type="text" id="res" class="input-box" placeholder="Résidence actuelle"><select id="gt" class="input-box"><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><div style="display:flex; gap:10px;"><select id="gs_type" class="input-box" style="flex:2;"><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select><select id="gs_rh" class="input-box" style="flex:1;"><option>+</option><option>-</option></select></div><select id="pj" class="input-box"><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select><div class="serment-container"><input type="checkbox" id="oath" style="width:20px;height:20px;" required><label for="oath" class="serment-text">Je confirme que mes saisies correspondent à l'engagement éthique signé précédemment.</label></div><button type="submit" class="btn-pink">🚀 Valider mon profil</button></form></div></div><script>let b64 = localStorage.getItem('u_p') || ""; window.onload = () => { if(b64) { document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; } document.getElementById('fn').value = localStorage.getItem('u_fn') || ""; document.getElementById('ln').value = localStorage.getItem('u_ln') || ""; document.getElementById('gender').value = localStorage.getItem('u_gender') || ""; document.getElementById('dob').value = localStorage.getItem('u_dob') || ""; document.getElementById('res').value = localStorage.getItem('u_res') || ""; document.getElementById('gt').value = localStorage.getItem('u_gt') || ""; const fullGS = localStorage.getItem('u_gs') || ""; if(fullGS) { document.getElementById('gs_type').value = fullGS.replace(/[+-]/g, ""); document.getElementById('gs_rh').value = fullGS.includes('+') ? '+' : '-'; } document.getElementById('pj').value = localStorage.getItem('u_pj') || ""; }; function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); } async function saveAndRedirect(e){ e.preventDefault(); document.getElementById('loader').style.display='flex'; 
    const userData = {
        firstName: document.getElementById('fn').value,
        lastName: document.getElementById('ln').value,
        gender: document.getElementById('gender').value,
        dob: document.getElementById('dob').value,
        residence: document.getElementById('res').value,
        genotype: document.getElementById('gt').value,
        bloodGroup: document.getElementById('gs_type').value ? (document.getElementById('gs_type').value + document.getElementById('gs_rh').value) : "",
        desireChild: document.getElementById('pj').value,
        photo: b64
    };
    localStorage.setItem('u_fn', userData.firstName);
    localStorage.setItem('u_ln', userData.lastName);
    localStorage.setItem('u_gender', userData.gender);
    localStorage.setItem('u_gt', userData.genotype);
    localStorage.setItem('u_gs', userData.bloodGroup);
    localStorage.setItem('u_dob', userData.dob);
    localStorage.setItem('u_res', userData.residence);
    localStorage.setItem('u_pj', userData.desireChild);
    localStorage.setItem('u_p', b64);
    
    await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    });

    setTimeout(() => { window.location.href='/profile'; }, 1500); 
    }</script></body></html>`);
});

app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).send("Enregistré");
    } catch (e) { res.status(500).send(e); }
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f8f9fa;"><div class="app-shell"><div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;"><div style="display:flex; justify-content:space-between; align-items:center;"><a href="/" style="text-decoration:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px; font-size:0.8rem; font-weight:bold; display:flex; align-items:center; gap:8px; border: 1px solid #dbeafe;">🏠 Accueil</a><a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a></div><div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-color:#eee;"></div><h2 id="vN" style="margin:5px 0 0 0;">Utilisateur</h2><p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Localisation</p><p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p></div><div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG">...</b></div><div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div><div class="st-item"><span>Âge</span><b id="rAge">...</b></div><div class="st-item"><span>Résidence</span><b id="rRes">...</b></div><div class="st-item"><span>Projet de vie (Enfant)</span><b id="rP">...</b></div></div><a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a></div><script>
    const p = localStorage.getItem('u_p'); 
    if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')';
    document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "Prénom") + " " + (localStorage.getItem('u_ln') || "Nom");
    document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || "Non précisée") + " (" + (localStorage.getItem('u_gender') || "?") + ")";
    document.getElementById('rG').innerText = localStorage.getItem('u_gt') || "Non renseigné";
    document.getElementById('rS').innerText = localStorage.getItem('u_gs') || "Non renseigné";
    document.getElementById('rP').innerText = localStorage.getItem('u_pj') || "Non précisé";
    document.getElementById('rRes').innerText = localStorage.getItem('u_res') || "Non renseignée";
    const dob = localStorage.getItem('u_dob');
    if(dob) {
        const age = Math.floor((new Date() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        document.getElementById('rAge').innerText = age + ' ans';
    }
</script></body></html>`);
});

// --- ROUTE MATCHING DYNAMIQUE (RÉPARÉE AVEC FILTRAGE ROBUSTE) ---
app.get('/matching', async (req, res) => {
    try {
        const realUsers = await User.find().lean();
        const partners = realUsers.map(u => ({
            id: u._id,
            gt: u.genotype,
            gs: u.bloodGroup,
            pj: u.desireChild || "Projet de vie à discuter",
            name: u.firstName,
            dob: u.dob,
            res: u.residence,
            gender: u.gender,
            photo: u.photo,
            age: calculerAge(u.dob),
            distance: Math.floor(Math.random() * 30)
        }));

        const matchesHTML = partners.map(p => `
            <div class="match-card" data-gt="${p.gt}" data-gender="${p.gender}">
                <div class="match-photo-blur" style="background-image: url('${p.photo || ''}')"></div>
                <div style="flex:1">
                    <b>${p.name}</b><br>
                    <small>${p.age} ans • ${p.res} (${p.distance}km) • Génotype ${p.gt}</small>
                </div>
                <div style="display:flex;">
                    <button class="btn-action btn-contact" onclick="showNotify('Demande envoyée à ${p.name}')">Contacter</button>
                    <button class="btn-action btn-details" onclick='showDetails(${JSON.stringify(p)})'>Détails</button>
                </div>
            </div>`).join('');

        res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f4f7f6;"><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3></div><div id="match-container">${matchesHTML || '<p style="text-align:center; padding:20px;">Aucun autre profil trouvé pour le moment...</p>'}</div><a href="/profile" class="btn-pink">Retour au profil</a></div><div id="popup-overlay" onclick="closePopup()"><div class="popup-content" onclick="event.stopPropagation()"><span class="close-popup" onclick="closePopup()">&times;</span><h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails</h3><div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div><div id="pop-msg" style="background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px;"></div><button id="pop-btn" class="btn-pink" style="margin:20px 0 0 0; width:100%">🚀 Contacter ce profil</button></div></div>${notifyScript}<script>
            let sP = null;
            window.onload = () => {
                const myGt = (localStorage.getItem('u_gt') || "").toUpperCase().trim();
                const myGender = (localStorage.getItem('u_gender') || "").toLowerCase().trim();
                const myFn = (localStorage.getItem('u_fn') || "").trim();

                let countVisible = 0;

                document.querySelectorAll('.match-card').forEach(card => {
                    const pGt = (card.dataset.gt || "").toUpperCase().trim();
                    const pGender = (card.dataset.gender || "").toLowerCase().trim();
                    const pName = card.querySelector('b').innerText.trim();
                    
                    let visible = true;
                    if(myFn && pName === myFn) visible = false; 
                    if(myGender && pGender === myGender) visible = false;
                    
                    if((myGt === 'SS' || myGt === 'AS') && pGt !== 'AA') visible = false;
                    if(myGt === 'SS' && pGt === 'SS') visible = false;

                    if(!visible) {
                        card.style.display = 'none';
                    } else {
                        countVisible++;
                    }
                });
                
                if(countVisible === 0) {
                    document.getElementById('match-container').innerHTML = '<p style="text-align:center; padding:20px;">Aucun partenaire compatible trouvé pour le moment.</p>';
                }

                if(myGt === 'SS' || myGt === 'AS') {
                    document.getElementById('pop-name').innerText = "Note de Sérénité 🛡️";
                    document.getElementById('pop-details').innerText = "Parce que votre bonheur mérite une sérénité totale, Genlove a sélectionné pour vous uniquement des profils AA.";
                    document.getElementById('pop-msg').style.display = 'none';
                    document.getElementById('pop-btn').innerText = "D'accord, je comprends";
                    document.getElementById('pop-btn').onclick = closePopup;
                    document.getElementById('popup-overlay').style.display = 'flex';
                }
            };
            function showDetails(p) { 
                sP = p;
                document.getElementById('pop-name').innerText = p.name;
                document.getElementById('pop-details').innerHTML = "<b>Âge :</b> "+p.age+" ans<br><b>Résidence :</b> "+p.res+"<br><b>Génotype :</b> "+p.gt+"<br><b>Groupe :</b> "+p.gs+"<br><br><b>Projet :</b><br><i>"+p.pj+"</i>";
                document.getElementById('pop-msg').style.display = 'block';
                document.getElementById('pop-msg').innerHTML = "<b>L'Union Sérénité :</b> Compatibilité validée.";
                document.getElementById('pop-btn').innerText = "🚀 Contacter ce profil";
                document.getElementById('pop-btn').onclick = startChat;
                document.getElementById('popup-overlay').style.display = 'flex'; 
            }
            function closePopup() { document.getElementById('popup-overlay').style.display = 'none'; }
            function startChat() { if(sP) { sessionStorage.setItem('chatPartner', JSON.stringify(sP)); window.location.href = '/chat'; } }
        </script></body></html>`);
    } catch (err) {
        res.status(500).send("Erreur de base de données");
    }
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f4f7f6;"><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="padding:25px; background:white; text-align:center;"><div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div></div>
    <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">CONFIDENTIALITÉ</div>
    <div class="st-group">
        <div class="st-item"><span>Visibilité profil</span><label class="switch"><input type="checkbox" id="vis-toggle" checked onchange="showNotify('Visibilité mise à jour !')"><span class="slider"></span></label></div>
        <div class="st-item"><span>Notifications Push</span><label class="switch"><input type="checkbox" id="push-toggle" onchange="togglePush()"><span class="slider"></span></label></div>
    </div>
    <div class="st-group"><a href="/signup" style="text-decoration:none;" class="st-item"><span>Modifier mon profil</span><b>Modifier ➔</b></a></div>
    <div class="st-group"><div class="st-item" style="color:red; font-weight:bold;">Supprimer mon compte</div><div style="display:flex; justify-content:space-around; padding:15px;"><button onclick="localStorage.clear(); location.href='/';" style="background:#1a2a44; color:white; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Oui</button><button onclick="showNotify('Action annulée')" style="background:#eee; color:#333; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Non</button></div></div>
    <a href="/profile" class="btn-pink">Retour</a></div>
    ${notifyScript}
    <script>
        function togglePush() {
            const isChecked = document.getElementById('push-toggle').checked;
            if (isChecked) { showNotify('Bienvenue ! 💙 Vos notifications de santé sont actives.'); } else { showNotify('Notifications désactivées'); }
        }
    </script></body></html>`);
});

app.get('/chat-end', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body class="end-overlay"><div class="end-card"><div style="font-size:50px; margin-bottom:10px;">✨</div><h2 style="color:#1a2a44;">Merci pour cet échange</h2><p style="color:#666; margin-bottom:30px;">Genlove vous remercie pour ce moment de partage et de franchise.</p><a href="/matching" class="btn-pink" style="width:100%; margin:0;">🔎 Trouver un autre profil</a></div></body></html>`);
});

app.get('/logout-success', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body class="end-overlay"><div class="end-card"><div style="font-size:50px; margin-bottom:20px;">🛡️</div><h2 style="color:#1a2a44;">Merci pour votre confiance</h2><p style="color:#666; margin-bottom:30px;">Votre session a été fermée en toute sécurité.</p><button onclick="window.location.href='/';" class="btn-dark" style="width:100%; margin:0; border-radius:50px; cursor:pointer; border:none;">Quitter</button></div></body></html>`);
});

app.get('/chat', (req, res) => {
    res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"><title>Genlove Chat - Sécurisé</title><style>body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; height: 100vh; } .screen { display: flex; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; } .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; } .btn-quit { background: #ffffff; color: #9dbce3; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .btn-logout-badge { background: #1a2a44; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); } .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; } .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; } .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; } .received { background: #e2ecf7; align-self: flex-start; } .sent { background: #ff416c; color: white; align-self: flex-end; } .input-area { position: fixed; bottom: 0; width: 100%; max-width: 450px; padding: 10px 15px 45px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; } #security-popup { display: flex; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; } .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; } .pedagogic-box { background: #f0f7ff; border-radius: 15px; padding: 15px; text-align: left; margin: 20px 0; border: 1px solid #d0e3ff; }</style></head><body><div id="security-popup"><div class="popup-card"><h3>🔒 Espace de discussion privé</h3><p><b>Par mesure de confidentialité, Genlove a sécurisé cet échange.</b></p><div class="pedagogic-box"><div style="margin-bottom:10px;">🛡️ <b>Éphémère :</b> Tout s'efface dans 30 min.</div><div>🕵️ <b>Privé :</b> Aucun historique conservé.</div></div><button style="background:#4a76b8; color:white; border:none; padding:16px; border-radius:30px; font-weight:bold; cursor:pointer; width:100%;" onclick="this.parentElement.parentElement.style.display='none'; startTimer()">Démarrer l'échange</button></div></div><div class="screen"><div class="chat-header"><button class="btn-quit" onclick="showFinal('chat')">✕</button><div class="digital-clock">❤️ <span id="timer-display">30:00</span></div><button class="btn-logout-badge" onclick="showFinal('logout')">Logout 🔒</button></div><div class="chat-messages" id="box"><div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div></div><div class="input-area"><textarea id="msg" style="flex:1; background:#f1f3f4; border:none; padding:12px; border-radius:25px;" placeholder="Écrivez ici..."></textarea><button style="background:#4a76b8; color:white; border:none; width:45px; height:45px; border-radius:50%;" onclick="send()">➤</button></div></div><script>let t = 1800; function startTimer() { setInterval(() => { t--; let m = Math.floor(t / 60), s = t % 60; document.getElementById('timer-display').innerText = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; if (t <= 0) { localStorage.clear(); window.location.href = '/logout-success'; } }, 1000); } function showFinal(type) { const msg = type === 'chat' ? "Quitter la discussion ?" : "Se déconnecter ?"; if(confirm(msg)) { window.location.href = (type === 'chat') ? '/chat-end' : '/logout-success'; } } function send() { const i = document.getElementById('msg'); if(i.value.trim()) { const d = document.createElement('div'); d.className = 'bubble sent'; d.innerText = i.value; document.getElementById('box').appendChild(d); i.value = ''; document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight; } }</script></body></html>`);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove unifié sur le port ${port}`);
});
