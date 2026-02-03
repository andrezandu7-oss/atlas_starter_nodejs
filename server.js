const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLES RÉUNIS (CODES 1 & 2) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    /* Code 1 : Notification & Loader */
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Code 1 : Écrans & Boutons */
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; cursor: pointer; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: left; }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }

    /* Code 2 : Chat & Timer */
    .screen-chat { display: none; position: fixed; inset: 0; background: white; z-index: 2000; flex-direction: column; }
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
    .input-area { position: absolute; bottom: 0; width: 100%; padding: 10px 15px 45px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; }
    
    #security-popup { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 3000; justify-content: center; align-items: center; padding: 20px; text-align: center; color: white; }
    .popup-card { background: white; color: #333; border-radius: 30px; padding: 35px 25px; width: 88%; }
</style>
`;

const notifyScript = `<script>function showNotify(msg){ const n=document.getElementById('genlove-notify'); document.getElementById('notify-msg').innerText=msg; n.classList.add('show'); setTimeout(()=>n.classList.remove('show'),3000); }</script>`;

// --- ROUTES EXPRESS (FIDÈLES AU CODE 1) ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div><div class="page-white"><h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
    <form onsubmit="save(event)">
        <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
        <input type="file" id="i" style="display:none" onchange="preview(event)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <input type="text" id="res" class="input-box" placeholder="Résidence" required>
        <div class="serment-container"><input type="checkbox" required><label class="serment-text">Je confirme la sincérité de mes résultats médicaux.</label></div>
        <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
        let b64 = "";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        function save(e){ e.preventDefault(); document.getElementById('loader').style.display='flex'; localStorage.setItem('u_p', b64); localStorage.setItem('u_fn', document.getElementById('fn').value); localStorage.setItem('u_gt', document.getElementById('gt').value); localStorage.setItem('u_res', document.getElementById('res').value); setTimeout(()=>window.location.href='/profile', 5000); }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div style="background:white; padding:30px 20px; text-align:center;"><div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div><h2 id="vN">Utilisateurs</h2><p id="vG" style="color:#007bff; font-weight:bold;"></p></div><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a></div><script>document.getElementById('vP').style.backgroundImage='url('+localStorage.getItem('u_p')+')'; document.getElementById('vN').innerText=localStorage.getItem('u_fn'); document.getElementById('vG').innerText='Génotype : ' + localStorage.getItem('u_gt');</script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3>Partenaires</h3></div>
        <div id="match-container"></div>
        
        <div id="chat-screen" class="screen-chat">
            <div id="security-popup"><div class="popup-card"><h3>🔒 Espace Privé</h3><p>Tout s'efface dans 30 min.</p><button class="btn-dark" onclick="closeSec()">Démarrer</button></div></div>
            <div class="chat-header"><button onclick="location.reload()" style="border:none; background:white; padding:5px; border-radius:5px;">✕</button><div class="digital-clock">❤️ <span id="timer">30:00</span></div><div></div></div>
            <div class="chat-messages" id="box"><div class="bubble received">Bonjour ! Ton profil m'intéresse beaucoup. 👋</div></div>
            <div class="input-area"><textarea id="msg" style="flex:1; border-radius:20px; padding:10px; border:1px solid #ddd;"></textarea><button onclick="send()" style="border:none; background:#4a76b8; color:white; width:45px; border-radius:50%;">➤</button></div>
        </div>

        <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>
        
        <script>
            const partners = [{id:1, gt:"AA"}, {id:2, gt:"AS"}, {id:3, gt:"SS"}];
            const myGt = localStorage.getItem('u_gt');
            const container = document.getElementById('match-container');
            
            // FILTRAGE ÉTHIQUE (CODE 1)
            let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
            if(myGt === "SS" || myGt === "AS") container.innerHTML = '<div style="background:#e7f3ff; padding:15px; margin:10px; border-radius:10px; font-size:0.8rem;">✨ <b>Protection :</b> Nous vous proposons uniquement des profils AA.</div>';

            filtered.forEach(p => {
                container.innerHTML += \`<div class="match-card"><div class="match-photo-blur"></div><div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div><button class="btn-dark" style="margin:0; padding:10px;" onclick="openChat()">Contacter</button></div>\`;
            });

            // LOGIQUE SIMULATION (CODE 2)
            let timeLeft = 1800;
            function openChat() { document.getElementById('chat-screen').style.display='flex'; document.getElementById('security-popup').style.display='flex'; }
            function closeSec() { document.getElementById('security-popup').style.display='none'; startTimer(); }
            function startTimer() {
                setInterval(() => {
                    timeLeft--;
                    let m=Math.floor(timeLeft/60), s=timeLeft%60;
                    document.getElementById('timer').innerText=(m<10?'0':'')+m+":"+(s<10?'0':'')+s;
                    if([60,40,20].includes(timeLeft)) document.getElementById('lastMinuteSound').play();
                    if(timeLeft<=0) location.reload();
                }, 1000);
            }
            function send() {
                const i=document.getElementById('msg'); if(i.value){
                    const d=document.createElement('div'); d.className='bubble sent'; d.innerText=i.value;
                    document.getElementById('box').appendChild(d); i.value='';
                }
            }
        </script>
    </div></body></html>`);
});

app.listen(port);
             
