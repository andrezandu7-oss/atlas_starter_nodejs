const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLE GLOBAL POUR LE CENTRAGE ET LA LISIBILITÉ ---
const styles = `
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
        .app-shell { width: 100%; max-width: 400px; min-height: 100vh; background: white; position: relative; display: flex; flex-direction: column; }
        .content { padding: 25px; text-align: center; }
        .btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 16px; margin: 12px 0; border-radius: 50px; border: none; font-weight: bold; font-size: 1.1rem; cursor: pointer; text-decoration: none; box-sizing: border-box; }
        .btn-white { background: white; color: #ff416c; }
        .btn-outline { background: transparent; border: 2px solid white; color: white; }
        .input-group { text-align: left; margin-bottom: 15px; }
        input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 10px; margin-top: 5px; box-sizing: border-box; }
        .profile-data { text-align: left; border-top: 1px solid #eee; margin-top: 20px; }
        .data-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    </style>
`;

// --- 1. ACCUEIL (Boutons centrés et Design validé) ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background: linear-gradient(135deg, #ff416c, #ff4b2b);">
        <div class="app-shell" style="background: transparent; justify-content: center;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(15px); padding: 40px 30px; border-radius: 30px; width: 85%; margin: auto; border: 1px solid rgba(255,255,255,0.3); color: white; text-align: center;">
                <h1>💞 Genlove 🧬</h1>
                <p>"L'amour qui prend soin de votre avenir."</p>
                <p>Unissez cœur et santé pour bâtir des couples <span style="text-decoration: underline;">SOLIDES</span></p>
                <a href="/dashboard" class="btn btn-white">📌 Se connecter</a>
                <a href="/signup" class="btn btn-outline">📝 S'inscrire</a>
            </div>
        </div>
    </body>
    </html>
    `);
});

// --- 2. INSCRIPTION (Configuration complète restaurée) ---
app.get('/signup', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content">
                <h2 style="color:#ff416c;">Inscription</h2>
                <form onsubmit="save(event)">
                    <div class="input-group"><label>Prénom *</label><input type="text" id="fn" placeholder="Ex: André" required></div>
                    <div class="input-group"><label>Nom *</label><input type="text" id="ln" placeholder="Ex: Zandu" required></div>
                    <div style="display:flex; gap:10px;">
                        <div class="input-group" style="flex:1;"><label>Groupe Sanguin</label><select id="gs"><option>A</option><option>B</option><option>AB</option><option>O</option></select></div>
                        <div class="input-group" style="flex:1;"><label>Rhésus</label><select id="rh"><option>+</option><option>-</option></select></div>
                    </div>
                    <div class="input-group"><label>Génotype *</label><select id="gt" required><option>AA</option><option>AS</option><option>SS</option></select></div>
                    <div class="input-group"><label>Antécédents / Allergies</label><input type="text" id="med" placeholder="Ex: Asthme, Paracétamol"></div>
                    <button type="submit" class="btn" style="background:#4caf50; color:white;">🚀 Finaliser mon profil</button>
                    <a href="/" style="color:#999; text-decoration:none; font-size:0.9rem;">Retour</a>
                </form>
            </div>
        </div>
        <script>
            function save(e) {
                e.preventDefault();
                const d = { 
                    fn: document.getElementById('fn').value, 
                    ln: document.getElementById('ln').value, 
                    gs: document.getElementById('gs').value,
                    rh: document.getElementById('rh').value,
                    gt: document.getElementById('gt').value,
                    med: document.getElementById('med').value,
                    dob: "1990-03-11" // Par défaut pour le test
                };
                localStorage.setItem('uData', JSON.stringify(d));
                window.location.href = '/dashboard';
            }
        </script>
    </body>
    </html>
    `);
});

// --- 3. PROFIL (Données visibles comme demandé) ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content">
                <img id="uP" src="https://via.placeholder.com/120" style="width:120px; height:120px; border-radius:50%; border:4px solid #ff416c; object-fit:cover;">
                <h2 id="uN" style="margin: 10px 0;">André Zandu</h2>
                
                <div class="profile-data">
                    <div class="data-row"><span>Né(e) le</span> <b id="uDob">1990-03-11</b></div>
                    <div class="data-row"><span>Génotype</span> <b id="uGt">AA</b></div>
                    <div class="data-row"><span>Désir d'enfants</span> <b>Oui</b></div>
                    <div class="data-row"><span>Groupe</span> <b id="uGs">A+</b></div>
                </div>

                <a href="/search" class="btn" style="background:#ff416c; color:white; margin-top:30px;">🔍 Rechercher un partenaire</a>
                <a href="/settings" style="display:block; margin-top:15px; color:#666; text-decoration:none;">⚙️ Paramètres</a>
            </div>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) {
                document.getElementById('uN').innerText = d.fn + ' ' + d.ln;
                document.getElementById('uGt').innerText = d.gt;
                document.getElementById('uGs').innerText = d.gs + d.rh;
            }
        </script>
    </body>
    </html>
    `);
});

// --- 4. PARAMÈTRES (Écran de modification) ---
app.get('/settings', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body>
        <div class="app-shell">
            <div class="content" style="text-align:left;">
                <a href="/dashboard" style="text-decoration:none; font-size:1.5rem;">⬅️</a>
                <h2>Paramètres</h2>
                <div class="data-row" style="cursor:pointer;"><span>✏️ Modifier mes informations</span></div>
                <div class="data-row" style="cursor:pointer;"><span>🔔 Notifications</span></div>
                <div class="data-row" style="cursor:pointer; color:red;" onclick="localStorage.clear(); window.location.href='/';"><span>🚪 Déconnexion</span></div>
            </div>
        </div>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove Corrected UI Live'); });
