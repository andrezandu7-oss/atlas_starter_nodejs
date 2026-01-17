const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- 1. ACCUEIL (Avec ton slogan validé) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); }
            .btn { display: block; width: 100%; padding: 15px; margin: 12px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 1rem; }
            .btn-white { background: white; color: #ff416c; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p>"L'amour qui prend soin de votre avenir."</p>
            <p>Unissez cœur et santé pour bâtir des couples <span style="text-decoration:underline;">SOLIDES</span></p>
            <a href="/signup" class="btn btn-white">📝 S'inscrire</a>
            <a href="/dashboard" style="color:white; text-decoration:none; font-size:0.8rem; opacity:0.8;">Déjà inscrit ? Se connecter</a>
        </div>
    </body>
    </html>
    `);
});

// --- 2. MON PROFIL (Avec la Roue des Paramètres) ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profil - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; display: flex; justify-content: center; margin: 0; }
            .iphone { background: white; width: 100%; max-width: 400px; min-height: 100vh; padding: 25px; position: relative; }
            .settings-icon { position: absolute; top: 25px; right: 25px; font-size: 1.5rem; cursor: pointer; text-decoration: none; color: #555; }
            .avatar { width: 120px; height: 120px; border-radius: 50%; background: #ddd; margin: 20px auto; border: 4px solid #ff416c; display: block; object-fit: cover; }
            .info-card { background: #fff; border-radius: 15px; padding: 15px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
            .label { font-weight: bold; color: #777; }
            .btn-search { display: block; background: #ff416c; color: white; padding: 15px; border-radius: 50px; text-decoration: none; font-weight: bold; text-align: center; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="iphone">
            <a href="/settings" class="settings-icon">⚙️</a>
            <img id="uImg" src="https://via.placeholder.com/120" class="avatar">
            <h2 id="uName" style="text-align:center; margin-bottom:5px;">André Zandu</h2>
            <p style="text-align:center; color:#ff416c; font-weight:bold; margin-top:0;">Profil Vérifié ✅</p>
            
            <div class="info-card" id="uInfos">
                </div>

            <a href="/search" class="btn-search">🔍 Trouver un partenaire</a>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData')) || {fn: "André", ln: "Zandu", gt: "AS", gs: "B", rh: "+", dob: "1995-05-12", kids: "Oui"};
            const p = localStorage.getItem('uPhoto');
            if(p) document.getElementById('uImg').src = p;
            document.getElementById('uName').innerText = d.fn + ' ' + d.ln;
            document.getElementById('uInfos').innerHTML = \`
                <div class="row"><span class="label">Génotype</span> <b>\${d.gt}</b></div>
                <div class="row"><span class="label">Groupe Sanguin</span> <b>\${d.gs}\${d.rh}</b></div>
                <div class="row"><span class="label">Date de naissance</span> <b>\${d.dob}</b></div>
                <div class="row"><span class="label">Désir d'enfants</span> <b>\${d.kids}</b></div>
            \`;
        </script>
    </body>
    </html>
    `);
});

// --- 3. PAGE PARAMÈTRES (Pour la modification) ---
app.get('/settings', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Paramètres - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fff; display: flex; justify-content: center; margin: 0; }
            .container { width: 100%; max-width: 400px; padding: 25px; }
            .header { display: flex; align-items: center; margin-bottom: 30px; }
            .back-btn { font-size: 1.5rem; text-decoration: none; color: #333; margin-right: 20px; }
            label { font-size: 0.8rem; font-weight: bold; color: #555; display: block; margin-top: 15px; }
            input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; margin-top: 5px; }
            .btn-save { background: #4caf50; color: white; width: 100%; padding: 15px; border: none; border-radius: 10px; font-weight: bold; margin-top: 30px; cursor: pointer; }
            .danger-zone { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <a href="/dashboard" class="back-btn">⬅️</a>
                <h2 style="margin:0;">Paramètres</h2>
            </div>
            
            <form id="editForm">
                <label>Prénom</label><input type="text" id="efn">
                <label>Nom</label><input type="text" id="eln">
                <label>Désir d'enfants</label>
                <select id="ekids"><option>Oui</option><option>Non</option><option>À discuter</option></select>
                
                <p style="font-size:0.7rem; color:orange; margin-top:20px;">ℹ️ Les données médicales (Génotype/Rhésus) ne peuvent être modifiées que sur justificatif médical via le support.</p>
                
                <button type="button" class="btn-save" onclick="update()">Enregistrer les modifications</button>
            </form>

            <div class="danger-zone">
                <button onclick="localStorage.clear(); window.location.href='/';" style="color:red; background:none; border:none; cursor:pointer;">Supprimer mon compte</button>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) {
                document.getElementById('efn').value = d.fn;
                document.getElementById('eln').value = d.ln;
                document.getElementById('ekids').value = d.kids;
            }
            function update() {
                d.fn = document.getElementById('efn').value;
                d.ln = document.getElementById('eln').value;
                d.kids = document.getElementById('ekids').value;
                localStorage.setItem('uData', JSON.stringify(d));
                alert("Profil mis à jour !");
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- Reste du code (Signup et Search) ---
app.listen(port, () => { console.log('Genlove avec Paramètres actif'); });
