const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- CHARTE GRAPHIQUE GENLOVE ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    
    /* ACCUEIL */
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 50px; font-size: 1rem; line-height: 1.5; }

    /* FORMULAIRES & PAGES BLANCHES */
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .remove-x { position: absolute; top: 5px; right: 5px; background: #ff416c; color: white; border-radius: 50%; width: 22px; height: 22px; display: none; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .info-pedago { text-align: left; font-size: 0.75rem; color: #666; margin: 4px 0 12px 5px; font-style: italic; }

    /* PROFIL STATIQUE */
    .profile-static-header { background: white; padding: 30px 20px; text-align: center; border-radius: 0 0 30px 30px; }
    .prof-img-fixed { width: 110px; height: 110px; border-radius: 50%; border: 3px solid #ff416c; margin: 0 auto; background-size: cover; background-position: center; }
    .info-display-row { display: flex; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f0f0f0; background: white; font-size: 0.95rem; }

    /* PARAMÈTRES (FIDÈLE IMAGE 38610.png) */
    .st-header { background: white; padding: 25px; text-align: center; border-bottom: 1px solid #eee; }
    .st-section-title { padding: 15px 20px 5px 20px; font-size: 0.75rem; color: #888; font-weight: bold; text-transform: uppercase; text-align: left; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; text-decoration: none; color: #333; font-size: 0.95rem; text-align: left; }
    .blue-link { color: #007bff; font-weight: bold; font-size: 0.9rem; }
    .version-tag { text-align: center; font-size: 0.75rem; color: #bbb; margin: 20px 0; font-family: monospace; }

    /* BOUTONS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 20px; }
</style>
`;

// --- 1. ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="home-screen">
        <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
        <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
        <a href="/profile" class="btn-dark" style="width:100%; box-sizing:border-box;">➔ Se connecter</a>
        <a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; margin-top:15px;">👤 Créer un compte</a>
    </div></div></body></html>`);
});

// --- 2. INSCRIPTION / MODIFICATION ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="page-white">
        <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
        <form onsubmit="saveFullData(event)">
            <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📸 Photo *</span>
                <div class="remove-x" id="x" onclick="reset(event)">✕</div>
            </div>
            <input type="file" id="i" style="display:none" onchange="preview(event)" required>
            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom" required>
            <input type="date" id="dob" class="input-box" required>
            <div class="info-pedago">L'âge est un critère de matching important.</div>

            <select id="gt" class="input-box" required>
                <option value="">Génotype (Obligatoire)</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
            </select>
            
            <div style="display:flex; gap:10px;">
                <select id="gs" class="input-box" style="flex:2;" required>
                    <option value="">Groupe Sanguin</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                </select>
                <select id="rh" class="input-box" style="flex:1;" required>
                    <option value="">Rh</option><option value="+">+</option><option value="-">-</option>
                </select>
            </div>

            <select id="pj" class="input-box" required>
                <option value="">Projet de vie (Désir d'enfant ?)</option><option value="Oui">Oui</option><option value="Non">Non</option>
            </select>

            <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
        </form>
    </div></div>
    <script>
        let b64="";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; document.getElementById('x').style.display='flex'; }; r.readAsDataURL(e.target.files[0]); }
        function reset(e){ e.stopPropagation(); document.getElementById('c').style.backgroundImage='none'; document.getElementById('t').style.display='block'; document.getElementById('x').style.display='none'; b64=""; }
        function saveFullData(e){
            e.preventDefault();
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs').value + document.getElementById('rh').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            window.location.href='/profile';
        }
    </script></body></html>`);
});

// --- 3. PROFIL (LÉCTURE SEULE) ---
app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div class="profile-static-header">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <a href="/" style="text-decoration:none; color:#666;">Accueil</a>
                <a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a>
            </div>
            <div style="margin:20px 0;">
                <div id="dispP" class="prof-img-fixed"></div>
                <h2 id="dispN" style="margin:10px 0 5px 0;">André</h2>
                <p style="color:#007bff; font-weight:bold; font-size:0.9rem;">Membre Validé ✅</p>
            </div>
        </div>
        <div class="info-display-row"><span>Génotype</span><b id="rG">...</b></div>
        <div class="info-display-row"><span>Groupe Sanguin</span><b id="rS">...</b></div>
        <div class="info-display-row"><span>Projet de vie</span><b id="rJ">...</b></div>
        
        <a href="#" class="btn-dark" style="margin-top:30px;">Rechercher un partenaire</a>
    </div>
    <script>
        document.getElementById('dispP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        document.getElementById('dispN').innerText = localStorage.getItem('u_fn') || "André";
        document.getElementById('rG').innerText = localStorage.getItem('u_gt');
        document.getElementById('rS').innerText = localStorage.getItem('u_gs');
        document.getElementById('rJ').innerText = localStorage.getItem('u_pj');
    </script></body></html>`);
});

// --- 4. PARAMÈTRES (FIDÈLE À 38610.png) ---
app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div class="st-header">
            <div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <h3 style="margin:0; font-size:1rem; color:#888;">Paramètres & Sécurité</h3>
        </div>

        <div class="st-section-title">🔒 Confidentialité</div>
        <div class="st-group">
            <div class="st-item"><span>Visibilité du profil</span><span class="blue-link">Public ➔</span></div>
            <div class="st-item"><span>Partage automatique</span><span style="color:#007bff; font-size:1.2rem;">🔵</span></div>
        </div>

        <div class="st-section-title">✏️ Mise à jour</div>
        <div class="st-group">
            <a href="/signup" class="st-item"><span>Modifier mon profil & photo</span><span class="blue-link">Modifier ➔</span></a>
            <div class="st-item"><span>Statut Identity Check</span><span style="color:#2ecc71; font-weight:bold;">Validé ✅</span></div>
        </div>

        <div class="st-section-title">💾 Sauvegarde & Export</div>
        <div class="st-group">
            <div class="st-item"><span>Historique (Export PDF)</span><span class="blue-link">Export ➔</span></div>
            <div class="st-item" style="color:#ff416c;"><span>Supprimer mon compte</span></div>
        </div>

        <a href="/profile" class="btn-pink">Retour au profil</a>
        
        <div class="version-tag">Version 56.0.2 - Genlove © 2026</div>
    </div></body></html>`);
});

app.listen(port);
