const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const fullPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Chat Sécurisé</title>
    <style>
        body { font-family: 'Segoe UI', Helvetica, sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; }
        .chat-container { width: 100%; max-width: 450px; height: 100vh; display: flex; flex-direction: column; background: white; }
        
        /* HEADER (Style Image 40442) */
        .chat-header { background: #9dbce3; color: white; padding: 15px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .chat-header b { font-size: 1.1rem; display: block; }
        .chat-header span { font-size: 0.8rem; opacity: 0.9; }

        /* MESSAGES */
        .chat-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8fafb; }
        .bubble { padding: 12px 16px; border-radius: 20px; max-width: 80%; font-size: 0.95rem; line-height: 1.4; }
        .received { background: #e2ecf7; align-self: flex-start; border-bottom-left-radius: 4px; color: #1a2a44; }
        .sent { background: #ff416c; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }

        /* BARRE D'ENVOI AVEC AVION (Le signe approprié) */
        .chat-input-area { padding: 12px; background: white; border-top: 1px solid #eee; }
        .input-wrapper { display: flex; gap: 8px; align-items: center; }
        .chat-input { flex: 1; border: 1px solid #ddd; padding: 12px 15px; border-radius: 25px; outline: none; background: #f1f3f4; font-size: 1rem; }
        
        .btn-send { 
            background: #4a76b8; 
            color: white; 
            border: none; 
            width: 45px; 
            height: 45px; 
            border-radius: 50%; 
            cursor: pointer; 
            display: flex; 
            align-items: center; 
            justify-content: center;
        }
        .btn-send svg { width: 20px; height: 20px; fill: white; transform: rotate(0deg); }

        .secure-tag { text-align: center; font-size: 0.7rem; color: #999; margin-top: 8px; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <b>📍 Chat sécurisé</b>
            <span>🔗 Connecté via Genlove</span>
        </div>

        <div class="chat-messages" id="chatBox">
            <div class="bubble received">Bonjour ! Je suis ravi(e) de faire ta connaissance. Ton profil correspond exactement à ce que je recherche. 👋</div>
            <div class="bubble sent">Bonjour ! Ravi(e) également. C'est rassurant de savoir que nous sommes compatibles. 😍</div>
        </div>

        <div class="chat-input-area">
            <div class="input-wrapper">
                <input type="text" id="msgInput" class="chat-input" placeholder="Écrivez votre message..." onkeypress="if(event.key==='Enter')sendMessage()">
                <button class="btn-send" onclick="sendMessage()">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                </button>
            </div>
            <div class="secure-tag">🔒 Messages chiffrés et sécurisés</div>
        </div>
    </div>

    <script>
        function sendMessage() {
            const input = document.getElementById('msgInput');
            const chatBox = document.getElementById('chatBox');
            if (input.value.trim() !== "") {
                const msg = document.createElement('div');
                msg.className = 'bubble sent';
                msg.innerText = input.value;
                chatBox.appendChild(msg);
                input.value = "";
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(fullPage);
});

app.listen(port, () => {
    console.log("Serveur Genlove prêt sur le port " + port);
});
