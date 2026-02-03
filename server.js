const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLES (Fusion des deux designs) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    /* Notification Style */
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }

    /* Loader */
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* Screens & Layout */
    .screen { display: none; flex-direction: column; min-height: 100vh; width: 100%; }
    .active { display: flex; }
    .page-white { background: white; flex: 1; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; }

    /* Forms & Inputs */
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; cursor: pointer; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

    /* Buttons */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; border: none; cursor: pointer; }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
    .btn-details { background: #ff416c; color: white; }

    /* Info Groups */
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; }

    /* Popup & Overlays */
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; }
    .info-bubble { background: #e7f3ff; color: #1a2a44; padding: 15px; border-radius: 12px; margin: 15px; font-size: 0.85rem; border-left: 5px solid #007bff; text-align: left; }
    
    /* CHAT SPECIFIC */
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; display: inline-flex; align-items: center; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; height: 60vh; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
    .input-area { padding: 10px 15px 40px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
    
    #security-popup { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 2000; justify-content: center; align-items: center; padding: 20px; }
    .popup-card-security { background: white; border-radius: 30px; padding: 30px 20px; text-align: center; width: 85%; }
</style>
`;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Officiel</title>
    ${styles}
</head>
<body>
    <audio id="lastMinuteSound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg">
    </audio>

    <div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>

        <div id="screen-home" class="screen active home-screen">
            <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
            <div style="width:100%; margin-top:20px;">
                <p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p>
                <button class="btn-dark" onclick="showScreen('profile')" style="width:85%; margin:0 auto;">➔ Se connecter</button>
                <button onclick="showScreen('signup')" style="background:none; border:none; color:#1a2a44; font-weight:bold; display:block; margin:15px auto; cursor:pointer;">👤 Créer un compte</button>
            </div>
        </div>

        <div id="screen-signup" class="screen page-white">
            <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
            <form onsubmit="saveProfile(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
                <input type="file" id="i" style="display:none" onchange="preview(event)">
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                <select id="gt" class="input-box" required>
                    <option value="">Génotype</option>
                    <option>AA</option><option>AS</option><option>SS</option>
                </select>
                <input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required>
                <div class="serment-container">
                    <input type="checkbox" id="oath" required>
                    <label for="oath" class="serment-text">Je confirme sur l'honneur la véracité de mes données médicales.</label>
                </div>
                <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
            </form>
        </div>

        <div id="screen-profile" class="screen page-white" style="background:#f8f9fa; padding:0;">
            <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <button onclick="showScreen('home')" style="border:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px; font-weight:bold; cursor:pointer;">🏠 Accueil</button>
                </div>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
                <h2 id="vN" style="margin:5px 0;">Utilisateur</h2>
                <p id="vR" style="color:#666; font-size:0.9rem;">📍 Localisation</p>
                <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold; text-align:left;">MES INFORMATIONS</div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG">...</b></div>
            </div>
            <button class="btn-dark" onclick="initMatching()">🔍 Trouver un partenaire</button>
        </div>

        <div id="screen-matching" class="screen">
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3></div>
            <div id="match-container" style="flex:1; overflow-y:auto;"></div>
            <button class="btn-pink" onclick="showScreen('profile')">Retour au profil</button>
        </div>

        <div id="screen-chat" class="screen">
            <div id="security-popup">
                <div class="popup-card-security">
                    <h3>🔒 Espace Privé</h3>
                    <p>Genlove sécurise cet échange. Tout s'efface dans 30 min.</p>
                    <button class="btn-pink" style="width:100%" onclick="closeSecurityPopup()">Démarrer l'échange</button>
                </div>
            </div>
            <div class="chat-header">
                <button onclick="location.reload()" style="background:white; border:none; padding:5px 10px; border-radius:8px; cursor:pointer;">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <div style="font-size:0.8rem; font-weight:bold;">Session</div>
            </div>
            <div class="chat-messages" id="box">
                <div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div>
            </div>
            <div class="input-area">
                <input type="text" id="msg" style="flex:1; border:1px solid #ddd; padding:12px; border-radius:25px; outline:none;" placeholder="Écrivez...">
                <button style="background: #4a76b8; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor:pointer;" onclick="send()">➤</button>
            </div>
        </div>
    </div>

    <div id="popup-overlay" onclick="this.style.display='none'">
        <div class="popup-content" onclick="event.stopPropagation()">
            <h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails</h3>
            <div id="pop-details" style="font-size:0.95rem; color:#333;"></div>
            <div id="pop-msg" class="info-bubble"></div>
            <button class="btn-pink" style="width:100%; margin:15px 0 0 0;" onclick="openChat()">🚀 Contacter ce profil</button>
        </div>
    </div>

    <script>
        let b64 = localStorage.getItem('u_p') || "";
        let timeLeft = 30 * 60;
        let timerInterval;

        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById('screen-' + id).classList.add('active');
            if(id === 'profile') loadProfileData();
        }

        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }

        function saveProfile(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            setTimeout(() => { document.getElementById('loader').style.display='none'; showScreen('profile'); }, 3000);
        }

        function loadProfileData() {
            const p = localStorage.getItem('u_p');
            if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')';
            document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "Utilisateur");
            document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || "Lieu");
            document.getElementById('rG').innerText = localStorage.getItem('u_gt') || "...";
        }

        function initMatching() {
            const myGt = localStorage.getItem('u_gt');
            const partners = [
                {id:1, gt:"AA", pj:"Désire fonder une famille unie."},
                {id:2, gt:"AS", pj:"Souhaite des enfants en bonne santé."},
                {id:3, gt:"SS", pj:"Cherche une relation stable et sérieuse."}
            ];
            
            const container = document.getElementById('match-container');
            container.innerHTML = "";
            
            let filtered = partners;
            // REGLE SS : Bloquer partenaire SS si utilisateur est SS ou AS
            if (myGt === "SS" || myGt === "AS") {
                filtered = partners.filter(p => p.gt === "AA");
                container.innerHTML = '<div class="info-bubble">✨ <b>Engagement Santé :</b> Pour protéger votre future descendance, Genlove vous propose uniquement des profils AA.</div>';
            }

            filtered.forEach(p => {
                container.innerHTML += \`
                    <div class="st-group" style="padding:15px; display:flex; align-items:center; gap:12px;">
                        <div style="width:50px; height:50px; border-radius:50%; background:#eee; filter:blur(4px);"></div>
                        <div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div>
                        <button class="btn-action btn-details" onclick='showMatchDetails(\${JSON.stringify(p)})'>Voir</button>
                    </div>\`;
            });
            showScreen('matching');
        }

        function showMatchDetails(p) {
            const myGt = localStorage.getItem('u_gt');
            document.getElementById('pop-name').innerText = "Profil #" + p.id;
            document.getElementById('pop-details').innerHTML = "<b>Génotype :</b> " + p.gt + "<br><b>Projet :</b> " + p.pj;
            
            let msg = "<b>Compatibilité Santé :</b> Votre union est analysée pour garantir un avenir sans risque.";
            if(myGt === "AA" && p.gt === "AA") msg = "<b>Union Sérénité :</b> Compatibilité génétique idéale !";
            
            document.getElementById('pop-msg').innerHTML = msg;
            document.getElementById('popup-overlay').style.display = 'flex';
        }

        function openChat() {
            document.getElementById('popup-overlay').style.display = 'none';
            showScreen('chat');
            document.getElementById('security-popup').style.display = 'flex';
        }

        function closeSecurityPopup() {
            document.getElementById('security-popup').style.display = 'none';
            startTimer();
        }

        function startTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let mins = Math.floor(timeLeft / 60);
                let secs = timeLeft % 60;
                document.getElementById('timer-display').innerText = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;

                if ([60, 40, 20].includes(timeLeft)) {
                    document.getElementById('lastMinuteSound').play().catch(()=>{});
                }
                if (timeLeft <= 0) { 
                    clearInterval(timerInterval); 
                    alert("Session terminée pour votre sécurité.");
                    location.reload();
                }
            }, 1000);
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
app.listen(port, () => console.log('Genlove App running on port ' + port));
