const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    
    /* --- ACCUEIL DESIGN PREMIUM --- */
    .hero-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; }
    .brand-gen { color: #1a2a44; font-size: 3.5rem; font-weight: bold; }
    .brand-love { color: #ff416c; font-size: 3.5rem; font-weight: bold; }
    .btn-login { background: #1a2a44; color: white; border-radius: 12px; padding: 18px; width: 100%; font-weight: bold; text-decoration: none; margin-bottom: 15px; display: block; box-sizing: border-box; }
    .btn-signup { background: transparent; color: #1a2a44; border: 1.5px solid #1a2a44; border-radius: 12px; padding: 18px; width: 100%; font-weight: bold; text-decoration: none; display: block; box-sizing: border-box; }
    .footer-note { font-size: 0.8rem; color: #666; margin-top: 30px; }

    /* --- INSCRIPTION & SÉCURITÉ --- */
    .signup-page { background: white; min-height: 100vh; padding: 30px 20px; text-align: center; box-sizing: border-box; }
    .photo-wrapper { position: relative; width: 140px; height: 140px; margin: 0 auto 25px auto; }
    .photo-dash { border: 2px dashed #ff416c; width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff416c; cursor: pointer; background-size: cover; background-position: center; font-size: 0.8rem; overflow: hidden; }
    .remove-pic { position: absolute; top: 5px; right: 5px; background: #ff416c; color: white; border-radius: 50%; width: 25px; height: 25px; display: none; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; border: 2px solid white; z-index: 10; }
    
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 8px; font-size: 1rem; box-sizing: border-box; }
    .label-med { text-align: left; font-weight: bold; display: block; margin-top: 15px; font-size: 0.9rem; color: #1a2a44; }
    
    /* CAMÉRA RÉELLE */
    #video-container { display: none; margin: 15px 0; position: relative; background: #000; border-radius: 12px; overflow: hidden; height: 240px; border: 3px solid #007bff; }
    video { width: 100%; height: 100%; object-fit: cover; }
    .video-overlay { position: absolute; top: 10px; left: 10px; background: rgba(255, 65, 108, 0.9); color: white; padding: 5px 12px; border-radius: 5px; font-size: 0.9rem; font-weight: bold; }
    .video-dash { border: 2px dashed #007bff; padding: 18px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 20px 0; cursor: pointer; }
    
    .btn-final { background: #ff416c; color: white; border: none; width: 100%; padding: 20px; border-radius: 50px; font-size: 1.2rem; font-weight: bold; cursor: pointer; margin-top: 10px; }

    /* MATCHING FLOU */
    .match-card { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #eee; border-radius: 15px; margin-bottom: 15px; }
    .blur-img { width: 70px; height: 70px; border-radius: 50%; filter: blur(10px); background-size: cover; background-position: center; border: 2px solid #ff416c; }
</style>
`;

// --- ROUTE : ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="hero-section">
        <h1 style="margin:0;"><span class="brand-gen">Gen</span><span class="brand-love">love</span></h1>
        <p style="font-weight:bold; color:#1a2a44; margin:10px 0 30px 0;">L'amour qui soigne 💙</p>
        <p style="margin-bottom: 40px; line-height:1.5; color:#1a2a44;">Unissez cœur et santé pour bâtir des couples solides et des familles épanouies, sans risque de transmission de maladies génétiques. ❤️</p>
        <a href="#" class="btn-login">➔ Se connecter</a>
        <a href="/signup" class="btn-signup">👤 S'inscrire</a>
        <p class="footer-note">Vos données sont sécurisées et confidentielles</p>
    </div></div></body></html>`);
});

// --- ROUTE : INSCRIPTION ---
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="signup-page">
        <h2 style="color:#ff416c;">Mon Profil Médical</h2>
        <form onsubmit="validateForm(event)">
            <div class="photo-wrapper">
                <div class="photo-dash" id="circ" onclick="document.getElementById('pI').click()">📸 Photo de profil *</div>
                <div class="remove-pic" id="xBtn" onclick="removePhoto(event)">✕</div>
            </div>
            <input type="file" id="pI" accept="image/*" style="display:none" onchange="handlePhoto(event)">

            <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
            <input type="text" id="ln" class="input-box" placeholder="Nom de famille" required>
            
            <span class="label-med">Date de naissance *</span>
            <input type="date" id="dob" class="input-box" required>

            <span class="label-med">Informations de Santé</span>
            <select id="gt" class="input-box" required>
                <option value="">Sélectionner Génotype</option>
                <option value="AA">AA</option><option value="AS">AS</option><option value="SS">SS</option>
            </select>
            <div style="display:flex; gap:10px;">
                <select id="gs" class="input-box" required style="flex:1"><option value="">Groupe</option><option value="A">A</option><option value="B">B</option><option value="O">O</option></select>
                <select id="rh" class="input-box" required style="flex:1"><option value="">Rhésus</option><option value="+">+</option><option value="-">-</option></select>
            </div>

            <span class="label-med">Projet de vie</span>
            <select id="child" class="input-box" required>
                <option value="">Désir d'enfant ?</option>
                <option value="Oui">Oui</option><option value="Non">Non</option>
            </select>

            <span class="label-med">Vérification Identity Check</span>
            <p style="text-align: left; font-size: 0.75rem; color: #666; margin-bottom:10px;">
                Placez-vous à environ <b>1 mètre</b> du téléphone.
            </p>

            <div id="video-container">
                <video id="webcam" autoplay muted playsinline></video>
                <div class="video-overlay" id="vTimer">REC: 5s</div>
            </div>

            <div class="video-dash" id="vB" onclick="initCamera()">🎥 Enregistrer la vidéo (5s)</div>

            <button type="submit" class="btn-final">🚀 Finaliser l'inscription</button>
        </form>
    </div></div>
    <script>
        let photoReady = false, videoReady = false, timerActive = false, camStream = null;

        function handlePhoto(e){
            const reader = new FileReader();
            reader.onload = () => {
                const circ = document.getElementById('circ');
                circ.style.backgroundImage = 'url('+reader.result+')';
                circ.innerText = '';
                document.getElementById('xBtn').style.display = 'flex';
                photoReady = true;
            };
            reader.readAsDataURL(e.target.files[0]);
        }

        function removePhoto(e){
            e.stopPropagation();
            document.getElementById('circ').style.backgroundImage = 'none';
            document.getElementById('circ').innerText = '📸 Photo de profil *';
            document.getElementById('xBtn').style.display = 'none';
            photoReady = false;
        }

        async function initCamera() {
            if (timerActive || videoReady) return;
            try {
                camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
                const videoEl = document.getElementById('webcam');
                videoEl.srcObject = camStream;
                document.getElementById('video-container').style.display = 'block';
                document.getElementById('vB').style.display = 'none';
                startCountdown();
            } catch (err) {
                alert("Erreur caméra : Veuillez autoriser l'accès.");
            }
        }

        function startCountdown() {
            timerActive = true;
            let count = 5;
            const timerDisplay = document.getElementById('vTimer');
            const interval = setInterval(() => {
                timerDisplay.innerText = "REC: " + count + "s";
                count--;
                if (count < 0) {
                    clearInterval(interval);
                    finishRecording();
                }
            }, 1000);
        }

        function finishRecording() {
            if (camStream) camStream.getTracks().forEach(t => t.stop());
            document.getElementById('video-container').style.display = 'none';
            const btn = document.getElementById('vB');
            btn.style.display = 'block';
            btn.innerText = '✅ Vidéo bien enregistrée';
            btn.style.color = '#2ecc71';
            btn.style.borderColor = '#2ecc71';
            videoReady = true;
            timerActive = false;
        }

        function validateForm(e){
            e.preventDefault();
            if(!photoReady) return alert("Photo de profil obligatoire.");
            if(!videoReady) return alert("Veuillez effectuer la vidéo de vérification.");
            
            const genotype = document.getElementById('gt').value;
            localStorage.setItem('userGt', genotype);
            window.location.href = '/matching';
        }
    </script></body></html>`);
});

// --- ROUTE : MATCHING (RÈGLE SS INCLUSE) ---
app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#fff;"><div class="app-shell" style="padding:20px;">
        <h3 style="color:#1a2a44;">Partenaires Compatibles</h3>
        <div id="results"></div>
    </div>
    <script>
        const myGt = localStorage.getItem('userGt');
        const database = [
            { name: "Sonia", gt: "AA", img: "https://randomuser.me/api/portraits/women/44.jpg" },
            { name: "Marc", gt: "AS", img: "https://randomuser.me/api/portraits/men/32.jpg" },
            { name: "Leila", gt: "SS", img: "https://randomuser.me/api/portraits/women/12.jpg" }
        ];
        
        const container = document.getElementById('results');
        database.forEach(p => {
            // RÈGLE D'OR : BLOQUER SS SI JE SUIS SS
            if(myGt === "SS" && p.gt === "SS") return;

            container.innerHTML += \`
                <div class="match-card">
                    <div class="blur-img" style="background-image:url('\${p.img}')"></div>
                    <div>
                        <b style="font-size:1.1rem;">\${p.name[0]}***</b><br>
                        <span style="color:#ff416c; font-weight:bold;">Génotype : \${p.gt}</span>
                    </div>
                </div>
            \`;
        });
    </script></body></html>`);
});

app.listen(port, () => console.log('Genlove V42 FINAL opérationnel !'));
