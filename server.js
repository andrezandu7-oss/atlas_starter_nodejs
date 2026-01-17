const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLE COMMUN POUR LA NAVIGATION ---
const navBar = `
    <div style="position:fixed; bottom:0; left:0; width:100%; background:white; border-top:1fr solid #eee; display:flex; justify-content:space-around; padding:15px 0; box-shadow:0 -2px 10px rgba(0,0,0,0.05); z-index:1000;">
        <a href="/search" style="text-decoration:none; color:#999; text-align:center; font-size:0.7rem;">🔍<br>Recherche</a>
        <a href="/matches" style="text-decoration:none; color:#999; text-align:center; font-size:0.7rem;">💞<br>Matchs</a>
        <a href="/dashboard" style="text-decoration:none; color:#999; text-align:center; font-size:0.7rem;">👤<br>Profil</a>
        <a href="/settings" style="text-decoration:none; color:#ff416c; text-align:center; font-size:0.7rem; font-weight:bold;">⚙️<br>Paramètres</a>
    </div>
`;

// --- 1. ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`
    <body style="font-family:sans-serif; background:linear-gradient(135deg, #ff416c, #ff4b2b); height:100vh; margin:0; display:flex; align-items:center; justify-content:center; color:white; text-align:center;">
        <div style="padding:20px;">
            <h1>💞 Genlove 🧬</h1>
            <p>"L'amour qui prend soin de votre avenir."</p>
            <p>Unissez cœur et santé pour bâtir des couples <b>SOLIDES</b></p>
            <a href="/signup" style="display:block; background:white; color:#ff416c; padding:15px 40px; border-radius:50px; text-decoration:none; font-weight:bold; margin-top:20px;">Commencer</a>
        </div>
    </body>
    `);
});

// --- 2. MON PROFIL (VUE PUBLIQUE) ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <body style="font-family:sans-serif; background:#f9f9f9; margin:0; padding-bottom:80px;">
        <div style="background:white; padding:40px 20px; text-align:center;">
            <img id="p" src="" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; object-fit:cover; background:#eee;">
            <h2 id="n">André Zandu</h2>
            <span style="background:#e7f3ff; color:#007bff; padding:5px 15px; border-radius:20px; font-size:0.8rem; font-weight:bold;">Compte Vérifié ✅</span>
        </div>
        <div style="padding:20px;">
            <div style="background:white; border-radius:15px; padding:15px;">
                <p><b>Génotype :</b> <span id="gt"></span></p>
                <p><b>Groupe :</b> <span id="gs"></span></p>
                <p><b>Désir d'enfants :</b> <span id="k"></span></p>
            </div>
        </div>
        ${navBar.replace('color:#ff416c', 'color:#999').replace('👤', '<span style="color:#ff416c">👤</span>')}
        <script>
            const d = JSON.parse(localStorage.getItem('uData')) || {};
            document.getElementById('n').innerText = d.fn + ' ' + (d.ln||'');
            document.getElementById('gt').innerText = d.gt || '-';
            document.getElementById('gs').innerText = (d.gs||'') + (d.rh||'');
            document.getElementById('k').innerText = d.kids || '-';
            document.getElementById('p').src = localStorage.getItem('uPhoto') || '';
        </script>
    </body>
    `);
});

// --- 3. PARAMÈTRES (LE DERNIER ÉCRAN) ---
app.get('/settings', (req, res) => {
    res.send(`
    <body style="font-family:sans-serif; background:#fff; margin:0; padding-bottom:80px;">
        <div style="padding:25px;">
            <h2 style="margin-bottom:30px;">⚙️ Paramètres</h2>
            
            <div style="margin-bottom:25px;">
                <p style="font-weight:bold; color:#555;">COMPTE</p>
                <a href="/signup" style="display:block; padding:15px 0; color:#333; text-decoration:none; border-bottom:1px solid #eee;">✏️ Modifier mes informations</a>
                <a href="#" style="display:block; padding:15px 0; color:#333; text-decoration:none; border-bottom:1px solid #eee;">🔔 Notifications</a>
                <a href="#" style="display:block; padding:15px 0; color:#333; text-decoration:none; border-bottom:1px solid #eee;">🔒 Confidentialité</a>
            </div>

            <div style="margin-bottom:25px;">
                <p style="font-weight:bold; color:#555;">ASSISTANCE</p>
                <a href="#" style="display:block; padding:15px 0; color:#333; text-decoration:none; border-bottom:1px solid #eee;">❓ Aide & Support</a>
                <a href="#" style="display:block; padding:15px 0; color:#333; text-decoration:none; border-bottom:1px solid #eee;">📄 Conditions d'utilisation</a>
            </div>

            <button onclick="localStorage.clear(); window.location.href='/';" style="width:100%; padding:15px; color:red; background:none; border:1px solid red; border-radius:10px; margin-top:20px; cursor:pointer;">Déconnexion</button>
        </div>
        ${navBar}
    </body>
    `);
});

// (Routes signup et search simplifiées pour le test)
app.get('/signup', (req, res) => res.send('<h1>Page Inscription</h1><a href="/dashboard">Valider</a>'));
app.get('/search', (req, res) => res.send('<body style="margin:0; font-family:sans-serif;"> <div style="padding:20px;"><h2>🔍 Recherche</h2></div>' + navBar.replace('color:#ff416c', 'color:#999').replace('🔍', '<span style="color:#ff416c">🔍</span>') + '</body>'));

app.listen(port, () => { console.log('Genlove Tab-Navigation Ready'); });
                       
