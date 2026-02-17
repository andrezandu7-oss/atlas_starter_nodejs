const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use((req, res, next) => {
    res.header('X-Powered-By', undefined);
    next();
});

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Matching Santé Intelligent</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', -apple-system, sans-serif; 
            margin: 0; background: #fdf2f2; 
            display: flex; justify-content: center; 
            height: 100vh; overflow: hidden; 
            -webkit-font-smoothing: antialiased;
        }
        .app-shell { 
            width: 100%; max-width: 450px; height: 100%; 
            background: #f4e9da; display: flex; flex-direction: column; 
            position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        }
        .screen { 
            display: none; flex-direction: column; height: 100%; width: 100%; 
            position: absolute; inset: 0; overflow-y: auto; background: white; 
            z-index: 10; padding-bottom: 40px; 
        }
        .active { display: flex; }

        /* NOTIFICATIONS AMÉLIORÉES */
        #genlove-notify { 
            position: absolute; top: -100px; left: 10px; right: 10px; 
            background: #1a2a44; color: white; padding: 15px; border-radius: 12px; 
            display: flex; align-items: center; gap: 10px; 
            transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; 
        }
        #genlove-notify.show { top: 20px; }

        #loader { 
            display: none; position: absolute; inset: 0; background: white; z-index: 200; 
            flex-direction: column; align-items: center; justify-content: center; 
            text-align: center; padding: 20px; 
        }
        .spinner { 
            width: 50px; height: 50px; border: 5px solid #f3f3f3; 
            border-top: 5px solid #ff416c; border-radius: 50%; 
            animation: spin 1s linear infinite; margin-bottom: 20px; 
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* BOUTONS */
        .btn-pink { 
            background: #ff416c; color: white; padding: 18px; border-radius: 50px; 
            text-align: center; font-weight: bold; width: 85%; margin: 20px auto; 
            border: none; cursor: pointer; display: block; font-size: 1rem; 
            touch-action: manipulation;
        }
        .btn-dark { 
            background: #1a2a44; color: white; padding: 18px; border-radius: 12px; 
            text-align: center; font-weight: bold; width: 80%; margin: 10px auto; 
            border: none; cursor: pointer; display: block; 
        }
        .btn-green { 
            background: #28a745; color: white; border: none; padding: 15px; 
            border-radius: 10px; width: 90%; margin: 10px 5%; font-weight: bold; 
            cursor: pointer; 
        }

        /* FORMULAIRE */
        .input-box { 
            width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
            margin-top: 10px; font-size: 1rem; box-sizing: border-box; 
            background: #f8f9fa; 
        }
        .photo-circle { 
            width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; 
            margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; 
            background-size: cover; background-position: center; cursor: pointer; 
        }
        .serment-container { 
            margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; 
            border: 1px solid #ffdae0; display:flex; gap:10px; align-items: flex-start; 
        }
        .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

        /* LISTES */
        .st-group { 
            background: white; border-radius: 15px; margin: 0 15px 15px 15px; 
            overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); 
        }
        .st-item { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; 
            font-size: 0.95rem; 
        }

        /* POPUP & MATCHING */
        #popup-overlay { 
            display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); 
            z-index:1000; align-items:center; justify-content:center; padding:20px; 
        }
        .popup-content { 
            background:white; border-radius:20px; width:90%; max-width:380px; 
            padding:25px; position:relative; text-align:left; 
        }
        .close-popup { 
            position:absolute; top:15px; right:15px; font-size:1.5rem; 
            cursor:pointer; color:#666; 
        }
        .popup-msg { 
            background:#e7f3ff; padding:15px; border-radius:12px; 
            border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; 
            line-height:1.4; margin-top:15px; 
        }
        .match-card { 
            background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; 
            display: flex; align-items: center; gap: 12px; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.05); 
        }
        .match-photo-blur { 
            width: 55px; height: 55px; border-radius: 50%; background: #eee; 
            filter: blur(6px); 
        }

        /* SWITCH */
        .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { 
            position: absolute; cursor: pointer; inset: 0; background-color: #ccc; 
            transition: .4s; border-radius: 24px; 
        }
        .slider:before { 
            position: absolute; content: ""; height: 18px; width: 18px; 
            left: 3px; bottom: 3px; background-color: white; transition: .4s; 
            border-radius: 50%; 
        }
        input:checked + .slider { background-color: #007bff; }
        input:checked + .slider:before { transform: translateX(21px); }

        /* CHAT AMÉLIORÉ */
        .chat-header { 
            background: #9dbce3; color: white; padding: 12px 15px; 
            display: flex; justify-content: space-between; align-items: center; 
            flex-shrink: 0;
        }
        .btn-quit {
            background: #ffffff; color: #9dbce3; border: none;
            width: 32px; height: 32px; border-radius: 8px;
            font-size: 1.2rem; font-weight: bold; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn-logout-badge {
            background: #1a2a44; color: white; border: none;
            padding: 8px 15px; border-radius: 8px;
            font-size: 0.85rem; font-weight: bold; cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        @keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .heart-icon { display: inline-block; color: #ff416c; animation: heartbeat 1s infinite; margin-right: 8px; }
        .digital-clock {
            background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px;
            font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem;
            display: inline-flex; align-items: center; border: 1px solid #333;
        }
        .chat-messages { 
            flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; 
            display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; 
        }
        .bubble { 
            padding: 12px 16px; border-radius: 18px; max-width: 80%; 
            line-height: 1.4; white-space: pre-wrap; 
        }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { 
            position: fixed; bottom: 0; width: 100%; max-width: 450px; 
            padding: 10px 15px 45px 15px; border-top: 1px solid #eee; 
            display: flex; gap: 10px; background: white; box-sizing: border-box; 
            align-items: flex-end; 
        }

        /* ÉCRAN FINAL */
        .final-bg { 
            background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); 
            color: white; justify-content: center; align-items: center; text-align: center; 
        }
        .final-card { 
            background: white; color: #333; border-radius: 30px; padding: 40px 25px; 
            width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); 
        }
        .btn-restart { 
            background: #ff416c; color: white; border: none; padding: 16px; 
            border-radius: 30px; width: 100%; font-weight: bold; font-size: 1.1rem; 
            cursor: pointer; margin-top: 25px; 
        }

        /* POPUP SÉCURITÉ */
        #security-popup { 
            display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; 
            align-items: center; padding: 20px; 
        }
        .popup-card { 
            background: white; border-radius: 30px; padding: 35px 25px; 
            text-align: center; width: 88%; 
        }
        .pedagogic-box { 
            background: #f0f7ff; border-radius: 15px; padding: 15px; 
            text-align: left; margin: 20px 0; border: 1px solid #d0e3ff; 
        }
    </style>
</head>
<body>
    <audio id="lastMinuteSound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg">
    </audio>

    <div class="app-shell">
        <!-- NOTIFICATION -->
        <div id="genlove-notify"><span>📩</span><span id="notify-msg"></span></div>
        <div id="loader">
            <div class="spinner"></div>
            <h3>Analyse sécurisée...</h3>
            <p>Vérification de vos données médicales.</p>
        </div>

        <!-- HOME -->
        <div id="scr-home" class="screen active" style="background:#f4e9da;">
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;">
                <div style="font-size: 3.5rem; font-weight: bold;">
                    <span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span>
                </div>
                <div style="font-weight: bold; color: #1a2a44; margin: 20px 0 40px 0; font-size: 1rem;">
                    Unissez cœur et santé pour bâtir des couples sains
                </div>
                <button class="btn-dark" onclick="checkAuth()">➔ Se connecter</button>
                <button class="btn-pink" onclick="showSignup()">👤 Créer un compte</button>
            </div>
        </div>

        <!-- SIGNUP -->
        <div id="scr-signup" class="screen" style="padding:20px;">
            <h2 style="color:#ff416c; text-align:center;">Configuration Santé</h2>
            <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📸 Photo *</span>
            </div>
            <input type="file" id="i" style="display:none" accept="image/*" onchange="preview(event)">
            
            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom" required>
            <select id="gender" class="input-box" required>
                <option value="">Genre</option>
                <option>Homme</option>
                <option>Femme</option>
            </select>
            <input type="date" id="dob" class="input-box" required>
            <input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required>
            <select id="gt" class="input-box" required>
                <option value="">Génotype</option>
                <option>AA</option>
                <option>AS</option>
                <option>SS</option>
            </select>
            <div style="display:flex; gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;" required>
                    <option value="">Groupe</option>
                    <option>A</option>
                    <option>B</option>
                    <option>AB</option>
                    <option>O</option>
                </select>
                <select id="gs_rh" class="input-box" style="flex:1;" required>
                    <option value="">Rh</option>
                    <option>+</option>
                    <option>-</option>
                </select>
            </div>
            <select id="pj" class="input-box" required>
                <option value="">Désir d'enfant ?</option>
                <option>Oui</option>
                <option>Non</option>
            </select>
            <div class="serment-container">
                <input type="checkbox" id="oath" style="width:25px;height:25px;">
                <label for="oath" class="serment-text">
                    Je confirme sur l'honneur que les informations saisies sont sincères et conformes à mes résultats médicaux.
                </label>
            </div>
            <button class="btn-pink" onclick="saveProfile()">🚀 Valider mon profil</button>
        </div>

        <!-- PROFILE -->
        <div id="scr-profile" class="screen" style="background:#f8f9fa;">
            <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px; position:relative;">
                <button onclick="showScreen('scr-home')" style="border:none; background:none; position:absolute; top:20px; left:20px; font-size:1.4rem;">🏠</button>
                <button onclick="showScreen('scr-settings')" style="border:none; background:none; position:absolute; top:20px; right:20px; font-size:1.4rem;">⚙️</button>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
                <h2 id="vN">Nom</h2>
                <p id="vAgeLoc" style="color:#666; margin:0 0 10px 0;">-- ans • --</p>
                <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px 20px 5px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG" style="color:#ff416c;">--</b></div>
                <div class="st-item"><span>Groupe Sanguin</span><b id="rS">--</b></div>
                <div class="st-item"><span>Projet de vie</span><b id="rP">--</b></div>
            </div>
            <button class="btn-dark" onclick="simulateMatch()">🔍 Lancer le Matching</button>
        </div>

        <!-- MATCHING -->
        <div id="scr-matching" class="screen">
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee; position:relative;">
                <button onclick="showScreen('scr-profile')" style="border:none; background:none; position:absolute; top:20px; left:20px; font-size:1.4rem;">✕</button>
                <h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3>
            </div>
            <div id="match-container" style="flex:1; padding:10px;"></div>
            <div id="popup-overlay" onclick="closePopup()" style="position:fixed;">
                <div class="popup-content" onclick="event.stopPropagation()">
                    <span class="close-popup" onclick="closePopup()">&times;</span>
                    <h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails du Partenaire</h3>
                    <div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
                    <div id="pop-msg" class="popup-msg"></div>
                    <button class="btn-pink" style="margin:20px 0 0 0; width:100%" onclick="closePopup(); showNotify('Demande de contact envoyée !')">🚀 Contacter ce profil</button>
                </div>
            </div>
        </div>

        <!-- CONFIRMATION -->
        <div id="scr-confirm" class="screen" style="background:#f0f2f5; justify-content:center; align-items:center;">
            <div style="background:white; width:85%; border-radius:20px; box-shadow:0 4px 15px rgba(0,0,0,0.1); overflow:hidden; text-align:center;">
                <div style="background: #0000ff; color: white; padding: 18px; font-weight: bold;">Genlove - confirmation</div>
                <div style="padding: 30px 25px;">
                    <p style="font-size: 1.1rem; margin-bottom: 25px;">Accepter Sarah ? ❤️</p>
                    <button class="btn-green" onclick="showChatPopup()">Accepter</button>
                    <button class="btn-dark" style="background:none; color:#dc3545; border:1px solid #dc3545;" onclick="showScreen('scr-profile')">Rejeter</button>
                </div>
            </div>
        </div>

        <!-- CHAT AMÉLIORÉ -->
        <div id="scr-chat" class="screen">
            <div id="security-popup">
                <div class="popup-card">
                    <h3>🔒 Espace de discussion privé</h3>
                    <p><b>Par mesure de confidentialité, Genlove a sécurisé cet échange.</b></p>
                    <div class="pedagogic-box">
                        <div>🛡️ <b>Éphémère :</b> Tout s'efface dans 30 min.</div>
                        <div>🕵️ <b>Privé :</b> Aucun historique n'est conservé.</div>
                    </div>
                    <button class="btn-pink" onclick="closePopup()">Démarrer l'échange</button>
                </div>
            </div>

            <div class="chat-header">
                <button class="btn-quit" onclick="showScreen('scr-profile')">✕</button>
                <div class="digital-clock">
                    <span class="heart-icon">❤️</span><span id="timer-display">30:00</span>
                </div>
                <button class="btn-logout-badge" onclick="showFinalScreen()">Logout 🔒</button>
            </div>

            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            </div>

            <div class="input-area">
                <textarea id="msg" class="input-box" style="flex:1; margin:0; resize:none; max-height:150px;" placeholder="Écrivez votre message..." rows="1" oninput="autoGrow(this)"></textarea>
                <button class="btn-dark" style="width:45px; height:45px; border-radius:50%; padding:0;" onclick="send()">➤</button>
            </div>
        </div>

        <!-- SETTINGS -->
        <div id="scr-settings" class="screen" style="background:#f4f7f6;">
            <div style="padding:25px; background:white; text-align:center;">
                <div style="font-size:2rem; font-weight:bold;">Genlove</div>
            </div>
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">CONFIDENTIALITÉ</div>
            <div class="st-group">
                <div class="st-item">
                    <span>Visibilité profil</span>
                    <label class="switch">
                        <input type="checkbox" id="visibility-toggle" checked onchange="toggleVisibility(this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="st-item" style="font-size:0.8rem; color:#666;">Statut : <b id="status" style="color:#007bff;">Public</b></div>
            </div>
            <div class="st-group">
                <div class="st-item" onclick="showSignup()"><span>Modifier mon profil</span><b>Modifier ➔</b></div>
            </div>
            <button class="btn-pink" onclick="showScreen('scr-profile')">Retour</button>
        </div>

        <!-- ÉCRAN FINAL -->
        <div id="scr-final" class="screen final-bg">
            <div class="final-card">
                <div style="font-size:3rem; margin-bottom:10px;">✨</div>
                <h2 style="color:#1a2a44;">Merci pour cet échange</h2>
                <p>Genlove vous remercie pour ce moment de partage.</p>
                <button class="btn-restart" onclick="location.reload()">🔎 Nouveau matching</button>
            </div>
        </div>
    </div>

    <script>
        let timeLeft = 30 * 60; 
        let timerInterval; 
        let b64 = localStorage.getItem('u_p') || "";
        let alertsEnabled = true;

        function showScreen(id) { 
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
            document.getElementById(id).classList.add('active'); 
        }

        function showNotify(msg) {
            const n = document.getElementById('genlove-notify');
            document.getElementById('notify-msg').innerText = msg;
            n.classList.add('show');
            setTimeout(() => n.classList.remove('show'), 3000);
        }

        function calculateAge(dob) {
            if(!dob) return "--";
            const birth = new Date(dob); const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
            return age;
        }

        function showSignup() {
            ['fn','ln','gender','dob','res','gt','pj'].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.value = localStorage.getItem('u_'+id) || "";
            });
            const fullGS = localStorage.getItem('u_gs') || "";
            if(fullGS) {
                const gs_type = document.getElementById('gs_type');
                const gs_rh = document.getElementById('gs_rh');
                if(gs_type) gs_type.value = fullGS.replace(/[+-]/g, "");
                if(gs_rh) gs_rh.value = fullGS.includes('+') ? '+' : '-';
            }
            if(b64) { 
                document.getElementById('c').style.backgroundImage='url('+b64+')'; 
                document.getElementById('t').style.display='none'; 
            }
            showScreen('scr-signup');
        }

        function preview(e) {
            const r = new FileReader();
            r.onload = () => { 
                b64 = r.result; 
                document.getElementById('c').style.backgroundImage='url('+b64+')'; 
                document.getElementById('t').style.display='none'; 
            };
            r.readAsDataURL(e.target.files[0]);
        }

        function saveProfile() {
            if(!document.getElementById('oath').checked) return showNotify("Veuillez signer le serment.");
            document.getElementById('loader').style.display = 'flex';
            
            ['fn','ln','gender','dob','res','gt','pj'].forEach(id => {
                const el = document.getElementById(id);
                if(el) localStorage.setItem('u_'+id, el.value);
            });
            const gs_type = document.getElementById('gs_type')?.value;
            const gs_rh = document.getElementById('gs_rh')?.value;
            if(gs_type && gs_rh) localStorage.setItem('u_gs', gs_type + gs_rh);
            localStorage.setItem('u_p', b64);
            
            setTimeout(() => { 
                document.getElementById('loader').style.display = 'none'; 
                updateUI(); 
                showScreen('scr-profile'); 
            }, 2000);
        }

        function updateUI() {
            document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "") + " " + (localStorage.getItem('u_ln') || "");
            document.getElementById('vAgeLoc').innerText = calculateAge(localStorage.getItem('u_dob')) + " ans • " + (localStorage.getItem('u_res') || "--");
            document.getElementById('rG').innerText = localStorage.getItem('u_gt') || "--";
            document.getElementById('rS').innerText = localStorage.getItem('u_gs') || "--";
            document.getElementById('rP').innerText = "Enfant : " + (localStorage.getItem('u_pj') || "--");
            if(localStorage.getItem('u_p')) {
                document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
            }
        }

        function simulateMatch() {
            const myGt = localStorage.getItem('u_gt');
            const partners = [
                {id:1, name:"Sarah", gt:"AA", gs:"O+", pj:"Désire fonder une famille unie.", age:28},
                {id:2, name:"Léa", gt:"AA", gs:"B-", pj:"Souhaite des enfants en bonne santé.", age:26},
                {id:3, name:"Emma", gt:"AS", gs:"A+", pj:"Cherche une relation stable.", age:30}
            ];
            
            let filtered = partners;
            if (myGt === "SS" || myGt === "AS") {
                filtered = partners.filter(p => p.gt === "AA");
                showNotify("✨ Pour protéger votre descendance, seuls les profils AA sont proposés.");
            }
            
            const container = document.getElementById('match-container');
            container.innerHTML = '';
            if(filtered.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:40px; color:#666;">Aucun partenaire compatible trouvé</div>';
            } else {
                filtered.forEach(p => {
                    container.innerHTML += `
                        <div class="match-card">
                            <div class="match-photo-blur"></div>
                            <div style="flex:1">
                                <b>${p.name} (${p.age} ans)</b><br>
                                <small>Génotype ${p.gt} • ${p.gs}</small>
                            </div>
                            <div style="display:flex; gap:5px;">
                                <button class="btn-dark" style="padding:8px 12px; font-size:0.8rem;" onclick="showNotify('Demande envoyée à ${p.name}!')">Contacter</button>
                                <button class="btn-pink" style="padding:8px 12px; font-size:0.8rem;" onclick='showDetails(${JSON.stringify(p)})'>Détails</button>
                            </div>
                        </div>`;
                });
            }
            showScreen('scr-matching');
        }

        function showDetails(p) {
            const myGt = localStorage.getItem('u_gt');
            document.getElementById('pop-name').innerText = p.name;
            document.getElementById('pop-details').innerHTML = 
                "<b>Génotype :</b> " + p.gt + "<br>" +
                "<b>Groupe Sanguin :</b> " + p.gs + "<br><br>" +
                "<b>Projet de vie :</b><br><i>" + p.pj + "</i>";
            
            let msg = "";
            if(myGt === "AA" && p.gt === "AA") msg = "<b>Union Sérénité :</b> Compatibilité génétique idéale !";
            else if(myGt === "AA" && p.gt === "AS") msg = "<b>Union Protectrice :</b> Aucun risque de naissance SS.";
            else if(myGt === "AA" && p.gt === "SS") msg = "<b>Union Solidaire :</b> Partenaire idéal pour SS.";
            
            document.getElementById('pop-msg').innerHTML = msg || "Compatibilité analysée";
            document.getElementById('popup-overlay').style.display = 'flex';
        }

        function closePopup() { 
            document.getElementById('popup-overlay')?.style.display = 'none'; 
            document.getElementById('security-popup')?.style.display = 'none'; 
        }

        function toggleVisibility(el) {
            const status = document.getElementById('status');
            status.innerText = el.checked ? 'Public' : 'Privé';
            status.style.color = el.checked ? '#007bff' : '#dc3545';
            showNotify('Paramètre mis à jour !');
        }

        function showChatPopup() { 
            showScreen('scr-chat'); 
            document.getElementById('security-popup').style.display='flex'; 
        }

        function triggerRhythmicAlarm() {
            if (!alertsEnabled) return;
            const audio = document.getElementById('lastMinuteSound');
            audio.play().catch(() => {});
            if(navigator.vibrate) navigator.vibrate(100);
        }

        function startTimer() {
            if(timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let m = Math.floor(timeLeft/60), s = timeLeft%60;
                document.getElementById('timer-display').innerText = (m<10?'0':'')+m+":"+(s<10?'0':'')+s;
                
                if (timeLeft === 60 || timeLeft === 40 || timeLeft === 20) triggerRhythmicAlarm();
                if(timeLeft<=0) { 
                    clearInterval(timerInterval); 
                    showScreen('scr-final'); 
                }
            }, 1000);
        }

        function autoGrow(element) {
            element.style.height = "auto";
            element.style.height = element.scrollHeight + "px";
        }

        function showFinalScreen() {
            if(confirm("Voulez-vous vous déconnecter ?")) {
                clearInterval(timerInterval);
                showScreen('scr-final');
            }
        }

        function send() {
            const input = document.getElementById('msg');
            if(input.value.trim()) {
                const div = document.createElement('div');
                div.className = 'bubble sent';
                div.innerText = input.value;
                document.getElementById('box').appendChild(div);
                input.value = ''; 
                input.style.height = "auto";
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }

        function checkAuth() { 
            if(localStorage.getItem('u_fn')) { 
                updateUI(); 
                showScreen('scr-profile'); 
            } else { 
                showSignup(); 
            } 
        }

        window.onload = () => { 
            if(localStorage.getItem('u_fn')) updateUI(); 
        };
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(genloveApp));

app.listen(port, () => {
    console.log(`🚀 Genlove déployé sur port ${port} - Parfait pour mobile ! 📱`);
});


