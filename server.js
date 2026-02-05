const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const htmlApp = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <title>Genlove - Pacte Intégral</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .app-shell { width: 100%; max-width: 420px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .screen-layer { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; }
        .screen-layer.active { display: flex; z-index: 10; }
        
        #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s; z-index: 9999; }
        #genlove-notify.show { top: 20px; }

        .logo-text { font-size: 3.5rem; font-weight: bold; text-align: center; padding: 20px 0; }
        .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
        .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
        
        .serment-container { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 10px; align-items: flex-start; }
        .serment-text { font-size: 0.82rem; color: #d63384; line-height: 1.4; }

        .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
        .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; margin: 15px; border: none; cursor: pointer; }
        
        .st-group { background: white; border-radius: 15px; margin: 0 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }
    </style>
</head>
<body>
    <div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>

        <div id="scr-home" class="screen-layer active" style="background:#f4e9da; justify-content:center; align-items:center; text-align:center; padding:30px;">
            <div class="logo-text"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            <p><b>Unissez cœur et santé pour bâtir des couples sains</b></p>
            <button class="btn-dark" style="width:200px" onclick="checkAuth()">➔ Se connecter</button>
            <button onclick="showScreen('scr-signup')" style="background:none; border:none; color:#1a2a44; font-weight:bold; cursor:pointer; margin-top:15px;">👤 Créer un compte</button>
        </div>

        <div id="scr-signup" class="screen-layer">
            <div style="padding: 25px; text-align: center;">
                <h2 id="form-title" style="color:#ff416c; margin-top:0;">Configuration Santé</h2>
                <form onsubmit="saveProfile(event)">
                    <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
                    <input type="file" id="i" style="display:none" onchange="previewPhoto(event)">
                    <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                    <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                    <select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select>
                    <input type="date" id="dob" class="input-box" required>
                    <input type="text" id="res" class="input-box" placeholder="Résidence actuelle" required>
                    <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                    <div style="display:flex; gap:10px;">
                        <select id="gs_type" class="input-box" style="flex:2;" required><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
                        <select id="gs_rh" class="input-box" style="flex:1;" required><option>+</option><option>-</option></select>
                    </div>
                    <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
                    
                    <div class="serment-container">
                        <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                        <label for="oath" class="serment-text">Je confirme sur l'honneur que les informations saisies sont sincères et conformes à mes résultats médicaux.</label>
                    </div>

                    <button type="submit" id="btn-submit" class="btn-pink">🚀 Valider mon profil</button>
                </form>
            </div>
        </div>

        <div id="scr-profile" class="screen-layer" style="background:#f8f9fa;">
            <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px;">
                <div style="display:flex; justify-content:space-between;">
                    <button onclick="showScreen('scr-home')" style="border:none; background:#eff6ff; padding:8px 14px; border-radius:12px; font-weight:bold;">🏠</button>
                    <span onclick="showScreen('scr-settings')" style="font-size:1.4rem; cursor:pointer;">⚙️</span>
                </div>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-position:center;"></div>
                <h2 id="vN">Utilisateur</h2>
                <p id="vR" style="color:#666;">📍 Localisation</p>
            </div>
            <div style="padding:15px 20px 5px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG">...</b></div>
                <div class="st-item"><span>Groupe Sanguin</span><b id="rS">...</b></div>
                <div class="st-item"><span>Projet de vie</span><b id="rP">...</b></div>
            </div>
            <button class="btn-dark" onclick="showNotify('Recherche en cours...')">🔍 Trouver un partenaire</button>
        </div>

        <div id="scr-settings" class="screen-layer" style="background:#f4f7f6;">
            <div style="padding:25px; background:white; text-align:center;">
                <div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            </div>
            <div style="padding:15px 20px 5px; font-size:0.75rem; color:#888; font-weight:bold;">COMPTE</div>
            <div class="st-group">
                <div onclick="openEditMode()" style="cursor:pointer;" class="st-item"><span>Modifier mon profil</span><b>Modifier ➔</b></div>
                <div onclick="if(confirm('Supprimer ?')){localStorage.clear();location.reload();}" style="cursor:pointer; color:red;" class="st-item"><span>Supprimer mon compte</span><b>🗑️</b></div>
            </div>
            <button class="btn-pink" onclick="showScreen('scr-profile')">Retour</button>
        </div>
    </div>

    <script>
        function showScreen(id) {
            document.querySelectorAll('.screen-layer').forEach(s => s.style.display = 'none');
            document.getElementById(id).style.display = 'flex';
        }

        function checkAuth() {
            if(localStorage.getItem('u_fn')) showScreen('scr-profile');
            else showNotify("Créez d'abord un compte.");
        }

        let photoB64 = localStorage.getItem('u_p') || "";
        function previewPhoto(e){ 
            const r=new FileReader(); 
            r.onload=()=>{ photoB64=r.result; document.getElementById('c').style.backgroundImage='url('+photoB64+')'; document.getElementById('t').style.display='none'; }; 
            r.readAsDataURL(e.target.files[0]); 
        }

        function openEditMode() {
            document.getElementById('form-title').innerText = "Mise à jour Santé";
            document.getElementById('fn').value = localStorage.getItem('u_fn') || "";
            document.getElementById('ln').value = localStorage.getItem('u_ln') || "";
            document.getElementById('res').value = localStorage.getItem('u_res') || "";
            document.getElementById('gt').value = localStorage.getItem('u_gt') || "";
            document.getElementById('pj').value = localStorage.getItem('u_pj') || "";
            document.getElementById('oath').checked = false; // Forcer à re-confirmer pour chaque modification
            showScreen('scr-signup');
        }

        function saveProfile(e){
            e.preventDefault();
            localStorage.setItem('u_p', photoB64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
            
            updateUI();
            showNotify("Profil mis à jour !");
            showScreen('scr-profile');
        }

        function updateUI(){
            document.getElementById('vP').style.backgroundImage = 'url('+(localStorage.getItem('u_p') || '')+')';
            document.getElementById('vN').innerText = localStorage.getItem('u_fn') + " " + localStorage.getItem('u_ln');
            document.getElementById('vR').innerText = "📍 " + localStorage.getItem('u_res');
            document.getElementById('rG').innerText = localStorage.getItem('u_gt');
            document.getElementById('rS').innerText = localStorage.getItem('u_gs');
            document.getElementById('rP').innerText = "Enfant : " + localStorage.getItem('u_pj');
        }

        function showNotify(m) {
            const n = document.getElementById('genlove-notify');
            document.getElementById('notify-msg').innerText = m;
            n.classList.add('show');
            setTimeout(() => n.classList.remove('show'), 3000);
        }

        window.onload = () => { if(localStorage.getItem('u_fn')) updateUI(); };
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(htmlApp));
app.listen(port, '0.0.0.0', () => console.log('Genlove Online'));
