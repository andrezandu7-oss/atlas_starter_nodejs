const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- DESIGN SYSTEM & STYLES ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
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
    
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }

    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; }
    .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; margin-top:15px; }

    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; }

    /* SIMULATION SPECIFIC */
    .screen { display: none; width: 100%; max-width: 420px; height: 100vh; background: white; flex-direction: column; position: fixed; top: 0; z-index: 2000; }
    .active { display: flex; }
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; border: 1px solid #333; }
</style>
`;

// --- ROUTES PRINCIPALES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>
    <div class="page-white"><h2 style="color:#ff416c;">Configuration Santé</h2>
    <form onsubmit="saveAndRedirect(event)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
        function saveAndRedirect(e){ 
            e.preventDefault(); 
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            setTimeout(() => { window.location.href='/profile'; }, 2000); 
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
        <h2 id="vN">Utilisateur</h2><p id="rG" style="color:#ff416c; font-weight:bold;">--</p>
    </div>
    <a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a>
    <a href="/settings" class="btn-pink" style="background:#eee; color:#333;">⚙️ Paramètres</a>
    </div><script>
        document.getElementById('vN').innerText = localStorage.getItem('u_fn') || "Utilisateur";
        document.getElementById('rG').innerText = "Génotype : " + localStorage.getItem('u_gt');
    </script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div style="padding:20px; background:white; text-align:center;"><h3>Partenaires Compatibles</h3></div>
    <div id="match-container"></div>
    <div id="popup-overlay" onclick="closePopup()">
        <div class="popup-content" onclick="event.stopPropagation()">
            <h3 id="pop-name">Détails</h3>
            <div id="pop-details"></div>
            <div id="pop-msg" class="popup-msg"></div>
            <button class="btn-pink" onclick="window.location.href='/simulation'">🚀 Contacter ce profil</button>
        </div>
    </div>
    </div><script>
        const partners = [{id:1, gt:"AA", gs:"O+"}, {id:2, gt:"AS", gs:"B-"}, {id:3, gt:"SS", gs:"A+"}];
        const myGt = localStorage.getItem('u_gt');
        const container = document.getElementById('match-container');
        let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
        
        filtered.forEach(p => {
            container.innerHTML += \`<div class="match-card" style="background:white; margin:10px; padding:15px; border-radius:15px; display:flex; justify-content:space-between; align-items:center;">
                <div><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div>
                <button class="btn-action btn-details" onclick='showDetails(\${JSON.stringify(p)})'>Détails</button>
            </div>\`;
        });

        function showDetails(p) {
            document.getElementById('pop-name').innerText = "Profil #" + p.id;
            document.getElementById('pop-details').innerHTML = "Génotype : " + p.gt;
            document.getElementById('popup-overlay').style.display = 'flex';
        }
        function closePopup() { document.getElementById('popup-overlay').style.display = 'none'; }
    </script></body></html>`);
});

// --- ROUTE SIMULATION (AVEC MINUTEUR ET ALARMES) ---

app.get('/simulation', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">${styles}</head><body>
    <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

    <div id="screen1" class="screen active" style="background:#f0f2f5; justify-content:center; align-items:center;">
        <div style="background:white; width:85%; border-radius:20px; padding:20px; text-align:center;">
            <p>Quelqu'un de compatible souhaite échanger 💞</p>
            <button class="btn-pink" onclick="show(2)" style="width:100%;">📖 Ouvrir Genlove</button>
        </div>
    </div>

    <div id="screen2" class="screen" style="background:#f0f2f5; justify-content:center; align-items:center;">
        <div style="background:white; width:85%; border-radius:20px; overflow:hidden; text-align:center;">
            <div style="background:#0000ff; color:white; padding:15px;">Genlove - confirmation</div>
            <div style="padding:20px;">
                <p>Accepter Sarah ? ❤️</p>
                <button style="background:#28a745; color:white; border:none; padding:15px; border-radius:10px; width:100%; font-weight:bold; margin-bottom:10px;" onclick="showSecurityPopup()">Accepter</button>
                <button style="background:none; color:#dc3545; border:1px solid #dc3545; padding:15px; border-radius:10px; width:100%; font-weight:bold;" onclick="showFinal('chat', true)">✕ Rejeter</button>
            </div>
        </div>
    </div>

    <div id="screen3" class="screen">
        <div id="security-popup" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:3000; justify-content:center; align-items:center; padding:20px;">
            <div style="background:white; border-radius:30px; padding:30px; text-align:center;">
                <h3>🔒 Discussion privée</h3><p>Tout s'efface dans 30 min.</p>
                <button class="btn-pink" onclick="closePopup()" style="width:100%;">Démarrer</button>
            </div>
        </div>
        <div class="chat-header">
            <button onclick="showFinal('chat')" style="background:white; border:none; padding:5px 10px; border-radius:5px;">✕</button>
            <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
            <button onclick="showFinal('app')" style="background:#1a2a44; color:white; border:none; padding:5px 10px; border-radius:5px;">Logout</button>
        </div>
        <div id="box" style="flex:1; padding:15px; overflow-y:auto; background:#f8fafb;">
            <div style="background:#e2ecf7; padding:12px; border-radius:15px; max-width:80%;">Bonjour ! Ton profil me plaît beaucoup. 👋</div>
        </div>
    </div>

    <div id="screen-final" class="screen" style="background:linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); justify-content:center; align-items:center;">
        <div style="background:white; border-radius:30px; padding:40px 25px; width:85%; text-align:center;">
            <h2 id="fTitle">Merci</h2><p id="fMsg">Session terminée.</p>
            <button class="btn-pink" onclick="location.href='/profile'">Quitter</button>
            <button style="background:none; border:1px solid #ccc; color:#666; padding:12px; border-radius:30px; width:100%; font-weight:bold; margin-top:10px;" onclick="location.href='/'">Retour à l'accueil</button>
        </div>
    </div>

    <script>
        let timeLeft = 30 * 60, timerInterval, pulse;
        function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id === 'final' ? 'screen-final' : 'screen' + id).classList.add('active'); }
        function showSecurityPopup() { show(3); document.getElementById('security-popup').style.display = 'flex'; }
        function closePopup() { document.getElementById('security-popup').style.display = 'none'; startTimer(); }
        
        function alarm(t) {
            const a = document.getElementById('lastMinuteSound');
            if(t === 'pulse') {
                pulse = setInterval(() => { a.currentTime=0; a.play(); if(navigator.vibrate) navigator.vibrate(100); }, 400);
                setTimeout(() => clearInterval(pulse), 5000);
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
            if(type === 'app') { document.getElementById('fTitle').innerText = "Merci pour votre confiance"; }
            show('final');
        }
    </script></body></html>`);
});

app.listen(port, () => console.log('Serveur actif sur le port ' + port));
