const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    
    /* ACCUEIL */
    .home-screen { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center; }
    .logo-text { font-size: 3.5rem; font-weight: bold; margin-bottom: 5px; }
    .slogan { font-weight: bold; color: #1a2a44; margin-bottom: 40px; font-size: 1rem; line-height: 1.5; }
    .secure-note { font-size: 0.75rem; color: #666; margin-top: 25px; }

    /* FORMULAIRE & PHOTO AVEC X */
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; background-size: cover; background-position: center; }
    .remove-x { position: absolute; top: 5px; right: 5px; background: #ff416c; color: white; border-radius: 50%; width: 24px; height: 24px; display: none; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; font-weight: bold; z-index: 10; }
    
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; color: #333; }
    
    /* TEXTE DANS LA CASE DATE */
    input[type="date"]::before { content: "Date de naissance "; width: 100%; color: #757575; }
    input[type="date"]:focus::before, input[type="date"]:valid::before { content: ""; display: none; }

    /* MATCHING & PARAMÈTRES */
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; text-decoration: none; color: #333; font-size: 0.95rem; }
    .match-card { background: white; border-radius: 20px; margin: 15px; display: flex; align-items: center; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .match-img { width: 70px; height: 70px; border-radius: 50%; background-size: cover; border: 2px solid #ff416c; }

    /* BOUTONS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 20px; width: auto; box-sizing: border-box; }
</style>
`;

// --- ROUTE : ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="home-screen">
        <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
        <div class="slogan">Unissez cœur et santé pour bâtir des couples sains</div>
        <div style="width:100%; margin-top:20px;">
            <p style="font-size:0.9rem; color:#1a2a44; margin-bottom:10px;">Avez-vous déjà un compte ?</p>
            <a href="/profile" class="btn-dark">➔ Se connecter</a>
            <a href="/signup" style="color:#1a2a44; text-decoration:none; font-weight:bold; display:block; margin-top:15px;">👤 Créer un compte</a>
        </div>
        <div class="secure-note">🔒 Vos données de santé sont cryptées et confidentielles.</div>
    </div></div></body></html>`);
});

// --- ROUTE : INSCRIPTION (AVEC LES 2 AJUSTEMENTS) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="page-white">
        <h2 style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
        <form onsubmit="saveFullData(event)">
            <div class="photo-circle" id="c" onclick="document.getElementById('i').click()">
                <span id="t">📸 Photo *</span>
                <div class="remove-x" id="x" onclick="resetPhoto(event)">✕</div>
            </div>
            <input type="file" id="i" style="display:none" onchange="preview(event)" required>
            
            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom" required>
            
            <input type="date" id="dob" class="input-box" required>

            <select id="gt" class="input-box" required>
                <option value="">Génotype (Obligatoire)</option>
                <option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
            </select>
            
            <div style="display:flex; gap:10px;">
                <select id="gs" class="input-box" style="flex:2;" required>
                    <option value="">Groupe Sanguin</option>
                    <option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                </select>
                <select id="rh" class="input-box" style="flex:1;" required>
                    <option value="">Rh</option><option value="+">+</option><option value="-">-</option>
                </select>
            </div>

            <select id="pj" class="input-box" required>
                <option value="">Projet de vie (Désir d'enfant ?)</option>
                <option value="Oui">Oui</option><option value="Non">Non</option>
            </select>

            <button type="submit" class="btn-pink">🚀 Valider mon profil</button>
        </form>
    </div></div>
    <script>
        let b64="";
        function preview(e){
            const r=new FileReader();
            r.onload=()=>{
                b64=r.result;
                document.getElementById('c').style.backgroundImage='url('+b64+')';
                document.getElementById('t').style.display='none';
                document.getElementById('x').style.display='flex'; // AJUSTEMENT 2 : Affiche le X
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
        function saveFullData(e){
            e.preventDefault();
            localStorage.setItem('u_p', b64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs').value + document.getElementById('rh').value);
            window.location.href='/profile';
        }
    </script></body></html>`);
});

// --- ROUTE : PROFIL ---
app.get('/profile', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f8f9fa;"><div class="app-shell">
        <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
            <div style="display:flex; justify-content:space-between;"><a href="/" style="text-decoration:none; color:#666;">Accueil</a><a href="/settings" style="text-decoration:none; font-size:1.4rem;">⚙️</a></div>
            <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
            <h2 id="vN">André</h2>
            <p style="color:#007bff; font-weight:bold;">Validé ✅</p>
        </div>
        <div class="st-group" style="margin-top:15px;">
            <div class="st-item"><span>Génotype</span><b id="rG">...</b></div>
            <div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div>
        </div>
        <a href="/matching" class="btn-dark">Rechercher un partenaire</a>
    </div>
    <script>
        document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        document.getElementById('vN').innerText = localStorage.getItem('u_fn');
        document.getElementById('rG').innerText = localStorage.getItem('u_gt');
        document.getElementById('rS').innerText = localStorage.getItem('u_gs');
    </script></body></html>`);
});

// --- ROUTE : MATCHING (AVEC FILTRE SS AUTOMATIQUE) ---
app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:20px; background:white; text-align:center;"><h3>Partenaires Compatibles</h3></div>
        <div id="list"></div>
        <a href="/profile" class="btn-pink">Retour</a>
    </div>
    <script>
        const partners = [
            {n:"Sarah", gt:"AA", p:"https://i.pravatar.cc/150?u=1"},
            {n:"Julie", gt:"SS", p:"https://i.pravatar.cc/150?u=2"},
            {n:"Marc", gt:"AS", p:"https://i.pravatar.cc/150?u=3"}
        ];
        const myGt = localStorage.getItem('u_gt');
        const list = document.getElementById('list');
        partners.filter(p => !(myGt === 'SS' && p.gt === 'SS')).forEach(p => {
            list.innerHTML += \`<div class="match-card"><div class="match-img" style="background-image:url('\${p.p}')"></div><div style="margin-left:15px;"><b>\${p.n}</b><br><small>Génotype: \${p.gt}</small></div></div>\`;
        });
    </script></body></html>`);
});

// --- ROUTE : PARAMÈTRES (VERSION 58.5) ---
app.get('/settings', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:25px; background:white; text-align:center;">
            <div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
        </div>
        <div class="st-group">
            <a href="/signup" class="st-item"><span>Modifier mon profil</span><span style="color:#007bff; font-weight:bold;">Modifier ➔</span></a>
        </div>
        <a href="/profile" class="btn-pink">Retour</a>
        <div style="text-align:center; font-size:0.75rem; color:#bbb;">Version 58.5.0 - Genlove © 2026</div>
    </div></body></html>`);
});

app.listen(port);
