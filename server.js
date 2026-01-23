const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove App</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; animation: fadeIn 0.3s; }
        .active { display: flex; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* DESIGN NOTIFICATION (Image 39799) */
        .notif-container { padding: 20px; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); }
        .notif-card { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 90%; overflow: hidden; }
        .n-header { padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; display: flex; align-items: center; gap: 8px; }
        .n-body { padding: 25px; text-align: center; }
        .btn-open { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 10px; margin: 0 5% 20px; font-weight: bold; cursor: pointer; }

        /* DESIGN CONFIRMATION (Image 40039) */
        .confirm-card { margin: auto; width: 85%; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; }
        .c-header { background: #0000ff; color: white; padding: 15px; font-weight: bold; }
        .btn-acc { background: #28a745; color: white; border: none; padding: 12px; border-radius: 8px; flex: 1; font-weight: bold; }
        .btn-ref { background: #dc3545; color: white; border: none; padding: 12px; border-radius: 8px; flex: 1; font-weight: bold; }

        /* DESIGN CHAT (Image 40987) */
        .chat-header { background: #9dbce3; color: white; padding: 15px; text-align: center; }
        .chat-msg-area { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .bubble { padding: 12px; border-radius: 15px; max-width: 80%; font-size: 0.9rem; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-bar { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
        .input-field { flex: 1; background: #f1f3f4; border: 1px solid #ddd; padding: 12px; border-radius: 25px; }
        .btn-send { background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-container">
        <div class="notif-card">
            <div class="n-header">📩 Genlove Notification</div>
            <div class="n-body">
                <p>Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                <p style="font-size: 0.8rem; color: #666;">Ouvrez Genlove pour découvrir qui c'est 💖</p>
            </div>
            <button class="btn-open" onclick="go(2)">📖 Ouvrir l'application Genlove</button>
        </div>
    </div>

    <div id="screen2" class="screen">
        <div class="confirm-card">
            <div class="c-header">Genlove - confirmation</div>
            <div style="padding: 20px;">
                <b>Sarah</b> souhaite échanger avec vous ❤️<br><br>
                Voulez-vous accepter le contact ?
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-acc" onclick="go(3)">Accepter</button>
                    <button class="btn-ref" onclick="go(1)">Refuser</button>
                </div>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div class="chat-header">
            <b>📍 Chat sécurisé</b><br><small>Connecté via Genlove</small>
        </div>
        <div class="chat-msg-area" id="box">
            <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            <div class="bubble sent">Bonjour ! C'est rassurant de savoir que nous sommes compatibles. 😍</div>
        </div>
        <div class="input-bar">
            <input type="text" id="in" class="input-field" placeholder="Écrivez votre message...">
            <button class="btn-send" onclick="send()">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
        </div>
    </div>

    <script>
        function go(n) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen' + n).classList.add('active');
        }
        function send() {
            const i = document.getElementById('in');
            if(i.value) {
                const d = document.createElement('div');
                d.className = 'bubble sent';
                d.innerText = i.value;
                document.getElementById('box').appendChild(d);
                i.value = '';
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(genloveApp));
app.listen(port);
