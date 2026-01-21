const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    /* BASE SHELL */
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; overflow-x: hidden; }
    
    /* NOTIFY BANNER */
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }

    /* POPUP SYSTEM (FORCE DISPLAY) */
    #popup-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9000; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
    .popup-content { background: white; border-radius: 20px; width: 90%; max-width: 380px; padding: 25px; position: relative; box-shadow: 0 15px 40px rgba(0,0,0,0.4); text-align: left; }
    .close-popup { position: absolute; top: 10px; right: 20px; font-size: 2.2rem; cursor: pointer; color: #bbb; }
    .popup-msg { background: #e7f3ff; padding: 15px; border-radius: 12px; border-left: 5px solid #007bff; font-size: 0.88rem; color: #1a2a44; margin-top: 15px; line-height: 1.5; }

    /* DESIGN ELEMENTS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; width: 85%; margin: 20px auto; border: none; cursor: pointer; display: block; text-decoration: none; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; margin: 15px; width: auto; display: block; text-decoration: none; }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }
    
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 50px; height: 50px; border-radius: 50%; background: #eee; filter: blur(5px); }
</style>
`;

const scripts = `
<script>
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        document.getElementById('notify-msg').innerText = msg;
        n.classList.add('show');
        setTimeout(() => { n.classList.remove('show'); }, 3000);
    }

    function openDetails(pId, pGt, pGs, pPj) {
        const myGt = localStorage.getItem('u_gt') || "AA";
        document.getElementById('pop-title').innerText = "Profil #" + pId;
        document.getElementById('pop-body').innerHTML = "<b>Génotype :</b> " + pGt + "<br><b>Groupe Sanguin :</b> " + pGs + "<br><br><b>Projet de vie :</b><br><i>" + pPj + "</i>";
        
        let msg = "";
        if(myGt === "AA" && pGt === "AA") msg = "<b>L'Union Sérénité :</b> Félicitations ! Votre compatibilité génétique est idéale. En choisissant un partenaire AA, vous offrez à votre future descendance une protection totale.";
        else if(myGt === "AA" && pGt === "AS") msg = "<b>L'Union Protectrice :</b> Excellent choix. En tant que AA, vous jouez un rôle protecteur essentiel. Votre union ne présente aucun risque de naissance d'un enfant SS.";
        else if(myGt === "AA" && pGt === "SS") msg = "<b>L'Union Solidaire :</b> Une union magnifique et sans crainte. Votre profil AA est le partenaire idéal pour une personne SS. Aucun de vos enfants ne souffrira de la forme majeure.";
        
        document.getElementById('pop-msg').innerHTML = msg;
        document.getElementById('popup-overlay').style.display = 'flex';
    }

    function closePop() { document.getElementById('popup-overlay').style.display = 'none'; }
</script>
`;

app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        
        <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;">
            <h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3>
        </div>

        <div id="match-container" style="margin-top:10px;">
            </div>

        <a href="/profile" class="btn-pink">Retour au profil</a>
    </div>

    <div id="popup-overlay" onclick="closePop()">
        <div class="popup-content" onclick="event.stopPropagation()">
            <span class="close-popup" onclick="closePop()">&times;</span>
            <h3 id="pop-title" style="color:#ff416c; margin:0 0 15px 0;"></h3>
            <div id="pop-body" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
            <div id="pop-msg" class="popup-msg"></div>
            <button class="btn-pink" style="margin:20px 0 0; width:100%" onclick="closePop(); showNotify('Demande de contact envoyée !')">🚀 Contacter ce profil</button>
        </div>
    </div>

    ${scripts}
    <script>
        const partners = [
            {id:1, gt:"AA", gs:"O+", pj:"Désire fonder une famille unie."},
            {id:2, gt:"AS", gs:"B-", pj:"Souhaite des enfants en bonne santé."},
            {id:3, gt:"SS", gs:"A+", pj:"Cherche une relation stable et sérieuse."}
        ];
        const myGt = localStorage.getItem('u_gt') || "AA";
        const container = document.getElementById('match-container');
        
        let filtered = partners;
        if (myGt === "SS" || myGt === "AS") {
            container.innerHTML = '<div style="margin:15px; padding:15px; background:#e7f3ff; border-radius:12px; font-size:0.85rem; border-left:5px solid #007bff;">✨ <b>Engagement Santé :</b> Pour protéger votre future descendance, nous vous présentons uniquement des profils <b>AA</b>.</div>';
            filtered = partners.filter(p => p.gt === "AA");
        }

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'match-card';
            card.innerHTML = \`
                <div class="match-photo-blur"></div>
                <div style="flex:1"><b>Profil #\${p.id}</b><br><small>Génotype \${p.gt}</small></div>
                <div style="display:flex;">
                    <button class="btn-action btn-contact" onclick="showNotify('Demande envoyée au Profil #\${p.id}')">Contact</button>
                    <button class="btn-action btn-details" style="margin-left:5px" onclick="openDetails('\${p.id}', '\${p.gt}', '\${p.gs}', '\${p.pj}')">Détails</button>
                </div>\`;
            container.appendChild(card);
        });
    </script></body></html>`);
});

// Les autres routes restent conformes à la V62.6
app.get('/', (req, res) => { res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;"><div style="font-size:3.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé pour bâtir des couples sains</div><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div></div></body></html>`); });
app.get('/profile', (req, res) => { res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f8f9fa;"><div class="app-shell"><div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;"><div style="display:flex; justify-content:space-between;"><a href="/" style="text-decoration:none; color:#666;">Accueil</a><a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a></div><div id="vP" style="width:100px; height:100px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background:#eee;"></div><h2 id="vN">Utilisateur</h2><p id="vR">📍 Localisation</p></div><div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div><div style="background:white; border-radius:15px; margin:0 15px 15px; overflow:hidden;"><div style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #f8f8f8;"><span>Génotype</span><b id="rG"></b></div></div><a href="/matching" class="btn-dark">🔍 Trouver un partenaire</a></div><script>document.getElementById('vN').innerText=localStorage.getItem('u_fn')||"Utilisateur"; document.getElementById('rG').innerText=localStorage.getItem('u_gt')||"AA";</script></body></html>`); });
app.get('/settings', (req, res) => { res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="padding:25px; text-align:center; background:white;"><h2>Paramètres</h2></div><div style="background:white; border-radius:15px; margin:0 15px 15px; overflow:hidden;"><div style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid #f8f8f8;"><span>Visibilité</span><button onclick="showNotify('Mis à jour')">Public</button></div></div><a href="/profile" class="btn-pink">Retour</a></div>${scripts}</body></html>`); });

app.listen(port);
