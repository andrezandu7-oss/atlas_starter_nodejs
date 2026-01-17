const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLES DIRECTEMENT INSPIRÉS DE TES IMAGES ---
const styles = `
<style>
    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; margin: 0; background: #fff; color: #000; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; position: relative; background: white; }

    /* STYLE INSCRIPTION (IMAGE 2) */
    .signup-container { padding: 40px 20px; text-align: center; }
    .signup-title { color: #ff416c; font-size: 1.8rem; margin-bottom: 30px; }
    .photo-dash { border: 2px dashed #ff416c; width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; background-size: cover; }
    .input-classic { width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 12px; margin-bottom: 15px; font-size: 1rem; box-sizing: border-box; }
    .video-dash { border: 2px dashed #007bff; border-radius: 12px; padding: 15px; color: #007bff; margin-bottom: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .btn-finaliser { background: #ff416c; color: white; border: none; width: 100%; padding: 18px; border-radius: 40px; font-size: 1.1rem; font-weight: bold; cursor: pointer; }

    /* STYLE COMPATIBILITÉ (IMAGE 1) */
    .comp-screen { padding: 40px 30px; text-align: left; }
    .comp-header { font-size: 1.4rem; font-weight: bold; margin-bottom: 25px; display: flex; align-items: flex-start; gap: 10px; }
    .brand-box { color: #007bff; font-size: 1.6rem; font-weight: bold; margin-bottom: 30px; display: flex; align-items: center; gap: 8px; }
    .domain-block { margin-bottom: 25px; }
    .domain-title { font-weight: bold; font-size: 1.1rem; margin-bottom: 4px; }
    .domain-text { font-size: 0.9rem; color: #333; line-height: 1.4; }
    .btn-contact-gray { background: #f2f2f2; color: #000; border: none; width: 100%; padding: 15px; border-radius: 8px; font-weight: bold; margin-top: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .btn-retour { background: none; border: none; width: 100%; padding: 15px; color: #000; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
</style>
`;

// --- ROUTE 1 : INSCRIPTION (REPRODUIT L'IMAGE 2) ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="signup-container">
        <h1 class="signup-title">Mon Profil Médical</h1>
        <form onsubmit="save(event)">
            <div class="photo-dash" id="circ" onclick="document.getElementById('pI').click()">📸 Photo *</div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="up(event)">
            
            <input type="text" id="fn" class="input-classic" placeholder="Prénom" required>
            <select id="gt" class="input-classic">
                <option value="AA">AA</option>
                <option value="AS">AS</option>
                <option value="SS">SS</option>
            </select>

            <div class="video-dash" id="vB" onclick="this.innerText='✅ Vidéo enregistrée'; this.style.color='#4caf50'; this.style.borderColor='#4caf50'; this.ok=true;">
                🎥 Vidéo de vérification *
            </div>

            <button type="submit" class="btn-finaliser">🚀 Finaliser</button>
        </form>
    </div></div>
    <script>
        function up(e){ const r=new FileReader(); r.onload=()=>{ localStorage.setItem('uImg',r.result); document.getElementById('circ').style.backgroundImage='url('+r.result+')'; document.getElementById('circ').innerText=''; }; r.readAsDataURL(e.target.files[0]); }
        function save(e){
            e.preventDefault();
            const d = { fn:document.getElementById('fn').value, gt:document.getElementById('gt').value };
            localStorage.setItem('uData', JSON.stringify(d));
            window.location.href='/matching';
        }
    </script></body></html>`);
});

// --- ROUTE 2 : COMPATIBILITÉ (REPRODUIT L'IMAGE 1) ---
app.get('/compatibility/:id', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="comp-screen">
        <div class="comp-header">
            <span style="color:#ff416c;">❤️</span>
            <span>Détails de compatibilité<br>par domaine</span>
        </div>
        
        <div class="brand-box">💉 Genlove</div>

        <div class="domain-block">
            <div class="domain-title">Santé : 80 %</div>
            <div class="domain-text">Vous partagez une forte compatibilité physique et médicale.</div>
        </div>

        <div class="domain-block">
            <div class="domain-title">Génétique : 70 %</div>
            <div class="domain-text">Votre combinaison génétique présente un bon niveau d'harmonie.</div>
        </div>

        <div class="domain-block">
            <div class="domain-title">Émotion : 90 %</div>
            <div class="domain-text">Vos profils émotionnels s'accordent très fortement.</div>
        </div>

        <div class="domain-block">
            <div class="domain-title">Projet de vie : 65 %</div>
            <div class="domain-text">Vos objectifs sont similaires, mais certains points restent à découvrir.</div>
        </div>

        <button class="btn-contact-gray" onclick="alert('Demande de contact envoyée !')">✉️ Contacter</button>
        <a href="/matching" class="btn-retour">🔒 Retour</a>
    </div></div></body></html>`);
});

// Redirection par défaut vers l'inscription pour tester
app.get('/', (req, res) => res.redirect('/signup'));

app.listen(port, () => { console.log('Genlove V32 - Fidélité visuelle totale'); });
