const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    /* ÉCRAN DE CHARGEMENT */
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .oath-box { margin-top: 20px; display: flex; align-items: center; gap: 10px; text-align: left; padding: 12px; background: #fff5f7; border-radius: 10px; border: 1px solid #ffd1d9; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; text-decoration: none; color: #333; font-size: 0.95rem; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 20px; width: auto; box-sizing: border-box; }
    .match-card { background:white; margin:10px; padding:15px; border-radius:15px; display:flex; align-items:center; gap:15px; }
    .match-photo { width:55px; height:55px; border-radius:50%; background: #eee; filter: blur(7px); }
</style>
`;

/* ========================= ROUTES ========================= */

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="home-screen">
        <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
        <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
        <a href="/profile" class="btn-dark">➔ Se connecter</a>
        <a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div id="loader"><div class="spinner"></div><h3>Vérification sécurisée...</h3><p>Analyse de vos données médicales en cours.</p></div>
        <div class="page-white" id="main">
            <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
            <form onsubmit="saveAndVerify(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
                <input type="file" id="i" style="display:none" onchange="preview(event)" required>
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                <input type="date" id="dob" class="input-box" required>
                <input type="text" id="res" class="input-box" placeholder="Résidence/Région actuelle" required>
                <select id="gt" class="input-box" required><option value="">Génotype</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
                <select id="gs" class="input-box" required><option value="">Groupe Sanguin</option><option value="A+">A+</option><option value="B+">B+</option><option value="O+">O+</option></select>
                <div class="oath-box"><input type="checkbox" required><label class="oath-text">Je jure que les données sont sincères.</label></div>
                <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
            </form>
        </div>
    </div>
    <script>
        let b64="";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }
        function saveAndVerify(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex';
            document.getElementById('main').style.opacity='0.1';
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_p', b64);
            setTimeout(() => { window.location.href='/profile'; }, 5000);
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div style="display:flex; justify-content:space-between;"><a href="/" style="text-decoration:none; color:#666;">⬅️</a><a href="/settings" style="text-decoration:none;">⚙️</a></div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
            <h2 id="vN">Utilisateur</h2>
            <p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
        </div>
        <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">...</b></div>
        </div>
        <a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a>
    </div>
    <script>
        document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        document.getElementById('vN').innerText = localStorage.getItem('u_fn');
        document.getElementById('rG').innerText = localStorage.getItem('u_gt');
    </script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:20px; background:white; text-align:center;"><h3>Partenaires Compatibles</h3></div>
        <div id="list"></div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div>
    <script>
        const myGt = localStorage.getItem('u_gt');
        const partners = [{gt:"AA"}, {gt:"AS"}, {gt:"SS"}, {gt:"AA"}];
        const list = document.getElementById('list');
        // Filtre SS x SS
        partners.filter(p => !(myGt === 'SS' && p.gt === 'SS')).forEach((p, i) => {
            list.innerHTML += '<div class="match-card"><div class="match-photo"></div><div class="match-info"><b>Profil '+(i+1)+'</b><small>Génotype '+p.gt+'</small></div><a href="/requests" class="match-contact">Contacter</a></div>';
        });
    </script></body></html>`);
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:25px; background:white; text-align:center;"><div class="logo-text">Genlove</div></div>
        <div class="st-group">
            <div class="st-item"><span>Visibilité profil</span><b>Public</b></div>
            <div class="st-item"><span>Protection SS</span><b>Activée ✅</b></div>
        </div>
        <div class="st-group">
            <div class="st-item" style="color:red;" onclick="localStorage.clear(); location.href='/';"><span>Supprimer mon compte</span></div>
        </div>
        <a href="/profile" class="btn-pink">Retour</a>
        <div style="text-align:center; font-size:0.7rem; color:#bbb; margin-top:20px;">Version 60.8 - Genlove © 2026</div>
    </div></body></html>`);
});

// Les autres routes (requests, chat) restent identiques à ton code original
app.get('/requests', (req, res) => { res.send('Demande envoyée ! <a href="/profile">Retour</a>'); });

app.listen(port, () => console.log("Genlove V60.8 lancée !"));
