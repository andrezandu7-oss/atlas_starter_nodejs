const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; overflow-x: hidden; }
    
    /* STYLE DE LA NOTIFICATION (Selon ta proposition) */
    .notif-box { 
        display: none; position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        width: 320px; background: white; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 2000; border: 1px solid #eee; overflow: hidden; animation: bounceIn 0.5s ease;
    }
    .notif-header { background: #f8f9fa; padding: 10px 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; font-weight: bold; color: #1a2a44; font-size: 0.9rem; }
    .notif-body { padding: 20px; text-align: center; color: #333; font-size: 0.95rem; }
    .notif-btn { background: #7ba6e9; color: white; border: none; width: 100%; padding: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    @keyframes bounceIn { 0% { top: -100px; } 70% { top: 30px; } 100% { top: 20px; } }

    /* RESTE DU DESIGN (Inchangé pour le pacte) */
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; background: #f8f9fa; box-sizing: border-box; }
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }
    
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; }
    .popup-msg { background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; margin-top:15px; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }
</style>
`;

// --- ROUTES ---
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
        <div class="page-white">
            <h2 style="color:#ff416c;">Configuration Santé</h2>
            <form onsubmit="save(event)">
                <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">📸 Photo</div>
                <input type="file" id="i" style="display:none" onchange="preview(event)">
                <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
                <div class="serment-container">
                    <input type="checkbox" required> <span style="font-size:0.8rem;">Je confirme la sincérité de mes données médicales.</span>
                </div>
                <button type="submit" class="btn-pink">🚀 Valider</button>
            </form>
        </div>
    </div>
    <script>
        let b64="";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('c').innerText=''; }; r.readAsDataURL(e.target.files[0]); }
        function save(e){
            e.preventDefault();
            localStorage.setItem('u_p', b64); localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value); localStorage.setItem('u_pj', document.getElementById('pj').value);
            window.location.href='/profile';
        }
    </script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:0 auto 15px; background-size:cover;"></div>
            <h2 id="vN" style="margin:0;"></h2><p style="color:#007bff; font-weight:bold;">Santé Validé ✅</p>
        </div>
        <div class="st-group" style="margin-top:20px;">
            <div class="st-item"><span>Génotype</span><b id="rG"></b></div>
            <div class="st-item"><span>Projet de vie</span><b id="rP"></b></div>
        </div>
        <a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a>
    </div>
    <script>
        document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        document.getElementById('vN').innerText = localStorage.getItem('u_fn');
        document.getElementById('rG').innerText = localStorage.getItem('u_gt');
        document.getElementById('rP').innerText = "Enfant : " + localStorage.getItem('u_pj');
    </script></body></html>`);
});

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3>Partenaires Compatibles</h3></div>
        <div id="match-container"></div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div>

    <div id="notif" class="notif-box">
        <div class="notif-header">📩 Genlove Notification</div>
        <div class="notif-body">
            Quelqu'un de compatible avec vous souhaite échanger 💞<br><br>
            <small>Ouvrez Genlove pour découvrir qui c'est 💝</small>
        </div>
        <button class="notif-btn" onclick="document.getElementById('notif').style.display='none'">📖 Ouvrir l'application Genlove</button>
    </div>

    <div id="popup-overlay" onclick="closePopup()">
        <div class="popup-content" onclick="event.stopPropagation()">
            <h3 id="pop-name" style="color:#ff416c;"></h3>
            <div id="pop-details"></div>
            <div id="pop-msg" class="popup-msg"></div>
            <button class="btn-pink" style="width:100%" onclick="triggerNotif()">🚀 Contacter ce profil</button>
        </div>
    </div>

    <script>
        const partners = [{id:1, gt:"AA", gs:"O+", pj:"Fonder un foyer sain."}, {id:2, gt:"AS", gs:"B-", pj:"Avoir des enfants."}];
        const myGt = localStorage.getItem('u_gt');
        const container = document.getElementById('match-container');
        
        partners.forEach(p => {
            if((myGt === "SS" || myGt === "AS") && p.gt !== "AA") return;
            container.innerHTML += \`
                <div class="match-card">
                    <div class="match-photo-blur"></div>
                    <div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div>
                    <div style="display:flex;">
                        <button class="btn-action btn-contact" onclick="triggerNotif()">Contacter</button>
                        <button class="btn-action btn-details" onclick='showDetails(\${JSON.stringify(p)})'>Détails</button>
                    </div>
                </div>\`;
        });

        function showDetails(p) {
            document.getElementById('pop-name').innerText = "Profil #" + p.id;
            document.getElementById('pop-details').innerHTML = "<b>Génotype :</b> " + p.gt + "<br><b>Groupe :</b> " + p.gs + "<br><b>Projet :</b> " + p.pj;
            document.getElementById('pop-msg').innerHTML = "<b>Conseil :</b> Union sécurisée pour votre descendance.";
            document.getElementById('popup-overlay').style.display = 'flex';
        }

        function triggerNotif() {
            closePopup();
            const n = document.getElementById('notif');
            n.style.display = 'block';
            setTimeout(() => { n.style.display = 'none'; }, 6000);
        }
        function closePopup() { document.getElementById('popup-overlay').style.display = 'none'; }
    </script></body></html>`);
});

app.listen(port);
