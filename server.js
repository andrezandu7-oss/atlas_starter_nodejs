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
        <title>Genlove - L'amour qui soigne</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); }
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p>L’amour qui soigne 💙</p>
            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 15px; margin: 20px 0; font-size: 0.85rem;">"L’amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides 💖"</div>
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup-full" class="btn btn-signup">📝 S’inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- INSCRIPTION VERSION MAQUETTE TOTALE ---
app.get('/signup-full', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Créer votre profil - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; margin: 0; padding: 10px; display: flex; justify-content: center; }
            .container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .logo { color: #ff416c; font-weight: bold; font-size: 1.1rem; }
            .progress-bar { background: #eee; height: 8px; border-radius: 10px; margin: 10px 0 5px 0; }
            .fill { background: #4caf50; width: 60%; height: 100%; border-radius: 10px; }
            .score { text-align: center; color: #4caf50; font-weight: bold; font-size: 0.85rem; margin-bottom: 15px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            label { font-size: 0.75rem; font-weight: bold; color: #333; display: block; margin-top: 8px; }
            input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px; margin-top: 4px; font-size: 0.85rem; box-sizing: border-box; }
            .hidden-input { display: none; }
            .upload-btn { border: 2px dashed #ff416c; padding: 10px; border-radius: 10px; text-align: center; color: #ff416c; font-size: 0.75rem; font-weight: bold; margin-top: 10px; cursor: pointer; display: block; }
            .video-btn { border: 2px dashed #2196F3; color: #2196F3; }
            .info-yellow { background: #fffbe6; border: 1px solid #ffe58f; padding: 8px; border-radius: 10px; font-size: 0.7rem; margin-top: 10px; line-height: 1.2; }
            .note-small { font-size: 0.6rem; color: #888; margin: 4px 0 10px 0; line-height: 1.1; }
            .footer-btns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-top: 20px; }
            .btn-start { background: #4caf50; color: white; border: none; padding: 12px; border-radius: 5px; font-weight: bold; cursor: pointer; }
            .btn-back { background: #b0bec5; color: white; border: none; padding: 12px; border-radius: 5px; font-weight: bold; cursor: pointer; text-decoration:none; text-align:center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; font-size:0.9rem;">Créer votre profil</span>
                <span class="logo">🧬 Genlove</span>
            </div>
            <div class="progress-bar"><div class="fill"></div></div>
            <div class="score">Score de Confiance : 60% 🛡️</div>

            <form>
                <div class="grid">
                    <div><label>Prénom :</label><input type="text" placeholder="Ton prénom" required></div>
                    <div><label>Nom :</label><input type="text" placeholder="Ton nom" required></div>
                </div>

                <label>Date de naissance :</label>
                <input type="date" value="2000-01-01" required>
                <div style="color:red; font-size:0.65rem;">Âge minimum : 18 ans</div>

                <div class="grid" style="align-items: end;">
                    <div><label>Genre :</label>
                        <div style="font-size:0.8rem; margin-top:5px;"><input type="radio" name="g" checked> Homme <input type="radio" name="g"> Femme</div>
                    </div>
                    <div>
                        <label>Photo de profil :</label>
                        <label for="p" class="upload-btn" style="margin-top:0; padding:6px;">📁 Ajouter</label>
                        <input type="file" id="p" class="hidden-input" accept="image/*">
                    </div>
                </div>

                <p style="font-weight:bold; font-size:0.75rem; margin:15px 0 5px 0;">Informations médicales (recommandées) :</p>
                <div class="grid">
                    <select><option>Groupe sanguin</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select>
                    <select><option>Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                </div>

                <div class="grid">
                    <div><label>Antécédents médicaux :</label><input type="text"></div>
                    <div><label>Allergies :</label><input type="text"></div>
                </div>

                <label>Autres infos (Statut actuel) :</label>
                <div style="font-size:0.7rem; display:flex; gap:8px; margin-top:5px;">
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;" checked> Célibataire</label>
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;"> Divorcé</label>
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;"> Veuf/Veuve</label>
                </div>

                <div class="info-yellow">
                    😊 Genlove est pour ceux qui cherchent l'amour — sélectionnez votre situation !
                </div>

                <label for="c" class="upload-btn">📄 Ajouter certificat médical (recommandé)</label>
                <input type="file" id="c" class="hidden-input">
                <p class="note-small">Verification : IA + revue manuelle pour authenticité (PDF/JPG valide d'un médecin agréé)</p>

                <label for="v" class="upload-btn video-btn">🎥 Vidéo de vérification (20s max)</label>
                <input type="file" id="v" class="hidden-input" accept="video/*" capture="user">
                <p class="note-small">Instructions : Filmez-vous à 1m de distance, avec l'IA comparez votre visage à la photo de profil.</p>

                <div class="footer-btns">
                    <button type="button" class="btn-start" onclick="alert('Lancement de la vérification...')">▶ Démarrer enregistrement</button>
                    <a href="/" class="btn-back">Retour</a>
                </div>

                <div style="text-align:center; font-size:0.65rem; color:#888; margin-top:15px;">
                    🔒 Données chiffrées & sécurisées
                </div>
            </form>
        </div>
    </body>
    </html>
    `);
});

app.get('/dashboard', (req, res) => { res.send('<h1>Bienvenue !</h1><a href="/">Retour</a>'); });
app.listen(port, () => { console.log('Genlove is ready'); });
