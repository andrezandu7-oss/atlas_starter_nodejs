const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- DESIGN GLOBAL UNIFIÉ (V25 ORIGINAL) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* ACCUEIL */
    .welcome-screen { background: #f4e9da; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; box-sizing: border-box; }
    .btn-dark { background: #1a2a44; color: white; border-radius: 12px; text-decoration: none; width: 100%; padding: 18px; font-weight: bold; margin-bottom: 15px; display: block; }
    .btn-outline { background: white; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 12px; text-decoration: none; width: 100%; padding: 18px; font-weight: bold; display: block; }

    /* INSCRIPTION (FIDÈLE À TES IMAGES) */
    .content { padding: 20px; text-align: center; }
    .photo-circle { border: 2px dashed #ff416c; height: 150px; width: 150px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; margin: 0 auto 20px auto; background-size: cover; background-position: center; position: relative; }
    .input-field { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 5px; box-sizing: border-box; font-size: 1rem; }
    .row { display: flex; gap: 10px; }
    label { display: block; font-size: 0.8rem; font-weight: bold; color: #555; margin-top: 12px; text-align: left; }
    
    /* BOUTON VIDÉO (IMAGE 2) */
    .video-btn { border: 2px dashed #007bff; padding: 12px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 20px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    
    /* BOUTON FINALISER (IMAGE 2) */
    .btn-pink-final { background: #ff416c; color: white; border: none; width: 100%; padding: 18px; border-radius: 50px; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-top: 10px; }

    /* DASHBOARD */
    .med-badge { display: flex; justify-content: space-around; background: #1a2a44; color: white; padding: 15px; border-radius: 15px; margin: 20px 0; }
    .med-val { font-size: 1.2rem; font-weight: bold; color: #ff416c; display: block; }
    .med-lab { font-size: 0.7rem; opacity: 0.8; text-transform: uppercase; }
</style>
`;

// --- 1. ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <h1 style="font-size:3.2rem; color:#1a2a44; margin:0;">Gen<span style="color:#ff416c;">love</span></h1>
        <p style="font-weight:bold; color:#1a2a44; margin:5px 0 25px 0;">L'amour qui soigne 💙</p>
        <p style="color: #2d4059; margin-bottom: 40px;">⭐ <b>Bienvenue sur Genlove !</b><br><br>Unissez cœur et santé pour bâtir des couples solides ❤️</p>
        <a href="/signup" class="btn-dark">👤 S'inscrire</a>
        <a href="/" class="btn-outline">➔ Se connecter</a>
    </div></div></body></html>`);
});

// --- 2. INSCRIPTION ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c; margin-bottom:25px;">Mon Profil Médical</h2>
        <form onsubmit="save(event)">
            <div class="photo-circle" id="circ" onclick="document.getElementById('pI').click()">
                <span id="txt">📸 Photo *</span>
            </div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="up(event)">
            
            <input type="text" id="fn" class="input-field" placeholder="Prénom" required>
            
            <select id="gt" class="input-field" style="margin-top:15px;">
                <option value="AA">AA</option>
                <option value="AS">AS</option>
                <option value="SS">SS</option>
            </select>

            <div class="video-btn" id="vB" onclick="vOk()">🎥 Vidéo de vérification *</div>

            <button type="submit" class="btn-pink-final">🚀 Finaliser</button>
        </form>
    </div></div>
    <script>
        let vReady = false;
        function up(e){ const r=new FileReader(); r.onload=()=>{ localStorage.setItem('uImg',r.result); document.getElementById('circ').style.backgroundImage='url('+r.result+')'; document.getElementById('txt').innerText=''; }; r.readAsDataURL(e.target.files[0]); }
        function vOk(){ vReady=true; document.getElementById('vB').innerText='✅ Vidéo OK'; document.getElementById('vB').style.color='#4caf50'; document.getElementById('vB').style.borderColor='#4caf50'; }
        function save(e){
            e.preventDefault();
            if(!localStorage.getItem('uImg') || !vReady){ alert("Photo et Vidéo requises"); return; }
            const d = { fn:document.getElementById('fn').value, gt:document.getElementById('gt').value };
            localStorage.setItem('uData', JSON.stringify(d));
            window.location.href='/dashboard';
        }
    </script></body></html>`);
});

// --- 3. DASHBOARD (PROFIL ENREGISTRÉ) ---
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <div style="background:#f0fff4; padding:15px; border-radius:15px; color:#2f855a; margin-bottom:20px; font-weight:bold;">🎉 Profil enregistré avec succès !</div>
        <div id="resPic" style="width:130px; height:130px; border-radius:50%; border:4px solid #ff416c; margin:0 auto 15px auto; background-size:cover; background-position:center;"></div>
        <h2 id="resName" style="color:#1a2a44; margin:0;"></h2>
        
        <div class="med-badge">
            <div class="med-item"><span class="med-lab">Génotype</span><span id="resGt" class="med-val"></span></div>
        </div>

        <button class="btn-dark" style="background:#ff416c; border:none; width:100%;">🔍 Trouver un partenaire</button>
    </div></div>
    <script>
        const d = JSON.parse(localStorage.getItem('uData'));
        const p = localStorage.getItem('uImg');
        if(d && p){
            document.getElementById('resPic').style.backgroundImage = 'url('+p+')';
            document.getElementById('resName').innerText = d.fn;
            document.getElementById('resGt').innerText = d.gt;
        } else { window.location.href='/signup'; }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V25 - Retour à la base stable'); });
           
