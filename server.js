const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; min-height: 100vh; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    /* NOTIFICATIONS */
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #notification-notify { background: linear-gradient(135deg, #ff416c, #ff6787) !important; border-left-color: #fff !important; }

    /* LOADER */
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* COMMON */
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; background: #f8f9fa; color: #333; }
    input[type="date"]::-webkit-calendar-picker-indicator { color: #757575; }
    
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

    /* BUTTONS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; transition: 0.2s; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }
    .btn-accept { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; border-radius: 25px; font-weight: bold; font-size: 1.1rem; border: none; width: 45%; margin: 15px 5%; }
    .btn-reject { background: #6c757d; color: white; padding: 20px; border-radius: 25px; font-weight: bold; font-size: 1.1rem; border: none; width: 45%; margin: 15px 5%; }

    /* POPUPS */
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:center; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
    .close-popup { position:absolute; top:15px; right:15px; font-size:1.5rem; cursor:pointer; color:#666; }
    .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px; text-align: left; }

    /* LISTS */
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }
    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }

    /* MATCHING */
    .info-bubble { background: #e7f3ff; color: #1a2a44; padding: 15px; border-radius: 12px; margin: 15px; font-size: 0.85rem; border-left: 5px solid #007bff; text-align: left; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }

    /* NOTIFICATION */
    .notification-hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px 20px; text-align: center; position: relative; overflow: hidden; }
    .notify-circle { width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; backdrop-filter: blur(10px); }

    /* APP OPEN */
    .app-open-hero { background: linear-gradient(135deg, #ff416c, #ff6787); color: white; padding: 40px 20px; text-align: center; position: relative; }
    .app-open-circle { width: 90px; height: 90px; background: rgba(255,255,255,0.9); border-radius: 50%; margin: 20px auto; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }

    /* CONFIDENTIALITE */
    .confidentiality-card { background: linear-gradient(135deg, #fff5f7, #ffeef2); padding: 30px 25px; border-radius: 25px; margin: 25px 15px; border: 2px solid #ffdae0; text-align: center; box-shadow: 0 15px 40px rgba(255,65,108,0.15); }

    /* CHAT */
    .chat-header { background: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 10; }
    .chat-timer { font-size: 1.3rem; font-weight: bold; color: #ff416c; font-family: monospace; min-width: 70px; text-align: center; }
    .chat-messages { flex: 1; padding: 15px; overflow-y: auto; background: #f8f9fa; }
    .chat-input-area { padding: 20px; background: white; border-top: 1px solid #eee; }
    .chat-message { margin-bottom: 15px; display: flex; }
    .chat-message.me { justify-content: flex-end; }
    .chat-message .bubble { max-width: 75%; padding: 12px 16px; border-radius: 20px; font-size: 0.9rem; }
    .chat-message.me .bubble { background: linear-gradient(135deg, #ff416c, #ff6787); color: white; border-bottom-right-radius: 5px; }
    .chat-message.other .bubble { background: white; color: #333; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-bottom-left-radius: 5px; }
    .chat-input { width: 100%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 25px; font-size: 1rem; margin-right: 10px; }
    .chat-send { background: #ff416c; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; }

    /* COUNTDOWN ALERTS */
    .timer-warning { animation: pulse 1s infinite; color: #ffc107 !important; }
    .timer-danger { animation: pulse 0.8s infinite; color: #dc3545 !important; text-shadow: 0 0 10px rgba(220,53,69,0.5); }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

    /* LOGOUT */
    .logout-hero { background: linear-gradient(135deg, #1a2a44, #2c3e50); color: white; padding: 60px 30px; text-align: center; }
    .logout-circle { width: 120px; height: 120px; background: rgba(255,255,255,0.1); border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; font-size: 3rem; backdrop-filter: blur(10px); }
</style>
`;

const notifyScript = `
<script>
    let audioContext;
    function initAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    function playAlert() {
        if(!audioContext) initAudio();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 5);
    }
    
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        if(n) {
            document.getElementById('notify-msg').innerText = msg;
            n.classList.add('show');
            setTimeout(() => n.classList.remove('show'), 3000);
        }
    }
</script>
`;

// SINGLE ROUTE - TOUS LES ECRANS
app.get(['/', '/:screen?'], (req, res) => {
    const screen = req.params.screen || 'home';
    
    const screens = {
        home: `<div class="home-screen">
            <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
            <div style="width:100%; margin-top:20px;">
                <p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p>
                <a href="/profile" class="btn-dark">➔ Se connecter</a>
                <a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a>
            </div>
            <div style="font-size: 0.75rem; color: #666; margin-top: 25px;">🔒 Vos données de santé sont cryptées et confidentielles.</div>
        </div>`,

        signup: `<div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div>
            <div class="page-white" id="main-content" style="display:none;">
                <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
                <form onsubmit="saveAndRedirect(event)">
                    <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
                    <input type="file" id="i" style="display:none" onchange="preview(event)">
                    <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                    <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                    <select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select>
                    <input type="date" id="dob" class="input-box" required>
                    <input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required>
                    <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                    <div style="display:flex; gap:10px;">
                        <select id="gs_type" class="input-box" style="flex:2;" required><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                        <select id="gs_rh" class="input-box" style="flex:1;" required><option>+</option><option>-</option></select>
                    </div>
                    <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
                    <div class="serment-container">
                        <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                        <label for="oath" class="serment-text">Je confirme sur l'honneur que les informations saisies sont sincères et conformes à mes résultats médicaux.</label>
                    </div>
                    <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
                </form>
            </div>`,

        profile: `<div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <a href="/" style="text-decoration:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px; font-size:0.8rem; font-weight:bold; display:flex; align-items:center; gap:8px; border: 1px solid #dbeafe;">
                        <span style="font-size:1rem;">🏠</span> Accueil
                    </a>
                    <a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a>
                </div>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
                <h2 id="vN" style="margin:5px 0 0 0;">Utilisateur</h2>
                <p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Localisation</p>
                <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG">...</b></div>
                <div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div>
                <div class="st-item"><span>Projet de vie</span><b id="rP">...</b></div>
            </div>
            <a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a>`,

        matching: `<div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;">
                <h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3>
            </div>
            <div id="match-container" style="flex:1; overflow-y:auto; padding-bottom: 100px;"></div>
            <a href="/profile" class="btn-pink" style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); width:90%;">← Retour profil</a>
            <div id="popup-overlay" onclick="closePopup()">
                <div class="popup-content" onclick="event.stopPropagation()">
                    <span class="close-popup" onclick="closePopup()">&times;</span>
                    <h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails du Partenaire</h3>
                    <div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
                    <div id="pop-msg" class="popup-msg"></div>
                    <button class="btn-pink" style="margin:20px 0 0 0; width:100%" onclick="sendContactRequest()">🚀 Contacter ce profil</button>
                </div>
            </div>`,

        notification: `<div id="notification-notify" class="notification-hero">
                <div class="notify-circle">💌</div>
                <div style="font-weight: bold; font-size: 1.3rem; margin-bottom: 5px;" id="notify-sender">Marie K.</div>
                <div style="font-size: 0.9rem; opacity: 0.95;" id="notify-details">Profil AA • O+ • Luanda</div>
            </div>
            <div style="padding:25px 20px;">
                <div style="background:#fff5f7; padding:25px; border-radius:20px; border:2px solid #ffdae0; margin-bottom:25px; text-align:center;">
                    <div style="font-size:3rem; margin-bottom:15px;">💝</div>
                    <div style="font-size:1.4rem; color:#1a2a44; font-weight:bold; margin-bottom:10px;" id="full-sender">Marie K.</div>
                    <div style="color:#666; margin-bottom:20px; font-size:0.95rem;" id="full-location">Luanda, Angola</div>
                    <a href="/app-open" style="background:#ff416c; color:white; padding:15px 30px; border-radius:30px; font-weight:bold; font-size:1.1rem; text-decoration:none;">💬 Voir le message & répondre</a>
                </div>
            </div>`,

        'app-open': `<div class="app-open-hero">
                <div class="app-open-circle">
                    <div style="font-size:2rem; margin-bottom:5px;">💌</div>
                    <div style="font-size:0.8rem; font-weight:bold;">NOUVELLE CONNEXION</div>
                </div>
                <div style="font-size:1.4rem; font-weight:bold; margin-bottom:15px;" id="app-open-sender">Marie K.</div>
                <div style="font-size:0.9rem; opacity:0.9; margin-bottom:30px;">Profil AA • O+ • Luanda vous a contacté !</div>
                <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap;">
                    <a href="/chat" class="btn-accept">✅ Accepter</a>
                    <a href="/matching" class="btn-reject">❌ Rejeter</a>
                </div>
            </div>`,

        confidentiality: `<div style="padding:30px 20px;">
                <div class="confidentiality-card">
                    <div style="font-size:3rem; margin-bottom:20px;">🔒</div>
                    <h2 style="color:#1a2a44; margin-bottom:15px;">Confidentialité Garantie</h2>
                    <div style="font-size:1.1rem; color:#333; margin-bottom:25px; line-height:1.5;">
                        Cette conversation est <b>éphémère</b> et s'effacera automatiquement après <b>30 minutes</b>.<br>
                        Vos échanges sont <b>100% confidentiels</b> et cryptés.
                    </div>
                    <a href="/chat" class="btn-pink" style="font-size:1.1rem;">🚀 Commencer la conversation</a>
                </div>
            </div>`,

        chat: `<div class="chat-header">
                <button onclick="showQuitConfirm()" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#dc3545;">✕</button>
                <div class="chat-timer" id="chat-timer">30:00</div>
                <button onclick="endSession()" style="background:#6c757d; color:white; border:none; padding:10px 15px; border-radius:12px; font-weight:bold; font-size:0.85rem; cursor:pointer;">Terminer session</button>
            </div>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-area">
                <div style="display:flex;">
                    <input type="text" class="chat-input" id="chat-input" placeholder="Tapez votre message..." onkeypress="if(event.key==='Enter') sendMessage()">
                    <button class="chat-send" onclick="sendMessage()">➤</button>
                </div>
            </div>
            <div id="popup-overlay" onclick="closeQuitConfirm()">
                <div class="popup-content" onclick="event.stopPropagation()" style="max-width:320px;">
                    <h3 style="color:#dc3545;">Quitter la conversation ?</h3>
                    <p style="color:#666; margin-bottom:25px;">Voulez-vous vraiment quitter cette conversation ?</p>
                    <div style="display:flex; gap:15px; justify-content:center;">
                        <button onclick="closeQuitConfirm()" class="btn-reject" style="width:120px;">Annuler</button>
                        <button onclick="confirmQuit()" class="btn-accept" style="width:120px; background:#dc3545;">Confirmer</button>
                    </div>
                </div>
            </div>`,

        logout: `<div class="logout-hero">
                <div class="logout-circle">✨</div>
                <h1 style="font-size:2.2rem; margin-bottom:20px;">Conversation terminée</h1>
                <div style="font-size:1.1rem; opacity:0.9; margin-bottom:40px; line-height:1.5;">
                    Vos échanges ont été <b>effacés en toute sécurité</b>.<br>
                    Merci d'avoir utilisé Genlove pour une connexion saine et responsable.
                </div>
                <a href="/matching" class="btn-pink" style="background:#28a745;">🔍 Retour Matching</a>
                <div style="margin-top:40px; font-size:0.8rem; opacity:0.7;">
                    🔒 Données temporairement stockées puis auto-supprimées
                </div>
            </div>`
    };

    const content = screens[screen] || screens.home;

    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">${content}</div>${notifyScript}
    <script>
        window.currentScreen = '${screen}';
        let chatTimer, chatInterval;
        
        // CHARGEMENT PROFIL
        if(['profile','matching'].includes(window.currentScreen)) {
            const p = localStorage.getItem('u_p'); 
            if(p && window.currentScreen === 'profile') {
                document.getElementById('vP').style.backgroundImage = 'url('+p+')';
                document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "") + " " + (localStorage.getItem('u_ln') || "");
                document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || "") + " (" + (localStorage.getItem('u_gender') || "") + ")";
                document.getElementById('rG').innerText = localStorage.getItem('u_gt') || 'Non renseigné';
                document.getElementById('rS').innerText = localStorage.getItem('u_gs') || 'Non renseigné';
                document.getElementById('rP').innerText = "Enfant : " + (localStorage.getItem('u_pj') || 'Non précisé');
            }
        }

        // SIGNUP
        if(window.currentScreen === 'signup') {
            let b64 = localStorage.getItem('u_p') || "";
            setTimeout(() => {
                document.getElementById('loader').style.display = 'none';
                document.getElementById('main-content').style.display = 'block';
                if(b64) { 
                    document.getElementById('c').style.backgroundImage='url('+b64+')'; 
                    document.getElementById('t').style.display='none'; 
                }
                ['fn','ln','gender','dob','res','gt','pj'].forEach(id => {
                    const el = document.getElementById(id); if(el) el.value = localStorage.getItem('u_'+id) || "";
                });
                const fullGS = localStorage.getItem('u_gs') || "";
                if(fullGS) {
                    document.getElementById('gs_type').value = fullGS.replace(/[+-]/g, "");
                    document.getElementById('gs_rh').value = fullGS.includes('+') ? '+' : '-';
                }
            }, 2000);
            
            window.preview = (e) => {
                const r = new FileReader(); 
                r.onload = () => { b64 = r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; 
                r.readAsDataURL(e.target.files[0]); 
            }
            window.saveAndRedirect = (e) => { 
                e.preventDefault(); 
                document.getElementById('loader').style.display='flex';
                document.getElementById('main-content').style.display='none';
                localStorage.setItem('u_p', b64);
                ['fn','ln','gender','dob','res','gt','pj'].forEach(id => {
                    localStorage.setItem('u_'+id, document.getElementById(id).value);
                });
                localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
                setTimeout(() => window.location.href='/profile', 3000); 
            }
        }

        // MATCHING
        if(window.currentScreen === 'matching') {
            const partners = [
                {id:1, name:"Marie K.", gt:"AA", gs:"O+", pj:"Désire fonder une famille unie.", res:"Luanda"},
                {id:2, name:"Awa S.", gt:"AA", gs:"B-", pj:"Souhaite des enfants en bonne santé.", res:"Luanda"}, 
                {id:3, name:"Fatima D.", gt:"AS", gs:"A+", pj:"Cherche une relation stable.", res:"Luanda"}
            ];
            const myGt = localStorage.getItem('u_gt') || "AA";
            const container = document.getElementById('match-container');
            
            let filtered = partners;
            if(myGt === "SS" || myGt === "AS") {
                filtered = partners.filter(p => p.gt === "AA");
                container.innerHTML = '<div class="info-bubble">✨ <b>Engagement Santé :</b> Genlove vous propose uniquement des profils AA pour protéger votre descendance.</div>';
            }
            
            filtered.forEach(p => {
                container.innerHTML += `
                    <div class="match-card">
                        <div class="match-photo-blur"></div>
                        <div style="flex:1">
                            <b>${p.name}</b><br><small>Génotype ${p.gt} • ${p.gs}</small>
                        </div>
                        <div style="display:flex;">
                            <button class="btn-action btn-contact" onclick="showNotify('Demande envoyée à ${p.name}!')">Contacter</button>
                            <button class="btn-action btn-details" onclick='showDetails(${JSON.stringify(p)})'>Détails</button>
                        </div>
                    </div>`;
            });
            
            window.showDetails = (p) => {
                document.getElementById('pop-name').innerText = p.name;
                document.getElementById('pop-details').innerHTML = "<b>Génotype :</b> " + p.gt + "<br><b>Groupe Sanguin :</b> " + p.gs + "<br><b>Localisation :</b> " + p.res + "<br><br><b>Projet de vie :</b><br><i>" + p.pj + "</i>";
                document.getElementById('popup-overlay').style.display = 'flex';
                localStorage.setItem('selected_partner', JSON.stringify(p));
            }
            window.closePopup = () => document.getElementById('popup-overlay').style.display = 'none';
        }

        // NOTIFICATION → APP-OPEN
        if(window.currentScreen === 'notification') {
            const senderData = JSON.parse(localStorage.getItem('selected_partner') || '{"name":"Marie K.","gt":"AA","gs":"O+","res":"Luanda"}');
            ['notify-sender','full-sender','app-open-sender'].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.textContent = senderData.name;
            });
            document.getElementById('notify-details').textContent = `Profil ${senderData.gt} • ${senderData.gs} • ${senderData.res}`;
            document.getElementById('full-location').textContent = senderData.res;
        }

        // APP-OPEN → CONFIDENTIALITY (auto après accept)
        if(window.currentScreen === 'app-open') {
            setTimeout(() => {
                if(localStorage.getItem('app_open_confirmed')) {
                    window.location.href = '/confidentiality';
                }
            }, 100);
        }

        // CHAT 30min
        if(window.currentScreen === 'chat') {
            let timeLeft = 30 * 60; // 30 minutes
            const timerEl = document.getElementById('chat-timer');
            const messagesEl = document.getElementById('chat-messages');
            
            chatTimer = setInterval(() => {
                timeLeft--;
                const min = Math.floor(timeLeft / 60);
                const sec = timeLeft % 60;
                timerEl.textContent = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
                
                // ALERTES SONORES
                if(timeLeft === 20 * 60) playAlert(); // 20min
                if(timeLeft === 5 * 60) playAlert(); // 5min
                
                // VISUEL WARNINGS
                timerEl.className = '';
                if(timeLeft <= 5 * 60) timerEl.classList.add('timer-danger');
                else if(timeLeft <= 10 * 60) timerEl.classList.add('timer-warning');
                
                if(timeLeft <= 0) {
                    clearInterval(chatInterval);
                    localStorage.removeItem('chat_messages');
                    window.location.href = '/logout';
                }
            }, 1000);
            
            // CHARGER MESSAGES
            messagesEl.innerHTML = localStorage.getItem('chat_messages') || '';
            messagesEl.scrollTop = messagesEl.scrollHeight;
            
            window.sendMessage = () => {
                const input = document.getElementById('chat-input');
                const msg = input.value.trim();
                if(msg) {
                    const messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
                    messages.push({type: 'me', text: msg, time: new Date().toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})});
                    localStorage.setItem('chat_messages', JSON.stringify(messages));
                    input.value = '';
                    messagesEl.innerHTML = messages.map(m => `
                        <div class="chat-message ${m.type}">
                            <div class="bubble">${m.text}<br><small style="opacity:0.7; font-size:0.75rem;">${m.time}</small>
                            </div>
                        </div>`).join('');
                    messagesEl.scrollTop = messagesEl.scrollHeight;
                }
            }
            
            window.showQuitConfirm = () => document.getElementById('popup-overlay').style.display = 'flex';
            window.closeQuitConfirm = () => document.getElementById('popup-overlay').style.display = 'none';
            window.confirmQuit = () => { clearInterval(chatInterval); window.location.href = '/logout'; }
            window.endSession = () => { clearInterval(chatInterval); window.location.href = '/logout'; }
        }

        // CONTACT REQUEST
        window.sendContactRequest = () => {
            const partner = JSON.parse(localStorage.getItem('selected_partner') || '{}');
            localStorage.setItem('notification_sender', partner.name || 'Un partenaire');
            localStorage.setItem('notification_location', partner.res || 'Luanda');
            showNotify('💌 Notification envoyée à ' + partner.name + ' !');
            setTimeout(() => window.location.href = '/notification', 1500);
        }
    </script></body></html>`);
});

// Correction pour le déploiement Render : ajout de '0.0.0.0'
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 GENLOVE IS LIVE: Port ${port}`);
    console.log('📱 Flow: / → /signup → /profile → /matching → /notification → /app-open → /confidentiality → /chat → /logout');
});
           
