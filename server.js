const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLE GLOBAL POUR TOUS LES ÉCRANS ---
const globalStyle = `
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background: #f8f9fa; color: #333; }
        .app-container { max-width: 450px; margin: 0 auto; min-height: 100vh; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; display: flex; flex-direction: column; }
        .content { padding: 30px 20px; flex: 1; text-align: center; }
        h2 { font-size: 1.8rem; color: #ff416c; margin-bottom: 20px; }
        p { font-size: 1.1rem; line-height: 1.5; }
        .btn { display: block; width: 100%; padding: 18px; margin: 15px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; transition: 0.3s; }
        .btn-main { background: #ff416c; color: white; }
        .btn-outline { background: white; border: 2px solid #ff416c; color: #ff416c; }
        .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #eee; font-size: 1.05rem; }
        .label { font-weight: bold; color: #666; }
    </style>
`;

// --- 1. ACCUEIL (Design Premium Validé) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${globalStyle}
        <style>
            .hero { background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; height: 100vh; display: flex; align-items: center; justify-content: center; }
            .glass-card { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 85%; border: 1px solid rgba(255,255,255,0.3); }
        </style>
    </head>
    <body class="hero">
        <div class="glass-card">
            <h1 style="font-size: 3rem; margin: 0;">💞 Genlove 🧬</h1>
            <p style="opacity: 0.9; font-style: italic;">"L'amour qui prend soin de votre avenir."</p>
            <p style="font-weight: bold; margin: 25px 0;">Unissez cœur et santé pour bâtir des couples <span style="text-decoration: underline;">SOLIDES</span></p>
            <a href="/dashboard" class="btn" style="background: white; color: #ff416c;">📌 Se connecter</a>
            <a href="/signup" class="btn" style="background: transparent; border: 2px solid white; color: white;">📝 S'inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- 2. INSCRIPTION ---
app.get('/signup', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>${globalStyle}</head>
    <body>
        <div class="app-container">
            <div class="content">
                <h2>📝 Créer mon profil</h2>
                <form onsubmit="save(event)">
                    <input type="text" id="fn" placeholder="Prénom" style="width:100%; padding:15px; margin:10px 0; border-radius:10px; border:1px solid #ddd;" required>
                    <input type="text" id="ln" placeholder="Nom" style="width:100%; padding:15px; margin:10px 0; border-radius:10px; border:1px solid #ddd;" required>
                    <label style="display:block; text-align:left; font-weight:bold; margin-top:10px;">Date de naissance :</label>
                    <input type="date" id="dob" style="width:100%; padding:15px; margin:5px 0; border-radius:10px; border:1px solid #ddd;" required>
                    <select id="gt" style="width:100%; padding:15px; margin:10px 0; border-radius:10px; border:1px solid #ddd;" required>
                        <option value="">Choisir votre Génotype</option>
                        <option>AA</option><option>AS</option><option>SS</option>
                    </select>
                    <button type="submit" class="btn btn-main">🚀 Finaliser mon profil</button>
                    <a href="/" style="color:#666; text-decoration:none;">Retour</a>
                </form>
            </div>
        </div>
        <script>
            function save(e) {
                e.preventDefault();
                const d = { fn: document.getElementById('fn').value, ln: document.getElementById('ln').value, gt: document.getElementById('gt').value, dob: document.getElementById('dob').value };
                localStorage.setItem('uData', JSON.stringify(d));
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 3. PROFIL (VUE COMPLÈTE) ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>${globalStyle}</head>
    <body>
        <div class="app-container">
            <div class="content">
                <div style="margin-bottom: 30px;">
                    <div style="width:130px; height:130px; border-radius:50%; background:#eee; margin:0 auto; border:4px solid #ff416c; overflow:hidden;">
                        <img id="uP" src="" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <h2 id="uN" style="margin-top:15px; margin-bottom:5px;">Utilisateur</h2>
                    <span style="color:#4caf50; font-weight:bold; font-size:0.9rem;">Profil Vérifié ✅</span>
                </div>

                <div style="background:#f9f9f9; padding:20px; border-radius:20px; text-align:left;">
                    <div class="info-row"><span class="label">Né(e) le</span> <span id="uD"></span></div>
                    <div class="info-row"><span class="label">Génotype</span> <span id="uG"></span></div>
                    <div class="info-row"><span class="label">Désir d'enfants</span> <span>Oui</span></div>
                </div>

                <a href="/search" class="btn btn-main">🔍 Rechercher un partenaire</a>
                <a href="/settings" class="btn btn-outline">⚙️ Paramètres</a>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData')) || {fn: "Éric", ln: "Zandu", gt: "AA", dob: "1990-03-11"};
            document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
            document.getElementById('uG').innerText = d.gt;
            document.getElementById('uD').innerText = d.dob;
            document.getElementById('uP').src = localStorage.getItem('uPhoto') || 'https://via.placeholder.com/130';
        </script>
    </body>
    </html>
    `);
});

// --- 4. RECHERCHE (Sécurité SS) ---
app.get('/search', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>${globalStyle}</head>
    <body>
        <div class="app-container">
            <div class="content">
                <h2>🔍 Recherche</h2>
                <div id="ssWarn" style="display:none; background:#fff5f5; color:#d32f2f; padding:15px; border-radius:15px; margin-bottom:20px; border:1px solid #feb2b2;">
                    ⚠️ <b>Sécurité :</b> En tant que profil SS, l'accès aux partenaires SS est bloqué pour protéger votre descendance.
                </div>
                <p style="text-align:left; font-weight:bold;">Filtrer par Génotype :</p>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-outline" style="flex:1;">AA</button>
                    <button class="btn btn-outline" style="flex:1;">AS</button>
                    <button id="btnSS" class="btn btn-outline" style="flex:1;">SS</button>
                </div>
                <a href="/dashboard" class="btn btn-main" style="margin-top:40px;">Lancer la recherche</a>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d && d.gt === 'SS') {
                document.getElementById('ssWarn').style.display = 'block';
                const s = document.getElementById('btnSS');
                s.style.opacity = '0.3';
                s.style.textDecoration = 'line-through';
                s.disabled = true;
            }
        </script>
    </body>
    </html>
    `);
});

// --- 5. PARAMÈTRES (Le dernier écran) ---
app.get('/settings', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>${globalStyle}</head>
    <body>
        <div class="app-container">
            <div class="content">
                <div style="text-align:left; display:flex; align-items:center; gap:15px;">
                    <a href="/dashboard" style="text-decoration:none; font-size:1.5rem;">⬅️</a>
                    <h2 style="margin:0;">Paramètres</h2>
                </div>
                <div style="margin-top:30px; text-align:left;">
                    <div class="info-row" style="cursor:pointer;"><span>✏️ Modifier mes informations</span> <span>></span></div>
                    <div class="info-row" style="cursor:pointer;"><span>🔔 Notifications</span> <span>></span></div>
                    <div class="info-row" style="cursor:pointer; color:red;" onclick="localStorage.clear(); window.location.href='/';"><span>🚪 Déconnexion</span></div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove is LIVE'); });
        
