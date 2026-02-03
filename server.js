const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- TES STYLES (STRICTEMENT IDENTIQUES) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }

    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
    
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }

    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; animation: slideUp 0.3s ease-out; }
    .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px; }

    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }

    .info-bubble { background: #e7f3ff; color: #1a2a44; padding: 15px; border-radius: 12px; margin: 15px; font-size: 0.85rem; border-left: 5px solid #007bff; text-align: left; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }

    /* Styles Chat Simulation */
    .chat-container { display: none; flex-direction: column; height: 100vh; background: white; position: fixed; inset: 0; z-index: 2000; }
    .chat-header { background: #1a2a44; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
    .timer-box { background: #ff416c; color: white; padding: 5px 10px; border-radius: 8px; font-family: monospace; font-weight: bold; }
    .chat-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; background: #f8f9fa; }
    .msg-received { background: #e9ecef; padding: 10px; border-radius: 15px; align-self: flex-start; max-width: 80%; }
    .msg-sent { background: #ff416c; color: white; padding: 10px; border-radius: 15px; align-self: flex-end; max-width: 80%; }
</style>
`;

const notifyScript = `
<script>
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        document.getElementById('notify-msg').innerText = msg;
        n.classList.add('show');
        setTimeout(() => { n.classList.remove('show'); }, 3000);
    }
</script>
`;

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div><div class="page-white" id="main-content"><h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
    <form onsubmit="saveAndRedirect(event)">
        <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
        <input type="file" id="i" style="display:none" onchange="preview(event)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
        <input type="text" id="ln" class="input-box" placeholder="Nom" required>
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required>
        <div class="serment-container"><input type="checkbox" required><label class="serment-text">Je confirme sur l'honneur que ces informations sont sincères.</label></div>
        <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
        let b64 = "";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        function saveAndRedirect(e){ 
            e.preventDefault(); 
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            setTimeout(() => { window.location.href='/profile'; }, 3000); 
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f8f9fa;"><div class="app-shell"><div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;"><div style="display:flex; justify-content:space-between; align-items:center;"><a href="/" style="text-decoration:none;">🏠 Accueil</a><a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a></div><div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div><h2 id="vN">Utilisateur</h2><p id="vR" style="color:#666; font-size:0.9rem;">📍 Localisation</p></div><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG">...</b></div></div><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a></div><script>document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')'; document.getElementById('vN').innerText = localStorage.getItem('u_fn'); document.getElementById('vR').innerText = "📍 " + localStorage.getItem('u_res'); document.getElementById('rG').innerText = localStorage.getItem('u_gt');</script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div style="padding:20px; background:white; text-align:center;"><h3 style="margin:0;">Partenaires Compatibles</h3></div>
        <div id="match-container"></div>

        <div id="chat-ui" class="chat-container">
            <div class="chat-header">
                <span onclick="closeChat()" style="cursor:pointer">✕</span>
                <div class="timer-box">⏳ <span id="timer">30:00</span></div>
                <span>Privé</span>
            </div>
            <div id="chat-box" class="chat-messages">
                <div class="msg-received">Bonjour ! Ravi de faire votre connaissance. 👋</div>
            </div>
            <div style="padding:10px; display:flex; gap:5px; background:white;">
                <input type="text" id="msg-in" style="flex:1; padding:10px; border-radius:20px; border:1px solid #ddd;" placeholder="Message...">
                <button onclick="send()" style="border:none; background:#ff416c; color:white; border-radius:50%; width:40px;">➤</button>
            </div>
        </div>

        <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
                <h3 id="pop-name" style="color:#ff416c;">Détails</h3>
                <div id="pop-details"></div>
                <div id="pop-msg" class="popup-msg"></div>
                <button class="btn-pink" style="width:100%" onclick="startChat()">🚀 Contacter ce profil</button>
            </div>
        </div>
        ${notifyScript}
        <script>
            const partners = [{id:1, gt:"AA", gs:"O+"}, {id:2, gt:"AS", gs:"B-"}, {id:3, gt:"SS", gs:"A+"}];
            const myGt = localStorage.getItem('u_gt');
            const container = document.getElementById('match-container');
            
            // Règle SS (Info profil conservée)
            let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
            if(myGt === "SS" || myGt === "AS") container.innerHTML = '<div class="info-bubble">✨ <b>Engagement Santé :</b> Profils AA uniquement.</div>';

            filtered.forEach(p => {
                container.innerHTML += \`<div class="match-card"><div class="match-photo-blur"></div><div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div><button class="btn-action btn-details" onclick='showDetails(\${JSON.stringify(p)})'>Voir</button></div>\`;
            });

            function showDetails(p) {
                document.getElementById('pop-name').innerText = "Profil #" + p.id;
                document.getElementById('pop-details').innerHTML = "<b>Génotype :</b> " + p.gt;
                document.getElementById('popup-overlay').style.display = 'flex';
            }

            function closePopup() { document.getElementById('popup-overlay').style.display = 'none'; }
            
            // CHAT LOGIQUE
            let t;
            function startChat() {
                closePopup();
                document.getElementById('chat-ui').style.display = 'flex';
                let time = 1800;
                t = setInterval(() => {
                    time--;
                    let m = Math.floor(time/60), s = time%60;
                    document.getElementById('timer').innerText = (m<10?'0':'')+m+":"+(s<10?'0':'')+s;
                    if(time<=0) { clearInterval(t); location.reload(); }
                }, 1000);
            }
            function closeChat() { clearInterval(t); document.getElementById('chat-ui').style.display = 'none'; }
            function send() {
                let i = document.getElementById('msg-in');
                if(i.value) {
                    let d = document.createElement('div'); d.className='msg-sent'; d.innerText=i.value;
                    document.getElementById('chat-box').appendChild(d); i.value='';
                }
            }
        </script>
    </div></body></html>`);
});

app.listen(port);
