const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- DESIGN SYSTÈME GENLOVE ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    .content { padding: 20px; text-align: center; flex: 1; }
    .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; transition: 0.3s; }
    .btn-main { background: #ff416c; color: white; }
    .btn-white { background: white; color: #ff416c; }
    .btn-outline { background: transparent; border: 2px solid white; color: white; }
    .card { background: #f8fafc; padding: 15px; border-radius: 18px; text-align: left; margin-bottom: 15px; border: 1px solid #edf2f7; }
    label { display: block; font-size: 0.8rem; font-weight: bold; color: #555; margin-bottom: 5px; }
    input, select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; margin-top: 5px; box-sizing: border-box; font-size: 1rem; }
    .row { display: flex; gap: 10px; }
    
    /* Animation Scan */
    #loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 80vh; }
    .scan-circle { width: 100px; height: 100px; border: 3px solid #ff416c; border-radius: 50%; position: relative; overflow: hidden; }
    .scan-bar { position: absolute; width: 100%; height: 3px; background: #ff416c; animation: scanning 2s infinite; }
    @keyframes scanning { 0%, 100% { top: 0%; } 50% { top: 100%; } }
</style>
`;

// --- 1. ACCUEIL (POINT D'ENTRÉE) ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
        <div class="app-shell" style="background: transparent; justify-content: center;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); padding: 40px 30px; border-radius: 30px; width: 85%; margin: auto; color: white; text-align: center;">
                <h1 style="font-size:2.5rem; margin:0;">💞 Genlove 🧬</h1>
                <p>"L'amour qui prend soin de votre avenir."</p>
                <div style="margin: 30px 0;">
                    <a href="/signup" class="btn btn-white">📝 Créer mon profil</a>
                    <a href="/dashboard" class="btn btn-outline">📌 Se connecter</a>
                </div>
            </div>
        </div>
    </body></html>`);
});

// --- 2. INSCRIPTION (TOUS LES ÉLÉMENTS) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <h2 style="color:#ff416c; margin-bottom:20px;">Inscription</h2>
            <div id="ssAlert" style="display:none; background:#fff5f5; border:1px solid #feb2b2; color:#c53030; padding:12px; border-radius:10px; margin-bottom:15px; font-size:0.8rem; text-align:left;">
                ⚠️ <b>Note de sécurité :</b> En tant que profil SS, les autres profils SS seront automatiquement masqués pour protéger votre descendance.
            </div>
            <form onsubmit="saveProfile(event)">
                <label for="pInp" id="pP" style="border:2px dashed #ff416c; height:90px; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#ff416c; cursor:pointer; margin-bottom:15px; background-size:cover;">📷 Photo de profil</label>
                <input type="file" id="pInp" style="display:none" onchange="preview(event)">
                
                <div class="row"><div style="flex:1;"><label>Prénom</label><input type="text" id="fn" required></div><div style="flex:1;"><label>Nom</label><input type="text" id="ln" required></div></div>
                <div style="margin:10px 0;"><label>Date de naissance</label><input type="date" id="dob" required></div>
                
                <div class="row">
                    <div style="flex:1;"><label>Groupe Sanguin</label><select id="gs"><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>
                    <div style="flex:1;"><label>Rhésus</label><select id="rh"><option>+</option><option>-</option></select></div>
                </div>

                <div class="row">
                    <div style="flex:1;"><label>Génotype</label><select id="gt" onchange="checkSS(this.value)"><option>AA</option><option>AS</option><option>SS</option></select></div>
                    <div style="flex:1;"><label>Enfants ?</label><select id="kids"><option value="Oui">Oui</option><option value="Non">Non</option><option value="Neutre">Neutre</option></select></div>
                </div>

                <div class="row"><div style="flex:1;"><label>Antécédents</label><input type="text" id="med"></div><div style="flex:1;"><label>Allergies</label><input type="text" id="alg"></div></div>

                <div style="border:2px dashed #007bff; padding:12px; border-radius:10px; color:#007bff; font-weight:bold; margin:15px 0; cursor:pointer;" id="vL" onclick="document.getElementById('vI').click()">🎥 Vidéo de vérification *</div>
                <input type="file" id="vI" style="display:none" capture="user" onchange="document.getElementById('vL').innerText='✅ Vidéo enregistrée'">
                
                <button type="submit" class="btn btn-main" style="background:#4caf50;">🚀 Finaliser mon profil</button>
            </form>
        </div></div>
        <script>
            function checkSS(v) { document.getElementById('ssAlert').style.display = (v=='SS') ? 'block' : 'none'; }
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
            <p style="color:#4caf50; font-weight:bold; font-size:0.8rem;">Profil Vérifié ✅</p>
            <div class="card" style="margin-top:20px;">
                <p>🎂 <b>Né(e) le:</b> <span id="uD"></span></p>
                <p>🧬 <b>Génotype:</b> <span id="uG"></span></p>
                <p>🩸 <b>Groupe:</b> <span id="uGs"></span></p>
                <p>👶 <b>Projet Enfants:</b> <span id="uK"></span></p>
            </div>
            <a href="/search" class="btn btn-main">🔍 Trouver un partenaire</a>
            <a href="/" style="display:block; margin-top:15px; color:#999; text-decoration:none;">Déconnexion</a>
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

// --- 4. RECHERCHE (SCROLL ÂGE & LOGIQUE SS) ---
app.get('/search', (req, res) => {
    let ageOpts = ""; for(let i=18; i<=65; i++) ageOpts += `<option value="${i}">${i}</option>`;
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell"><div class="content">
            <h3 style="text-align:left;">🔍 Paramètres de recherche</h3>
            <div class="card">
                <label>Tranche d'âge</label>
                <div style="display:flex; align-items:center; gap:10px;">De <select>${ageOpts}</select> à <select>${ageOpts}</select></div>
            </div>
            <div class="card">
                <label>Désir d'enfants</label>
                <select><option>Oui</option><option>Non</option><option>Neutre</option></select>
            </div>
            <div class="card">
                <label>Génotype cible</label>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <div style="border:2px solid #ff416c; color:#ff416c; padding:10px; border-radius:10px; font-weight:bold;">AA</div>
                    <div id="chipSS" style="border:1px solid #ddd; padding:10px; border-radius:10px; color:#999;">SS</div>
                </div>
            </div>
            <button onclick="window.location.href='/results'" class="btn btn-main" style="background:#2b6cb0; margin-top:20px;">🚀 Lancer le Scan Médical</button>
        </div></div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d && d.gt === 'SS') document.getElementById('chipSS').style.display = 'none';
        </script>
    </body></html>`);
});

// --- 5. RÉSULTATS (ANIMATION + ANONYMAT) ---
app.get('/results', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div id="loader"><div class="scan-circle"><div class="scan-bar"></div></div><p style="margin-top:20px; font-weight:bold; color:#ff416c;">Analyse Genlove en cours...</p></div>
            <div id="res" class="content" style="display:none;">
                <h3>❤️ Partenaires Compatibles</h3>
                <div class="card" style="display:flex; gap:15px; align-items:center;">
                    <div style="width:60px; height:60px; border-radius:50%; background:#eee; filter:blur(4px);"></div>
                    <div><b>PROFIL 1</b><br><small>Âge: 26 ans | AA | 88% Match</small></div>
                </div>
                <button class="btn btn-main">Demander le contact</button>
                <a href="/search" style="color:#999; text-decoration:none; font-size:0.8rem;">⬅️ Retour</a>
            </div>
        </div>
        <script>setTimeout(() => { document.getElementById('loader').style.display='none'; document.getElementById('res').style.display='block'; }, 3000);</script>
    </body></html>`);
});

app.listen(port, () => { console.log('Genlove V5 Ready'); });
