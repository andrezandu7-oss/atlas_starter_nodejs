const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

// --- STYLES (Conservés de V61.2 + Ajouts pour le Matching) ---
const styles = `
<style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; background: #fdf2f2; display: flex; justify-content: center; }
    .app-shell { width: 100%; max-width: 420px; min-height: 100vh; background: #f4e9da; display: flex; flex-direction: column; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
    
    /* ÉCRANS DE BASE */
    .page-white { background: white; min-height: 100vh; padding: 25px 20px; box-sizing: border-box; text-align: center; }
    .btn-pink { background: #ff416c; color: white; padding: 18px; border-radius: 50px; text-align: center; text-decoration: none; font-weight: bold; display: block; width: 85%; margin: 20px auto; border: none; cursor: pointer; }
    .btn-dark { background: #1a2a44; color: white; padding: 18px; border-radius: 12px; text-align: center; text-decoration: none; font-weight: bold; display: block; margin: 15px; width: auto; box-sizing: border-box; }

    /* DESIGN DU MATCHING */
    .info-bubble { background: #e7f3ff; color: #1a2a44; padding: 15px; border-radius: 12px; margin: 15px; font-size: 0.85rem; line-height: 1.4; border-left: 5px solid #007bff; text-align: left; }
    .match-card { background: white; margin: 15px; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .match-photo { width: 60px; height: 60px; border-radius: 50%; background: #eee; filter: blur(6px); background-size: cover; }
    .match-info { flex: 1; text-align: left; }
    .match-info b { display: block; font-size: 1rem; color: #1a2a44; }
    .match-info small { color: #666; font-size: 0.8rem; }
    .btn-contact { background: #ff416c; color: white; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: bold; }
</style>
`;

/* ========================= 1. ROUTES V61.2 (INTACTES) ========================= */
// [Accueil, Signup, Profile, Settings restent identiques à ton code précédent]
// Note : J'omets ici les routes répétitives pour me concentrer sur la nouveauté, 
// mais elles sont bien présentes dans ton serveur.

/* ========================= 2. NOUVELLE ROUTE : MATCHING ========================= */
app.get('/matching', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head>
    <body style="background:#f4f7f6;"><div class="app-shell">
        <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;">
            <h3 style="margin:0; color:#1a2a44;">Partenaires Compatibles</h3>
        </div>

        <div id="matching-container"></div>

        <a href="/profile" class="btn-pink">Retour au profil</a>
    </div>

    <script>
        // Simulation d'une base de données de partenaires
        const partners = [
            {id: 1, gt: "AA", score: 95},
            {id: 2, gt: "AS", score: 82},
            {id: 3, gt: "SS", score: 60},
            {id: 4, gt: "AA", score: 88},
            {id: 5, gt: "AS", score: 75}
        ];

        const myGt = localStorage.getItem('u_gt'); // Récupéré de la V61.2
        const container = document.getElementById('matching-container');

        // --- LOGIQUE DE FILTRAGE STRICTE ---
        let filtered = [];
        let showMessage = false;

        if (myGt === "SS") {
            // Candidat SS : Voit uniquement AA
            filtered = partners.filter(p => p.gt === "AA");
        } 
        else if (myGt === "AS") {
            // Candidat AS : Voit uniquement AA + Message
            filtered = partners.filter(p => p.gt === "AA");
            showMessage = true;
        } 
        else {
            // Candidat AA : Voit tout le monde
            filtered = partners;
        }

        // --- AFFICHAGE ---
        if (showMessage) {
            container.innerHTML = \`
                <div class="info-bubble">
                    ✨ <b>Engagement Santé :</b> Pour protéger votre future famille, Genlove sélectionne pour vous uniquement des profils AA. C'est notre manière de prendre soin de votre bonheur ensemble !
                </div>\`;
        }

        filtered.forEach(p => {
            container.innerHTML += \`
                <div class="match-card">
                    <div class="match-photo"></div>
                    <div class="match-info">
                        <b>Profil #\${p.id}</b>
                        <small>Génotype \${p.gt} • \${p.score}% compatible</small>
                    </div>
                    <a href="/requests" class="btn-contact">Contacter</a>
                </div>\`;
        });

        if(filtered.length === 0) {
            container.innerHTML += "<p style='text-align:center; margin-top:50px; color:#666;'>Aucun partenaire disponible pour le moment.</p>";
        }
    </script></body></html>`);
});

// Lancement du serveur
app.listen(port, () => { console.log("Genlove V61.3 - Matching Opérationnel"); });
