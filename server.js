const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f4f7f6; display: flex; justify-content: center; }
        .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.05); position: relative; }
        .content { padding: 20px; text-align: center; }
        .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 14px; margin: 8px 0; border-radius: 12px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 0.95rem; }
        .btn-main { background: #ff416c; color: white; border-radius: 50px; }
        .btn-blue { background: #2b6cb0; color: white; }
        .btn-gray { background: #edf2f7; color: #4a5568; }
        .btn-light-pink { background: #fff5f7; color: #ff416c; border: 1px solid #fed7e2; }
        
        /* SCAN ANIMATION */
        #loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; }
        .scanner { width: 100px; height: 100px; border: 3px solid #ff416c; border-radius: 50%; position: relative; overflow: hidden; }
        .scanner::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #ff416c; animation: scan 1.5s infinite; }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

        /* MATCH CARDS */
        .match-card { background: white; border-radius: 20px; padding: 20px; margin-bottom: 20px; border: 1px solid #f0f0f0; text-align: left; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .avatar-blur { width: 60px; height: 60px; border-radius: 50%; background: #eee; filter: blur(5px); }
        .compatibility-badge { background: #ebf8ff; color: #2b6cb0; padding: 5px 10px; border-radius: 8px; font-weight: bold; font-size: 0.9rem; margin: 10px 0; display: inline-block; }
    </style>
`;

// --- 1. ACCUEIL (Design Premium) ---
app.get('/', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
        <div class="app-shell" style="background:transparent; display:flex; align-items:center;">
            <div style="background:rgba(255,255,255,0.2); backdrop-filter:blur(15px); padding:40px; border-radius:30px; width:80%; margin:auto; color:white; border:1px solid rgba(255,255,255,0.3); text-align:center;">
                <h1 style="margin:0;">💞 Genlove 🧬</h1>
                <p>Bâtissez des couples <b>SOLIDES</b></p>
                <a href="/dashboard" class="btn btn-main" style="background:white; color:#ff416c;">📌 Se connecter</a>
                <a href="/signup" class="btn btn-main" style="background:transparent; border:2px solid white; color:white;">📝 S'inscrire</a>
            </div>
        </div>
    </body></html>`);
});

// --- 2. INSCRIPTION COMPLÈTE ---
app.get('/signup', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <h2 style="color:#ff416c;">Inscription</h2>
            <form onsubmit="save(event)">
                <label for="pInp" id="pP" style="border:2px dashed #ff416c; height:80px; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#ff416c; cursor:pointer; margin-bottom:15px; background-size:cover;">📷 Photo</label>
                <input type="file" id="pInp" style="display:none" onchange="preview(event)">
                <input type="text" id="fn" placeholder="Prénom" style="width:100%; padding:12px; margin-bottom:10px; border-radius:10px; border:1px solid #ddd;" required>
                <input type="text" id="ln" placeholder="Nom" style="width:100%; padding:12px; margin-bottom:10px; border-radius:10px; border:1px solid #ddd;" required>
                <input type="date" id="dob" style="width:100%; padding:12px; margin-bottom:10px; border-radius:10px; border:1px solid #ddd;" required>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <select id="gt" style="flex:1; padding:12px; border-radius:10px;"><option>AA</option><option>AS</option><option>SS</option></select>
                    <select id="kids" style="flex:1; padding:12px; border-radius:10px;"><option>Enfants: Oui</option><option>Non</option><option>Neutre</option></select>
                </div>
                <button type="submit" class="btn btn-main" style="background:#4caf50;">🚀 Finaliser mon profil</button>
            </form>
        </div></div>
        <script>
            function preview(e) {
                const r = new FileReader();
                r.onload = () => { document.getElementById('pP').style.backgroundImage = 'url('+r.result+')'; document.getElementById('pP').innerText = ''; };
                r.readAsDataURL(e.target.files[0]);
            }
            function save(e) { e.preventDefault(); window.location.href = '/dashboard'; }
        </script>
    </body></html>`);
});

// --- 3. RECHERCHE (SANS LOCALISATION) ---
app.get('/search', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <h3 style="text-align:left;">🔍 Recherche de Partenaires</h3>
            <div style="background:#f8fafc; padding:15px; border-radius:15px; text-align:left; margin-bottom:15px;">
                <p style="font-size:0.8rem; font-weight:bold; margin-bottom:10px;">Critères de Base</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Âge</span>
                    <div style="display:flex; align-items:center; gap:5px;">De <select><option>20</option></select> à <select><option>35</option></select></div>
                </div>
            </div>
            <div style="background:#f8fafc; padding:15px; border-radius:15px; text-align:left; margin-bottom:20px;">
                <p style="font-size:0.8rem; font-weight:bold; margin-bottom:10px;">Critères Médicaux</p>
                <div style="display:flex; gap:10px;">
                    <div style="padding:8px 15px; background:white; border:1px solid #2b6cb0; border-radius:8px; font-size:0.8rem; color:#2b6cb0;">AA</div>
                    <div style="padding:8px 15px; background:white; border:1px solid #ddd; border-radius:8px; font-size:0.8rem;">AS</div>
                </div>
            </div>
            <button class="btn btn-blue" onclick="window.location.href='/results'">🚀 Lancer la Recherche Avancée</button>
        </div></div>
    </body></html>`);
});

// --- 4. RÉSULTATS (AVEC ANIMATION SCAN) ---
app.get('/results', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div id="loader">
                <div class="scanner"></div>
                <p style="margin-top:20px; font-weight:bold; color:#ff416c;">Analyse de compatibilité en cours...</p>
                <p style="font-size:0.8rem; color:#666;">Vérification des données médicales</p>
            </div>

            <div id="results" class="content" style="display:none;">
                <h3 style="margin-top:0;">❤️ Partenaires Compatibles</h3>
                <div class="match-card">
                    <div style="display:flex; gap:15px; align-items:center;">
                        <div class="avatar-blur"></div>
                        <div>
                            <h4 style="margin:0;">PROFIL 1</h4>
                            <p style="margin:2px 0; font-size:0.8rem; color:#718096;">Âge similaire (26 ans)</p>
                            <span style="font-size:0.7rem; color:#e53e3e; font-weight:bold;">🩸 Groupe : Compatible</span>
                        </div>
                    </div>
                    <div class="compatibility-badge">Compatibilité : 78%</div>
                    <button class="btn btn-gray">Voir Détails (Anonymes)</button>
                    <button class="btn btn-light-pink">Envoyer une Demande</button>
                </div>
                <a href="/search" style="color:#999; font-size:0.8rem; text-decoration:none;">⬅️ Modifier la recherche</a>
            </div>
        </div>
        <script>
            setTimeout(() => {
                document.getElementById('loader').style.display = 'none';
                document.getElementById('results').style.display = 'block';
            }, 3000);
        </script>
    </body></html>`);
});

// --- 5. DASHBOARD ---
app.get('/dashboard', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <div style="width:100px; height:100px; border-radius:50%; background:#eee; margin:20px auto; border:3px solid #ff416c;"></div>
            <h2>André Zandu</h2>
            <div style="text-align:left; border-top:1px solid #eee; margin-top:20px; padding-top:10px;">
                <p><b>Génotype:</b> AA</p>
                <p><b>Désir d'enfants:</b> Oui</p>
            </div>
            <a href="/search" class="btn btn-main">🔍 Trouver un partenaire</a>
        </div></div>
    </body></html>`);
});

app.listen(port, () => { console.log('Genlove V4 with Medical Scan ready'); });
    
