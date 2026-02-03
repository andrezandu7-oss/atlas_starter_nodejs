const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- DESIGN SYSTEM UNIFIÉ ---
const globalStyles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    
    /* Boutons et Inputs */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; border: none; cursor: pointer; display: block; width: 85%; margin: 20px auto; text-decoration: none; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; border: none; cursor: pointer; display: block; margin: 15px; text-decoration: none; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; box-sizing: border-box; background: #f8f9fa; }

    /* Simulation Styles */
    .screen { display: none; width: 100%; height: 100vh; background: white; flex-direction: column; position: fixed; top: 0; max-width: 420px; z-index: 2000; }
    .active { display: flex; }
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; }
    
    /* Écran Final */
    .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); justify-content: center; align-items: center; }
    .final-card { background: white; border-radius: 30px; padding: 40px 25px; width: 85%; text-align: center; color: #333; }
    .btn-secondary { background: none; border: 1px solid #ccc; color: #666; padding: 12px; border-radius: 30px; width: 100%; font-weight: bold; margin-top: 10px; cursor: pointer; }
</style>
`;

// --- ROUTE PRINCIPALE (CORE APP) ---
app.get('/', (req, res) => {
    res.send(\`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">\${globalStyles}</head><body>
    <div class="app-shell">
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;">
            <div style="font-size: 3.5rem; font-weight: bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <p style="font-weight: bold; color: #1a2a44;">Unissez cœur et santé pour bâtir des couples sains</p>
            <a href="/profile" class="btn-dark">➔ Se connecter</a>
            <a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; margin-top:15px;">👤 Créer un compte</a>
        </div>
    </div></body></html>\`);
});

// --- ROUTE SIGNUP ---
app.get('/signup', (req, res) => {
    res.send(\`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">\${globalStyles}</head><body>
    <div class="app-shell">
        <div class="page-white" style="background:white; min-height:100vh; padding:20px; text-align:center;">
            <h2 style="color:#ff416c;">Configuration Santé</h2>
            <form onsubmit="saveData(event)">
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
            </form>
        </div>
    </div>
    <script>
        function saveData(e){ e.preventDefault(); localStorage.setItem('u_fn', document.getElementById('fn').value); localStorage.setItem('u_gt', document.getElementById('gt').value); window.location.href='/profile'; }
    </script></body></html>\`);
});

// --- ROUTE PROFILE & MATCHING (Intégrées pour la démo) ---
app.get('/profile', (req, res) => {
    res.send(\`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">\${globalStyles}</head><body>
    <div class="app-shell">
        <div style="padding:20px; text-align:center; background:white;">
            <h2 id="nameDisplay">Utilisateur</h2>
            <p>Génotype: <b id="gtDisplay">--</b></p>
            <button class="btn-pink" onclick="window.location.href='/simulation'">🔍 Lancer une simulation</button>
        </div>
    </div>
    <script>
        document.getElementById('nameDisplay').innerText = localStorage.getItem('u_fn') || 'Utilisateur';
        document.getElementById('gtDisplay').innerText = localStorage.getItem('u_gt') || 'Non défini';
    </script></body></html>\`);
});

// --- ROUTE SIMULATION (AVEC TOUS LES DÉTAILS) ---
app.get('/simulation', (req, res) => {
    res.send(\`
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">\${globalStyles}</head><body>
    <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

    <div id="screen1" class="screen active" style="background:#f0f2f5; justify-content:center; align-items:center;">
        <div style="background:white; width:85%; border-radius:20px; padding:20px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <div style="font-weight:bold; margin-bottom:15px;">📩 Genlove Notification</div>
            <p>Quelqu'un de compatible souhaite échanger 💞</p>
            <button class="btn-pink" onclick="show(2)" style="width:100%;">📖 Ouvrir l'application</button>
        </div>
    </div>

    <div id="screen2" class="screen" style="background:#f0f2f5; justify-content:center; align-items:center;">
        <div style="background:white; width:85%; border-radius:20px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <div style="background:#0000ff; color:white; padding:18px; font-weight:bold; text-align:center;">Genlove - confirmation</div>
            <div style="padding:30px 25px; text-align:center;">
                <p style="margin-bottom:25px;">Accepter Sarah ? ❤️</p>
                <button style="background:#28a745; color:white; border:none; padding:15px; border-radius:10px; width:100%; font-weight:bold; cursor:pointer; margin-bottom:10px;" onclick="showSecurityPopup()">Accepter</button>
                <button style="background:none; color:#dc3545; border:1px solid #dc3545; padding:15px; border-radius:10px; width:100%; font-weight:bold; cursor:pointer;" onclick="showFinal('chat', true)">✕ Rejeter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:3000; justify-content:center; align-items:center; padding:20px;">
            <div class="final-card">
                <h3>🔒 Espace privé</h3>
                <p>Tout s'efface dans 30 min.</p>
                <button class="btn-pink" onclick="closePopup()" style="width:100%;">Démarrer l'échange</button>
            </div>
        </div>
        <div class="chat-header">
            <button onclick="showFinal('chat')" style="background:white; border:none; border-radius:5px; padding:5px 10px;">✕</button>
            <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
            <button onclick="showFinal('app')" style="background:#1a2a44; color:white; border:none; padding:5px 10px; border-radius:5px;">Logout 🔒</button>
        </div>
        <div id="box" style="flex:1; padding:15px; overflow-y:auto; background:#f8fafb;">
            <div style="background:#e2ecf7; padding:12px; border-radius:15px; align-self:flex-start; max-width:80%;">Bonjour ! Ton profil m'intéresse beaucoup. 👋</div>
        </div>
    </div>

    <div id="screen-final" class="screen final-bg">
        <div id="final-card-content" class="final-card">
            <h2 id="finalTitle">Merci</h2>
            <p id="finalMsg">Session fermée.</p>
            <button id="btnMain" class="btn-pink" style="width:100%;" onclick="location.href='/profile'">Quitter</button>
            <button id="btnHome" class="btn-secondary" onclick="location.href='/'">Retour à l'accueil</button>
        </div>
    </div>

    <script>
        let timeLeft = 30 * 60, timerInterval, currentPulse;
        function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id === 'final' ? 'screen-final' : 'screen' + id).classList.add('active'); }
        function showSecurityPopup() { show(3); document.getElementById('security-popup').style.display = 'flex'; }
        function closePopup() { document.getElementById('security-popup').style.display = 'none'; startTimer(); }
        
        function alarm(type) {
            const a = document.getElementById('lastMinuteSound');
            if(type === 'pulse') {
                currentPulse = setInterval(() => { a.currentTime=0; a.play(); if(navigator.vibrate) navigator.vibrate(100); }, 400);
                setTimeout(() => clearInterval(currentPulse), 5000);
            } else {
                a.loop = true; a.play(); if(navigator.vibrate) navigator.vibrate([1000, 500, 1000]);
                setTimeout(() => { a.pause(); a.loop=false; }, 5000);
            }
        }

        function startTimer() {
            timerInterval = setInterval(() => {
                timeLeft--;
                let m = Math.floor(timeLeft/60), s = timeLeft%60;
                document.getElementById('timer-display').innerText = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
                if([60,40,20].includes(timeLeft)) alarm('pulse');
                if(timeLeft === 5) alarm('final');
                if(timeLeft <= 0) { clearInterval(timerInterval); showFinal('chat', true); }
            }, 1000);
        }

        function showFinal(type, auto) {
            if(!auto && !confirm("Quitter ?")) return;
            clearInterval(timerInterval);
            if(type === 'app') {
                document.getElementById('finalTitle').innerText = "Merci pour votre confiance";
                document.getElementById('finalMsg').innerText = "Votre session a été fermée en toute sécurité.";
                document.getElementById('btnMain').style.background = "#1a2a44";
            }
            show('final');
        }
    </script>
</body></html>\`);
});

app.listen(port, () => console.log('Serveur Genlove actif sur port ' + port));

