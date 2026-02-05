const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());

// --- SYSTÈME DE DESIGN FUSIONNÉ ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s; z-index: 9999; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; text-decoration: none; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; display: block; margin: 15px; border: none; text-decoration: none; cursor: pointer; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: left; }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }
    .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: monospace; font-weight: bold; }
    .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; font-size: 0.9rem; line-height: 1.4; }
    .received { background: #e2ecf7; align-self: flex-start; }
    .sent { background: #ff416c; color: white; align-self: flex-end; }
</style>
`;

// --- LOGIQUE DES ROUTES ---

app.get('/', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell"><div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;">
    <h1 style="font-size:3.5rem; margin:0;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></h1>
    <p style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé</p>
    <a href="/signup" class="btn-pink">Créer mon compte</a>
    <a href="/profile" class="btn-dark">Accéder à mon profil</a>
    <p style="font-size:0.7rem; color:#666; margin-top:20px;">Données sécurisées et confidentielles 🔒</p>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse médicale...</h3></div>
    <div class="page-white"><h2>Configuration</h2>
    <form onsubmit="save(event)">
    <div class="photo-circle" id="pc" onclick="document.getElementById('fi').click()">📸 Photo</div><input type="file" id="fi" style="display:none" onchange="prev(event)">
    <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
    <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
    <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
    <div style="margin-top:20px; font-size:0.8rem; text-align:left; background:#fff5f7; padding:10px; border-radius:10px; color:#d63384;">
    <input type="checkbox" required> Je certifie l'exactitude de mes résultats médicaux.</div>
    <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
    </form></div></div>
    <script>
    let b64=""; function prev(e){const r=new FileReader();r.onload=()=>{b64=r.result;document.getElementById('pc').style.backgroundImage='url('+b64+')';document.getElementById('pc').innerText=''};r.readAsDataURL(e.target.files[0]);}
    function save(e){e.preventDefault();document.getElementById('loader').style.display='flex';localStorage.setItem('u_p',b64);localStorage.setItem('u_fn',document.getElementById('fn').value);localStorage.setItem('u_gt',document.getElementById('gt').value);setTimeout(()=>location.href='/profile',3000);}
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell"><div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px;">
    <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:0 auto 15px; background-size:cover; background-position:center;"></div>
    <h2 id="vN" style="margin:0;">...</h2><p style="color:#007bff; font-weight:bold; margin-top:5px;">Profil Santé Validé ✅</p></div>
    <div style="padding:20px;"><div class="match-card" style="justify-content:space-between;"><span>Génotype</span><b id="vG">...</b></div>
    <a href="/matching" class="btn-dark">🔍 Trouver un partenaire compatible</a>
    <a href="/" style="display:block; text-align:center; color:#666; text-decoration:none; margin-top:10px;">Se déconnecter</a></div></div>
    <script>
    document.getElementById('vP').style.backgroundImage='url('+localStorage.getItem('u_p')+')';
    document.getElementById('vN').innerText=localStorage.getItem('u_fn');
    document.getElementById('vG').innerText=localStorage.getItem('u_gt');
    </script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell">
    <div id="view-list">
        <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3>Partenaires Compatibles</h3></div>
        <div id="list"></div><a href="/profile" class="btn-pink">Retour au profil</a>
    </div>
    <div id="view-chat" style="display:none; flex-direction:column; height:100vh;">
        <div style="background:#9dbce3; color:white; padding:12px 15px; display:flex; justify-content:space-between; align-items:center;">
            <button onclick="location.reload()" style="background:white; border:none; border-radius:5px; padding:5px 10px; color:#9dbce3; font-weight:bold;">✕</button>
            <div class="digital-clock">⏳ <span id="timer">30:00</span></div>
            <b id="chat-name">...</b>
        </div>
        <div id="box" style="flex:1; padding:15px; display:flex; flex-direction:column; gap:10px; overflow-y:auto; background:#f8fafb;">
            <div class="bubble received">Bonjour ! Ton profil correspond à mes critères santé. Échangeons ! 👋</div>
        </div>
        <div style="padding:15px; background:white; display:flex; gap:10px; border-top:1px solid #eee;">
            <input id="msg" style="flex:1; padding:12px; border-radius:25px; border:1px solid #ddd; outline:none;" placeholder="Écrire...">
            <button onclick="send()" style="background:#1a2a44; color:white; border:none; width:45px; height:45px; border-radius:50%; cursor:pointer;">➤</button>
        </div>
    </div>
    </div>
    <script>
    const myGt=localStorage.getItem('u_gt');
    const pts=[{n:"Sarah",gt:"AA"},{n:"Marc",gt:"AS"},{n:"Léa",gt:"SS"}];
    const container=document.getElementById('list');
    let filtered=pts;

    // RÈGLE DÉFINITIVE : BLOQUER PARTENAIRE SS SI UTILISATEUR EST SS
    if(myGt==="SS" || myGt==="AS") {
        filtered=pts.filter(p=>p.gt==="AA");
        container.innerHTML='<div style="background:#e7f3ff; color:#1a2a44; padding:15px; margin:15px; border-radius:12px; font-size:0.85rem; border-left:5px solid #007bff;">🛡️ <b>Engagement Genlove :</b> Pour garantir une descendance saine, nous vous présentons exclusivement des profils AA.</div>';
    }

    filtered.forEach(p=>{
        container.innerHTML+='<div class="match-card"><div class="match-photo-blur"></div><div style="flex:1"><b>'+p.n+'</b><br><small>Génotype '+p.gt+'</small></div><button class="btn-dark" style="margin:0; padding:10px 15px; font-size:0.8rem;" onclick="startChat(\\"'+p.n+'\\")">Contacter</button></div>';
    });

    function startChat(name){
        document.getElementById('view-list').style.display='none';
        document.getElementById('view-chat').style.display='flex';
        document.getElementById('chat-name').innerText=name;
        let t=1800;
        setInterval(()=>{
            t--; let m=Math.floor(t/60), s=t%60;
            document.getElementById('timer').innerText=(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
            if(t<=0) location.reload();
        },1000);
    }
    function send(){
        const i=document.getElementById('msg'); if(!i.value.trim()) return;
        const d=document.createElement('div'); d.className='bubble sent'; d.innerText=i.value;
        document.getElementById('box').appendChild(d); i.value='';
        document.getElementById('box').scrollTop=document.getElementById('box').scrollHeight;
    }
    </script></body></html>`);
});

app.listen(port, () => console.log('Genlove Fusionné - Prêt sur le port ' + port));
