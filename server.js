const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STRUCTURE DES STYLES (Fusion Partie 1 & 2) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    /* Notifications & Popups */
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #popup-overlay, #security-popup { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content, .popup-card { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }

    /* Loader */
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Boutique UI */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; border:none; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
    
    /* Messagerie & Timer */
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
    
    /* Matching */
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }
</style>
`;

const scripts = `
<script>
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        document.getElementById('notify-msg').innerText = msg;
        n.classList.add('show');
        setTimeout(() => { n.classList.remove('show'); }, 3000);
    }

    function autoGrow(element) {
        element.style.height = "auto";
        element.style.height = (element.scrollHeight) + "px";
    }
</script>
`;

// --- ROUTES EXPRESS ---

app.get('/', (req, res) => {
    res.send(`<html><head>${styles}</head><body><div class="app-shell">
        <div class="home-screen" style="text-align:center; padding:50px 20px;">
            <h1 style="font-size:3.5rem;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1>
            <p style="font-weight:bold; color:#1a2a44;">Unissez cœur et santé</p>
            <a href="/signup" class="btn-pink">Créer mon profil</a>
            <a href="/profile" class="btn-dark">Se connecter</a>
        </div>
    </div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<html><head>${styles}</head><body><div class="app-shell">
        <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>
        <div class="page-white">
            <h2 style="color:#ff416c;">Configuration Santé</h2>
            <form onsubmit="saveProfile(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span>📸 Photo</span></div>
                <input type="file" id="i" style="display:none" onchange="preview(event)">
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <select id="gt" class="input-box" required>
                    <option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option>
                </select>
                <button type="submit" class="btn-pink">🚀 Valider</button>
            </form>
        </div>
    </div>
    <script>
        function preview(e){ const r=new FileReader(); r.onload=()=>{ document.getElementById('c').style.backgroundImage='url('+r.result+')'; localStorage.setItem('u_p', r.result); }; r.readAsDataURL(e.target.files[0]); }
        function saveProfile(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            setTimeout(() => location.href='/profile', 2000);
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<html><head>${styles}</head><body><div class="app-shell">
        <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px;">
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:0 auto 15px; background-size:cover;"></div>
            <h2 id="vN">...</h2>
            <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
        </div>
        <div style="padding:20px;">
            <div style="background:white; border-radius:15px; padding:15px; display:flex; justify-content:space-between;">
                <span>Génotype</span><b id="vG">...</b>
            </div>
            <a href="/matching" class="btn-dark" style="margin:20px 0;">🔍 Trouver un partenaire</a>
        </div>
    </div>
    <script>
        document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        document.getElementById('vN').innerText = localStorage.getItem('u_fn');
        document.getElementById('vG').innerText = localStorage.getItem('u_gt');
    </script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<html><head>${styles}${scripts}</head><body><div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

        <div id="screen-list">
            <div style="padding:20px; background:white; text-align:center;"><h3>Partenaires Compatibles</h3></div>
            <div id="match-container"></div>
            <a href="/profile" class="btn-pink">Retour</a>
        </div>

        <div id="screen-chat" style="display:none; flex-direction:column; height:100vh;">
            <div class="chat-header">
                <button onclick="location.reload()" style="background:white; border:none; border-radius:5px; padding:5px 10px; cursor:pointer;">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <div style="width:30px;"></div>
            </div>
            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond à mes attentes santé. 👋</div>
            </div>
            <div style="padding:15px; background:white; display:flex; gap:10px; align-items:center;">
                <textarea id="msg" style="flex:1; padding:10px; border-radius:15px; border:1px solid #ddd; resize:none;" rows="1" oninput="autoGrow(this)"></textarea>
                <button onclick="send()" style="background:#4a76b8; color:white; border:none; width:40px; height:40px; border-radius:50%;">➤</button>
            </div>
        </div>

        <div id="security-popup">
            <div class="popup-card">
                <h3>🔒 Échange Sécurisé</h3>
                <p>Cet échange est éphémère (30 min) pour protéger votre vie privée.</p>
                <button class="btn-pink" onclick="startChat()">Démarrer</button>
            </div>
        </div>
    </div>
    <script>
        const myGt = localStorage.getItem('u_gt');
        const partners = [
            {id:1, name:"Sarah", gt:"AA"},
            {id:2, name:"Marc", gt:"AS"},
            {id:3, name:"Léa", gt:"SS"}
        ];

        const container = document.getElementById('match-container');
        // LOGIQUE DE BLOCAGE SS-SS
        let filtered = partners;
        if (myGt === "SS") {
            filtered = partners.filter(p => p.gt === "AA");
            container.innerHTML = '<div style="padding:15px; color:#1a2a44; font-size:0.8rem; background:#e7f3ff; margin:10px; border-radius:10px;">🛡️ Profils AA uniquement pour votre sécurité.</div>';
        } else if (myGt === "AS") {
            filtered = partners.filter(p => p.gt === "AA");
        }

        filtered.forEach(p => {
            container.innerHTML += \`
                <div class="match-card">
                    <div class="match-photo-blur"></div>
                    <div style="flex:1"><b>\${p.name}</b><br><small>Génotype \${p.gt}</small></div>
                    <button class="btn-dark" style="margin:0; padding:10px;" onclick="openSecurity()">Contacter</button>
                </div>\`;
        });

        function openSecurity() { document.getElementById('security-popup').style.display='flex'; }
        
        function startChat() {
            document.getElementById('security-popup').style.display='none';
            document.getElementById('screen-list').style.display='none';
            document.getElementById('screen-chat').style.display='flex';
            startTimer();
        }

        let timeLeft = 1800;
        function startTimer() {
            setInterval(() => {
                if(timeLeft <= 0) location.reload();
                timeLeft--;
                let m = Math.floor(timeLeft/60);
                let s = timeLeft%60;
                document.getElementById('timer-display').innerText = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
                if([60, 40, 20].includes(timeLeft)) { document.getElementById('lastMinuteSound').play(); }
            }, 1000);
        }

        function send() {
            const input = document.getElementById('msg');
            if(!input.value.trim()) return;
            const div = document.createElement('div');
            div.className = 'bubble sent';
            div.innerText = input.value;
            document.getElementById('box').appendChild(div);
            input.value = '';
            document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
        }
    </script></body></html>`);
});

app.listen(port, () => console.log('Genlove Fusionné sur port ' + port));
