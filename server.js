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
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    .secure-note { font-size: 0.75rem; color: #666; margin-top: 25px; }

    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .remove-x { position: absolute; top: 5px; right: 5px; background: #ff416c; color: white; border-radius: 50%; width: 24px; height: 24px; display: none; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; font-weight: bold; z-index: 10; }
    
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    input[type="date"]::before { content: "Date de naissance "; width: 100%; color: #757575; }
    input[type="date"]:focus::before, input[type="date"]:valid::before { content: ""; display: none; }

    .oath-box { margin-top: 20px; display: flex; align-items: center; gap: 10px; text-align: left; padding: 12px; background: #fff5f7; border-radius: 10px; border: 1px solid #ffd1d9; }
    .oath-text { font-size: 0.85rem; color: #1a2a44; font-weight: 500; line-height: 1.3; }

    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; text-decoration: none; color: #333; font-size: 0.95rem; }

    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 20px; width: auto; box-sizing: border-box; }

    .match-card { background:white; margin:10px; padding:15px; border-radius:15px; display:flex; align-items:center; gap:15px; }
    .match-photo { width:55px; height:55px; border-radius:50%; background: #eee; filter: blur(7px); }

    /* POPUP */
    #popup {
        display:none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 999;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    .popup-box {
        background: white;
        padding: 20px;
        border-radius: 15px;
        width: 100%;
        max-width: 360px;
        text-align: left;
    }
    .popup-title { font-weight: bold; margin-bottom: 10px; }
    .popup-btn { background:#ff416c; color:white; border:none; padding:12px 20px; border-radius:12px; width:100%; font-weight:bold; cursor:pointer; }
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
        <div class="secure-note">🔒 Vos données de santé sont cryptées et confidentielles.</div>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div id="loader"><div class="spinner"></div><h3>Vérification sécurisée...</h3><p>Analyse de vos données médicales en cours.</p></div>
        <div class="page-white" id="main">
            <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
            <form onsubmit="saveAndVerify(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                    <span id="t">📸 Photo *</span>
                    <div class="remove-x" id="x" onclick="resetPhoto(event)">✕</div>
                </div>
                <input type="file" id="i" style="display:none" onchange="preview(event)" required>
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                <input type="date" id="dob" class="input-box" required>
                <input type="text" id="res" class="input-box" placeholder="Résidence/Région actuelle" required>
                <select id="gt" class="input-box" required>
                    <option value="">Génotype</option>
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                </select>
                <select id="gs" class="input-box" required>
                    <option value="">Groupe Sanguin</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                </select>
                <div class="oath-box">
                    <input type="checkbox" id="oath" required>
                    <label for="oath" class="oath-text">Je jure que les données sont sincères.</label>
                </div>
                <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
            </form>
        </div>
    </div>
    <script>
        let b64="";
        function preview(e){
            const r=new FileReader();
            r.onload=()=>{
                b64=r.result;
                document.getElementById('c').style.backgroundImage='url('+b64+')';
                document.getElementById('t').style.display='none';
                document.getElementById('x').style.display='flex';
            };
            r.readAsDataURL(e.target.files[0]);
        }
        function resetPhoto(e){
            e.stopPropagation();
            document.getElementById('c').style.backgroundImage='none';
            document.getElementById('t').style.display='block';
            document.getElementById('x').style.display='none';
            document.getElementById('i').value="";
            b64="";
        }
        function saveAndVerify(e){
            e.preventDefault();
            document.getElementById('loader').style.display='flex';
            document.getElementById('main').style.opacity='0.1';

            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_dob', document.getElementById('dob').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs').value);
            localStorage.setItem('u_p', b64);

            setTimeout(() => { window.location.href='/profile'; }, 2500);
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div style="display:flex; justify-content:space-between;">
                <a href="/" style="text-decoration:none; color:#666;">⬅️</a>
                <a href="/settings" style="text-decoration:none;">⚙️</a>
            </div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
            <h2 id="vN">Utilisateur</h2>
            <p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Résidence/Région</p>
            <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
        </div>

        <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
        <div class="st-group">
            <div class="st-item"><span>Génotype</span><b id="rG">...</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div>
            <div class="st-item"><span>Date de naissance</span><b id="rD">...</b></div>
        </div>

        <a href="/matching" class="btn-dark" style="margin:20px; width:auto; text-decoration:none;">🔍 Trouver un partenaire</a>
        <a href="/settings" class="btn-pink" style="width:85%;">⚙️ Paramètres</a>
    </div>
    <script>
        const p = localStorage.getItem('u_p');
        if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')';

        document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "") + " " + (localStorage.getItem('u_ln') || "");
        document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || "Non précisé");
        document.getElementById('rG').innerText = localStorage.getItem('u_gt') || "--";
        document.getElementById('rS').innerText = localStorage.getItem('u_gs') || "--";
        document.getElementById('rD').innerText = localStorage.getItem('u_dob') || "--";
    </script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:20px; background:white; text-align:center;"><h3>Partenaires Compatibles</h3></div>

        <div id="msg" style="display:none; margin:15px; padding:15px; background:#fff5f7; border:1px solid #ffd1d9; border-radius:12px; color:#d00; text-align:left;">
            💛 Nous voulons protéger votre futur couple.<br>
            Les profils <b>AS</b> et <b>SS</b> sont donc bloqués dans cette recherche.<br>
            Vous pouvez uniquement consulter les profils <b>AA</b>.<br>
            Merci de votre compréhension.
        </div>

        <div id="list"></div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div>
    <script>
        const myGt = localStorage.getItem('u_gt');
        const partners = [
            {gt:"AA", compat:"92%"},
            {gt:"AS", compat:"78%"},
            {gt:"SS", compat:"60%"},
            {gt:"AA", compat:"88%"}
        ];

        const list = document.getElementById('list');

        const filtered = partners.filter(p => {
            if (myGt === 'SS' && p.gt !== 'AA') return false;
            if (myGt === 'AS' && p.gt !== 'AA') return false;
            return true;
        });

        if (myGt === 'AS') {
            document.getElementById('msg').style.display = 'block';
        }

        filtered.forEach((p, i) => {
            list.innerHTML += `
                <div class="match-card">
                    <div class="match-photo"></div>
                    <div style="flex:1;">
                        <b>Profil ${i+1}</b><br>
                        <small>Compatibilité: ${p.compat}</small>
                    </div>
                    <a href="/requests" class="btn-dark" style="padding:10px 14px; border-radius:12px; width:auto; margin:0;">Contacter</a>
                </div>
            `;
        });
    </script>
    </body></html>`);
});

app.get('/requests', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:25px; background:white; text-align:center;">
            <h3>Demande envoyée</h3>
            <p>Le profil a reçu votre demande.</p>
        </div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div></body></html>`);
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:25px; background:white; text-align:center;">
            <div class="logo-text">Genlove</div>
        </div>

        <!-- Bloc 1: Confidentialité -->
        <div class="st-group">
            <div class="st-item"><span>Visibilité profil</span><b>Public / Privé</b></div>
            <div class="st-item"><span>Partage automatique</span><b>Oui / Non</b></div>
        </div>

        <!-- Bloc 2: Mise à jour -->
        <div class="st-group">
            <a href="/signup" class="st-item"><span>Modifier mon profil</span><span style="color:#007bff; font-weight:bold;">Modifier ➔</span></a>
        </div>

        <!-- Bloc 3: Sauvegarde & Export -->
        <div class="st-group">
            <div class="st-item"><span>Historique (Export PDF)</span><b>Export</b></div>
            <div class="st-item" style="color:red;" onclick="confirmDelete()"><span>Supprimer compte</span><b>Supprimer</b></div>
        </div>

        <a href="/profile" class="btn-pink">Retour</a>
        <div style="text-align:center; font-size:0.7rem; color:#bbb; margin-top:20px;">Version 60.8 - Genlove © 2026</div>
    </div>

    <script>
        function confirmDelete() {
            if (confirm("Voulez-vous vraiment supprimer votre compte ?")) {
                localStorage.clear();
                location.href = "/";
            }
        }
    </script>
    </body></html>`);
});

app.listen(port, () => console.log("Genlove V60.8 lancée !"));
