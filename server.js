const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fff; display: flex; justify-content: center; color: #333; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: white; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    
    /* ACCUEIL PREMIUM COMPLÉTÉ */
    .welcome-screen { background: #f4e9da; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; }
    .btn-dark { background: #1a2a44; color: white; border-radius: 12px; text-decoration: none; width: 100%; padding: 18px; font-weight: bold; margin-bottom: 15px; display: block; }

    /* INSCRIPTION COMPLÈTE (IMAGES 2, 3, 4) */
    .signup-content { padding: 30px 20px; text-align: center; }
    .signup-title { color: #ff416c; font-size: 1.8rem; font-weight: bold; margin-bottom: 25px; }
    .photo-circle-dash { border: 2px dashed #ff416c; height: 140px; width: 140px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; margin: 0 auto 20px auto; background-size: cover; }
    .input-field { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 12px; box-sizing: border-box; font-size: 0.95rem; }
    .section-label { text-align: left; font-size: 0.85rem; font-weight: bold; color: #1a2a44; margin: 10px 0 5px 0; display: block; }
    .row { display: flex; gap: 10px; }
    
    .video-btn-dash { border: 2px dashed #007bff; padding: 12px; border-radius: 10px; color: #007bff; font-weight: bold; margin: 15px 0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-finaliser { background: #ff416c; color: white; border: none; width: 100%; padding: 18px; border-radius: 50px; font-weight: bold; font-size: 1.1rem; cursor: pointer; }

    /* COMPATIBILITÉ (IMAGE 1) */
    .comp-screen { padding: 30px 25px; text-align: left; }
    .comp-brand { color: #007bff; font-weight: bold; font-size: 1.4rem; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .comp-item { margin-bottom: 18px; }
    .comp-label { font-weight: bold; font-size: 1rem; }
    .comp-text { font-size: 0.85rem; color: #555; line-height: 1.3; }
</style>
`;

// --- ROUTE 1 : ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="welcome-screen">
        <h1 style="font-size:3rem; color:#1a2a44; margin:0;">Gen<span style="color:#ff416c;">love</span></h1>
        <p style="font-weight:bold; color:#1a2a44;">L'amour qui soigne 💙</p>
        <p style="margin-bottom: 40px; line-height:1.5;">⭐ <b>Bienvenue sur Genlove !</b><br><br>Unissez cœur et santé pour bâtir des couples solides et des familles épanouies, sans risque de transmission de maladies génétiques. ❤️</p>
        <a href="/signup" class="btn-dark">👤 Créer mon profil médical</a>
    </div></div></body></html>`);
});

// --- ROUTE 2 : INSCRIPTION COMPLÈTE ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="signup-content">
        <h1 class="signup-title">Mon Profil Médical</h1>
        <form onsubmit="save(event)">
            <div class="photo-circle-dash" id="circ" onclick="document.getElementById('pI').click()">📸 Photo *</div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="up(event)">
            
            <input type="text" id="fn" class="input-field" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-field" placeholder="Nom" required>
            
            <span class="section-label">Date de naissance</span>
            <input type="date" id="dob" class="input-field" required>

            <span class="section-label">Informations Médicales</span>
            <select id="gt" class="input-field"><option value="">Génotype (AA, AS, SS...)</option><option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option></select>
            
            <div class="row">
                <select id="gs" class="input-field"><option value="">Groupe Sanguin</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select>
                <select id="rh" class="input-field"><option value="">Rhésus</option><option value="+">+</option><option value="-">-</option></select>
            </div>

            <span class="section-label">Mon Projet de Vie</span>
            <textarea id="pj" class="input-field" style="height:80px;" placeholder="Décrivez vos aspirations..."></textarea>

            <div class="video-btn-dash" id="vB" onclick="this.innerText='✅ Vidéo OK'; this.style.color='#4caf50'; this.ok=true;">🎥 Vidéo de vérification *</div>

            <button type="submit" class="btn-finaliser">🚀 Finaliser</button>
        </form>
    </div></div>
    <script>
        function up(e){ const r=new FileReader(); r.onload=()=>{ localStorage.setItem('uImg',r.result); document.getElementById('circ').style.backgroundImage='url('+r.result+')'; document.getElementById('circ').innerText=''; }; r.readAsDataURL(e.target.files[0]); }
        function save(e){
            e.preventDefault();
            const d = { fn:document.getElementById('fn').value, gt:document.getElementById('gt').value, dob:document.getElementById('dob').value };
            localStorage.setItem('uData', JSON.stringify(d));
            window.location.href='/matching';
        }
    </script></body></html>`);
});

// --- ROUTES MATCHING ET COMPATIBILITÉ (V33 REPRISES) ---
app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div style="padding:20px; border-bottom:1px solid #eee;"><h3>Recherche Compatible</h3></div><div style="padding:15px;" id="list"></div></div>
    <script>
        const myGt = JSON.parse(localStorage.getItem('uData')).gt;
        const partners = [{ id: 1, name: "Sonia", gt: "AA", img: "https://randomuser.me/api/portraits/women/65.jpg" }, { id: 2, name: "Marc", gt: "AS", img: "https://randomuser.me/api/portraits/men/43.jpg" }, { id: 3, name: "Leila", gt: "SS", img: "https://randomuser.me/api/portraits/women/22.jpg" }];
        const listDiv = document.getElementById('list');
        partners.forEach(p => {
            if(myGt === "SS" && p.gt === "SS") return; // BLOCAGE SS AUTOMATIQUE
            listDiv.innerHTML += \`<a href="/compatibility/\${p.id}" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:15px; padding:15px; border:1px solid #eee; border-radius:15px; margin-bottom:15px;"><div style="width:60px; height:60px; border-radius:50%; filter:blur(10px); background-size:cover; background-image:url('\${p.img}')"></div><div style="flex:1;"><b>\${p.name[0]}****</b><br><span style="color:#ff416c; font-size:0.8rem;">Gén. \${p.gt}</span></div><span>➔</span></a>\`;
        });
    </script></body></html>`);
});

app.get('/compatibility/:id', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="comp-screen"><div class="comp-brand">💉 Genlove</div>
        <div class="comp-item"><div class="comp-label">Santé : 80 %</div><div class="comp-text">Vous partagez une forte compatibilité physique et médicale.</div></div>
        <div class="comp-item"><div class="comp-label">Génétique : 70 %</div><div class="comp-text">Votre combinaison génétique présente un bon niveau d'harmonie.</div></div>
        <div class="comp-item"><div class="comp-label">Émotion : 90 %</div><div class="comp-text">Vos profils émotionnels s'accordent très fortement.</div></div>
        <div class="comp-item"><div class="comp-label">Projet de vie : 65 %</div><div class="comp-text">Vos objectifs sont similaires, mais certains points restent à découvrir.</div></div>
        <button onclick="alert('Demande envoyée !')" style="background:#f8f9fa; border:1px solid #eee; width:100%; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer;">✉️ Contacter</button>
        <a href="/matching" style="display:block; text-align:center; margin-top:20px; color:#333; text-decoration:none; font-weight:bold;">🔒 Retour</a>
    </div></div></body></html>`);
});

app.listen(port, () => { console.log('Genlove V34 - Formulaire exhaustif et Accueil complet'); });
