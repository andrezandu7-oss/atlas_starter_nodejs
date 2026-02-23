const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques (si besoin)
app.use(express.static(path.join(__dirname, 'public')));

// Page de test QR code
app.get('/qr-test', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test QR Code - Genlove</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2rem;
        }
        h2 {
            color: #555;
            margin: 20px 0 10px;
            font-size: 1.4rem;
            border-left: 5px solid #667eea;
            padding-left: 15px;
        }
        .section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: border 0.3s;
        }
        input:focus, select:focus {
            border-color: #667eea;
            outline: none;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, background 0.2s;
            margin-right: 10px;
        }
        button:hover {
            background: #764ba2;
            transform: translateY(-2px);
        }
        .qr-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        #qrCode {
            max-width: 250px;
            margin: 15px 0;
        }
        #reader {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        }
        .result-box {
            background: #e8f5e9;
            border-left: 5px solid #4caf50;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .warning-box {
            background: #fff3e0;
            border-left: 5px solid #ff9800;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 10px;
        }
        .badge-lab {
            background: #4caf50;
            color: white;
        }
        .institution-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin: 15px 0;
        }
        .institution-item {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .institution-item input[type="checkbox"] {
            width: 20px;
            height: 20px;
        }
        .access-level {
            font-size: 0.8rem;
            color: #666;
            margin-top: 5px;
        }
        footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 0.9rem;
        }
        .nav-links {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-bottom: 20px;
        }
        .nav-links a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            background: #f0f0f0;
        }
        .nav-links a:hover {
            background: #667eea;
            color: white;
        }
    </style>
    <!-- Bibliothèque pour QR code -->
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
    <!-- Bibliothèque pour scanner QR code -->
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="nav-links">
            <a href="/">🏠 Accueil Genlove</a>
            <a href="/qr-test">📱 Test QR Code</a>
        </div>
        
        <h1>🔐 Genlove - Prototype QR Code Santé</h1>
        
        <!-- SECTION 1: GÉNÉRATEUR DE QR CODE (LABORATOIRE) -->
        <div class="section">
            <h2>🏥 Laboratoire - Génération du QR code</h2>
            <div class="form-group">
                <label>Nom du laboratoire :</label>
                <input type="text" id="labName" value="Laboratorio Central de Luanda" readonly>
                <small class="access-level">ID: LAB-001-AO (accrédité par le ministère)</small>
            </div>
            
            <div class="form-group">
                <label>Nom complet du patient :</label>
                <input type="text" id="patientName" value="João Manuel Silva" placeholder="Nom du patient">
            </div>
            
            <div class="form-group">
                <label>Numéro d'identification nationale :</label>
                <input type="text" id="patientId" value="ANG-1990-123456" placeholder="ANG-AAAA-123456">
            </div>
            
            <div class="form-group">
                <label>Génotype :</label>
                <select id="genotype">
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Groupe sanguin :</label>
                <select id="bloodGroup">
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Date de naissance :</label>
                <input type="date" id="dob" value="1990-05-15">
            </div>
            
            <button onclick="generateQR()">🔐 Générer QR code sécurisé</button>
            
            <div id="qrContainer" class="qr-container" style="display: none;">
                <h3>QR Code du certificat médical</h3>
                <div id="qrCode"></div>
                <div class="result-box">
                    <strong>✅ Données signées par le laboratoire</strong>
                    <p style="margin-top: 5px; font-size: 0.8rem;">Signature numérique: <span id="signature"></span></p>
                </div>
            </div>
        </div>
        
        <!-- SECTION 2: INSTITUTIONS AUTORISÉES À LIRE -->
        <div class="section">
            <h2>🏛️ Registre des institutions autorisées</h2>
            <p>Sélectionnez les institutions autorisées à lire ce QR code :</p>
            
            <div class="institution-list" id="institutionList"></div>
            
            <button onclick="saveAuthorizedReaders()">💾 Enregistrer les autorisations</button>
        </div>
        
        <!-- SECTION 3: LECTEUR DE QR CODE (APPLICATION) -->
        <div class="section">
            <h2>📱 Application - Scan du QR code</h2>
            
            <div class="form-group">
                <label>Quelle application lit le QR code ?</label>
                <select id="appSelector">
                    <option value="GENLOVE">💘 Genlove - App de rencontre</option>
                    <option value="HOPITAL-CENTRAL">🏥 Hôpital Central de Luanda</option>
                    <option value="SEGURO-SAUD">🛡️ Seguro Saúde - Assurance</option>
                    <option value="INAC">🆔 INAC - Identification nationale</option>
                    <option value="MINSA">🏛️ Ministère de la Santé</option>
                    <option value="HACKER">⚠️ Application non autorisée</option>
                </select>
            </div>
            
            <div id="reader" style="width: 100%;"></div>
            
            <button onclick="startScanner()">📸 Démarrer le scan</button>
            <button onclick="stopScanner()">⏹️ Arrêter le scan</button>
            
            <div id="scanResult" class="result-box" style="display: none;"></div>
            <div id="errorResult" class="warning-box" style="display: none;"></div>
            
            <div id="patientForm" style="display: none; margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                <h3>📋 Formulaire pré-rempli</h3>
                <div class="form-group">
                    <label>Nom complet :</label>
                    <input type="text" id="formFullName" readonly>
                </div>
                <div class="form-group">
                    <label>Génotype :</label>
                    <input type="text" id="formGenotype" readonly>
                </div>
                <div class="form-group">
                    <label>Groupe sanguin :</label>
                    <input type="text" id="formBloodGroup" readonly>
                </div>
                <div class="form-group">
                    <label>Date de naissance :</label>
                    <input type="text" id="formDob" readonly>
                </div>
                <div class="badge badge-lab" id="verifiedBadge" style="display: none;">✅ Certifié par laboratoire</div>
            </div>
        </div>
        
        <footer>
            Prototype Genlove - Système de vérification par QR code<br>
            ⚕️ Données de santé sécurisées - Accès restreint aux institutions autorisées
        </footer>
    </div>

    <script>
        // ============================================
        // 1. CONFIGURATION DES INSTITUTIONS AUTORISÉES
        // ============================================
        const authorizedInstitutions = [
            { 
                id: 'GENLOVE', 
                name: 'Genlove', 
                type: 'app', 
                access: ['nom', 'genotype', 'groupe_sanguin'],
                icon: '💘' 
            },
            { 
                id: 'HOPITAL-CENTRAL', 
                name: 'Hôpital Central', 
                type: 'healthcare', 
                access: ['nom', 'prenom', 'genotype', 'groupe_sanguin', 'date_naissance', 'historique'],
                icon: '🏥' 
            },
            { 
                id: 'SEGURO-SAUD', 
                name: 'Seguro Saúde', 
                type: 'insurance', 
                access: ['nom', 'genotype', 'groupe_sanguin'],
                icon: '🛡️' 
            },
            { 
                id: 'INAC', 
                name: 'INAC', 
                type: 'government', 
                access: ['nom', 'date_naissance', 'patientId'],
                icon: '🆔' 
            },
            { 
                id: 'MINSA', 
                name: 'Ministère Santé', 
                type: 'government', 
                access: ['statistiques_anonymes'],
                icon: '🏛️' 
            }
        ];

        // Clé secrète du ministère (simulée)
        const SECRET_KEY = 'angola-health-ministry-secret-2025';

        // ============================================
        // 2. GÉNÉRATION DU QR CODE (LABORATOIRE)
        // ============================================
        function generateQR() {
            const labName = document.getElementById('labName').value;
            const patientName = document.getElementById('patientName').value;
            const patientId = document.getElementById('patientId').value;
            const genotype = document.getElementById('genotype').value;
            const bloodGroup = document.getElementById('bloodGroup').value;
            const dob = document.getElementById('dob').value;
            
            const dataToSign = `${labName}|${patientId}|${genotype}|${bloodGroup}|${dob}`;
            const signature = CryptoJS.HmacSHA256(dataToSign, SECRET_KEY).toString();
            
            const qrData = {
                version: '1.0',
                format: 'ANGOLA-HEALTH-2025',
                issuedBy: labName,
                labId: 'LAB-001-AO',
                patientName: patientName,
                patientId: patientId,
                genotype: genotype,
                bloodGroup: bloodGroup,
                dateOfBirth: dob,
                issuedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
                signature: signature,
                authorizedReaders: getAuthorizedReaders()
            };
            
            document.getElementById('signature').innerText = signature.substring(0, 20) + '...';
            
            const qrContainer = document.getElementById('qrContainer');
            qrContainer.style.display = 'flex';
            
            QRCode.toCanvas(document.createElement('canvas'), JSON.stringify(qrData), {
                width: 250,
                margin: 2
            }, function(err, canvas) {
                if (err) {
                    console.error(err);
                    return;
                }
                const qrDiv = document.getElementById('qrCode');
                qrDiv.innerHTML = '';
                qrDiv.appendChild(canvas);
            });
        }

        // ============================================
        // 3. LISTE DES INSTITUTIONS AUTORISÉES
        // ============================================
        function loadInstitutions() {
            const list = document.getElementById('institutionList');
            list.innerHTML = '';
            
            authorizedInstitutions.forEach(inst => {
                const div = document.createElement('div');
                div.className = 'institution-item';
                div.innerHTML = `
                    <input type="checkbox" id="inst_${inst.id}" value="${inst.id}" checked>
                    <label for="inst_${inst.id}">
                        ${inst.icon} ${inst.name}
                        <span class="access-level">${inst.access.join(', ')}</span>
                    </label>
                `;
                list.appendChild(div);
            });
        }

        function getAuthorizedReaders() {
            const readers = [];
            document.querySelectorAll('#institutionList input:checked').forEach(cb => {
                readers.push(cb.value);
            });
            return readers;
        }

        function saveAuthorizedReaders() {
            alert('✅ Liste des institutions autorisées enregistrée !');
        }

        // ============================================
        // 4. SCANNER QR CODE (APPLICATION)
        // ============================================
        let html5QrCode = null;

        function startScanner() {
            const appId = document.getElementById('appSelector').value;
            
            html5QrCode = new Html5Qrcode("reader");
            
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    try {
                        const qrData = JSON.parse(decodedText);
                        verifyQRData(qrData, appId);
                    } catch(e) {
                        showError('QR code invalide');
                    }
                    html5QrCode.stop();
                },
                (error) => {
                    console.warn(error);
                }
            );
        }

        function stopScanner() {
            if (html5QrCode) {
                html5QrCode.stop();
            }
        }

        function verifyQRData(qrData, appId) {
            const dataToVerify = `${qrData.issuedBy}|${qrData.patientId}|${qrData.genotype}|${qrData.bloodGroup}|${qrData.dateOfBirth}`;
            const expectedSignature = CryptoJS.HmacSHA256(dataToVerify, SECRET_KEY).toString();
            
            const resultDiv = document.getElementById('scanResult');
            const errorDiv = document.getElementById('errorResult');
            
            if (qrData.signature !== expectedSignature) {
                showError('❌ SIGNATURE INVALIDE - Ce certificat a été falsifié !');
                return;
            }
            
            if (!qrData.authorizedReaders || !qrData.authorizedReaders.includes(appId)) {
                showError(`⛔ ACCÈS REFUSÉ - ${getAppName(appId)} n'est pas autorisée`);
                console.warn(\`Tentative d'accès non autorisée: \${appId}\`);
                return;
            }
            
            const institution = authorizedInstitutions.find(i => i.id === appId);
            
            resultDiv.style.display = 'block';
            errorDiv.style.display = 'none';
            
            let displayHTML = \`
                <strong>✅ ACCÈS AUTORISÉ - \${getAppName(appId)}</strong>
                <p>Niveaux d'accès: \${institution.access.join(', ')}</p>
                <hr style="margin: 10px 0;">
            \`;
            
            if (institution.access.includes('nom')) {
                displayHTML += \`<p><strong>Nom complet:</strong> \${qrData.patientName}</p>\`;
            }
            
            if (institution.access.includes('genotype')) {
                displayHTML += \`<p><strong>Génotype:</strong> \${qrData.genotype}</p>\`;
            }
            
            if (institution.access.includes('groupe_sanguin')) {
                displayHTML += \`<p><strong>Groupe sanguin:</strong> \${qrData.bloodGroup}</p>\`;
            }
            
            if (institution.access.includes('date_naissance')) {
                displayHTML += \`<p><strong>Date de naissance:</strong> \${new Date(qrData.dateOfBirth).toLocaleDateString()}</p>\`;
            }
            
            if (institution.access.includes('patientId')) {
                displayHTML += \`<p><strong>ID National:</strong> \${qrData.patientId}</p>\`;
            }
            
            displayHTML += \`<p style="color: #4caf50; margin-top: 10px;">🔒 Données lues avec consentement</p>\`;
            
            resultDiv.innerHTML = displayHTML;
            
            document.getElementById('patientForm').style.display = 'block';
            document.getElementById('formFullName').value = qrData.patientName;
            document.getElementById('formGenotype').value = qrData.genotype;
            document.getElementById('formBloodGroup').value = qrData.bloodGroup;
            document.getElementById('formDob').value = new Date(qrData.dateOfBirth).toLocaleDateString();
            document.getElementById('verifiedBadge').style.display = 'inline-block';
        }

        function showError(message) {
            const resultDiv = document.getElementById('scanResult');
            const errorDiv = document.getElementById('errorResult');
            
            resultDiv.style.display = 'none';
            errorDiv.style.display = 'block';
            errorDiv.innerHTML = \`<strong>⛔ ERREUR</strong><p>\${message}</p>\`;
            
            document.getElementById('patientForm').style.display = 'none';
        }

        function getAppName(appId) {
            const app = authorizedInstitutions.find(i => i.id === appId);
            return app ? app.name : appId;
        }

        window.onload = function() {
            loadInstitutions();
        };
    </script>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
</body>
</html>`);
});

// Route d'accueil (optionnelle, pour revenir à votre app)
app.get('/', (req, res) => {
    res.send(`
        <h1>Genlove</h1>
        <p><a href="/qr-test">Tester le système QR code</a></p>
    `);
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
    console.log(`📱 Test QR code: http://localhost:${port}/qr-test`);
});