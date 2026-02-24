// ============================================
// INSCRIPTION AVEC QR CODE - TON CODE + NOTRE DESIGN
// ============================================
app.get('/signup-qr', (req, res) => {
    const t = req.t;
    
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - Inscription QR</title>
    ${styles}
    ${notifyScript}
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
    <style>
        .debug-box {
            background: #f0f0f0;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.8rem;
            word-break: break-all;
            margin: 10px 0;
            display: none;
            border-left: 5px solid #ff416c;
        }
        .test-buttons {
            display: flex;
            gap: 10px;
            margin: 15px 0;
        }
        .test-btn {
            flex: 1;
            background: #1a2a44;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 30px;
            cursor: pointer;
            font-weight: bold;
        }
        .qr-link {
            text-align: center;
            margin: 15px 0;
            color: #ff416c;
            display: block;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div id="loader">
            <div class="spinner"></div>
            <h3>Création de votre profil...</h3>
        </div>
        
        <div class="page-white">
            <h2>${t('signupTitle')}</h2>
            
            <!-- Section QR Scan -->
            <div class="qr-scan-section">
                <h3 style="color:white;">${t('withCertificate')}</h3>
                <div id="reader"></div>
                
                <!-- Zone de débogage -->
                <div class="debug-box" id="debug">
                    <strong>Dernier scan:</strong> <span id="debugText"></span>
                </div>
            </div>
            
            <!-- Boutons de test -->
            <div class="test-buttons">
                <button class="test-btn" onclick="simulateQR('AA', 'O+')">AA / O+</button>
                <button class="test-btn" onclick="simulateQR('AS', 'A+')">AS / A+</button>
                <button class="test-btn" onclick="simulateQR('SS', 'B-')">SS / B-</button>
            </div>
            
            <!-- Formulaire -->
            <form id="signupForm">
                <div class="photo-circle" id="photoCircle" onclick="document.getElementById('photoInput').click()">
                    <span id="photoText">📷 Photo</span>
                </div>
                <input type="file" id="photoInput" style="display:none" onchange="previewPhoto(event)" accept="image/*">
                
                <input type="text" id="firstName" class="input-box" placeholder="${t('firstName')}" readonly>
                <input type="text" id="lastName" class="input-box" placeholder="${t('lastName')}" readonly>
                <input type="text" id="genotype" class="input-box" placeholder="${t('genotype')}" readonly>
                <input type="text" id="bloodGroup" class="input-box" placeholder="${t('bloodGroup')}" readonly>
                
                <input type="text" id="residence" class="input-box" placeholder="${t('city')}" required>
                <input type="text" id="region" class="input-box" placeholder="${t('region')}" required>
                <select id="desireChild" class="input-box" required>
                    <option value="">${t('desireChild')}</option>
                    <option value="Oui">${t('yes')}</option>
                    <option value="Non">${t('no')}</option>
                </select>
                
                <input type="hidden" id="qrVerified" value="false">
                <input type="hidden" id="verifiedBy" value="">
                
                <div class="serment-container">
                    <input type="checkbox" id="oath" required>
                    <label for="oath" class="serment-text">${t('honorText')}</label>
                </div>
                
                <button type="submit" class="btn-pink" id="submitBtn" disabled>${t('createProfile')}</button>
            </form>
            
            <a href="/signup-choice" class="back-link">← ${t('backCharter')}</a>
        </div>
    </div>
    
    <script>
        let photoBase64 = "";
        
        // === TON CODE EXACTEMENT ===
        const scanner = new Html5Qrcode("reader");
        
        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (text) => {
                document.getElementById('debug').style.display = 'block';
                document.getElementById('debugText').innerText = text;
                
                let nom = '', geno = '', gs = '';
                
                if (text.includes('NOM:') && text.includes('GENO:') && text.includes('GS:')) {
                    const parts = text.split('|');
                    parts.forEach(p => {
                        if(p.startsWith('NOM:')) nom = p.split(':')[1];
                        if(p.startsWith('GENO:')) geno = p.split(':')[1];
                        if(p.startsWith('GS:')) gs = p.split(':')[1];
                    });
                }
                
                try {
                    const json = JSON.parse(text);
                    if (json.patientName) nom = json.patientName;
                    if (json.genotype) geno = json.genotype;
                    if (json.bloodGroup) gs = json.bloodGroup;
                } catch(e) {}
                
                if (nom && geno && gs) {
                    const parts = nom.split(' ');
                    document.getElementById('firstName').value = parts[0] || '';
                    document.getElementById('lastName').value = parts.slice(1).join(' ') || '';
                    document.getElementById('genotype').value = geno;
                    document.getElementById('bloodGroup').value = gs;
                    document.getElementById('qrVerified').value = 'true';
                    document.getElementById('submitBtn').disabled = false;
                    
                    scanner.stop();
                    document.getElementById('reader').style.display = 'none';
                    alert("✅ Scan réussi !");
                }
            },
            (error) => {}
        ).catch(err => {
            alert("❌ Erreur caméra: " + err);
        });

        function simulateQR(genotype, bloodGroup) {
            document.getElementById('firstName').value = 'João';
            document.getElementById('lastName').value = 'Silva';
            document.getElementById('genotype').value = genotype;
            document.getElementById('bloodGroup').value = bloodGroup;
            document.getElementById('qrVerified').value = 'true';
            document.getElementById('submitBtn').disabled = false;
            scanner.stop();
            document.getElementById('reader').style.display = 'none';
        }

        function previewPhoto(e) {
            const reader = new FileReader();
            reader.onload = function() {
                photoBase64 = reader.result;
                document.getElementById('photoCircle').style.backgroundImage = 'url(' + photoBase64 + ')';
                document.getElementById('photoCircle').style.backgroundSize = 'cover';
                document.getElementById('photoText').style.display = 'none';
            };
            reader.readAsDataURL(e.target.files[0]);
        }

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
                language: '${req.lang}',
                isPublic: true,
                qrVerified: true,
                verifiedBy: 'QR Scan',
                verificationBadge: 'lab'
            };
            
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });
            
            setTimeout(() => {
                document.getElementById('loader').style.display = 'none';
                if (res.ok) window.location.href = '/profile';
                else alert("Erreur");
            }, 2000);
        });
    </script>
</body>
</html>`);
});