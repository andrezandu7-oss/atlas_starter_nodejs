const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Utilisation de backticks (`) pour les chaînes multilignes pour éviter les erreurs de syntaxe
const testPage = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Simulation</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; padding: 15px; }
        .mobile-container { width: 100%; max-width: 400px; }
        .stage { display: none; width: 100%; animation: fadeIn 0.4s ease; }
        .active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* DESIGN NOTIFICATION (Image 39799) */
        .notif-push { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #ddd; overflow: hidden; }
        .n-header { padding: 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eee; }
        .n-body { padding: 25px 20px; text-align: center; color: #333; }
        .btn-blue-app { background: #7ca9e6; color: white; border: none; width: 90%; padding: 14px; border-radius: 10px; margin: 0 5% 20px; font-weight: bold; cursor: pointer; }

        /* DESIGN CONFIRMATION (Image 40039) */
        .confirm-box { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); overflow: hidden; }
        .c-head { background: #0000ff; color: white; padding: 15px; font-weight: bold; }
        .c-body { padding: 25px; text-align: left; }
        .btn-acc { background: #28a745; color: white; border: none; padding: 12px; border-radius: 8px; flex: 1; font-weight: bold; cursor: pointer; }
        .btn-ref { background: #dc3545; color: white; border: none; padding: 12px; border-radius: 8px; flex: 1; font-weight: bold; cursor: pointer; }
        .btn-group { display: flex; gap: 10px; padding: 15px; }

        /* DESIGN CHAT (Image 40038) */
        .chat-win { background: #f4f7f6; height: 80vh; display: flex; flex-direction: column; border-radius: 20px; border: 1px solid #ccc; overflow: hidden; }
        .chat-h { background: #9dbce3; color: white; padding: 15px; text-align: center; font-weight: bold; }
        .chat-m { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
        .b-rec { background: #e2ecf7; padding: 10px 15px; border-radius: 15px; align-self: flex-start; max-width: 80%; }
        .b-sent { background: white; padding: 10px 15px; border-radius: 15px; align-self: flex-end; max-width: 80%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="mobile-container">
        <div id="step1" class="stage active">
            <div class="notif-push">
                <div class="n-header">📩 <b>Genlove Notification</b></div>
                <div class="n-body">
                    <p>Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                    <button class="btn-blue-app" onclick="showStep(2)">📖 Ouvrir Genlove</button>
                </div>
            </div>
        </div>

        <div id="step2" class="stage">
            <div class="confirm-box">
                <div class="c-head">Genlove - confirmation</div>
                <div class="c-body"><b>Sarah</b> souhaite échanger avec vous ❤️</div>
                <div class="btn-group">
                    <button class="btn-acc" onclick="showStep(3)">Accepter</button>
                    <button class="btn-ref" onclick="showStep(1)">Refuser</button>
                </div>
            </div>
        </div>

        <div id="step3" class="stage">
            <div class="chat-win">
                <div class="chat-h">📍 Chat sécurisé<br><small>Genlove</small></div>
                <div class="chat-m">
                    <div class="b-rec">Salut ! Ravi de te rencontrer 👋</div>
                    <div class="b-sent">Bonjour ! Moi aussi 😍</div>
                </div>
            </div>
            <p style="text-align:center;"><button onclick="showStep(1)" style="background:none; border:none; color:blue; text-decoration:underline; cursor:pointer;">Réinitialiser</button></p>
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
    res.send('<h1>Serveur Genlove Actif</h1><p>Allez sur <a href="/maquettes">/maquettes</a> pour tester.</p>');
});

app.listen(port, () => {
    console.log("Serveur démarré sur le port " + port);
});
