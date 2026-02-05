const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware pour gérer les données (images en base64 notamment)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Version Intégrale</title>
    <style>
        /* --- STYLES UNIFIÉS (PARTIE 1 & 2) --- */
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .app-shell { width: 100%; max-width: 450px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .screen-layer { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; }
        .screen-layer.active { display: flex; z-index: 10; }
        
        /* Notifications & Loader */
        #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
        #genlove-notify.show { top: 20px; }
        #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
        .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Design Screens Partie 1 */
        .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; background:#f4e9da; }
        .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
        .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
        .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
        .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
        .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; border: none; cursor: pointer; }
        .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px; }
        
        /* Switch Settings */
        .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #007bff; }
        input:checked + .slider:before { transform: translateX(21px); }

        /* Design Chat Partie 2 */
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; border: 1px solid #333; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; white-space: pre-wrap; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .received { background: #e2ecf7; align-self: flex-start; }
        
        /* Ecrans Finaux */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
        #security-popup { display: none; position: absolute; inset:0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
    </style>
</head>
<body>

    <div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

        <div id="scr-home" class="screen-layer active home-screen">
            <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <div style="font-weight: bold; color: #1a2a44; margin-bottom: 40px;">Unissez cœur et santé pour bâtir des couples sains</div>
            <button class="btn-dark" onclick="showScreen('scr-profile')">➔ Se connecter</button>
            <button onclick="showScreen('scr-signup')" style="background:none; border:none; color:#1a2a44; text-decoration:none; font-weight:bold; cursor:pointer; margin-top:15px;">👤 Créer un compte</button>
        </div>

        <div id="scr-signup" class="screen-layer">
            <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>
            <div style="padding: 25px; text-align: center;">
                <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
                <form onsubmit="saveProfile(event)">
                    <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
                    <input type="file" id="i" style="display:none" onchange="previewPartie1(event)">
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
                    <div style="margin-top:20px; padding:15px; background:#fff5f7; border-radius:12px; display:flex; gap:10px; text-align:left;">
                        <input type="checkbox" id="oath" required> <label for="oath" style="font-size:0.82rem; color:#d63384;">Je confirme sur l'honneur que les informations saisies sont sincères.</label>
                    </div>
                    <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
                </form>
            </div>
        </div>

        <div id="scr-profile" class="screen-layer" style="background:#f8f9fa;">
            <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <button onclick="showScreen('scr-home')" style="border:none; background:#eff6ff; padding:8px 14px; border-radius:12px; font-size:0.8rem; font-weight:bold; color:#1a2a44;">🏠 Accueil</button>
                    <span onclick="showScreen('scr-settings')" style="font-size:1.4rem; cursor:pointer;">⚙️</span>
                </div>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-position:center;"></div>
                <h2 id="vN" style="margin:5px 0;">Utilisateur</h2>
                <p id="vR" style="color:#666; font-size:0.9rem;">📍 Localisation</p>
                <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
            <div style="background:white; border-radius:15px; margin:0 15px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #f8f8f8;"><span>Génotype</span><b id="rG">...</b></div>
                <div style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #f8f8f8;"><span>Groupe Sanguin</span><b id="rS">...</b></div>
                <div style="display:flex; justify-content:space-between; padding:15px 20px;"><span>Projet de vie</span><b id="rP">...</b></div>
            </div>
            <button class="btn-dark" onclick="renderMatching()">🔍 Trouver un partenaire</button>
        </div>

        <div id="scr-settings" class="screen-layer" style="background:#f4f7f6;">
            <div style="padding:25px; background:white; text-align:center;">
                <div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            </div>
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">CONFIDENTIALITÉ</div>
            <div style="background:white; border-radius:15px; margin:0 15px 15px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 20px; border-bottom:1px solid #f8f8f8;">
                    <span>Visibilité profil</span>
                    <label class="switch">
                        <input type="checkbox" checked onchange="updateVisibility(this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <div style="padding:15px 20px; font-size:0.8rem; color:#666;">Statut actuel : <b id="status-text" style="color:#007bff;">Public</b></div>
            </div>
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">COMPTE</div>
            <div style="background:white; border-radius:15px; margin:0 15px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div onclick="showScreen('scr-signup')" style="padding:15px 20px; display:flex; justify-content:space-between; cursor:pointer;"><span>Modifier mon profil</span><b>Modifier ➔</b></div>
            </div>
            <div style="background:white; border-radius:15px; margin:15px 15px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="padding:15px 20px; color:red; font-weight:bold;">Supprimer mon compte</div>
                <div style="display:flex; justify-content:space-around; padding:15px;">
                    <button onclick="deleteAccount()" style="background:#1a2a44; color:white; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Oui</button>
                    <button onclick="showNotify('Action annulée')" style="background:#eee; color:#333; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Non</button>
                </div>
            </div>
            <button class="btn-pink" onclick="showScreen('scr-profile')">Retour</button>
        </div>

        <div id="scr-matching" class="screen-layer">
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3 style="margin:0;">Partenaires Compatibles</h3></div>
            <div id="match-container"></div>
            <button class="btn-pink" onclick="showScreen('scr-profile')">Retour au profil</button>
        </div>

        <div id="scr-chat" class="screen-layer">
            <div id="security-popup">
                <div class="final-card">
                    <h3>🔒 Espace sécurisé</h3>
                    <p>Cet échange est privé et éphémère. Tout s'effacera dans 30 min.</p>
                    <button class="btn-pink" style="width:100%" onclick="closeSecurityPopup()">Démarrer</button>
                </div>
            </div>
            <div class="chat-header">
                <button style="border:none; background:white; color:#9dbce3; border-radius:8px; padding:5px 10px; font-weight:bold;" onclick="showFinal('chat')">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <button style="border:none; background:#1a2a44; color:white; padding:8px; border-radius:8px; font-size:0.7rem;" onclick="showFinal('app')">Logout 🔒</button>
            </div>
            <div class="chat-messages" id="box-chat">
                <div class="bubble received">Bonjour ! Ton profil correspond à mes critères santé. Échangeons ! 👋</div>
            </div>
            <div style="padding:10px 15px 30px; display:flex; gap:10px; background:white; border-top:1px solid #eee;">
                <textarea id="msg-input" style="flex:1; padding:12px; border-radius:20px; border:1px solid #ddd; resize:none; outline:none;" placeholder="Écrivez..." rows="1"></textarea>
                <button onclick="sendMsg()" style="background:#4a76b8; color:white; border:none; width:45px; height:45px; border-radius:50%; cursor:pointer;">➤</button>
            </div>
        </div>

        <div id="scr-final" class="screen-layer final-bg">
            <div id="final-card-content" class="final-card"></div>
        </div>
    </div>

    <script>
        // NAVIGATION
        function showScreen(id) {
            document.querySelectorAll('.screen-layer').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        // --- LOGIQUE PARTIE 1 ---
        let b64 = localStorage.getItem('u_p') || "";
        
        function previewPartie1(e){ 
            const r=new FileReader(); 
            r.onload=()=>{ 
                b64=r.result; 
                document.getElementById('c').style.backgroundImage='url('+b64+')'; 
                document.getElementById('t').style.display='none'; 
            }; 
            r.readAsDataURL(e.target.files[0]); 
        }

        function saveProfile(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            setTimeout(() => {
                updateUIProfile();
                document.getElementById('loader').style.display='none';
                showScreen('scr-profile');
            }, 3000);
        }

        function updateUIProfile(){
            const p = localStorage.getItem('u_p');
            if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')';
            document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "") + " " + (localStorage.getItem('u_ln') || "");
            document.getElementById('rG').innerText = localStorage.getItem('u_gt');
            document.getElementById('rS').innerText = localStorage.getItem('u_gs');
            document.getElementById('rP').innerText = "Enfant : " + localStorage.getItem('u_pj');
        }

        function renderMatching(){
            const partners = [{id:1, n:"Sarah", gt:"AA"}, {id:2, n:"Marc", gt:"AS"}, {id:3, n:"Léa", gt:"SS"}];
            const myGt = localStorage.getItem('u_gt');
            const container = document.getElementById('match-container');
            
            let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
            
            container.innerHTML = (myGt === "SS" || myGt === "AS") ? 
                '<div class="popup-msg">✨ <b>Engagement Santé :</b> Pour protéger votre descendance, Genlove vous propose uniquement des profils AA.</div>' : '';
            
            filtered.forEach(p => {
                container.innerHTML += \`
                <div class="match-card">
                    <div style="width:50px; height:50px; border-radius:50%; background:#eee; filter:blur(6px);"></div>
                    <div style="flex:1"><b>\${p.n}</b><br><small>Génotype \${p.gt}</small></div>
                    <button class="btn-dark" style="padding:8px 15px; margin:0; width:auto;" onclick="openChat('\${p.n}')">Contacter</button>
                </div>\`;
            });
            showScreen('scr-matching');
        }

        // --- LOGIQUE PARAMÈTRES ---
        function updateVisibility(el) {
            const txt = document.getElementById('status-text');
            txt.innerText = el.checked ? "Public" : "Privé";
            txt.style.color = el.checked ? "#007bff" : "#666";
            showNotify('Paramètre mis à jour !');
        }

        function deleteAccount() {
            localStorage.clear();
            showNotify('Compte supprimé');
            setTimeout(() => location.reload(), 1500);
        }

        function showNotify(msg) {
            const n = document.getElementById('genlove-notify');
            document.getElementById('notify-msg').innerText = msg;
            n.classList.add('show');
            setTimeout(() => n.classList.remove('show'), 3000);
        }

        // --- LOGIQUE PARTIE 2 (CHAT) ---
        let timeLeft = 1800;
        let timerInterval;

        function openChat(name) {
            showScreen('scr-chat');
            document.getElementById('security-popup').style.display = 'flex';
        }

        function closeSecurityPopup() {
            document.getElementById('security-popup').style.display = 'non
