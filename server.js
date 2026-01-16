const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- PAGE D'ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove - L'amour qui soigne</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); }
            h1 { font-size: 2.5rem; margin: 0; }
            .quote { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 20px; font-style: italic; margin: 20px 0; font-size: 0.9rem; }
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p>L’amour qui soigne 💙</p>
            <div class="quote">"L’amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides 💖"</div>
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup-full" class="btn btn-signup">📝 S’inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- PAGE D'INSCRIPTION FONCTIONNELLE ---
app.get('/signup-full', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Créer votre profil - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; margin: 0; padding: 15px; display: flex; justify-content: center; }
            .container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .logo { color: #ff416c; font-weight: bold; font-size: 1.2rem; }
            .progress-bar { background: #eee; height: 10px; border-radius: 10px; margin-bottom: 5px; }
            .fill { background: #4caf50; width: 60%; height: 100%; border-radius: 10px; }
            .score { text-align: center; color: #4caf50; font-weight: bold; font-size: 0.9rem; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            label { font-size: 0.8rem; font-weight: bold; color: #333; display: block; margin-top: 10px; }
            input, select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-top: 5px; font-size: 0.9rem; box-sizing: border-box; }
            
            /* Styles des boutons fichiers cachés */
            .hidden-input { display: none; }
            .upload-btn { border: 2px dashed #ff416c; padding: 12px; border-radius: 10px; text-align: center; color: #ff416c; font-size: 0.8rem; font-weight: bold; margin-top: 10px; cursor: pointer; display: block; }
            .video-btn { border: 2px dashed #2196F3; color: #2196F3; }
            
            .footer-btns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-top: 25px; }
            .btn-start { background: #4caf50; color: white; border: none; padding: 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
            .btn-back { background: #b0bec5; color: white; border: none; padding: 15px; border-radius: 5px; font-weight: bold; cursor: pointer; text-decoration:none; text-align:center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div style="display:flex; justify-content:space-between;">
                <span style="font-weight:bold;">Créer votre profil</span>
                <span class="logo">🧬 Genlove</span>
            </div>
            <div class="progress-bar" style="margin-top:10px;"><div class="fill"></div></div>
            <div class="score">Score de Confiance : 60% 🛡️</div>

            <form id="regForm">
                <div class="grid">
                    <div><label>Prénom :</label><input type="text" required></div>
                    <div><label>Nom :</label><input type="text" required></div>
                </div>

                <label>Date de naissance :</label>
                <input type="date" value="2000-01-01" required>

                <div class="grid" style="align-items: end; margin-top:10px;">
                    <div><label>Genre :</label>
                        <div style="font-size:0.8rem;"><input type="radio" name="g" checked> H <input type="radio" name="g"> F</div>
                    </div>
                    <div>
                        <label>Photo de profil :</label>
                        <label for="photo-upload" class="upload-btn" style="margin-top:5px; padding:8px;">📁 Ajouter</label>
                        <input type="file" id="photo-upload" class="hidden-input" accept="image/*">
                    </div>
                </div>

                <div class="grid" style="margin-top:10px;">
                    <select><option>Groupe Sanguin</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select>
                    <select required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                </div>

                <label for="cert-upload" class="upload-btn">📄 Ajouter certificat médical</label>
                <input type="file" id="cert-upload" class="hidden-input" accept=".pdf,image/*">

                <label for="video-upload" class="upload-btn video-btn">🎥 Vidéo de vérification (20s max)</label>
                <input type="file" id="video-upload" class="hidden-input" accept="video/*" capture="user">

                <div class="footer-btns">
                    <button type="button" class="btn-start" onclick="alert('Enregistrement et vérification IA en cours...')">▶ Démarrer enregistrement</button>
                    <a href="/" class="btn-back">Retour</a>
                </div>
            </form>
        </div>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove actif'); });
