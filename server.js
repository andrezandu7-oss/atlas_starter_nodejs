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
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
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

// --- PAGE D'INSCRIPTION CONFORME À LA MAQUETTE ---
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
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo { color: #ff416c; font-weight: bold; font-size: 1.2rem; }
            
            .progress-bar { background: #eee; height: 10px; border-radius: 10px; margin-bottom: 5px; }
            .fill { background: #4caf50; width: 60%; height: 100%; border-radius: 10px; }
            .score { text-align: center; color: #4caf50; font-weight: bold; font-size: 0.9rem; margin-bottom: 20px; }

            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            label { font-size: 0.8rem; font-weight: bold; color: #333; display: block; margin-top: 10px; }
            input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; margin-top: 5px; font-size: 0.9rem; box-sizing: border-box; }
            
            .error-text { color: red; font-size: 0.7rem; margin-top: 2px; }
            .btn-add-photo { background: #eee; border: 1px solid #ccc; padding: 10px; border-radius: 5px; cursor: pointer; text-align: center; font-size: 0.8rem; margin-top: 5px; }
            
            .info-box { background: #fffbe6; border: 1px solid #ffe58f; padding: 10px; border-radius: 10px; font-size: 0.75rem; margin-top: 15px; display: flex; align-items: center; }
            .upload-btn { border: 2px dashed #ff416c; padding: 12px; border-radius: 10px; text-align: center; color: #ff416c; font-size: 0.8rem; font-weight: bold; margin-top: 10px; cursor: pointer; }
            .video-btn { border: 2px dashed #2196F3; color: #2196F3; }

            .footer-btns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-top: 25px; }
            .btn-start { background: #4caf50; color: white; border: none; padding: 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
            .btn-back { background: #b0bec5; color: white; border: none; padding: 15px; border-radius: 5px; font-weight: bold; cursor: pointer; }
            .secure-note { text-align: center; font-size: 0.7rem; color: #888; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span style="font-weight:bold;">Créer votre profil</span>
                <span class="logo">🧬 Genlove</span>
            </div>

            <div class="progress-bar"><div class="fill"></div></div>
            <div class="score">Score de Confiance : 60% 🛡️</div>

            <form action="/">
                <div class="grid">
                    <div><label>Prénom :</label><input type="text" placeholder="Ton prénom" required></div>
                    <div><label>Nom :</label><input type="text" placeholder="Ton nom" required></div>
                </div>

                <label>Date de naissance :</label>
                <input type="date" value="2000-01-01" required>
                <div class="error-text">Âge minimum : 18 ans</div>

                <div class="grid" style="align-items: end;">
                    <div>
                        <label>Genre :</label>
                        <div style="font-size:0.8rem; margin-top:10px;">
                            <input type="checkbox" style="width:auto;"> Homme 
                            <input type="checkbox" style="width:auto; margin-left:10px;"> Femme
                        </div>
                    </div>
                    <div>
                        <label>Photo de profil :</label>
                        <div class="btn-add-photo">📁 Ajouter</div>
                    </div>
                </div>

                <p style="font-weight:bold; font-size:0.8rem; margin-top:20px;">Informations médicales (recommandées) :</p>
                <div class="grid">
                    <select><option>Groupe sanguin</option><option>A+</option><option>O+</option></select>
                    <select required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                </div>

                <div class="grid">
                    <div><label>Antécédents médicaux :</label><input type="text"></div>
                    <div><label>Allergies :</label><input type="text"></div>
                </div>

                <label>Autres infos (Statut actuel) :</label>
                <div style="font-size:0.75rem; display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;" checked> Célibataire</label>
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;"> Divorcé</label>
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;"> Veuf/Veuve</label>
                </div>

                <div class="info-box">
                    😊 Genlove est pour ceux qui cherchent l'amour — sélectionnez votre situation !
                </div>

                <div class="upload-btn">📄 Ajouter certificat médical (recommandé)</div>
                <p style="font-size:0.6rem; color:#888; margin:5px 0;">Verification : IA + revue manuelle pour authenticité (PDF/JPG valide)</p>

                <div class="upload-btn video-btn">🎥 Vidéo de vérification (20s max)</div>
                <p style="font-size:0.6rem; color:#888; margin:5px 0;">Instructions : Filmez-vous à 1m de distance, avec l'IA comparez votre visage à la photo.</p>

                <div class="footer-btns">
                    <button type="submit" class="btn-start">▶ Démarrer enregistrement</button>
                    <button type="button" class="btn-back" onclick="window.history.back()">Retour</button>
                </div>

                <div class="secure-note">🔒 Données chiffrées & sécurisées</div>
            </form>
        </div>
    </body>
    </html>
    `);
});

// --- ROUTE DASHBOARD (ANCIENS) ---
app.get('/dashboard', (req, res) => {
    res.send('<h1 style="text-align:center; margin-top:50px;">Bienvenue sur votre espace Genlove !</h1><center><a href="/">Retour</a></center>');
});

app.listen(port, () => { console.log('Genlove is running'); });
