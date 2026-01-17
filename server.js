const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- SYSTÈME DE DESIGN GENLOVE ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    .content { padding: 20px; text-align: center; flex: 1; }
    
    /* ACCUEIL (Style Image) */
    .welcome-screen { background: #f9f1e8; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; text-align: center; }
    .brand-name { font-size: 3rem; font-weight: bold; color: #1a2a44; margin: 0; }
    .brand-name span { color: #ff416c; }
    .btn-dark { background: #1a2a44; color: white; border-radius: 10px; }
    .btn-light-outline { background: white; color: #1a2a44; border: 1px solid #1a2a44; border-radius: 10px; }

    /* INSCRIPTION (Ton design préféré) */
    .photo-upload { 
        border: 2px dashed #ff416c; 
        height: 110px; width: 110px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        color: #ff416c; cursor: pointer; 
        margin: 0 auto 15px auto; 
        background-size: cover; background-position: center;
        font-size: 0.75rem; font-weight: bold;
    }
    .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 14px; margin: 8px 0; border: none; font-weight: bold; font-size: 1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; }
    .btn-main { background: #4caf50; color: white; border-radius: 10px; }
    .btn-logout { background: #f8f9fa; color: #666; border: 1px solid #eee; margin-top: 25px; border-radius: 50px; }
    
    .card { background: #f8fafc; padding: 15px; border-radius: 18px; text-align: left; margin-bottom: 15px; border: 1px solid #edf2f7; }
    label { display: block; font-size: 0.8rem; font-weight: bold; color: #555; margin-bottom: 5px; }
    input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; margin-top: 5px; box-sizing: border-box; font-size: 1rem; }
    .row { display: flex; gap: 10px; margin-bottom: 10px; }
    .video-btn { border: 2px dashed #007bff; padding: 15px; border-radius: 15px; color: #007bff; font-weight: bold; margin: 15px 0; cursor: pointer; }
    .video-success { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
</style>
`;

// --- ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <div style="margin-bottom:20px;"><svg width="80" height="80" viewBox="0 0 100 100"><path d="M50 85c-1.5 0-3-.5-4.2-1.5C32 72.5 15 56.4 15 39.5 15 27.1 25.1 17 37.5 17c5.4 0 10.5 2 12.5 5.2 2-3.2 7.1-5.2 12.5-5.2C74.9 17 85 27.1 85 39.5c0 16.9-17 33-30.8 44-1.2 1-2.7 1.5-4.2 1.5z" fill="#ff416c"/></svg></div>
        <h1 class="brand-name">Gen<span>love</span></h1>
        <p style="font-size:1.2rem; color:#1a2a44; font-weight:bold; margin-bottom:30px;">L'amour qui soigne 💙</p>
        <a href="/login" class="btn btn-dark">➔ Se connecter</a>
        <a href="/signup" class="btn btn-light-outline">👤 S'inscrire</a>
    </div></div></body></html>`);
});

// --- CONNEXION ---
app.get('/login', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <h2 style="color:#1a2a44; margin-top:50px;">Bon retour !</h2>
        <div class="card" style="margin-top:30px;"><label>Identifiant</label><input type="text" id="loginUser" placeholder="Votre prénom..."></div>
        <button onclick="checkLogin()" class="btn btn-dark" style="margin-top:20px;">Se connecter</button>
        <a href="/" style="display:block; margin-top:20px; color:#999; text-decoration:none;">⬅️ Retour</a>
    </div></div><script>function checkLogin(){if(localStorage.getItem('uData')){window.location.href='/dashboard';}else{alert("Aucun profil trouvé."); window.location.href='/signup';}}</script></body></html>`);
});

// --- INSCRIPTION (VOTRE DESIGN PRÉFÉRÉ) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c; margin-top:0;">Créer mon profil</h2>
        <form onsubmit="return validateAndSave(event)">
            <label for="pInp" id="pP" class="photo-upload">📸 Photo</label>
            <input type="file" id="pInp" accept="image/*" style="display:none" onchange="preview(event)" required>
            <div class="row">
                <div style="flex:1;"><label>Prénom</label><input type="text" id="fn" placeholder="André" required></div>
                <div style="flex:1;"><label>Nom</label><input type="text" id="ln" placeholder="Tre" required></div>
            </div>
            <div style="margin-bottom:15px;"><label>Date de naissance</label><input type="date" id="dob" required></div>
            <div class="row">
                <div style="flex:1;"><label>Groupe Sanguin</label><select id="gs" required><option value="" disabled selected>Choisir...</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select></div>
                <div style="flex:1;"><label>Rhésus</label><select id="rh" required><option value="" disabled selected>Choisir...</option><option value="+">+</option><option value="-">-</option></select></div>
            </div>
            <div class="row">
                <div style="flex:1;"><label>Génotype</label><select id="gt" required><option value="" disabled selected>Votre Génotype...</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select></div>
                <div style="flex:1;"><label>Désir d'enfant ?</label><select id="kids" required><option value="" disabled selected>Choisir...</option><option value="Oui">Oui</option><option value="Non">Non</option><option value="Neutre">Neutre</option></select></div>
            </div>
            <div class="video-btn" id="vL" onclick="document.getElementById('vI').click()">🎥 Vidéo de vérification obligatoire *</div>
            <input type="file" id="vI" accept="video/*" capture="user" style="display:none" onchange="videoDone()">
            <button type="submit" class="btn btn-main">🚀 Finaliser mon profil</button>
        </form>
    </div></div>
    <script>
        let videoUploaded = false;
        function preview(e){const r=new FileReader(); r.onload=()=>{const el=document.getElementById('pP'); el.style.backgroundImage='url('+r.result+')'; el.innerText=''; localStorage.setItem('uPhoto', r.result);}; r.readAsDataURL(e.target.files[0]);}
        function videoDone(){videoUploaded=true; const v=document.getElementById('vL'); v.innerText='✅ Vidéo enregistrée'; v.classList.add('video-success');}
        function validateAndSave(e){
            e.preventDefault(); if(!videoUploaded){alert("Vidéo obligatoire"); return false;}
            const d={fn:document.getElementById('fn').value, ln:document.getElementById('ln').value, dob:document.getElementById('dob').value, gs:document.getElementById('gs').value, rh:document.getElementById('rh').value, gt:document.getElementById('gt').value, kids:document.getElementById('kids').value};
            localStorage.setItem('uData', JSON.stringify(d)); window.location.href='/dashboard';
        }
    </script></body></html>`);
});

// --- DASHBOARD ---
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <img id="uP" src="" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; object-fit:cover; margin-top:20px;">
        <h2 id="uN">Utilisateur</h2>
        <div class="card">
            <p>🧬 <b>Génotype :</b> <span id="uG"></span></p>
            <p>🩸 <b>Groupe :</b> <span id="uGs"></span></p>
            <p>👶 <b>Désir d'enfant :</b> <span id="uK"></span></p>
        </div>
        <a href="/" class="btn btn-logout">Déconnexion</a>
    </div></div>
    <script>
        const d = JSON.parse(localStorage.getItem('uData'));
        if(d){
            document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
            document.getElementById('uG').innerText = d.gt;
            document.getElementById('uGs').innerText = 'Groupe ' + d.gs + d.rh;
            document.getElementById('uK').innerText = d.kids;
            document.getElementById('uP').src = localStorage.getItem('uPhoto');
        } else { window.location.href='/'; }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V14 Final Ready'); });
