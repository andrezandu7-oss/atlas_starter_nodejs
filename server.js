const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
    .app-shell { width: 100%; max-width: 450px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .screen { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; z-index: 10; padding-bottom: 40px; }
    .active { display: flex; }

    /* NOTIFY & LOADER */
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 200; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* BOUTONS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; width: 85%; margin: 20px auto; border: none; cursor: pointer; display: block; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; width: 80%; margin: 10px auto; border: none; cursor: pointer; display: block; }
    .btn-green { background: #28a745; color: white; border: none; padding: 15px; border-radius: 10px; width: 90%; margin: 10px 5%; font-weight: bold; cursor: pointer; }

    /* FORMULAIRE */
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }

    /* CHAT */
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">${styles}</head><body>
    <audio id="lastMinuteSound" preload="auto"><source src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" type="audio/ogg"></audio>
    <div class="app-shell">
        <div id="genlove-notify"><span>📩</span><span id="notify-msg"></span></div>
        <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div>

        <div id="scr-home" class="screen active" style="background:#f4e9da;">
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;">
                <div style="font-size: 3.5rem; font-weight: bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
                <button class="btn-dark" onclick="checkAuth()">➔ Se connecter</button>
                <button class="btn-pink" onclick="showSignup()">👤 Créer un compte</button>
            </div>
        </div>

        <div id="scr-signup" class="screen" style="padding:20px;">
            <h2 style="color:#ff416c; text-align:center;">Configuration Santé</h2>
            <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
            <input type="file" id="i" style="display:none" onchange="preview(event)">
            
            <input type="text" id="fn" class="input-box" placeholder="Prénom">
            <input type="date" id="dob" class="input-box">
            <input type="text" id="res" class="input-box" placeholder="Résidence actuelle">
            <select id="gt" class="input-box"><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
            
            <div style="display:flex; gap:10px;">
                <select id="gs_type" class="input-box" style="flex:2;"><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                <select id="gs_rh" class="input-box" style="flex:1;"><option>+</option><option>-</option></select>
            </div>
            <select id="pj" class="input-box"><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>

            <div style="margin-top:20px; padding:15px; background:#fff5f7; border-radius:12px; border:1px solid #ffdae0; display:flex; gap:10px;">
                <input type="checkbox" id="oath" style="width:25px;height:25px;">
                <label for="oath" style="font-size:0.85rem; color:#d63384;">Je confirme sur l'honneur la véracité de ces données médicales.</label>
            </div>
            
            <button class="btn-pink" id="btn-save" onclick="saveProfile()">🚀 Valider mon profil</button>
            <div style="height:50px;"></div> </div>

        <div id="scr-profile" class="screen" style="background:#f8f9fa;">
            <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px; position:relative;">
                <button onclick="showScreen('scr-settings')" style="border:none; background:none; cursor:pointer; position:absolute; top:20px; right:20px; font-size:1.4rem;">⚙️</button>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
                <h2 id="vN">Nom</h2>
                <p id="vAgeLoc" style="color:#666; margin:0 0 10px 0;">-- ans • --</p>
                <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px 20px 5px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
            <div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG" style="color:#ff416c;">--</b></div><div class="st-item"><span>Groupe Sanguin</span><b id="rS">--</b></div></div>
            <button class="btn-dark" onclick="simulateMatch()">🔍 Lancer le Matching</button>
        </div>

        <div id="scr-confirm" class="screen" style="background:#f0f2f5; justify-content:center; align-items:center;">
            <div style="background:white; width:85%; border-radius:20px; box-shadow:0 4px 15px rgba(0,0,0,0.1); overflow:hidden; text-align:center;">
                <div style="background: #0000ff; color: white; padding: 18px; font-weight: bold;">Genlove - confirmation</div>
                <div style="padding: 30px 25px;">
                    <p style="font-size: 1.1rem; margin-bottom: 25px;">Accepter Sarah ? ❤️</p>
                    <button class="btn-green" onclick="showChatPopup()">Accepter</button>
                    <button class="btn-dark" style="background:none; color:#dc3545; border:1px solid #dc3545;" onclick="showScreen('scr-profile')">Rejeter</button>
                </div>
            </div>
        </div>

        <div id="scr-chat" class="screen">
            <div id="security-popup" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:1000; justify-content:center; align-items:center; padding:20px;">
                <div style="background:white; border-radius:30px; padding:30px; text-align:center; width:85%;">
                    <h3>🔒 Espace privé</h3>
                    <p>Tout s'efface dans 30 min. Aucun historique n'est conservé.</p>
                    <button class="btn-pink" onclick="closePopup()">Démarrer l'échange</button>
                </div>
            </div>
            <div class="chat-header">
                <button onclick="showScreen('scr-profile')" style="border:none; background:white; border-radius:8px; padding:5px 10px;">✕</button>
                <div class="digital-clock">❤️ <span id="timer-display">30:00</span></div>
                <button onclick="location.reload()" style="background:#1a2a44; color:white; border:none; padding:8px; border-radius:8px; font-size:0.7rem;">Logout</button>
            </div>
            <div class="chat-messages" id="box"><div class="bubble received">Bonjour ! 👋</div></div>
            <div class="input-area" style="padding:10px; display:flex; gap:5px; background:white; border-top:1px solid #eee;">
                <textarea id="msg" class="input-box" style="flex:1; margin:0;" placeholder="Message..."></textarea>
                <button class="btn-dark" style="width:auto; margin:0; padding:10px 15px;" onclick="send()">➤</button>
            </div>
        </div>

        <div id="scr-settings" class="screen" style="background:#f4f7f6;">
            <div style="padding:25px; background:white; text-align:center;"><div style="font-size:2rem; font-weight:bold;">Genlove</div></div>
            <div class="st-group"><div class="st-item" onclick="showSignup()"><span>Modifier mon profil</span><b>Modifier ➔</b></div></div>
            <button class="btn-pink" onclick="showScreen('scr-profile')">Retour</button>
        </div>
    </div>

    <script>
        let timeLeft = 30 * 60; let timerInterval;
        function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
        
        function calculateAge(dob) {
            if(!dob) return "--";
            const birth = new Date(dob); const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
            return age;
        }

        function showSignup() {
            document.getElementById('fn').value = localStorage.getItem('u_fn') || "";
            document.getElementById('dob').value = localStorage.getItem('u_dob') || "";
            document.getElementById('res').value = localStorage.getItem('u_res') || "";
            document.getElementById('gt').value = localStorage.getItem('u_gt') || "";
            showScreen('scr-signup');
        }

        let b64 = localStorage.getItem('u_p') || "";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }

        function saveProfile() {
            if(!document.getElementById('oath').checked) return alert("Veuillez signer le serment.");
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_dob', document.getElementById('dob').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            localStorage.setItem('u_p', b64);
            setTimeout(() => { document.getElementById('loader').style.display='none'; updateUI(); showScreen('scr-profile'); }, 2000);
        }

        function updateUI() {
            document.getElementById('vN').innerText = localStorage.getItem('u_fn') || "Utilisateur";
            document.getElementById('vAgeLoc').innerText = calculateAge(localStorage.getItem('u_dob')) + " ans • " + (localStorage.getItem('u_res') || "Lieu");
            document.getElementById('rG').innerText = localStorage.getItem('u_gt') || "--";
            document.getElementById('rS').innerText = localStorage.getItem('u_gs') || "--";
            if(localStorage.getItem('u_p')) document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        }

        function simulateMatch() {
            const n = document.getElementById('genlove-notify');
            document.getElementById('notify-msg').innerText = "📩 Compatible : Sarah souhaite échanger !";
            n.classList.add('show');
            setTimeout(() => { n.classList.remove('show'); showScreen('scr-confirm'); }, 2000);
        }

        function showChatPopup() { showScreen('scr-chat'); document.getElementById('security-popup').style.display='flex'; }
        function closePopup() { document.getElementById('security-popup').style.display='none'; startTimer(); }

        function startTimer() {
            if(timerInterval) return;
            timerInterval = setInterval(() => {
                timeLeft--;
                let m = Math.floor(timeLeft/60), s = timeLeft%60;
                document.getElementById('timer-display').innerText = (m<10?'0':'')+m+":"+(s<10?'0':'')+s;
                if([60,40,20,5].includes(timeLeft)) { document.getElementById('lastMinuteSound').play(); if(navigator.vibrate) navigator.vibrate(200); }
                if(timeLeft<=0) { clearInterval(timerInterval); location.reload(); }
            }, 1000);
        }

        function send() {
            const m = document.getElementById('msg'); if(!m.value.trim()) return;
            const d = document.createElement('div'); d.className='bubble sent'; d.innerText=m.value;
            document.getElementById('box').appendChild(d); m.value='';
            document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight;
        }

        function checkAuth() { if(localStorage.getItem('u_fn')) { updateUI(); showScreen('scr-profile'); } else showSignup(); }
        window.onload = () => { if(localStorage.getItem('u_fn')) updateUI(); };
    </script>
</body></html>`);
});

app.listen(port);
