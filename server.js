const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques
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
        }
        h2 {
            color: #555;
            margin: 20px 0 10px;
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
            margin-right: 10px;
        }
        button:hover {
            background: #764ba2;
        }
        .qr-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 10px;
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
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="nav-links">
            <a href="/">🏠 Accueil Genlove</a>
            <a href="/qr-test">📱 Test QR Code</a>
        </div>
        
        <h1>🔐 Genlove - Prototype QR Code Santé</h1>
        
        <!-- SECTION 1: GÉNÉRATEUR DE QR CODE -->
        <div class="section">
            <h2>🏥 Laboratoire - Génération du QR code</h2>
            <div class="form-group">
                <label>Nom du laboratoire :</label>
                <input type="text" id="labName" value="Laboratorio Central de Luanda" readonly>
            </div>
            
            <div class="form-group">
                <label>Nom complet du patient :</label>
                <input type="text" id="patientName" value="João Manuel Silva">
            </div>
            
            <div class="form-group">
                <label>Numéro d'identification :</label>
                <input type="text" id="patientId" value="ANG-1990-123456">
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
            
            <button onclick="generateQR()">🔐 Générer QR code</button>
            
            <div id="qrContainer" class="qr-container" style="display: none;">
                <h3>QR Code du certificat</h3>
                <div id="qrCode"></div>
                <div class="result-box">
                    <strong>✅ Données signées</strong>
                    <p style="margin-top: 5px; font-size: 0.8rem;">Signature: <span id="signature"></span></p>
                </div>
            </div>
        </div>
        
        <!-- SECTION 2: INSTITUTIONS AUTORISÉES -->
        <div class="section">
            <h2>🏛️ Institutions autorisées</h2>
            <div class="institution-list" id="institutionList"></div>
            <button onclick="saveAuthorizedReaders()">💾 Enregistrer</button>
        </div>
        
        <!-- SECTION 3: LECTEUR QR CODE -->
        <div class="section">
            <h2>📱 Application - Scan du QR code</h2>
            
            <div class="form-group">
                <label>Application lectrice :</label>
                <select id="appSelector">
                    <option value="GENLOVE">💘 Genlove</option>
                    <option value="HOPITAL-CENTRAL">🏥 Hôpital Central</option>
                    <option value="SEGURO-SAUD">🛡️ Seguro Saúde</option>
                    <option value="INAC">🆔 INAC</option>
                    <option value="MINSA">🏛️ Ministère Santé</option>
                    <option value="HACKER">⚠️ Non autorisée</option>
                </select>
            </div>
            
            <div id="reader"></div>
            
            <button onclick="startScanner()">📸 Scanner</button>
            <button onclick="stopScanner()">⏹️ Arrêter</button>
            
            <div id="scanResult" class="result-box" style="display: none;"></div>
            <div id="errorResult" class="warning-box" style="display: none;"></div>
            
            <div id="patientForm" style="display: none; margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
                <h3>📋 Formulaire pré-rempli</h3>
                <div class="form-group">
                    <label>Nom :</label>
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
                <div class="badge" style="background:#4caf50; color:white; padding:5px 10px; border-radius:20px; display:inline-block;" id="verifiedBadge">✅ Certifié</div>
            </div>
        </div>
    </div>

    <script>
        // Institutions autorisées
        const authorizedInstitutions = [
            { id: 'GENLOVE', name: 'Genlove', access: ['nom', 'genotype', 'groupe_sanguin'], icon: '💘' },
            { id: 'HOPITAL-CENTRAL', name: 'Hôpital Central', access: ['nom', 'genotype', 'groupe_sanguin', 'date_naissance'], icon: '🏥' },
            { id: 'SEGURO-SAUD', name: 'Seguro Saúde', access: ['nom', 'genotype', 'groupe_sanguin'], icon: '🛡️' },
            { id: 'INAC', name: 'INAC', access: ['nom', 'date_naissance', 'patientId'], icon: '🆔' },
            { id: 'MINSA', name: 'Ministère Santé', access: ['statistiques_anonymes'], icon: '🏛️' }
        ];

        const SECRET_KEY = 'angola-health-ministry-secret-2025';

        // Charger les institutions
        function loadInstitutions() {
            const list = document.getElementById('institutionList');
            list.innerHTML = '';
            authorizedInstitutions.forEach(inst => {
                const div = document.createElement('div');
                div.className = 'institution-item';
                div.innerHTML = \`
                    <input type="checkbox" id="inst_\${inst.id}" value="\${inst.id}" checked>
                    <label for="inst_\${inst.id}">\${inst.icon} \${inst.name}</label>
                \`;
                list.appendChild(div);
            });
        }

        // Récupérer les lecteurs autorisés
        function getAuthorizedReaders() {
            const readers = [];
            document.querySelectorAll('#institutionList input:checked').forEach(cb => {
                readers.push(cb.value);
            });
            return readers;
        }

        // Générer QR code
        function generateQR() {
            const labName = document.getElementById('labName').value;
            const patientName = document.getElementById('patientName').value;
            const patientId = document.getElementById('patientId').value;
            const genotype = document.getElementById('genotype').value;
            const bloodGroup = document.getElementById('bloodGroup').value;
            const dob = document.getElementById('dob').value;
            
            const dataToSign = \`\${labName}|\${patientId}|\${genotype}|\${bloodGroup}|\${dob}\`;
            const signature = CryptoJS.HmacSHA256(dataToSign, SECRET_KEY).toString();
            
            const qrData = {
                version: '1.0',
                issuedBy: labName,
                patientName: patientName,
                patientId: patientId,
                genotype: genotype,
                bloodGroup: bloodGroup,
                dateOfBirth: dob,
                signature: signature,
                authorizedReaders: getAuthorizedReaders()
            };
            
            document.getElementById('signature').innerText = signature.substring(0, 20) + '...';
            document.getElementById('qrContainer').style.display = 'flex';
            
            QRCode.toCanvas(document.createElement('canvas'), JSON.stringify(qrData), { width: 250 }, function(err, canvas) {
                if (err) {
                    console.error(err);
                    return;
                }
                const qrDiv = document.getElementById('qrCode');
                qrDiv.innerHTML = '';
                qrDiv.appendChild(canvas);
            });
        }

        function saveAuthorizedReaders() {
            alert('✅ Liste enregistrée !');
        }

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
                (error) => console.warn(error)
            );
        }

        function stopScanner() {
            if (html5QrCode) html5QrCode.stop();
        }

        function verifyQRData(qrData, appId) {
            const dataToVerify = \`\${qrData.issuedBy}|\${qrData.patientId}|\${qrData.genotype}|\${qrData.bloodGroup}|\${qrData.dateOfBirth}\`;
            const expectedSignature = CryptoJS.HmacSHA256(dataToVerify, SECRET_KEY).toString();
            
            if (qrData.signature !== expectedSignature) {
                showError('❌ SIGNATURE INVALIDE');
                return;
            }
            
            if (!qrData.authorizedReaders || !qrData.authorizedReaders.includes(appId)) {
                showError('⛔ ACCÈS REFUSÉ');
                return;
            }
            
            const institution = authorizedInstitutions.find(i => i.id === appId);
            
            document.getElementById('scanResult').style.display = 'block';
            document.getElementById('errorResult').style.display = 'none';
            
            let displayHTML = '<strong>✅ ACCÈS AUTORISÉ</strong><hr>';
            
            if (institution.access.includes('nom')) {
                displayHTML += \`<p><strong>Nom:</strong> \${qrData.patientName}</p>\`;
            }
            if (institution.access.includes('genotype')) {
                displayHTML += \`<p><strong>Génotype:</strong> \${qrData.genotype}</p>\`;
            }
            if (institution.access.includes('groupe_sanguin')) {
                displayHTML += \`<p><strong>Groupe sanguin:</strong> \${qrData.bloodGroup}</p>\`;
            }
            
            document.getElementById('scanResult').innerHTML = displayHTML;
            
            document.getElementById('patientForm').style.display = 'block';
            document.getElementById('formFullName').value = qrData.patientName;
            document.getElementById('formGenotype').value = qrData.genotype;
            document.getElementById('formBloodGroup').value = qrData.bloodGroup;
        }

        function showError(message) {
            document.getElementById('scanResult').style.display = 'none';
            document.getElementById('errorResult').style.display = 'block';
            document.getElementById('errorResult').innerHTML = \`<strong>⛔ ERREUR</strong><p>\${message}</p>\`;
            document.getElementById('patientForm').style.display = 'none';
        }

        window.onload = loadInstitutions;
    </script>
</body>
</html>`);
});

// Route d'accueil
app.get('/', (req, res) => {
    res.send('<h1>Genlove</h1><p><a href="/qr-test">Tester le QR code</a></p>');
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur sur http://localhost:${port}`);
    console.log(`📱 Test QR: http://localhost:${port}/qr-test`);
});