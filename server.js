const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- 1. ACCUEIL (Design Validé avec Carte Floue) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - Accueil</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(15px); padding: 40px 30px; border-radius: 30px; width: 85%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            h1 { font-size: 2.5rem; margin: 0; }
            .tagline { font-size: 1rem; margin: 15px 0 5px; opacity: 0.9; }
            .mission { font-weight: bold; margin-bottom: 35px; font-size: 1.1rem; line-height: 1.4; }
            .btn { display: block; width: 100%; padding: 16px; margin: 12px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 1.1rem; transition: 0.3s; box-sizing: border-box; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p class="tagline">"L'amour qui prend soin de votre avenir."</p>
            <p class="mission">Unissez cœur et santé pour bâtir des couples <span style="text-decoration: underline;">SOLIDES</span></p>
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup" class="btn btn-signup">📝 S'inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- 2. INSCRIPTION (Photo, Vidéo, Date de Naissance) ---
app.get('/signup', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscription - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; padding: 20px; display: flex; justify-content: center; }
            .container { background: white; padding: 25px; border-radius: 25px; width: 100%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
            label { font-size: 0.75rem; font-weight: bold; color: #333; display: block; margin-top: 8px; }
            input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; margin-top: 4px; box-sizing: border-box; }
            .photo-box { border: 2px dashed #ff416c; height: 80px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff416c; font-weight: bold; font-size: 0.8rem; margin-top: 10px; background-size: cover; background-position: center; }
            .video-btn { border: 2px dashed #007bff; padding: 15px; border-radius: 12px; text-align: center; color: #007bff; font-weight: bold; margin-top: 15px; cursor: pointer; display: block; }
            .btn-final { background: #4caf50; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: bold; width: 100%; margin-top: 20px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color:#ff416c; margin:0;">📝 Inscription</h2>
            <form onsubmit="saveProfile(event)">
                <div class="grid">
                    <div><label>Prénom *</label><input type="text" id="fn" required></div>
                    <div><label>Nom *</label><input type="text" id="ln" required></div>
                </div>
                <label>Date de naissance *</label><input type="date" id="dob" required>
                <div class="grid">
                    <div><label>Groupe Sanguin *</label><select id="gs" required><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>
                    <div><label>Rhésus *</label><select id="rh" required><option>+</option><option>-</option></select></div>
                </div>
                <div class="grid">
                    <div><label>Génotype *</label><select id="gt" required><option>AA</option><option>AS</option><option>SS</option></select></div>
                    <div><label>Désir d'enfants ? *</label><select id="kids" required><option>Oui</option><option>Non</option></select></div>
                </div>
                <label for="pInp" id="pView" class="photo-box">📷 Ajouter une Photo</label>
                <input type="file" id="pInp" style="display:none" accept="image/*" onchange="preview(event)">
                <label class="video-btn" id="vLb">🎥 Vidéo de vérification * <input type="file" accept="video/*" capture="user" style="display:none" onchange="document.getElementById('vLb').innerText='✅ Vidéo prête'"></label>
                <button type="submit" class="btn-final">🚀 Créer mon profil</button>
            </form>
        </div>
        <script>
            function preview(e) {
                const r = new FileReader();
                r.onload = () => { document.getElementById('pView').style.backgroundImage = 'url('+r.result+')'; document.getElementById('pView').innerText = ''; localStorage.setItem('uPhoto', r.result); };
                r.readAsDataURL(e.target.files[0]);
            }
            function saveProfile(e) {
                e.preventDefault();
                const d = { fn: document.getElementById('fn').value, ln: document.getElementById('ln').value, gt: document.getElementById('gt').value, dob: document.getElementById('dob').value, kids: document.getElementById('kids').value };
                localStorage.setItem('uData', JSON.stringify(d));
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 3. PROFIL (VUE DASHBOARD) ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <body style="font-family:sans-serif; background:#f5f5f5; margin:0; text-align:center;">
        <div style="background:white; padding:40px 20px; border-bottom-left-radius:30px; border-bottom-right-radius:30px;">
            <img id="uP" src="" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; object-fit:cover;">
            <h2 id="uN">André Zandu</h2>
            <p style="color:#ff416c; font-weight:bold;">Profil Vérifié ✅</p>
        </div>
        <div style="padding:20px;">
            <a href="/search" style="display:block; background:#ff416c; color:white; padding:15px; border-radius:50px; text-decoration:none; font-weight:bold; margin-bottom:15px;">🔍 Rechercher un partenaire</a>
            <a href="/settings" style="display:block; background:#eee; color:#555; padding:15px; border-radius:50px; text-decoration:none; font-weight:bold;">⚙️ Paramètres</a>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
            document.getElementById('uP').src = localStorage.getItem('uPhoto') || '';
        </script>
    </body>
    `);
});

// --- 4. PARAMÈTRES (LE DERNIER ÉCRAN) ---
app.get('/settings', (req, res) => {
    res.send(`
    <body style="font-family:sans-serif; padding:25px;">
        <div style="display:flex; align-items:center; margin-bottom:30px;">
            <a href="/dashboard" style="text-decoration:none; font-size:1.5rem; margin-right:15px;">⬅️</a>
            <h2>Paramètres</h2>
        </div>
        <div style="border-bottom:1px solid #eee; padding:15px 0;">✏️ Modifier mes informations</div>
        <div style="border-bottom:1px solid #eee; padding:15px 0;">🔔 Notifications</div>
        <div style="border-bottom:1px solid #eee; padding:15px 0; color:red; cursor:pointer;" onclick="localStorage.clear(); window.location.href='/';">🚪 Déconnexion</div>
    </body>
    `);
});

// --- 5. RECHERCHE (Sécurité SS incluse) ---
app.get('/search', (req, res) => {
    res.send(`
    <body style="font-family:sans-serif; padding:25px; background:#f0f2f5;">
        <h3>🔍 Recherche</h3>
        <div id="ssW" style="background:#fff5f5; color:red; padding:10px; border-radius:10px; display:none; margin-bottom:15px;">⚠️ Sécurité : Profils SS masqués car vous êtes SS.</div>
        <p>Génotype recherché :</p>
        <button id="btnSS" style="padding:10px; border-radius:8px;">SS</button>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d && d.gt === 'SS') {
                document.getElementById('ssW').style.display = 'block';
                document.getElementById('btnSS').style.textDecoration = 'line-through';
                document.getElementById('btnSS').disabled = true;
            }
        </script>
    </body>
    `);
});

app.listen(port, () => { console.log('Genlove Full App Live'); });
