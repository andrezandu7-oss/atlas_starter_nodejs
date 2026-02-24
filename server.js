// ============================================
// INSCRIPTION QR - TON CODE FONCTIONNEL ADAPTÉ
// ============================================
app.get('/signup-qr', (req, res) => {
    const datePicker = generateDateOptions();
    
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Inscription QR</title>
    ${styles}
    ${notifyScript}
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
</head>
<body>
    <div class="app-shell">
        <div id="loader">
            <div class="spinner"></div>
            <h3>Création de votre profil...</h3>
        </div>
        
        <div class="page-white">
            <h2>Inscription avec certificat</h2>
            
            <!-- TON CODE QR FONCTIONNEL -->
            <div class="qr-scan-section">
                <div style="font-size: 2rem; margin-bottom: 10px;">📸</div>
                <h3 style="color:white;">Scannez votre QR code</h3>
                
                <div id="reader"></div>
                
                <!-- Zone de débogage -->
                <div class="debug-box" id="debug">
                    <strong>Dernier scan:</strong> <span id="debugText"></span>
                </div>
                
                <div id="scan-status" style="margin-top: 10px; color: #4caf50; font-weight: bold;"></div>
            </div>
            
            <!-- Boutons de test -->
            <div class="test-buttons">
                <button class="test-btn" onclick="simulateQR('AA', 'O+')">🧪 AA / O+</button>
                <button class="test-btn" onclick="simulateQR('AS', 'A+')">🧪 AS / A+</button>
                <button class="test-btn" onclick="simulateQR('SS', 'B-')">🧪 SS / B-</button>
            </div>
            
            <!-- Lien générateur -->
            <a href="/generator" target="_blank" class="qr-link">📱 Générer un vrai QR code</a>
            
            <!-- FORMULAIRE ADAPTÉ À TON SCHÉMA -->
            <form id="signupForm">
                <!-- Champs QR remplis automatiquement -->
                <div class="qr-fields">
                    <h3>✅ Données du certificat</h3>
                    <input type="text" id="firstName" class="input-box" placeholder="Prénom" readonly>
                    <input type="text" id="lastName" class="input-box" placeholder="Nom" readonly>
                    <input type="text" id="genotype" class="input-box" placeholder="Génotype" readonly>
                    <input type="text" id="bloodGroup" class="input-box" placeholder="Groupe sanguin" readonly>
                </div>
                
                <!-- Champs manuels -->
                <div class="manual-fields">
                    <h3>📍 Localisation</h3>
                    <input type="text" id="residence" class="input-box" placeholder="Ville (ex: Luanda)">
                    <input type="text" id="region" class="input-box" placeholder="Région (ex: Talatona)">
                    
                    <h3>👶 Désir d'enfant</h3>
                    <select id="desireChild" class="input-box">
                        <option value="">Sélectionner</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                    </select>
                </div>
                
                <!-- Champs cachés pour ton schéma -->
                <input type="hidden" id="qrVerified" value="true">
                <input type="hidden" id="verifiedBy" value="QR Scan">
                <input type="hidden" id="verificationBadge" value="lab">
                
                <!-- Serment -->
                <div class="serment-container">
                    <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                    <label for="oath" class="serment-text">Je confirme que mes informations sont sincères.</label>
                </div>
                
                <button type="submit" class="btn-pink" id="submitBtn" disabled>✅ S'inscrire</button>
            </form>
            
            <a href="/signup-choice" class="back-link">← Retour au choix</a>
        </div>
    </div>

    <script>
        let photoBase64 = "";
        const scanner = new Html5Qrcode("reader");
        
        // TON CODE FONCTIONNEL - EXACTEMENT IDENTIQUE
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (text) => {
                // Afficher ce qui a été scanné
                document.getElementById('debug').style.display = 'block';
                document.getElementById('debugText').innerText = text;
                
                console.log("QR scanné:", text);
                
                // TON PARSER FONCTIONNEL
                let nom = '', geno = '', gs = '';
                
                // Format 1: NOM:...|GENO:...|GS:...
                if (text.includes('NOM:') && text.includes('GENO:') && text.includes('GS:')) {
                    const parts = text.split('|');
                    parts.forEach(p => {
                        if(p.startsWith('NOM:')) nom = p.split(':')[1];
                        if(p.startsWith('GENO:')) geno = p.split(':')[1];
                        if(p.startsWith('GS:')) gs = p.split(':')[1];
                    });
                }
                
                // Format 2: JSON
                try {
                    const json = JSON.parse(text);
                    if (json.patientName) nom = json.patientName;
                    if (json.genotype) geno = json.genotype;
                    if (json.bloodGroup) gs = json.bloodGroup;
                } catch(e) {}
                
                // REMPLISSAGE AUTOMATIQUE
                if (nom && geno && gs) {
                    const nameParts = nom.split(' ');
                    document.getElementById('firstName').value = nameParts[0] || '';
                    document.getElementById('lastName').value = nameParts.slice(1).join(' ') || '';
                    document.getElementById('genotype').value = geno.toUpperCase();
                    document.getElementById('bloodGroup').value = gs.toUpperCase();
                    
                    document.getElementById('submitBtn').disabled = false;
                    document.getElementById('scan-status').innerHTML = '✅ Scan réussi !';
                    
                    // ARRÊT SCANNER
                    scanner.stop();
                    document.getElementById('reader').style.display = 'none';
                } else {
                    document.getElementById('scan-status').innerHTML = '❌ Format non reconnu';
                    document.getElementById('scan-status').style.color = '#ff4444';
                }
            },
            (error) => {} // Ignorer les erreurs
        ).catch(err => {
            document.getElementById('scan-status').innerHTML = '❌ Erreur caméra: ' + err;
            document.getElementById('scan-status').style.color = '#ff4444';
        });

        // TON FONCTION SIMULATE EXACTE
        function simulateQR(genotype, bloodGroup) {
            document.getElementById('firstName').value = 'João';
            document.getElementById('lastName').value = 'Silva';
            document.getElementById('genotype').value = genotype;
            document.getElementById('bloodGroup').value = bloodGroup;
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('scan-status').innerHTML = '✅ Test réussi !';
            scanner.stop();
            document.getElementById('reader').style.display = 'none';
        }

        // SUBMIT ADAPTÉ À TON SCHÉMA User
        document.getElementById('signupForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            document.getElementById('loader').style.display = 'flex';
            
            const userData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                gender: 'Non spécifié',
                dob: '2000-01-01',
                residence: document.getElementById('residence').value,
                region: document.getElementById('region').value,
                genotype: document.getElementById('genotype').value,
                bloodGroup: document.getElementById('bloodGroup').value,
                desireChild: document.getElementById('desireChild').value,
                photo: photoBase64 || "",
                language: 'fr',
                isPublic: true,
                qrVerified: true,
                verifiedBy: document.getElementById('verifiedBy').value,
                verifiedAt: new Date(),
                verificationBadge: 'lab'
            };
            
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(userData)
                });
                
                const data = await res.json();
                
                setTimeout(() => {
                    document.getElementById('loader').style.display = 'none';
                    if (data.success) {
                        window.location.href = '/profile';
                    } else {
                        alert("Erreur: " + (data.error || "Inconnue"));
                    }
                }, 2000);
            } catch(error) {
                document.getElementById('loader').style.display = 'none';
                alert("Erreur de connexion");
            }
        });
    </script>
</body>
</html>`);
});