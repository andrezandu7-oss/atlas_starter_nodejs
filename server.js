const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* STYLE ACCUEIL PREMIUM (Image iPhone) */
    .welcome-screen { background: #f4e9da; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px; text-align: center; }
    .brand-logo { width: 120px; margin-bottom: 10px; }
    .brand-name { font-size: 2.8rem; font-weight: bold; color: #1a2a44; margin: 0; }
    .brand-name span { color: #ff416c; }
    .slogan { font-size: 1.1rem; color: #1a2a44; font-weight: bold; margin-bottom: 25px; }
    .welcome-text { font-size: 0.95rem; color: #333; line-height: 1.5; margin-bottom: 30px; padding: 0 10px; }
    
    /* BOUTONS ACCUEIL */
    .btn-dark { background: #1a2a44; color: white; border-radius: 8px; text-decoration: none; width: 100%; padding: 14px; font-weight: bold; margin-bottom: 12px; display: block; }
    .btn-outline-dark { background: white; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 8px; text-decoration: none; width: 100%; padding: 14px; font-weight: bold; display: block; }

    /* STYLE INSCRIPTION (Ton préféré) */
    .content { padding: 20px; text-align: center; }
    .photo-circle { 
        border: 2px dashed #ff416c; 
        height: 110px; width: 110px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        color: #ff416c; cursor: pointer; 
        margin: 0 auto 20px auto; 
        background-size: cover; background-position: center;
        font-size: 0.8rem; font-weight: bold;
    }
    .input-group { background: #f8fafc; padding: 15px; border-radius: 15px; border: 1px solid #edf2f7; text-align: left; margin-bottom: 15px; }
    label { display: block; font-size: 0.85rem; font-weight: bold; color: #555; margin-bottom: 5px; text-align: center; }
    input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-size: 1rem; margin-top: 5px; box-sizing: border-box; }
    .row { display: flex; gap: 10px; margin-bottom: 10px; }
    
    .video-area { border: 2px dashed #007bff; padding: 12px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 15px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .video-done { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
    .btn-submit { background: #4caf50; color: white; border: none; width: 100%; padding: 16px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-top: 10px; }
</style>
`;

// --- PAGE D'ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" class="brand-logo"> <h1 class="brand-name">Gen<span>love</span></h1>
        <p class="slogan">L'amour qui soigne 💙</p>
        <p class="welcome-text">⭐ <b>Bienvenue sur Genlove !</b><br>L'amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides ❤️</p>
        <a href="/login" class="btn-dark">➔ Se connecter</a>
        <a href="/signup" class="btn-outline-dark">👤 S'inscrire</a>
        <p style="font-size: 0.75rem; color: #888; margin-top: 20px;">Vos données sont sécurisées et confidentielles</p>
    </div></div></body></html>`);
});

// --- PAGE D'INSCRIPTION (DESIGN IDENTIQUE À TES CAPTURES) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c; margin-bottom:20px;">Créer mon profil</h2>
        <form onsubmit="return saveProfile(event)">
            <label for="fPic" id="picBox" class="photo-circle">📸 Photo de profil</label>
            <input type="file" id="fPic" accept="image/*" style="display:none" onchange="loadImg(event)">
            
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
                <div style="flex:1;"><label>Désir d'enfant ?</label><select id="kd" required><option value="Oui">Oui</option><option value="Non">Non</option><option value="Neutre">Neutre</option></select></div>
            </div>

            <div class="video-area" id="vBtn" onclick="document.getElementById('vInp').click()">🎥 Vidéo de vérification obligatoire *</div>
            <input type="file" id="vInp" accept="video/*" capture="user" style="display:none" onchange="vOk()">

            <button type="submit" class="btn-submit">🚀 Finaliser mon profil</button>
        </form>
    </div></div>
    <script>
        let vReady = false;
        function loadImg(e){
            const f = e.target.files[0];
            const r = new FileReader();
            r.onload = () => { 
                const b = document.getElementById('picBox');
                b.style.backgroundImage = 'url('+r.result+')';
                b.innerText = '';
                localStorage.setItem('userPhoto', r.result);
            };
            r.readAsDataURL(f);
        }
        function vOk(){ vReady = true; const b = document.getElementById('vBtn'); b.innerText = '✅ Vidéo enregistrée'; b.classList.add('video-done'); }
        function saveProfile(e){
            e.preventDefault();
            if(!vReady){ alert("La vidéo est obligatoire !"); return false; }
            const data = { fn: document.getElementById('fn').value, ln: document.getElementById('ln').value, gt: document.getElementById('gt').value, gs: document.getElementById('gs').value, rh: document.getElementById('rh').value, kd: document.getElementById('kd').value };
            localStorage.setItem('userData', JSON.stringify(data));
            window.location.href = '/dashboard';
        }
    </script></body></html>`);
});

// --- DASHBOARD ---
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <div id="uImg" style="width:130px; height:130px; border-radius:50%; border:4px solid #ff416c; margin: 30px auto 10px auto; background-size:cover; background-position:center;"></div>
        <h2 id="uName" style="margin-bottom:25px;">Utilisateur</h2>
        <div class="input-group">
            <p>🧬 <b>Génotype :</b> <span id="uGt"></span></p>
            <p>🩸 <b>Groupe :</b> <span id="uGs"></span></p>
            <p>👶 <b>Enfants :</b> <span id="uKd"></span></p>
        </div>
        <button class="btn-submit" style="background:#ff416c">🔍 Trouver un partenaire</button>
        <a href="/" style="display:block; margin-top:20px; color:#777; text-decoration:none;">Déconnexion</a>
    </div></div>
    <script>
        const d = JSON.parse(localStorage.getItem('userData'));
        if(d){
            document.getElementById('uName').innerText = d.fn + ' ' + d.ln;
            document.getElementById('uGt').innerText = d.gt;
            document.getElementById('uGs').innerText = d.gs + d.rh;
            document.getElementById('uKd').innerText = d.kd;
            document.getElementById('uImg').style.backgroundImage = 'url('+localStorage.getItem('userPhoto')+')';
        } else { window.location.href = '/'; }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V15 Hybrid Final Ready'); });
