const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLES UNIFIÉS (AVEC REPRISE EXACTE DES PARAMÈTRES ET CONFIGURATION) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; cursor: pointer; }

    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }

    /* Switch Style pour les Paramètres */
    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }

    /* Chat UI (Code 2) */
    .screen-chat { display: none; position: fixed; inset: 0; background: white; z-index: 2000; flex-direction: column; }
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
</style>
`;

const notifyScript = `<script>function showNotify(msg){ const n=document.getElementById('genlove-notify'); document.getElementById('notify-msg').innerText=msg; n.classList.add('show'); setTimeout(()=>n.classList.remove('show'),3000); }</script>`;

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:30px;">
    <div style="font-size:3.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
    <div style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé pour bâtir des couples sains</div>
    <a href="/profile" class="btn-dark" style="width:100%">➔ Se connecter</a>
    <a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; margin-top:15px;">👤 Créer un compte</a>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div>
    <div class="page-white"><h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
    <form onsubmit="save(event)">
        <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
        <input type="file" id="i" style="display:none" onchange="preview(event)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
        <input type="text" id="ln" class="input-box" placeholder="Nom" required>
        <select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select>
        <input type="date" id="dob" class="input-box" required>
        <input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required>
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <div style="display:flex; gap:10px;">
            <select id="gs_type" class="input-box" style="flex:2;" required><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
            <select id="gs_rh" class="input-box" style="flex:1;" required><option>+</option><option>-</option></select>
        </div>
        <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
        <div class="serment-container"><input type="checkbox" id="oath" required><label for="oath" class="serment-text">Je confirme sur l'honneur que les informations sont sincères et conformes à mes résultats médicaux.</label></div>
        <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
        let b64 = "";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        function save(e){ 
            e.preventDefault(); 
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_gender', document.getElementById('gender').value);
            localStorage.setItem('u_dob', document.getElementById('dob').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            setTimeout(() => { window.location.href='/profile'; }, 5000); 
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
    <div style="display:flex; justify-content:space-between; align-items:center;"><a href="/" style="text-decoration:none;">🏠 Accueil</a><a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a></div>
    <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
    <h2 id="vN" style="margin:5px 0;">Utilisateur</h2><p id="vR" style="color:#666; font-size:0.9rem;">📍 Localisation</p><p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p></div>
    <div class="st-group">
        <div class="st-item"><span>Génotype</span><b id="rG">...</b></div>
        <div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div>
        <div class="st-item"><span>Projet de vie</span><b id="rP">...</b></div>
    </div>
    <a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a></div>
    <script>
        document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        document.getElementById('vN').innerText = localStorage.getItem('u_fn') + " " + localStorage.getItem('u_ln');
        document.getElementById('vR').innerText = "📍 " + localStorage.getItem('u_res');
        document.getElementById('rG').innerText = localStorage.getItem('u_gt');
        document.getElementById('rS').innerText = localStorage.getItem('u_gs');
        document.getElementById('rP').innerText = "Enfant : " + localStorage.getItem('u_pj');
    </script></body></html>`);
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f4f7f6;"><div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div style="padding:25px; background:white; text-align:center;"><div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div></div>
        <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">CONFIDENTIALITÉ</div>
        <div class="st-group">
            <div class="st-item"><span>Visibilité profil</span><label class="switch"><input type="checkbox" checked onchange="showNotify('Paramètre mis à jour !')"><span class="slider"></span></label></div>
        </div>
        <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">COMPTE</div>
        <div class="st-group"><a href="/signup" style="text-decoration:none;" class="st-item"><span>Modifier mon profil</span><b>Modifier ➔</b></a></div>
        <div class="st-group"><div class="st-item" style="color:red; font-weight:bold;">Supprimer mon compte</div><div style="display:flex; justify-content:space-around; padding:15px;">
        <button onclick="localStorage.clear(); location.href='/';" style="background:#1a2a44; color:white; border:none; padding:10px 25px; border-radius:10px;">Oui</button>
        <button onclick="showNotify('Action annulée')" style="background:#eee; padding:10px 25px; border-radius:10px; border:none;">Non</button></div></div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div>${notifyScript}</body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f4f7f6;"><div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div style="padding:20px; background:white; text-align:center;"><h3>Partenaires Compatibles</h3></div>
        <div id="match-container"></div>
        <a href="/profile" class="btn-pink">Retour</a>

        <div id="chat-screen" class="screen-chat">
            <div id="security-popup" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:3000; justify-content:center; align-items:center; padding:20px;">
                <div style="background:white; border-radius:30px; padding:35px 25px; text-align:center; color:#333;"><h3>🔒 Echange Sécurisé</h3><p>Session de 30 minutes maximum.</p><button class="btn-dark" onclick="closeSec()">Démarrer</button></div>
            </div>
            <div class="chat-header"><button onclick="location.reload()" style="border:none; background:white; border-radius:8px;">✕</button><div class="digital-clock">❤️ <span id="timer">30:00</span></div><div></div></div>
            <div class="chat-messages" id="box"><div class="bubble received">Bonjour ! Je suis Sarah. Ton profil correspond à mes valeurs.</div></div>
            <div style="padding:10px; display:flex; gap:10px; background:white; position:absolute; bottom:0; width:100%; box-sizing:border-box;"><textarea id="msg" style="flex:1; border-radius:20px; padding:10px; border:1px solid #ddd;"></textarea><button onclick="sendMsg()" style="border:none; background:#4a76b8; color:white; width:45px; border-radius:50%;">➤</button></div>
        </div>

        <script>
            const partners = [{id:1, gt:"AA"}, {id:2, gt:"AS"}, {id:3, gt:"SS"}];
            const myGt = localStorage.getItem('u_gt');
            const container = document.getElementById('match-container');
            let filtered = (myGt === "SS" || myGt === "AS") ? partners.filter(p => p.gt === "AA") : partners;
            if(myGt === "SS" || myGt === "AS") container.innerHTML = '<div style="background:#e7f3ff; padding:15px; margin:15px; border-radius:12px; font-size:0.85rem; border-left:5px solid #007bff;">✨ <b>Filtre Santé :</b> Profils AA uniquement.</div>';
            filtered.forEach(p => {
                container.innerHTML += \`<div class="match-card"><div class="match-photo-blur"></div><div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div><button class="btn-dark" style="margin:0; padding:10px 15px;" onclick="openChat()">Contacter</button></div>\`;
            });

            let timeLeft = 1800;
            function openChat(){ document.getElementById('chat-screen').style.display='flex'; document.getElementById('security-popup').style.display='flex'; }
            function closeSec(){ document.getElementById('security-popup').style.display='none'; startTimer(); }
            function startTimer(){ setInterval(()=>{ timeLeft--; let m=Math.floor(timeLeft/60), s=timeLeft%60; document.getElementById('timer').innerText=(m<10?'0':'')+m+":"+(s<10?'0':'')+s; if(timeLeft<=0) location.reload(); }, 1000); }
            function sendMsg(){ const i=document.getElementById('msg'); if(i.value){ const d=document.createElement('div'); d.className='bubble sent'; d.innerText=i.value; document.getElementById('box').appendChild(d); i.value=''; } }
        </script>
    </div>${notifyScript}</body></html>`);
});

app.listen(port);
             
