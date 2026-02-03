const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLES (Socle de la partie 1 + Chat) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }

    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; display:none; }
    .active-page { display: block; }
    
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; border:none; cursor:pointer;}
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }

    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; }

    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; height: 60vh; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; font-size: 0.95rem; }
    .received { background: #e2ecf7; align-self: flex-start; border-bottom-left-radius: 2px; }
    .sent { background: #ff416c; color: white; align-self: flex-end; border-bottom-right-radius: 2px; }
    .input-area { padding: 10px 15px 40px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
    
    #security-popup { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 2000; justify-content: center; align-items: center; padding: 20px; }
</style>
`;

const genloveApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    ${styles}
</head>
<body>
    <audio id="lastMinuteSound" preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg">
    </audio>

    <div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>

        <div id="page-home" class="page-white active-page" style="background: #f4e9da; border:none;">
            <div class="home-screen">
                <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
                <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
                <div style="width:100%; margin-top:20px;">
                    <button class="btn-dark" style="width:100%" onclick="goTo('signup')">➔ Créer un compte</button>
                    <button class="btn-dark" style="width:100%; background:#7ca9e6;" onclick="goTo('profile')">➔ Se connecter</button>
                </div>
            </div>
        </div>

        <div id="page-signup" class="page-white">
            <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
            <form onsubmit="handleSignup(event)">
                <div class="photo-circle" id="photo-p" onclick="document.getElementById('file-i').click()"><span id="photo-t">📸 Photo *</span></div>
                <input type="file" id="file-i" style="display:none" onchange="previewImg(event)">
                <input type="text" id="fname" class="input-box" placeholder="Prénom" required>
                <select id="genotype" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                <input type="text" id="residence" class="input-box" placeholder="Résidence actuelle" required>
                <div class="serment-container"><input type="checkbox" required><label class="serment-text">Je confirme sur l'honneur la sincérité de mes résultats médicaux.</label></div>
                <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
            </form>
        </div>

        <div id="page-profile" class="page-white" style="background:#f8f9fa; padding:0;">
            <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
                <div id="view-photo" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:0 auto 20px; background-size:cover;"></div>
                <h2 id="view-name">Utilisateur</h2>
                <p id="view-res" style="color:#666; font-size:0.9rem;">📍 Localisation</p>
                <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px; text-align:left; font-size:0.8rem; color:#888; font-weight:bold;">MES DONNÉES</div>
            <div class="st-group"><div class="st-item"><span>Génotype</span><b id="view-gt">...</b></div></div>
            <button class="btn-dark" onclick="startMatching()">🔍 Trouver un partenaire</button>
        </div>

        <div id="page-matching" class="page-white" style="background:#f4f7f6; padding:0;">
            <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3>Partenaires</h3></div>
            <div id="match-list" style="padding-bottom:20px;"></div>
            <button class="btn-pink" onclick="goTo('profile')">Retour</button>
        </div>

        <div id="page-chat" class="page-white" style="padding:0; display:none; flex-direction:column; height:100vh;">
            <div id="security-popup">
                <div style="background:white; border-radius:30px; padding:30px; text-align:center; width:80%;">
                    <h3>🔒 Échange Éphémère</h3>
                    <p>Pour votre protection, cette session durera 30 min maximum.</p>
                    <button class="btn-pink" style="width:100%" onclick="closeSecurity()">Démarrer</button>
                </div>
            </div>
            <div class="chat-header">
                <button onclick="location.reload()" style="background:white; border:none; padding:5px 10px; border-radius:8px;">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <div style="font-size:0.7rem; font-weight:bold;">SÉCURISÉ</div>
            </div>
            <div class="chat-messages" id="chat-box"></div>
            <div class="input-area">
                <input type="text" id="chat-msg" style="flex:1; border:1px solid #ddd; padding:12px; border-radius:25px;" placeholder="Écrire...">
                <button onclick="sendMsg()" style="background:#4a76b8; color:white; border:none; border-radius:50%; width:40px; height:40px;">➤</button>
            </div>
        </div>
    </div>

    <div id="popup-overlay" onclick="this.style.display='none'">
        <div class="popup-content" onclick="event.stopPropagation()">
            <h3 id="pop-title" style="color:#ff416c;">Détails</h3>
            <div id="pop-body"></div>
            <div id="pop-info" style="margin-top:15px; padding:10px; background:#e7f3ff; border-radius:10px; font-size:0.85rem; color:#1a2a44;"></div>
            <button class="btn-pink" style="width:100%; margin-top:15px;" onclick="openChatSim()">🚀 Contacter</button>
        </div>
    </div>

    <script>
        let imgData = localStorage.getItem('u_p') || "";
        let timeLeft = 30 * 60;
        let timerInterval;
        let selectedPartner = null;

        function goTo(id) {
            document.querySelectorAll('.page-white').forEach(p => p.classList.remove('active-page'));
            document.getElementById('page-' + id).style.display = (id === 'chat') ? 'flex' : 'block';
            document.getElementById('page-' + id).classList.add('active-page');
            if(id === 'profile') loadData();
        }

        function previewImg(e){ const r=new FileReader(); r.onload=()=>{ imgData=r.result; document.getElementById('photo-p').style.backgroundImage='url('+imgData+')'; document.getElementById('photo-t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }

        function handleSignup(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_p', imgData);
            localStorage.setItem('u_fn', document.getElementById('fname').value);
            localStorage.setItem('u_gt', document.getElementById('genotype').value);
            localStorage.setItem('u_res', document.getElementById('residence').value);
            setTimeout(() => { document.getElementById('loader').style.display='none'; goTo('profile'); }, 3000);
        }

        function loadData() {
            const p = localStorage.getItem('u_p');
            if(p) document.getElementById('view-photo').style.backgroundImage = 'url('+p+')';
            document.getElementById('view-name').innerText = localStorage.getItem('u_fn') || "Anonyme";
            document.getElementById('view-gt').innerText = localStorage.getItem('u_gt') || "N/A";
            document.getElementById('view-res').innerText = "📍 " + (localStorage.getItem('u_res') || "Lieu");
        }

        function startMatching() {
            const myGt = localStorage.getItem('u_gt');
            const partners = [
                {id:1, gt:"AA", pj:"Désire fonder une famille unie.", msg:"Ravi de te parler ! En tant que AA, je cherche une relation sereine et sans crainte pour l'avenir."},
                {id:3, gt:"SS", pj:"Cherche une relation stable.", msg:"Bonjour. Je suis touché par ton profil. Ta compatibilité AA est un vrai cadeau pour moi."}
            ];
            const list = document.getElementById('match-list');
            list.innerHTML = "";
            
            // RÈGLE SS : Automatiquement bloquer partenaire SS si utilisateur est SS ou AS
            let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
            
            if(myGt === "SS" || myGt === "AS") {
                list.innerHTML = '<div style="margin:15px; padding:15px; background:#fff5f7; color:#d63384; border-radius:12px; font-size:0.85rem; border:1px solid #ffdae0;">✨ <b>Engagement Santé :</b> Pour protéger votre descendance, nous filtrons uniquement les profils AA.</div>';
            }

            filtered.forEach(p => {
                list.innerHTML += \`
                    <div class="st-group" style="padding:15px; display:flex; align-items:center; gap:12px;">
                        <div style="width:50px; height:50px; border-radius:50%; background:#eee; filter:blur(4px);"></div>
                        <div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div>
                        <button class="btn-action" style="background:#ff416c; color:white;" onclick='showPop(\${JSON.stringify(p)})'>Voir</button>
                    </div>\`;
            });
            goTo('matching');
        }

        function showPop(p) {
            selectedPartner = p;
            document.getElementById('pop-title').innerText = "Profil #" + p.id;
            document.getElementById('pop-body').innerHTML = "<b>Génotype :</b> " + p.gt + "<br><b>Projet :</b> " + p.pj;
            document.getElementById('pop-info').innerText = "✓ Compatibilité Génétique Validée par Genlove.";
            document.getElementById('popup-overlay').style.display = 'flex';
        }

        function openChatSim() {
            document.getElementById('popup-overlay').style.display = 'none';
            goTo('chat');
            document.getElementById('security-popup').style.display = 'flex';
        }

        function closeSecurity() { 
            document.getElementById('security-popup').style.display = 'none'; 
            startTimer();
            // Premier message personnalisé du partenaire simulé
            setTimeout(() => {
                receiveMsg(selectedPartner.msg);
            }, 1000);
        }

        function startTimer() {
            if(timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let m = Math.floor(timeLeft/60), s = timeLeft%60;
                document.getElementById('timer-display').innerText = (m<10?'0':'')+m+":"+(s<10?'0':'')+s;
                if([60,40,20].includes(timeLeft)) {
                    document.getElementById('lastMinuteSound').play().catch(()=>{});
                    showNotify("Attention : Fin de session imminente.");
                }
                if(timeLeft<=0) { clearInterval(timerInterval); alert("Session expirée."); location.reload(); }
            }, 1000);
        }

        function receiveMsg(txt) {
            const d = document.createElement('div'); d.className='bubble received'; d.innerText=txt;
            document.getElementById('chat-box').appendChild(d);
            document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
        }

        function sendMsg() {
            const inp = document.getElementById('chat-msg');
            if(inp.value.trim()){
                const d = document.createElement('div'); d.className='bubble sent'; d.innerText=inp.value;
                document.getElementById('chat-box').appendChild(d);
                const userMsg = inp.value.toLowerCase();
                inp.value='';
                document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
                
                // Petite réponse automatique pour simuler l'échange
                setTimeout(() => {
                    if(userMsg.includes("bonjour") || userMsg.includes("salut")) receiveMsg("Comment vas-tu ?");
                    else receiveMsg("Je comprends tout à fait. C'est important d'en parler.");
                }, 2000);
            }
        }

        function showNotify(m) {
            const n = document.getElementById('genlove-notify');
            document.getElementById('notify-msg').innerText = m;
            n.classList.add('show');
            setTimeout(()=>n.classList.remove('show'), 3000);
        }
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(genloveApp));
app.listen(port);
