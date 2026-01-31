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

        /* ÉCRAN FINAL */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
        .btn-restart { background: #ff416c; color: white; border: none; padding: 16px; border-radius: 30px; width: 100%; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-top: 25px; }

        /* NOTIF & CONFIRMATION */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding-bottom: 20px; overflow: hidden; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; margin: 0 5%; font-weight: bold; cursor: pointer; }
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; width: 90%; margin: 10px 5%; font-weight: bold; cursor: pointer; }

        /* MESSAGERIE */
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; white-space: pre-wrap; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { position: fixed; bottom: 0; width: 100%; max-width: 450px; padding: 10px 15px 45px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; align-items: flex-end; }

        /* POPUP SÉCURITÉ */
        #security-popup { display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; }
        .pedagogic-box { background: #f0f7ff; border-radius: 15px; padding: 15px; text-align: left; margin: 20px 0; border: 1px solid #d0e3ff; }
    </style>
</head>
<body>

    <audio id="lastMinuteSound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg">
    </audio>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card">
            <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
            <div style="padding: 30px 20px; text-align: center; color: #333;">
                <p style="font-size: 1.15rem; font-weight: 500; margin-bottom: 10px;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                <p style="font-size: 0.95rem; color: #666; margin-bottom: 25px;">Ouvrez Genlove pour découvrir qui c'est 💖</p>
            </div>
            <button class="btn-blue" onclick="show(2)">📖 Ouvrir l'application Genlove</button>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="notif-card">
            <div style="background: #0000ff; color: white; padding: 18px; font-weight: bold;">Genlove - confirmation</div>
            <div style="padding: 30px 25px; background: white;">
                <p style="font-size: 1.1rem; margin-bottom: 25px;">Accepter Sarah ? ❤️</p>
                <button class="btn-green" onclick="showSecurityPopup()">Accepter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup">
            <div class="popup-card">
                <h3>🔒 Espace de discussion privé</h3>
                <p><b>Par mesure de confidentialité, Genlove a sécurisé cet échange pour vous permettre de faire connaissance en toute sérénité.</b></p>
                <div class="pedagogic-box">
                    <div style="margin-bottom:10px;">🛡️ <b>Éphémère :</b> Tout s'efface dans 30 min.</div>
                    <div>🕵️ <b>Privé :</b> Aucun historique n'est conservé.</div>
                </div>
                <button style="background:#4a76b8; color:white; border:none; padding:16px; border-radius:30px; font-weight:bold; cursor:pointer; width:100%;" onclick="closePopup()">Démarrer l'échange</button>
            </div>
        </div>

        <div class="chat-header">
            <button class="btn-quit" onclick="showFinal('chat')">✕</button>
            
            <button id="alertToggle" onclick="toggleAlerts()" style="background:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:1.1rem;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.15);">🔔</button>

            <div class="digital-clock">
                <span class="heart-icon">❤️</span><span id="timer-display">02:00</span>
            </div>
            <button class="btn-logout-badge" onclick="showFinal('app')">Logout 🔒</button>
        </div>

        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
        </div>

        <div class="input-area" id="chatInput">
            <textarea id="msg" style="flex:1; background:#f1f3f4; border:1px solid #ddd; padding:12px; border-radius:25px; outline:none; resize:none; font-family:sans-serif; max-height:150px; overflow-y:auto;" placeholder="Écrivez votre message..." rows="1" oninput="autoGrow(this)"></textarea>
            <button style="background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%;" onclick="send()">➤</button>
        </div>
    </div>

    <div id="screen-final" class="screen final-bg">
        <div id="final-card-content" class="final-card"></div>
    </div>

    <script>
        let timeLeft = 2 * 60; // ⏱️ RÉDUIT À 2 MINUTES POUR LE TEST
        let timerInterval;
        let alertsEnabled = true;
        let lastMinutePlayed = false;
        let lastTenSecondsPlayed = false;

        function show(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id === 'final' ? 'screen-final' : 'screen' + id).classList.add('active');
        }

        function showSecurityPopup() { show(3); document.getElementById('security-popup').style.display = 'flex'; }
        function closePopup() { document.getElementById('security-popup').style.display = 'none'; startTimer(); }

        function toggleAlerts() {
            alertsEnabled = !alertsEnabled;
            document.getElementById('alertToggle').innerText = alertsEnabled ? '🔔' : '🔕';
        }

        function startTimer() {
            if (timerInterval) return;
            const alertSound = document.getElementById('lastMinuteSound');

            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;

                // Alerte 1 minute (Sera déclenchée à 01:00)
                if (timeLeft === 60 && !lastMinutePlayed && alertsEnabled) {
                    lastMinutePlayed = true;
                    alertSound.play().catch(() => {});
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                }

                // Alerte 10 secondes (Sera déclenchée à 00:10)
                if (timeLeft === 10 && !lastTenSecondsPlayed && alertsEnabled) {
                    lastTenSecondsPlayed = true;
                    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
                }

                if (timeLeft <= 0) { clearInterval(timerInterval); showFinal('chat', true); }
            }, 1000);
        }

        function autoGrow(element) {
            element.style.height = "auto";
            element.style.height = (element.scrollHeight) + "px";
        }

        function showFinal(type, auto = false) {
            if(!auto) {
                const msg = type === 'chat' ? "Voulez-vous vraiment quitter cette conversation ?" : "Voulez-vous vraiment vous déconnecter ?";
                if(!confirm(msg)) return;
            }
            
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            if(type === 'chat') {
                card.innerHTML = \`
                    <div style="font-size: 3rem; margin-bottom: 10px;">✨</div>
                    <h2 style="color:#1a2a44;">Merci pour cet échange</h2>
                    <p>Genlove vous remercie pour ce moment de partage et de franchise.</p>
                    <button class="btn-restart" onclick="location.reload()">🔎 Trouver un autre profil</button>
                    <p style="margin-top: 20px;">
                        <a href="#" onclick="location.reload()" style="color: #4a76b8; text-decoration: none; font-weight: bold; font-size: 0.9rem;">🏠 Retourner sur mon profil</a>
                    </p>\`;
            } else {
                card.innerHTML = \`
                    <div style="font-size: 3rem; margin-bottom: 10px;">🛡️</div>
                    <h2 style="color:#1a2a44;">Merci pour votre confiance</h2>
                    <p>Votre session a été fermée en toute sécurité. À bientôt.</p>
                    <button class="btn-restart" style="background:#1a2a44; margin-bottom: 15px;" onclick="location.href='about:blank';">Quitter Genlove</button>
                    <button onclick="location.reload()" style="background: none; border: 1px solid #ccc; color: #666; padding: 12px; border-radius: 30px; width: 100%; font-weight: bold; cursor: pointer;">Retour à l'accueil</button>\`;
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
                input.style.height = "auto";
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(genloveApp));
app.listen(port);
