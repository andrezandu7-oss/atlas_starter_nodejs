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
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; }
        .active { display: flex; }

        /* ÉCRAN 1 : NOTIFICATION */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding-bottom: 20px; overflow: hidden; }
        .n-header { padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; font-weight: bold; }
        .n-body { padding: 30px 20px; text-align: center; color: #333; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; margin: 0 5%; font-weight: bold; cursor: pointer; }

        /* ÉCRAN 2 : CONFIRMATION */
        .conf-card { margin: auto; width: 85%; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; }
        .c-header { background: #0000ff; color: white; padding: 18px; font-weight: bold; }
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; flex: 1; font-weight: bold; cursor: pointer; }
        .btn-red { background: #dc3545; color: white; border: none; padding: 15px; border-radius: 10px; flex: 1; font-weight: bold; cursor: pointer; }

        /* ÉCRAN 3 : CHAT (MODIFICATION ICI) */
        .chat-header { background: #9dbce3; color: white; padding: 15px; text-align: center; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .bubble { padding: 12px; border-radius: 15px; max-width: 80%; font-size: 0.95rem; line-height: 1.4; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        
        .input-area { 
            padding: 10px 15px 40px 15px; /* REHAUSSÉ : 40px au lieu de 15px */
            border-top: 1px solid #eee; 
            display: flex; 
            gap: 10px; 
            align-items: center; 
            background: white;
            flex-shrink: 0; /* EMPÊCHE L'ÉCRASEMENT */
        }
        .input-box { 
            flex: 1; 
            background: #f1f3f4; 
            border: 1px solid #ddd; 
            padding: 12px; 
            border-radius: 25px; 
            outline: none; 
            font-size: 16px; /* ÉVITE LE ZOOM AUTO SUR IPHONE */
        }
        .btn-send { background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card">
            <div class="n-header">📩 Genlove Notification</div>
            <div class="n-body">
                <p style="font-size: 1.1rem;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                <p style="font-size: 0.9rem; color: #666;">Ouvrez Genlove pour découvrir qui c'est 💖</p>
            </div>
            <button class="btn-blue" onclick="show(2)">📖 Ouvrir l'application Genlove</button>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="conf-card">
            <div class="c-header">Genlove - confirmation</div>
            <div style="padding: 25px; background: white;">
                <p><b>Sarah</b> souhaite échanger avec vous ❤️</p>
                <p>Voulez-vous accepter le contact ?</p>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn-green" onclick="show(3)">Accepter</button>
                    <button class="btn-red" onclick="show(1)">Refuser</button>
                </div>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div class="chat-header">
            <b>📍 Chat sécurisé</b><br>
            <span style="font-size: 0.8rem;">Connecté via Genlove</span>
        </div>
        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            <div class="bubble sent">Bonjour ! C'est rassurant de savoir que nous sommes compatibles. 😍</div>
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
