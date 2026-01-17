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
            .btn { display: block; width: 100%; padding: 15px; margin: 10px 0; border-radius: 50px; border: none; font-weight: bold; cursor: pointer; text-decoration: none; color: white; text-decoration: none; }
            .btn-login { background: white; color: #ff416c; }
            .btn-signup { background: transparent; border: 2px solid white; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>💞 Genlove 🧬</h1>
            <a href="/dashboard" class="btn btn-login">📌 Mon Profil</a>
            <a href="/search" class="btn btn-signup">🔍 Rechercher un partenaire</a>
        </div>
    </body>
    </html>
    `);
});

// --- RECHERCHE AVANCÉE AVEC BLOCAGE SS ---
app.get('/search', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recherche - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; }
            .iphone { background: white; width: 100%; max-width: 400px; min-height: 100vh; padding: 20px; box-sizing: border-box; }
            .note { background: #e7f3ff; padding: 12px; border-radius: 12px; font-size: 0.8rem; color: #1c1e21; margin-bottom: 20px; border-left: 4px solid #007bff; }
            .section-title { font-weight: bold; font-size: 0.9rem; margin: 15px 0 10px; color: #555; text-transform: uppercase; }
            .filter-row { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8f9fa; border-radius: 10px; margin-bottom: 8px; }
            .btn-group { display: flex; gap: 5px; }
            .opt-btn { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; background: white; font-size: 0.75rem; cursor: pointer; }
            .opt-btn.active { background: #007bff; color: white; border-color: #007bff; }
            .opt-btn.disabled { background: #eee; color: #aaa; cursor: not-allowed; text-decoration: line-through; }
            .search-btn { background: #ff416c; color: white; width: 100%; padding: 16px; border: none; border-radius: 12px; font-weight: bold; margin-top: 20px; cursor: pointer; }
            .warning-ss { background: #fff5f5; color: #d32f2f; padding: 10px; border-radius: 10px; font-size: 0.75rem; margin-bottom: 15px; border: 1px solid #feb2b2; display: none; }
        </style>
    </head>
    <body>
        <div class="iphone">
            <h2 style="margin-top:0;">🔍 Recherche Avancée</h2>
            
            <div id="ssWarning" class="warning-ss">
                ⚠️ <b>Mode Sécurité Actif :</b> En raison de votre génotype SS, les profils SS ne seront pas affichés pour garantir une descendance saine.
            </div>

            <div class="note">
                <b>Confidentialité :</b> Les identités sont masquées jusqu'au match mutuel.
            </div>

            <div class="section-title">Critères Médicaux</div>
            
            <div class="filter-row">
                <span>Génotype souhaité</span>
                <div class="btn-group" id="gtGroup">
                    <button class="opt-btn active">AA</button>
                    <button class="opt-btn">AS</button>
                    <button class="opt-btn" id="btnSS">SS</button>
                </div>
            </div>

            <div class="filter-row">
                <span>Rhésus</span>
                <div class="btn-group">
                    <button class="opt-btn active">Peu importe</button>
                    <button class="opt-btn">+</button>
                    <button class="opt-btn">-</button>
                </div>
            </div>

            <div class="section-title">Projet de Vie</div>
            <div class="filter-row">
                <span>Désir d'enfants</span>
                <div class="btn-group">
                    <button class="opt-btn active">Oui</button>
                    <button class="opt-btn">Non</button>
                </div>
            </div>

            <div class="filter-row">
                <span>Seuil Compatibilité</span>
                <b style="color:#4caf50;">60% Min.</b>
            </div>

            <button class="search-btn" onclick="startSearch()">🚀 Trouver des partenaires</button>
            <a href="/" style="display:block; text-align:center; margin-top:15px; color:#666; text-decoration:none; font-size:0.8rem;">Annuler</a>
        </div>

        <script>
            // Récupérer les données de l'utilisateur connecté
            const user = JSON.parse(localStorage.getItem('uData'));
            
            if (user && user.gt === 'SS') {
                // Si l'utilisateur est SS, on applique le blocage
                const btnSS = document.getElementById('btnSS');
                const warning = document.getElementById('ssWarning');
                
                warning.style.display = 'block';
                btnSS.classList.add('disabled');
                btnSS.disabled = true;
                btnSS.title = "Indisponible pour votre sécurité génétique";
            }

            function startSearch() {
                alert("Analyse de la base de données Genlove... Recherche de profils compatibles à plus de 60%.");
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(port, () => { console.log('Genlove is SECURED'); });
        
