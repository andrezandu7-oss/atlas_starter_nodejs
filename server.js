const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove Simulation - Finale</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; height: 100vh; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; }
        .active { display: flex; }

        /* HORLOGE ET COEUR */
        @keyframes heartbeat {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        .heart-icon { display: inline-block; color: #ff416c; animation: heartbeat 1s infinite; margin-right: 8px; font-size: 1.2rem; }
        .digital-clock {
            background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 12px;
            font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 1.2rem;
            border: 1px solid #333; box-shadow: 0 0 10px rgba(255, 65, 108, 0.2);
            display: inline-flex; align-items: center;
        }

        /* POPUP PÉDAGOGIQUE */
        #security-popup {
            display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px;
        }
        .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; box-shadow: 0 15px 40px rgba(0,0,0,0.4); width: 88%; }
        .pedagogic-box { 
            background: #f0f7ff; border-radius: 15px; padding: 15px; text-align: left; 
            margin: 20px 0; border: 1px solid #d0e3ff;
        }
        .pedagogic-item { display: flex; gap: 10px; margin-bottom: 10px; font-size: 0.95rem; color: #2c3e50; line-height: 1.3; }

        /* ÉCRANS NOTIF & CONFIRMATION */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding-bottom: 20px; overflow: hidden; }
        .n-header { padding: 15px; border-bottom: 1px solid #eee; font-weight: bold; }
        .c-header { background: #0000ff; color: white; padding: 18px; font-weight: bold; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; margin: 20px 5%; font-weight: bold; cursor: pointer; }
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; width: 90%; margin: 10px 5%; font-weight: bold; cursor: pointer; }

        /* CHAT */
        .chat-header { background: #9dbce3; color: white; padding: 12px; text-align: center; flex-shrink: 0; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; font-size: 1rem; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        
        .input-area { 
            position: fixed; bottom: 0; width: 100%; max-width: 450px;
            padding: 10px 15px 45px 15px; border-top: 1px solid #eee; 
            display: flex; gap: 10px; align-items: center; background: white;
            box-sizing: border-box; z-index: 500;
        }
        .input-box { flex: 1; background: #f1f3f4; border: 1px solid #ddd; padding: 12px; border-radius: 25px; outline: none; font-size: 16px; }
        .btn-send { background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card">
            <div class="n-header">📩 Genlove Notification</div>
            <div style="padding: 30px 20px; text-align: center;"><p style="font-size: 1.1rem;">Un partenaire compatible ! 💞</p></div>
            <button class="btn-blue" onclick="show(2)">Ouvrir</button>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="notif-card">
            <div class="c-header">Genlove - confirmation</div>
            <div style="padding: 30px 25px;">
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
                    <div class="pedagogic-item">🛡️ <b>Éphémère :</b> Tout s'efface dans 30 min.</div>
                    <div class="pedagogic-item">🕵️ <b>Privé :</b> Aucun historique n'est conservé.</div>
                    <div class="pedagogic-item">✨ <b>Liberté :</b> Échangez en toute franchise.</div>
                </div>

                <p style="font-weight: bold; color: #ff416c;">Le décompte commence maintenant.</p>
                <button style="background:#4a76b8; color:white; border:none; padding:16px; border-radius:30px; font-weight:bold; cursor:pointer; width:100%;" onclick="closePopup()">Démarrer l'échange</button>
            </div>
        </div>

        <div class="chat-header">
            <b>📍 Chat sécurisé</b><br>
            <div style="margin-top:10px;">
                <span class="digital-clock">
                    <span class="heart-icon">❤️</span>
                    <span id="timer-display">30:00</span>
                </span>
            </div>
        </div>

        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
        </div>

        <div class="input-area" id="chatInput">
            <input type="text" id="msg" class="input-box" placeholder="Écrivez votre message...">
            <button class="btn-send" onclick="send()">➤</button>
        </div>
    </div>

    <script>
        let timeLeft = 30 * 60; 
        let timerInterval;

        function show(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen' + id).classList.add('active');
        }

        function showSecurityPopup() {
            show(3);
            document.getElementById('security-popup').style.display = 'flex';
        }

        function closePopup() {
            document.getElementById('security-popup').style.display = 'none';
            startTimer();
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = mins + ":" + (secs < 10 ? "0" : "") + secs;
                if (timeLeft <= 0) { clearInterval(timerInterval); location.reload(); }
            }, 1000);
        }

        function updateInputPosition() {
            if (window.visualViewport && document.getElementById('screen3').classList.contains('active')) {
                const keyboardHeight = window.innerHeight - window.visualViewport.height;
                document.getElementById('chatInput').style.bottom = keyboardHeight + "px";
                document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
            }
        }
        window.visualViewport && window.visualViewport.addEventListener("resize", updateInputPosition);

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
