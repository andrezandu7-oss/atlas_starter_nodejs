const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- SYSTÈME DE DESIGN GENLOVE ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    .content { padding: 20px; text-align: center; flex: 1; }
    
    /* Boutons */
    .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; transition: 0.3s; }
    .btn-main { background: #4caf50; color: white; }
    .btn-white { background: white; color: #ff416c; }
    .btn-outline { background: transparent; border: 2px solid white; color: white; }
    .btn-logout { background: #f8f9fa; color: #666; border: 1px solid #eee; margin-top: 25px; font-size: 1rem; }
    
    /* Zone Photo Cercle */
    .photo-upload { 
        border: 2px dashed #ff416c; 
        height: 110px; width: 110px; 
        border-radius: 50%; 
        display: flex; align-items: center; justify-content: center; 
        color: #ff416c; cursor: pointer; 
        margin: 0 auto 15px auto; 
        background-size: cover; background-position: center;
        font-size: 0.75rem; font-weight: bold;
    }

    /* Formulaires */
    .card { background: #f8fafc; padding: 15px; border-radius: 18px; text-align: left; margin-bottom: 15px; border: 1px solid #edf2f7; }
    label { display: block; font-size: 0.8rem; font-weight: bold; color: #555; margin-bottom: 5px; }
    input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; margin-top: 5px; box-sizing: border-box; font-size: 1rem; color: #333; }
    select:invalid { color: #999; }
    .row { display: flex; gap: 10px; margin-bottom: 10px; }
    
    /* Bouton Vidéo Obligatoire */
    .video-btn { border: 2px dashed #007bff; padding: 15px; border-radius: 15px; color: #007bff; font-weight: bold; margin: 15px 0; cursor: pointer; font-size: 0.9rem; transition: 0.3s; }
    .video-success { border-color: #4caf50; color: #4caf50; background: #f0fff4; }
</style>
`;

// --- 1. ÉCRAN D'ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
        <div class="app-shell" style="background: transparent; justify-content: center;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); padding: 40px 30px; border-radius: 30px; width: 85%; margin: auto; color: white; text-align: center;">
                <h1 style="font-size:2.5rem; margin:0;">💞 Genlove 🧬</h1>
                <p style="margin: 20px 0; font-weight: bold;">Unissez cœur et santé pour bâtir des couples SOLIDES</p>
                <a href="/signup" class="btn btn-white">📝 Créer mon profil</a>
                <a href="/login" class="btn btn-outline">📌 Se connecter</a>
            </div>
        </div>
    </body></html>`);
});

// --- 2. INSCRIPTION (AVEC TOUTES LES CORRECTIONS) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <h2 style="color:#ff416c; margin-top:0;">Inscription</h2>
            
            <form onsubmit="return validateAndSave(event)">
                <label for="pInp" id="pP" class="photo-upload">📸 Photo</label>
                <input type="file" id="pInp" accept="image/*" style="display:none" onchange="preview(event)" required>
                
                <div class="row">
                    <div style="flex:1;"><label>Prénom</label><input type="text" id="fn" placeholder="Ex: Éric" required></div>
                    <div style="flex:1;"><label>Nom</label><input type="text" id="ln" placeholder="Ex: Tre" required></div>
                </div>

                <div style="margin-bottom:15px;"><label>Date de naissance</label><input type="date" id="dob" required></div>
                
                <div class="row">
                    <div style="flex:1;"><label>Groupe Sanguin</label>
                        <select id="gs" required><option value="" disabled selected>Groupe...</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select>
                    </div>
                    <div style="flex:1;"><label>Rhésus</label>
                        <select id="rh" required><option value="" disabled selected>Rhésus...</option><option value="+">+</option><option value="-">-</option></select>
                    </div>
                </div>

                <div class="row">
                    <div style="flex:1;"><label>Génotype</label>
                        <select id="gt" required><option value="" disabled selected>Génotype...</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
                    </div>
                    <div style="flex:1;"><label>Désir d'enfant ?</label>
                        <select id="kids" required><option value="" disabled selected>Choisir...</option><option value="Oui">Oui</option><option value="Non">Non</option><option value="Neutre">Neutre</option></select>
                    </div>
                </div>

                <div style="margin-bottom:15px; text-align:left;">
                    <label>Antécédents / Allergies</label>
                    <input type="text" id="med" placeholder="Ex: Asthme, Pénicilline">
                </div>

                <div class="video-btn" id="vL" onclick="document.getElementById('vI').click()">🎥 Vidéo de vérification obligatoire *</div>
                <input type="file" id="vI" accept="video/*" capture="user" style="display:none" onchange="videoDone()">
                
                <button type="submit" class="btn btn-main">🚀 Finaliser mon profil</button>
            </form>
        </div></div>

        <script>
            let videoUploaded = false;

            function preview(e) {
                const file = e.target.files[0];
                if (file) {
                    const r = new FileReader();
                    r.onload = () => { 
                        const el = document.getElementById('pP');
                        el.style.backgroundImage = 'url('+r.result+')'; 
                        el.innerText = '';
                        localStorage.setItem('uPhoto', r.result); 
                    };
                    r.readAsDataURL(file);
                }
            }

            function videoDone() {
                videoUploaded = true;
                const vBtn = document.getElementById('vL');
                vBtn.innerText = '✅ Vidéo enregistrée';
                vBtn.classList.add('video-success');
            }

            function validateAndSave(e) {
                e.preventDefault();
                if(!videoUploaded) {
                    alert("Veuillez enregistrer votre vidéo de vérification pour continuer.");
                    return false;
                }
                const d = { 
                    fn:document.getElementById('fn').value, ln:document.getElementById('ln').value, 
                    dob:document.getElementById('dob').value, gs:document.getElementById('gs').value, 
                    rh:document.getElementById('rh').value, gt:document.getElementById('gt').value, 
                    kids:document.getElementById('kids').value 
                };
                localStorage.setItem('uData', JSON.stringify(d));
                window.location.href = '/dashboard';
            }
        </script>
    </body></html>`);
});

// --- 3. DASHBOARD ---
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <img id="uP" src="" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; object-fit:cover; margin-top:20px;">
            <h2 id="uN">Utilisateur</h2>
            <div class="card">
                <p>🎂 <b>Né(e) le :</b> <span id="uD"></span></p>
                <p>🧬 <b>Génotype :</b> <span id="uG"></span></p>
                <p>🩸 <b>Groupe :</b> <span id="uGs"></span></p>
                <p>👶 <b>Désir d'enfant :</b> <span id="uK"></span></p>
            </div>
            <a href="/search" class="btn btn-main" style="background:#ff416c;">🔍 Trouver un partenaire</a>
            <a href="/" class="btn btn-logout">Déconnexion</a>
        </div></div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) {
                document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
                document.getElementById('uD').innerText = d.dob;
                document.getElementById('uG').innerText = d.gt;
                document.getElementById('uGs').innerText = 'Groupe ' + d.gs + d.rh;
                document.getElementById('uK').innerText = d.kids;
            }
            document.getElementById('uP').src = localStorage.getItem('uPhoto') || 'https://via.placeholder.com/120';
        </script>
    </body></html>`);
});

app.listen(port, () => { console.log('Genlove V10 Final Ready'); });
        
