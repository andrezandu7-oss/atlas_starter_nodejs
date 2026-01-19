const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    
    /* ÉCRAN SIGNUP */
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .remove-x { position: absolute; top: 5px; right: 5px; background: #ff416c; color: white; border-radius: 50%; width: 24px; height: 24px; display: none; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; font-weight: bold; z-index:10; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    
    /* CASE SERMENT */
    .oath-box { margin-top: 20px; display: flex; align-items: center; gap: 10px; text-align: left; padding: 12px; background: #fff5f7; border-radius: 10px; border: 1px solid #ffd1d9; }
    .oath-text { font-size: 0.85rem; color: #1a2a44; font-weight: 500; line-height: 1.3; }

    /* ÉCRAN PROFIL */
    .profile-header { background: white; padding: 30px 20px; text-align: center; border-radius: 0 0 30px 30px; }
    .st-group { background: white; border-radius: 15px; margin: 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }

    /* BOUTONS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; text-decoration: none; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 20px; box-sizing: border-box; }
</style>
`;

// --- ROUTE RACINE : REDIRIGE VERS SIGNUP ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell" style="justify-content:center; align-items:center; text-align:center; padding:20px;">
        <div style="font-size:3.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
        <p style="font-weight:bold; color:#1a2a44;">Bienvenue</p>
        <a href="/signup" class="btn-dark" style="width:80%;">Commencer</a>
    </div></body></html>`);
});

// --- ÉCRAN CONFIGURATION SANTÉ ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="page-white">
        <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
        <form id="healthForm">
            <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span><div class="remove-x" id="x" onclick="resetPhoto(event)">✕</div></div>
            <input type="file" id="i" style="display:none" onchange="preview(event)" required>
            
            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom" required>
            <input type="date" id="dob" class="input-box" required>
            <input type="text" id="res" class="input-box" placeholder="Résidence/Région actuelle" required>
            
            <select id="gt" class="input-box" required>
                <option value="">Génotype *</option>
                <option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
            </select>
            
            <div style="display:flex; gap:10px;">
                <select id="gs" class="input-box" style="flex:2;" required><option value="">Groupe Sanguin</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select>
                <select id="rh" class="input-box" style="flex:1;" required><option value="+">+</option><option value="-">-</option></select>
            </div>

            <div class="oath-box">
                <input type="checkbox" id="oath" required>
                <label for="oath" class="oath-text">Je jure que les données fournies sont exactes et sincères.</label>
            </div>

            <button type="button" onclick="processForm()" class="btn-pink">🚀 Valider mon profil</button>
        </form>
    </div></div>
    <script>
        let b64="";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; document.getElementById('x').style.display='flex'; }; r.readAsDataURL(e.target.files[0]); }
        function resetPhoto(e){ e.stopPropagation(); document.getElementById('c').style.backgroundImage='none'; document.getElementById('t').style.display='block'; document.getElementById('x').style.display='none'; b64=""; }
        
        function processForm(){
            const f = document.getElementById('healthForm');
            if(!f.checkValidity()){ f.reportValidity(); return; }
            
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs').value + document.getElementById('rh').value);
            
            window.location.href = '/profile';
        }
    </script></body></html>`);
});

// --- ÉCRAN PROFIL (AUTO-CHARGEMENT) ---
app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div class="profile-header">
            <div style="display:flex; justify-content:space-between;"><a href="/signup" style="text-decoration:none; color:#666;">⬅</a><a href="/settings" style="text-decoration:none;">⚙️</a></div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-color:#eee;"></div>
            <h2 id="vN" style="margin:5px 0 0 0;">...</h2>
            <p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Lieu</p>
            <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
        </div>
        <div style="padding:20px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
        <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">--</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">--</b></div>
        </div>
        <a href="/signup" class="btn-dark" style="margin:20px;">🔍 Trouver un partenaire</a>
    </div>
    <script>
        window.onload = () => {
            const p = localStorage.getItem('u_p');
            if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')';
            document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "") + " " + (localStorage.getItem('u_ln') || "");
            document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || "Non précisé");
            document.getElementById('rG').innerText = localStorage.getItem('u_gt') || "--";
            document.getElementById('rS').innerText = localStorage.getItem('u_gs') || "--";
        }
    </script></body></html>`);
});

// --- ÉCRAN PARAMÈTRES (SIGNATURE V60.1) ---
app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:25px; background:white; text-align:center;"><div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div></div>
        <div class="st-group">
            <a href="/signup" class="st-item" style="text-decoration:none; color:black;"><span>Modifier mon profil</span><b>➔</b></a>
            <div class="st-item"><span>Export PDF Santé</span><b style="color:#ff416c;">Bientôt</b></div>
        </div>
        <a href="/profile" class="btn-pink">Retour au profil</a>
        <div style="text-align:center; font-size:0.75rem; color:#bbb; margin-top: auto; padding-bottom: 20px;">Version 60.1 - Genlove © 2026</div>
    </div></body></html>`);
});

app.listen(port, () => console.log('Genlove V60.1 prête !'));
