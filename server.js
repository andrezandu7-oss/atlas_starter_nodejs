const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- RECHERCHE AVANCÉE (Version Révisée) ---
app.get('/search', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recherche - Genlove</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; display: flex; justify-content: center; }
            .iphone { background: white; width: 100%; max-width: 400px; min-height: 100vh; padding: 25px; box-sizing: border-box; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .note { background: #e7f3ff; padding: 15px; border-radius: 12px; font-size: 0.85rem; color: #1c1e21; margin-bottom: 25px; border-left: 4px solid #007bff; line-height: 1.4; }
            .section-title { font-weight: bold; font-size: 0.9rem; margin: 20px 0 10px; color: #ff416c; text-transform: uppercase; letter-spacing: 0.5px; }
            .filter-row { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8f9fa; border-radius: 10px; margin-bottom: 8px; border: 1px solid #eee; }
            .btn-group { display: flex; gap: 5px; }
            .opt-btn { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; font-size: 0.8rem; cursor: pointer; transition: 0.2s; }
            .opt-btn.active { background: #ff416c; color: white; border-color: #ff416c; font-weight: bold; }
            .opt-btn.disabled { background: #f2f2f2; color: #ccc; cursor: not-allowed; text-decoration: line-through; border-color: #eee; }
            .search-btn { background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; width: 100%; padding: 18px; border: none; border-radius: 15px; font-weight: bold; margin-top: 30px; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 15px rgba(255, 65, 108, 0.3); }
            .warning-ss { background: #fff5f5; color: #d32f2f; padding: 12px; border-radius: 12px; font-size: 0.8rem; margin-bottom: 20px; border: 1px solid #feb2b2; display: none; }
        </style>
    </head>
    <body>
        <div class="iphone">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="margin:0;">🔍 Recherche</h2>
                <span style="color:#ff416c; font-weight:bold; font-size:0.8rem;">Genlove</span>
            </div>
            
            <div id="ssWarning" class="warning-ss">
                ⚠️ <b>Protection Génétique :</b> Votre profil étant SS, l'option de recherche de partenaires SS est bloquée pour prévenir les risques de santé.
            </div>

            <div class="note">
                <b>Note Importante :</b> Les identités restent confidentielles. Seuls les critères de compatibilité sont affichés.
            </div>

            <div class="section-title">Filtres de Base</div>
            <div class="filter-row">
                <span>Tranche d'âge</span>
                <div style="font-weight:bold; color:#333;">20 - 45 ans</div>
            </div>
            <div class="filter-row">
                <span>Intérêts communs</span>
                <span style="color:#666;">Tous ❯</span>
            </div>

            <div class="section-title">Critères Médicaux</div>
            <div class="filter-row">
                <span>Génotype</span>
                <div class="btn-group">
                    <button class="opt-btn">AA</button>
                    <button class="opt-btn active">AS</button>
                    <button class="opt-btn" id="btnSS">SS</button>
                </div>
            </div>
            <div class="filter-row">
                <span>Rhésus</span>
                <div class="btn-group">
                    <button class="opt-btn active">Tous</button>
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
                    <button class="opt-btn">Neutre</button>
                </div>
            </div>

            <div class="filter-row" style="margin-top:15px; background:#f0fff4; border-color:#c6f6d5;">
                <span style="font-weight:bold; color:#2f855a;">Seuil de Compatibilité</span>
                <b style="color:#2f855a;">60% Min.</b>
            </div>

            <button class="search-btn" onclick="startSearch()">🚀 Lancer la Recherche</button>
            <a href="/dashboard" style="display:block; text-align:center; margin-top:20px; color:#999; text-decoration:none; font-size:0.85rem;">Retour au profil</a>
        </div>

        <script>
            const user = JSON.parse(localStorage.getItem('uData'));
            
            if (user && user.gt === 'SS') {
                const btnSS = document.getElementById('btnSS');
                const warning = document.getElementById('ssWarning');
                warning.style.display = 'block';
                btnSS.classList.add('disabled');
                btnSS.disabled = true;
            }

            function startSearch() {
                alert("Analyse de compatibilité en cours...");
            }
        </script>
    </body>
    </html>
    `);
});

// ... (le reste du code server.js demeure identique)
app.listen(port, () => { console.log('Genlove Search V2 READY'); });
