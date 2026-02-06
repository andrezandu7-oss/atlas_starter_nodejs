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

        /* --- STYLES PARTIE 1 (PROFIL) --- */
        .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; background: #f4e9da; }
        .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
        .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align:center; font-weight:bold; width:85%; margin:20px auto; border:none; cursor:pointer; display:block; text-decoration:none; }
        .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; font-weight:bold; width:80%; border:none; cursor:pointer; margin:10px auto; }
        .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
        .input-box { width: 90%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 10px auto; font-size: 1rem; display:block; }
        .st-group { background: white; border-radius: 15px; margin: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .st-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; }

        /* --- STYLES MESSAGERIE --- */
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 12px; border-radius: 10px; font-family: monospace; font-weight: bold; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 80px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; font-size: 0.9rem; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { position: absolute; bottom: 0; width: 100%; padding: 15px; background: white; display: flex; gap: 10px; box-sizing: border-box; }
        
        /* POPUP & FINAL */
        #security-popup { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; }
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; margin: auto; }
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
                <div style="font-size: 0.75rem; color: #666; margin-top: 25px;">🔒 Vos données de santé sont cryptées et confidentielles.</div>
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
            <button class="btn-dark" onclick="showScreen('scr-notif-1')">🔍 Lancer le Matching</button>
        </div>

        <div id="scr-notif-1" class="screen" style="background:#f0f2f5; justify-content:center;">
            <div class="notif-card">
                <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
                <div style="padding: 30px 20px; text-align: center;">
                    <p style="font-weight: 500;">Quelqu'un de compatible souhaite échanger 💞</p>
                    <button class="btn-pink" style="width:90%;" onclick="showScreen('scr-notif-2')">📖 Ouvrir</button>
                </div>
            </div>
        </div>

        <div id="scr-notif-2" class="screen" style="background:#f0f2f5; justify-content:center;">
            <div class="notif-card">
                <div style="background: #1a2a44; color: white; padding: 18px; font-weight: bold;">Confirmation</div>
                <div style="padding: 30px 25px; text-align:center;">
                    <p>Accepter l'échange avec Sarah ? ❤️</p>
                    <button class="btn-pink" onclick="openChat()">Accepter</button>
                    <button style="background:none; border:none; color:red; cursor:pointer;" onclick="showScreen('scr-profile')">Refuser</button>
                </div>
            </div>
        </div>

        <div id="scr-chat" class="screen">
            <div id="security-popup" style="display:flex;">
                <div style="background:white; padding:30px; border-radius:20px; width:80%; text-align:center;">
                    <h3>🔒 Espace Sécurisé</h3>
                    <p style="font-size:0.9rem;">Tout s'efface dans 30 min par mesure de confidentialité.</p>
                    <button class="btn-dark" onclick="closePopup()">Démarrer</button>
                </div>
            </div>
            <div class="chat-header">
                <button onclick="exitChat()" style="border:none; background:white; border-radius:5px;">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <div style="font-size:0.8rem;">En ligne</div>
            </div>
            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            </div>
            <div class="input-area">
                <input type="text" id="msg" class="input-box" style="margin:0;" placeholder="Message...">
                <button onclick="send()" style="background:#1a2a44; color:white; border:none; border-radius:50%; width:45px; height:45px;">➤</button>
            </div>
        </div>

        <div id="scr-final" class="screen final-bg">
            <div class="notif-card" style="padding:40px 20px; text-align:center;">
                <div style="font-size: 3rem;">✨</div>
                <h2 style="color:#1a2a44;">Échange terminé</h2>
                <p style="color:#666;">Par sécurité, l'historique a été effacé.</p>
                <button class="btn-pink" onclick="location.reload()">Retour Accueil</button>
            </div>
        </div>

    </div>

    <script>
        let timeLeft = 30 * 60;
        let timerInterval;

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
            updateUI();
            showScreen('scr-profile');
        }

        function updateUI() {
            document.getElementById('vN').innerText = localStorage.getItem('u_fn');
            document.getElementById('rG').innerText = localStorage.getItem('u_gt');
            document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        }

        // --- LOGIQUE CHAT ---
        function openChat() { showScreen('scr-chat'); }
        function closePopup() { document.getElementById('security-popup').style.display = 'none'; startTimer(); }

        function startTimer() {
            if(timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
                if(timeLeft <= 0) { clearInterval(timerInterval); showScreen('scr-final'); }
            }, 1000);
        }

        function send() {
            const input = document.getElementById('msg');
            if(input.value.trim()) {
                const d = document.createElement('div');
                d.className = 'bubble sent';
                d.innerText = input.value;
                document.getElementById('box').appendChild(d);
                input.value = "";
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }

        function exitChat() { if(confirm("Quitter et effacer la discussion ?")) showScreen('scr-final'); }

        window.onload = () => { if(localStorage.getItem('u_fn')) updateUI(); };
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port, () => console.log('Genlove Fusionné !'));
