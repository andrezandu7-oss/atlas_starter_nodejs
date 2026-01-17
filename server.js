const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* --- L'ACCUEIL EXACT DE TON IMAGE --- */
    .welcome-screen { 
        background: #f4e9da; /* Le beige exact de l'image */
        min-height: 100vh; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center;
        padding: 40px 30px; 
        text-align: center; 
        box-sizing: border-box; 
    }
    .logo-placeholder { margin-bottom: 20px; }
    .brand-name { font-size: 3.2rem; font-weight: bold; color: #1a2a44; margin: 0; letter-spacing: -1px; }
    .brand-name span { color: #ff416c; }
    .slogan { font-size: 1.2rem; color: #1a2a44; font-weight: bold; margin: 5px 0 25px 0; }
    .welcome-msg { font-size: 1rem; color: #2d4059; line-height: 1.5; margin-bottom: 40px; }
    
    .btn-dark { background: #1a2a44; color: white; border-radius: 12px; text-decoration: none; width: 100%; padding: 18px; font-weight: bold; margin-bottom: 15px; display: block; font-size: 1.1rem; }
    .btn-outline { background: white; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 12px; text-decoration: none; width: 100%; padding: 18px; font-weight: bold; display: block; font-size: 1.1rem; }

    /* --- L'INSCRIPTION QUE TU AS VALIDÉE --- */
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
    }
    .del-x { position: absolute; top: 0; right: 0; background: #ff416c; color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-weight: bold; display: none; }

    .row { display: flex; gap: 12px; margin-bottom: 15px; }
    .input-field { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 1rem; box-sizing: border-box; }
    label { display: block; font-size: 0.85rem; font-weight: bold; color: #555; margin-bottom: 5px; text-align: left; }
    
    .video-box { border: 2px dashed #007bff; padding: 15px; border-radius: 15px; color: #007bff; font-weight: bold; margin: 20px 0; cursor: pointer; }
    .video-ok { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
    .btn-final { background: #4caf50; color: white; border: none; width: 100%; padding: 18px; border-radius: 50px; font-weight: bold; font-size: 1.2rem; cursor: pointer; }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <div class="logo-placeholder">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <path d="M50 85c-1.5 0-3-.5-4.2-1.5C32 72.5 15 56.4 15 39.5 15 27.1 25.1 17 37.5 17c5.4 0 10.5 2 12.5 5.2 2-3.2 7.1-5.2 12.5-5.2C74.9 17 85 27.1 85 39.5c0 16.9-17 33-30.8 44-1.2 1-2.7 1.5-4.2 1.5z" fill="#ff416c"/>
                <path d="M40 35 L60 35 M40 45 L60 45" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
        </div>
        <h1 class="brand-name">Gen<span>love</span></h1>
        <p class="slogan">L'amour qui soigne 💙</p>
        <p class="welcome-msg">⭐ <b>Bienvenue sur Genlove !</b><br><br>L'amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides ❤️</p>
        <a href="/login" class="btn-dark">➔ Se connecter</a>
        <a href="/signup" class="btn-outline">👤 S'inscrire</a>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body onload="restore()"><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c; margin-bottom:25px;">Créer mon profil</h2>
        <form onsubmit="return validate(event)">
            <div class="photo-container">
                <label for="imgInp" id="circle" class="photo-circle">📸 Photo *</label>
                <button type="button" id="delBtn" class="del-x" onclick="clearPhoto()">✕</button>
            </div>
            <input type="file" id="imgInp" accept="image/*" style="display:none" onchange="preview(event)">
            
            <div class="row">
                <div style="flex:1;"><label>Prénom</label><input type="text" id="fn" class="input-field" required></div>
                <div style="flex:1;"><label>Nom</label><input type="text" id="ln" class="input-field" required></div>
            </div>

            <div class="row">
                <div style="flex:1;"><label>Génotype</label><select id="gt" class="input-field" required><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select></div>
                <div style="flex:1;"><label>Rhésus</label><select id="rh" class="input-field" required><option value="+">+</option><option value="-">-</option></select></div>
            </div>

            <div class="video-box" id="vidB" onclick="document.getElementById('vidI').click()">🎥 Vidéo de vérification *</div>
            <input type="file" id="vidI" accept="video/*" capture="user" style="display:none" onchange="vidDone()">

            <button type="submit" class="btn-final">🚀 Finaliser mon profil</button>
        </form>
    </div></div>
    <script>
        let vReady = false;
        function restore() { if(localStorage.getItem('savedImg')) { setImg(localStorage.getItem('savedImg')); } }
        function preview(e) {
            const r = new FileReader();
            r.onload = () => { localStorage.setItem('savedImg', r.result); setImg(r.result); };
            r.readAsDataURL(e.target.files[0]);
        }
        function setImg(src) {
            const c = document.getElementById('circle');
            c.style.backgroundImage = 'url('+src+')';
            c.innerText = '';
            document.getElementById('delBtn').style.display = 'block';
        }
        function clearPhoto() {
            localStorage.removeItem('savedImg');
            const c = document.getElementById('circle');
            c.style.backgroundImage = 'none';
            c.innerText = '📸 Photo *';
            document.getElementById('delBtn').style.display = 'none';
        }
        function vidDone() { vReady = true; const b = document.getElementById('vidB'); b.innerText = '✅ Vidéo OK'; b.classList.add('video-ok'); }
        function validate(e) {
            e.preventDefault();
            if(!localStorage.getItem('savedImg')) { alert("Photo obligatoire !"); return false; }
            if(!vReady) { alert("Vidéo obligatoire !"); return false; }
            window.location.href = '/dashboard';
        }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V20 - Fidelité Totale Ready'); });
