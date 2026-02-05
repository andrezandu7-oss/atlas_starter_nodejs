const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Version Intégrale Fusionnée</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .app-shell { width: 100%; max-width: 450px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .screen-layer { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; }
        .screen-layer.active { display: flex; z-index: 10; }
        
        /* Styles de ta PARTIE 1 (Identiques à ton code) */
        #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
        #genlove-notify.show { top: 20px; }
        #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
        .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; background:#f4e9da; }
        .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
        .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
        .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
        .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
        .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
        .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px; }
        
        /* Styles de ta PARTIE 2 (Identiques à ton code) */
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; }
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; white-space: pre-wrap; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .received { background: #e2ecf7; align-self: flex-start; }
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
            <button onclick="showScreen('scr-signup')" style="background:none; border:none; color:#1a2a44; text-decoration:none; font-weight:bold; cursor:pointer;">👤 Créer un compte</button>
        </div>

        <div id="scr-signup" class="screen-layer">
            <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>
            <div class="page-white">
                <h2 style="color:#ff416c;">Configuration Santé</h2>
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
                        <input type="checkbox" id="oath" required> <label for="oath" style="font-size:0.82rem; color:#d63384;">Je confirme sur l'honneur la sincérité des informations.</label>
                    </div>
                    <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
                </form>
            </div>
        </div>

        <div id="scr-profile" class="screen-layer" style="background:#f8f9fa;">
            <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
                <div style="display:flex; justify-content:space-between;"><button onclick="showScreen('scr-home')" style="border:none; background:#eff6ff; padding:8px 14px; border-radius:12px; font-weight:bold;">🏠 Accueil</button><span onclick="showScreen('scr-settings')">⚙️</span></div>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
                <h2 id="vN" style="margin:5px 0;">Utilisateur</h2>
                <p id="vR" style="color:#666; font-size:0.9rem;">📍 Localisation</p>
                <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
            <div style="background:white; border-radius:15px; margin:0 15px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #f8f8f8;"><span>Génotype</span><b id="rG">...</b></div>
                <div style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #f8f8f8;"><span>Groupe Sanguin</span><b id="rS">...</b></div>
                <div style="display:flex; justify-content:space-between; padding:15px 20px;"><span>Projet de vie</span><b id="rP">...</b></div>
            </div>
            <button class="btn-dark" onclick="renderMatchingPartie1()">🔍 Trouver un partenaire</button>
        </div>

        <div id="scr-matching" class="screen-layer">
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3 style="margin:0;">Partenaires Compatibles</h3></div>
            <div id="match-container-partie1"></div>
            <button class="btn-pink" onclick="showScreen('scr-profile')">Retour au profil</button>
        </div>

        <div id="scr-chat" class="screen-layer">
            <div id="security-popup" style="display:none;">
                <div class="final-card" style="text-align:center;">
                    <h3>🔒 Espace de discussion privé</h3>
                    <p><b>Par mesure de confidentialité, Genlove a sécurisé cet échange...</b></p>
                    <button class="btn-pink" style="width:100%" onclick="closePopupPartie2()">Démarrer l'échange</button>
                </div>
            </div>
            <div class="chat-header">
                <button class="btn-dark" style="margin:0; padding:5px 10px;" onclick="showFinalPartie2('chat')">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <button class="btn-dark" style="margin:0; padding:5px 10px; font-size:0.7rem;" onclick="showFinalPartie2('app')">Logout 🔒</button>
            </div>
            <div class="chat-messages" id="box-chat">
                <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            </div>
            <div style="padding:10px; display:flex; gap:10px; background:white; border-top:1px solid #eee;">
                <textarea id="msg-input" style="flex:1; padding:12px; border-radius:20px; border:1px solid #ddd; resize:none;" placeholder="Écrivez..."></textarea>
                <button onclick="sendMsgPartie2()" style="background:#4a76b8; color:white; border:none; width:45px; height:45px; border-radius:50%;">➤</button>
            </div>
        </div>

        <div id="scr-final" class="screen-layer final-bg">
            <div id="final-card-content" class="final-card"></div>
        </div>
    </div>

    <script>
        // NAVIGATION CORE
        function showScreen(id) {
            document.querySelectorAll('.screen-layer').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        // --- LOGIQUE PARTIE 1 ---
        let b64 = localStorage.getItem('u_p') || "";
        function previewPartie1(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        
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

        function renderMatchingPartie1(){
            const partners = [{id:1, gt:"AA", gs:"O+"}, {id:2, gt:"AS", gs:"B-"}, {id:3, gt:"SS", gs:"A+"}];
            const myGt = localStorage.getItem('u_gt');
            const container = document.getElementById('match-container-partie1');
            let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
            
            container.innerHTML = (myGt === "SS" || myGt === "AS") ? '<div class="popup-msg">✨ <b>Engagement Santé :</b> Profils AA uniquement pour votre sécurité.</div>' : '';
            filtered.forEach(p => {
                container.innerHTML += \`
                <div class="match-card">
                    <div style="width:50px; height:50px; border-radius:50%; background:#eee; filter:blur(6px);"></div>
                    <div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div>
                    <button class="btn-dark" style="padding:8px 15px; margin:0;" onclick="startChatPartie2()">Contacter</button>
                </div>\`;
            });
            showScreen('scr-matching');
        }

        // --- LOGIQUE PARTIE 2 ---
        let timeLeft = 1800;
        let timerInterval;

        function startChatPartie2() {
            showScreen('scr-chat');
            document.getElementById('security-popup').style.display = 'flex';
        }

        function closePopupPartie2() {
            document.getElementById('security-popup').style.display = 'none';
            startTimerPartie2();
        }

        function startTimerPartie2() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let m = Math.floor(timeLeft / 60), s = timeLeft % 60;
                document.getElementById('timer-display').innerText = (m<10?"0":"")+m+":"+(s<10?"0":"")+s;
                if ([60,40,20].includes(timeLeft)) triggerAlarmPartie2();
                if (timeLeft <= 0) showFinalPartie2('chat', true);
            }, 1000);
        }

        function triggerAlarmPartie2(){
            const audio = document.getElementById('lastMinuteSound');
            let count = 0;
            let pulse = setInterval(() => {
                audio.play().catch(()=>{});
                if (navigator.vibrate) navigator.vibrate(100);
                count++; if(count >= 5) clearInterval(pulse);
            }, 400);
        }

        function sendMsgPartie2(){
            const input = document.getElementById('msg-input');
            if(input.value.trim()){
                const d = document.createElement('div');
                d.className = 'bubble sent'; d.innerText = input.value;
                document.getElementById('box-chat').appendChild(d);
                input.value = '';
                document.getElementById('box-chat').scrollTop = document.getElementById('box-chat').scrollHeight;
            }
        }

        function showFinalPartie2(type, auto = false) {
            if(!auto && !confirm("Confirmer ?")) return;
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            card.innerHTML = \`<h2>Merci</h2><p>Tout a été sécurisé.</p><button class="btn-pink" onclick="location.reload()">Retour Accueil</button>\`;
            showScreen('scr-final');
        }

        window.onload = () => { if(localStorage.getItem('u_fn')) updateUIProfile(); };
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port);
