const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove Simulation - Officiel</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; height: 100vh; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; }
        .active { display: flex; }

        /* DESIGN DE LA CARTE DE CONFIRMATION (Image 1) */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { 
            background: white; 
            width: 85%; 
            border-radius: 25px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            overflow: hidden; 
            text-align: center;
        }
        .notif-header-blue { 
            background: #0000ff; 
            color: white; 
            padding: 20px; 
            font-weight: bold; 
            font-size: 1.1rem;
            text-align: left;
        }
        .notif-body { padding: 40px 20px; }
        .btn-confirm-green { 
            background: #28a745; 
            color: white; 
            border: none; 
            padding: 18px; 
            border-radius: 15px; 
            width: 90%; 
            font-weight: bold; 
            font-size: 1rem;
            cursor: pointer; 
            margin-top: 10px;
        }

        /* HEADER CHAT */
        .chat-header { 
            background: #9dbce3; color: white; padding: 12px 15px; 
            display: flex; justify-content: space-between; align-items: center; 
            flex-shrink: 0;
        }
        .btn-quit {
            background: #ffffff; color: #9dbce3; border: none;
            width: 32px; height: 32px; border-radius: 8px;
            font-size: 1.2rem; font-weight: bold; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .digital-clock {
            background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px;
            font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem;
            display: inline-flex; align-items: center; border: 1px solid #333;
        }

        /* ÉCRAN FINAL (Image 2) */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 35px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }
        .btn-final-dark { background: #1a2a44; color: white; border: none; padding: 18px; border-radius: 30px; width: 100%; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-bottom: 15px; }
        .btn-final-outline { background: none; border: 1px solid #ddd; color: #666; padding: 12px; border-radius: 30px; width: 100%; font-weight: bold; cursor: pointer; }

        /* MESSAGERIE */
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { position: fixed; bottom: 0; width: 100%; max-width: 450px; padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card" style="text-align: left;">
            <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
            <div style="padding: 30px 20px;">
                <p style="font-size: 1.1rem; font-weight: 500;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                <button class="btn-confirm-green" style="background:#7ca9e6; width:100%;" onclick="show(2)">Ouvrir l'application</button>
            </div>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="notif-card">
            <div class="notif-header-blue">Genlove - confirmation</div>
            <div class="notif-body">
                <p style="font-size: 1.2rem; margin-bottom: 30px;">Accepter Sarah ? ❤️</p>
                <button class="btn-confirm-green" onclick="show(3)">Accepter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div class="chat-header">
            <button class="btn-quit" onclick="showFinal()">✕</button>
            <div class="digital-clock">❤️ <span id="timer-display">02:00</span></div>
            <div style="width:32px;"></div>
        </div>
        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
        </div>
        <div class="input-area">
            <input type="text" id="msg" style="flex:1; padding:12px; border-radius:25px; border:1px solid #ddd;" placeholder="Votre message...">
            <button style="background:#4a76b8; color:white; border:none; border-radius:50%; width:45px;" onclick="send()">➤</button>
        </div>
    </div>

    <div id="screen-final" class="screen final-bg">
        <div class="final-card">
            <div style="font-size: 3rem; margin-bottom: 20px;">🛡️</div>
            <h2 style="margin-bottom: 15px;">Merci pour votre confiance</h2>
            <p style="color: #666; line-height: 1.5; margin-bottom: 30px;">Votre session a été fermée en toute sécurité. À bientôt.</p>
            <button class="btn-final-dark" onclick="location.href='about:blank'">Quitter Genlove</button>
            <button class="btn-final-outline" onclick="location.reload()">Retour à l'accueil</button>
        </div>
    </div>

    <script>
        let timeLeft = 120;
        let timerInterval;

        function show(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen' + id).classList.add('active');
            if(id === 3) startTimer();
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
                if (timeLeft <= 0) { clearInterval(timerInterval); showFinal(); }
            }, 1000);
        }

        function showFinal() {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-final').classList.add('active');
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
