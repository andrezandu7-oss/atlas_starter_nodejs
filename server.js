const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- TES STYLES ORIGINAUX CONSERVÉS ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }
    
    /* STYLES DES MAQUETTES DE SIMULATION AJOUTÉS */
    .screen { display: none; width: 100%; height: 100vh; background: white; flex-direction: column; position: relative; }
    .active { display: flex; }
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .btn-quit { background: #ffffff; color: #9dbce3; border: none; width: 32px; height: 32px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-logout-badge { background: #1a2a44; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; cursor: pointer; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; }
    .notif-bg { background: #f0f2f5; justify-content: center; align-items: center; flex: 1; }
    .notif-card { background: white; width: 85%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); padding-bottom: 20px; overflow: hidden; }
    .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
    .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; }
    #security-popup { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
    .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
</style>
`;

// --- ROUTES PRINCIPALES (ACCUEIL, SIGNUP, PROFILE, SETTINGS) ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div><div class="page-white"><h2 style="color:#ff416c;">Configuration Santé</h2><form onsubmit="save(event)"><input type="text" id="fn" class="input-box" placeholder="Prénom" required><input type="text" id="ln" class="input-box" placeholder="Nom" required><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><button type="submit" class="btn-pink">🚀 Valider mon profil</button></form></div></div><script>function save(e){ e.preventDefault(); document.getElementById('loader').style.display='flex'; localStorage.setItem('u_fn', document.getElementById('fn').value); localStorage.setItem('u_ln', document.getElementById('ln').value); localStorage.setItem('u_gt', document.getElementById('gt').value); setTimeout(()=>location.href='/profile', 2000); }</script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px;"><h2>Profil Santé</h2><p id="vN">Utilisateur</p><b id="rG">...</b></div><a href="/simulation" class="btn-dark">🔍 Simuler un contact (Maquette)</a><a href="/" class="btn-pink">Déconnexion</a></div><script>document.getElementById('vN').innerText = localStorage.getItem('u_fn') + " " + localStorage.getItem('u_ln'); document.getElementById('rG').innerText = "Génotype: " + localStorage.getItem('u_gt');</script></body></html>`);
});

// --- NOUVELLE ROUTE : SIMULATION COMPLÈTE (MAQUETTES) ---
app.get('/simulation', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">${styles}</head><body>
    <div class="app-shell">
        <div id="screen1" class="screen active notif-bg">
            <div class="notif-card">
                <div style="padding:15px; border-bottom:1px solid #eee; font-weight:bold;">📩 Genlove Notification</div>
                <div style="padding: 30px 20px; text-align: center;">
                    <p style="font-size: 1.15rem; font-weight: 500;">Quelqu'un de compatible avec vous souhaite échanger 💞</p>
                    <button class="btn-pink" style="background:#7ca9e6; width:100%;" onclick="show(2)">📖 Ouvrir Genlove</button>
                </div>
            </div>
        </div>

        <div id="screen2" class="screen notif-bg">
            <div class="notif-card">
                <div style="background: #0000ff; color: white; padding: 18px; font-weight: bold;">Genlove - confirmation</div>
                <div style="padding: 30px 25px;">
                    <p>Accepter Sarah ? ❤️</p>
                    <button class="btn-pink" style="background:#28a745; width:100%;" onclick="showSecurity()">Accepter</button>
                    <button class="btn-pink" style="background:none; color:#dc3545; border:1px solid #dc3545; width:100%;" onclick="showFinal('chat', true)">✕ Rejeter</button>
                </div>
            </div>
        </div>

        <div id="screen3" class="screen">
            <div id="security-popup">
                <div class="popup-card">
                    <h3>🔒 Espace privé</h3>
                    <p>Genlove a sécurisé cet échange.</p>
                    <button class="btn-pink" onclick="closePopup()">Démarrer l'échange</button>
                </div>
            </div>
            <div class="chat-header">
                <button class="btn-quit" onclick="showFinal('chat')">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <button class="btn-logout-badge" onclick="showFinal('app')">Logout 🔒</button>
            </div>
            <div class="chat-messages" id="box"><div class="bubble received">Bonjour ! 👋</div></div>
        </div>

        <div id="screen-final" class="screen final-bg"><div id="final-card-content" class="final-card"></div></div>
    </div>

    <script>
        let timeLeft = 1800; let timer;
        function show(id) { document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById(id === 'final' ? 'screen-final' : 'screen'+id).classList.add('active'); }
        function showSecurity() { show(3); document.getElementById('security-popup').style.display='flex'; }
        function closePopup() { document.getElementById('security-popup').style.display='none'; startTimer(); }
        function startTimer() { timer = setInterval(()=>{ timeLeft--; let m=Math.floor(timeLeft/60), s=timeLeft%60; document.getElementById('timer-display').innerText=(m<10?"0":"")+m+":"+(s<10?"0":"")+s; if(timeLeft<=0) showFinal('chat', true); },1000); }
        function showFinal(type, auto=false) {
            if(!auto && !confirm(type==='chat'?"Quitter la conversation ?":"Se déconnecter ?")) return;
            clearInterval(timer);
            const card = document.getElementById('final-card-content');
            card.innerHTML = type === 'chat' ? "<h2>Merci pour cet échange</h2><button class='btn-pink' onclick='location.reload()'>Autre profil</button>" : "<h2>Session fermée</h2><button class='btn-pink' onclick='location.href=\"/\"'>Accueil</button>";
            show('final');
        }
    </script></body></html>`);
});

app.listen(port);
