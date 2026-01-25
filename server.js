const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove Simulation</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; }
        .active { display: flex; }

        /* POPUP DE SÉCURITÉ (Design Option 1) */
        #security-popup {
            display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; padding: 20px;
        }
        .popup-card { background: white; border-radius: 25px; padding: 30px 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .popup-card h2 { color: #1a2a44; font-size: 1.2rem; margin-top: 0; }
        .popup-card p { color: #555; font-size: 0.95rem; line-height: 1.5; }
        .btn-got-it { background: #4a76b8; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; margin-top: 20px; cursor: pointer; }

        /* STYLES PRÉCÉDENTS (NOTIF, CONF, CHAT) */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding-bottom: 20px; overflow: hidden; }
        .n-header { padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; font-weight: bold; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; margin: 0 5%; font-weight: bold; cursor: pointer; }
        .c-header { background: #0000ff; color: white; padding: 18px; font-weight: bold; }
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; flex: 1; font-weight: bold; }
        .chat-header { background: #9dbce3; color: white; padding: 15px; text-align: center; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .bubble { padding: 12px; border-radius: 15px; max-width: 80%; font-size: 0.95rem; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
        .input-box { flex: 1; background: #f1f3f4; border: 1px solid #ddd; padding: 12px; border-radius: 25px; outline: none; }
        .btn-send { background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card">
            <div class="n-header">📩 Genlove Notification</div>
            <div style="padding: 30px 20px; text-align: center;">
                <p style="font-size: 1.1rem;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
            </div>
            <button class="btn-blue" onclick="show(2)">📖 Ouvrir l'application Genlove</button>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="notif-card" style="width: 85%;">
            <div class="c-header">Genlove - confirmation</div>
            <div style="padding: 25px; background: white;">
                <p><b>Sarah</b> souhaite échanger avec vous ❤️</p>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-green" onclick="showSecurityPopup()">Accepter</button>
                    <button style="background:#dc3545; color:white; border:none; padding:15px; border-radius:10px; flex:1;" onclick="show(1)">Refuser</button>
                </div>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup">
            <div class="popup-card">
                <h2>🔒 Espace de discussion privé</h2>
                <p>Par mesure de confidentialité, vos échanges dans ce chat sont <b>éphémères</b>.</p>
                <p>Cette conversation s'effacera automatiquement dans <b>30 minutes</b>.</p>
                <p><small>Profitez de cet instant pour faire connaissance en toute sécurité.</small></p>
                <button class="btn-got-it" onclick="closePopup()">J'ai compris</button>
            </div>
        </div>

        <div class="chat-header">
            <b>📍 Chat sécurisé</b><br>
            <span style="font-size: 0.8rem;">Connecté via Genlove (Fermeture dans 30m)</span>
        </div>
        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
        </div>
        <div class="input-area">
            <input type="text" id="msg" class="input-box" placeholder="Écrivez votre message...">
            <button class="btn-send" onclick="send()">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
        </div>
    </div>

    <script>
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
            // Lancer le timer de 30 min ici si besoin
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
