const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- 1. PAGE D'ACCUEIL : TON SLOGAN FINAL ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - Accueil</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); }
            h1 { font-size: 2.5rem; margin: 0; }
            .tagline { font-size: 1rem; margin: 15px 0 5px; opacity: 0.95; }
            .mission { font-weight: bold; margin-bottom: 30px; font-size: 1.1rem; line-height: 1.4; }
            .btn { display: block; width: 100%; padding: 16px; margin: 12px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 1rem; transition: 0.3s; box-sizing: border-box; }
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

// --- 2. INSCRIPTION : PHOTO, VIDÉO, DATE NAISSANCE & DÉSIR ENFANTS ---
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
            .photo-box { border: 2px dashed #ff416c; height: 80px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff416c; font-weight: bold; font-size: 0.8rem; margin-top: 10px; background-size: cover; background-position: center; overflow: hidden; }
            .upload-btn { border: 2px dashed #007bff; padding: 15px; border-radius: 12px; text-align: center; color: #007bff; font-weight: bold; margin-top: 15px; cursor: pointer; display: block; font-size: 0.85rem; }
            .btn-final { background: #4caf50; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: bold; width: 100%; margin-top: 20px; cursor: pointer; font-size: 1rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color:#ff416c; margin:0;">📝 Créer mon profil</h2>
            <form>
                <div class="grid">
                    <div><label>Prénom *</label><input type="text" id="fn" placeholder="André" required></div>
                    <div><label>Nom *</label><input type="text" id="ln" placeholder="Zandu" required></div>
                </div>
                
                <label>Date de naissance *</label>
                <input type="date" id="dob" required>

                <div class="grid">
                    <div><label>Groupe Sanguin *</label>
                        <select id="gs" required><option value="">-</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                    </div>
                    <div><label>Rhésus *</label>
                        <select id="rh" required><option value="">-</option><option>+</option><option>-</option></select>
                    </div>
                </div>

                <div class="grid">
                    <div><label>Génotype *</label>
                        <select id="gt" required><option value="">-</option><option>AA</option><option>AS</option><option>SS</option></select>
                    </div>
                    <div><label>Désir d'enfants ? *</label>
                        <select id="kids" required><option value="">Choisir</option><option>Oui</option><option>Non</option><option>À discuter</option></select>
                    </div>
                </div>

                <label>Photo de profil</label>
                <label for="pInp" id="pView" class="photo-box">📁 Cliquez pour ajouter une photo</label>
                <input type="file" id="pInp" style="display:none" accept="image/*" onchange="preview(event)">

                <label for="vInp" id="vLb" class="upload-btn">🎥 Cliquer pour Vidéo de vérification *</label>
                <input type="file" id="vInp" style="display:none" accept="video/*" capture="user" onchange="vDone()">

                <button type="button" class="btn-final" onclick="validate()">🚀 Finaliser mon profil</button>
            </form>
        </div>
        <script>
            let vCap = false;
            function preview(e) {
                const r = new FileReader();
                r.onload = () => { 
                    document.getElementById('pView').style.backgroundImage = 'url('+r.result+')';
                    document.getElementById('pView').innerText = '';
                    localStorage.setItem('uPhoto', r.result);
                };
                r.readAsDataURL(e.target.files[0]);
            }
            function vDone() { 
                vCap = true; 
                document.getElementById('vLb').innerText = '✅ Vidéo prête';
                document.getElementById('vLb').style.color = '#4caf50';
                document.getElementById('vLb').style.borderColor = '#4caf50';
            }
            function validate() {
                const data = {
                    fn: document.getElementById('fn').value, ln: document.getElementById('ln').value,
                    dob: document.getElementById('dob').value, gt: document.getElementById('gt').value,
                    gs: document.getElementById('gs').value, rh: document.getElementById('rh').value,
                    kids: document.getElementById('kids').value
                };
                if(!data.fn || !data.dob || !data.gt || !vCap) return alert("Veuillez remplir tous les champs avec * et faire la vidéo.");
                localStorage.setItem('uData', JSON.stringify(data));
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 3. DASHBOARD / MON PROFIL ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mon Profil - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; display: flex; justify-content: center; margin: 0; }
            .iphone { background: white; width: 100%; max-width: 400px; min-height: 100vh; padding: 30px; box-sizing: border-box; text-align: center; }
            .avatar { width: 120px; height: 120px; border-radius: 50%; background: #eee; margin-bottom: 20px; border: 4px solid #ff416c; object-fit: cover; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
            .label { font-weight: bold; color: #555; }
            .ss-shield { background: #fff5f5; color: #d32f2f; padding: 15px; border-radius: 12px; font-size: 0.8rem; margin-top: 20px; border: 1px solid #feb2b2; display:none; }
        </style>
    </head>
    <body>
        <div class="iphone">
            <img id="uImg" src="" class="avatar">
            <h2 id="uName">Chargement...</h2>
            <div id="uInfos"></div>
            <div id="ssWarn" class="ss-shield">⚠️ <b>Protection SS :</b> Les profils SS ne vous seront pas proposés pour protéger votre future famille.</div>
            <br>
            <a href="/search" style="display:block; background:#ff416c; color:white; padding:15px; border-radius:50px; text-decoration:none; font-weight:bold;">🔍 Rechercher un partenaire</a>
            <a href="/" style="display:block; margin-top:20px; color:#666; text-decoration:none;">Déconnexion</a>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            const p = localStorage.getItem('uPhoto');
            if(p) document.getElementById('uImg').src = p;
            if(d) {
                document.getElementById('uName').innerText = d.fn + ' ' + d.ln;
                if(d.gt === 'SS') document.getElementById('ssWarn').style.display = 'block';
                document.getElementById('uInfos').innerHTML = \`
                    <div class="info-row"><span class="label">Né(e) le</span> <span>\${d.dob}</span></div>
                    <div class="info-row"><span class="label">Génotype</span> <span>\${d.gt}</span></div>
                    <div class="info-row"><span class="label">Désir d'enfants</span> <span>\${d.kids}</span></div>
                    <div class="info-row"><span class="label">Groupe</span> <span>\${d.gs}\${d.rh}</span></div>
                \`;
            }
        </script>
    </body>
    </html>
    `);
});

// --- 4. RECHERCHE (Avec blocage SS) ---
app.get('/search', (req, res) => {
    res.send(`
    <div style="font-family:sans-serif; padding:40px; text-align:center;">
        <h2>🔍 Recherche Sécurisée</h2>
        <p>Filtrage génétique actif...</p>
        <button onclick="history.back()">Retour</button>
    </div>
    `);
});

app.listen(port, () => { console.log('Genlove is Fully Operational'); });
