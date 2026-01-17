const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLE GLOBAL (MOBILE FIRST) ---
const styles = `
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #f4f7f6; display: flex; justify-content: center; color: #333; }
        .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
        .content { padding: 20px; }
        .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; transition: 0.3s; }
        .btn-main { background: #ff416c; color: white; }
        .btn-blue { background: #2b6cb0; color: white; border-radius: 12px; }
        .input-group { text-align: left; margin-bottom: 12px; }
        label { font-size: 0.85rem; font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
        input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; font-size: 1rem; background: #f8fafc; }
        
        /* SEARCH SCREEN SPECIFIC */
        .search-section { background: #f8fafc; padding: 15px; border-radius: 15px; margin-bottom: 15px; text-align: left; }
        .section-title { font-size: 0.9rem; font-weight: bold; color: #1a202c; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .filter-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 0.85rem; }
        .chip-group { display: flex; gap: 5px; overflow-x: auto; padding-bottom: 5px; }
        .chip { background: white; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; cursor: pointer; }
        .chip.active { background: #edf2f7; border-color: #2b6cb0; font-weight: bold; }
        .note-box { background: #ebf4ff; border-radius: 12px; padding: 15px; margin-bottom: 20px; text-align: left; border-left: 4px solid #2b6cb0; }
    </style>
`;

// --- 1. ACCUEIL (Design Premium Centré) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
        <div class="app-shell" style="background: transparent; justify-content: center;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); padding: 40px 30px; border-radius: 30px; width: 85%; margin: auto; border: 1px solid rgba(255,255,255,0.3); color: white; text-align: center;">
                <h1 style="font-size:2.8rem; margin:0;">💞 Genlove 🧬</h1>
                <p style="margin: 15px 0; opacity: 0.9;">"L'amour qui prend soin de votre avenir."</p>
                <p style="font-weight: bold; margin-bottom: 35px;">Unissez cœur et santé pour bâtir des couples <span style="text-decoration: underline;">SOLIDES</span></p>
                <a href="/dashboard" class="btn" style="background:white; color:#ff416c;">📌 Se connecter</a>
                <a href="/signup" class="btn" style="background:transparent; border:2px solid white; color:white;">📝 S'inscrire</a>
            </div>
        </div>
    </body>
    </html>
    `);
});

// --- 2. INSCRIPTION (Photo, Vidéo, Date, Projet de vie) ---
app.get('/signup', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content">
                <h2 style="color:#ff416c; margin-top:0; display:flex; justify-content:space-between; align-items:center;">Inscription <span style="font-size:0.8rem; color:#ff416c;">🧬 Genlove</span></h2>
                <form onsubmit="save(event)">
                    <label for="pInp" id="pPreview" style="border:2px dashed #ff416c; height:100px; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#ff416c; cursor:pointer; margin-bottom:20px; background-size:cover; background-position:center;">📷 Photo de profil</label>
                    <input type="file" id="pInp" style="display:none" accept="image/*" onchange="preview(event)">
                    
                    <div style="display:flex; gap:10px;">
                        <div class="input-group" style="flex:1;"><label>Prénom *</label><input type="text" id="fn" placeholder="André" required></div>
                        <div class="input-group" style="flex:1;"><label>Nom *</label><input type="text" id="ln" placeholder="Zandu" required></div>
                    </div>

                    <div class="input-group"><label>Date de naissance *</label><input type="date" id="dob" required></div>

                    <div style="display:flex; gap:10px;">
                        <div class="input-group" style="flex:1;"><label>Génotype *</label><select id="gt" required><option>AA</option><option>AS</option><option>SS</option></select></div>
                        <div class="input-group" style="flex:1;"><label>Projet de vie *</label><select id="kids"><option>Enfants ?</option><option value="Oui">Oui</option><option value="Non">Non</option></select></div>
                    </div>

                    <label style="border:2px dashed #007bff; padding:15px; border-radius:12px; color:#007bff; font-weight:bold; cursor:pointer; display:block; text-align:center; margin:15px 0;" id="vLabel">🎥 Vidéo de vérification obligatoire * <input type="file" accept="video/*" capture="user" style="display:none" onchange="document.getElementById('vLabel').innerText='✅ Vidéo prête'"></label>

                    <button type="submit" class="btn" style="background:#4caf50; color:white; border-radius:12px;">🚀 Finaliser mon profil</button>
                    <a href="/" style="display:block; margin-top:10px; color:#999; text-decoration:none; font-size:0.9rem;">Retour</a>
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
                const d = { fn:document.getElementById('fn').value, ln:document.getElementById('ln').value, dob:document.getElementById('dob').value, gt:document.getElementById('gt').value, kids:document.getElementById('kids').value };
                localStorage.setItem('uData', JSON.stringify(d));
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 3. RECHERCHE AVANCÉE (Fidèle à l'image fournie) ---
app.get('/search', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell" style="background:#fff;">
            <div class="content">
                <h3 style="text-align:left; margin-top:0;">🔍 Rechercher Partenaires</h3>
                
                <div class="note-box">
                    <b style="font-size:0.9rem;">ℹ️ Note Importante :</b>
                    <p style="font-size:0.75rem; margin:5px 0; line-height:1.3; color:#4a5568;">Les résultats de cette recherche concernent la compatibilité uniquement. Les identités restent confidentielles jusqu'à l'établissement du contact mutuel.</p>
                </div>

                <div class="search-section">
                    <div class="section-title">Filtres de Base (Classique)</div>
                    <div class="filter-row"><span>Âge (Range)</span> <div><input type="number" value="25" style="width:40px; padding:2px;"> à <input type="number" value="35" style="width:40px; padding:2px;"></div></div>
                    <div class="filter-row"><span>Localisation</span> <span class="chip">10 km</span></div>
                    <div class="filter-row"><span>Intérêts communs</span> <input type="text" placeholder="Ajouter..." style="width:60%; padding:5px;"></div>
                </div>

                <div class="search-section">
                    <div class="section-title">Critères Genlove (Avancé)</div>
                    <div class="filter-row"><span>Validation de Profil</span> <span class="chip active">Vérifié ✅</span></div>
                    <div class="filter-row"><span>Groupe Sanguin</span> 
                        <div class="chip-group"><span class="chip">Tous</span><span class="chip active">AA</span><span class="chip">B</span><span class="chip">-></span></div>
                    </div>
                    <div class="filter-row"><span>Génotype</span> 
                        <div class="chip-group">
                            <span class="chip">AA</span><span class="chip">AS</span>
                            <span class="chip" id="chipSS">SS</span>
                        </div>
                    </div>
                    <div class="filter-row"><span>Rhesus</span> 
                        <div class="chip-group"><span class="chip">Tous</span><span class="chip active">Positif</span><span class="chip">Négatif</span></div>
                    </div>
                </div>

                <div class="search-section">
                    <div class="section-title">Critères de Projet de Vie</div>
                    <div class="filter-row"><span>Désir d'enfants</span> 
                        <div class="chip-group"><span class="chip active">Oui</span><span class="chip">Non</span><span class="chip">Neutre</span></div>
                    </div>
                    <div class="filter-row"><span>Seuil de Compatibilité**</span> <span style="font-weight:bold; color:#2b6cb0;">60%</span></div>
                </div>

                <button class="btn btn-blue">🚀 Lancer la Recherche Avancée</button>
                <a href="/dashboard" style="display:block; margin-top:10px; color:#666; font-size:0.8rem; text-decoration:none;">⬅️ Retour au profil</a>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d && d.gt === 'SS') {
                const s = document.getElementById('chipSS');
                s.style.display = 'none'; // Sécurité : Bloque l'accès aux autres SS
                alert("Sécurité : Les profils SS ont été masqués pour votre compatibilité.");
            }
        </script>
    </body>
    </html>
    `);
});

// --- 4. DASHBOARD (Données visibles) ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content" style="text-align:center;">
                <img id="uP" src="" style="width:130px; height:130px; border-radius:50%; border:4px solid #ff416c; object-fit:cover; margin-top:20px;">
                <h2 id="uN">André Zandu</h2>
                <div style="text-align:left; border-top:1px solid #eee; margin-top:20px; font-size:1.1rem;">
                    <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #eee;"><span>Né(e) le</span> <b id="uD">1990-03-11</b></div>
                    <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #eee;"><span>Génotype</span> <b id="uG">AA</b></div>
                    <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #eee;"><span>Désir d'enfants</span> <b id="uK">Oui</b></div>
                </div>
                <a href="/search" class="btn btn-main" style="margin-top:40px;">🔍 Rechercher un partenaire</a>
                <a href="/" style="display:block; margin-top:20px; color:#666; text-decoration:none;">🚪 Déconnexion</a>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) {
                document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
                document.getElementById('uD').innerText = d.dob;
                document.getElementById('uG').innerText = d.gt;
                document.getElementById('uK').innerText = d.kids;
            }
            document.getElementById('uP').src = localStorage.getItem('uPhoto') || 'https://via.placeholder.com/130';
        </script>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove V3 Live'); });
