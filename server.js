const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLE GLOBAL PARTAGÉ ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; position: relative; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    .content { padding: 20px; text-align: center; flex: 1; }
    .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; transition: 0.3s; }
    .btn-main { background: #ff416c; color: white; }
    .btn-outline { background: transparent; border: 2px solid white; color: white; }
    .btn-white { background: white; color: #ff416c; }
    .card { background: #f8fafc; padding: 15px; border-radius: 18px; text-align: left; margin-bottom: 15px; border: 1px solid #edf2f7; }
    input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; margin-top: 5px; box-sizing: border-box; }
    
    /* Animation Scan */
    #loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; }
    .scan-circle { width: 100px; height: 100px; border: 3px solid #ff416c; border-radius: 50%; position: relative; overflow: hidden; }
    .scan-bar { position: absolute; width: 100%; height: 3px; background: #ff416c; animation: scanning 2s infinite; }
    @keyframes scanning { 0%, 100% { top: 0%; } 50% { top: 100%; } }
</style>
`;

// --- 1. ACCUEIL (ROUTE PAR DÉFAUT) ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
        <div class="app-shell" style="background: transparent; justify-content: center;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); padding: 40px 30px; border-radius: 30px; width: 85%; margin: auto; border: 1px solid rgba(255,255,255,0.3); color: white; text-align: center;">
                <h1 style="font-size:2.5rem; margin:0;">💞 Genlove 🧬</h1>
                <p style="margin: 15px 0;">"L'amour qui prend soin de votre avenir."</p>
                <p style="font-weight: bold; margin-bottom: 30px;">Unissez cœur et santé pour bâtir des couples <span style="text-decoration: underline;">SOLIDES</span></p>
                <a href="/dashboard" class="btn btn-white">📌 Se connecter</a>
                <a href="/signup" class="btn btn-outline">📝 S'inscrire</a>
            </div>
        </div>
    </body></html>`);
});

// --- 2. INSCRIPTION (COMPLÈTE AVEC ALERTE SS) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <h2 style="color:#ff416c;">Créer mon profil</h2>
            <div id="ssAlert" style="display:none; background:#fff5f5; border:1px solid #feb2b2; color:#c53030; padding:12px; border-radius:10px; margin-bottom:15px; font-size:0.8rem; text-align:left;">
                ⚠️ <b>Note :</b> En tant que profil SS, Genlove bloquera automatiquement les autres partenaires SS pour votre sécurité.
            </div>
            <form onsubmit="saveProfile(event)">
                <label for="pInp" id="pP" style="border:2px dashed #ff416c; height:90px; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#ff416c; cursor:pointer; margin-bottom:15px; background-size:cover;">📷 Photo</label>
                <input type="file" id="pInp" style="display:none" onchange="preview(event)">
                <div style="display:flex; gap:10px;"><input type="text" id="fn" placeholder="Prénom" required><input type="text" id="ln" placeholder="Nom" required></div>
                <input type="date" id="dob" required>
                <div style="display:flex; gap:10px;">
                    <select id="gs"><option>Groupe A</option><option>B</option><option>AB</option><option>O</option></select>
                    <select id="rh"><option>+</option><option>-</option></select>
                </div>
                <div style="display:flex; gap:10px;">
                    <select id="gt" onchange="if(this.value=='SS') document.getElementById('ssAlert').style.display='block'; else document.getElementById('ssAlert').style.display='none';"><option>AA</option><option>AS</option><option>SS</option></select>
                    <select id="kids"><option value="Oui">Enfants: Oui</option><option value="Non">Non</option><option value="Neutre">Neutre</option></select>
                </div>
                <input type="text" id="med" placeholder="Antécédents / Allergies">
                <div style="border:2px dashed #007bff; padding:12px; border-radius:10px; color:#007bff; font-weight:bold; margin:15px 0; cursor:pointer;" id="vL" onclick="document.getElementById('vI').click()">🎥 Vidéo de vérification *</div>
                <input type="file" id="vI" style="display:none" capture="user" onchange="document.getElementById('vL').innerText='✅ Vidéo enregistrée'">
                <button type="submit" class="btn btn-main" style="background:#4caf50;">🚀 Finaliser mon profil</button>
            </form>
        </div></div>
        <script>
            function preview(e) {
                const r = new FileReader();
                r.onload = () => { document.getElementById('pP').style.backgroundImage = 'url('+r.result+')'; document.getElementById('pP').innerText = ''; localStorage.setItem('uPhoto', r.result); };
                r.readAsDataURL(e.target.files[0]);
            }
            function saveProfile(e) {
                e.preventDefault();
                const d = { fn:document.getElementById('fn').value, ln:document.getElementById('ln').value, dob:document.getElementById('dob').value, gs:document.getElementById('gs').value + document.getElementById('rh').value, gt:document.getElementById('gt').value, kids:document.getElementById('kids').value };
                localStorage.setItem('uData', JSON.stringify(d));
                window.location.href = '/dashboard';
            }
        </script>
    </body></html>`);
});

// --- 3. DASHBOARD (PROFIL COMPLET) ---
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <img id="uP" src="" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; object-fit:cover; margin-top:20px;">
            <h2 id="uN">Utilisateur</h2>
            <div style="text-align:left; border-top:1px solid #eee; margin-top:20px;">
                <p>🎂 <b>Né(e) le:</b> <span id="uD"></span></p>
                <p>🧬 <b>Génotype:</b> <span id="uG"></span></p>
                <p>🩸 <b>Groupe:</b> <span id="uGs"></span></p>
                <p>👶 <b>Désir d'enfants:</b> <span id="uK"></span></p>
            </div>
            <a href="/search" class="btn btn-main" style="margin-top:30px;">🔍 Trouver un partenaire</a>
            <a href="/" style="color:#999; text-decoration:none; font-size:0.8rem;">Déconnexion</a>
        </div></div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) {
                document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
                document.getElementById('uD').innerText = d.dob;
                document.getElementById('uG').innerText = d.gt;
                document.getElementById('uGs').innerText = d.gs;
                document.getElementById('uK').innerText = d.kids;
            }
            document.getElementById('uP').src = localStorage.getItem('uPhoto') || 'https://via.placeholder.com/120';
        </script>
    </body></html>`);
});

// --- 4. RECHERCHE (SCROLL ÂGE & PAS DE LOC) ---
app.get('/search', (req, res) => {
    let ageOpts = ""; for(let i=18; i<=60; i++) ageOpts += `<option value="${i}">${i}</option>`;
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <h3 style="text-align:left;">🔍 Recherche</h3>
            <div class="card">
                <b>Âge</b><br>
                De <select style="width:70px;">${ageOpts}</select> à <select style="width:70px;">${ageOpts}</select>
            </div>
            <div class="card">
                <b>Désir d'enfants</b><br>
                <select id="k"><option>Oui</option><option>Non</option><option>Neutre</option></select>
            </div>
            <div class="card">
                <b>Génotype</b><br>
                <div style="display:flex; gap:10px; margin-top:5px;">
                    <div style="border:2px solid #ff416c; color:#ff416c; padding:8px; border-radius:8px;">AA</div>
                    <div id="chipSS" style="border:1px solid #ddd; padding:8px; border-radius:8px;">SS</div>
                </div>
            </div>
            <button onclick="window.location.href='/results'" class="btn btn-main" style="background:#2b6cb0; margin-top:20px;">🚀 Lancer le Scan</button>
        </div></div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d && d.gt === 'SS') document.getElementById('chipSS').style.display = 'none';
        </script>
    </body></html>`);
});

// --- 5. RÉSULTATS (SCAN + PROFIL) ---
app.get('/results', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div id="loader"><div class="scan-circle"><div class="scan-bar"></div></div><p>Analyse de compatibilité...</p></div>
            <div id="res" class="content" style="display:none;">
                <h3>❤️ Compatibilités</h3>
                <div class="card" style="display:flex; gap:15px; align-items:center;">
                    <div style="width:50px; height:50px; border-radius:50%; background:#eee; filter:blur(3px);"></div>
                    <div><b>PROFIL 1</b><br><small>Âge: 28 ans | Score: 85%</small></div>
                </div>
                <button class="btn btn-main">Demander le contact</button>
            </div>
        </div>
        <script>setTimeout(() => { document.getElementById('loader').style.display='none'; document.getElementById('res').style.display='block'; }, 3000);</script>
    </body></html>`);
});

app.listen(port, () => { console.log('Genlove App running on http://localhost:'+port); });
        
