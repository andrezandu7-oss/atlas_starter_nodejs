const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Fusion Version</title>
    <style>
        /* --- CSS FUSIONNÉ (Partie 1 & 2) --- */
        body { margin: 0; font-family: sans-serif; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .screen { display: none; flex-direction: column; height: 100%; width: 100%; max-width: 450px; background: white; position: relative; }
        .active { display: flex; }
        
        /* Styles de la Partie 1 (Profil/Santé) */
        .page-padding { padding: 25px; text-align: center; }
        .photo-circle { width: 100px; height: 100px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; }
        .input-box { width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 12px; margin-top: 10px; box-sizing: border-box; }
        
        /* Styles de la Partie 2 (Chat/Rhythme) */
        .chat-header { background: #9dbce3; color: white; padding: 12px; display: flex; justify-content: space-between; align-items: center; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .bubble { padding: 12px; border-radius: 18px; max-width: 80%; font-size: 0.9rem; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .input-area { padding: 10px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
        .input-area textarea { flex: 1; border-radius: 20px; padding: 10px; border: 1px solid #ddd; resize: none; }
    </style>
</head>
<body>

    <div id="scr-signup" class="screen active page-padding">
        <h1>Genlove</h1>
        <div class="photo-circle" id="pc" onclick="document.getElementById('fi').click()">📸</div>
        <input type="file" id="fi" style="display:none" onchange="handlePhoto(this)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom">
        <select id="gt" class="input-box">
            <option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option>
        </select>
        <button class="input-box" style="background:#ff416c; color:white; border:none; font-weight:bold;" onclick="toMatching()">Suivant</button>
    </div>

    <div id="scr-matching" class="screen page-padding">
        <h3>Compatibilités</h3>
        <div id="match-list"></div>
        <button class="input-box" onclick="showScreen('scr-signup')">Retour</button>
    </div>

    <div id="scr-chat" class="screen">
        <div class="chat-header">
            <button onclick="showScreen('scr-matching')">✕</button>
            <div class="digital-clock">❤️ <span id="timer">30:00</span></div>
            <b id="chat-with">Sarah</b>
        </div>
        <div id="box" class="chat-messages">
            <div class="bubble received">Bonjour ! Prêt(e) pour un échange sain ?</div>
        </div>
        <div class="input-area">
            <textarea id="msg" placeholder="Message..." rows="1"></textarea>
            <button onclick="sendMsg()">➤</button>
        </div>
    </div>

    <audio id="sound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

<script>
    // --- LOGIQUE DE NAVIGATION ---
    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    // --- LOGIQUE PARTIE 1 (SANTÉ) ---
    function handlePhoto(input) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('pc').style.backgroundImage = 'url(' + e.target.result + ')';
            document.getElementById('pc').innerText = '';
        };
        reader.readAsDataURL(input.files[0]);
    }

    function toMatching() {
        const gt = document.getElementById('gt').value;
        const list = document.getElementById('match-list');
        list.innerHTML = '';
        
        // Données brutes
        const users = [{n:"Sarah", g:"AA"}, {n:"Marc", g:"AS"}, {n:"Léa", g:"SS"}];
        
        // Règle SS : Bloquer partenaire SS si utilisateur est SS
        let filtered = (gt === "SS" || gt === "AS") ? users.filter(u => u.g === "AA") : users;
        
        filtered.forEach(u => {
            list.innerHTML += \`<div style="padding:15px; background:#f9f9f9; margin-bottom:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                <span><b>\${u.n}</b> (\${u.g})</span>
                <button onclick="startConversation('\${u.n}')" style="background:#1a2a44; color:white; border:none; padding:8px; border-radius:5px;">Chat</button>
            </div>\`;
        });
        showScreen('scr-matching');
    }

    // --- LOGIQUE PARTIE 2 (CHAT & RHYTHME) ---
    function startConversation(name) {
        document.getElementById('chat-with').innerText = name;
        showScreen('scr-chat');
        startTimer();
    }

    function sendMsg() {
        const i = document.getElementById('msg');
        if(!i.value.trim()) return;
        const d = document.createElement('div');
        d.className = 'bubble sent';
        d.innerText = i.value;
        document.getElementById('box').appendChild(d);
        i.value = '';
        document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
    }

    let timeLeft = 1800;
    function startTimer() {
        setInterval(() => {
            timeLeft--;
            let m = Math.floor(timeLeft/60), s = timeLeft%60;
            const t = document.getElementById('timer');
            if(t) t.innerText = (m<10?"0":"")+m+":"+(s<10?"0":"")+s;
            // Ici tu peux remettre tes fonctions triggerRhythm() de la partie 2
        }, 1000);
    }
</script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port, () => console.log('Serveur Unique Genlove Actif'));
