const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const testPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Simulation Maquettes</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; padding: 15px; }
        .mobile-container { width: 100%; max-width: 400px; display: flex; flex-direction: column; align-items: center; }
        
        .stage { display: none; width: 100%; animation: fadeIn 0.4s ease; }
        .active { display: block; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* MAQUETTE 1 : NOTIFICATION PUSH */
        .notif-push { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #ddd; overflow: hidden; }
        .n-header { padding: 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eee; }
        .n-body { padding: 25px 20px; text-align: center; color: #333; }
        .btn-blue-app { background: #7ca9e6; color: white; border: none; width: 90%; padding: 14px; border-radius: 10px; margin: 0 5% 20px; font-weight: bold; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }

        /* MAQUETTE 2 : CONFIRMATION */
        .confirm-box { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); overflow: hidden; margin-top: 50px; }
        .c-head { background: #0000ff; color: white; padding: 15px; font-weight: bold; font-size: 1.1rem; }
        .c-body { padding: 25px; text-align: left; font-size: 1.05rem; line-height: 1.4; color: #222; }
        .btn-group { display: flex; gap: 12px; padding: 0 20px 20px; }
        .btn-acc { background: #28a745; color: white; flex: 1; padding: 14px; border-radius: 10px; border: none; font-weight: bold; cursor: pointer; }
        .btn-ref { background: #dc3545; color: white; flex: 1; padding: 14px; border-radius: 10px; border: none; font-weight: bold; cursor: pointer; }
        .c-footer { font-size: 0.8rem; color: #888; text-align: center; padding-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 5px; }

        /* MAQUETTE 3 : CHAT SÉCURISÉ */
        .chat-win { background: #f4f7f6; height: 85vh; display: flex; flex-direction: column; border-radius: 25px; border: 1px solid #ccc; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .chat-h { background: #9dbce3; color: white; padding: 20px 15px; text-align: center; font-weight: bold; position: relative; }
        .chat-m { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
        .b-rec { background: #e2ecf7; padding: 12px 16px; border-radius: 18px; align-self: flex-start; max-width: 80%; border-bottom-left-radius: 4px; color: #1a2a44; }
        .b-sent { background: white; padding: 12px 16px; border-radius: 18px; align-self: flex-end; max-width: 80%; border-bottom-right-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .chat-i-area { background: white; padding: 15px; border-top: 1px solid #eee; }
        .chat-i-flex { display: flex; gap: 10px; }
        .chat-input { flex: 1; border: 1px solid #ddd; padding: 12px; border-radius: 8px; background: #f8f9fa; outline: none; }
        .btn-send { background: #4a76b8; color: white; border: none; padding: 0 20px; border-radius: 8px; font-weight: bold; }
        .chat-footer-sec { font-size: 0.75rem; color: #666; text-align: center; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="mobile-container">
        <div id="step1" class="stage active">
            <div class="notif-push">
                <div class="n-header">
                    <span style="font-size:1.2rem; color:#4a90e2;">📩</span>
                    <b style="font-size:1.1rem;">Genlove Notification</b>
                </div>
                <div class="n-body">
                    <p style="font-size:1.1rem; margin-bottom:20px;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                    <p style="font-size:1rem; margin-bottom:25px;">Ouvrez Genlove pour découvrir qui c'est 💖</p>
                </div>
                <button class="btn-blue-app" onclick="showStep(2)">
                    📖 Ouvrir l'application Genlove
                </button>
            </div>
        </div>

        <div id="step2" class="stage">
            <div class="confirm-box">
                <div class="c-head">Genlove - confirmation</div>
                <div class="c-body">
                    <b>Sarah</b> souhaite échanger avec vous ❤️<br><br>
                    Voulez-vous accepter le contact ?
                </div>
                <div class="btn-group">
                    <button class="btn-acc" onclick="showStep(3)">✓ Accepter</button>
                    <button class="btn-ref" onclick="showStep(1)">✕ Refuser</button>
                </div>
                <div class="c-footer">
                    <span>🔒</span> L'identité complète ne sera visible qu'après acceptation
                </div>
            </div>
        </div>

        <div id="step3" class="stage">
            <div class="chat-win">
                <div class="chat-h">
                    <span style="font-size:1.2rem;">📍 Chat sécurisé</span><br>
                    <span style="font-size:0.8rem; font-weight:normal;">✨ Genlove</span>
                </div>
                <div class="chat-m">
                    <div class="b-rec">Salut ! Ravi(e) de te rencontrer</div>
                    <div class="b-sent">Bonjour ! Moi aussi 😍</div>
                </div>
                <div class="chat-i-area">
                    <div class="chat-i-flex">
                        <input type="text" class="chat-input" placeholder="Tapez votre message...">
                        <button class="btn-send">Envoyer</button>
                    </div>
                    <div class="chat-footer-sec">
                        🔒 Messages chiffrés et sécurisés | Pas de partage de données sensibles
                    </div>
                </div>
            </div>
            <button onclick="showStep(1)" style="margin-top:20px; background:none; border:none; color:#666; text-decoration:underline;">Recommencer la simulation</button>
        </div>
    </div>

    <script>
        function showStep(n) {
            document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
            document.getElementById('step' + n).classList.add('active');
        }
    </script>
</body>
</html>
`;

app.get('/maquettes', (req, res) => {
    res.send(testPage);
});

app.get('/', (req, res) => {
    res.send(\`
        <div style="font-family:sans-serif; padding:20px; text-align:center;">
            <h2>Serveur Genlove Actif</h2>
            <p>Ajoutez <b>/maquettes</b> à la fin de l'adresse pour tester vos designs sur téléphone.</p>
            <a href="/maquettes" style="display:inline-block; padding:10px 20px; background:#4a90e2; color:white; text-decoration:none; border-radius:5px;">Lancer le test</a>
        </div>
    \`);
});

app.listen(port, () => {
    console.log("Serveur Genlove en ligne sur le port " + port);
});
