const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- 1. PAGE D'ACCUEIL (Fixée avec ton nouveau slogan) ---
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
            h1 { font-size: 2.2rem; margin-bottom: 10px; }
            .tagline { font-size: 0.95rem; margin-bottom: 5px; opacity: 0.9; }
            .mission { font-weight: bold; margin-bottom: 30px; font-size: 1.05rem; line-height: 1.4; }
            .btn { display: block; width: 100%; padding: 15px; margin: 12px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 1rem; transition: 0.3s; box-sizing: border-box; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p class="tagline">"L'amour qui prend soin de votre avenir."</p>
            <p class="mission">Unissez cœur et santé pour bâtir des couples <span style="text-decoration:underline;">SOLIDES</span></p>
            
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup-full" class="btn btn-signup">📝 S'inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- 2. PAGE D'INSCRIPTION (La route qui manquait) ---
app.get('/signup-full', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscription - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; padding: 20px; display: flex; justify-content: center; }
            .container { background: white; padding: 25px; border-radius: 20px; width: 100%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            label { font-size: 0.75rem; font-weight: bold; color: #333; display: block; margin-top: 10px; }
            input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-top: 5px; box-sizing: border-box; }
            .btn-final { background: #4caf50; color: white; border: none; padding: 16px; border-radius: 10px; font-weight: bold; width: 100%; margin-top: 20px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color:#ff416c;">📝 Inscription</h2>
            <form id="regForm">
                <div class="grid">
                    <div><label>Prénom *</label><input type="text" id="fn" required></div>
                    <div><label>Nom *</label><input type="text" id="ln" required></div>
                </div>
                <label>Date de naissance *</label><input type="date" id="dob" required>
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
                    <div><label>Enfants ? *</label>
                        <select id="kids" required><option value="">-</option><option>Oui</option><option>Non</option><option>À discuter</option></select>
                    </div>
                </div>
                <button type="button" class="btn-final" onclick="doSave()">🚀 Finaliser mon profil</button>
            </form>
        </div>
        <script>
            function doSave() {
                const d = { fn: document.getElementById('fn').value, gt: document.getElementById('gt').value };
                if(!d.fn || !d.gt) return alert("Remplissez les champs avec *");
                localStorage.setItem('uData', JSON.stringify(d));
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
    <html><body style="font-family:sans-serif; text-align:center; padding-top:50px;">
        <h1>✅ Profil Enregistré</h1>
        <p>Bienvenue sur votre espace Genlove.</p>
        <a href="/search" style="padding:10px 20px; background:#ff416c; color:white; text-decoration:none; border-radius:5px;">🔍 Lancer une recherche</a>
        <br><br><a href="/">Retour accueil</a>
    </body></html>
    `);
});

// --- 4. RECHERCHE AVANCÉE (Avec sécurité SS) ---
app.get('/search', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recherche - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; justify-content: center; padding: 20px; }
            .iphone { background: white; width: 100%; max-width: 400px; padding: 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .warning { background: #fff5f5; color: #d32f2f; padding: 12px; border-radius: 10px; font-size: 0.8rem; border: 1px solid #feb2b2; margin-bottom: 15px; display:none; }
            .disabled { opacity: 0.4; pointer-events: none; text-decoration: line-through; }
        </style>
    </head>
    <body>
        <div class="iphone">
            <h3>🔍 Recherche Partenaire</h3>
            <div id="ssWarn" class="warning">⚠️ Profil SS détecté : Recherche SS bloquée.</div>
            <p>Génotype recherché :</p>
            <button style="padding:10px;">AA</button> <button style="padding:10px;">AS</button> <button id="btnSS" style="padding:10px;">SS</button>
            <p>Seuil de compatibilité : <b>60%</b></p>
            <button onclick="alert('Recherche lancée...')" style="width:100%; padding:15px; background:#ff416c; color:white; border:none; border-radius:10px;">🚀 Rechercher</button>
            <p style="text-align:center;"><a href="/" style="color:#666; font-size:0.8rem;">Retour</a></p>
        </div>
        <script>
            const user = JSON.parse(localStorage.getItem('uData'));
            if(user && user.gt === 'SS') {
                document.getElementById('ssWarn').style.display = 'block';
                document.getElementById('btnSS').classList.add('disabled');
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove Operational'); });
