const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// --- LE CODE DE TES MAQUETTES (DESIGN PUR) ---
const testPage = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: sans-serif; background: #eef2f5; display: flex; flex-direction: column; align-items: center; padding: 10px; margin: 0; }
        .stage { display: none; flex-direction: column; align-items: center; gap: 15px; width: 100%; max-width: 350px; margin-top: 20px; }
        .active { display: flex; }
        .label { background: #1a2a44; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; margin-bottom: 10px; }

        /* MAQUETTE 1 : NOTIF */
        .notif-push { width: 100%; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #eee; overflow: hidden; }
        .n-head { padding: 10px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f0f0f0; }
        .n-body { padding: 20px; text-align: center; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-weight: bold; }

        /* MAQUETTE 2 : CONFIRMATION */
        .confirm-box { width: 100%; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); overflow: hidden; }
        .c-head { background: #0000ff; color: white; padding: 15px; font-weight: bold; }
        .c-body { padding: 20px; text-align: left; }
        .btn-group { display: flex; gap: 10px; padding: 15px; }
        .btn-acc { background: #28a745; color: white; flex: 1; padding: 12px; border-radius: 8px; border: none; font-weight: bold; }
        .btn-ref { background: #dc3545; color: white; flex: 1; padding: 12px; border-radius: 8px; border: none; font-weight: bold; }

        /* MAQUETTE 3 : CHAT */
        .chat-win { width: 100%; height: 450px; background: #f4f7f6; display: flex; flex-direction: column; border-radius: 15px; border: 1px solid #ccc; overflow: hidden; }
        .chat-h { background: #9dbce3; color: white; padding: 15px; text-align: center; font-weight: bold; }
        .chat-m { flex: 1; padding: 15px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
        .b-rec { background: #e2ecf7; padding: 10px; border-radius: 12px; align-self: flex-start; max-width: 80%; font-size: 0.9rem; }
        .b-sent { background: white; padding: 10px; border-radius: 12px; align-self: flex-end; max-width: 80%; font-size: 0.9rem; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .chat-i { background: white; padding: 10px; display: flex; gap: 5px; border-top: 1px solid #eee; }
        input { flex: 1; border: 1px solid #ddd; padding: 8px; border-radius: 5px; background: #f9f9f9; }
    </style>
</head>
<body>
    <h2 style="color:#1a2a44; font-size: 1.2rem;">Test des Maquettes Genlove</h2>

    <div id="s1" class="stage active">
        <div class="label">Maquette 1 : Notification</div>
        <div class="notif-push">
            <div class="n-head">📩 <b>Genlove Notification</b></div>
            <div class="n-body">
                <p>Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                <button class="btn-blue" onclick="show(2)">📖 Ouvrir Genlove</button>
            </div>
        </div>
    </div>

    <div id="s2" class="stage">
        <div class="label">Maquette 2 : Confirmation</div>
        <div class="confirm-box">
            <div class="c-head">Genlove - confirmation</div>
            <div class="c-body"><b>Sarah</b> souhaite échanger avec vous ❤️<br><br>Accepter le contact ?</div>
            <div class="btn-group">
                <button class="btn-acc" onclick="show(3)">✓ Accepter</button>
                <button class="btn-ref" onclick="show(1)">✕ Refuser</button>
            </div>
        </div>
    </div>

    <div id="s3" class="stage">
        <div class="label">Maquette 3 : Chat Sécurisé</div>
        <div class="chat-win">
            <div class="chat-h">📍 Chat sécurisé<br><small>🔗 Genlove</small></div>
            <div class="chat-m">
                <div class="b-rec">Salut ! Ravi(e) de te rencontrer 👋</div>
                <div class="b-sent">Bonjour ! Moi aussi 😍</div>
            </div>
            <div class="chat-i">
                <input type="text" placeholder="Message...">
                <button style="border:none; background:#4a76b8; color:white; padding:5px 10px; border-radius:5px;">OK</button>
            </div>
        </div>
        <button onclick="show(1)" style="margin-top:20px; background:none; border:none; color:#666; text-decoration:underline;">Recommencer le test</button>
    </div>

    <script>
        function show(n) {
            document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
            document.getElementById('s'+n).classList.add('active');
        }
    </script>
</body>
</html>
`;

// --- ROUTE DU SERVEUR ---
app.get('/maquettes', (req, res) => {
    res.send(testPage);
});

app.get('/', (req, res) => {
    res.send("<h1>Serveur Genlove Actif</h1><p>Ajoutez <b>/maquettes</b> à la fin de l'adresse pour tester vos designs sur téléphone.</p>");
});

app.listen(port, () => {
    console.log("Testeur de maquettes lancé sur le port " + port);
});
