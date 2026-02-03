const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- PARTIE 1 : STYLES & SCRIPTS GÉNÉRAUX ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }
    .btn-details { background: #ff416c; color: white; }
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }
</style>
`;

const notifyScript = `<script>function showNotify(msg){ const n=document.getElementById('genlove-notify'); document.getElementById('notify-msg').innerText=msg; n.classList.add('show'); setTimeout(()=>n.classList.remove('show'), 3000); }</script>`;

// --- ROUTES APP PRINCIPALE (PARTIE 1) ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="page-white" style="display:flex; flex-direction:column; justify-content:center;"><h1>Genlove</h1><a href="/signup" class="btn-pink">Créer mon compte</a><a href="/profile" class="btn-dark">Se connecter</a></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div><div class="page-white" id="main-content"><h2>Configuration Santé</h2><form onsubmit="save(event)"><input type="text" id="fn" class="input-box" placeholder="Prénom" required><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">Valider</button></form></div></div><script>function save(e){ e.preventDefault(); document.getElementById('loader').style.display='flex'; localStorage.setItem('u_fn', document.getElementById('fn').value); localStorage.setItem('u_gt', document.getElementById('gt').value); setTimeout(()=>location.href='/profile', 3000); }</script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="page-white"><h2>Mon Profil</h2><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG"></b></div></div><a href="/matching" class="btn-pink">Chercher un partenaire</a></div></div><script>document.getElementById('rG').innerText = localStorage.getItem('u_gt');</script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
    <div style="padding:20px;"><h3>Partenaires</h3></div>
    <div id="match-container"></div>
    <script>
        const partners = [{id:1, name:"Sarah", gt:"AA"}, {id:2, name:"Marc", gt:"SS"}];
        const myGt = localStorage.getItem('u_gt');
        const container = document.getElementById('match-container');
        partners.forEach(p => {
            container.innerHTML += \`
                <div class="match-card">
                    <div style="flex:1"><b>\${p.name}</b> (\${p.gt})</div>
                    <button class="btn-action btn-contact" onclick="tryContact('\${p.gt}')">Contacter</button>
                </div>\`;
        });
        function tryContact(partnerGt) {
            if(myGt === 'SS' && partnerGt === 'SS') {
                showNotify("Incompatible : Union SS + SS bloquée.");
            } else { location.href = '/chat'; }
        }
    </script>
    ${notifyScript}
    </div></body></html>`);
});

// --- ROUTE MESSAGERIE SÉCURISÉE (PARTIE 2 INTÉGRÉE) ---
app.get('/chat', (req, res) => {
    // Ici, j'injecte exactement ton code HTML de la Partie 2
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Messagerie</title>
    <style>
        /* TES STYLES DE LA PARTIE 2 */
        body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; height: 100vh; }
        .screen { display: none; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; }
        .active { display: flex; }
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { position: fixed; bottom: 0; width: 100%; max-width: 450px; padding: 10px 15px 45px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; }
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; }
        .btn-restart { background: #ff416c; color: white; border: none; padding: 16px; border-radius: 30px; width: 100%; font-weight: bold; cursor: pointer; }
        #security-popup { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; }
    </style>
</head>
<body>
    <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

    <div id="screen1" class="screen active" style="background:#f0f2f5; justify-content:center; align-items:center;">
        <div style="background:white; padding:20px; border-radius:20px; width:80%; text-align:center;">
            <p>📩 Notification Genlove</p>
            <b>Sarah souhaite échanger avec vous 💞</b><br><br>
            <button onclick="show(2)" style="background:#7ca9e6; color:white; border:none; padding:15px; border-radius:12px; width:100%;">Ouvrir</button>
        </div>
    </div>

    <div id="screen2" class="screen" style="background:#f0f2f5; justify-content:center; align-items:center;">
        <div style="background:white; padding:20px; border-radius:20px; width:80%; text-align:center;">
            <p>Accepter Sarah ? ❤️</p>
            <button onclick="showSecurityPopup()" style="background:#28a745; color:white; border:none; padding:15px; border-radius:12px; width:100%; margin-bottom:10px;">Accepter</button>
            <button onclick="showFinal('chat', true)" style="background:none; color:red; border:1px solid red; padding:15px; border-radius:12px; width:100%;">Rejeter</button>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup">
            <div class="popup-card">
                <h3>🔒 Espace privé</h3>
                <p>Genlove a sécurisé cet échange.</p>
                <button onclick="closePopup()" style="background:#4a76b8; color:white; border:none; padding:16px; border-radius:30px; width:100%;">Démarrer</button>
            </div>
        </div>
        <div class="chat-header">
            <button onclick="showFinal('chat')" style="background:white; border:none; border-radius:5px; padding:5px 10px;">✕</button>
            <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
            <button onclick="showFinal('app')" style="background:#1a2a44; color:white; border:none; padding:8px 15px; border-radius:8px;">Logout 🔒</button>
        </div>
        <div class="chat-messages" id="box"><div class="bubble received">Bonjour ! 👋</div></div>
        <div class="input-area"><textarea id="msg" style="flex:1; padding:12px; border-radius:20px;"></textarea><button onclick="send()" style="background:#4a76b8; color:white; border:none; width:45px; height:45px; border-radius:50%;">➤</button></div>
    </div>

    <div id="screen-final" class="screen final-bg"><div id="final-card-content" class="final-card"></div></div>

    <script>
        let timeLeft = 1800; let timerInterval;
        function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById('screen'+id).classList.add('active'); }
        function showSecurityPopup(){ show(3); document.getElementById('security-popup').style.display='flex'; }
        function closePopup(){ document.getElementById('security-popup').style.display='none'; startTimer(); }
        function startTimer(){ timerInterval = setInterval(()=>{ timeLeft--; let m=Math.floor(timeLeft/60), s=timeLeft%60; document.getElementById('timer-display').innerText=(m<10?"0":"")+m+":"+(s<10?"0":"")+s; if(timeLeft<=0) showFinal('chat', true); },1000); }
        function send(){ const i=document.getElementById('msg'); if(i.value.trim()){ const d=document.createElement('div'); d.className='bubble sent'; d.innerText=i.value; document.getElementById('box').appendChild(d); i.value=''; } }
        function showFinal(type, auto=false){
            if(!auto && !confirm("Confirmer ?")) return;
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            card.innerHTML = type === 'chat' ? "<h2>Échange terminé ✨</h2><button class='btn-restart' onclick='location.href=\"/matching\"'>Retour</button>" : "<h2>Session fermée 🛡️</h2><button class='btn-restart' onclick='location.href=\"/\"'>Accueil</button>";
            document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
            document.getElementById('screen-final').classList.add('active');
        }
    </script>
</body>
</html>`);
});

app.listen(port);
