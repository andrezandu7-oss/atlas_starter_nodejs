// ============================================
// PAGE D'INSCRIPTION AVEC QR SCANNER - VERSION CORRIGÉE
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
        
        /* SECTION SCAN QR - STYLE CAMÉRA */
        .qr-scan-section {
            background: #1a2a44;
            color: white;
            padding: 25px 20px;
            border-radius: 30px;
            margin-bottom: 25px;
            text-align: center;
        }
        .qr-icon {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .qr-scan-section h3 {
            font-size: 1.3rem;
            margin-bottom: 5px;
        }
        .qr-scan-section p {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 20px;
        }
        
        /* FENÊTRE DE SCAN (COMME UN APPAREIL PHOTO) */
        .camera-container {
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 100%; /* Ratio 1:1 pour un carré */
            background: #000;
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 15px;
            border: 3px solid white;
            display: none;
        }
        .camera-container.active {
            display: block;
        }
        #qr-reader {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #qr-reader video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* CADRE DE SCAN (EFFET VISUEL) */
        .scan-frame {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70%;
            height: 70%;
            border: 3px solid rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.5);
            pointer-events: none;
        }
        .scan-line {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: #ff416c;
            animation: scan 2s linear infinite;
            box-shadow: 0 0 10px #ff416c;
        }
        @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
        
        /* BOUTONS DE CONTRÔLE CAMÉRA */
        .camera-controls {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        .btn-camera {
            flex: 1;
            padding: 15px;
            border: none;
            border-radius: 30px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn-camera.primary {
            background: #ff416c;
            color: white;
        }
        .btn-camera.secondary {
            background: rgba(255,255,255,0.2);
            color: white;
            backdrop-filter: blur(5px);
        }
        .btn-camera:hover {
            transform: translateY(-2px);
        }
        
        .scan-status {
            margin-top: 10px;
            font-size: 0.9rem;
            min-height: 20px;
            color: #4caf50;
        }
        
        /* SÉPARATEUR */
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
        
        /* FORMULAIRE */
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
        
        /* BOUTON PRINCIPAL */
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
        
        /* ZONE DE TEST */
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
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>Créer mon compte</h2>
            <p class="subtitle">Scannez votre QR code ou saisissez vos informations</p>
            
            <!-- SECTION SCAN QR AVEC INTERFACE CAMÉRA -->
            <div class="qr-scan-section">
                <div class="qr-icon">📸</div>
                <h3>Certificat médical</h3>
                <p>Placez le QR code dans le cadre</p>
                
                <!-- FENÊTRE CAMÉRA -->
                <div class="camera-container" id="cameraContainer">
                    <div id="qr-reader"></div>
                    <div class="scan-frame">
                        <div class="scan-line"></div>
                    </div>
                </div>
                
                <!-- BOUTONS DE CONTRÔLE -->
                <div class="camera-controls">
                    <button class="btn-camera primary" id="startCameraBtn" onclick="startCamera()">
                        📷 Activer la caméra
                    </button>
                    <button class="btn-camera secondary" id="stopCameraBtn" onclick="stopCamera()" style="display: none;">
                        ⏹️ Arrêter
                    </button>
                </div>
                
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
                    <div class="input-hint" id="fullNameHint">🔒 En attente de scan...</div>
                </div>
                
                <div class="form-group">
                    <label>Génotype</label>
                    <input type="text" id="genotype" placeholder="AA / AS / SS" readonly>
                    <div class="input-hint" id="genotypeHint">🔒 En attente de scan...</div>
                </div>
                
                <div class="form-group">
                    <label>Groupe sanguin</label>
                    <input type="text" id="bloodGroup" placeholder="Ex: A+, O-..." readonly>
                    <div class="input-hint" id="bloodGroupHint">🔒 En attente de scan...</div>
                </div>
                
                <div class="form-group">
                    <label>Date de naissance</label>
                    <input type="text" id="dob" placeholder="JJ/MM/AAAA" readonly>
                    <div class="input-hint" id="dobHint">🔒 En attente de scan...</div>
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
                <div class="test-qr-title">🧪 QR codes de test</div>
                <div class="test-qr-buttons">
                    <button class="test-qr-btn" onclick="simulateQR('AA', 'O+', '1990-05-15')">AA / O+</button>
                    <button class="test-qr-btn" onclick="simulateQR('AS', 'A+', '1992-08-20')">AS / A+</button>
                    <button class="test-qr-btn" onclick="simulateQR('SS', 'B-', '1988-12-10')">SS / B-</button>
                </div>
                <p style="font-size:0.8rem; margin-top:10px;">👉 Allez sur <a href="/qr-generator" target="_blank" style="color:#ff416c;">/qr-generator</a> pour créer vos QR codes</p>
            </div>
            
            <a href="/" class="back-link">← Retour à l'accueil</a>
        </div>
    </div>

    <script>
        let html5QrCode = null;
        let scannerActive = false;
        
        function startCamera() {
            const cameraContainer = document.getElementById('cameraContainer');
            const startBtn = document.getElementById('startCameraBtn');
            const stopBtn = document.getElementById('stopCameraBtn');
            
            cameraContainer.classList.add('active');
            cameraContainer.style.display = 'block';
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            
            html5QrCode = new Html5Qrcode("qr-reader");
            
            const qrCodeSuccessCallback = (decodedText, decodedResult) => {
                try {
                    const qrData = JSON.parse(decodedText);
                    
                    if (qrData.patientName && qrData.genotype && qrData.bloodGroup) {
                        fillForm(qrData);
                        stopCamera();
                    } else {
                        showStatus('❌ Format de QR code invalide', 'error');
                    }
                } catch(e) {
                    showStatus('❌ QR code invalide', 'error');
                }
            };
            
            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };
            
            html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback,
                (errorMessage) => {
                    // Ignorer les erreurs de scan
                }
            ).then(() => {
                scannerActive = true;
                showStatus('📸 Caméra active - placez un QR code dans le cadre', 'info');
            }).catch((err) => {
                showStatus('❌ Erreur caméra: ' + err, 'error');
                stopCamera();
            });
        }
        
        function stopCamera() {
            const cameraContainer = document.getElementById('cameraContainer');
            const startBtn = document.getElementById('startCameraBtn');
            const stopBtn = document.getElementById('stopCameraBtn');
            
            if (html5QrCode && scannerActive) {
                html5QrCode.stop().then(() => {
                    scannerActive = false;
                    cameraContainer.classList.remove('active');
                    cameraContainer.style.display = 'none';
                    startBtn.style.display = 'block';
                    stopBtn.style.display = 'none';
                    showStatus('', 'info');
                }).catch((err) => {
                    console.warn(err);
                });
            } else {
                cameraContainer.classList.remove('active');
                cameraContainer.style.display = 'none';
                startBtn.style.display = 'block';
                stopBtn.style.display = 'none';
            }
        }
        
        function simulateQR(genotype, bloodGroup, dob) {
            const mockQR = {
                patientName: 'João Manuel Silva',
                genotype: genotype,
                bloodGroup: bloodGroup,
                dateOfBirth: dob,
                issuedBy: 'Laboratorio Central',
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
            
            document.getElementById('fullNameHint').innerHTML = '✅ Données vérifiées par QR code';
            document.getElementById('genotypeHint').innerHTML = '✅ Données vérifiées par QR code';
            document.getElementById('bloodGroupHint').innerHTML = '✅ Données vérifiées par QR code';
            document.getElementById('dobHint').innerHTML = '✅ Données vérifiées par QR code';
            
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').innerText = '✅ Créer mon compte certifié';
            
            showStatus('✅ Scan réussi ! Données chargées', 'success');
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
                verified: document.getElementById('qr-badge').style.display === 'inline-block'
            };
            
            if (!userData.fullName || !userData.genotype || !userData.bloodGroup || !userData.dob) {
                alert('❌ Veuillez remplir tous les champs');
                return;
            }
            
            console.log('Données envoyées:', userData);
            localStorage.setItem('genlove_user', JSON.stringify(userData));
            
            alert('✅ Compte créé avec succès !');
            window.location.href = '/profile';
        }
        
        function showStatus(message, type) {
            const statusDiv = document.getElementById('scan-status');
            statusDiv.innerHTML = message;
            if (type === 'success') statusDiv.style.color = '#4caf50';
            else if (type === 'error') statusDiv.style.color = '#ff4444';
            else statusDiv.style.color = '#fff';
        }
        
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('fr-FR');
        }
    </script>
</body>
</html>`);
});