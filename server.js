const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- ACCUEIL (DESIGN PROFESSIONNEL) ---
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
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; transition: 0.3s; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; color: white; }
            .btn:hover { opacity: 0.8; transform: scale(1.02); }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove </h1>
            <p>L’amour qui soigne 💙</p>
            <div class="quote">"L’amour seul ne suffit plus. Unissez cœur et santé pour bâtir des couples solides 💖"</div>
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup-full" class="btn btn-signup">📝 S’inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- FORMULAIRE D'INSCRIPTION (COPIE CONFORME MAQUETTE) ---
app.get('/signup-full', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Créer votre profil - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; margin: 0; padding: 10px; display: flex; justify-content: center; }
            .container { background: white; padding: 20px; border-radius: 25px; width: 100%; max-width: 450px; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
            .logo { color: #ff416c; font-weight: bold; font-size: 1.1rem; }
            .progress-bar { background: #eee; height: 8px; border-radius: 10px; margin: 10px 0 5px 0; }
            .fill { background: #4caf50; width: 60%; height: 100%; border-radius: 10px; }
            .score { text-align: center; color: #4caf50; font-weight: bold; font-size: 0.85rem; margin-bottom: 15px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            label { font-size: 0.75rem; font-weight: bold; color: #333; display: block; margin-top: 10px; }
            input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-top: 5px; font-size: 0.85rem; box-sizing: border-box; }
            .hidden-input { display: none; }
            .upload-btn { border: 2px dashed #ff416c; padding: 12px; border-radius: 12px; text-align: center; color: #ff416c; font-size: 0.8rem; font-weight: bold; margin-top: 10px; cursor: pointer; display: block; }
            .video-btn { border: 2px dashed #2196F3; color: #2196F3; }
            .info-yellow { background: #fffbe6; border: 1px solid #ffe58f; padding: 10px; border-radius: 12px; font-size: 0.75rem; margin-top: 15px; line-height: 1.3; color: #856404; }
            .note-small { font-size: 0.65rem; color: #777; margin: 4px 0 10px 0; line-height: 1.2; }
            .footer-btns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-top: 25px; }
            .btn-start { background: #4caf50; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; }
            .btn-back { background: #b0bec5; color: white; border: none; padding: 15px; border-radius: 10px; font-weight: bold; cursor: pointer; text-decoration:none; text-align:center; display: flex; align-items: center; justify-content: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">Créer votre profil</span>
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
                <div style="color:#ff416c; font-size:0.7rem; margin-top:3px; font-weight:bold;">Âge minimum : 18 ans</div>

                <div class="grid" style="align-items: end;">
                    <div><label>Genre :</label>
                        <div style="font-size:0.85rem; margin-top:10px;"><input type="radio" name="g" checked> H <input type="radio" name="g" style="margin-left:10px;"> F</div>
                    </div>
                    <div>
                        <label>Photo de profil :</label>
                        <label for="p" class="upload-btn" style="margin-top:0; padding:8px;">📁 Ajouter</label>
                        <input type="file" id="p" class="hidden-input" accept="image/*">
                    </div>
                </div>

                <p style="font-weight:bold; font-size:0.8rem; margin:20px 0 5px 0; color:#ff416c;">Informations médicales (recommandées) :</p>
                <div class="grid">
                    <select required>
                        <option value="">Groupe sanguin</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                    </select>
                    <select required>
                        <option value="">Génotype</option>
                        <option>AA</option><option>AS</option><option>SS</option>
                    </select>
                </div>

                <div class="grid">
                    <div><label>Antécédents :</label><input type="text" placeholder="Ex: Asthme"></div>
                    <div><label>Allergies :</label><input type="text" placeholder="Ex: Pénicilline"></div>
                </div>

                <label>Autres infos (Statut actuel) :</label>
                <div style="font-size:0.75rem; display:flex; gap:10px; margin-top:8px;">
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;" checked> Célibataire</label>
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;"> Divorcé</label>
                    <label style="font-weight:normal;"><input type="checkbox" style="width:auto;"> Veuf/Veuve</label>
                </div>

                <div class="info-yellow">
                    😊 Genlove est pour ceux qui cherchent l'amour — sélectionnez votre situation !
                </div>

                <label for="c" class="upload-btn">📄 Ajouter certificat médical</label>
                <input type="file" id="c" class="hidden-input" accept=".pdf,image/*">
                <p class="note-small">Verification : IA + revue manuelle pour authenticité (PDF/JPG valide).</p>

                <label for="v" class="upload-btn video-btn">🎥 Vidéo de vérification (20s max)</label>
                <input type="file" id="v" class="hidden-input" accept="video/*" capture="user">
                <p class="note-small">Instructions : Filmez-vous à 1m de distance, l'IA comparera votre visage à la photo.</p>

                <div class="footer-btns">
                    <button type="button" class="btn-start" onclick="alert('📸 Analyse biométrique lancée... Préparez-vous !')">▶ Démarrer enregistrement</button>
                    <a href="/" class="btn-back">Retour</a>
                </div>

                <div style="text-align:center; font-size:0.7rem; color:#888; margin-top:20px; padding-bottom:10px;">
                    🔒 Données chiffrées & sécurisées par Genlove
                </div>
            </form>
        </div>
    </body>
    </html>
    `);
});

// --- ROUTE POUR LES ANCIENS ---
app.get('/dashboard', (req, res) => {
    res.send('<body style="font-family:sans-serif; text-align:center; padding-top:100px;"><h1>Espace Membre</h1><p>Vérification du profil en cours...</p><a href="/">Retour accueil</a></body>');
});

app.listen(port, () => { console.log('Genlove is LIVE on port ' + port); });
             
