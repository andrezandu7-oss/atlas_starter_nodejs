const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- 1. PAGE D'ACCUEIL (Correction du "Cannot GET /") ---
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
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; color: #ff416c; background: white; }
            .btn-alt { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p>"L'amour qui prend soin de votre avenir"</p>
            <a href="/signup-full" class="btn">📝 Créer mon profil</a>
            <a href="/search" class="btn btn-alt">🔍 Rechercher</a>
        </div>
    </body>
    </html>
    `);
});

// --- 2. PAGE D'INSCRIPTION (Avec Photo, Date de naissance et Désir d'enfants) ---
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
            .photo-box { border: 2px dashed #ff416c; height: 70px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #ff416c; font-weight: bold; font-size: 0.8rem; margin-top: 10px; background-size: cover; background-position: center; }
            .btn-final { background: #4caf50; color: white; border: none; padding: 16px; border-radius: 10px; font-weight: bold; width: 100%; margin-top: 20px; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 style="color:#ff416c; margin-top:0;">Inscription 🧬</h2>
            <form>
                <div class="grid">
                    <div><label>Prénom *</label><input type="text" id="fn" placeholder="André"></div>
                    <div><label>Nom *</label><input type="text" id="ln" placeholder="Zandu"></div>
                </div>
                <label>Date de naissance *</label>
                <input type="date" id="dob">
                <div class="grid">
                    <div><label>Groupe Sanguin *</label>
                        <select id="gs"><option value="">Choisir</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                    </div>
                    <div><label>Rhésus *</label>
                        <select id="rh"><option value="">Choisir</option><option>+</option><option>-</option></select>
                    </div>
                </div>
                <div class="grid">
                    <div><label>Génotype *</label>
                        <select id="gt"><option value="">Choisir</option><option>AA</option><option>AS</option><option>SS</option></select>
                    </div>
                    <div><label>Désir d'avoir des enfants ? *</label>
                        <select id="kids"><option value="">Choisir</option><option>Oui</option><option>Non</option><option>À discuter</option></select>
                    </div>
                </div>
                <label>Photo de profil</label>
                <label for="pInp" id="pView" class="photo-box">📁 Ajouter une photo</label>
                <input type="file" id="pInp" style="display:none" accept="image/*" onchange="preview(event)">
                
                <button type="button" class="btn-final" onclick="save()">🚀 Finaliser mon profil</button>
            </form>
        </div>
        <script>
            function preview(e) {
                const r = new FileReader();
                r.onload = () => { 
                    document.getElementById('pView').style.backgroundImage = 'url('+r.result+')';
                    document.getElementById('pView').innerText = '';
                    localStorage.setItem('uPhoto', r.result);
                };
                r.readAsDataURL(e.target.files[0]);
            }
            function save() {
                const data = {
                    fn: document.getElementById('fn').value, ln: document.getElementById('ln').value,
                    dob: document.getElementById('dob').value, gs: document.getElementById('gs').value,
                    rh: document.getElementById('rh').value, gt: document.getElementById('gt').value,
                    kids: document.getElementById('kids').value
                };
                if(!data.fn || !data.gt) return alert("Veuillez remplir les champs obligatoires");
                localStorage.setItem('uData', JSON.stringify(data));
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 3. RECHERCHE (Avec Blocage SS Automatique) ---
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
            .opt-btn { padding: 8px; border: 1px solid #ddd; border-radius: 8px; background: white; font-size: 0.8rem; cursor: pointer; }
            .opt-btn.active { background: #ff416c; color: white; }
            .disabled { background: #eee; color: #ccc; cursor: not-allowed; text-decoration: line-through; }
            .warning { background: #fff5f5; color: #d32f2f; padding: 10px; border-radius: 10px; font-size: 0.8rem; margin-bottom: 15px; border: 1px solid #feb2b2; display: none; }
        </style>
    </head>
    <body>
        <div class="iphone">
            <h3>🔍 Recherche Avancée</h3>
            <div id="ssWarn" class="warning">⚠️ Profil SS : Recherche de partenaires SS bloquée par sécurité.</div>
            <p>Génotype recherché :</p>
            <div style="display:flex; gap:10px;">
                <button class="opt-btn">AA</button>
                <button class="opt-btn">AS</button>
                <button class="opt-btn" id="btnSS">SS</button>
            </div>
            <p>Seuil de compatibilité : <b>60% (Fixe)</b></p>
            <button style="width:100%; padding:15px; background:#ff416c; color:white; border:none; border-radius:10px; margin-top:20px;">Lancer la recherche</button>
        </div>
        <script>
            const user = JSON.parse(localStorage.getItem('uData'));
            if(user && user.gt === 'SS') {
                document.getElementById('ssWarn').style.display = 'block';
                document.getElementById('btnSS').classList.add('disabled');
                document.getElementById('btnSS').disabled = true;
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/dashboard', (req, res) => { res.send('<h1>Profil Enregistré !</h1><a href="/search">Aller à la recherche</a>'); });

app.listen(port, () => { console.log('Serveur Genlove en ligne sur le port ' + port); });
