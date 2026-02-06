const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; height: 100vh; overflow: hidden; }
    .app-shell { width: 100%; max-width: 450px; height: 100%; background: #f4e9da; display: flex; flex-direction: column; position: relative; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .screen { display: none; flex-direction: column; height: 100%; width: 100%; position: absolute; inset: 0; overflow-y: auto; background: white; z-index: 10; }
    .active { display: flex; }

    /* NOTIFY & LOADER */
    #genlove-notify { position: absolute; top: -100px; left: 10px; right: 10px; background: #1a2a44; color: white; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-left: 5px solid #007bff; }
    #genlove-notify.show { top: 20px; }
    #loader { display: none; position: absolute; inset: 0; background: white; z-index: 200; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
    .spinner { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #ff416c; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    /* UI ELEMENTS */
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; font-weight: bold; width: 85%; margin: 15px auto; border: none; cursor: pointer; display: block; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; font-weight: bold; width: 80%; margin: 10px auto; border: none; cursor: pointer; display: block; }
    .st-group { background: white; border-radius: 15px; margin: 0 15px 15px 15px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: left; }
    .st-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f8f8f8; color: #333; font-size: 0.95rem; }

    /* SWITCH SETTINGS */
    .switch { position: relative; display: inline-block; width: 45px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background-color: #ccc; transition: .4s; border-radius: 24px; }
    .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .slider { background-color: #007bff; }
    input:checked + .slider:before { transform: translateX(21px); }

    /* FORM & PROFILE */
    .input-box { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 10px; font-size: 1rem; box-sizing: border-box; background: #f8f9fa; }
    .photo-circle { width: 110px; height: 110px; border: 2px dashed #ff416c; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; cursor: pointer; }
</style>
`;

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>
    <div class="app-shell">
        <div id="genlove-notify"><span>💙</span><span id="notify-msg"></span></div>
        <div id="loader"><div class="spinner"></div><h3>Analyse sécurisée...</h3><p>Vérification de vos données médicales.</p></div>

        <div id="scr-home" class="screen active" style="background:#f4e9da;">
            <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:30px; text-align:center;">
                <div style="font-size: 3.5rem; font-weight: bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
                <div style="font-weight:bold; color:#1a2a44; margin-bottom:40px;">Unissez cœur et santé pour bâtir des couples sains</div>
                <button class="btn-dark" onclick="checkAuth()">➔ Se connecter</button>
                <button class="btn-pink" onclick="showScreen('scr-signup')">👤 Créer un compte</button>
            </div>
        </div>

        <div id="scr-signup" class="screen" style="padding:20px;">
            <h2 style="color:#ff416c; text-align:center;">Configuration Santé</h2>
            <div class="photo-circle" id="c" onclick="document.getElementById('i').click()"><span id="t">📸 Photo *</span></div>
            <input type="file" id="i" style="display:none" onchange="preview(event)">
            <input type="text" id="fn" class="input-box" placeholder="Prénom">
            <select id="gt" class="input-box"><option value="">Génotype</option><option>AA</option><option>AS</option><option>SS</option></select>
            <div style="display:flex; gap:10px;"><select id="gs_type" class="input-box" style="flex:2;"><option value="">Groupe</option><option>A</option><option>B</option><option>AB</option><option>O</option></select>
            <select id="gs_rh" class="input-box" style="flex:1;"><option>+</option><option>-</option></select></div>
            <select id="pj" class="input-box"><option value="">Désir d'enfant ?</option><option>Oui</option><option>Non</option></select>
            <div style="margin-top:15px; padding:12px; background:#fff5f7; border-radius:12px; border:1px solid #ffdae0; display:flex; gap:10px;">
                <input type="checkbox" id="oath" style="width:20px;height:20px;">
                <label for="oath" style="font-size:0.8rem; color:#d63384; line-height:1.3;">Je confirme sur l'honneur que ces informations sont conformes à mes résultats médicaux.</label>
            </div>
            <button class="btn-pink" onclick="saveProfile()">🚀 Valider mon profil</button>
        </div>

        <div id="scr-profile" class="screen" style="background:#f8f9fa;">
            <div style="background:white; padding:30px; text-align:center; border-radius:0 0 30px 30px; position:relative;">
                <button onclick="showScreen('scr-settings')" style="border:none; background:none; cursor:pointer; position:absolute; top:20px; right:20px; font-size:1.4rem;">⚙️</button>
                <div id="vP" style="width:110px; height:110px; border-radius:50%; border:3px solid #ff416c; margin:20px auto; background-size:cover;"></div>
                <h2 id="vN" style="margin:5px 0;">Utilisateur</h2>
                <p style="color:#007bff; font-weight:bold; margin:0;">Profil Santé Validé ✅</p>
            </div>
            <div style="padding:15px 20px 5px; font-size:0.75rem; color:#888; font-weight:bold;">MES INFORMATIONS</div>
            <div class="st-group">
                <div class="st-item"><span>Génotype</span><b id="rG" style="color:#ff416c;">--</b></div>
                <div class="st-item"><span>Groupe Sanguin</span><b id="rS">--</b></div>
            </div>
            <button class="btn-dark" onclick="showScreen('scr-home')">🏠 Retour Accueil</button>
        </div>

        <div id="scr-settings" class="screen" style="background:#f4f7f6;">
            <div style="padding:25px; background:white; text-align:center;">
                <div style="font-size:2.5rem; font-weight:bold;"><span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span></div>
            </div>
            
            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">CONFIDENTIALITÉ</div>
            <div class="st-group">
                <div class="st-item">
                    <span>Visibilité profil</span>
                    <label class="switch">
                        <input type="checkbox" checked onchange="document.getElementById('status').innerText = this.checked ? 'Public' : 'Privé'; showNotify('Paramètre mis à jour !')">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="st-item" style="font-size:0.8rem; color:#666;">Statut actuel : <b id="status" style="color:#007bff;">Public</b></div>
            </div>

            <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">COMPTE</div>
            <div class="st-group">
                <div class="st-item" onclick="showScreen('scr-signup')" style="cursor:pointer;">
                    <span>Modifier mon profil</span>
                    <b>Modifier ➔</b>
                </div>
            </div>
            
            <div class="st-group">
                <div class="st-item" style="color:red; font-weight:bold;">Supprimer mon compte</div>
                <div style="display:flex; justify-content:space-around; padding:15px;">
                    <button onclick="localStorage.clear(); location.reload();" style="background:#1a2a44; color:white; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Oui</button>
                    <button onclick="showNotify('Action annulée')" style="background:#eee; color:#333; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Non</button>
                </div>
            </div>
            <button class="btn-pink" onclick="showScreen('scr-profile')">Retour</button>
        </div>
    </div>

    <script>
        function showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
        }

        function showNotify(msg) {
            const n = document.getElementById('genlove-notify');
            document.getElementById('notify-msg').innerText = msg;
            n.classList.add('show');
            setTimeout(() => n.classList.remove('show'), 3000);
        }

        function checkAuth() {
            if(localStorage.getItem('u_fn')) { updateUI(); showScreen('scr-profile'); }
            else alert("Veuillez créer un compte.");
        }

        let b64 = "";
        function preview(e){ const r=new FileReader(); r.onload=()=>{ b64=r.result; document.getElementById('c').style.backgroundImage='url('+b64+')'; document.getElementById('t').style.display='none'; }; r.readAsDataURL(e.target.files[0]); }

        function saveProfile() {
            if(!document.getElementById('oath').checked) return alert("Veuillez confirmer le serment.");
            document.getElementById('loader').style.display='flex';
            localStorage.setItem('u_fn', document.getElementById('fn').value);
            localStorage.setItem('u_gt', document.getElementById('gt').value);
            localStorage.setItem('u_gs', document.getElementById('gs_type').value + document.getElementById('gs_rh').value);
            localStorage.setItem('u_p', b64);
            setTimeout(() => { document.getElementById('loader').style.display='none'; updateUI(); showScreen('scr-profile'); }, 3000);
        }

        function updateUI() {
            document.getElementById('vN').innerText = localStorage.getItem('u_fn');
            document.getElementById('rG').innerText = localStorage.getItem('u_gt');
            document.getElementById('rS').innerText = localStorage.getItem('u_gs');
            document.getElementById('vP').style.backgroundImage = 'url('+localStorage.getItem('u_p')+')';
        }

        window.onload = () => { if(localStorage.getItem('u_fn')) updateUI(); };
    </script>
</body></html>`);
});

app.listen(port);
