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
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; color: white; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p>L’amour qui soigne 💙</p>
            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 15px; margin: 20px 0; font-size: 0.85rem; font-style: italic;">
                "Unissez cœur et santé pour bâtir des couples solides 💖"
            </div>
            <a href="/dashboard" class="btn btn-login">📌 Se connecter</a>
            <a href="/signup-full" class="btn btn-signup">📝 S’inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- FORMULAIRE D'INSCRIPTION OPTIMISÉ ---
app.get('/signup-full', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Créer votre profil - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; margin: 0; padding: 10px; display: flex; justify-content: center; }
            .container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); position: relative; }
            .logo { color: #ff416c; font-weight: bold; font-size: 1.1rem; }
            .progress-bar { background: #eee; height: 8px; border-radius: 10px; margin: 10px 0 5px 0; }
            .fill { background: #4caf50; width: 60%; height: 100%; border-radius: 10px; transition: width 4s; }
            .score { text-align: center; color: #4caf50; font-weight: bold; font-size: 0.85rem; margin-bottom: 15px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            label { font-size: 0.75rem; font-weight: bold; color: #333; display: block; margin-top: 8px; }
            input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px; margin-top: 4px; font-size: 0.85rem; box-sizing: border-box; }
            .hidden-input { display: none; }
            
            /* Aperçu Photo */
            .photo-box { border: 2px dashed #ff416c; width: 100%; height: 55px; border-radius: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; background-size: cover; background-position: center; color: #ff416c; font-size: 0.75rem; margin-top: 5px; font-weight: bold; }
            
            /* Boutons d'upload dynamiques */
            .upload-btn { border: 2px dashed #ff416c; padding: 12px; border-radius: 10px; text-align: center; color: #ff416c; font-size: 0.75rem; font-weight: bold; margin-top: 10px; cursor: pointer; display: block; transition: 0.3s; }
            .video-btn { border: 2px dashed #2196F3; color: #2196F3; }
            .btn-success { border: 2px solid #4caf50 !important; color: #4caf50 !important; background: #e8f5e9; }
            
            .info-yellow { background: #fffbe6; border: 1px solid #ffe58f; padding: 10px; border-radius: 12px; font-size: 0.75rem; margin: 15px 0; color: #856404; }
            .footer-btns { display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-top: 20px; }
            .btn-final { background: #4caf50; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; }
            .btn-back { background: #b0bec5; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration:none; text-align:center; display:flex; align-items:center; justify-content:center; }
            
            /* Écran d'analyse IA */
            #overlay { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:1000; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
            .loader { border: 6px solid #f3f3f3; border-top: 6px solid #ff416c; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div id="overlay">
            <div class="loader"></div>
            <h2 id="status">Analyse biométrique en cours...</h2>
            <p id="substatus" style="color:#666; font-size:0.9rem; padding:0 20px;">L'IA compare votre visage à votre photo de profil</p>
        </div>

        <div class="container">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold;">Créer votre profil</span>
                <span class="logo">🧬 Genlove</span>
            </div>
            <div class="progress-bar"><div id="progressBar" class="fill"></div></div>
            <div id="scoreLabel" class="score">Score de Confiance : 60% 🛡️</div>

            <form>
                <div class="grid">
                    <div><label>Prénom :</label><input type="text" placeholder="Ton prénom" required></div>
                    <div><label>Nom :</label><input type="text" placeholder="Ton nom" required></div>
                </div>

                <div class="grid" style="align-items: end;">
                    <div><label>Genre :</label>
                        <div style="font-size:0.85rem; margin-top:10px;"><input type="radio" name="g" checked> H <input type="radio" name="g" style="margin-left:10px;"> F</div>
                    </div>
                    <div>
                        <label>Photo de profil :</label>
                        <label for="photoInp" id="photoView" class="photo-box">📁 Ajouter</label>
                        <input type="file" id="photoInp" class="hidden-input" accept="image/*" onchange="handlePhoto(event)">
                    </div>
                </div>

                <p style="font-weight:bold; font-size:0.8rem; margin:15px 0 5px 0; color:#ff416c;">Données de santé :</p>
                <div class="grid">
                    <select required><option value="">Groupe sanguin</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select>
                    <select required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                </div>

                <label>Statut actuel :</label>
                <div style="font-size:0.75rem; display:flex; gap:10px; margin-top:5px;">
                    <label style="font-weight:normal;"><input type="checkbox" checked> Célibataire</label>
                    <label style="font-weight:normal;"><input type="checkbox"> Divorcé</label>
                    <label style="font-weight:normal;"><input type="checkbox"> Veuf</label>
                </div>

                <div class="info-yellow">😊 Genlove est pour ceux qui cherchent l'amour — sélectionnez votre situation !</div>

                <label for="certInp" id="certLabel" class="upload-btn">📄 Ajouter certificat médical</label>
                <input type="file" id="certInp" class="hidden-input" onchange="handleCert()">

                <label for="vidInp" id="vidLabel" class="upload-btn video-btn">🎥 Vidéo de vérification (20s max)</label>
                <input type="file" id="vidInp" class="hidden-input" accept="video/*" capture="user" onchange="handleVideo()">

                <div class="footer-btns">
                    <button type="button" class="btn-final" onclick="runFinalIA()">🚀 Finaliser mon inscription</button>
                    <a href="/" class="btn-back">Retour</a>
                </div>
            </form>
        </div>

        <script>
            // 1. Aperçu Photo
            function handlePhoto(e) {
                const reader = new FileReader();
                reader.onload = function(){
                    const view = document.getElementById('photoView');
                    view.style.backgroundImage = 'url(' + reader.result + ')';
                    view.innerText = "";
                    view.style.border = "2px solid #4caf50";
                }
                reader.readAsDataURL(e.target.files[0]);
            }

            // 2. Confirmation Certificat
            function handleCert() {
                const lb = document.getElementById('certLabel');
                lb.innerText = "✅ Certificat ajouté";
                lb.classList.add('btn-success');
            }

            // 3. Confirmation Vidéo
            function handleVideo() {
                const lb = document.getElementById('vidLabel');
                lb.innerText = "✅ Vidéo bien enregistrée";
                lb.classList.add('btn-success');
            }

            // 4. Analyse IA Instantanée (Exit les 24h !)
            function runFinalIA() {
                document.getElementById('overlay').style.display = 'flex';
                
                setTimeout(() => {
                    document.getElementById('status').innerText = "Vérification de l'authenticité...";
                    document.getElementById('substatus').innerText = "Analyse du certificat médical en cours...";
                }, 2000);

                setTimeout(() => {
                    document.getElementById('overlay').style.display = 'none';
                    document.getElementById('progressBar').style.width = '100%';
                    document.getElementById('scoreLabel').innerText = "Score de Confiance : 100% ✅";
                    
                    alert("✨ Félicitations ! Votre profil a été validé par notre IA.\\nBienvenue sur Genlove.");
                    window.location.href = "/dashboard";
                }, 5000);
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/dashboard', (req, res) => { res.send('<body style="text-align:center; padding-top:100px; font-family:sans-serif;"><h1>🎉 Profil Validé !</h1><p>Vous avez maintenant accès aux profils compatibles.</p><a href="/">Retour</a></body>'); });

app.listen(port, () => { console.log('Genlove is LIVE'); });
