// Dans app.get('/signup', ...), remplacez la fonction saveAndRedirect par :

function saveAndRedirect(e) {
    e.preventDefault();
    
    const day = document.querySelector('select[name="day"]').value;
    const month = document.querySelector('select[name="month"]').value;
    const year = document.querySelector('select[name="year"]').value;
    
    if (!day || !month || !year) {
        alert('${t('dob')} ${t('required')}');
        return;
    }
    
    const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
    
    // Afficher le loader
    document.getElementById('loader').style.display = 'flex';
    
    // Préparer les données
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        gender: document.getElementById('gender').value,
        dob: dob,
        residence: document.getElementById('residence').value,
        genotype: document.getElementById('genotype').value,
        bloodGroup: document.getElementById('bloodType').value + document.getElementById('bloodRh').value,
        desireChild: document.getElementById('desireChild').value,
        photo: photoBase64 || "",
        language: '${req.lang}'
    };
    
    // Envoyer au serveur
    fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Sauvegarder en local pour le fallback
            localStorage.setItem('userPhoto', photoBase64);
            localStorage.setItem('userFirstName', userData.firstName);
            localStorage.setItem('userLastName', userData.lastName);
            localStorage.setItem('userGender', userData.gender);
            localStorage.setItem('userDob', dob);
            localStorage.setItem('userResidence', userData.residence);
            localStorage.setItem('userGenotype', userData.genotype);
            localStorage.setItem('userBloodGroup', userData.bloodGroup);
            localStorage.setItem('userDesireChild', userData.desireChild);
            
            // Rediriger vers le profil
            setTimeout(() => {
                window.location.href = '/profile';
            }, 2000);
        } else {
            alert("Erreur lors de l'inscription: " + (data.error || "Inconnue"));
            document.getElementById('loader').style.display = 'none';
        }
    })
    .catch(error => {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
        document.getElementById('loader').style.display = 'none';
    });
}