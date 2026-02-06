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
    <title>Genlove - Officiel</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .app-shell { width: 100%; max-width: 450px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .screen { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; }
        .active { display: flex; z-index: 10; }

        /* --- STYLES PROFIL (PARTIE 1) --- */
        .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; background: #f4e9da; }
        .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
        .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align:center; font-weight:bold; width:85%; margin:20px auto; border:none; cursor:pointer; display:block; text-decoration:none; }
        .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; font-weight:bold; width:80%; border:none; cursor:pointer; margin:10px auto; }
        .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
        .input-box { width: 90%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 10px auto; font-size: 1rem; display:block; }
        .st-group { background: white; border-radius: 15px; margin: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .st-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; }

        /* --- STYLES MESSAGERIE PERTINENTS (PARTIE 2) --- */
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .btn-quit { background: white; color: #9dbce3; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .btn-logout-badge { background: #1a2a44; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; cursor: pointer; }
        
        @keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .heart-icon { display: inline-block; color: #ff416c; animation: heartbeat 1s infinite; margin-right: 8px; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; }

        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; white-space: pre-wrap; font-size: 0.9rem; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        
        .input-area { position: absolute; bottom: 0; width: 100%; padding: 10px 15px 45px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; align-items: flex-end; }
        
        /* NOTIFICATIONS & POPUP */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; padding-bottom: 20px; text-align: center; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; margin: 0 auto; display: block; }
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; width: 90%; font-weight: bold; cursor: pointer; margin: 10px auto; display: block; }
        
        #security-popup { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; }
        .pedagogic-box { background: #f0f7ff; border-radius: 15px; padding: 15px; text-align: left; margin: 20px 0; border: 1px solid #d0e3ff; font-size: 0.85rem; }

        /* FINAL */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
        .btn-restart { background: #ff416c; color: white; border: none; padding: 16px; border-radius: 30px; width: 100%; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-top: 25px; }
        .btn-secondary { background: none; border: 1px solid #ccc; color: #666; padding: 12px; border-radius: 30px; width: 100%; font-weight: bold; cursor: pointer; margin-top: 10px; }
    </style>
</head>
<body>

    <audio id="lastMinuteSound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg">
    </audio>

    <div class="app-shell">
        
        <div id="scr-home" class="screen active">
            <div class="home-screen">
                <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
                <div style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé pour bâtir des couples sains</div>
                <button class="btn-dark" onclick="checkAuth()">➔ Se connecter</button>
                <button class="btn-pink" onclick="showScreen('scr-signup')">👤 Créer un compte</button>
            </div>
        </div>

        <div id="scr-signup" class="screen" style="padding:20px; text-align:center;">
            <h2 style="color:#ff416c;">Mon Profil Santé</h2>
            <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo</span></div>
            <input type="file" id="i" style="display:none" onchange="preview(event)">
            <input type="text" id="fn" class="input-box" placeholder="Prénom">
            <select id="gt" class="input-box"><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
            <button class="btn-pink" onclick="saveProfile()">🚀 Valider mon profil</button>
        </div>

        <div id="scr-profile" class="screen" style="background:#f8f9fa;">
            <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px;">
                <div id="vP" style="width:100px; height:100px; border-radius:50%; border:3px solid #ff416c; margin:0 auto 15px; background-size:cover;"></div>
                <h2 id="vN" style="margin:0;">Nom</h2>
                <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
            </div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG" style="color:#ff416c;">--</b></div>
            </div>
            <button class="btn-dark" onclick="showScreen('scr-notif1')">🔍 Lancer le Matching</button>
        </div>

        <div id="scr-notif1" class="screen notif-bg">
            <div class="notif-card">
                <div style="padding:15px; border-bottom:1px solid #eee; text-align:left; font-weight:bold;">📩 Genlove Notification</div>
                <div style="padding: 30px 20px;">
                    <p style="font-size: 1.15rem; font-weight: 500; margin-bottom: 10px;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                    <p style="font-size: 0.95rem; color: #666; margin-bottom: 25px;">Ouvrez Genlove pour découvrir qui c'est 💖</p>
                </div>
                <button class="btn-blue" onclick="showScreen('scr-notif2')">📖 Ouvrir l'application Genlove</button>
            </div>
        </div>

        <div id="scr-notif2" class="screen notif-bg">
            <div class="notif-card">
                <div style="background: #0000ff; color: white; padding: 18px; text-align:left; font-weight: bold;">Genlove - confirmation</div>
                <div style="padding: 30px 25px;">
                    <p style="font-size: 1.1rem; margin-bottom: 25px;">Accepter Sarah ? ❤️</p>
                    <button class="btn-green" onclick="showSecurityPopup()">Accepter</button>
                    <button style="background:none; border:none; color:red; font-weight:bold; cursor:pointer; margin-top:15px;" onclick="showFinal('chat', true)">✕ Rejeter</button>
                </div>
            </div>
        </div>

        <div id="scr-chat" class="screen">
            <div id="security-popup">
                <div class="popup-card">
                    <h3>🔒 Espace de discussion privé</h3>
                    <p><b>Par mesure de confidentialité, Genlove a sécurisé cet échange.</b></p>
                    <div class="pedagogic-box">
                        <div style="margin-bottom:8px;">🛡️ <b>Éphémère :</b> Tout s'efface dans 30 min.</div>
                        <div>🕵️ <b>Privé :</b> Aucun historique conservé.</div>
                    </div>
                    <button class="btn-dark" style="width:100%;" onclick="closePopup()">Démarrer l'échange</button>
                </div>
            </div>

            <div class="chat-header">
                <button class="btn-quit" onclick="showFinal('chat')">✕</button>
                <div class="digital-clock">
                    <span class="heart-icon">❤️</span><span id="timer-display">30:00</span>
                </div>
                <button class="btn-logout-badge" onclick="showFinal('app')">Logout 🔒</button>
            </div>

            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            </div>

            <div class="input-area">
                <textarea id="msg" style="flex:1; background:#f1f3f4; border:1px solid #ddd; padding:12px; border-radius:25px; outline:none; resize:none; font-family:sans-serif; max-height:150px;" placeholder="Écrivez votre message..." rows="1" oninput="autoGrow(this)"></textarea>
                <button style="background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor:pointer;" onclick="send()">➤</button>
            </div>
        </div>

        <div id="scr-final" class="screen final-bg">
            <div id="final-card-content" class="final-card"></div>
        </div>

    </div>

    <script>
        let timeLeft = 30 * 60;
        let timerInterval;
        let currentPulseInterval = null;

        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        function checkAuth() {
            if(localStorage.getItem('u_fn')) { updateUI(); showScreen('scr-profile'); }
            else alert("Veuillez créer un compte.");
        }

        let b64 = "";
        function preview(e){
            const r=new FileReader();
            r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; };
            r.readAsDataURL(e.target.files[0]);
        }

        function saveProfile() {
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_p', b64);
            updateUI(); showScreen('scr-profile');
        }

        function updateUI() {
            document.getElementById('vN').innerText = localStorage.getItem('u_fn');
            document.getElementById('rG').innerText = localStorage.getItem('u_gt');
            document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        }

        // --- LOGIQUE PERTINENTE EXTRAITE ---
        function showSecurityPopup() { showScreen('scr-chat'); document.getElementById('security-popup').style.display = 'flex'; }
        
        function closePopup() { 
            document.getElementById('security-popup').style.display = 'none'; 
            const audio = document.getElementById('lastMinuteSound');
            audio.play().then(() => { audio.pause(); audio.currentTime = 0; });
            startTimer(); 
        }

        function autoGrow(el) { el.style.height = "auto"; el.style.height = (el.scrollHeight) + "px"; }

        function triggerAlarm(speed, duration, loop = false) {
            const audio = document.getElementById('lastMinuteSound');
            audio.loop = loop;
            let elapsed = 0;
            currentPulseInterval = setInterval(() => {
                audio.currentTime = 0; audio.play().catch(()=>{});
                if (navigator.vibrate) navigator.vibrate(100);
                elapsed += speed; if (elapsed >= duration && !loop) { clearInterval(currentPulseInterval); }
            }, speed);
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;

                if ([60, 40, 20].includes(timeLeft)) triggerAlarm(400, 5000);
                if (timeLeft === 5) triggerAlarm(200, 5000, true);

                if (timeLeft <= 0) { clearInterval(timerInterval); showFinal('chat', true); }
            }, 1000);
        }

        function send() {
            const i = document.getElementById('msg');
            if(i.value.trim()) {
                const d = document.createElement('div'); d.className = 'bubble sent'; d.innerText = i.value;
                document.getElementById('box').appendChild(d);
                i.value = ''; i.style.height = "auto";
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }

        function showFinal(type, auto = false) {
            if(!auto) {
                const msg = type === 'chat' ? "Voulez-vous vraiment quitter cette conversation ?" : "Voulez-vous vraiment vous déconnecter ?";
                if(!confirm(msg)) return;
            }
            clearInterval(timerInterval);
            if(currentPulseInterval) clearInterval(currentPulseInterval);
            
            const card = document.getElementById('final-card-content');
            if(type === 'chat') {
                card.innerHTML = '<h2>Merci pour cet échange</h2><p>Genlove vous remercie pour ce moment de partage.</p><button class="btn-restart" onclick="location.reload()">Trouver un autre profil</button>';
            } else {
                card.innerHTML = '<h2>Session fermée</h2><p>Votre session a été fermée en toute sécurité.</p><button class="btn-restart" style="background:#1a2a44;" onclick="location.reload()">Retour Accueil</button>';
            }
            showScreen('scr-final');
        }

        window.onload = () => { if(localStorage.getItem('u_fn')) updateUI(); };
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port);
