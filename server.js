const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    /* LOADER */
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* ACCUEIL & PAGES */
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }

    /* BOUTONS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
    
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }

    /* POPUP STYLES */
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:350px; padding:25px; position:relative; text-align:left; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
    .close-popup { position:absolute; top:15px; right:15px; font-size:1.5rem; cursor:pointer; color:#666; }
    .popup-msg { background:#f0f7ff; padding:15px; border-radius:12px; border-left:4px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px; }

    /* MATCHING */
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; }
    .st-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }

    /* TOGGLE SWITCH */
    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="home-screen">
        <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
        <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
        <a href="/profile" class="btn-dark" style="width:80%">➔ Se connecter</a>
        <a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; margin-top:15px;">👤 Créer un compte</a>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3></div>
        <div class="page-white" id="main-content">
            <h2 style="color:#ff416c;">Configuration Santé</h2>
            <form onsubmit="saveAndRedirect(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">📸 Photo</div>
                <input type="file" id="i" style="display:none" onchange="preview(event)" required>
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                <select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select>
                <input type="date" id="dob" class="input-box" required>
                <input type="text" id="res" class="input-box" placeholder="Résidence" required>
                <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                <div style="display:flex; gap:10px;">
                    <select id="gs" class="input-box" style="flex:2;" required><option value="">Groupe Sanguin</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                    <select id="rh" class="input-box" style="flex:1;" required><option>+</option><option>-</option></select>
                </div>
                <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
                <div style="margin-top:15px; font-size:0.8rem; text-align:left; display:flex; gap:10px;">
                    <input type="checkbox" required> <span>Je confirme la sincérité des infos.</span>
                </div>
                <button type="submit" class="btn-pink">Valider</button>
            </form>
        </div>
    </div>
    <script>
        let b64="";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('c').innerText=''; }; r.readAsDataURL(e.target.files[0]); }
        function saveAndRedirect(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_p', b64); localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value); localStorage.setItem('u_gender', document.getElementById('gender').value);
            localStorage.setItem('u_res', document.getElementById('res').value); localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs').value + document.getElementById('rh').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            setTimeout(() => { window.location.href='/profile'; }, 5000);
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div style="display:flex; justify-content:space-between;"><a href="/" style="text-decoration:none; color:#666;">Accueil</a><a href="/settings" style="text-decoration:none;">⚙️</a></div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
            <h2 id="vN"></h2><p style="color:#007bff; font-weight:bold;">Profil Santé Validé ✅</p>
        </div>
        <div class="st-group" style="margin-top:20px;">
            <div class="st-item"><span>Génotype</span><b id="rG"></b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS"></b></div>
            <div class="st-item"><span>Projet de vie</span><b id="rP"></b></div>
        </div>
        <a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a>
    </div>
    <script>
        document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        document.getElementById('vN').innerText = localStorage.getItem('u_fn') + " " + localStorage.getItem('u_ln');
        document.getElementById('rG').innerText = localStorage.getItem('u_gt');
        document.getElementById('rS').innerText = localStorage.getItem('u_gs');
        document.getElementById('rP').innerText = "Enfant : " + localStorage.getItem('u_pj');
    </script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3 style="margin:0;">Partenaires Compatibles</h3></div>
        <div id="match-container"></div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div>

    <div id="popup-overlay" onclick="closePopup()">
        <div class="popup-content" onclick="event.stopPropagation()">
            <span class="close-popup" onclick="closePopup()">&times;</span>
            <h3 id="pop-name" style="color:#1a2a44; margin-top:0;">Détails du Profil</h3>
            <div id="pop-details" style="font-size:0.9rem; color:#666;"></div>
            <div id="pop-msg" class="popup-msg"></div>
            <button class="btn-pink" style="margin:20px 0 0 0; width:100%" onclick="alert('Demande envoyée !')">Contacter ce profil</button>
        </div>
    </div>

    <script>
        const partners = [
            {id:1, gt:"AA", gs:"O+", pj:"Souhaite fonder une famille"},
            {id:2, gt:"AS", gs:"B-", pj:"Désir d'enfant : Oui"},
            {id:3, gt:"SS", gs:"A+", pj:"Projet de vie : Stable"}
        ];
        const myGt = localStorage.getItem('u_gt');
        const container = document.getElementById('match-container');

        partners.forEach(p => {
            // Logique de filtrage visuel
            if((myGt === "SS" || myGt === "AS") && p.gt !== "AA") return;

            container.innerHTML += \`
                <div class="match-card">
                    <div class="match-photo-blur"></div>
                    <div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div>
                    <div style="display:flex;">
                        <button class="btn-action btn-contact" onclick="alert('Contact direct envoyé !')">Contacter</button>
                        <button class="btn-action btn-details" onclick="showDetails(\${JSON.stringify(p)})">Détails</button>
                    </div>
                </div>\`;
        });

        function showDetails(p) {
            const myGt = localStorage.getItem('u_gt');
            document.getElementById('pop-name').innerText = "Profil #" + p.id;
            document.getElementById('pop-details').innerHTML = "<b>Génotype:</b> " + p.gt + "<br><b>Groupe:</b> " + p.gs + "<br><br><b>Projet :</b> " + p.pj;
            
            let msg = "";
            if(myGt === "AA" && p.gt === "AA") msg = "Félicitations ! Votre compatibilité génétique est idéale. En choisissant un partenaire AA, vous offrez à votre future descendance une protection totale contre la drépanocytose.";
            else if(myGt === "AA" && p.gt === "AS") msg = "Excellent choix. En tant que partenaire AA, vous jouez un rôle protecteur essentiel. Votre union ne présente aucun risque de naissance d'un enfant SS.";
            else if(myGt === "AA" && p.gt === "SS") msg = "Une union magnifique et sans crainte. Votre profil AA est idéal pour une personne SS. Aucun de vos enfants ne souffrira de la forme majeure de la maladie.";
            
            document.getElementById('pop-msg').innerText = msg;
            document.getElementById('popup-overlay').style.display = 'flex';
        }

        function closePopup() { document.getElementById('popup-overlay').style.display = 'none'; }
    </script></body></html>`);
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:25px; background:white; text-align:center;"><div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div></div>
        <div class="st-group">
            <div class="st-item"><span>Visibilité profil</span><label class="switch"><input type="checkbox" checked onchange="document.getElementById('status').innerText = this.checked ? 'Public' : 'Privé'"><span class="slider"></span></label></div>
            <div class="st-item">Statut : <b id="status" style="color:#007bff;">Public</b></div>
        </div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div></body></html>`);
});

app.listen(port);
