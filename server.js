const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLE GLOBAL UNIFIÉ (V25 + V29 + V31) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* ACCUEIL & BOUTONS */
    .welcome-screen { background: #f4e9da; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; }
    .btn-dark { background: #1a2a44; color: white; border-radius: 12px; padding: 18px; text-decoration: none; width: 100%; font-weight: bold; margin-bottom: 15px; display: block; }
    .btn-pink { background: #ff416c; color: white; border-radius: 50px; padding: 16px; text-decoration: none; width: 100%; font-weight: bold; display: block; border: none; cursor: pointer; text-align: center; }

    /* INSCRIPTION & DASHBOARD */
    .content { padding: 20px; text-align: center; }
    .photo-circle { border: 2px dashed #ff416c; height: 120px; width: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; margin: 0 auto 15px auto; background-size: cover; background-position: center; position: relative; }
    .input-field { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; margin-top: 5px; box-sizing: border-box; }
    .med-badge { display: flex; justify-content: space-around; background: #1a2a44; color: white; padding: 15px; border-radius: 15px; margin: 20px 0; }

    /* MATCHING & FLOU */
    .match-card { background: white; border-radius: 15px; border: 1px solid #eee; display: flex; align-items: center; padding: 15px; gap: 15px; margin-bottom: 15px; text-decoration: none; color: inherit; }
    .match-img-blurred { width: 65px; height: 65px; border-radius: 50%; filter: blur(10px); background-size: cover; border: 2px solid #f4e9da; }

    /* DÉTAILS COMPATIBILITÉ (BASÉ SUR IMAGE) */
    .comp-screen { padding: 30px 25px; text-align: left; }
    .comp-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
    .comp-logo { color: #007bff; font-weight: bold; font-size: 1.3rem; margin-bottom: 25px; display: block; }
    .comp-section { margin-bottom: 20px; }
    .comp-title { font-weight: bold; font-size: 1rem; color: #1a2a44; }
    .comp-desc { font-size: 0.85rem; color: #666; line-height: 1.3; }
    .btn-contact { background: #f8f9fa; border: 1px solid #eee; width: 100%; padding: 15px; border-radius: 10px; font-weight: bold; margin-top: 25px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; color: #333; text-decoration: none; }
</style>
`;

// --- ROUTE 1 : ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <h1 style="font-size:3.2rem; color:#1a2a44; margin:0;">Gen<span style="color:#ff416c;">love</span></h1>
        <p style="font-weight:bold; color:#1a2a44;">L'amour qui soigne 💙</p>
        <p style="margin-bottom: 40px;">Unissez cœur et santé pour bâtir des couples solides ❤️</p>
        <a href="/signup" class="btn-dark">👤 Créer mon profil</a>
    </div></div></body></html>`);
});

// --- ROUTE 2 : INSCRIPTION (V25) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <h2 style="color:#ff416c;">Mon Profil Médical</h2>
        <form onsubmit="save(event)">
            <div class="photo-circle" id="circ" onclick="document.getElementById('pI').click()">📸 Photo *</div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="up(event)">
            <input type="text" id="fn" class="input-field" placeholder="Prénom" required>
            <select id="gt" class="input-field"><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
            <div id="vB" onclick="this.innerText='✅ Vidéo OK'; this.style.color='#4caf50'; this.ok=true;" style="margin-top:10px; border:1px dashed #007bff; padding:10px; border-radius:10px; color:#007bff; cursor:pointer;">🎥 Vidéo de vérification *</div>
            <button type="submit" class="btn-pink" style="margin-top:20px;">🚀 Finaliser</button>
        </form>
    </div></div>
    <script>
        function up(e){ const r=new FileReader(); r.onload=()=>{ localStorage.setItem('uImg',r.result); document.getElementById('circ').style.backgroundImage='url('+r.result+')'; document.getElementById('circ').innerText=''; }; r.readAsDataURL(e.target.files[0]); }
        function save(e){
            e.preventDefault();
            const d = { fn:document.getElementById('fn').value, gt:document.getElementById('gt').value };
            localStorage.setItem('uData', JSON.stringify(d));
            window.location.href='/dashboard';
        }
    </script></body></html>`);
});

// --- ROUTE 3 : DASHBOARD (V25) ---
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="content">
        <div id="resPic" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; margin:20px auto; background-size:cover;"></div>
        <h2 id="resName"></h2>
        <div class="med-badge"><div>GÉNOTYPE<br><b id="resGt" style="color:#ff416c;">--</b></div></div>
        <a href="/matching" class="btn-pink">🔍 Rechercher des partenaires</a>
    </div></div>
    <script>
        const d = JSON.parse(localStorage.getItem('uData'));
        const p = localStorage.getItem('uImg');
        document.getElementById('resName').innerText = d.fn;
        document.getElementById('resGt').innerText = d.gt;
        document.getElementById('resPic').style.backgroundImage = 'url('+p+')';
    </script></body></html>`);
});

// --- ROUTE 4 : MATCHING FLOUTÉ (V29) ---
app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell">
        <div style="padding:20px; border-bottom:1px solid #eee;"><h2>Partenaires Compatibles</h2></div>
        <div style="padding:15px;" id="list"></div>
    </div>
    <script>
        const myGt = JSON.parse(localStorage.getItem('uData')).gt;
        const partners = [
            { id: 1, name: "Sonia", gt: "AA", img: "https://randomuser.me/api/portraits/women/65.jpg" },
            { id: 2, name: "Marc", gt: "AS", img: "https://randomuser.me/api/portraits/men/43.jpg" },
            { id: 3, name: "Leila", gt: "SS", img: "https://randomuser.me/api/portraits/women/22.jpg" }
        ];
        const listDiv = document.getElementById('list');
        partners.forEach(p => {
            if(myGt === "SS" && p.gt === "SS") return; // Règle SS
            listDiv.innerHTML += \`
                <a href="/compatibility/\${p.id}" class="match-card">
                    <div class="match-img-blurred" style="background-image:url('\${p.img}')"></div>
                    <div style="flex:1;"><b>\${p.name[0]}****</b><br><span style="color:#ff416c; font-size:0.8rem;">Gén. \${p.gt}</span></div>
                    <span>➔</span>
                </a>\`;
        });
    </script></body></html>`);
});

// --- ROUTE 5 : DÉTAILS COMPATIBILITÉ (V31 - IMAGE) ---
app.get('/compatibility/:id', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="comp-screen">
        <div class="comp-header">
            <span style="color:#ff416c; font-size:1.5rem;">❤️</span>
            <h2 style="margin:0; font-size:1.1rem;">Détails de compatibilité</h2>
        </div>
        <span class="comp-logo">💉 Genlove</span>
        
        <div class="comp-section">
            <div class="comp-title">Santé : 80 %</div>
            <div class="comp-desc">Vous partagez une forte compatibilité physique et médicale.</div>
        </div>
        <div class="comp-section">
            <div class="comp-title">Génétique : 70 %</div>
            <div class="comp-desc">Votre combinaison génétique présente un bon niveau d'harmonie.</div>
        </div>
        <div class="comp-section">
            <div class="comp-title">Émotion : 90 %</div>
            <div class="comp-desc">Vos profils émotionnels s'accordent très fortement.</div>
        </div>
        
        <a href="#" onclick="alert('Demande de contact envoyée ! Identité révélée après acceptation.')" class="btn-contact">✉️ Contacter</a>
        <a href="/matching" style="display:block; text-align:center; margin-top:20px; color:#888; text-decoration:none;">🔒 Retour</a>
    </div></div></body></html>`);
});

app.listen(port, () => { console.log('Genlove V31 - Intégration Totale Réussie'); });
