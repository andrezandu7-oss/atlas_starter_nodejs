const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f4f7f6; display: flex; justify-content: center; color: #333; }
        .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; }
        .content { padding: 20px; text-align: center; }
        .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; box-sizing: border-box; }
        .btn-main { background: #ff416c; color: white; }
        .btn-blue { background: #2b6cb0; color: white; border-radius: 12px; }
        .input-group { text-align: left; margin-bottom: 12px; }
        label { font-size: 0.85rem; font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
        input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; background: #f8fafc; }
        
        /* RECHERCHE DESIGN */
        .search-section { background: #f8fafc; padding: 15px; border-radius: 15px; margin-bottom: 15px; text-align: left; }
        .section-title { font-size: 0.9rem; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
        .filter-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.85rem; }
        .chip-group { display: flex; gap: 5px; flex-wrap: wrap; }
        .chip { background: white; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 8px; font-size: 0.75rem; cursor: pointer; }
        .chip.active { background: #edf2f7; border-color: #2b6cb0; font-weight: bold; }
        .hidden-group { display: none; }
    </style>
`;

// --- 1. ACCUEIL CENTRÉ ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
        <div class="app-shell" style="background: transparent; justify-content: center;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); padding: 40px 30px; border-radius: 30px; width: 85%; margin: auto; color: white; text-align: center;">
                <h1>💞 Genlove 🧬</h1>
                <p>Unissez cœur et santé pour bâtir des couples <span style="text-decoration: underline;">SOLIDES</span></p>
                <a href="/dashboard" class="btn" style="background:white; color:#ff416c;">📌 Se connecter</a>
                <a href="/signup" class="btn" style="background:transparent; border:2px solid white; color:white;">📝 S'inscrire</a>
            </div>
        </div>
    </body>
    </html>
    `);
});

// --- 2. INSCRIPTION (Groupe Sanguin Inclus) ---
app.get('/signup', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content">
                <h2 style="color:#ff416c;">Inscription</h2>
                <form onsubmit="save(event)">
                    <label for="pInp" id="pPreview" style="border:2px dashed #ff416c; height:80px; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#ff416c; cursor:pointer; margin-bottom:15px;">📷 Photo de profil</label>
                    <input type="file" id="pInp" style="display:none" onchange="preview(event)">
                    
                    <div style="display:flex; gap:10px;">
                        <div class="input-group" style="flex:1;"><label>Prénom *</label><input type="text" id="fn" required></div>
                        <div class="input-group" style="flex:1;"><label>Nom *</label><input type="text" id="ln" required></div>
                    </div>
                    <div class="input-group"><label>Date de naissance *</label><input type="date" id="dob" required></div>
                    
                    <p style="color:#ff416c; font-size:0.8rem; font-weight:bold; text-align:left; margin:5px 0;">Groupe Sanguin & Rhésus *</p>
                    <div style="display:flex; gap:10px; margin-bottom:15px;">
                        <select id="gs" style="flex:1;"><option>Groupe Sanguin</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                        <select id="rh" style="flex:1;"><option>Rhésus</option><option>+</option><option>-</option></select>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <div class="input-group" style="flex:1;"><label>Génotype *</label><select id="gt"><option>AA</option><option>AS</option><option>SS</option></select></div>
                        <div class="input-group" style="flex:1;"><label>Projet de vie *</label><select id="kids"><option>Enfants ?</option><option>Oui</option><option>Non</option></select></div>
                    </div>

                    <label style="border:2px dashed #007bff; padding:12px; border-radius:10px; color:#007bff; font-weight:bold; display:block; margin:15px 0;" id="vLabel">🎥 Vidéo de vérification * <input type="file" accept="video/*" capture="user" style="display:none" onchange="document.getElementById('vLabel').innerText='✅ Vidéo OK'"></label>

                    <button type="submit" class="btn" style="background:#4caf50; color:white; border-radius:10px;">🚀 Finaliser mon profil</button>
                </form>
            </div>
        </div>
        <script>
            function preview(e) {
                const r = new FileReader();
                r.onload = () => { document.getElementById('pPreview').style.backgroundImage = 'url('+r.result+')'; document.getElementById('pPreview').innerText = ''; localStorage.setItem('uPhoto', r.result); };
                r.readAsDataURL(e.target.files[0]);
            }
            function save(e) {
                e.preventDefault();
                const d = { fn:document.getElementById('fn').value, ln:document.getElementById('ln').value, dob:document.getElementById('dob').value, gs:document.getElementById('gs').value, rh:document.getElementById('rh').value, gt:document.getElementById('gt').value, kids:document.getElementById('kids').value };
                localStorage.setItem('uData', JSON.stringify(d));
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 3. RECHERCHE (Localisation retirée & Bouton "->" actif) ---
app.get('/search', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content">
                <h3 style="text-align:left;">🔍 Rechercher Partenaires</h3>
                
                <div class="search-section">
                    <div class="section-title">Filtres de Base</div>
                    <div class="filter-row"><span>Âge (Range)</span> <div>25 à 35</div></div>
                    <div class="filter-row"><span>Intérêts communs</span> <input type="text" placeholder="Ajouter..." style="width:50%; padding:5px;"></div>
                </div>

                <div class="search-section">
                    <div class="section-title">Critères Médicaux</div>
                    <div class="filter-row"><span>Groupe Sanguin</span> 
                        <div class="chip-group">
                            <span class="chip active">Tous</span><span class="chip">AA</span><span class="chip">B</span>
                            <span class="chip" onclick="document.getElementById('moreGS').style.display='flex'">-></span>
                        </div>
                    </div>
                    <div id="moreGS" class="chip-group hidden-group" style="margin-top:5px; padding-top:5px; border-top:1px dashed #ccc;">
                        <span class="chip">AB</span><span class="chip">O</span>
                    </div>
                    <div class="filter-row" style="margin-top:10px;"><span>Génotype</span> 
                        <div class="chip-group">
                            <span class="chip active">AA</span><span class="chip">AS</span>
                            <span class="chip" id="chipSS">SS</span>
                        </div>
                    </div>
                </div>

                <div class="search-section">
                    <div class="section-title">Projet de Vie</div>
                    <div class="filter-row"><span>Désir d'enfants</span> 
                        <div class="chip-group"><span class="chip active">Oui</span><span class="chip">Non</span></div>
                    </div>
                    <div class="filter-row"><span>Compatibilité</span> <b style="color:#2b6cb0;">60%</b></div>
                </div>

                <button class="btn btn-blue" onclick="alert('Recherche en cours...')">🚀 Lancer la Recherche Avancée</button>
                <a href="/dashboard" style="color:#666; font-size:0.8rem; text-decoration:none;">⬅️ Retour au profil</a>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d && d.gt === 'SS') {
                document.getElementById('chipSS').style.display = 'none';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 4. PROFIL ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content">
                <img id="uP" src="" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; object-fit:cover; margin-bottom:15px;">
                <h2 id="uN">Utilisateur</h2>
                <div style="text-align:left; border-top:1px solid #eee; margin-top:20px;">
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;"><span>Génotype</span> <b id="uG"></b></div>
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;"><span>Groupe</span> <b id="uGs"></b></div>
                </div>
                <a href="/search" class="btn btn-main" style="margin-top:30px;">🔍 Trouver un partenaire</a>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) {
                document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
                document.getElementById('uG').innerText = d.gt;
                document.getElementById('uGs').innerText = d.gs + d.rh;
            }
            document.getElementById('uP').src = localStorage.getItem('uPhoto') || 'https://via.placeholder.com/120';
        </script>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove Final UI Live'); });
        
