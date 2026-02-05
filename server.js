const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
<title>Genlove - Santé & Cœur</title>
<style>
    body { margin: 0; font-family: 'Segoe UI', sans-serif; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
    .app-shell { width: 100%; max-width: 420px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    .screen { display: none; flex-direction: column; height: 100%; width: 100%; overflow-y: auto; background: white; }
    .active { display: flex; }
    
    /* Header & Messagerie */
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; font-size: 1.1rem; border: 1px solid #333; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 80px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; font-size: 0.9rem; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
    
    /* Formulaires & UI */
    .page-padding { padding: 25px; text-align: center; }
    .photo-circle { width: 100px; height: 100px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .btn-pink { background: #ff416c; color: white; padding: 16px; border-radius: 50px; border: none; font-weight: bold; width: 100%; cursor: pointer; margin-top: 20px; }
    .btn-dark { background: #1a2a44; color: white; padding: 16px; border-radius: 12px; border: none; font-weight: bold; width: 100%; cursor: pointer; margin-top: 10px; }
    .match-card { background: white; margin: 10px 0; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: left; }
    .info-bubble { background: #e7f3ff; color: #1a2a44; padding: 15px; border-radius: 12px; margin: 15px 0; font-size: 0.85rem; border-left: 5px solid #007bff; text-align: left; }
    
    .input-area { position: absolute; bottom: 0; width: 100%; padding: 10px; background: white; display: flex; gap: 10px; border-top: 1px solid #eee; }
    .input-area textarea { flex: 1; border-radius: 20px; padding: 10px; border: 1px solid #ddd; resize: none; outline: none; }
</style>
</head>
<body>
<div class="app-shell" id="app-root"></div>
<audio id="sound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

<script>
const root = document.getElementById('app-root');
let timeLeft = 1800, timerInterval = null, currentPulse = null;

// RENDERERS
function render(html) { root.innerHTML = html; }

function showHome() {
    render(\`
    <div class="screen active page-padding" style="background:#f4e9da; justify-content:center;">
        <h1 style="font-size:3.5rem; color:#1a2a44; margin:0;">Gen<span style="color:#ff416c;">love</span></h1>
        <p style="font-weight:bold; margin-bottom:40px;">Bâtir des couples sains ✊</p>
        <button class="btn-dark" onclick="showLogin()">➔ Se connecter</button>
        <button class="btn-pink" onclick="showSignup()" style="background:none; color:#1a2a44; border:2px solid #ff416c;">👤 Créer un compte</button>
    </div>\`);
}

function showSignup() {
    render(\`
    <div class="screen active page-padding">
        <h2 style="color:#ff416c;">Configuration Santé</h2>
        <div class="photo-circle" id="pc" onclick="document.getElementById('fi').click()">📸</div>
        <input type="file" id="fi" style="display:none" onchange="const r=new FileReader();r.onload=()=>{document.getElementById('pc').style.backgroundImage='url('+r.result+')';localStorage.setItem('u_p',r.result)};r.readAsDataURL(this.files[0])">
        <input id="fn" class="input-box" placeholder="Prénom">
        <select id="gt" class="input-box">
            <option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option>
        </select>
        <select id="pj" class="input-box">
            <option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option>
        </select>
        <div style="text-align:left; font-size:0.8rem; margin-top:15px;">
            <input type="checkbox" id="oath"> <label for="oath">Je confirme sur l'honneur la sincérité de mes données médicales.</label>
        </div>
        <button class="btn-pink" onclick="saveProfile()">🚀 Valider mon profil</button>
    </div>\`);
}

function saveProfile() {
    const gt = document.getElementById('gt').value;
    if(!gt || !document.getElementById('oath').checked) return alert("Veuillez remplir les infos et signer le serment.");
    localStorage.setItem('u_fn', document.getElementById('fn').value);
    localStorage.setItem('u_gt', gt);
    showMatching();
}

function showMatching() {
    const myGt = localStorage.getItem('u_gt');
    const partners = [
        {n:"Sarah", gt:"AA", d:"Prête pour une vie saine."},
        {n:"Marc", gt:"AS", d:"Cherche relation sérieuse."},
        {n:"Léa", gt:"SS", d:"Optimiste et passionnée."}
    ];
    
    // RÈGLE SS : Bloquer les partenaires SS si l'utilisateur est SS
    let filtered = partners;
    let warning = "";
    if(myGt === "SS" || myGt === "AS") {
        filtered = partners.filter(p => p.gt === "AA");
        warning = '<div class="info-bubble">✨ <b>Engagement Santé :</b> Pour protéger votre descendance, nous vous proposons uniquement des profils AA.</div>';
    }

    let listHtml = filtered.map(p => \`
        <div class="match-card">
            <div style="width:50px; height:50px; background:#eee; border-radius:50%; filter:blur(3px);"></div>
            <div style="flex:1"><b>\${p.n}</b><br><small>Génotype \${p.gt}</small></div>
            <button class="btn-dark" style="width:auto; padding:8px 15px;" onclick="startChat('\${p.n}')">💌 Chat</button>
        </div>\`).join('');

    render(\`
    <div class="screen active page-padding">
        <h3>Partenaires Compatibles</h3>
        \${warning}
        \${listHtml}
        <button class="btn-pink" onclick="showHome()" style="background:#666;">Déconnexion</button>
    </div>\`);
}

function startChat(name) {
    render(\`
    <div class="screen active">
        <div class="chat-header">
            <button style="border:none; background:white; border-radius:5px; padding:5px 10px;" onclick="showMatching()">✕</button>
            <div class="digital-clock">❤️ <span id="timer">30:00</span></div>
            <b>\${name}</b>
        </div>
        <div class="chat-messages" id="box">
            <div class="bubble received">Bonjour ! Ton profil correspond à mes critères santé. Échangeons ! 👋</div>
        </div>
        <div class="input-area">
            <textarea id="msg" placeholder="Message..." rows="1" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
            <button onclick="sendMsg()" style="border:none; background:#1a2a44; color:white; border-radius:50%; width:40px; height:40px;">➤</button>
        </div>
    </div>\`);
    startTimer();
}

// LOGIQUE MESSAGERIE (Vibration & Son)
function sendMsg() {
    const i = document.getElementById('msg');
    if(!i.value.trim()) return;
    const d = document.createElement('div');
    d.className = 'bubble sent';
    d.innerText = i.value;
    document.getElementById('box').appendChild(d);
    i.value = ''; i.style.height = 'auto';
    document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
}

function startTimer() {
    if(timerInterval) clearInterval(timerInterval);
    timeLeft = 1800;
    timerInterval = setInterval(() => {
        timeLeft--;
        let m = Math.floor(timeLeft/60), s = timeLeft%60;
        const disp = document.getElementById('timer');
        if(disp) disp.innerText = (m<10?"0":"")+m+":"+(s<10?"0":"")+s;
        
        if([60,40,20].includes(timeLeft)) triggerPulse();
        if(timeLeft <= 0) { clearInterval(timerInterval); location.reload(); }
    }, 1000);
}

function triggerPulse() {
    const a = document.getElementById('sound');
    let count = 0;
    currentPulse = setInterval(() => {
        a.play().catch(()=>{});
        if(navigator.vibrate) navigator.vibrate(100);
        count++; if(count >= 5) clearInterval(currentPulse);
    }, 400);
}

showHome();
</script>
</body>
</html>
\`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port, () => console.log(\`Genlove ready on port \${port}\`));
