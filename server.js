Const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove Simulation - Officiel</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; height: 100vh; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; }
        .active { display: flex; }

        /* RÉAJUSTEMENT ÉCRAN CONFIRMATION (Image 1) */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { 
            background: white; 
            width: 85%; 
            border-radius: 25px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            overflow: hidden; 
        }
        .notif-header-blue { 
            background: #0000ff; 
            color: white; 
            padding: 18px; 
            font-weight: bold; 
            font-size: 1.1rem;
        }
        .notif-body { padding: 40px 25px; text-align: left; }
        .btn-green-flat { 
            background: #28a745; 
            color: white; 
            border: none; 
            padding: 18px; 
            border-radius: 15px; 
            width: 100%; 
            font-weight: bold; 
            font-size: 1rem;
            cursor: pointer;
        }

        /* HEADER CHAT */
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
        }
        .digital-clock {
            background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px;
            font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem;
            display: inline-flex; align-items: center; border: 1px solid #333;
        }

        /* ÉCRAN FINAL (Image 2) */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 35px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
        .btn-restart { background: #1a2a44; color: white; border: none; padding: 18px; border-radius: 30px; width: 100%; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-bottom: 15px; }

        /* MESSAGERIE */
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; white-space: pre-wrap; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { position: fixed; bottom: 0; width: 100%; max-width: 450px; padding: 10px 15px 45px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; align-items: flex-end; }

        /* POPUP SÉCURITÉ */
        #security-popup { display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card">
            <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
            <div style="padding: 30px 20px; text-align: center;">
                <p>Quelqu'un souhaite échanger 💞</p>
                <button style="background:#7ca9e6; color:white; border:none; padding:15px; border-radius:12px; width:100%; cursor:pointer;" onclick="show(2)">Ouvrir</button>
            </div>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="notif-card">
            <div class="notif-header-blue">Genlove - confirmation</div>
            <div class="notif-body">
                <p style="font-size: 1.1rem; margin-bottom: 30px;">Accepter Sarah ? ❤️</p>
                <button class="btn-green-flat" onclick="showSecurityPopup()">Accepter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup">
            <div class="popup-card">
                <h3>🔒 Espace privé</h3>
                <p>Échange sécurisé et éphémère.</p>
                <button style="background:#4a76b8; color:white; border:none; padding:16px; border-radius:30px; width:100%; cursor:pointer;" onclick="closePopup()">Démarrer</button>
            </div>
        </div>

        <div class="chat-header">
            <button class="btn-quit" onclick="showFinal('chat')">✕</button>
            <div class="digital-clock">❤️ <span id="timer-display">02:00</span></div>
            <button style="background: #1a2a44; color: white; border: none; padding: 8px 12px; border-radius: 8px; font-size: 0.8rem;" onclick="showFinal('app')">Logout 🔒</button>
        </div>

        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! 👋</div>
        </div>

        <div class="input-area">
            <textarea id="msg" style="flex:1; background:#f1f3f4; border:1px solid #ddd; padding:12px; border-radius:25px; outline:none; resize:none;" placeholder="Écrivez..." rows="1" oninput="autoGrow(this)"></textarea>
            <button style="background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%;" onclick="send()">➤</button>
        </div>
    </div>

    <div id="screen-final" class="screen final-bg">
        <div id="final-card-content" class="final-card"></div>
    </div>

    <script>
        let timeLeft = 120; 
        let timerInterval;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        function show(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id === 'final' ? 'screen-final' : 'screen' + id).classList.add('active');
        }

        function showSecurityPopup() { show(3); document.getElementById('security-popup').style.display = 'flex'; }
        function closePopup() { document.getElementById('security-popup').style.display = 'none'; startTimer(); }

        function playHeartbeat() {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
                if (timeLeft <= 60 && timeLeft > 0 && timeLeft % 2 === 0) playHeartbeat();
                if (timeLeft <= 0) { clearInterval(timerInterval); showFinal('chat', true); }
            }, 1000);
        }

        function autoGrow(element) { element.style.height = "auto"; element.style.height = (element.scrollHeight) + "px"; }

        function showFinal(type, auto = false) {
            if(!auto && !confirm("Quitter ?")) return;
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            if(type === 'chat') {
                card.innerHTML = \`<h2>Merci pour cet échange</h2><button class="btn-restart" onclick="location.reload()">Trouver un autre profil</button>\`;
            } else {
                card.innerHTML = \`<div style="font-size:3rem;">🛡️</div><h2>Merci pour votre confiance</h2><p>Session fermée.</p><button class="btn-restart" onclick="location.reload()">Retour</button>\`;
            }
            show('final');
        }

        function send() {
            const input = document.getElementById('msg');
            if(input.value.trim()) {
                const div = document.createElement('div');
                div.className = 'bubble sent';
                div.innerText = input.value;
                document.getElementById('box').appendChild(div);
                input.value = '';
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(genloveApp));
app.listen(port);
