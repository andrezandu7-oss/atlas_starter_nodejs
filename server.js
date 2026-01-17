const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- ACCUEIL ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #ff416c, #ff4b2b); height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
            .card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); padding: 40px; border-radius: 30px; width: 90%; max-width: 400px; border: 1px solid rgba(255,255,255,0.3); }
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; color: white; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <p>"L'amour qui prend soin de votre avenir"</p>
            <a href="/dashboard" class="btn btn-login">📌 Mon Profil</a>
            <a href="/signup-full" class="btn btn-signup">📝 S’inscrire</a>
        </div>
    </body>
    </html>
    `);
});

// --- INSCRIPTION : LIBELLÉS CORRIGÉS ---
app.get('/signup-full', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inscription - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #fdf2f2; padding: 10px; display: flex; justify-content: center; }
            .container { background: white; padding: 20px; border-radius: 20px; width: 100%; max-width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .logo { color: #ff416c; font-weight: bold; float: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            label { font-size: 0.75rem; font-weight: bold; color: #333; display: block; margin-top: 8px; }
            input, select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-top: 4px; font-size: 0.9rem; box-sizing: border-box; }
            .upload-btn { border: 2px dashed #2196F3; padding: 15px; border-radius: 10px; text-align: center; color: #2196F3; font-size: 0.9rem; font-weight: bold; margin-top: 15px; cursor: pointer; display: block; }
            .btn-final { background: #4caf50; color: white; border: none; padding: 16px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 1rem; width: 100%; margin-top: 20px; }
            .btn-back { display: block; background: #f5f5f5; color: #666; border: 1px solid #ddd; padding: 16px; border-radius: 10px; font-weight: bold; text-decoration: none; text-align: center; font-size: 1rem; margin-top: 10px; }
            #overlay { display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:1000; flex-direction:column; align-items:center; justify-content:center; }
            .loader { border: 6px solid #f3f3f3; border-top: 6px solid #ff416c; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div id="overlay"><div class="loader"></div><h2 style="margin-top:20px;">Vérification biométrique...</h2></div>
        <div class="container">
            <span class="logo">🧬 Genlove</span>
            <h2 style="margin-top:0;">Inscription</h2>
            <form>
                <div class="grid">
                    <div><label>Prénom *</label><input type="text" id="fn" placeholder="Ex: André"></div>
                    <div><label>Nom *</label><input type="text" id="ln" placeholder="Ex: Zandu"></div>
                </div>

                <p style="color:#ff416c; font-weight:bold; font-size:0.8rem; margin-top:15px;">Groupe Sanguin & Rhésus *</p>
                <div class="grid">
                    <select id="gs">
                        <option value="">Groupe Sanguin</option>
                        <option>A</option><option>B</option><option>AB</option><option>O</option>
                    </select>
                    <select id="rh">
                        <option value="">Rhésus</option>
                        <option>+</option><option>-</option>
                    </select>
                </div>

                <div class="grid">
                    <div><label>Génotype *</label>
                        <select id="gt">
                            <option value="">Choisir</option>
                            <option>AA</option><option>AS</option><option>SS</option>
                        </select>
                    </div>
                    <div><label>Projet de vie *</label>
                        <select id="kids">
                            <option value="">Enfants ?</option>
                            <option>Oui</option><option>Non</option><option>À discuter</option>
                        </select>
                    </div>
                </div>

                <div class="grid">
                    <div><label>Antécédents</label><input type="text" id="ant" placeholder="Ex: Asthme"></div>
                    <div><label>Allergies</label><input type="text" id="all" placeholder="Ex: Paracétamol"></div>
                </div>

                <label for="vInp" id="vLb" class="upload-btn">🎥 Vidéo de vérification obligatoire *</label>
                <input type="file" id="vInp" style="display:none" accept="video/*" capture="user" onchange="videoDone()">

                <button type="button" class="btn-final" onclick="validate()">🚀 Finaliser mon profil</button>
                <a href="/" class="btn-back">Retour</a>
            </form>
        </div>

        <script>
            let vCap = false;
            function videoDone() { 
                vCap = true; 
                document.getElementById('vLb').innerText='✅ Vidéo enregistrée';
                document.getElementById('vLb').style.color='#4caf50';
            }
            function validate() {
                const fn = document.getElementById('fn').value;
                const ln = document.getElementById('ln').value;
                const gs = document.getElementById('gs').value;
                const rh = document.getElementById('rh').value;
                const gt = document.getElementById('gt').value;
                const kids = document.getElementById('kids').value;

                if(!fn || !ln || !gs || !rh || !gt || !kids || !vCap) {
                    alert("Attention : Tous les champs marqués d'une * sont obligatoires pour votre sécurité.");
                    return;
                }

                localStorage.setItem('uData', JSON.stringify({ fn, ln, gs, rh, gt, kids, ant: document.getElementById('ant').value, all: document.getElementById('all').value }));
                document.getElementById('overlay').style.display='flex';
                setTimeout(() => { window.location.href='/dashboard'; }, 3000);
            }
        </script>
    </body>
    </html>
    `);
});

// --- MON PROFIL AVEC SÉCURITÉ SS ---
app.get('/dashboard', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profil - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; display: flex; justify-content: center; }
            .iphone { background: #f9f9f9; width: 100%; max-width: 400px; padding: 30px; min-height: 100vh; box-sizing: border-box; }
            .pic { width: 120px; height: 120px; border-radius: 50%; background: #ddd; margin: 0 auto 20px; display: block; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: 600; color: #333; }
            .value { color: #666; font-weight: bold; }
            .warning { background: #fff5f5; color: #d32f2f; padding: 10px; border-radius: 10px; font-size: 0.8rem; margin-top: 15px; border: 1px solid #feb2b2; }
        </style>
    </head>
    <body>
        <div class="iphone">
            <h2 style="margin:0;">🤍 Mon Profil</h2>
            <p style="color:#0056b3; font-weight:bold;">Genlove</p>
            <div id="cont"></div>
            <div id="ssShield" class="warning" style="display:none;">
                ⚠️ <b>Sécurité Genlove :</b> Votre génotype étant SS, les partenaires également SS sont automatiquement masqués pour protéger votre future descendance.
            </div>
            <a href="/signup-full" style="display:block; text-align:center; padding:15px; background:white; border:1px solid #ddd; border-radius:10px; margin-top:30px; text-decoration:none; color:black; font-weight:bold;">✏️ Modifier profil</a>
            <a href="/" style="display:block; text-align:center; margin-top:20px; color:#ff416c; text-decoration:none;">Déconnexion</a>
        </div>
        <script>
            const d = JSON.parse(localStorage.getItem('uData'));
            if(d) {
                if(d.gt === 'SS') document.getElementById('ssShield').style.display = 'block';
                document.getElementById('cont').innerHTML = \`
                    <div class="item"><span class="label">Identité</span> <span class="value">\${d.fn} \${d.ln}</span></div>
                    <div class="item"><span class="label">Groupe & Rhésus</span> <span class="value" style="color:#ff416c;">\${d.gs}\${d.rh}</span></div>
                    <div class="item"><span class="label">Génotype</span> <span class="value">\${d.gt}</span></div>
                    <div class="item"><span class="label">Projet Enfants</span> <span class="value">\${d.kids}</span></div>
                    <div class="item"><span class="label">Antécédents</span> <span class="value">\${d.ant || 'Aucun'}</span></div>
                \`;
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove is READY'); });
