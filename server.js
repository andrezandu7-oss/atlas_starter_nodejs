const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// PAGE D'ACCUEIL
// ============================================
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Genlove - Accueil</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #fdf2f2;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .app-shell {
            width: 100%;
            max-width: 420px;
            min-height: 100vh;
            background: #f4e9da;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            margin: 0 auto;
        }
        .home-screen {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #fff5f7 0%, #f4e9da 100%);
        }
        .logo-text {
            font-size: 3rem;
            font-weight: 800;
            margin: 10px 0 20px;
        }
        .slogan {
            font-weight: 500;
            color: #1a2a44;
            margin: 10px 25px 30px;
            font-size: 1.2rem;
        }
        .btn-dark, .btn-pink {
            padding: 15px 25px;
            border-radius: 60px;
            font-size: 1.2rem;
            font-weight: 600;
            width: 90%;
            margin: 10px auto;
            display: block;
            text-align: center;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-pink {
            background: #ff416c;
            color: white;
        }
        .btn-dark {
            background: #1a2a44;
            color: white;
        }
        .btn-pink:hover, .btn-dark:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(255,65,108,0.4);
        }
        .nav-links {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .nav-links a {
            color: #666;
            text-decoration: none;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="app-shell">
        <div class="home-screen">
            <div class="logo-text">
                <span style="color:#1a2a44;">Gen</span><span style="color:#FF69B4;">love</span>
            </div>
            <div class="slogan">Unissez cœur et santé pour bâtir des couples sains 💑</div>
            
            <div style="font-size:1.1rem; color:#1a2a44; margin:20px 0 10px;">Avez-vous déjà un compte ?</div>
            <a href="/login" class="btn-dark">Se connecter</a>
            <a href="/signup" class="btn-pink">Créer un compte</a>
            
            <div class="nav-links">
                <a href="/qr-test">📱 Test QR</a>
                <a href="/signup-qr">✨ Inscription QR</a>
            </div>
            
            <div style="margin-top:30px; font-size:0.9rem; color:#666;">🛡️ Vos données de santé sont cryptées</div>
        </div>
    </div>
</body>
</html>`);
});

// ============================================
// PAGE DE TEST QR (l'ancienne)
// ============================================
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
        }
        h1 { text-align: center; margin-bottom: 30px; }
        .section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            margin: 5px;
        }
        #qrCode { text-align: center; margin: 20px 0; }
        #reader { width: 100%; max-width: 400px; margin: 0 auto; }
        .back-link { display: block; text-align: center; margin-top: 20px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
</head>
<body>
    <div class="container">
        <h1>🔐 Test QR Code</h1>
        
        <div class="section">
            <h2>Générateur de QR</h2>
            <button onclick="generateQR('AA','O+')">AA / O+</button>
            <button onclick="generateQR('AS','A+')">AS / A+</button>
            <button onclick="generateQR('SS','B-')">SS / B-</button>
            <div id="qrCode"></div>
        </div>
        
        <div class="section">
            <h2>Scanner</h2>
            <div id="reader"></div>
            <button onclick="startScanner()">Démarrer scan</button>
            <button onclick="stopScanner()">Arrêter</button>
            <div id="result"></div>
        </div>
        
        <a href="/" class="back-link">← Retour</a>
    </div>

    <script>
        let html5QrCode = null;
        
        function generateQR(gt, bg) {
            const qrData = {
                version: '1.0',
                format: 'ANGOLA-HEALTH-2025',
                issuedBy: 'Lab Test',
                patientName: 'João Teste',
                patientId: 'ANG-1990-123456',
                genotype: gt,
                bloodGroup: bg,
                dateOfBirth: '1990-05-15',
                signature: 'test'
            };
            
            QRCode.toCanvas(document.createElement('canvas'), JSON.stringify(qrData), { width: 200 }, function(err, canvas) {
                document.getElementById('qrCode').innerHTML = '';
                document.getElementById('qrCode').appendChild(canvas);
            });
        }
        
        function startScanner() {
            html5QrCode = new Html5Qrcode("reader");
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    document.getElementById('result').innerHTML = '✅ Scan réussi: ' + decodedText;
                    html5QrCode.stop();
                },
                (error) => console.warn(error)
            );
        }
        
        function stopScanner() {
            if (html5QrCode) html5QrCode.stop();
        }
    </script>
</body>
</html>`);
});

// ============================================
// PAGE DE LOGIN (simplifiée)
// ============================================
app.get('/login', (req, res) => {
    res.send(`<h1>Page de connexion</h1><a href="/">Retour</a>`);
});

// ============================================
// PAGE DE PROFIL (simulée)
// ============================================
app.get('/profile-qr', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Profil</title>
    <style>
        body { font-family: Arial; padding: 20px; text-align: center; }
        .success { color: green; font-size: 2rem; margin: 20px; }
    </style>
</head>
<body>
    <div class="success">✅ Compte créé avec succès !</div>
    <p>Redirection vers votre profil...</p>
    <script>setTimeout(() => window.location.href='/', 3000);</script>
</body>
</html>`);
});

// ============================================
// NOUVELLE PAGE D'INSCRIPTION AVEC QR
// ============================================
app.get('/signup', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>Genlove - Inscription QR</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Roboto, sans-serif;
            background: #fdf2f2;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }
        .app-shell {
            width: 100%;
            max-width: 420px;
            min-height: 100vh;
            background: #f4e9da;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
            margin: 0 auto;
        }
        .page-white {
            background: white;
            padding: 25px 20px;
            flex: 1;
        }
        h2 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: #1a2a44;
        }
        .subtitle {
            color: #666;
            margin-bottom: 25px;
            font-size: 1rem;
        }
        
        /* Section QR Scan */
        .qr-scan-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 20px;
            border-radius: 20px;
            margin-bottom: 25px;
            text-align: center;
        }
        .qr-icon {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .qr-scan-section h3 {
            font-size: 1.3rem;
            margin-bottom: 8px;
        }
        .qr-scan-section p {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 15px;
        }
        .btn-scan {
            background: white;
            color: #764ba2;
            border: none;
            padding: 15px 25px;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: bold;
            width: 100%;
            cursor: pointer;
            transition: transform 0.2s;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        .btn-scan:hover {
            transform: translateY(-2px);
        }
        #qr-reader {
            width: 100%;
            max-width: 300px;
            margin: 15px auto;
            border-radius: 15px;
            overflow: hidden;
            display: none;
        }
        .scan-status {
            margin-top: 10px;
            font-size: 0.9rem;
        }
        
        /* Séparateur */
        .separator {
            display: flex;
            align-items: center;
            text-align: center;
            color: #999;
            margin: 20px 0;
        }
        .separator::before,
        .separator::after {
            content: '';
            flex: 1;
            border-bottom: 1px solid #ddd;
        }
        .separator span {
            padding: 0 10px;
        }
        
        /* Formulaire */
        .manual-section h3 {
            color: #1a2a44;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
            font-size: 0.9rem;
        }
        input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            font-size: 1rem;
            background: #f8f9fa;
            transition: border 0.3s;
        }
        input:focus {
            border-color: #ff416c;
            outline: none;
        }
        input[readonly] {
            background: #f0f0f0;
            border-color: #4caf50;
            color: #333;
        }
        .input-hint {
            font-size: 0.8rem;
            color: #666;
            margin-top: 5px;
        }
        .input-hint i {
            color: #4caf50;
        }
        
        /* Bouton */
        .btn-pink {
            background: #ff416c;
            color: white;
            padding: 18px;
            border-radius: 50px;
            font-size: 1.2rem;
            font-weight: bold;
            width: 100%;
            border: none;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
            margin-top: 15px;
        }
        .btn-pink:hover:not(:disabled) {
            background: #ff1a4f;
            transform: translateY(-2px);
        }
        .btn-pink:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
        
        .manual-link {
            text-align: center;
            margin-top: 20px;
        }
        .manual-link a {
            color: #666;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .manual-link a:hover {
            color: #ff416c;
        }
        
        .verified-badge {
            background: #4caf50;
            color: white;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.7rem;
            display: inline-block;
            margin-left: 5px;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #666;
            text-decoration: none;
        }
        
        /* Zone de test */
        .test-qr-section {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 15px;
            margin-top: 30px;
            border: 2px dashed #999;
        }
        .test-qr-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .test-qr-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .test-qr-btn {
            background: white;
            border: 1px solid #ddd;
            padding: 10px 15px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            flex: 1;
        }
        .test-qr-btn:hover {
            background: #667eea;
            color: white;
        }
    </style>
    
    <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Créer mon compte</h2>
            <p class="subtitle">Scannez votre QR code ou saisissez vos informations</p>
            
            <!-- SECTION SCAN QR -->
            <div class="qr-scan-section">
                <div class="qr-icon">📸</div>
                <h3>Vous avez un certificat médical ?</h3>
                <p>Scannez le QR code pour remplir automatiquement vos informations</p>
                
                <div id="qr-reader"></div>
                
                <button class="btn-scan" onclick="startQRScanner()">
                    📱 Scanner mon QR code
                </button>
                
                <div id="scan-status" class="scan-status"></div>
            </div>
            
            <!-- SÉPARATEUR -->
            <div class="separator">
                <span>ou</span>
            </div>
            
            <!-- FORMULAIRE -->
            <div class="manual-section">
                <h3>Remplir manuellement</h3>
                
                <div class="form-group">
                    <label>Nom complet <span class="verified-badge" id="qr-badge" style="display: none;">✅ QR scanné</span></label>
                    <input type="text" id="fullName" placeholder="Votre nom" readonly>
                    <div class="input-hint" id="fullNameHint">🔒 Rempli par QR code</div>
                </div>
                
                <div class="form-group">
                    <label>Génotype</label>
                    <input type="text" id="genotype" placeholder="AA / AS / SS" readonly>
                    <div class="input-hint" id="genotypeHint">🔒 Rempli par QR code</div>
                </div>
                
                <div class="form-group">
                    <label>Groupe sanguin</label>
                    <input type="text" id="bloodGroup" placeholder="Ex: A+, O-..." readonly>
                    <div class="input-hint" id="bloodGroupHint">🔒 Rempli par QR code</div>
                </div>
                
                <div class="form-group">
                    <label>Date de naissance</label>
                    <input type="text" id="dob" placeholder="JJ/MM/AAAA" readonly>
                    <div class="input-hint" id="dobHint">🔒 Rempli par QR code</div>
                </div>
                
                <button id="submitBtn" class="btn-pink" disabled onclick="submitForm()">
                    ✅ Créer mon compte certifié
                </button>
                
                <p class="manual-link">
                    <a href="#" onclick="enableManualEntry()">
                        Je n'ai pas de QR code, saisie manuelle
                    </a>
                </p>
            </div>
            
            <!-- ZONE DE TEST -->
            <div class="test-qr-section">
                <div class="test-qr-title">🧪 Test - Simuler un QR code</div>
                <div class="test-qr-buttons">
                    <button class="test-qr-btn" onclick="simulateQR('AA', 'O+', '1990-05-15')">AA / O+</button>
                    <button class="test-qr-btn" onclick="simulateQR('AS', 'A+', '1992-08-20')">AS / A+</button>
                    <button class="test-qr-btn" onclick="simulateQR('SS', 'B-', '1988-12-10')">SS / B-</button>
                </div>
            </div>
            
            <a href="/" class="back-link">← Retour à l'accueil</a>
        </div>
    </div>

    <script>
        const SECRET_KEY = 'angola-health-ministry-secret-2025';
        let html5QrCode = null;
        let scannedData = null;
        
        function startQRScanner() {
            const readerDiv = document.getElementById('qr-reader');
            readerDiv.style.display = 'block';
            
            html5QrCode = new Html5Qrcode("qr-reader");
            
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    try {
                        const qrData = JSON.parse(decodedText);
                        if (qrData.format === 'ANGOLA-HEALTH-2025') {
                            fillForm(qrData);
                        } else {
                            showStatus('❌ Format invalide', 'error');
                        }
                    } catch(e) {
                        showStatus('❌ QR code invalide', 'error');
                    }
                    html5QrCode.stop();
                    readerDiv.style.display = 'none';
                },
                (error) => console.warn(error)
            );
        }
        
        function simulateQR(genotype, bloodGroup, dob) {
            const mockQR = {
                format: 'ANGOLA-HEALTH-2025',
                patientName: 'João Manuel Silva',
                genotype: genotype,
                bloodGroup: bloodGroup,
                dateOfBirth: dob,
                issuedBy: 'Lab Test',
                patientId: 'ANG-1990-123456'
            };
            fillForm(mockQR);
        }
        
        function fillForm(qrData) {
            document.getElementById('fullName').value = qrData.patientName;
            document.getElementById('genotype').value = qrData.genotype;
            document.getElementById('bloodGroup').value = qrData.bloodGroup;
            document.getElementById('dob').value = formatDate(qrData.dateOfBirth);
            
            document.getElementById('qr-badge').style.display = 'inline-block';
            
            document.getElementById('fullNameHint').innerHTML = '✅ Données vérifiées par QR';
            document.getElementById('genotypeHint').innerHTML = '✅ Données vérifiées par QR';
            document.getElementById('bloodGroupHint').innerHTML = '✅ Données vérifiées par QR';
            document.getElementById('dobHint').innerHTML = '✅ Données vérifiées par QR';
            
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').innerText = '✅ Créer mon compte certifié';
            
            scannedData = qrData;
            showStatus('✅ Scan réussi !', 'success');
        }
        
        function enableManualEntry() {
            document.getElementById('fullName').readOnly = false;
            document.getElementById('genotype').readOnly = false;
            document.getElementById('bloodGroup').readOnly = false;
            document.getElementById('dob').readOnly = false;
            
            document.getElementById('fullName').value = '';
            document.getElementById('genotype').value = '';
            document.getElementById('bloodGroup').value = '';
            document.getElementById('dob').value = '';
            
            document.getElementById('fullNameHint').innerHTML = '📝 Saisie manuelle';
            document.getElementById('genotypeHint').innerHTML = '📝 Saisie manuelle';
            document.getElementById('bloodGroupHint').innerHTML = '📝 Saisie manuelle';
            document.getElementById('dobHint').innerHTML = '📝 Saisie manuelle';
            
            document.getElementById('qr-badge').style.display = 'none';
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').innerText = 'Créer mon compte (non certifié)';
        }
        
        function submitForm() {
            const userData = {
                fullName: document.getElementById('fullName').value,
                genotype: document.getElementById('genotype').value,
                bloodGroup: document.getElementById('bloodGroup').value,
                dob: document.getElementById('dob').value,
                verified: scannedData ? true : false,
                verifiedBy: scannedData ? scannedData.issuedBy : 'manual'
            };
            
            console.log('Données envoyées:', userData);
            localStorage.setItem('genlove_user', JSON.stringify(userData));
            
            alert('✅ Compte créé avec succès !');
            window.location.href = '/profile-qr';
        }
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('scan-status');
            statusDiv.innerHTML = message;
            statusDiv.style.color = type === 'success' ? '#4caf50' : '#ff4444';
        }
        
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR');
        }
    </script>
</body>
</html>`);
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
    console.log(`📱 Page d'accueil: http://localhost:${port}`);
    console.log(`📱 Inscription QR: http://localhost:${port}/signup`);
    console.log(`📱 Test QR: http://localhost:${port}/qr-test`);
});