const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* --- ACCUEIL --- */
    .welcome-screen { background: #f4e9da; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 25px; text-align: center; box-sizing: border-box; }
    .brand-title { font-size: 3.5rem; font-weight: bold; color: #1a2a44; margin: 0; line-height: 1; }
    .brand-title span { color: #ff416c; }
    .slogan-text { font-size: 1.3rem; color: #1a2a44; font-weight: bold; margin: 10px 0 25px 0; }
    .btn-dark { background: #1a2a44; color: white; border-radius: 8px; text-decoration: none; width: 100%; padding: 16px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .btn-outline-dark { background: white; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 8px; text-decoration: none; width: 100%; padding: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }

    /* --- INSCRIPTION AVEC BOUTON SUPPRIMER --- */
    .content { padding: 20px; text-align: center; }
    .photo-container { position: relative; width: 130px; margin: 0 auto 20px auto; }
    .photo-circle { 
        border: 2px dashed #ff416c; 
        height: 130px; width: 130px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        color: #ff416c; cursor: pointer; 
        background-size: cover; background-position: center;
        font-size: 0.85rem; font-weight: bold;
        background-color: #fff;
    }
    .photo-circle.filled { border-style: solid; border-width: 3px; }
    .del-btn { 
        position: absolute; top: 0; right: 0; 
        background: #ff416c; color: white; border: none; 
        border-radius: 50%; width: 30px; height: 30px; 
        cursor: pointer; display: none; font-weight: bold; 
    }

    .input-box { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-size: 1rem; margin-top: 5px; box-sizing: border-box; }
    label { display: block; font-size: 0.85rem; font-weight: bold; color: #666; margin-top: 10px; }
    .row { display: flex; gap: 10px; }
    
    .video-btn { border: 2px dashed #007bff; padding: 15px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 20px 0; cursor: pointer; display: block; }
    .video-done { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
    .btn-green { background: #4caf50; color: white; border: none; width: 100%; padding: 16px; border-radius: 50px; font-weight: bold; font-size: 1.2rem; cursor: pointer; }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <h1 class="brand-title">Gen<span>love</span></h1>
        <p class="slogan-text">L'amour qui soigne 💙</p>
        <a href="/login" class="btn-dark">➔ Se connecter</a>
        <a href="/signup" class="btn-outline-dark">👤 S'inscrire</a>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body onload="checkExisting()"><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c;">Créer mon profil</h2>
        <form onsubmit="return validateForm(event)">
            
            <div class="photo-container">
                <label for="fP" id="bPic" class="photo-circle">📸 Photo *</label>
                <button type="button" id="del" class="del-btn" onclick="removePhoto()">✕</button>
            </div>
            <input type="file" id="fP" accept="image/*" style="display:none" onchange="upload(event)">
            
            <div class="row">
                <div style="flex:1;"><label>Prénom</label><input type="text" id="fn" class="input-box" required></div>
                <div style="flex:1;"><label>Nom</label><input type="text" id="ln" class="input-box" required></div>
            </div>

            <div class="row">
                <div style="flex:1;"><label>Groupe Sanguin</label><select id="gs" class="input-box" required><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select></div>
                <div style="flex:1;"><label>Génotype</label><select id="gt" class="input-box" required><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select></div>
            </div>

            <div class="video-btn" id="vB" onclick="document.getElementById('vI').click()">🎥 Vidéo de vérification *</div>
            <input type="file" id="vI" accept="video/*" capture="user" style="display:none" onchange="vDone()">

            <button type="submit" class="btn-green">🚀 Finaliser mon profil</button>
        </form>
    </div></div>
    <script>
        let vReady = false;

        function checkExisting() {
            if(localStorage.getItem('uImg')) { showPhoto(localStorage.getItem('uImg')); }
        }

        function upload(e) {
            const r = new FileReader();
            r.onload = () => { localStorage.setItem('uImg', r.result); showPhoto(r.result); };
            r.readAsDataURL(e.target.files[0]);
        }

        function showPhoto(src) {
            const b = document.getElementById('bPic');
            b.style.backgroundImage = 'url('+src+')';
            b.innerText = '';
            b.classList.add('filled');
            document.getElementById('del').style.display = 'block';
        }

        function removePhoto() {
            localStorage.removeItem('uImg');
            const b = document.getElementById('bPic');
            b.style.backgroundImage = 'none';
            b.innerText = '📸 Photo *';
            b.classList.remove('filled');
            document.getElementById('del').style.display = 'none';
            document.getElementById('fP').value = '';
        }

        function vDone() { vReady = true; const b = document.getElementById('vB'); b.innerText = '✅ Vidéo OK'; b.classList.add('video-done'); }

        function validateForm(e) {
            e.preventDefault();
            if(!localStorage.getItem('uImg')) { alert("La photo est obligatoire !"); return false; }
            if(!vReady) { alert("La vidéo est obligatoire !"); return false; }
            window.location.href = '/dashboard';
        }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V19 Ready'); });
