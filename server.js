const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }

    /* ÉCRAN DE CHARGEMENT / VÉRIFICATION */
    #loader { display: none; position: absolute; top:0; left:0; width:100%; height:100%; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; box-sizing: border-box; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* SIGNUP & PROFIL (BASE V59.9) */
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .oath-box { margin-top: 20px; display: flex; align-items: center; gap: 10px; text-align: left; padding: 12px; background: #fff5f7; border-radius: 10px; border: 1px solid #ffd1d9; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .st-group { background: white; border-radius: 15px; margin: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }

    /* PARAMÈTRES */
    .settings { padding: 20px; }
    .setting-item { display:flex; justify-content:space-between; align-items:center; margin:15px 0; background:white; padding:15px; border-radius:15px; box-shadow:0 2px 6px rgba(0,0,0,0.05); }
</style>
`;

/* ---------------------------
   ROUTE / (redirection vers /signup)
---------------------------- */
app.get('/', (req, res) => {
    res.redirect('/signup');
});

/* ---------------------------
   ACCUEIL (optionnel)
---------------------------- */
app.get('/home', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div class="page-white">
            <h2 style="color:#ff416c;">Bienvenue sur Genlove</h2>
            <p>Une application de rencontre basée sur la compatibilité santé.</p>
            <button class="btn-pink" onclick="window.location.href='/signup'">Commencer</button>
        </div>
    </div></body></html>`);
});

/* ---------------------------
   SIGNUP
---------------------------- */
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div id="loader">
            <div class="spinner"></div>
            <h3 style="color:#1a2a44;">Validation et sécurisation de vos données médicales en cours.</h3>
            <p style="color:#666; font-size:0.9rem;">Nous préparons votre fiche personnelle, merci de patienter quelques secondes.</p>
        </div>

        <div class="page-white" id="main-content">
            <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
            <form id="healthForm" onsubmit="verifyAndSave(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
                <input type="file" id="i" style="display:none" onchange="preview(event)" required>
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                <input type="date" id="dob" class="input-box" required>
                <input type="text" id="res" class="input-box" placeholder="Résidence/Région actuelle" required>
                <select id="gt" class="input-box" required><option value="">Génotype *</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
                <div style="display:flex; gap:10px;">
                    <select id="gs" class="input-box" style="flex:2;" required><option value="">Groupe Sanguin</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select>
                    <select id="rh" class="input-box" style="flex:1;" required><option value="+">+</option><option value="-">-</option></select>
                </div>
                <div class="oath-box">
                    <input type="checkbox" id="oath" required>
                    <label for="oath" style="font-size:0.8rem;">Je jure que les données fournies sont exactes et sincères.</label>
                </div>
                <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
            </form>
        </div>
    </div>
    <script>
        let b64="";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        
        function verifyAndSave(e){
            e.preventDefault();
            document.getElementById('loader').style.display = 'flex';
            document.getElementById('main-content').style.opacity = '0.1';

            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs').value + document.getElementById('rh').value);

            setTimeout(() => {
                window.location.href = '/profile';
            }, 5000);
        }
    </script></body></html>`);
});

/* ---------------------------
   PROFILE
---------------------------- */
app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-color:#eee;"></div>
            <h2 id="vN" style="margin:5px 0 0 0;">Utilisateur</h2>
            <p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Lieu</p>
            <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
        </div>
        <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">--</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">--</b></div>
        </div>
        <button class="btn-pink" onclick="window.location.href='/matching'">🔍 Trouver un partenaire</button>
        <div style="text-align:center; font-size:0.7rem; color:#ccc; margin-top:auto; padding-bottom:15px;">Version 60.3 - Genlove © 2026</div>
    </div>
    <script>
        window.onload = () => {
            document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
            document.getElementById('vN').innerText = localStorage.getItem('u_fn') + " " + localStorage.getItem('u_ln');
            document.getElementById('vR').innerText = "📍 " + localStorage.getItem('u_res');
            document.getElementById('rG').innerText = localStorage.getItem('u_gt');
            document.getElementById('rS').innerText = localStorage.getItem('u_gs');
        }
    </script></body></html>`);
});

/* ---------------------------
   MATCHING (écran placeholder)
---------------------------- */
app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div class="page-white">
            <h2 style="color:#ff416c;">Matching</h2>
            <p>Écran de recherche de partenaires (prototype).</p>
            <button class="btn-pink" onclick="window.location.href='/settings'">⚙️ Paramètres</button>
        </div>
    </div></body></html>`);
});

/* ---------------------------
   SETTINGS
---------------------------- */
app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div class="page-white settings">
            <h2 style="color:#ff416c; margin-top:0;">Paramètres</h2>

            <div class="setting-item">
                <span>Modifier profil</span>
                <button class="btn-pink" style="padding:10px 15px; border-radius:20px;" onclick="window.location.href='/signup'">Modifier</button>
            </div>

            <div class="setting-item">
                <span>Déconnexion</span>
                <button class="btn-pink" style="padding:10px 15px; border-radius:20px;" onclick="window.location.href='/signup'">Déconnecter</button>
            </div>
        </div>
    </div></body></html>`);
});

app.listen(port, () => console.log("Genlove V60.3 lancée !"));
