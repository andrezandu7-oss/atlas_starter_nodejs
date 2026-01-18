const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; }
    
    /* STYLE ACCUEIL */
    .hero-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; }
    .brand-gen { color: #1a2a44; font-size: 3.5rem; font-weight: bold; }
    .brand-love { color: #ff416c; font-size: 3.5rem; font-weight: bold; }
    .btn-login { background: #1a2a44; color: white; border-radius: 12px; padding: 18px; width: 100%; font-weight: bold; text-decoration: none; margin-bottom: 15px; display: block; box-sizing: border-box; }
    .btn-signup { background: transparent; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 12px; padding: 18px; width: 100%; font-weight: bold; text-decoration: none; display: block; box-sizing: border-box; }

    /* STYLE INSCRIPTION OBLIGATOIRE */
    .signup-page { background: white; min-height: 100vh; padding: 30px 20px; text-align: center; box-sizing: border-box; }
    .photo-dash { border: 2px dashed #ff416c; width: 130px; height: 130px; border-radius: 50%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; background-size: cover; font-size: 0.8rem; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 12px; margin-bottom: 12px; font-size: 1rem; box-sizing: border-box; }
    .label-med { text-align: left; font-weight: bold; display: block; margin: 10px 0 5px 0; font-size: 0.85rem; color: #1a2a44; }
    .video-dash { border: 2px dashed #007bff; padding: 15px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 15px 0; cursor: pointer; }
    .btn-final { background: #ff416c; color: white; border: none; width: 100%; padding: 20px; border-radius: 50px; font-size: 1.2rem; font-weight: bold; cursor: pointer; margin-top: 10px; }
</style>
`;

// --- ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="hero-section">
        <h1 style="margin:0;"><span class="brand-gen">Gen</span><span class="brand-love">love</span></h1>
        <p style="font-weight:bold; color:#1a2a44; margin:10px 0 30px 0;">L'amour qui soigne 💙</p>
        <p style="margin-bottom: 40px;">Unissez cœur et santé pour bâtir des couples solides et des familles épanouies. ❤️</p>
        <a href="/login" class="btn-login">➔ Se connecter</a>
        <a href="/signup" class="btn-signup">👤 S'inscrire</a>
        <p style="font-size: 0.8rem; color: #666; margin-top: 30px;">Vos données sont sécurisées et confidentielles</p>
    </div></div></body></html>`);
});

// --- INSCRIPTION AVEC VÉRIFICATION STRICTE ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="signup-page">
        <h2 style="color:#ff416c;">Mon Profil Médical</h2>
        <form id="regForm" onsubmit="validateAndSave(event)">
            <div class="photo-dash" id="circ" onclick="document.getElementById('pI').click()">📸 Photo Obligatoire *</div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="up(event)">
            
            <input type="text" id="fn" class="input-box" placeholder="Prénom *" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom de famille *" required>
            
            <span class="label-med">Date de naissance *</span>
            <input type="date" id="dob" class="input-box" required>

            <span class="label-med">Informations Médicales Obligatoires *</span>
            <select id="gt" class="input-box" required>
                <option value="">Sélectionner Génotype</option>
                <option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
            </select>
            
            <div style="display:flex; gap:10px;">
                <select id="gs" class="input-box" required>
                    <option value="">Groupe</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                </select>
                <select id="rh" class="input-box" required>
                    <option value="">Rhésus</option><option value="+">+</option><option value="-">-</option>
                </select>
            </div>

            <textarea id="pj" class="input-box" style="height:70px" placeholder="Votre projet de vie..."></textarea>

            <div class="video-dash" id="vB" onclick="markVideoReady()">🎥 Vidéo de vérification *</div>

            <button type="submit" class="btn-final">🚀 Finaliser l'inscription</button>
        </form>
    </div></div>
    <script>
        let photoReady = false;
        let videoReady = false;

        function up(e){ 
            const r=new FileReader(); 
            r.onload=()=>{ 
                localStorage.setItem('uImg', r.result); 
                document.getElementById('circ').style.backgroundImage='url('+r.result+')'; 
                document.getElementById('circ').innerText=''; 
                photoReady = true;
            }; 
            r.readAsDataURL(e.target.files[0]); 
        }

        function markVideoReady() {
            videoReady = true;
            const b = document.getElementById('vB');
            b.innerText = '✅ Vidéo enregistrée';
            b.style.color = '#4caf50';
            b.style.borderColor = '#4caf50';
        }

        function validateAndSave(e){
            e.preventDefault();
            if(!photoReady) { alert("Veuillez ajouter une photo de profil."); return; }
            if(!videoReady) { alert("La vidéo de vérification est obligatoire."); return; }
            
            const data = {
                fn: document.getElementById('fn').value,
                ln: document.getElementById('ln').value,
                gt: document.getElementById('gt').value,
                gs: document.getElementById('gs').value,
                rh: document.getElementById('rh').value
            };
            localStorage.setItem('uData', JSON.stringify(data));
            window.location.href='/matching';
        }
    </script></body></html>`);
});

app.listen(port, () => { console.log('Genlove V37 - Sécurité et Champs Obligatoires'); });
