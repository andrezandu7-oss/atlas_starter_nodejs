const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* ACCUEIL PREMIUM */
    .welcome-screen { background: #f4e9da; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; text-align: center; }
    .brand-name { font-size: 2.8rem; font-weight: bold; color: #1a2a44; margin: 0; }
    .brand-name span { color: #ff416c; }
    .btn-dark { background: #1a2a44; color: white; border-radius: 8px; text-decoration: none; width: 100%; padding: 14px; font-weight: bold; margin-bottom: 12px; display: block; }
    .btn-outline-dark { background: white; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 8px; text-decoration: none; width: 100%; padding: 14px; font-weight: bold; display: block; }

    /* INSCRIPTION AVEC PHOTO OBLIGATOIRE */
    .content { padding: 20px; text-align: center; }
    .photo-circle { 
        border: 2px dashed #ff416c; 
        height: 120px; width: 120px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        color: #ff416c; cursor: pointer; 
        margin: 0 auto 20px auto; 
        background-size: cover; background-position: center;
        font-size: 0.8rem; font-weight: bold;
        transition: 0.3s;
    }
    .photo-circle.filled { border-style: solid; }
    
    label { display: block; font-size: 0.85rem; font-weight: bold; color: #555; margin-bottom: 5px; }
    input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-size: 1rem; margin-top: 5px; box-sizing: border-box; }
    .row { display: flex; gap: 10px; margin-bottom: 15px; }
    
    .video-area { border: 2px dashed #007bff; padding: 12px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 15px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .video-done { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
    .btn-submit { background: #4caf50; color: white; border: none; width: 100%; padding: 16px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <h1 class="brand-name">Gen<span>love</span></h1>
        <p style="font-weight:bold; color:#1a2a44;">L'amour qui soigne 💙</p>
        <a href="/login" class="btn-dark">➔ Se connecter</a>
        <a href="/signup" class="btn-outline-dark">👤 S'inscrire</a>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c;">Créer mon profil</h2>
        <form onsubmit="return validateFinal(event)">
            <label for="fPic" id="picBox" class="photo-circle">📸 Photo de profil *</label>
            <input type="file" id="fPic" accept="image/*" style="display:none" onchange="previewImg(event)">
            
            <div class="row">
                <div style="flex:1;"><label>Prénom</label><input type="text" id="fn" placeholder="Éric" required></div>
                <div style="flex:1;"><label>Nom</label><input type="text" id="ln" placeholder="Tre" required></div>
            </div>

            <div style="margin-bottom:15px;"><label>Date de naissance</label><input type="date" id="dob" required></div>

            <div class="row">
                <div style="flex:1;"><label>Groupe Sanguin</label><select id="gs" required><option value="A">Groupe A</option><option value="B">Groupe B</option><option value="AB">Groupe AB</option><option value="O">Groupe O</option></select></div>
                <div style="flex:1;"><label>Rhésus</label><select id="rh" required><option value="+">+</option><option value="-">-</option></select></div>
            </div>

            <div class="row">
                <div style="flex:1;"><label>Génotype</label><select id="gt" required><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select></div>
                <div style="flex:1;"><label>Enfants ?</label><select id="kd" required><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
            </div>

            <div class="video-area" id="vBtn" onclick="document.getElementById('vInp').click()">🎥 Vidéo de vérification *</div>
            <input type="file" id="vInp" accept="video/*" capture="user" style="display:none" onchange="videoOk()">

            <button type="submit" class="btn-submit">🚀 Finaliser mon profil</button>
        </form>
    </div></div>
    <script>
        let photoReady = false;
        let videoReady = false;

        function previewImg(e){
            const file = e.target.files[0];
            if(file){
                const reader = new FileReader();
                reader.onload = () => { 
                    const box = document.getElementById('picBox');
                    box.style.backgroundImage = 'url('+reader.result+')';
                    box.innerText = '';
                    box.classList.add('filled');
                    localStorage.setItem('tempPhoto', reader.result);
                    photoReady = true; 
                };
                reader.readAsDataURL(file);
            }
        }

        function videoOk(){ videoReady = true; const b = document.getElementById('vBtn'); b.innerText = '✅ Vidéo OK'; b.classList.add('video-done'); }

        function validateFinal(e){
            e.preventDefault();
            if(!photoReady){ alert("Attention : La photo de profil est obligatoire !"); return false; }
            if(!videoReady){ alert("Attention : La vidéo de vérification est obligatoire !"); return false; }
            
            // Sauvegarde et redirection
            const data = { fn: document.getElementById('fn').value, ln: document.getElementById('ln').value };
            localStorage.setItem('userData', JSON.stringify(data));
            window.location.href = '/dashboard';
        }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V16 Photo-Obligatoire Ready'); });
