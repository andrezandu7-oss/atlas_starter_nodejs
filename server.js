const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLE GLOBAL ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; overflow-x: hidden; }
    
    /* FORMULAIRES */
    .page-container { background: white; min-height: 100vh; padding: 25px 20px; text-align: center; box-sizing: border-box; }
    .photo-wrapper { position: relative; width: 115px; height: 115px; margin: 0 auto 20px auto; }
    .photo-dash { border: 2px dashed #ff416c; width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; background-size: cover; background-position: center; font-size: 0.75rem; overflow: hidden; }
    .remove-pic { position: absolute; top: 2px; right: 2px; background: #ff416c; color: white; border-radius: 50%; width: 26px; height: 26px; display: none; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white; z-index: 10; font-weight: bold; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; }
    
    /* GENRE H/F */
    .gender-grid { display: flex; gap: 10px; margin-top: 10px; }
    .gender-opt { flex: 1; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; font-weight: bold; color: #666; }
    .gender-opt.active { border-color: #ff416c; color: #ff416c; background: #fff5f7; }

    /* CAMERA IDENTITY CHECK */
    #video-box { display: none; margin: 15px 0; position: relative; background: #000; border-radius: 15px; overflow: hidden; height: 280px; border: 3px solid #1a2a44; }
    video { width: 100%; height: 100%; object-fit: cover; }
    .timer { position: absolute; top: 10px; right: 10px; background: rgba(255, 65, 108, 0.9); color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; display: none; }
    .v-controls { position: absolute; bottom: 15px; left: 0; right: 0; display: flex; justify-content: space-around; align-items: center; }
    .rec-btn { width: 55px; height: 55px; background: white; border-radius: 50%; border: 5px solid #ff416c; cursor: pointer; position: relative; }
    .rec-btn::after { content: ""; width: 20px; height: 20px; background: #ff416c; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }

    /* PROFIL (Maquette André Zandu) */
    .profile-header { background: white; padding: 30px 20px; text-align: center; border-radius: 0 0 30px 30px; }
    .prof-img-final { width: 110px; height: 110px; border-radius: 50%; border: 3px solid #ff416c; margin: 0 auto; background-size: cover; background-position: center; }
    .info-row { display: flex; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f0f0f0; background: white; font-size: 0.95rem; }
    .info-row b { color: #1a2a44; }

    /* MATCHING GRID */
    .match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 20px; }
    .match-card { background: white; border-radius: 15px; overflow: hidden; text-align: center; padding-bottom: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .blur-img { width: 100%; height: 130px; background-size: cover; filter: blur(5px); }
    .tag-gt { background: #ff416c; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; }

    .btn-action { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 20px; }
    .btn-red { background: #ff416c; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 20px; }
</style>
`;

// --- 1. ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;">
            <h1><span style="color:#1a2a44; font-size:3.5rem;">Gen</span><span style="color:#ff416c; font-size:3.5rem;">love</span></h1>
            <p style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">L'amour qui soigne 💙</p>
            <a href="/profile" class="btn-action" style="width:100%; margin:0 0 15px 0;">➔ Se connecter</a>
            <a href="/signup" style="background:transparent; color:#1a2a44; border:1.5px solid #1a2a44; border-radius:12px; padding:18px; width:100%; font-weight:bold; text-decoration:none; display:block; box-sizing:border-box;">👤 S'inscrire</a>
        </div>
    </div></body></html>`);
});

// --- 2. INSCRIPTION ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="page-container">
        <h2 style="color:#ff416c;">Nouveau Profil</h2>
        <form onsubmit="saveUser(event)">
            <div class="photo-wrapper">
                <div class="photo-dash" id="disp" onclick="document.getElementById('file').click()">📸 Photo de profil *</div>
                <div class="remove-pic" id="x" onclick="resetPhoto(event)">✕</div>
            </div>
            <input type="file" id="file" accept="image/*" style="display:none" onchange="preview(event)" required>
            
            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <div class="gender-grid">
                <div class="gender-opt" id="m" onclick="setG('Homme')">Masculin</div>
                <div class="gender-opt" id="f" onclick="setG('Femme')">Féminin</div>
            </div>
            <input type="hidden" id="gv" required>
            <input type="date" class="input-box" id="bd" required>
            <select id="gt" class="input-box" required>
                <option value="">Génotype *</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
            </select>
            <div style="display:flex; gap:10px;">
                <select id="gs" class="input-box" required style="flex:1"><option value="">Groupe</option><option value="A">A</option><option value="B">B</option><option value="O">O</option></select>
                <select id="rh" class="input-box" required style="flex:1"><option value="">Rhésus</option><option value="+">+</option><option value="-">-</option></select>
            </div>

            <div id="video-box">
                <video id="v" autoplay muted playsinline></video>
                <div class="timer" id="tm">05s</div>
                <div class="v-controls"><button type="button" onclick="swCam()" style="background:none; border:none; color:white; font-size:1.5rem;">🔄</button><div class="rec-btn" onclick="goRec()"></div><div style="width:30px;"></div></div>
            </div>
            <div id="cBtn" onclick="onCam()" style="border:2px dashed #007bff; padding:15px; border-radius:12px; color:#007bff; font-weight:bold; margin:15px 0; cursor:pointer;">🎥 Identity Check (Obligatoire)</div>

            <button type="submit" class="btn-red" style="width:100%; border:none; margin:10px 0;">🚀 Créer mon compte</button>
        </form>
    </div></div>
    <script>
        let photoOk=false, videoOk=false, stream=null, mode="user", b64="";
        function setG(v){ document.getElementById('gv').value=v; document.getElementById('m').className='gender-opt'+(v==='Homme'?' active':''); document.getElementById('f').className='gender-opt'+(v==='Femme'?' active':''); }
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('disp').style.backgroundImage='url('+b64+')'; document.getElementById('disp').innerText=''; document.getElementById('x').style.display='flex'; photoOk=true; }; r.readAsDataURL(e.target.files[0]); }
        function resetPhoto(e){ e.stopPropagation(); document.getElementById('disp').style.backgroundImage='none'; document.getElementById('disp').innerText='📸 Photo de profil *'; document.getElementById('x').style.display='none'; photoOk=false; }
        async function onCam(){ try{ if(stream) stream.getTracks().forEach(t=>t.stop()); stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:mode}}); document.getElementById('v').srcObject=stream; document.getElementById('video-box').style.display='block'; document.getElementById('cBtn').style.display='none'; }catch(e){alert("Erreur Caméra");} }
        function swCam(){ mode=(mode==="user"?"environment":"user"); onCam(); }
        function goRec(){ document.getElementById('tm').style.display='block'; let s=5; const i=setInterval(()=>{ s--; document.getElementById('tm').innerText='0'+s+'s'; if(s<=0){ clearInterval(i); if(stream) stream.getTracks().forEach(t=>t.stop()); document.getElementById('video-box').style.display='none'; document.getElementById('cBtn').style.display='block'; document.getElementById('cBtn').innerText='✅ Vidéo Validée'; videoOk=true; } },1000); }
        function saveUser(e){ e.preventDefault(); if(!photoOk || !videoOk || !document.getElementById('gv').value) return alert("Photo, Vidéo et Genre obligatoires."); localStorage.setItem('uP', b64); localStorage.setItem('uN', document.getElementById('fn').value); localStorage.setItem('uG', document.getElementById('gt').value); window.location.href='/profile'; }
    </script></body></html>`);
});

// --- 3. PROFIL ---
app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div class="profile-header">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                <a href="/" style="color:#007bff; text-decoration:none;"> ← Accueil</a>
                <a href="/settings" style="font-size:1.4rem; text-decoration:none;">⚙️</a>
            </div>
            <div id="finP" class="prof-img-final"></div>
            <h2 id="finN" style="margin:10px 0 5px 0;">André Zandu</h2>
            <p style="color:#666; font-size:0.9rem;">35 ans • Kinshasa, RDC</p>
        </div>
        <div class="info-row"><span>Génotype</span><b id="finG">AS</b></div>
        <div class="info-row"><span>Groupe Sanguin</span><b>O+</b></div>
        <div class="info-row"><span>Antécédents</span><b>Aucun</b></div>
        <div class="info-row"><span>Allergies</span><b>Pénicilline</b></div>
        <a href="/matching" class="btn-action">Rechercher un partenaire</a>
    </div>
    <script>
        document.getElementById('finP').style.backgroundImage = 'url('+localStorage.getItem('uP')+')';
        document.getElementById('finN').innerText = localStorage.getItem('uN') || "André Zandu";
        document.getElementById('finG').innerText = localStorage.getItem('uG') || "AS";
    </script></body></html>`);
});

// --- 4. MATCHING (Avec règle SS automatique) ---
app.get('/matching', (req, res) => {
    const db = [
        {n:"Sonia", gt:"AA", gs:"O+", img:"https://randomuser.me/api/portraits/women/44.jpg"},
        {n:"Marc", gt:"AS", gs:"A-", img:"https://randomuser.me/api/portraits/men/32.jpg"},
        {n:"Leila", gt:"SS", gs:"B+", img:"https://randomuser.me/api/portraits/women/12.jpg"}
    ];
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div style="padding:20px; background:white; display:flex; align-items:center;">
            <a href="/profile" style="text-decoration:none; margin-right:15px;">←</a>
            <h3 style="margin:0;">Partenaires Compatibles</h3>
        </div>
        <div class="match-grid" id="list"></div>
    </div>
    <script>
        const myG = localStorage.getItem('uG');
        const data = ${JSON.stringify(db)};
        const list = document.getElementById('list');
        data.forEach(p => {
            if(myG === "SS" && p.gt === "SS") return; // BLOCAGE AUTOMATIQUE SS
            list.innerHTML += \`<div class="match-card">
                <div class="blur-img" style="background-image:url('\${p.img}')"></div>
                <div style="padding:10px;"><b>\${p.n}***</b><br><span class="tag-gt">\${p.gt}</span><br><small>\${p.gs}</small></div>
            </div>\`;
        });
    </script></body></html>`);
});

// --- 5. PARAMÈTRES ---
app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:20px; background:white; display:flex; align-items:center; border-bottom:1px solid #eee;">
            <a href="/profile" style="text-decoration:none; margin-right:15px;">←</a>
            <h3 style="margin:0;">Paramètres & Sécurité</h3>
        </div>
        <div style="padding:15px 20px; font-size:0.75rem; color:#888;">MISE À JOUR</div>
        <div style="background:white;">
            <div class="info-row" onclick="location.href='/signup'" style="cursor:pointer;"><span>✏️ Modifier mon profil</span><b>➔</b></div>
            <div class="info-row"><span>Statut Identity Check</span><b style="color:#007bff;">Validé ✅</b></div>
        </div>
        <a href="/" class="btn-red">Se déconnecter</a>
    </div></body></html>`);
});

app.listen(port, () => console.log('Genlove V50 - Système Complet Déployé'));
