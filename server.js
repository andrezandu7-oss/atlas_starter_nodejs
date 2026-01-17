const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* --- ACCUEIL EXACT (Image iPhone) --- */
    .welcome-screen { background: #f4e9da; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 25px; text-align: center; box-sizing: border-box; }
    .main-logo { width: 180px; margin-bottom: 10px; }
    .brand-title { font-size: 3.5rem; font-weight: bold; color: #1a2a44; margin: 0; line-height: 1; }
    .brand-title span { color: #ff416c; }
    .slogan-text { font-size: 1.3rem; color: #1a2a44; font-weight: bold; margin: 10px 0 25px 0; }
    .welcome-desc { font-size: 1rem; color: #333; line-height: 1.4; margin-bottom: 35px; }
    
    .btn-dark { background: #1a2a44; color: white; border-radius: 8px; text-decoration: none; width: 100%; padding: 16px; font-weight: bold; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1.1rem; }
    .btn-outline-dark { background: white; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 8px; text-decoration: none; width: 100%; padding: 16px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 1.1rem; }

    /* --- INSCRIPTION EXACTE (Cercle photo obligatoire) --- */
    .content { padding: 20px; text-align: center; }
    .photo-circle { 
        border: 2px dashed #ff416c; 
        height: 120px; width: 120px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        color: #ff416c; cursor: pointer; 
        margin: 0 auto 20px auto; 
        background-size: cover; background-position: center;
        font-size: 0.85rem; font-weight: bold;
    }
    .photo-circle.filled { border-style: solid; }
    
    .input-box { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-size: 1rem; margin-top: 5px; box-sizing: border-box; }
    label { display: block; font-size: 0.85rem; font-weight: bold; color: #666; margin-top: 10px; }
    .row { display: flex; gap: 10px; }
    
    .video-btn { border: 2px dashed #007bff; padding: 15px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 20px 0; cursor: pointer; display: block; }
    .video-done { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
    .btn-green { background: #4caf50; color: white; border: none; width: 100%; padding: 16px; border-radius: 50px; font-weight: bold; font-size: 1.2rem; cursor: pointer; }
</style>
`;

// PAGE ACCUEIL
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <div style="margin-top: 20px;">
            <svg width="150" height="150" viewBox="0 0 100 100">
                <path d="M50 85c-1.5 0-3-.5-4.2-1.5C32 72.5 15 56.4 15 39.5 15 27.1 25.1 17 37.5 17c5.4 0 10.5 2 12.5 5.2 2-3.2 7.1-5.2 12.5-5.2C74.9 17 85 27.1 85 39.5c0 16.9-17 33-30.8 44-1.2 1-2.7 1.5-4.2 1.5z" fill="#ff416c"/>
                <path d="M40 35 L60 35 M40 45 L60 45 M40 55 L60 55" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <circle cx="70" cy="30" r="10" fill="white" opacity="0.3"/>
            </svg>
        </div>
        <h1 class="brand-title">Gen<span>love</span></h1>
        <p class="slogan-text">L'amour qui soigne 💙</p>
        
        <p class="welcome-desc">
            ⭐ <b>Bienvenue sur Genlove !</b><br><br>
            L'amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides ❤️
        </p>
        
        <a href="/login" class="btn-dark">➔ Se connecter</a>
        <a href="/signup" class="btn-outline-dark">👤 S'inscrire</a>
        
        <p style="font-size: 0.8rem; color: #888; margin-top: 30px;">Vos données sont sécurisées<br>et confidentielles</p>
    </div></div></body></html>`);
});

// PAGE INSCRIPTION
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c; font-size: 1.8rem;">Créer mon profil</h2>
        <form onsubmit="return verif(event)">
            
            <label for="fP" id="bPic" class="photo-circle">📸 Photo de profil *</label>
            <input type="file" id="fP" accept="image/*" style="display:none" onchange="prev(event)">
            
            <div class="row">
                <div style="flex:1;"><label>Prénom</label><input type="text" id="fn" class="input-box" placeholder="Ex: André" required></div>
                <div style="flex:1;"><label>Nom</label><input type="text" id="ln" class="input-box" placeholder="Ex: Tre" required></div>
            </div>

            <label>Date de naissance</label>
            <input type="date" id="db" class="input-box" required>

            <div class="row">
                <div style="flex:1;"><label>Groupe Sanguin</label>
                    <select id="gs" class="input-box" required><option value="A">Groupe A</option><option value="B">Groupe B</option><option value="AB">Groupe AB</option><option value="O">Groupe O</option></select>
                </div>
                <div style="flex:1;"><label>Rhésus</label>
                    <select id="rh" class="input-box" required><option value="+">+</option><option value="-">-</option></select>
                </div>
            </div>

            <div class="row">
                <div style="flex:1;"><label>Génotype</label>
                    <select id="gt" class="input-box" required><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
                </div>
                <div style="flex:1;"><label>Désir d'enfant ?</label>
                    <select id="kd" class="input-box" required><option value="Oui">Oui</option><option value="Non">Non</option><option value="Neutre">Neutre</option></select>
                </div>
            </div>

            <div class="video-btn" id="vB" onclick="document.getElementById('vI').click()">🎥 Vidéo de vérification obligatoire *</div>
            <input type="file" id="vI" accept="video/*" capture="user" style="display:none" onchange="vOk()">

            <button type="submit" class="btn-green">🚀 Finaliser mon profil</button>
        </form>
    </div></div>
    <script>
        let pRdy = false; let vRdy = false;
        function prev(e){
            const r = new FileReader();
            r.onload = () => { 
                const b = document.getElementById('bPic');
                b.style.backgroundImage = 'url('+r.result+')';
                b.innerText = ''; b.classList.add('filled');
                localStorage.setItem('uImg', r.result);
                pRdy = true;
            };
            r.readAsDataURL(e.target.files[0]);
        }
        function vOk(){ vRdy = true; const b = document.getElementById('vB'); b.innerText = '✅ Vidéo enregistrée'; b.classList.add('video-done'); }
        function verif(e){
            e.preventDefault();
            if(!pRdy){ alert("La photo est obligatoire !"); return false; }
            if(!vRdy){ alert("La vidéo est obligatoire !"); return false; }
            const d = { fn: document.getElementById('fn').value, ln: document.getElementById('ln').value, gt: document.getElementById('gt').value };
            localStorage.setItem('uData', JSON.stringify(d));
            window.location.href = '/dashboard';
        }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V17 - BASE FINALE'); });
