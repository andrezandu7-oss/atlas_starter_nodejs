const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// === TOUS TES STYLES ORIGINAUX (CONSERVÉS À 100%) ===
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; overflow-x: hidden; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    #genlove-notify { position: fixed; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
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
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; border:none; cursor:pointer;}
    
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; animation: slideUp 0.3s ease-out; }
    .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px; }

    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }

    /* STYLE CHAT SÉCURISÉ PARTIE 2 */
    .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; }
    .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
</style>
`;

const notifyScript = `<script>function showNotify(msg){ const n=document.getElementById('genlove-notify'); document.getElementById('notify-msg').innerText=msg; n.classList.add('show'); setTimeout(()=>n.classList.remove('show'),3000); }</script>`;

// === ROUTES ===

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification médicale en cours.</p></div><div class="page-white" id="main-content"><h2>Configuration Santé</h2>
    <form onsubmit="saveData(event)">
        <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
        <input type="file" id="i" style="display:none" onchange="preview(event)">
        <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
        <input type="text" id="ln" class="input-box" placeholder="Nom" required>
        <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
        <div style="display:flex; gap:10px;"><select id="gs" class="input-box" style="flex:2;"><option>Groupe Sanguin</option><option>A</option><option>B</option><option>AB</option><option>O</option></select><select id="rh" class="input-box" style="flex:1;"><option>+</option><option>-</option></select></div>
        <div class="serment-container"><input type="checkbox" id="oath" required><label class="serment-text">Je confirme sur l'honneur la sincérité de ces résultats.</label></div>
        <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
        let b64=""; function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        function saveData(e){ e.preventDefault(); document.getElementById('loader').style.display='flex'; localStorage.setItem('u_fn', document.getElementById('fn').value); localStorage.setItem('u_gt', document.getElementById('gt').value); localStorage.setItem('u_p', b64); setTimeout(()=>location.href='/profile', 4000); }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px;">
        <div style="display:flex; justify-content:space-between; align-items:center;"><a href="/" style="text-decoration:none;">🏠</a><a href="/settings" style="text-decoration:none; font-size:1.5rem;">⚙️</a></div>
        <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
        <h2 id="vN">Utilisateur</h2><p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
    </div>
    <div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG">...</b></div></div>
    <a href="/matching" class="btn-dark" style="text-decoration:none; text-align:center; display:block;">🔍 Trouver un partenaire</a>
    <script>
        document.getElementById('vN').innerText = localStorage.getItem('u_fn') || "Utilisateur";
        document.getElementById('rG').innerText = localStorage.getItem('u_gt') || "N/A";
        const p = localStorage.getItem('u_p'); if(p) document.getElementById('vP').style.backgroundImage='url('+p+')';
    </script></div></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
    <div style="padding:20px;"><h3>Partenaires Compatibles</h3></div>
    <div id="match-container"></div>
    <div id="popup-overlay" onclick="this.style.display='none'">
        <div class="popup-content" onclick="event.stopPropagation()">
            <h3 id="pop-name" style="color:#ff416c;">Détails</h3>
            <div id="pop-details"></div><div id="pop-msg" class="popup-msg"></div>
            <button class="btn-pink" onclick="checkRedirect()">🚀 Contacter</button>
        </div>
    </div>
    <script>
        let currentP = null;
        const partners = [{id:1, n:"Sarah", gt:"AA", pj:"Fonder une famille."}, {id:2, n:"Marc", gt:"SS", pj:"Relation stable."}];
        const myGt = localStorage.getItem('u_gt');
        const container = document.getElementById('match-container');
        
        partners.forEach(p => {
            container.innerHTML += \`<div class="match-card"><div style="flex:1"><b>\${p.n}</b><br><small>Génotype \${p.gt}</small></div><button class="btn-dark" style="padding:10px; margin:0;" onclick='showP(\${JSON.stringify(p)})'>Détails</button></div>\`;
        });

        function showP(p){
            currentP = p;
            document.getElementById('pop-name').innerText = p.n;
            document.getElementById('pop-details').innerHTML = "<b>Génotype:</b> "+p.gt+"<br><b>Projet:</b> "+p.pj;
            document.getElementById('popup-overlay').style.display='flex';
        }

        function checkRedirect(){
            if(myGt === 'SS' && currentP.gt === 'SS') { showNotify("Action bloquée : Union SS+SS non recommandée."); }
            else { location.href = '/chat'; }
        }
    </script>${notifyScript}</div></body></html>`);
});

app.get('/chat', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell">
    <div class="chat-header">
        <button onclick="location.href='/matching'" style="border:none; background:white; border-radius:5px; padding:5px 10px;">✕</button>
        <div class="digital-clock">❤️ 30:00</div>
        <button onclick="location.href='/'" style="background:#1a2a44; color:white; border:none; padding:8px; border-radius:8px;">Logout</button>
    </div>
    <div class="chat-messages" id="box"><div class="bubble received">Bonjour ! Ton profil correspond à mes attentes. 👋</div></div>
    <div style="padding:15px; display:flex; gap:10px; background:white; border-top:1px solid #eee;">
        <input type="text" id="m" style="flex:1; padding:12px; border-radius:20px; border:1px solid #ddd;" placeholder="Message...">
        <button onclick="send()" style="background:#1a2a44; color:white; border:none; width:45px; height:45px; border-radius:50%;">➤</button>
    </div>
    <script>
        function send(){
            const i=document.getElementById('m'), b=document.getElementById('box');
            if(i.value){
                const d=document.createElement('div'); d.className='bubble sent'; d.innerText=i.value;
                b.appendChild(d); i.value=''; b.scrollTop=b.scrollHeight;
            }
        }
    </script></div></body></html>`);
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="page-white"><h3>Paramètres</h3><div class="st-group"><div class="st-item" onclick="localStorage.clear(); location.href='/';" style="color:red; cursor:pointer;">Déconnexion 🔒</div></div><a href="/profile" class="btn-pink">Retour</a></div></div></body></html>`);
});

app.listen(port, () => console.log("Genlove Live sur " + port));
