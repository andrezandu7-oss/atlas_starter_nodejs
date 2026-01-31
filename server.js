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

        /* NOTIF & CONFIRMATION */
        .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; }
        .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding-bottom: 25px; overflow: hidden; text-align: center; }
        .btn-blue { background: #7ca9e6; color: white; border: none; width: 90%; padding: 15px; border-radius: 12px; margin: 0 5%; font-weight: bold; cursor: pointer; }
        
        /* BOUTONS ACTIONS */
        .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; width: 90%; margin: 10px auto; font-weight: bold; cursor: pointer; display: block; }
        .btn-red-outline { background: white; color: #dc3545; border: 1px solid #dc3545; padding: 12px; border-radius: 10px; width: 90%; margin: 5px auto; font-weight: bold; cursor: pointer; display: block; }

        /* CHAT & AUTRES */
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { padding: 10px 15px 40px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
        
        /* FINAL */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; }
        .btn-restart { background: #ff416c; color: white; border: none; padding: 16px; border-radius: 30px; width: 100%; font-weight: bold; cursor: pointer; margin-top: 20px; }
    </style>
</head>
<body>

    <div id="screen1" class="screen active notif-bg">
        <div class="notif-card">
            <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
            <p style="padding: 20px;">Quelqu'un souhaite échanger 💞</p>
            <button class="btn-blue" onclick="show(2)">📖 Ouvrir Genlove</button>
        </div>
    </div>

    <div id="screen2" class="screen notif-bg">
        <div class="notif-card">
            <div style="background: #0000ff; color: white; padding: 18px; font-weight: bold;">Genlove - confirmation</div>
            <div style="padding: 30px 25px;">
                <p style="font-size: 1.1rem; margin-bottom: 20px;">Accepter Sarah ? ❤️</p>
                <button class="btn-green" onclick="show(3)">Accepter</button>
                <button class="btn-red-outline" onclick="showFinal('chat', true)">✕ Rejeter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div class="chat-header">
            <button onclick="showFinal('chat')" style="background:white; border:none; border-radius:5px; padding:5px 10px;">✕</button>
            <div class="digital-clock">02:00</div>
            <div style="width:30px;"></div>
        </div>
        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil me plaît beaucoup. 👋</div>
        </div>
        <div class="input-area">
            <input type="text" id="msg" style="flex:1; padding:10px; border-radius:20px; border:1px solid #ddd;" placeholder="Message...">
            <button onclick="send()" style="background:#4a76b8; color:white; border:none; border-radius:50%; width:40px; height:40px;">➤</button>
        </div>
    </div>

    <div id="screen-final" class="screen final-bg">
        <div id="final-card-content" class="final-card"></div>
    </div>

    <script>
        let timeLeft = 120;
        let timerInterval;

        function show(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id === 'final' ? 'screen-final' : 'screen' + id).classList.add('active');
            if(id === 3) startTimer();
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.querySelector('.digital-clock').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
                if (timeLeft <= 0) { clearInterval(timerInterval); showFinal('chat', true); }
            }, 1000);
        }

        function showFinal(type, auto = false) {
            if(!auto && !confirm("Quitter ?")) return;
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            card.innerHTML = \`<h2>Merci</h2><p>Session terminée.</p><button class="btn-restart" onclick="location.reload()">Recommencer</button>\`;
            show('final');
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
