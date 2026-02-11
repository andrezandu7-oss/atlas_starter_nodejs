const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 100; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
    .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }
    .btn-action { border: none; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; }
    .btn-details { background: #ff416c; color: white; }
    .btn-contact { background: #1a2a44; color: white; margin-right: 5px; }
    #popup-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center; padding:20px; }
    .popup-content { background:white; border-radius:20px; width:100%; max-width:380px; padding:25px; position:relative; text-align:left; animation: slideUp 0.3s ease-out; }
    .close-popup { position:absolute; top:15px; right:15px; font-size:1.5rem; cursor:pointer; color:#666; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }
    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }
    .match-card { background: white; margin: 10px 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo-blur { width: 55px; height: 55px; border-radius: 50%; background: #eee; filter: blur(6px); }
    .end-overlay { position: fixed; inset: 0; background: linear-gradient(180deg, #4a76b8 0%, #1a2a44 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; }
    .end-card { background: white; border-radius: 30px; padding: 40px 25px; width: 85%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
</style>
`;

const notifyScript = `
<script>
    function showNotify(msg) {
        const n = document.getElementById('genlove-notify');
        document.getElementById('notify-msg').innerText = msg;
        n.classList.add('show');
        setTimeout(() => { n.classList.remove('show'); }, 3000);
    }
</script>
`;

function calculerAge(dateNaissance) {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div class="home-screen"><div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div><div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div><div style="width:100%; margin-top:20px;"><p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p><a href="/profile" class="btn-dark">➔ Se connecter</a><a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a></div><div style="font-size: 0.75rem; color: #666; margin-top: 25px;">🔒 Vos données de santé sont cryptées et confidentielles.</div></div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body><div class="app-shell"><div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div><div class="page-white" id="main-content"><h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2><form onsubmit="saveAndRedirect(event)"><div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div><input type="file" id="i" style="display:none" onchange="preview(event)"><input type="text" id="fn" class="input-box" placeholder="Prénom" required><input type="text" id="ln" class="input-box" placeholder="Nom" required><select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select><div style="text-align:left; margin-top:10px; padding-left:5px;"><small style="color:#666; font-size:0.75rem;">📅 Date de naissance :</small></div><input type="date" id="dob" class="input-box" style="margin-top:2px;" required><input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required><select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select><div style="display:flex; gap:10px;"><select id="gs_type" class="input-box" style="flex:2;" required><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select><select id="gs_rh" class="input-box" style="flex:1;" required><option>+</option><option>-</option></select></div><select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select><div class="serment-container"><input type="checkbox" id="oath" style="width:20px;height:20px;" required><label for="oath" class="serment-text">Je confirme sur l'honneur que les informations saisies sont sincères et conformes à mes résultats médicaux.</label></div><button type="submit" class="btn-pink">🚀 Valider mon profil</button></form></div></div><script>let b64 = localStorage.getItem('u_p') || ""; window.onload = () => { if(b64) { document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; } document.getElementById('fn').value = localStorage.getItem('u_fn') || ""; document.getElementById('ln').value = localStorage.getItem('u_ln') || ""; document.getElementById('gender').value = localStorage.getItem('u_gender') || ""; document.getElementById('dob').value = localStorage.getItem('u_dob') || ""; document.getElementById('res').value = localStorage.getItem('u_res') || ""; document.getElementById('gt').value = localStorage.getItem('u_gt') || ""; const fullGS = localStorage.getItem('u_gs') || ""; if(fullGS) { document.getElementById('gs_type').value = fullGS.replace(/[+-]/g, ""); document.getElementById('gs_rh').value = fullGS.includes('+') ? '+' : '-'; } document.getElementById('pj').value = localStorage.getItem('u_pj') || ""; }; function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); } function saveAndRedirect(e){ e.preventDefault(); document.getElementById('loader').style.display='flex'; localStorage.setItem('u_p', b64); localStorage.setItem('u_fn', document.getElementById('fn').value); localStorage.setItem('u_ln', document.getElementById('ln').value); localStorage.setItem('u_gender', document.getElementById('gender').value); localStorage.setItem('u_dob', document.getElementById('dob').value); localStorage.setItem('u_res', document.getElementById('res').value); localStorage.setItem('u_gt', document.getElementById('gt').value); localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value); localStorage.setItem('u_pj', document.getElementById('pj').value); setTimeout(() => { window.location.href='/profile'; }, 5000); }</script></body></html>`);
});

app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f8f9fa;"><div class="app-shell"><div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;"><div style="display:flex; justify-content:space-between; align-items:center;"><a href="/" style="text-decoration:none; background:#eff6ff; color:#1a2a44; padding:8px 14px; border-radius:12px; font-size:0.8rem; font-weight:bold; display:flex; align-items:center; gap:8px; border: 1px solid #dbeafe;"><span style="font-size:1rem;">🏠</span> Accueil</a><a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a></div><div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div><h2 id="vN" style="margin:5px 0 0 0;">Utilisateur</h2><p id="vR" style="color:#666; margin:0 0 10px 0; font-size:0.9rem;">📍 Localisation</p><p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p></div><div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div><div class="st-group"><div class="st-item"><span>Génotype</span><b id="rG">...</b></div><div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div><div class="st-item"><span>Âge</span><b id="rAge">...</b></div><div class="st-item"><span>Résidence</span><b id="rRes">...</b></div><div class="st-item"><span>Projet de vie</span><b id="rP">...</b></div></div><a href="/matching" class="btn-dark" style="text-decoration:none;">🔍 Trouver un partenaire</a></div><script>const p = localStorage.getItem('u_p'); if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')'; document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || "") + " " + (localStorage.getItem('u_ln') || ""); document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || "") + " (" + (localStorage.getItem('u_gender') || "") + ")"; document.getElementById('rG').innerText = localStorage.getItem('u_gt'); document.getElementById('rS').innerText = localStorage.getItem('u_gs'); document.getElementById('rP').innerText = "Enfant : " + localStorage.getItem('u_pj'); const dob = localStorage.getItem('u_dob'); if(dob) { const age = Math.floor((new Date() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)); document.getElementById('rAge').innerText = age + ' ans'; } document.getElementById('rRes').innerText = localStorage.getItem('u_res') || 'Non renseigné';</script></body></html>`);
});

app.get('/matching', (req, res) => {
    const partners = [
        {id:1, gt:"AA", gs:"O+", pj:"Désire fonder une famille unie.", name:"Sarah", dob:"1992-03-15", res:"Luanda"},
        {id:2, gt:"AA", gs:"B-", pj:"Souhaite des enfants en bonne santé.", name:"Aminata", dob:"1988-07-22", res:"Viana"}, 
        {id:3, gt:"AA", gs:"A+", pj:"Cherche une relation stable et sérieuse.", name:"Fatou", dob:"1995-11-08", res:"Talatona"},
        {id:4, gt:"AA", gs:"AB+", pj:"Prête pour une vie de couple épanouie.", name:"Isabella", dob:"1990-05-12", res:"Luanda"},
        {id:5, gt:"AA", gs:"O-", pj:"Rêve d'une famille harmonieuse.", name:"Mariama", dob:"1993-09-30", res:"Cacuaco"},
        {id:6, gt:"SS", gs:"A+", pj:"Vivre intensément chaque jour.", name:"Kadi", dob:"1996-01-10", res:"Luanda"},
        {id:7, gt:"AS", gs:"B+", pj:"À la recherche de mon âme sœur.", name:"Marc", dob:"1994-02-20", res:"Cacuaco"}
    ];

    const partnersWithAge = partners.map(p => ({
        ...p,
        age: calculerAge(p.dob),
        distance: Math.floor(Math.random() * 30)
    }));

    const matchesHTML = partnersWithAge.map(p => `
        <div class="match-card" data-gt="${p.gt}">
            <div class="match-photo-blur"></div>
            <div style="flex:1">
                <b>${p.name} (#${p.id})</b><br>
                <small>${p.age} ans • ${p.res} (${p.distance}km) • Génotype ${p.gt}</small>
            </div>
            <div style="display:flex;">
                <button class="btn-action btn-contact" onclick="showNotify('Demande envoyée à ${p.name}')">Contacter</button>
                <button class="btn-action btn-details" onclick='showDetails(${JSON.stringify(p)})'>Détails</button>
            </div>
        </div>
    `).join('');

    const detailsScript = partnersWithAge.map(p => `
        case ${p.id}: 
            document.getElementById('pop-name').innerText = '${p.name} #${p.id}';
            document.getElementById('pop-details').innerHTML = "<b>Âge :</b> ${p.age} ans<br><b>Résidence :</b> ${p.res} (${p.distance}km)<br><b>Génotype :</b> ${p.gt}<br><b>Groupe Sanguin :</b> ${p.gs}<br><br><b>Projet de vie :</b><br><i>${p.pj}</i>";
            document.getElementById('pop-msg').innerHTML = "<b>L'Union Sérénité :</b> Compatibilité validée.";
            break;`).join('');

    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f4f7f6;"><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;"><h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3></div><div id="match-container">${matchesHTML}</div><a href="/profile" class="btn-pink">Retour au profil</a></div><div id="popup-overlay" onclick="closePopup()"><div class="popup-content" onclick="event.stopPropagation()"><span class="close-popup" onclick="closePopup()">&times;</span><h3 id="pop-name" style="color:#ff416c; margin-top:0;">Détails</h3><div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div><div id="pop-msg" style="background:#e7f3ff; padding:15px; border-radius:12px; border-left:5px solid #007bff; font-size:0.85rem; color:#1a2a44; line-height:1.4; margin-top:15px;"></div><button class="btn-pink" style="margin:20px 0 0 0; width:100%" onclick="startChat(); closePopup();">🚀 Contacter ce profil</button></div></div>${notifyScript}<script>
        let sP = null;
        window.onload = () => {
            const myGt = localStorage.getItem('u_gt');
            if(myGt === 'SS' || myGt === 'AS') {
                document.getElementById('pop-name').innerText = "Note de Sérénité 🛡️";
                document.getElementById('pop-details').innerText = "Parce que votre bonheur mérite une sérénité totale, Genlove a sélectionné pour vous uniquement des profils AA. C'est notre façon de protéger votre projet de famille pour que vous puissiez construire votre avenir l'esprit léger.";
                document.getElementById('pop-msg').style.display = 'none';
                document.querySelector('#popup-overlay button').innerText = "D'accord, je comprends";
                document.querySelector('#popup-overlay button').onclick = closePopup;
                document.getElementById('popup-overlay').style.display = 'flex';
                
                document.querySelectorAll('.match-card').forEach(card => {
                    if(card.dataset.gt !== 'AA') card.style.display = 'none';
                });
            }
        };
        function showDetails(p) { 
            sP = p;
            document.getElementById('pop-msg').style.display = 'block';
            document.querySelector('#popup-overlay button').innerText = "🚀 Contacter ce profil";
            document.querySelector('#popup-overlay button').onclick = () => { startChat(); closePopup(); };
            switch(p.id) { ${detailsScript} } 
            document.getElementById('popup-overlay').style.display = 'flex'; 
        }
        function closePopup() { document.getElementById('popup-overlay').style.display = 'none'; }
        function startChat() { sessionStorage.setItem('chatPartner', JSON.stringify(sP)); window.location.href = '/chat'; }
    </script></body></html>`);
});

app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body style="background:#f4f7f6;"><div class="app-shell"><div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div><div style="padding:25px; background:white; text-align:center;"><div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div></div><div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">CONFIDENTIALITÉ</div><div class="st-group"><div class="st-item"><span>Visibilité profil</span><label class="switch"><input type="checkbox" checked onchange="showNotify('Paramètre mis à jour !')"><span class="slider"></span></label></div></div><div class="st-group"><a href="/signup" style="text-decoration:none;" class="st-item"><span>Modifier mon profil</span><b>Modifier ➔</b></a></div><div class="st-group"><div class="st-item" style="color:red; font-weight:bold;">Supprimer mon compte</div><div style="display:flex; justify-content:space-around; padding:15px;"><button onclick="localStorage.clear(); location.href='/';" style="background:#1a2a44; color:white; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Oui</button><button onclick="showNotify('Action annulée')" style="background:#eee; color:#333; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Non</button></div></div><a href="/profile" class="btn-pink">Retour</a></div>${notifyScript}</body></html>`);
});

app.get('/chat-end', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body class="end-overlay"><div class="end-card"><div style="font-size:50px; margin-bottom:10px;">✨</div><h2 style="color:#1a2a44;">Merci pour cet échange</h2><p style="color:#666; margin-bottom:30px;">Genlove vous remercie pour ce moment de partage et de franchise.</p><a href="/matching" class="btn-pink" style="width:100%; margin:0;">🔎 Trouver un autre profil</a></div></body></html>`);
});

app.get('/logout-success', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body class="end-overlay">
        <div class="end-card">
            <div style="font-size:50px; margin-bottom:20px;">🛡️</div>
            <h2 style="color:#1a2a44;">Merci pour votre confiance</h2>
            <p style="color:#666; margin-bottom:30px;">Votre session a été fermée en toute sécurité.</p>
            <button onclick="localStorage.clear(); window.location.href='/';" class="btn-dark" style="width:100%; margin:0; border-radius:50px; cursor:pointer; border:none;">Quitter</button>
        </div>
    </body></html>`);
});

app.get('/chat', (req, res) => {
    res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"><title>Genlove Chat - Sécurisé</title><style>body { font-family: sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; overflow: hidden; height: 100vh; } .screen { display: flex; width: 100%; max-width: 450px; height: 100vh; background: white; flex-direction: column; position: relative; } .chat-header { background: #9dbce3; color: white; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; } .btn-quit { background: #ffffff; color: #9dbce3; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } .btn-logout-badge { background: #1a2a44; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); } .digital-clock { background: #1a1a1a; color: #ff416c; padding: 6px 15px; border-radius: 10px; font-family: 'Courier New', monospace; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; border: 1px solid #333; } .chat-messages { flex: 1; padding: 15px; background: #f8fafb; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-bottom: 100px; } .bubble { padding: 12px 16px; border-radius: 18px; max-width: 80%; line-height: 1.4; } .received { background: #e2ecf7; align-self: flex-start; } .sent { background: #ff416c; color: white; align-self: flex-end; } .input-area { position: fixed; bottom: 0; width: 100%; max-width: 450px; padding: 10px 15px 45px 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; box-sizing: border-box; } #security-popup { display: flex; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; justify-content: center; align-items: center; padding: 20px; } .popup-card { background: white; border-radius: 30px; padding: 35px 25px; text-align: center; width: 88%; } .pedagogic-box { background: #f0f7ff; border-radius: 15px; padding: 15px; text-align: left; margin: 20px 0; border: 1px solid #d0e3ff; }</style></head><body><div id="security-popup"><div class="popup-card"><h3>🔒 Espace de discussion privé</h3><p><b>Par mesure de confidentialité, Genlove a sécurisé cet échange.</b></p><div class="pedagogic-box"><div style="margin-bottom:10px;">🛡️ <b>Éphémère :</b> Tout s'efface dans 30 min.</div><div>🕵️ <b>Privé :</b> Aucun historique conservé.</div></div><button style="background:#4a76b8; color:white; border:none; padding:16px; border-radius:30px; font-weight:bold; cursor:pointer; width:100%;" onclick="this.parentElement.parentElement.style.display='none'; startTimer()">Démarrer l'échange</button></div></div><div class="screen"><div class="chat-header"><button class="btn-quit" onclick="showFinal('chat')">✕</button><div class="digital-clock">❤️ <span id="timer-display">30:00</span></div><button class="btn-logout-badge" onclick="showFinal('logout')">Logout 🔒</button></div><div class="chat-messages" id="box"><div class="bubble received">Bonjour ! Ton profil correspond exactement à ce que je recherche. 👋</div></div><div class="input-area"><textarea id="msg" style="flex:1; background:#f1f3f4; border:none; padding:12px; border-radius:25px;" placeholder="Écrivez ici..."></textarea><button style="background:#4a76b8; color:white; border:none; width:45px; height:45px; border-radius:50%;" onclick="send()">➤</button></div></div><script>let t = 1800; function startTimer() { setInterval(() => { t--; let m = Math.floor(t / 60), s = t % 60; document.getElementById('timer-display').innerText = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; if (t <= 0) { localStorage.clear(); window.location.href = '/logout-success'; } }, 1000); } function showFinal(type) { const msg = type === 'chat' ? "Quitter la discussion ?" : "Se déconnecter ?"; if(confirm(msg)) { window.location.href = (type === 'chat') ? '/chat-end' : '/logout-success'; } } function send() { const i = document.getElementById('msg'); if(i.value.trim()) { const d = document.createElement('div'); d.className = 'bubble sent'; d.innerText = i.value; document.getElementById('box').appendChild(d); i.value = ''; document.getElementById('box').scrollTop = document.getElementById('box').scrollHeight; } }</script></body></html>`);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove unifié sur le port ${port}`);
});
