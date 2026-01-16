const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- ACCUEIL ---
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
            .btn { display: block; width: 100%; padding: 15px; margin-top: 20px; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; background: white; color: #ff416c; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p>L’amour qui soigne 💙</p>
            <a href="/signup-step2" class="btn">📝 Créer mon profil</a>
        </div>
    </body>
    </html>
    `);
});

// --- FORMULAIRE DÉTAILLÉ (SCORE 60%+) ---
app.get('/signup-step2', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profil Complet - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; margin: 0; padding: 20px; display: flex; justify-content: center; }
            .container { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 450px; }
            h2 { color: #ff416c; text-align: center; margin-bottom: 5px; }
            .progress-bar { background: #eee; border-radius: 10px; height: 10px; margin: 15px 0; }
            .fill { background: #4caf50; height: 100%; width: 60%; border-radius: 10px; }
            .score-text { text-align: center; color: #4caf50; font-weight: bold; margin-bottom: 20px; }
            
            label { display: block; margin-top: 15px; font-weight: bold; color: #555; font-size: 0.9rem; }
            input, select, textarea { width: 100%; padding: 12px; margin-top: 5px; border-radius: 10px; border: 1px solid #ddd; box-sizing: border-box; }
            
            .upload-section { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
            .upload-btn { border: 2px dashed #ff416c; padding: 15px; border-radius: 15px; text-align: center; cursor: pointer; color: #ff416c; font-size: 0.8rem; font-weight: bold; }
            
            .btn-final { background: #ff416c; color: white; border: none; width: 100%; padding: 15px; border-radius: 50px; font-weight: bold; margin-top: 30px; cursor: pointer; font-size: 1.1rem; }
            .footer { text-align: center; font-size: 0.75rem; color: #888; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Compléter mon profil</h2>
            <div class="progress-bar"><div class="fill"></div></div>
            <div class="score-text">Score de Confiance : 60% 🛡️</div>

            <form action="/" method="GET">
                <label>Nom & Prénom</label>
                <input type="text" placeholder="Ex: André Zandu" required>

                <label>Date de naissance</label>
                <input type="date" required>

                <label>Genre</label>
                <select required>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                </select>

                <label>Statut actuel</label>
                <select required>
                    <option value="celibataire">Célibataire</option>
                    <option value="divorce">Divorcé(e)</option>
                    <option value="veuf">Veuf/Veuve</option>
                </select>

                <label>Groupe Sanguin</label>
                <select required>
                    <option value="A+">A+</option><option value="O+">O+</option>
                    <option value="B+">B+</option><option value="AB+">AB+</option>
                    <option value="A-">A-</option><option value="O-">O-</option>
                </select>

                <label>Allergies ou Antécédents</label>
                <textarea placeholder="Ex: Asthme, Allergie pénicilline..." rows="2"></textarea>

                <div class="upload-section">
                    <div class="upload-btn">📸<br>Photo Profil</div>
                    <div class="upload-btn">📄<br>Preuve Médicale</div>
                </div>
                
                <div class="upload-btn" style="margin-top:10px; border-color: #2196F3; color: #2196F3;">
                    🎥 Vidéo de vérification (20s)
                </div>

                <button type="submit" class="btn-final">🚀 Finaliser mon inscription</button>

                <div class="footer">
                    🔒 Données chiffrées et sécurisées par Genlove
                </div>
            </form>
        </div>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove démarré sur ' + port); });
