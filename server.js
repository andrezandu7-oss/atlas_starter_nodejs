const express = require('express');
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

        /* HEADER CHAT */
        .chat-header { 
            background: #9dbce3; color: white; padding: 12px 15px; 
            display: flex; justify-content: space-between; align-items: center; 
            flex-shrink: 0; z-index: 10;
        }

        .btn-quit {
            background: #ffffff; color: #9dbce3; border: none;
            width: 32px; height: 32px; border-radius: 8px;
            font-size: 1.2rem; font-weight: bold; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }

        .btn-logout-badge {
            background: #1a2a44; color: white; border: none;
            padding: 8px 15px; border-radius: 8px;
            font-size: 0.85rem; font-weight: bold; cursor: pointer;
        }

        @keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .heart-icon { display: inline-block; color: #ff416c; animation: heartbeat 1s infinite; margin-right: 8px; }
        .digital-clock {
            background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px;
            font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem;
            display: inline-flex; align-items: center; border: 1px solid #333;
        }

        /* MESSAGERIE */
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-bottom: 120px; }
        .bubble { 
            padding: 12px 16px; border-radius: 18px; max-width: 75%; 
            line-height: 1.4; word-wrap: break-word; white-space: pre-wrap; 
            height: auto; display: block;
        }
        .received { background: #e2ecf7; align-self: flex-start; color: #333; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }

        /* ZONE DE SAISIE DYNAMIQUE */
        .input-area { 
            position: fixed; bottom: 0; width: 100%; max-width: 450px; 
            padding: 10px 15px 30px 15px; border-top: 1px solid #eee; 
            display: flex; gap: 10px; background: white; align-items: flex-end;
            box-sizing: border-box;
        }
        .input-box { 
            flex: 1; background: #f1f3f4; border: 1px solid #ddd; 
            padding: 12px 15px; border-radius: 20px; outline: none;
            font-family: inherit; font-size: 1rem; resize: none;
            max-height: 120px; min-height: 20px; overflow-y: auto;
            line-height: 1.2;
        }

        /* ÉCRAN FINAL */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; }
        .btn-restart { background: #ff416c; color: white; border: none; padding: 16px; border-radius: 30px; width: 100%; font-weight: bold; cursor: pointer; margin-top: 25px; }

        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding-bottom: 20px; overflow: hidden; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; margin: 0 5%; font-weight: bold; cursor: pointer; }
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; width: 90%; margin: 10px 5%; font-weight: bold; cursor: pointer; }

        #security-popup { display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; }
        .pedagogic-box { background: #f0f7ff; border-radius: 15px; padding: 15px; text-align: left; margin: 20px 0; border: 1px solid #d0e3ff; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card">
            <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
            <div style="padding: 30px 20px; text-align: center;">
                <p style="font-size: 1.15rem; font-weight: 500;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                <button class="btn-blue" onclick="show(2)" style="margin-top:20px;">📖 Ouvrir Genlove</button>
            </div>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="notif-card">
            <div style="background: #0000ff; color: white; padding: 18px; font-weight: bold;">Genlove - confirmation</div>
            <div style="padding: 30px 25px; background: white;">
                <p>Accepter Sarah ? ❤️</p>
                <button class="btn-green" onclick="showSecurityPopup()">Accepter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup">
            <div class="popup-card">
                <h3>🔒 Espace de discussion privé</h3>
                <p>Genlove a sécurisé cet échange.</p>
                <button style="background:#4a76b8; color:white; border:none; padding:16px; border-radius:30px; width:100%;" onclick="closePopup()">Démarrer</button>
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
            <div class="bubble received">Bonjour ! Comment vas-tu ? 👋</div>
        </div>

        <div class="input-area" id="chatInput">
            <textarea id="msg" class="input-box" placeholder="Écrivez votre message..." rows="1" oninput="autoGrow(this)"></textarea>
            <button style="background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; flex-shrink:0;" onclick="send()">➤</button>
        </div>
    </div>

    <div id="screen-final" class="screen final-bg">
        <div id="final-card-content" class="final-card"></div>
    </div>

    <script>
        let timeLeft = 30 * 60; 
        let timerInterval;

        function show(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id === 'final' ? 'screen-final' : 'screen' + id).classList.add('active');
        }

        function showSecurityPopup() { show(3); document.getElementById('security-popup').style.display = 'flex'; }
        function closePopup() { document.getElementById('security-popup').style.display = 'none'; startTimer(); }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = mins + ":" + (secs < 10 ? "0" : "") + secs;
                if (timeLeft <= 0) { clearInterval(timerInterval); showFinal('chat', true); }
            }, 1000);
        }

        // FONCTION D'AUTO-AGRANDISSEMENT AU FUR ET À MESURE
        function autoGrow(element) {
            element.style.height = "5px"; // Reset
            element.style.height = (element.scrollHeight) + "px"; // Ajuste à la taille du texte
        }

        function send() {
            const input = document.getElementById('msg');
            if(input.value.trim()) {
                const div = document.createElement('div');
                div.className = 'bubble sent';
                div.innerText = input.value;
                document.getElementById('box').appendChild(div);
                
                input.value = ''; // Vide le texte
                input.style.height = "auto"; // Reset la hauteur
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }

        function showFinal(type, auto = false) {
            if(!auto) {
                const msg = type === 'chat' ? "Voulez-vous vraiment quitter cette conversation ?" : "Voulez-vous vraiment vous déconnecter ?";
                if(!confirm(msg)) return;
            }
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            if(type === 'chat') {
                card.innerHTML = \`<h2>Merci pour cet échange ✨</h2><button class="btn-restart" onclick="location.reload()">Trouver un autre profil</button>\`;
            } else {
                card.innerHTML = \`<h2>Merci pour votre confiance 🛡️</h2><button class="btn-restart" onclick="location.href='about:blank';">Quitter Genlove</button>\`;
            }
            show('final');
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(genloveApp));
app.listen(port);
