const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    
    /* ACCUEIL PREMIUM */
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
    
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 8px; font-size: 1rem; box-sizing: border-box; }
    .pedago-tip { text-align: left; font-size: 0.75rem; color: #666; margin-top: 4px; margin-bottom: 12px; font-style: italic; }
    .label-med { text-align: left; font-weight: bold; display: block; margin-top: 15px; font-size: 0.9rem; color: #1a2a44; }
    
    /* CAMERA RECTO-VERSO */
    #video-container { display: none; margin: 15px 0; position: relative; background: #000; border-radius: 15px; overflow: hidden; height: 300px; border: 3px solid #1a2a44; }
    video { width: 100%; height: 100%; object-fit: cover; }
    .video-controls { position: absolute; bottom: 15px; left: 0; right: 0; display: flex; justify-content: space-around; align-items: center; }
    .btn-rec-trigger { width: 60px; height: 60px; background: white; border-radius: 50%; border: 5px solid #ff416c; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-rec-trigger.active { background: #ff416c; animation: pulse 1s infinite; }
    .btn-switch { background: rgba(0,0,0,0.5); color: white; border: none; padding: 10px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; }
    .timer-overlay { position: absolute; top: 15px; right: 15px; background: rgba(255, 65, 108, 0.9); color: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; display: none; }
    
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

    .video-dash { border: 2px dashed #007bff; padding: 18px; border-radius: 12px; color: #007bff; font-weight: bold; margin: 20px 0; cursor: pointer; }
    .btn-final { background: #ff416c; color: white; border: none; width: 100%; padding: 20px; border-radius: 50px; font-size: 1.2rem; font-weight: bold; cursor: pointer; margin-top: 10px; }
</style>
`;

// ROUTE ACCUEIL
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="hero-section">
        <h1 style="margin:0;"><span class="brand-gen">Gen</span><span class="brand-love">love</span></h1>
        <p style="font-weight:bold; color:#1a2a44; margin:10px 0 30px 0;">L'amour qui soigne 💙</p>
        <p style="margin-bottom: 40px; line-height:1.5;">Unissez cœur et santé pour bâtir des familles épanouies, sans risque de transmission de maladies génétiques. ❤️</p>
        <a href="#" class="btn-login">➔ Se connecter</a>
        <a href="/signup" class="btn-signup">👤 S'inscrire</a>
    </div></div></body></html>`);
});

// ROUTE INSCRIPTION
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body><div class="app-shell"><div class="signup-page">
        <h2 style="color:#ff416c;">Profil Médical</h2>
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
            <div class="pedago-tip">L'âge est un critère de matching important.</div>

            <span class="label-med">Données Médicales</span>
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

            <span class="label-med">Identité Numérique</span>
            <p style="text-align: left; font-size: 0.7rem; color: #666;">Distance : 1 mètre. Appuyez sur le bouton blanc pour lancer les 5s.</p>

            <div id="video-container">
                <video id="webcam" autoplay muted playsinline></video>
                <div class="timer-overlay" id="vTimer">05s</div>
                <div class="video-controls">
                    <button type="button" class="btn-switch" onclick="switchCam()">🔄</button>
                    <div class="btn-rec-trigger" id="recBtn" onclick="startCountdown()">
                        <div style="width:20px; height:20px; background:#ff416c; border-radius:50%;"></div>
                    </div>
                    <div style="width:40px;"></div>
                </div>
            </div>

            <div class="video-dash" id="vB" onclick="openCam()">🎥 Ouvrir la caméra de vérification</div>

            <button type="submit" class="btn-final">🚀 Finaliser l'inscription</button>
        </form>
    </div></div>
    <script>
        let photoReady = false, videoReady = false, isRecording = false;
        let camStream = null, currentFacingMode = "user";

        function handlePhoto(e){
            const reader = new FileReader();
            reader.onload = () => {
                document.getElementById('circ').style.backgroundImage = 'url('+reader.result+')';
                document.getElementById('circ').innerText = '';
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

        async function openCam() {
            if (videoReady) return;
            try {
                if(camStream) camStream.getTracks().forEach(t => t.stop());
                camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } });
                document.getElementById('webcam').srcObject = camStream;
                document.getElementById('video-container').style.display = 'block';
                document.getElementById('vB').style.display = 'none';
            } catch (err) { alert("Accès caméra refusé."); }
        }

        async function switchCam() {
            currentFacingMode = (currentFacingMode === "user") ? "environment" : "user";
            openCam();
        }

        function startCountdown() {
            if (isRecording || videoReady) return;
            isRecording = true;
            document.getElementById('recBtn').classList.add('active');
            document.getElementById('vTimer').style.display = 'block';
            let timeLeft = 5;
            const timerDisplay = document.getElementById('vTimer');
            const interval = setInterval(() => {
                timeLeft--;
                timerDisplay.innerText = "0" + timeLeft + "s";
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    stopEverything();
                }
            }, 1000);
        }

        function stopEverything() {
            if (camStream) camStream.getTracks().forEach(t => t.stop());
            document.getElementById('video-container').style.display = 'none';
            const btn = document.getElementById('vB');
            btn.style.display = 'block';
            btn.innerText = '✅ Vérification validée';
            btn.style.color = '#2ecc71';
            btn.style.borderColor = '#2ecc71';
            videoReady = true;
            isRecording = false;
        }

        function validateForm(e){
            e.preventDefault();
            if(!photoReady || !videoReady) return alert("Photo et Vidéo de 5s requises.");
            localStorage.setItem('userGt', document.getElementById('gt').value);
            window.location.href = '/matching';
        }
    </script></body></html>`);
});

// ROUTE MATCHING
app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#fff;"><div class="app-shell" style="padding:20px;">
        <h3>Partenaires Compatibles</h3>
        <div id="results"></div>
    </div>
    <script>
        const myGt = localStorage.getItem('userGt');
        const db = [{name:"Sonia", gt:"AA", img:"https://randomuser.me/api/portraits/women/44.jpg"}, {name:"Marc", gt:"AS", img:"https://randomuser.me/api/portraits/men/32.jpg"}, {name:"Leila", gt:"SS", img:"https://randomuser.me/api/portraits/women/12.jpg"}];
        const container = document.getElementById('results');
        db.forEach(p => {
            if(myGt === "SS" && p.gt === "SS") return;
            container.innerHTML += '<div class="match-card"><div class="blur-img" style="background-image:url('+p.img+')"></div><div><b>'+p.name[0]+'***</b><br>Génotype: '+p.gt+'</div></div>';
        });
    </script></body></html>`);
});

app.listen(port, () => console.log('Genlove V44.1 - Débuggé et Complet'));
