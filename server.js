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
    <title>Genlove</title>
    <style>
        body { font-family: 'Segoe UI', Roboto, sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
        .app-shell { width: 100%; max-width: 420px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .screen-layer { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; }
        .screen-layer.active { display: flex; z-index: 10; }
        
        /* Accueil Style Image */
        .home-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 30px; text-align: center; background: #f4e9da; }
        .main-logo { font-size: 4rem; font-weight: 800; letter-spacing: -2px; margin-bottom: 10px; }
        .tagline { color: #1a2a44; font-size: 1.1rem; line-height: 1.4; margin-bottom: 50px; font-weight: 500; }
        .home-prompt { font-size: 0.95rem; color: #4a5568; margin-bottom: 15px; }
        
        /* Phrase de réassurance scellée */
        .trust-footer { position: absolute; bottom: 30px; left: 20px; right: 20px; font-size: 0.8rem; color: #8a7b6a; line-height: 1.4; display: flex; align-items: center; justify-content: center; gap: 5px; }

        #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; transition: 0.5s; z-index: 9999; }
        #genlove-notify.show { top: 20px; }
        
        .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; width: 85%; margin: 20px auto; border: none; cursor: pointer; font-size: 1rem; }
        .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 15px; text-align: center; font-weight: bold; width: 100%; max-width: 280px; border: none; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; }
        
        /* Formulaire */
        .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
        .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
        .label-small { display: block; text-align: left; font-size: 0.75rem; color: #718096; margin: 8px 0 0 5px; font-weight: bold; }
        .serment-box { margin-top: 20px; padding: 15px; background: #fff5f7; border-radius: 12px; border: 1px solid #ffdae0; text-align: left; display: flex; gap: 12px; }
        .serment-text { font-size: 0.85rem; color: #d63384; font-weight: 500; }

        /* Profil */
        .st-group { background: white; border-radius: 15px; margin: 0 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; }
    </style>
</head>
<body>
    <div class="app-shell">
        <div id="genlove-notify"><span>💙</span> <span id="notify-msg"></span></div>

        <div id="scr-home" class="screen-layer active" style="display:flex;">
            <div class="home-content">
                <div class="main-logo"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
                <div class="tagline">Unissez cœur et santé pour bâtir des couples sains</div>
                
                <div class="home-prompt">Avez-vous déjà un compte ?</div>
                <button class="btn-dark" onclick="checkAuth()">➔ Se connecter</button>
                
                <div onclick="showScreen('scr-signup')" style="color:#1a2a44; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; margin-top:20px;">
                    <span style="font-size:1.2rem;">👤</span> Créer un compte
                </div>

                <div class="trust-footer">
                    🔒 Vos données de santé sont cryptées et confidentielles.
                </div>
            </div>
        </div>

        <div id="scr-signup" class="screen-layer">
            <div style="padding: 25px; text-align: center;">
                <h2 id="form-title" style="color:#ff416c; margin-top:0;">Mon Profil Santé</h2>
                <form onsubmit="saveProfile(event)">
                    <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo</span></div>
                    <input type="file" id="i" style="display:none" onchange="previewPhoto(event)">
                    
                    <input type="text" id="fn" class="input-box" placeholder="Prénom" required>
                    <input type="text" id="ln" class="input-box" placeholder="Nom" required>
                    
                    <span class="label-small">DATE DE NAISSANCE</span>
                    <input type="date" id="dob" class="input-box" required>
                    
                    <select id="gender" class="input-box" required><option value="">Genre</option><option>Homme</option><option>Femme</option></select>
                    <input type="text" id="res" class="input-box" placeholder="Ville de résidence" required>
                    <select id="gt" class="input-box" required><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
                    
                    <div style="display:flex; gap:10px;"><select id="gs_type" class="input-box" style="flex:2;" required><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select><select id="gs_rh" class="input-box" style="flex:1;" required><option>+</option><option>-</option></select></div>
                    
                    <select id="pj" class="input-box" required><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
                    
                    <div class="serment-box">
                        <input type="checkbox" id="oath" style="width:22px;height:22px; accent-color:#ff416c;" required>
                        <label for="oath" class="serment-text">Je confirme sur l'honneur la sincérité de mes informations santé.</label>
                    </div>

                    <button type="submit" id="btn-submit" class="btn-pink">Valider mon profil</button>
                    <p onclick="showScreen('scr-home')" style="color:#888; cursor:pointer; font-size:0.9rem;">Annuler</p>
                </form>
            </div>
        </div>

        <div id="scr-profile" class="screen-layer" style="background:#f8f9fa;">
            <div style="background:white; padding:30px 20px; text-align:center; border-radius:0 0 30px 30px; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div onclick="showScreen('scr-home')" style="font-size:1.2rem; cursor:pointer;">🏠</div>
                    <div onclick="showScreen('scr-settings')" style="font-size:1.4rem; cursor:pointer;">⚙️</div>
                </div>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover; background-position:center;"></div>
                <h2 id="vN" style="margin:10px 0 5px 0; color:#1a2a44;">...</h2>
                <p id="vR" style="color:#718096; margin:0; font-size:0.95rem;">📍 ...</p>
            </div>
            
            <div style="padding:25px 20px 10px; font-size:0.8rem; color:#a0aec0; font-weight:bold; letter-spacing:1px;">DONNÉES BIOMÉDICALES</div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG" style="color:#ff416c;">...</b></div>
                <div class="st-item"><span>Groupe Sanguin</span><b id="rS" style="color:#1a2a44;">...</b></div>
                <div class="st-item"><span>Projet Enfant</span><b id="rP">...</b></div>
            </div>
            <button class="btn-pink" style="width:90%;" onclick="showNotify('Recherche de compatibilité...')">Lancer le Matching</button>
        </div>

        <div id="scr-settings" class="screen-layer" style="background:#f4f7f6;">
            <div style="padding:30px 20px; text-align:center; color:#1a2a44;"><h3>Paramètres</h3></div>
            <div class="st-group">
                <div onclick="openEditMode()" style="cursor:pointer;" class="st-item"><span>✏️ Modifier mon profil</span><b style="color:#cbd5e0;">➔</b></div>
                <div onclick="if(confirm('Supprimer définitivement ?')){localStorage.clear();location.reload();}" style="cursor:pointer; color:#e53e3e;" class="st-item"><span>🗑️ Supprimer mon compte</span></div>
            </div>
            <button class="btn-dark" style="margin:20px auto; display:block;" onclick="showScreen('scr-profile')">Retour</button>
        </div>
    </div>

    <script>
        function showScreen(id) { document.querySelectorAll('.screen-layer').forEach(s => s.style.display = 'none'); document.getElementById(id).style.display = 'flex'; }
        
        function checkAuth() { 
            if(localStorage.getItem('u_fn')) showScreen('scr-profile'); 
            else showNotify("Veuillez d'abord créer un compte."); 
        }

        function calculateAge(birthDate) {
            if(!birthDate) return "";
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { age--; }
            return age + " ans";
        }

        let photoB64 = localStorage.getItem('u_p') || "";
        function previewPhoto(e){ const r=new FileReader(); r.onload=()=>{ photoB64=r.result; document.getElementById('c').style.backgroundImage='url('+photoB64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }

        function openEditMode() {
            document.getElementById('form-title').innerText = "Mise à jour du profil";
            document.getElementById('fn').value = localStorage.getItem('u_fn') || "";
            document.getElementById('ln').value = localStorage.getItem('u_ln') || "";
            document.getElementById('dob').value = localStorage.getItem('u_dob') || "";
            document.getElementById('res').value = localStorage.getItem('u_res') || "";
            document.getElementById('gt').value = localStorage.getItem('u_gt') || "";
            document.getElementById('pj').value = localStorage.getItem('u_pj') || "";
            document.getElementById('oath').checked = false;
            if(photoB64) { document.getElementById('c').style.backgroundImage = 'url('+photoB64+')'; document.getElementById('t').style.display = 'none'; }
            showScreen('scr-signup');
        }

        function saveProfile(e){
            e.preventDefault();
            localStorage.setItem('u_p', photoB64);
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_ln', document.getElementById('ln').value);
            localStorage.setItem('u_dob', document.getElementById('dob').value);
            localStorage.setItem('u_res', document.getElementById('res').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_pj', document.getElementById('pj').value);
            localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
            updateUI();
            showNotify("Profil scellé avec succès ! ✨");
            showScreen('scr-profile');
        }

        function updateUI(){
            const p = localStorage.getItem('u_p');
            const age = calculateAge(localStorage.getItem('u_dob'));
            if(p) document.getElementById('vP').style.backgroundImage = 'url('+p+')';
            document.getElementById('vN').innerText = (localStorage.getItem('u_fn') || '') + " " + (localStorage.getItem('u_ln') || '') + (age ? ", " + age : "");
            document.getElementById('vR').innerText = "📍 " + (localStorage.getItem('u_res') || '');
            document.getElementById('rG').innerText = localStorage.getItem('u_gt') || '-';
            document.getElementById('rS').innerText = localStorage.getItem('u_gs') || '-';
            document.getElementById('rP').innerText = "Enfant : " + (localStorage.getItem('u_pj') || '-');
        }

        function showNotify(m) { const n = document.getElementById('genlove-notify'); document.getElementById('notify-msg').innerText = m; n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 3000); }
        window.onload = () => { if(localStorage.getItem('u_fn')) updateUI(); };
    </script>
</body>
</html>
