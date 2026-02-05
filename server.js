const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- DESIGN SYSTEM (Intégralité de la Partie 1) ---
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
    input[type="date"]::before { content: "Date de naissance "; width: 100%; color: #757575; }
    input[type="date"]:focus::before, input[type="date"]:valid::before { content: ""; display: none; }

    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
    
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }

    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
    .close-popup { position:absolute; top:15px; right:15px; font-size:1.5rem; cursor:pointer; color:#666; }
    .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px; }

    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }

    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }

    .info-bubble { background: #e7f3ff; color: #1a2a44; padding: 15px; border-radius: 12px; margin: 15px; font-size: 0.85rem; border-left: 5px solid #007bff; text-align: left; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }

    /* MESSAGERIE ELEMENTS (Partie 2) */
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; white-space: pre-wrap; font-size: 0.9rem; }
    .received { background: #e2ecf7; align-self: flex-start; color: #333; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
    .chat-header-bar { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
</style>
`;

const notifyScript = `
<script>
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        const m = document.getElementById('notify-msg');
        if(m) m.innerText = msg;
        n.classList.add('show');
        setTimeout(() => { n.classList.remove('show'); }, 3000);
    }
</script>
`;

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div><div style="font-size: 0.75rem; color: #666; margin-top: 25px;">🔒 Vos données de santé sont cryptées et confidentielles.</div></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div><div class="page-white" id="main-content"><h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
    <form onsubmit="saveAndRedirect(event)">
        <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
        <input type="file" id="i" style="display:none" onchange="preview(event)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
        <input type="text" id="ln" class="input-box" placeholder="Nom" required>
        <select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select>
        <input type="date" id="dob" class="input-box" required>
        <input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required>
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <div style="display:flex; gap:10px;"><select id="gs_type" class="input-box" style="flex:2;" required><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
        <select id="gs_rh" class="input-box" style="flex:1;" required><option>+</option><option>-</option></select></div>
        <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
        <div class="serment-container"><input type="checkbox" id="oath" style="width:20px;height:20px;" required><label for="oath" class="serment-text">Je confirme sur l'honneur que les informations saisies sont sincères et conformes à mes résultats médicaux.</label></div>
        <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
        let b64 = localStorage.getItem('u_p') || "";
        window.onload = () => {
            if(b64) { document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }
            document.getElementById('fn').value = localStorage.getItem('u_fn') || "";
            document.getElementById('ln').value = localStorage.getItem('u_ln') || "";
            document.getElementById('gender').value = localStorage.getItem('u_gender') || "";
            document.getElementById('dob').value = localStorage.getItem('u_dob') || "";
            document.getElementById('res').value = localStorage.getItem('u_res') || "";
            document.getElementById('gt').value = localStorage.getItem('u_gt') || "";
            const fullGS = localStorage.getItem('u_gs') || "";
            if(fullGS) {
                document.getElementById('gs_type').value = fullGS.replace(/[+-]/g, "");
                document.getElementById('gs_rh').value = fullGS.includes('+') ? '+' : '-';
            }
            document.getElementById('pj').value = localStorage.getItem('u_pj') || "";
        };
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        function saveAndRedirect(e){ 
            e.preventDefault(); 
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_gender', document.getElementById('gender').value);
            localStorage.setItem('u_dob', document.getElementById('dob').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            setTimeout(() => { window.location.href='/profile'; }, 5000); 
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f8f9fa;"><div class="app-shell"><div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;"><div style="display:flex; justify-content:space-between; align-items:center;"><a href="/" style="text-decoration:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px; font-size:0.8rem; font-weight:bold; display:flex; align-items:center; gap:8px; border: 1px solid #dbeafe;"><span style="font-size:1rem;">🏠</span> Retour Accueil</a><a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a></div><div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div><h2 id="vN" style="margin:5px 0 0 0;">Utilisateur</h2><p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Localisation</p><p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p></div><div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG">...</b></div><div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div><div class="st-item"><span>Projet de vie</span><b id="rP">...</b></div></div><a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a></div><script>const p = localStorage.getItem('u_p'); if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')'; document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "") + " " + (localStorage.getItem('u_ln') || ""); document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || "") + " (" + (localStorage.getItem('u_gender') || "") + ")"; document.getElementById('rG').innerText = localStorage.getItem('u_gt'); document.getElementById('rS').innerText = localStorage.getItem('u_gs'); document.getElementById('rP').innerText = "Enfant : " + localStorage.getItem('u_pj');</script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}${notifyScript}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

        <div id="view-matching">
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3></div>
            <div id="match-container"></div>
            <a href="/profile" class="btn-pink">Retour au profil</a>
        </div>

        <div id="view-chat" style="display:none; flex-direction:column; height:100vh;">
            <div class="chat-header-bar">
                <button onclick="location.reload()" style="background:white; border:none; border-radius:8px; padding:5px 10px; font-weight:bold; cursor:pointer; color:#9dbce3;">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <div style="font-weight:bold;" id="chat-partner-name">Sarah</div>
            </div>
            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            </div>
            <div style="position:fixed; bottom:0; width:100%; max-width:420px; padding:10px 15px 40px; background:white; display:flex; gap:10px; border-top:1px solid #eee;">
                <textarea id="msg" style="flex:1; background:#f1f3f4; border:1px solid #ddd; padding:12px; border-radius:25px; outline:none; resize:none; font-family:sans-serif;" placeholder="Écrivez..." rows="1"></textarea>
                <button onclick="sendMsg()" style="background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor:pointer;">➤</button>
            </div>
        </div>

        <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
                <span class="close-popup" onclick="closePopup()">&times;</span>
                <h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails</h3>
                <div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
                <div id="pop-msg" class="popup-msg"></div>
                <button class="btn-pink" style="margin:20px 0 0 0; width:100%" id="btn-start-chat">🚀 Démarrer l'échange privé</button>
            </div>
        </div>

        <div id="security-popup" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:2000; align-items:center; justify-content:center; padding:20px;">
             <div class="popup-card" style="text-align:center;">
                <h3>🔒 Espace Privé Sécurisé</h3>
                <p>Par mesure de confidentialité, Genlove a sécurisé cet échange.</p>
                <div style="background:#f0f7ff; padding:15px; border-radius:12px; text-align:left; margin:15px 0; font-size:0.85rem;">
                    🛡️ <b>Éphémère :</b> Tout s'efface dans 30 min.<br>🕵️ <b>Privé :</b> Aucun historique conservé.
                </div>
                <button class="btn-pink" onclick="confirmStartChat()" style="width:100%; margin:0;">Démarrer l'échange</button>
            </div>
        </div>
    </div>

    <script>
        const partners = [
            {id:1, name:"Sarah", gt:"AA", gs:"O+", pj:"Désire fonder une famille unie."},
            {id:2, name:"Marc", gt:"AS", gs:"B-", pj:"Souhaite des enfants en bonne santé."},
            {id:3, name:"Léa", gt:"SS", gs:"A+", pj:"Cherche une relation stable."}
        ];
        const myGt = localStorage.getItem('u_gt');
        const container = document.getElementById('match-container');
        
        // LOGIQUE DE SÉCURITÉ SS BLOQUER SS
        let filtered = partners;
        if (myGt === "SS" || myGt === "AS") {
            filtered = partners.filter(p => p.gt === "AA");
            container.innerHTML = '<div class="info-bubble">✨ <b>Engagement Santé :</b> Pour protéger votre future descendance, Genlove vous propose uniquement des profils AA.</div>';
        }

        filtered.forEach(p => {
            container.innerHTML += \`
                <div class="match-card">
                    <div class="match-photo-blur"></div>
                    <div style="flex:1"><b>\${p.name}</b><br><small>Génotype \${p.gt}</small></div>
                    <div style="display:flex;">
                        <button class="btn-action btn-contact" onclick='openChatPopup(\${JSON.stringify(p)})'>Contacter</button>
                        <button class="btn-action btn-details" onclick='showDetails(\${JSON.stringify(p)})'>Détails</button>
                    </div>
                </div>\`;
        });

        let selectedPartner = null;

        function showDetails(p) {
            selectedPartner = p;
            document.getElementById('pop-name').innerText = p.name;
            document.getElementById('pop-details').innerHTML = "<b>Génotype :</b> " + p.gt + "<br><b>Groupe Sanguin :</b> " + p.gs + "<br><br><b>Projet de vie :</b><br><i>" + p.pj + "</i>";
            
            let msg = "";
            if(myGt === "AA" && p.gt ===
