const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
    .app-shell { width: 100%; max-width: 450px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .screen { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; z-index: 10; }
    .active { display: flex; }

    /* --- DESIGN PARTIE 1 --- */
    .page-white { background: white; min-height: 100%; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-size: cover; background-position: center; position: relative; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; width: 85%; margin: 20px auto; border: none; cursor: pointer; display: block; text-decoration: none; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; font-weight: bold; width: 80%; margin: 10px auto; border: none; cursor: pointer; display: block; text-decoration: none; }
    .st-group { background: white; border-radius: 15px; margin: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; overflow: hidden; }
    .st-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }

    /* --- MESSAGERIE & ALERTES (REFRESH) --- */
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; }
    @keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
    .heart-icon { color: #ff416c; animation: heartbeat 1s infinite; margin-right: 8px; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; font-size: 0.9rem; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
    .input-area { position: absolute; bottom: 0; width: 100%; padding: 10px 15px 40px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; align-items: flex-end; }

    /* ÉCRANS FINAUX & NOTIFS */
    .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
    .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
    .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
    .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; padding-bottom: 20px; }
    
    #security-popup { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

    <div class="app-shell">
        <div id="scr-home" class="screen active" style="background:#f4e9da; justify-content:center; align-items:center; text-align:center; padding:30px;">
            <div style="font-size:3.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <div style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé pour bâtir des couples sains</div>
            <button class="btn-dark" onclick="checkAuth()">➔ Se connecter</button>
            <button class="btn-pink" onclick="show('scr-signup')">👤 Créer un compte</button>
        </div>

        <div id="scr-signup" class="screen page-white">
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
                <h2 id="vN">Nom</h2>
                <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
            </div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG" style="color:#ff416c;">--</b></div>
            </div>
            <button class="btn-dark" onclick="show('scr-notif1')">🔍 Lancer le Matching</button>
        </div>

        <div id="scr-notif1" class="screen notif-bg">
            <div class="notif-card">
                <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
                <div style="padding: 30px 20px; text-align: center;">
                    <p style="font-weight: 500;">Quelqu'un de compatible souhaite échanger 💞</p>
                    <button class="btn-pink" style="width:90%;" onclick="show('scr-notif2')">📖 Ouvrir</button>
                </div>
            </div>
        </div>

        <div id="scr-notif2" class="screen notif-bg">
            <div class="notif-card">
                <div style="background: #0000ff; color: white; padding: 18px; font-weight: bold;">Genlove - confirmation</div>
                <div style="padding: 30px 25px;">
                    <p>Accepter Sarah ? ❤️</p>
                    <button class="btn-pink" style="background:#28a745;" onclick="showSecurity()">Accepter</button>
                    <button style="background:none; border:none; color:red; cursor:pointer; width:100%; margin-top:10px;" onclick="showFinal('chat', true)">✕ Rejeter</button>
                </div>
            </div>
        </div>

        <div id="scr-chat" class="screen">
            <div id="security-popup" style="display:flex;">
                <div style="background:white; border-radius:30px; padding:35px 25px; text-align:center; width:88%;">
                    <h3>🔒 Espace Privé</h3>
                    <p>Tout s'efface dans 30 min par mesure de confidentialité.</p>
                    <button class="btn-dark" onclick="closePopup()">Démarrer</button>
                </div>
            </div>
            <div class="chat-header">
                <button onclick="showFinal('chat')" style="border:none; background:white; border-radius:8px; width:32px; height:32px;">✕</button>
                <div class="digital-clock"><span class="heart-icon">❤️</span><span id="timer-display">30:00</span></div>
                <button onclick="showFinal('app')" style="background:#1a2a44; color:white; border:none; padding:8px 12px; border-radius:8px; font-size:0.8rem; font-weight:bold;">Logout 🔒</button>
            </div>
            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            </div>
            <div class="input-area">
                <textarea id="msg" style="flex:1; background:#f1f3f4; border:1px solid #ddd; padding:12px; border-radius:25px; outline:none; resize:none;" placeholder="Message..." rows="1"></textarea>
                <button onclick="send()" style="background:#4a76b8; color:white; border:none; width:45px; height:45px; border-radius:50%;">➤</button>
            </div>
        </div>

        <div id="scr-final" class="screen final-bg">
            <div id="final-card-content" class="final-card"></div>
        </div>
    </div>

    <script>
        let timeLeft = 30 * 60; let timerInterval; let currentPulseInterval;

        function show(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        function checkAuth() { if(localStorage.getItem('u_fn')) { updateUI(); show('scr-profile'); } else alert("Créez un compte."); }

        let b64 = "";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }

        function saveProfile() {
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_p', b64);
            updateUI(); show('scr-profile');
        }

        function updateUI() {
            document.getElementById('vN').innerText = localStorage.getItem('u_fn');
            document.getElementById('rG').innerText = localStorage.getItem('u_gt');
            document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        }

        // --- LOGIQUE REFRESH ---
        function showSecurity() { show('scr-chat'); document.getElementById('security-popup').style.display = 'flex'; }
        
        function closePopup() { 
            document.getElementById('security-popup').style.display = 'none'; 
            const audio = document.getElementById('lastMinuteSound');
            audio.play().then(() => { audio.pause(); audio.currentTime = 0; });
            startTimer(); 
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60); let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
                if ([60, 40, 20].includes(timeLeft)) triggerAlarm(400, 5000);
                if (timeLeft === 5) triggerAlarm(200, 5000, true);
                if (timeLeft <= 0) { clearInterval(timerInterval); showFinal('chat', true); }
            }, 1000);
        }

        function triggerAlarm(speed, duration, loop = false) {
            const audio = document.getElementById('lastMinuteSound');
            if(loop) audio.loop = true;
            let elapsed = 0;
            currentPulseInterval = setInterval(() => {
                audio.currentTime = 0; audio.play().catch(()=>{});
                if (navigator.vibrate) navigator.vibrate(100);
                elapsed += speed; if (elapsed >= duration) { clearInterval(currentPulseInterval); audio.pause(); audio.loop = false; }
            }, speed);
        }

        function send() {
            const i = document.getElementById('msg');
            if(i.value.trim()) {
                const d = document.createElement('div'); d.className = 'bubble sent'; d.innerText = i.value;
                document.getElementById('box').appendChild(d); i.value = '';
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }

        function showFinal(type, auto = false) {
            if(!auto && !confirm("Quitter ?")) return;
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            if(type === 'chat') {
                card.innerHTML = '<h2>Merci pour cet échange</h2><p>Tout a été effacé.</p><button class="btn-pink" onclick="location.reload()">Continuer</button>';
            } else {
                card.innerHTML = '<h2>Session fermée</h2><p>Sécurité garantie.</p><button class="btn-dark" onclick="location.reload()">Retour</button>';
            }
            show('scr-final');
        }

        window.onload = () => { if(localStorage.getItem('u_fn')) updateUI(); };
    </script>
</body></html>`);
});

app.listen(port, () => console.log('Genlove Refresh Opérationnel !'));
             
