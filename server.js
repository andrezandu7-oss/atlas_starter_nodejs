const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* --- 1. DESIGN ACCUEIL PREMIUM (Fidèle à ton image) --- */
    .welcome-screen { background: #f4e9da; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; box-sizing: border-box; }
    .brand-name { font-size: 3.2rem; font-weight: bold; color: #1a2a44; margin: 0; }
    .brand-name span { color: #ff416c; }
    .slogan { font-size: 1.2rem; color: #1a2a44; font-weight: bold; margin: 5px 0 25px 0; }
    .btn-dark-welcome { background: #1a2a44; color: white; border-radius: 12px; text-decoration: none; width: 100%; padding: 18px; font-weight: bold; margin-bottom: 15px; display: block; font-size: 1.1rem; }
    .btn-outline-welcome { background: white; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 12px; text-decoration: none; width: 100%; padding: 18px; font-weight: bold; display: block; font-size: 1.1rem; }

    /* --- 2. DESIGN INSCRIPTION (Ton design préféré) --- */
    .content { padding: 25px; text-align: center; }
    .photo-container { position: relative; width: 130px; margin: 0 auto 25px auto; }
    .photo-circle { 
        border: 2px dashed #ff416c; 
        height: 130px; width: 130px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        color: #ff416c; cursor: pointer; 
        background-size: cover; background-position: center;
        background-color: #fff;
        font-size: 0.85rem; font-weight: bold;
    }
    .photo-circle.filled { border-style: solid; border-width: 3px; }
    .del-badge { position: absolute; top: 0; right: 0; background: #ff416c; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-weight: bold; display: none; }

    .input-field { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; box-sizing: border-box; margin-top: 5px; }
    label { display: block; font-size: 0.85rem; font-weight: bold; color: #555; margin-top: 15px; text-align: left; }
    .row { display: flex; gap: 12px; }
    
    .video-btn { border: 2px dashed #007bff; padding: 15px; border-radius: 15px; color: #007bff; font-weight: bold; margin: 25px 0; cursor: pointer; }
    .video-done { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
    .btn-green-final { background: #4caf50; color: white; border: none; width: 100%; padding: 18px; border-radius: 50px; font-weight: bold; font-size: 1.2rem; cursor: pointer; margin-top: 10px; }
</style>
`;

// ROUTE ACCUEIL
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <div style="margin-bottom:20px;">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <path d="M50 85c-1.5 0-3-.5-4.2-1.5C32 72.5 15 56.4 15 39.5 15 27.1 25.1 17 37.5 17c5.4 0 10.5 2 12.5 5.2 2-3.2 7.1-5.2 12.5-5.2C74.9 17 85 27.1 85 39.5c0 16.9-17 33-30.8 44-1.2 1-2.7 1.5-4.2 1.5z" fill="#ff416c"/>
                <path d="M35 40 L65 40 M35 50 L65 50" stroke="white" stroke-width="4" stroke-linecap="round"/>
            </svg>
        </div>
        <h1 class="brand-name">Gen<span>love</span></h1>
        <p class="slogan">L'amour qui soigne 💙</p>
        <p style="color: #2d4059; margin-bottom: 40px;">⭐ <b>Bienvenue sur Genlove !</b><br><br>Unissez cœur et santé pour bâtir des couples solides ❤️</p>
        <a href="/login" class="btn-dark-welcome">➔ Se connecter</a>
        <a href="/signup" class="btn-outline-welcome">👤 S'inscrire</a>
    </div></div></body></html>`);
});

// ROUTE INSCRIPTION
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body onload="checkImg()"><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c; margin-bottom:20px;">Créer mon profil</h2>
        <form onsubmit="return validateProfile(event)">
            
            <div class="photo-container">
                <label for="pI" id="circ" class="photo-circle">📸 Photo *</label>
                <button type="button" id="dBtn" class="del-badge" onclick="clearImg()">✕</button>
            </div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="upImg(event)">
            
            <div class="row">
                <div style="flex:1;"><label>Prénom</label><input type="text" id="fn" class="input-field" required></div>
                <div style="flex:1;"><label>Nom</label><input type="text" id="ln" class="input-field" required></div>
            </div>

            <div class="row">
                <div style="flex:1;"><label>Génotype</label>
                    <select id="gt" class="input-field" required><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
                </div>
                <div style="flex:1;"><label>Désir d'enfant ?</label>
                    <select id="kd" class="input-field" required><option value="Oui">Oui</option><option value="Non">Non</option></select>
                </div>
            </div>

            <div class="video-btn" id="vB" onclick="document.getElementById('vI').click()">🎥 Vidéo de vérification obligatoire *</div>
            <input type="file" id="vI" accept="video/*" capture="user" style="display:none" onchange="vOk()">

            <button type="submit" class="btn-green-final">🚀 Finaliser mon profil</button>
        </form>
    </div></div>
    <script>
        let vReady = false;
        function checkImg(){ if(localStorage.getItem('uImg')){ setVis(localStorage.getItem('uImg')); } }
        function upImg(e){
            const r = new FileReader();
            r.onload = () => { localStorage.setItem('uImg', r.result); setVis(r.result); };
            r.readAsDataURL(e.target.files[0]);
        }
        function setVis(s){
            const c = document.getElementById('circ');
            c.style.backgroundImage = 'url('+s+')';
            c.innerText = ''; c.classList.add('filled');
            document.getElementById('dBtn').style.display = 'block';
        }
        function clearImg(){
            localStorage.removeItem('uImg');
            const c = document.getElementById('circ');
            c.style.backgroundImage = 'none';
            c.innerText = '📸 Photo *'; c.classList.remove('filled');
            document.getElementById('dBtn').style.display = 'none';
        }
        function vOk(){ vReady = true; const b = document.getElementById('vB'); b.innerText = '✅ Vidéo enregistrée'; b.classList.add('video-done'); }
        function validateProfile(e){
            e.preventDefault();
            if(!localStorage.getItem('uImg')){ alert("La photo de profil est obligatoire !"); return false; }
            if(!vReady){ alert("La vidéo est obligatoire !"); return false; }
            window.location.href = '/dashboard';
        }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V21 - Perfection Accueil + Inscription'); });
