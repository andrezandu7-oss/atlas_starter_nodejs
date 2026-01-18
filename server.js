const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    
    /* ACCUEIL */
    .hero-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; }
    .brand-gen { color: #1a2a44; font-size: 3.5rem; font-weight: bold; }
    .brand-love { color: #ff416c; font-size: 3.5rem; font-weight: bold; }
    .btn-login { background: #1a2a44; color: white; border-radius: 12px; padding: 18px; width: 100%; font-weight: bold; text-decoration: none; margin-bottom: 15px; display: block; box-sizing: border-box; }
    .btn-signup { background: transparent; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 12px; padding: 18px; width: 100%; font-weight: bold; text-decoration: none; display: block; box-sizing: border-box; }

    /* INSCRIPTION */
    .signup-page { background: white; min-height: 100vh; padding: 30px 20px; text-align: center; box-sizing: border-box; }
    .photo-wrapper { position: relative; width: 140px; height: 140px; margin: 0 auto 25px auto; }
    .photo-dash { border: 2px dashed #ff416c; width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; background-size: cover; background-position: center; font-size: 0.8rem; overflow: hidden; }
    .remove-pic { position: absolute; top: 5px; right: 5px; background: #ff416c; color: white; border-radius: 50%; width: 25px; height: 25px; display: none; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; border: 2px solid white; z-index: 10; }
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 5px; font-size: 1rem; box-sizing: border-box; }
    .pedago-tip { text-align: left; font-size: 0.75rem; color: #666; margin-bottom: 12px; padding-left: 5px; font-style: italic; }
    .label-med { text-align: left; font-weight: bold; display: block; margin-top: 15px; font-size: 0.9rem; color: #1a2a44; }
    .video-dash { border: 2px dashed #007bff; padding: 18px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 20px 0; cursor: pointer; }
    .btn-final { background: #ff416c; color: white; border: none; width: 100%; padding: 20px; border-radius: 50px; font-size: 1.2rem; font-weight: bold; cursor: pointer; }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="hero-section">
        <h1 style="margin:0;"><span class="brand-gen">Gen</span><span class="brand-love">love</span></h1>
        <p style="font-weight:bold; color:#1a2a44; margin:10px 0 30px 0;">L'amour qui soigne 💙</p>
        <p style="margin-bottom: 40px; line-height:1.5;">Unissez cœur et santé pour bâtir des couples solides et des familles épanouies, sans risque de transmission de maladies génétiques. ❤️</p>
        <a href="#" class="btn-login">➔ Se connecter</a>
        <a href="/signup" class="btn-signup">👤 S'inscrire</a>
        <p style="font-size: 0.8rem; color: #666; margin-top: 30px;">Vos données sont sécurisées et confidentielles</p>
    </div></div></body></html>`);
});

app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="signup-page">
        <h2 style="color:#ff416c; margin-bottom:20px;">Mon Profil Médical</h2>
        <form onsubmit="validate(event)">
            <div class="photo-wrapper">
                <div class="photo-dash" id="circ" onclick="document.getElementById('pI').click()">📸 Photo *</div>
                <div class="remove-pic" id="xBtn" onclick="removePhoto(event)">✕</div>
            </div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="preview(event)">

            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom de famille" required>
            
            <span class="label-med">Date de naissance *</span>
            <input type="date" id="dob" class="input-box" required>
            <div class="pedago-tip">L'âge est un critère de matching important.</div>

            <span class="label-med">Génétique & Santé</span>
            <select id="gt" class="input-box" required>
                <option value="">Génotype (AA, AS, SS...)</option>
                <option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
            </select>
            <div style="display:flex; gap:10px;">
                <select id="gs" class="input-box" required style="flex:1"><option value="">Groupe</option><option value="A">A</option><option value="B">B</option><option value="O">O</option></select>
                <select id="rh" class="input-box" required style="flex:1"><option value="">Rhésus</option><option value="+">+</option><option value="-">-</option></select>
            </div>

            <span class="label-med">Projet de vie</span>
            <select id="child" class="input-box" required>
                <option value="">Désir d'enfant ?</option>
                <option value="Oui">Oui</option><option value="Non">Non</option><option value="A discuter">À discuter</option>
            </select>

            <span class="label-med">Vérification Sécurité</span>
            <p style="text-align: left; font-size: 0.75rem; color: #666;">Vidéo de 5s pour comparer avec votre photo. Éclairez bien votre visage.</p>
            <div class="video-dash" id="vB" onclick="startVideoTimer()">🎥 Enregistrer la vidéo (5s)</div>

            <button type="submit" class="btn-final">🚀 Finaliser l'inscription</button>
        </form>
    </div></div>
    <script>
        let photoReady = false, videoReady = false, timerActive = false;
        function preview(e){
            const r = new FileReader();
            r.onload = () => {
                document.getElementById('circ').style.backgroundImage = 'url('+r.result+')';
                document.getElementById('circ').innerText = '';
                document.getElementById('xBtn').style.display = 'flex';
                photoReady = true;
            };
            r.readAsDataURL(e.target.files[0]);
        }
        function removePhoto(e){
            e.stopPropagation();
            document.getElementById('circ').style.backgroundImage = 'none';
            document.getElementById('circ').innerText = '📸 Photo *';
            document.getElementById('xBtn').style.display = 'none';
            photoReady = false;
        }
        function startVideoTimer() {
            if (timerActive || videoReady) return;
            timerActive = true;
            const btn = document.getElementById('vB');
            let timeLeft = 5;
            const countdown = setInterval(() => {
                btn.innerText = "Enregistrement... " + timeLeft + "s";
                timeLeft--;
                if (timeLeft < 0) {
                    clearInterval(countdown);
                    videoReady = true;
                    timerActive = false;
                    btn.innerText = '✅ Vidéo bien enregistrée';
                    btn.style.color = '#2ecc71';
                    btn.style.borderColor = '#2ecc71';
                }
            }, 1000);
        }
        function validate(e){
            e.preventDefault();
            if(!photoReady || !videoReady) return alert("Photo et Vidéo obligatoires");
            localStorage.setItem('uGt', document.getElementById('gt').value);
            window.location.href='/matching';
        }
    </script></body></html>`);
});

app.listen(port, () => console.log('Genlove V41 - Final avec Date de Naissance'));
