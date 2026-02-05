const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Officiel</title>
    <style>
        /* --- FUSION DES STYLES --- */
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .app-shell { width: 100%; max-width: 450px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .screen { display: none; flex-direction: column; height: 100%; width: 100%; background: white; overflow-y: auto; position: absolute; inset: 0; }
        .active { display: flex; z-index: 10; }

        /* Styles Partie 1 */
        .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; background:#f4e9da; }
        .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
        .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; width: 85%; margin: 15px auto; border: none; cursor: pointer; text-decoration: none; }
        .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; width: 85%; margin: 10px auto; border: none; cursor: pointer; text-decoration: none; }
        .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
        .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
        .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }
        
        /* Styles Partie 2 (Chat) */
        .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; font-size: 1.1rem; border: 1px solid #333; }
        .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
        .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
        .received { background: #e2ecf7; align-self: flex-start; }
        .sent { background: #ff416c; color: white; align-self: flex-end; }
        .input-area { position: absolute; bottom: 0; width: 100%; padding: 10px 15px 30px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; }
        
        /* Écran Final */
        .final-bg { background: linear-gradient(135deg, #4a76b8 0%, #1a2a44 100%); color: white; justify-content: center; align-items: center; text-align: center; }
        .final-card { background: white; color: #333; border-radius: 30px; padding: 40px 25px; width: 85%; box-shadow: 0 15px 40px rgba(0,0,0,0.3); }

        #security-popup { display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; }
        .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="app-shell">
        <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>

        <div id="scr-home" class="screen active home-screen">
            <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <div class="slogan">Unissez cœur et santé</div>
            <button class="btn-dark" onclick="showScreen('scr-profile')">➔ Se connecter</button>
            <button class="btn-pink" onclick="showScreen('scr-signup')" style="background:none; color:#1a2a44; border:2px solid #ff416c;">👤 Créer un compte</button>
        </div>

        <div id="scr-signup" class="screen">
            <div id="loader" style="display:none; position:absolute; inset:0; background:white; z-index:100; flex-direction:column; align-items:center; justify-content:center;">
                <div class="spinner"></div><p>Analyse médicale...</p>
            </div>
            <div style="padding:25px; text-align:center;">
                <h2 style="color:#ff416c;">Configuration Santé</h2>
                <div class="photo-circle" id="pc" onclick="document.getElementById('fi').click()">📸</div>
                <input type="file" id="fi" style="display:none" onchange="previewImg(this)">
                <input id="fn" class="input-box" placeholder="Prénom">
                <select id="gt" class="input-box">
                    <option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option>
                </select>
                <div style="text-align:left; margin-top:15px; font-size:0.8rem; background:#fff5f7; padding:10px; border-radius:10px;">
                    <input type="checkbox" id="oath"> Je confirme la sincérité de mes données.
                </div>
                <button class="btn-pink" onclick="saveProfile()">🚀 Valider</button>
                <button onclick="showScreen('scr-home')" style="border:none; background:none; color:#666;">Retour</button>
            </div>
        </div>

        <div id="scr-profile" class="screen">
            <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px;">
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:0 auto 15px; background-size:cover;"></div>
                <h2 id="vN">Utilisateur</h2>
                <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:20px;">
                <div class="match-card" style="justify-content:space-between;"><span>Génotype</span><b id="vG">...</b></div>
                <button class="btn-dark" onclick="renderMatches()">🔍 Trouver un partenaire</button>
                <button onclick="showScreen('scr-home')" class="btn-pink" style="background:#666;">Déconnexion</button>
            </div>
        </div>

        <div id="scr-matching" class="screen">
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3>Compatibilités Santé</h3></div>
            <div id="match-container"></div>
            <button class="btn-pink" onclick="showScreen('scr-profile')" style="background:#666;">Retour</button>
        </div>

        <div id="scr-chat" class="screen">
            <div id="security-popup">
                <div class="final-card" style="text-align:center;">
                    <h3>🔒 Sécurisation Genlove</h3>
                    <p>Cet échange est privé et éphémère (30 min).</p>
                    <button class="btn-pink" onclick="closeSecurityPopup()">Démarrer</button>
                </div>
            </div>
            <div class="chat-header">
                <button onclick="showFinal('chat')" style="border:none; background:white; border-radius:8px; padding:5px 10px; color:#9dbce3;">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <b id="chat-with-name">Sarah</b>
            </div>
            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond à mes critères santé. Échangeons ! 👋</div>
            </div>
            <div class="input-area">
                <textarea id="msg" style="flex:1; padding:12px; border-radius:25px; border:1px solid #ddd; outline:none; resize:none;" placeholder="Message..." rows="1"></textarea>
                <button onclick="sendMsg()" style="background:#1a2a44; color:white; border:none; width:45px; height:45px; border-radius:50%;">➤</button>
            </div>
        </div>

        <div id="scr-final" class="screen final-bg">
            <div class="final-card" id="final-card-content"></div>
        </div>
    </div>

    <script>
        let timeLeft = 1800;
        let timerInterval, currentPulse;

        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        /* --- LOGIQUE PARTIE 1 --- */
        function previewImg(i) {
            const r = new FileReader();
            r.onload = () => { 
                document.getElementById('pc').style.backgroundImage = 'url('+r.result+')';
                localStorage.setItem('u_p', r.result);
            };
            r.readAsDataURL(i.files[0]);
        }

        function saveProfile() {
            if(!document.getElementById('oath').checked) return alert("Signez le serment.");
            document.getElementById('loader').style.display = 'flex';
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            setTimeout(() => { 
                updateProfileUI();
                showScreen('scr-profile');
                document.getElementById('loader').style.display = 'none';
            }, 2000);
        }

        function updateProfileUI() {
            document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
            document.getElementById('vN').innerText = localStorage.getItem('u_fn');
            document.getElementById('vG').innerText = localStorage.getItem('u_gt');
        }

        function renderMatches() {
            const myGt = localStorage.getItem('u_gt');
            const container = document.getElementById('match-container');
            const partners = [{n:"Sarah", gt:"AA"}, {n:"Marc", gt:"AS"}, {n:"Léa", gt:"SS"}];
            
            let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
            
            container.innerHTML = filtered.map(p => \`
                <div class="match-card">
                    <div class="match-photo-blur"></div>
                    <div style="flex:1"><b>\${p.n}</b><br><small>Génotype \${p.gt}</small></div>
                    <button class="btn-dark" style="width:auto; padding:8px 12px; margin:0;" onclick="preChat('\${p.n}')">Contacter</button>
                </div>\`).join('');
            
            if(myGt === "SS" || myGt === "AS") {
                container.insertAdjacentHTML('afterbegin', '<div style="background:#e7f3ff; padding:15px; margin:10px; border-radius:10px; font-size:0.8rem;">🛡️ Profils AA uniquement pour votre sécurité.</div>');
            }
            showScreen('scr-matching');
        }

        /* --- LOGIQUE PARTIE 2 (Fusionnée) --- */
        function preChat(name) {
            document.getElementById('chat-with-name').innerText = name;
            showScreen('scr-chat');
            document.getElementById('security-popup').style.display = 'flex';
        }

        function closeSecurityPopup() {
            document.getElementById('security-popup').style.display = 'none';
            startTimer();
        }

        function startTimer() {
            if(timerInterval) clearInterval(timerInterval);
            timeLeft = 1800;
            timerInterval = setInterval(() => {
                timeLeft--;
                let m = Math.floor(timeLeft/60), s = timeLeft%60;
                document.getElementById('timer-display').innerText = (m<10?"0":"")+m+":"+(s<10?"0":"")+s;
                if([60,40,20].includes(timeLeft)) triggerAlarm();
                if(timeLeft <= 0) showFinal('chat', true);
            }, 1000);
        }

        function triggerAlarm() {
            const a = document.getElementById('lastMinuteSound');
            let count = 0;
            currentPulse = setInterval(() => {
                a.play().catch(()=>{});
                if(navigator.vibrate) navigator.vibrate(100);
                count++; if(count >= 5) clearInterval(currentPulse);
            }, 400);
        }

        function sendMsg() {
            const i = document.getElementById('msg');
            if(!i.value.trim()) return;
            const d = document.createElement('div');
            d.className = 'bubble sent'; d.innerText = i.value;
            document.getElementById('box').appendChild(d);
            i.value = '';
            document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
        }

        function showFinal(type, auto=false) {
            if(!auto && !confirm("Quitter ?")) return;
            clearInterval(timerInterval);
            const card = document.getElementById('final-card-content');
            card.innerHTML = type === 'chat' ? 
                '<h2>Merci pour cet échange</h2><p>Tout a été effacé en toute sécurité.</p><button class="btn-pink" onclick="location.reload()">🔎 Accueil</button>' :
                '<h2>Session fermée</h2><button class="btn-pink" onclick="location.reload()">Reconnexion</button>';
            showScreen('scr-final');
        }

        window.onload = () => { if(localStorage.getItem('u_fn')) updateProfileUI(); };
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port, () => console.log('Genlove Fusionné Ready'));
