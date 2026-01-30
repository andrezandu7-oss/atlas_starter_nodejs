const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove Simulation</title>
    <style>
        html, body { height: 100%; margin: 0; font-family: sans-serif; background: #f0f2f5; overflow: hidden; }
        .screen { display: none; width: 100%; height: 100%; flex-direction: column; position: relative; background: white; }
        .active { display: flex; }

        /* POPUP SÉCURITÉ */
        #security-popup {
            display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); z-index: 2000; justify-content: center; align-items: center; padding: 20px;
        }
        .popup-card { background: white; border-radius: 25px; padding: 30px 20px; text-align: center; width: 85%; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .btn-got-it { background: #4a76b8; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; margin-top: 20px; cursor: pointer; }

        /* ÉCRANS NOTIF & CONFIRMATION (REMIS À JOUR SELON CAPTURES) */
        .centered-content { justify-content: center; align-items: center; background: #f0f2f5; }
        .card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
        .card-header { padding: 15px; background: #0000ff; color: white; font-weight: bold; font-size: 1.1rem; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; margin: 20px 5%; font-weight: bold; cursor: pointer; font-size: 1rem; }
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; width: 90%; margin: 0 5%; font-weight: bold; cursor: pointer; font-size: 1.1rem; }

        /* CHAT */
        .chat-header { background: #9bbce3; text-align: center; padding: 15px; flex-shrink: 0; color: white; z-index: 1001; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 15px; background: #f8fafb; padding-bottom: 80px; display: flex; flex-direction: column; }
        .message { max-width: 80%; padding: 10px 14px; margin-bottom: 10px; border-radius: 18px; line-height: 1.4; font-size: 0.95rem; position: relative; }
        .received { background: #e9eef5; align-self: flex-start; color: #333; }
        .sent { background: #ff4f7b; color: white; align-self: flex-end; margin-left: auto; }

        .chat-input { 
            position: fixed; 
            bottom: 0; left: 0; right: 0; 
            display: flex; gap: 8px; 
            padding: 10px 15px 30px 15px; 
            background: #fff; 
            border-top: 1px solid #ddd;
            z-index: 1000;
        }
        .chat-input input { flex: 1; padding: 12px; border-radius: 20px; border: 1px solid #ccc; outline: none; font-size: 16px; }
        .chat-input button { padding: 0 16px; border-radius: 50%; border: none; background: #3b82f6; color: white; cursor: pointer; font-size: 1.2rem; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active centered-content">
        <div class="card">
            <div style="padding:15px; font-weight:bold; border-bottom:1px solid #eee; display:flex; align-items:center; gap:8px;">
                📩 Genlove Notification
            </div>
            <div style="padding: 40px 20px; text-align: center;">
                <p style="font-size: 1.15rem; color: #333; margin: 0;">Un partenaire compatible ! 💞</p>
            </div>
            <button class="btn-blue" onclick="show(2)">Ouvrir</button>
        </div>
    </div>

    <div id="screen2" class="screen centered-content">
        <div class="card">
            <div class="card-header">Genlove - confirmation</div>
            <div style="padding: 35px 25px; background: white; text-align: left;">
                <p style="font-size: 1.1rem; margin-bottom: 30px;">Accepter Sarah ? ❤️</p>
                <button class="btn-green" onclick="showSecurityPopup()">Accepter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup">
            <div class="popup-card">
                <h3>🔒 Espace de discussion privé</h3>
                <p>Par mesure de confidentialité, vos échanges dans ce chat sont <b>éphémères</b>.</p>
                <p>Cette conversation s'effacera automatiquement dans <b>30 minutes</b>.</p>
                <button class="btn-got-it" onclick="closePopup()">J'ai compris</button>
            </div>
        </div>

        <div class="chat-header">
            <b>📍 Chat sécurisé</b><br>
            <span style="font-size: 0.8rem;">Connecté via Genlove (30m restants)</span>
        </div>

        <div class="chat-messages" id="box">
            <div class="message received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            <div class="message sent">Bonjour ! C'est rassurant de savoir que nous sommes compatibles. 😍</div>
        </div>

        <div class="chat-input" id="chatInput">
            <input type="text" id="msg" placeholder="Écrivez votre message…" />
            <button onclick="send()">➤</button>
        </div>
    </div>

    <script>
        const chatInput = document.getElementById("chatInput");

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
        }

        function updateInputPosition() {
            if (window.visualViewport) {
                const keyboardHeight = window.innerHeight - window.visualViewport.height;
                chatInput.style.bottom = keyboardHeight + "px";
                const box = document.getElementById('box');
                box.scrollTop = box.scrollHeight;
            }
        }

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", updateInputPosition);
        }

        function send() {
            const input = document.getElementById('msg');
            if(input.value.trim()) {
                const div = document.createElement('div');
                div.className = 'message sent';
                div.innerText = input.value;
                const box = document.getElementById('box');
                box.appendChild(div);
                input.value = '';
                box.scrollTop = box.scrollHeight;
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(genloveApp));
app.listen(port);
