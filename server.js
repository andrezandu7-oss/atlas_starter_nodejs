const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const chatPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f4f7f6; margin: 0; display: flex; justify-content: center; }
        .chat-container { width: 100%; max-width: 420px; height: 100vh; display: flex; flex-direction: column; background: white; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
        
        /* HEADER (Image 40242) */
        .chat-header { background: #9dbce3; color: white; padding: 20px 15px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .chat-header b { font-size: 1.2rem; display: block; }
        .chat-header span { font-size: 0.8rem; opacity: 0.9; font-weight: normal; }

        /* ZONE DES MESSAGES */
        .chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: #f8fafb; }
        .bubble { padding: 12px 16px; border-radius: 20px; max-width: 80%; font-size: 0.95rem; line-height: 1.4; position: relative; }
        
        .received { background: #e2ecf7; align-self: flex-start; border-bottom-left-radius: 4px; color: #1a2a44; }
        .sent { background: #ff416c; color: white; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 2px 5px rgba(255, 65, 108, 0.2); }

        /* BARRE D'ENVOI */
        .chat-input-area { padding: 15px; background: white; border-top: 1px solid #eee; }
        .input-wrapper { display: flex; gap: 10px; align-items: center; }
        .chat-input { flex: 1; border: 1px solid #ddd; padding: 12px 18px; border-radius: 25px; outline: none; background: #f1f3f4; font-size: 1rem; }
        .btn-send { background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; }

        .secure-tag { text-align: center; font-size: 0.7rem; color: #888; margin-top: 10px; }
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
                <input type="text" id="msgInput" class="chat-input" placeholder="Écrivez votre message..." onkeypress="handleKey(event)">
                <button class="btn-send" onclick="sendMessage()">OK</button>
            </div>
            <div class="secure-tag">🔒 Cryptage de bout en bout actif</div>
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
                
                // Petite simulation de réponse automatique
                setTimeout(() => {
                    const reply = document.createElement('div');
                    reply.className = 'bubble received';
                    reply.innerText = "Je suis d'accord ! On continue de discuter ? 😊";
                    chatBox.appendChild(reply);
                    chatBox.scrollTop = chatBox.scrollHeight;
                }, 1500);
            }
        }

        function handleKey(e) { if (e.key === 'Enter') sendMessage(); }
    </script>
</body>
</html>
`;

app.get('/chat', (req, res) => { res.send(chatPage); });
app.get('/', (req, res) => { res.send('<a href="/chat">Ouvrir le Chat</a>'); });

app.listen(port);
