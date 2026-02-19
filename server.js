const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;

// ============================================
// CONNEXION MONGODB
// ============================================
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// ============================================
// CONFIGURATION SESSION
// ============================================
app.set('trust proxy', 1);

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: mongoURI,
        touchAfter: 24 * 3600
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    },
    proxy: true
};

app.use(session(sessionConfig));

// ============================================
// MODÈLES DE DONNÉES
// ============================================
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: String,
    dob: String,
    residence: String,
    genotype: { type: String, enum: ['AA', 'AS', 'SS'] },
    bloodGroup: String,
    desireChild: String,
    photo: String,
    language: { type: String, default: 'fr' },
    isVerified: { type: Boolean, default: false },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

userSchema.index({ genotype: 1 });
const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

messageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 });
const Message = mongoose.model('Message', messageSchema);

// NOUVEAU MODÈLE POUR LES DEMANDES DE PREMIER CONTACT
const requestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

requestSchema.index({ receiverId: 1, status: 1 });
const Request = mongoose.model('Request', requestSchema);

// ============================================
// SYSTÈME DE TRADUCTION MULTILINGUE
// ============================================
const translations = {
    fr: {
        appName: 'Genlove',
        slogan: 'Unissez cœur et santé pour bâtir des couples sains 💑',
        security: '🛡️ Vos données de santé sont cryptées',
        welcome: 'Bienvenue sur Genlove',
        haveAccount: 'Avez-vous déjà un compte ?',
        login: 'Se connecter',
        createAccount: 'Créer un compte',
        loginTitle: 'Connexion',
        enterName: 'Entrez votre prénom pour vous connecter',
        yourName: 'Votre prénom',
        backHome: 'Retour à l\'accueil',
        nameNotFound: 'Prénom non trouvé. Veuillez créer un compte.',
        charterTitle: '📜 La Charte d\'Honneur',
        charterSubtitle: 'Lisez attentivement ces 5 engagements',
        scrollDown: '⬇️ Faites défiler jusqu\'en bas ⬇️',
        accept: 'J\'accepte et je continue',
        
        oath1: '1. Le Serment de Sincérité',
        oath1Sub: 'Vérité Médicale',
        oath1Text: 'Je m\'engage sur l\'honneur à fournir des informations exactes concernant mon génotype et mes données de santé.',
        oath2: '2. Le Pacte de Confidentialité',
        oath2Sub: 'Secret Partagé',
        oath2Text: 'Je m\'engage à garder confidentielles toutes les informations personnelles et médicales.',
        oath3: '3. Le Principe de Non-Discrimination',
        oath3Sub: 'Égalité de Respect',
        oath3Text: 'Je traite chaque membre avec dignité, quel que soit son génotype.',
        oath4: '4. La Responsabilité Préventive',
        oath4Sub: 'Orientation Santé',
        oath4Text: 'J\'accepte les mesures de protection comme le filtrage des compatibilités à risque.',
        oath5: '5. La Bienveillance Éthique',
        oath5Sub: 'Courtoisie',
        oath5Text: 'J\'adopte une conduite exemplaire et respectueuse dans mes messages.',
        
        signupTitle: 'Créer mon profil',
        signupSub: 'Toutes les informations sont confidentielles',
        firstName: 'Prénom',
        lastName: 'Nom',
        gender: 'Genre',
        male: 'Homme',
        female: 'Femme',
        dob: 'Date de naissance',
        dobPlaceholder: 'jj/mm/aaaa',
        city: 'Ville de résidence',
        genotype: 'Génotype',
        bloodGroup: 'Groupe sanguin',
        desireChild: 'Désir d\'enfant ?',
        yes: 'Oui',
        no: 'Non',
        createProfile: 'Créer mon profil',
        backCharter: '← Retour à la charte',
        required: 'obligatoire',
        
        honorTitle: 'Serment d\'Honneur',
        honorText: '"Je confirme sur mon honneur que mes informations sont sincères et conformes à la réalité."',
        swear: 'Je le jure',
        accessProfile: 'Accéder à mon profil',
        
        myProfile: 'Mon Profil',
        home: 'Accueil',
        messages: 'Messages',
        settings: 'Paramètres',
        genotype_label: 'Génotype',
        blood_label: 'Groupe',
        age_label: 'Âge',
        project_label: 'Projet',
        findPartner: '🔍 Trouver un partenaire',
        editProfile: '✏️ Modifier mon profil',
        
        compatiblePartners: 'Partenaires compatibles',
        noPartners: 'Aucun partenaire trouvé pour le moment',
        searchOngoing: 'Recherche en cours...',
        expandCommunity: 'Nous élargissons notre communauté. Revenez bientôt !',
        details: 'Détails',
        contact: 'Contacter',
        backProfile: '← Mon profil',
        toMessages: 'Messages →',
        
        healthCommitment: '🛡️ Votre engagement santé',
        popupMessageAS: '"En tant que profil AS, nous ne vous présentons que des partenaires AA.<br><br>Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose. Construisons ensemble un amour sain et durable. 💑"',
        popupMessageSS: '"En tant que profil SS, nous ne vous présentons que des partenaires AA.<br><br>Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose. Construisons ensemble un amour sain et durable. 💑"',
        understood: 'J\'ai compris',
        
        inboxTitle: 'Boîte de réception',
        emptyInbox: '📭 Boîte vide',
        startConversation: 'Commencez une conversation !',
        findPartners: 'Trouver des partenaires',
        
        block: '🚫 Bloquer',
        yourMessage: 'Votre message...',
        send: 'Envoyer',
        blockedByUser: '⛔ Conversation impossible',
        blockedMessage: 'Cet utilisateur vous a bloqué. Vous ne pouvez pas lui envoyer de messages.',
        
        settingsTitle: 'Paramètres',
        visibility: 'Visibilité du profil',
        notifications: 'Notifications push',
        language: 'Langue',
        blockedUsers: 'Utilisateurs bloqués',
        dangerZone: '⚠️ ZONE DE DANGER',
        deleteAccount: '🗑️ Supprimer mon compte',
        delete: 'Supprimer',
        logout: 'Déconnexion',
        confirmDelete: 'Supprimer définitivement ?',
        
        noBlocked: 'Aucun utilisateur bloqué',
        unblock: 'Débloquer',
        
        thankYou: 'Merci pour cet échange',
        thanksMessage: 'Genlove vous remercie',
        newSearch: 'Nouvelle recherche',
        
        logoutSuccess: 'Déconnexion réussie',
        seeYouSoon: 'À bientôt !',
        
        french: 'Français',
        english: 'English',
        portuguese: 'Português',
        spanish: 'Español',
        arabic: 'العربية',
        chinese: '中文',
        
        pageNotFound: 'Page non trouvée',
        pageNotFoundMessage: 'La page que vous cherchez n\'existe pas.',
        
        residence_label: 'Résidence',
        project_life: 'Projet de vie',
        
        // Messages pour les demandes
        newRequest: '📬 Nouvelle demande',
        interested: 's\'intéresse à votre profil.',
        whatToDo: '❓ Que souhaitez-vous faire ?',
        openChat: '✅ Ouvrir la discussion',
        ignore: '🌿 Ignorer',
        willBeInformed: 'ℹ️ {name} sera informé(e) de votre choix.',
        requestAccepted: '✅ Votre demande a été acceptée ! Vous pouvez maintenant échanger avec cette personne.',
        requestRejected: '🌸 Merci pour votre message. Cette personne préfère ne pas donner suite pour le moment. Continuez votre chemin, la bonne personne vous attend ailleurs.',
        day: 'Jour',
        month: 'Mois',
        year: 'Année',
        january: 'Janvier',
        february: 'Février',
        march: 'Mars',
        april: 'Avril',
        may: 'Mai',
        june: 'Juin',
        july: 'Juillet',
        august: 'Août',
        september: 'Septembre',
        october: 'Octobre',
        november: 'Novembre',
        december: 'Décembre'
    },
    
    en: {
        appName: 'Genlove',
        slogan: 'Unite heart and health to build healthy couples 💑',
        security: '🛡️ Your health data is encrypted',
        welcome: 'Welcome to Genlove',
        haveAccount: 'Already have an account?',
        login: 'Login',
        createAccount: 'Create account',
        loginTitle: 'Login',
        enterName: 'Enter your first name to login',
        yourName: 'Your first name',
        backHome: '← Back to home',
        nameNotFound: 'Name not found. Please create an account.',
        charterTitle: '📜 The Honor Charter',
        charterSubtitle: 'Read these 5 commitments carefully',
        scrollDown: '⬇️ Scroll to the bottom ⬇️',
        accept: 'I accept and continue',
        
        oath1: '1. The Oath of Sincerity',
        oath1Sub: 'Medical Truth',
        oath1Text: 'I pledge on my honor to provide accurate information about my genotype and health data.',
        oath2: '2. The Pact of Confidentiality',
        oath2Sub: 'Shared Secret',
        oath2Text: 'I commit to keeping all personal and medical information confidential.',
        oath3: '3. The Principle of Non-Discrimination',
        oath3Sub: 'Equality of Respect',
        oath3Text: 'I treat every member with dignity, regardless of their genotype.',
        oath4: '4. Preventive Responsibility',
        oath4Sub: 'Health Orientation',
        oath4Text: 'I accept protective measures such as filtering risky compatibilities.',
        oath5: '5. Ethical Benevolence',
        oath5Sub: 'Courtesy',
        oath5Text: 'I adopt exemplary and respectful conduct in my messages.',
        
        signupTitle: 'Create my profile',
        signupSub: 'All information is confidential',
        firstName: 'First name',
        lastName: 'Last name',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        dob: 'Date of birth',
        dobPlaceholder: 'dd/mm/yyyy',
        city: 'City of residence',
        genotype: 'Genotype',
        bloodGroup: 'Blood group',
        desireChild: 'Desire for children?',
        yes: 'Yes',
        no: 'No',
        createProfile: 'Create my profile',
        backCharter: '← Back to charter',
        required: 'required',
        
        honorTitle: 'Oath of Honor',
        honorText: '"I confirm on my honor that my information is sincere and conforms to reality."',
        swear: 'I swear',
        accessProfile: 'Access my profile',
        
        myProfile: 'My Profile',
        home: 'Home',
        messages: 'Messages',
        settings: 'Settings',
        genotype_label: 'Genotype',
        blood_label: 'Blood',
        age_label: 'Age',
        project_label: 'Project',
        findPartner: '🔍 Find a partner',
        editProfile: '✏️ Edit my profile',
        
        compatiblePartners: 'Compatible partners',
        noPartners: 'No partners found at the moment',
        searchOngoing: 'Search in progress...',
        expandCommunity: 'We are expanding our community. Come back soon!',
        details: 'Details',
        contact: 'Contact',
        backProfile: '← My profile',
        toMessages: 'Messages →',
        
        healthCommitment: '🛡️ Your health commitment',
        popupMessageAS: '"As an AS profile, we only show you AA partners.<br><br>This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease. Let\'s build a healthy and lasting love together. 💑"',
        popupMessageSS: '"As an SS profile, we only show you AA partners.<br><br>This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease. Let\'s build a healthy and lasting love together. 💑"',
        understood: 'I understand',
        
        inboxTitle: 'Inbox',
        emptyInbox: '📭 Empty inbox',
        startConversation: 'Start a conversation!',
        findPartners: 'Find partners',
        
        block: '🚫 Block',
        yourMessage: 'Your message...',
        send: 'Send',
        blockedByUser: '⛔ Conversation impossible',
        blockedMessage: 'This user has blocked you. You cannot send them messages.',
        
        settingsTitle: 'Settings',
        visibility: 'Profile visibility',
        notifications: 'Push notifications',
        language: 'Language',
        blockedUsers: 'Blocked users',
        dangerZone: '⚠️ DANGER ZONE',
        deleteAccount: '🗑️ Delete my account',
        delete: 'Delete',
        logout: 'Logout',
        confirmDelete: 'Delete permanently?',
        
        noBlocked: 'No blocked users',
        unblock: 'Unblock',
        
        thankYou: 'Thank you for this exchange',
        thanksMessage: 'Genlove thanks you',
        newSearch: 'New search',
        
        logoutSuccess: 'Logout successful',
        seeYouSoon: 'See you soon!',
        
        french: 'French',
        english: 'English',
        portuguese: 'Portuguese',
        spanish: 'Spanish',
        arabic: 'Arabic',
        chinese: 'Chinese',
        
        pageNotFound: 'Page not found',
        pageNotFoundMessage: 'The page you are looking for does not exist.',
        
        residence_label: 'Residence',
        project_life: 'Life project',
        
        newRequest: '📬 New request',
        interested: 'is interested in your profile.',
        whatToDo: '❓ What would you like to do?',
        openChat: '✅ Open chat',
        ignore: '🌿 Ignore',
        willBeInformed: 'ℹ️ {name} will be informed of your choice.',
        requestAccepted: '✅ Your request has been accepted! You can now chat with this person.',
        requestRejected: '🌸 Thank you for your message. This person prefers not to respond at this time. Continue your journey, the right person is waiting for you elsewhere.',
        day: 'Day',
        month: 'Month',
        year: 'Year',
        january: 'January',
        february: 'February',
        march: 'March',
        april: 'April',
        may: 'May',
        june: 'June',
        july: 'July',
        august: 'August',
        september: 'September',
        october: 'October',
        november: 'November',
        december: 'December'
    },
    
    pt: {
        appName: 'Genlove',
        slogan: 'Una coração e saúde para construir casais saudáveis 💑',
        security: '🛡️ Seus dados de saúde estão criptografados',
        welcome: 'Bem-vindo ao Genlove',
        haveAccount: 'Já tem uma conta?',
        login: 'Entrar',
        createAccount: 'Criar conta',
        loginTitle: 'Entrar',
        enterName: 'Digite seu primeiro nome para entrar',
        yourName: 'Seu primeiro nome',
        backHome: '← Voltar ao início',
        nameNotFound: 'Nome não encontrado. Por favor, crie uma conta.',
        charterTitle: '📜 A Carta de Honra',
        charterSubtitle: 'Leia estes 5 compromissos atentamente',
        scrollDown: '⬇️ Role até o final ⬇️',
        accept: 'Aceito e continuo',
        
        oath1: '1. O Juramento de Sinceridade',
        oath1Sub: 'Verdade Médica',
        oath1Text: 'Comprometo-me, sob minha honra, a fornecer informações precisas sobre meu genótipo e dados de saúde.',
        oath2: '2. O Pacto de Confidencialidade',
        oath2Sub: 'Segredo Compartilhado',
        oath2Text: 'Comprometo-me a manter todas as informações pessoais e médicas confidenciais.',
        oath3: '3. O Princípio da Não-Discriminação',
        oath3Sub: 'Igualdade de Respeito',
        oath3Text: 'Trato cada membro com dignidade, independentemente do seu genótipo.',
        oath4: '4. Responsabilidade Preventiva',
        oath4Sub: 'Orientação para a Saúde',
        oath4Text: 'Aceito medidas de proteção como a filtragem de compatibilidades de risco.',
        oath5: '5. Benevolência Ética',
        oath5Sub: 'Cortesia',
        oath5Text: 'Adoto uma conduta exemplar e respeitosa em minhas mensagens.',
        
        signupTitle: 'Criar meu perfil',
        signupSub: 'Todas as informações são confidenciais',
        firstName: 'Primeiro nome',
        lastName: 'Sobrenome',
        gender: 'Gênero',
        male: 'Homem',
        female: 'Mulher',
        dob: 'Data de nascimento',
        dobPlaceholder: 'dd/mm/aaaa',
        city: 'Cidade de residência',
        genotype: 'Genótipo',
        bloodGroup: 'Grupo sanguíneo',
        desireChild: 'Desejo de ter filhos?',
        yes: 'Sim',
        no: 'Não',
        createProfile: 'Criar meu perfil',
        backCharter: '← Voltar à carta',
        required: 'obrigatório',
        
        honorTitle: 'Juramento de Honra',
        honorText: '"Confirmo por minha honra que minhas informações são sinceras e conformes à realidade."',
        swear: 'Eu juro',
        accessProfile: 'Acessar meu perfil',
        
        myProfile: 'Meu Perfil',
        home: 'Início',
        messages: 'Mensagens',
        settings: 'Configurações',
        genotype_label: 'Genótipo',
        blood_label: 'Grupo',
        age_label: 'Idade',
        project_label: 'Projeto',
        findPartner: '🔍 Encontrar parceiro(a)',
        editProfile: '✏️ Editar perfil',
        
        compatiblePartners: 'Parceiros compatíveis',
        noPartners: 'Nenhum parceiro encontrado no momento',
        searchOngoing: 'Pesquisa em andamento...',
        expandCommunity: 'Estamos expandindo nossa comunidade. Volte em breve!',
        details: 'Detalhes',
        contact: 'Contatar',
        backProfile: '← Meu perfil',
        toMessages: 'Mensagens →',
        
        healthCommitment: '🛡️ Seu compromisso com a saúde',
        popupMessageAS: '"Como perfil AS, mostramos apenas parceiros AA.<br><br>Esta escolha responsável garante a serenidade do seu futuro lar e protege seus descendentes contra a doença falciforme. Vamos construir juntos um amor saudável e duradouro. 💑"',
        popupMessageSS: '"Como perfil SS, mostramos apenas parceiros AA.<br><br>Esta escolha responsável garante a serenidade do seu futuro lar e protege seus descendentes contra a doença falciforme. Vamos construir juntos um amor saudável e duradouro. 💑"',
        understood: 'Entendi',
        
        inboxTitle: 'Caixa de entrada',
        emptyInbox: '📭 Caixa vazia',
        startConversation: 'Comece uma conversa!',
        findPartners: 'Encontrar parceiros',
        
        block: '🚫 Bloquear',
        yourMessage: 'Sua mensagem...',
        send: 'Enviar',
        blockedByUser: '⛔ Conversa impossível',
        blockedMessage: 'Este usuário bloqueou você. Não é possível enviar mensagens.',
        
        settingsTitle: 'Configurações',
        visibility: 'Visibilidade do perfil',
        notifications: 'Notificações push',
        language: 'Idioma',
        blockedUsers: 'Usuários bloqueados',
        dangerZone: '⚠️ ZONA DE PERIGO',
        deleteAccount: '🗑️ Excluir minha conta',
        delete: 'Excluir',
        logout: 'Sair',
        confirmDelete: 'Excluir permanentemente?',
        
        noBlocked: 'Nenhum usuário bloqueado',
        unblock: 'Desbloquear',
        
        thankYou: 'Obrigado por este encontro',
        thanksMessage: 'Genlove agradece',
        newSearch: 'Nova pesquisa',
        
        logoutSuccess: 'Saída bem-sucedida',
        seeYouSoon: 'Até breve!',
        
        french: 'Francês',
        english: 'Inglês',
        portuguese: 'Português',
        spanish: 'Espanhol',
        arabic: 'Árabe',
        chinese: 'Chinês',
        
        pageNotFound: 'Página não encontrada',
        pageNotFoundMessage: 'A página que você procura não existe.',
        
        residence_label: 'Residência',
        project_life: 'Projeto de vida',
        
        newRequest: '📬 Nova solicitação',
        interested: 'está interessado(a) no seu perfil.',
        whatToDo: '❓ O que você deseja fazer?',
        openChat: '✅ Abrir chat',
        ignore: '🌿 Ignorar',
        willBeInformed: 'ℹ️ {name} será informado(a) da sua escolha.',
        requestAccepted: '✅ Sua solicitação foi aceita! Agora você pode conversar com esta pessoa.',
        requestRejected: '🌸 Obrigado pela sua mensagem. Esta pessoa prefere não responder no momento. Continue seu caminho, a pessoa certa está esperando por você em outro lugar.',
        day: 'Dia',
        month: 'Mês',
        year: 'Ano',
        january: 'Janeiro',
        february: 'Fevereiro',
        march: 'Março',
        april: 'Abril',
        may: 'Maio',
        june: 'Junho',
        july: 'Julho',
        august: 'Agosto',
        september: 'Setembro',
        october: 'Outubro',
        november: 'Novembro',
        december: 'Dezembro'
    },
    
    es: {
        appName: 'Genlove',
        slogan: 'Une corazón y salud para construir parejas saludables 💑',
        security: '🛡️ Sus datos de salud están encriptados',
        welcome: 'Bienvenido a Genlove',
        haveAccount: '¿Ya tienes una cuenta?',
        login: 'Iniciar sesión',
        createAccount: 'Crear cuenta',
        loginTitle: 'Iniciar sesión',
        enterName: 'Ingrese su nombre para iniciar sesión',
        yourName: 'Su nombre',
        backHome: '← Volver al inicio',
        nameNotFound: 'Nombre no encontrado. Por favor, cree una cuenta.',
        charterTitle: '📜 La Carta de Honor',
        charterSubtitle: 'Lea estos 5 compromisos atentamente',
        scrollDown: '⬇️ Desplácese hasta el final ⬇️',
        accept: 'Acepto y continúo',
        
        oath1: '1. El Juramento de Sinceridad',
        oath1Sub: 'Verdad Médica',
        oath1Text: 'Me comprometo bajo mi honor a proporcionar información precisa sobre mi genotipo y datos de salud.',
        oath2: '2. El Pacto de Confidencialidad',
        oath2Sub: 'Secreto Compartido',
        oath2Text: 'Me comprometo a mantener toda la información personal y médica confidencial.',
        oath3: '3. El Principio de No Discriminación',
        oath3Sub: 'Igualdad de Respeto',
        oath3Text: 'Trato a cada miembro con dignidad, independientemente de su genotipo.',
        oath4: '4. Responsabilidad Preventiva',
        oath4Sub: 'Orientación para la Salud',
        oath4Text: 'Acepto medidas de protección como el filtrado de compatibilidades de riesgo.',
        oath5: '5. Benevolencia Ética',
        oath5Sub: 'Cortesía',
        oath5Text: 'Adopto una conducta ejemplar y respetuosa en mis mensajes.',
        
        signupTitle: 'Crear mi perfil',
        signupSub: 'Toda la información es confidencial',
        firstName: 'Nombre',
        lastName: 'Apellido',
        gender: 'Género',
        male: 'Hombre',
        female: 'Mujer',
        dob: 'Fecha de nacimiento',
        dobPlaceholder: 'dd/mm/aaaa',
        city: 'Ciudad de residencia',
        genotype: 'Genotipo',
        bloodGroup: 'Grupo sanguíneo',
        desireChild: '¿Deseo de tener hijos?',
        yes: 'Sí',
        no: 'No',
        createProfile: 'Crear mi perfil',
        backCharter: '← Volver a la carta',
        required: 'obligatorio',
        
        honorTitle: 'Juramento de Honor',
        honorText: '"Confirmo bajo mi honor que mi información es sincera y conforme a la realidad."',
        swear: 'Lo juro',
        accessProfile: 'Acceder a mi perfil',
        
        myProfile: 'Mi Perfil',
        home: 'Inicio',
        messages: 'Mensajes',
        settings: 'Configuración',
        genotype_label: 'Genotipo',
        blood_label: 'Grupo',
        age_label: 'Edad',
        project_label: 'Proyecto',
        findPartner: '🔍 Encontrar pareja',
        editProfile: '✏️ Editar perfil',
        
        compatiblePartners: 'Parejas compatibles',
        noPartners: 'No se encontraron parejas por el momento',
        searchOngoing: 'Búsqueda en curso...',
        expandCommunity: 'Estamos expandiendo nuestra comunidad. ¡Vuelva pronto!',
        details: 'Detalles',
        contact: 'Contactar',
        backProfile: '← Mi perfil',
        toMessages: 'Mensajes →',
        
        healthCommitment: '🛡️ Su compromiso con la salud',
        popupMessageAS: '"Como perfil AS, solo le mostramos parejas AA.<br><br>Esta elección responsable garantiza la serenidad de su futuro hogar y protege a su descendencia contra la enfermedad de células falciformes. Construyamos juntos un amor saludable y duradero. 💑"',
        popupMessageSS: '"Como perfil SS, solo le mostramos parejas AA.<br><br>Esta elección responsable garantiza la serenidad de su futuro hogar y protege a su descendencia contra la enfermedad de células falciformes. Construyamos juntos un amor saludable y duradero. 💑"',
        understood: 'Entiendo',
        
        inboxTitle: 'Bandeja de entrada',
        emptyInbox: '📭 Bandeja vacía',
        startConversation: '¡Comience una conversación!',
        findPartners: 'Encontrar parejas',
        
        block: '🚫 Bloquear',
        yourMessage: 'Su mensaje...',
        send: 'Enviar',
        blockedByUser: '⛔ Conversación imposible',
        blockedMessage: 'Este usuario le ha bloqueado. No puede enviarle mensajes.',
        
        settingsTitle: 'Configuración',
        visibility: 'Visibilidad del perfil',
        notifications: 'Notificaciones push',
        language: 'Idioma',
        blockedUsers: 'Usuarios bloqueados',
        dangerZone: '⚠️ ZONA DE PELIGRO',
        deleteAccount: '🗑️ Eliminar mi cuenta',
        delete: 'Eliminar',
        logout: 'Cerrar sesión',
        confirmDelete: '¿Eliminar permanentemente?',
        
        noBlocked: 'No hay usuarios bloqueados',
        unblock: 'Desbloquear',
        
        thankYou: 'Gracias por este intercambio',
        thanksMessage: 'Genlove le agradece',
        newSearch: 'Nueva búsqueda',
        
        logoutSuccess: 'Sesión cerrada',
        seeYouSoon: '¡Hasta pronto!',
        
        french: 'Francés',
        english: 'Inglés',
        portuguese: 'Portugués',
        spanish: 'Español',
        arabic: 'Árabe',
        chinese: 'Chino',
        
        pageNotFound: 'Página no encontrada',
        pageNotFoundMessage: 'La página que busca no existe.',
        
        residence_label: 'Residencia',
        project_life: 'Proyecto de vida',
        
        newRequest: '📬 Nueva solicitud',
        interested: 'está interesado(a) en tu perfil.',
        whatToDo: '❓ ¿Qué deseas hacer?',
        openChat: '✅ Abrir chat',
        ignore: '🌿 Ignorar',
        willBeInformed: 'ℹ️ {name} será informado(a) de tu elección.',
        requestAccepted: '✅ ¡Tu solicitud ha sido aceptada! Ahora puedes conversar con esta persona.',
        requestRejected: '🌸 Gracias por tu mensaje. Esta persona prefiere no responder por ahora. Continúa tu camino, la persona adecuada te espera en otro lugar.',
        day: 'Día',
        month: 'Mes',
        year: 'Año',
        january: 'Enero',
        february: 'Febrero',
        march: 'Marzo',
        april: 'Abril',
        may: 'Mayo',
        june: 'Junio',
        july: 'Julio',
        august: 'Agosto',
        september: 'Septiembre',
        october: 'Octubre',
        november: 'Noviembre',
        december: 'Diciembre'
    },
    
    ar: {
        appName: 'Genlove',
        slogan: 'وحدوا القلب والصحة لبناء أزواج أصحاء 💑',
        security: '🛡️ بياناتك الصحية مشفرة',
        welcome: 'مرحبًا بكم في Genlove',
        haveAccount: 'هل لديك حساب بالفعل؟',
        login: 'تسجيل الدخول',
        createAccount: 'إنشاء حساب',
        loginTitle: 'تسجيل الدخول',
        enterName: 'أدخل اسمك الأول لتسجيل الدخول',
        yourName: 'اسمك الأول',
        backHome: '← العودة إلى الرئيسية',
        nameNotFound: 'الاسم غير موجود. يرجى إنشاء حساب.',
        charterTitle: '📜 ميثاق الشرف',
        charterSubtitle: 'اقرأ هذه الالتزامات الخمسة بعناية',
        scrollDown: '⬇️ انتقل إلى الأسفل ⬇️',
        accept: 'أوافق وأواصل',
        
        oath1: '١. قسم الإخلاص',
        oath1Sub: 'الحقيقة الطبية',
        oath1Text: 'أتعهد بشرفي بتقديم معلومات دقيقة عن نمطي الوراثي وبياناتي الصحية.',
        oath2: '٢. ميثاق السرية',
        oath2Sub: 'السر المشترك',
        oath2Text: 'أتعهد بالحفاظ على سرية جميع المعلومات الشخصية والطبية.',
        oath3: '٣. مبدأ عدم التمييز',
        oath3Sub: 'المساواة في الاحترام',
        oath3Text: 'أعامل كل عضو بكرامة، بغض النظر عن نمطه الوراثي.',
        oath4: '٤. المسؤولية الوقائية',
        oath4Sub: 'التوجيه الصحي',
        oath4Text: 'أقبل التدابير الوقائية مثل تصفية التوافقات الخطرة.',
        oath5: '٥. الإحسان الأخلاقي',
        oath5Sub: 'المجاملة',
        oath5Text: 'أتبنى سلوكًا مثاليًا ومحترمًا في رسائلي.',
        
        signupTitle: 'إنشاء ملفي الشخصي',
        signupSub: 'جميع المعلومات سرية',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        gender: 'الجنس',
        male: 'ذكر',
        female: 'أنثى',
        dob: 'تاريخ الميلاد',
        dobPlaceholder: 'yyyy/mm/dd',
        city: 'مدينة الإقامة',
        genotype: 'النمط الوراثي',
        bloodGroup: 'فصيلة الدم',
        desireChild: 'الرغبة في الأطفال؟',
        yes: 'نعم',
        no: 'لا',
        createProfile: 'إنشاء ملفي الشخصي',
        backCharter: '← العودة إلى الميثاق',
        required: 'إلزامي',
        
        honorTitle: 'قسم الشرف',
        honorText: '"أؤكد بشرفي أن معلوماتي صادقة ومطابقة للواقع."',
        swear: 'أقسم',
        accessProfile: 'الوصول إلى ملفي الشخصي',
        
        myProfile: 'ملفي الشخصي',
        home: 'الرئيسية',
        messages: 'الرسائل',
        settings: 'الإعدادات',
        genotype_label: 'النمط الوراثي',
        blood_label: 'الفصيلة',
        age_label: 'العمر',
        project_label: 'المشروع',
        findPartner: '🔍 العثور على شريك',
        editProfile: '✏️ تعديل الملف الشخصي',
        
        compatiblePartners: 'الشركاء المتوافقون',
        noPartners: 'لم يتم العثور على شركاء في الوقت الحالي',
        searchOngoing: 'البحث جار...',
        expandCommunity: 'نحن نوسع مجتمعنا. عد قريبًا!',
        details: 'التفاصيل',
        contact: 'اتصال',
        backProfile: '← ملفي الشخصي',
        toMessages: 'الرسائل →',
        
        healthCommitment: '🛡️ التزامك الصحي',
        popupMessageAS: '"كملف AS، نعرض لك فقط شركاء AA.<br><br>هذا الاختيار المسؤول يضمن serenity منزلك المستقبلي ويحمي نسلك من مرض الخلايا المنجلية. دعونا نبني معًا حبًا صحيًا ودائمًا. 💑"',
        popupMessageSS: '"كملف SS، نعرض لك فقط شركاء AA.<br><br>هذا الاختيار المسؤول يضمن serenity منزلك المستقبلي ويحمي نسلك من مرض الخلايا المنجلية. دعونا نبني معًا حبًا صحيًا ودائمًا. 💑"',
        understood: 'فهمت',
        
        inboxTitle: 'صندوق الوارد',
        emptyInbox: '📭 صندوق فارغ',
        startConversation: 'ابدأ محادثة!',
        findPartners: 'العثور على شركاء',
        
        block: '🚫 حظر',
        yourMessage: 'رسالتك...',
        send: 'إرسال',
        blockedByUser: '⛔ محادثة مستحيلة',
        blockedMessage: 'هذا المستخدم قام بحظرك. لا يمكنك إرسال رسائل له.',
        
        settingsTitle: 'الإعدادات',
        visibility: 'رؤية الملف الشخصي',
        notifications: 'إشعارات',
        language: 'اللغة',
        blockedUsers: 'المستخدمون المحظورون',
        dangerZone: '⚠️ منطقة الخطر',
        deleteAccount: '🗑️ حذف حسابي',
        delete: 'حذف',
        logout: 'تسجيل الخروج',
        confirmDelete: 'حذف نهائي؟',
        
        noBlocked: 'لا يوجد مستخدمين محظورين',
        unblock: 'إلغاء الحظر',
        
        thankYou: 'شكرًا لهذا التبادل',
        thanksMessage: 'Genlove يشكرك',
        newSearch: 'بحث جديد',
        
        logoutSuccess: 'تم تسجيل الخروج بنجاح',
        seeYouSoon: 'أراك قريبًا!',
        
        french: 'الفرنسية',
        english: 'الإنجليزية',
        portuguese: 'البرتغالية',
        spanish: 'الإسبانية',
        arabic: 'العربية',
        chinese: 'الصينية',
        
        pageNotFound: 'الصفحة غير موجودة',
        pageNotFoundMessage: 'الصفحة التي تبحث عنها غير موجودة.',
        
        residence_label: 'الإقامة',
        project_life: 'مشروع الحياة',
        
        newRequest: '📬 طلب جديد',
        interested: 'مهتم بملفك الشخصي.',
        whatToDo: '❓ ماذا تريد أن تفعل؟',
        openChat: '✅ فتح المحادثة',
        ignore: '🌿 تجاهل',
        willBeInformed: 'ℹ️ {name} سيتم إعلامه باختيارك.',
        requestAccepted: '✅ تم قبول طلبك! يمكنك الآن الدردشة مع هذا الشخص.',
        requestRejected: '🌸 شكرًا على رسالتك. هذا الشخص يفضل عدم الرد في الوقت الحالي. استمر في طريقك، الشخص المناسب ينتظرك في مكان آخر.',
        day: 'يوم',
        month: 'شهر',
        year: 'سنة',
        january: 'يناير',
        february: 'فبراير',
        march: 'مارس',
        april: 'أبريل',
        may: 'مايو',
        june: 'يونيو',
        july: 'يوليو',
        august: 'أغسطس',
        september: 'سبتمبر',
        october: 'أكتوبر',
        november: 'نوفمبر',
        december: 'ديسمبر'
    },
    
    zh: {
        appName: 'Genlove',
        slogan: '结合心灵与健康，建立健康的伴侣关系 💑',
        security: '🛡️ 您的健康数据已加密',
        welcome: '欢迎来到 Genlove',
        haveAccount: '已有帐户？',
        login: '登录',
        createAccount: '创建帐户',
        loginTitle: '登录',
        enterName: '输入您的名字以登录',
        yourName: '您的名字',
        backHome: '← 返回首页',
        nameNotFound: '未找到名字。请创建帐户。',
        charterTitle: '📜 荣誉宪章',
        charterSubtitle: '请仔细阅读这5项承诺',
        scrollDown: '⬇️ 滚动到底部 ⬇️',
        accept: '我接受并继续',
        
        oath1: '1. 真诚誓言',
        oath1Sub: '医疗真相',
        oath1Text: '我以荣誉保证提供关于我的基因型和健康数据的准确信息。',
        oath2: '2. 保密契约',
        oath2Sub: '共享秘密',
        oath2Text: '我承诺对所有个人和医疗信息保密。',
        oath3: '3. 非歧视原则',
        oath3Sub: '尊重平等',
        oath3Text: '我尊重每一位成员，无论其基因型如何。',
        oath4: '4. 预防责任',
        oath4Sub: '健康导向',
        oath4Text: '我接受保护措施，如过滤风险兼容性。',
        oath5: '5. 道德仁慈',
        oath5Sub: '礼貌',
        oath5Text: '我在信息中采取模范和尊重的行为。',
        
        signupTitle: '创建我的个人资料',
        signupSub: '所有信息都是保密的',
        firstName: '名字',
        lastName: '姓氏',
        gender: '性别',
        male: '男',
        female: '女',
        dob: '出生日期',
        dobPlaceholder: 'yyyy/mm/dd',
        city: '居住城市',
        genotype: '基因型',
        bloodGroup: '血型',
        desireChild: '想要孩子吗？',
        yes: '是',
        no: '否',
        createProfile: '创建个人资料',
        backCharter: '← 返回宪章',
        required: '必填',
        
        honorTitle: '荣誉誓言',
        honorText: '"我以荣誉确认我的信息是真实的，符合实际情况。"',
        swear: '我发誓',
        accessProfile: '访问我的个人资料',
        
        myProfile: '我的个人资料',
        home: '首页',
        messages: '消息',
        settings: '设置',
        genotype_label: '基因型',
        blood_label: '血型',
        age_label: '年龄',
        project_label: '项目',
        findPartner: '🔍 寻找伴侣',
        editProfile: '✏️ 编辑个人资料',
        
        compatiblePartners: '兼容的伴侣',
        noPartners: '目前未找到伴侣',
        searchOngoing: '搜索中...',
        expandCommunity: '我们正在扩大社区。请稍后再来！',
        details: '详情',
        contact: '联系',
        backProfile: '← 我的个人资料',
        toMessages: '消息 →',
        
        healthCommitment: '🛡️ 您的健康承诺',
        popupMessageAS: '"作为AS档案，我们只向您展示AA伴侣。<br><br>这一负责任的选择保证了您未来家庭的安宁，并保护您的后代免受镰状细胞病的影响。让我们一起建立健康持久的爱情。💑"',
        popupMessageSS: '"作为SS档案，我们只向您展示AA伴侣。<br><br>这一负责任的选择保证了您未来家庭的安宁，并保护您的后代免受镰状细胞病的影响。让我们一起建立健康持久的爱情。💑"',
        understood: '我明白',
        
        inboxTitle: '收件箱',
        emptyInbox: '📭 空收件箱',
        startConversation: '开始对话！',
        findPartners: '寻找伴侣',
        
        block: '🚫 屏蔽',
        yourMessage: '您的消息...',
        send: '发送',
        blockedByUser: '⛔ 无法对话',
        blockedMessage: '此用户已屏蔽您。您无法向他发送消息。',
        
        settingsTitle: '设置',
        visibility: '个人资料可见性',
        notifications: '推送通知',
        language: '语言',
        blockedUsers: '已屏蔽用户',
        dangerZone: '⚠️ 危险区域',
        deleteAccount: '🗑️ 删除我的帐户',
        delete: '删除',
        logout: '退出',
        confirmDelete: '永久删除？',
        
        noBlocked: '没有已屏蔽的用户',
        unblock: '解除屏蔽',
        
        thankYou: '感谢您的交流',
        thanksMessage: 'Genlove感谢您',
        newSearch: '新搜索',
        
        logoutSuccess: '退出成功',
        seeYouSoon: '再见！',
        
        french: '法语',
        english: '英语',
        portuguese: '葡萄牙语',
        spanish: '西班牙语',
        arabic: '阿拉伯语',
        chinese: '中文',
        
        pageNotFound: '页面未找到',
        pageNotFoundMessage: '您查找的页面不存在。',
        
        residence_label: '居住地',
        project_life: '人生计划',
        
        newRequest: '📬 新请求',
        interested: '对你的个人资料感兴趣。',
        whatToDo: '❓ 你想做什么？',
        openChat: '✅ 打开聊天',
        ignore: '🌿 忽略',
        willBeInformed: 'ℹ️ {name} 将被告知你的选择。',
        requestAccepted: '✅ 你的请求已被接受！你现在可以和这个人聊天了。',
        requestRejected: '🌸 谢谢你的留言。这个人目前不想回应。继续你的旅程，合适的人在别处等你。',
        day: '日',
        month: '月',
        year: '年',
        january: '一月',
        february: '二月',
        march: '三月',
        april: '四月',
        may: '五月',
        june: '六月',
        july: '七月',
        august: '八月',
        september: '九月',
        october: '十月',
        november: '十一月',
        december: '十二月'
    }
};

// ============================================
// MIDDLEWARE DE LANGUE
// ============================================
app.use(async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user && user.language) {
                req.lang = user.language;
            } else {
                req.lang = 'fr';
            }
        } catch (e) {
            req.lang = 'fr';
        }
    } else {
        const acceptLanguage = req.headers['accept-language'] || '';
        if (acceptLanguage.includes('pt')) req.lang = 'pt';
        else if (acceptLanguage.includes('es')) req.lang = 'es';
        else if (acceptLanguage.includes('ar')) req.lang = 'ar';
        else if (acceptLanguage.includes('zh')) req.lang = 'zh';
        else if (acceptLanguage.includes('en')) req.lang = 'en';
        else req.lang = 'fr';
    }
    
    req.t = (key, params = {}) => {
        let text = translations[req.lang] && translations[req.lang][key] 
            ? translations[req.lang][key] 
            : translations['fr'][key] || key;
        
        // Remplacer les variables dans le texte
        for (const [param, value] of Object.entries(params)) {
            text = text.replace(`{${param}}`, value);
        }
        
        return text;
    };
    
    next();
});

// ============================================
// MIDDLEWARE D'AUTHENTIFICATION
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
};

const requireVerified = (req, res, next) => {
    if (!req.session.isVerified) {
        return res.redirect('/sas-validation');
    }
    next();
};

// ============================================
// STYLES CSS
// ============================================
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
        font-family: 'Segoe UI', Roboto, system-ui, -apple-system, sans-serif; 
        margin: 0; 
        background: #fdf2f2; 
        display: flex; 
        justify-content: center; 
        align-items: flex-start;
        min-height: 100vh;
        font-size: 16px;
    }
    .app-shell { 
        width: 100%; 
        max-width: 420px; 
        min-height: 100vh; 
        background: #f4e9da; 
        display: flex; 
        flex-direction: column; 
        box-shadow: 0 0 30px rgba(0,0,0,0.1); 
        position: relative;
        margin: 0 auto;
    }
    
    h1 { font-size: 2.4rem; margin: 10px 0; }
    h2 { font-size: 2rem; margin-bottom: 20px; color: #1a2a44; }
    h3 { font-size: 1.6rem; margin: 15px 0; }
    p { font-size: 1.2rem; line-height: 1.6; }
    
    .logo-text { 
        font-size: 5rem; 
        font-weight: 800; 
        margin: 20px 0; 
        letter-spacing: -2px;
        text-shadow: 4px 4px 0 rgba(255,65,108,0.1);
        text-align: center;
    }
    
    .slogan { 
        font-weight: 500; 
        color: #1a2a44; 
        margin: 20px 25px 40px; 
        font-size: 1.3rem; 
        line-height: 1.7;
        text-align: center;
    }
    
    .home-screen { 
        flex: 1; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        padding: 30px; 
        text-align: center; 
        background: linear-gradient(135deg, #fff5f7 0%, #f4e9da 100%);
    }
    
    .page-white { 
        background: white; 
        min-height: 100vh; 
        padding: 30px 25px; 
        text-align: center; 
        display: flex;
        flex-direction: column;
    }
    
    .language-selector-home {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
        margin: 15px 0;
        padding: 10px;
        max-height: 120px;
        overflow-y: auto;
        background: rgba(255,255,255,0.5);
        border-radius: 20px;
    }
    
    .language-selector-compact {
        background: white;
        border-radius: 15px;
        padding: 10px 15px;
        margin: 10px 0 20px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .language-selector-compact select {
        padding: 8px 12px;
        border: 2px solid #ff416c;
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        background: white;
        color: #1a2a44;
        cursor: pointer;
        outline: none;
        width: 150px;
    }
    .language-selector-compact select:hover {
        background: #fff5f7;
    }
    .language-label {
        font-size: 1.1rem;
        color: #1a2a44;
        font-weight: 600;
    }
    
    .lang-btn {
        background: white;
        border: 2px solid #ff416c;
        color: #1a2a44;
        padding: 8px 12px;
        border-radius: 30px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-block;
    }
    
    .lang-btn:hover {
        background: #ff416c;
        color: white;
        transform: translateY(-2px);
    }
    
    .lang-btn.active {
        background: #ff416c;
        color: white;
    }
    
    .btn-pink, .btn-dark { 
        padding: 20px 25px; 
        border-radius: 60px; 
        font-size: 1.3rem; 
        font-weight: 600;
        width: 90%; 
        margin: 15px auto; 
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
        box-shadow: 0 10px 20px rgba(255,65,108,0.3);
    }
    
    .btn-dark { 
        background: #1a2a44; 
        color: white; 
        box-shadow: 0 10px 20px rgba(26,42,68,0.3);
    }
    
    .btn-pink:hover, .btn-dark:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(255,65,108,0.4);
    }
    
    .btn-action { 
        padding: 15px 20px; 
        font-size: 1.1rem; 
        font-weight: 600; 
        border-radius: 30px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-action.small {
        padding: 10px 15px;
        font-size: 1rem;
    }
    
    .btn-contact { background: #ff416c; color: white; }
    .btn-details { background: #1a2a44; color: white; }
    .btn-block { background: #dc3545; color: white; }
    
    .input-box { 
        width: 100%; 
        padding: 18px; 
        border: 2px solid #e2e8f0; 
        border-radius: 15px; 
        margin: 12px 0; 
        font-size: 1.2rem; 
        background: #f8f9fa; 
    }
    
    .input-box:focus {
        border-color: #ff416c;
        outline: none;
        box-shadow: 0 0 0 4px rgba(255,65,108,0.2);
    }
    
    .input-label {
        text-align: left;
        font-size: 1rem;
        color: #1a2a44;
        margin-top: 10px;
        margin-bottom: -5px;
        font-weight: 600;
    }
    
    .photo-circle { 
        width: 160px; 
        height: 160px; 
        border: 4px solid #ff416c; 
        border-radius: 50%; 
        margin: 20px auto; 
        background-size: cover; 
        background-position: center; 
        box-shadow: 0 10px 25px rgba(255,65,108,0.3);
    }
    
    .match-card, .inbox-item, .st-group { 
        background: white; 
        border-radius: 25px; 
        margin: 15px 0; 
        padding: 20px; 
        box-shadow: 0 5px 20px rgba(0,0,0,0.05); 
        font-size: 1.2rem;
    }
    
    .match-card {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .match-header {
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    .match-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
    }
    
    .match-actions .btn-action {
        flex: 1;
    }
    
    .inbox-item {
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
    }
    
    .inbox-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(255,65,108,0.15);
    }
    
    .inbox-item.unread {
        background: #e8f0fe;
        border-left: 5px solid #ff416c;
    }
    
    .inbox-item.unread .user-name {
        color: #ff416c;
        font-weight: bold;
    }
    
    .inbox-item.unread .message-preview {
        color: #1a2a44;
        font-weight: 600;
    }
    
    .unread-badge {
        background: #ff416c;
        color: white;
        font-size: 0.8rem;
        font-weight: bold;
        min-width: 22px;
        height: 22px;
        border-radius: 11px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        margin-left: 8px;
    }
    
    .profile-unread {
        background: #ff416c;
        color: white;
        font-size: 0.7rem;
        font-weight: bold;
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 5px;
        padding: 0 4px;
    }
    
    .st-item { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 18px 20px; 
        border-bottom: 1px solid #f0f0f0; 
        font-size: 1.2rem;
    }
    
    .charte-box {
        height: 500px;
        overflow-y: auto;
        background: #fff5f7;
        border: 2px solid #ffdae0;
        border-radius: 25px;
        padding: 30px;
        font-size: 1.2rem;
        color: #1a2a44;
        line-height: 1.8;
        margin: 20px 0;
        text-align: left;
    }
    
    .charte-section {
        margin-bottom: 35px;
        padding-bottom: 25px;
        border-bottom: 2px dashed #ffdae0;
    }
    
    .charte-title {
        color: #ff416c;
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 12px;
    }
    
    .scroll-indicator {
        text-align: center;
        color: #ff416c;
        font-size: 1.1rem;
        margin: 15px 0;
        padding: 12px;
        background: rgba(255,65,108,0.1);
        border-radius: 40px;
    }
    
    .chat-header { 
        background: #1a2a44; 
        color: white; 
        padding: 18px 20px; 
        font-size: 1.3rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .chat-messages { 
        flex: 1;
        padding: 20px; 
        background: #f5f7fb; 
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .bubble { 
        padding: 16px 22px; 
        border-radius: 25px; 
        max-width: 80%; 
        font-size: 1.2rem; 
        line-height: 1.5; 
    }
    
    .received { 
        background: white; 
        align-self: flex-start; 
        border-bottom-left-radius: 5px;
    }
    
    .sent { 
        background: #ff416c; 
        color: white; 
        align-self: flex-end; 
        border-bottom-right-radius: 5px;
    }
    
    .input-area { 
        padding: 15px 20px; 
        background: white; 
        border-top: 2px solid #eee; 
        display: flex;
        gap: 12px;
    }
    
    .input-area input {
        flex: 1;
        padding: 16px 20px;
        font-size: 1.2rem;
        border: 2px solid #e2e8f0;
        border-radius: 30px;
        outline: none;
    }
    
    .input-area button {
        padding: 16px 25px;
        font-size: 1.2rem;
        border-radius: 30px;
        background: #ff416c;
        color: white;
        border: none;
        cursor: pointer;
    }
    
    .empty-message {
        text-align: center;
        padding: 50px 20px;
        color: #666;
        background: white;
        border-radius: 25px;
        margin: 20px 0;
        font-size: 1.2rem;
    }
    
    .empty-message span {
        font-size: 5rem;
        display: block;
        margin-bottom: 20px;
    }
    
    .danger-zone {
        border: 2px solid #dc3545;
        background: #fff5f5;
        margin-top: 30px;
    }
    
    #genlove-notify { 
        position: fixed; 
        top: -100px; 
        left: 50%; 
        transform: translateX(-50%);
        width: 90%;
        max-width: 380px;
        background: #1a2a44; 
        color: white; 
        padding: 18px 25px; 
        border-radius: 60px; 
        display: flex; 
        align-items: center; 
        gap: 12px; 
        transition: 0.5s; 
        z-index: 9999; 
        box-shadow: 0 15px 30px rgba(0,0,0,0.3); 
        border-left: 5px solid #ff416c; 
        font-size: 1.1rem;
    }
    
    #genlove-notify.show { top: 20px; }
    
    .navigation {
        display: flex;
        justify-content: space-between;
        padding: 20px 0;
        margin-top: 20px;
        gap: 10px;
    }
    
    .nav-link {
        color: #1a2a44;
        text-decoration: none;
        font-size: 1.1rem;
        padding: 12px 18px;
        border-radius: 30px;
        background: white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        flex: 1;
        text-align: center;
    }
    
    .back-link {
        display: inline-block;
        margin: 20px 0;
        color: #666;
        text-decoration: none;
        font-size: 1.1rem;
    }
    
    .login-prompt {
        font-size: 1.2rem;
        color: #1a2a44;
        margin: 20px 0 10px;
    }
    
    /* POPUP DE DEMANDE */
    #request-popup {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 20000;
        align-items: center;
        justify-content: center;
        padding: 20px;
        backdrop-filter: blur(5px);
    }
    .request-card {
        background: white;
        border-radius: 30px;
        padding: 35px 25px;
        max-width: 380px;
        width: 100%;
        text-align: center;
        animation: popupAppear 0.4s ease-out;
        border: 3px solid #ff416c;
        box-shadow: 0 20px 40px rgba(255,65,108,0.3);
    }
    .request-icon {
        font-size: 4rem;
        margin-bottom: 10px;
    }
    .request-title {
        color: #ff416c;
        font-size: 1.8rem;
        font-weight: bold;
        margin-bottom: 20px;
    }
    .request-user {
        font-size: 1.6rem;
        font-weight: bold;
        color: #1a2a44;
        margin-bottom: 5px;
    }
    .request-details {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 15px;
    }
    .request-message {
        background: #fff5f7;
        border-radius: 15px;
        padding: 20px;
        margin: 20px 0;
        font-size: 1.2rem;
        color: #1a2a44;
        font-style: italic;
        border: 2px solid #ffdae0;
    }
    .request-question {
        font-size: 1.3rem;
        color: #1a2a44;
        margin: 20px 0;
        font-weight: 600;
    }
    .request-buttons {
        display: flex;
        gap: 15px;
        margin: 20px 0;
    }
    .request-buttons button {
        flex: 1;
        padding: 15px;
        font-size: 1.2rem;
        border-radius: 50px;
        border: none;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
    }
    .accept-btn {
        background: #ff416c;
        color: white;
    }
    .accept-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(255,65,108,0.3);
    }
    .ignore-btn {
        background: #1a2a44;
        color: white;
    }
    .ignore-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(26,42,68,0.3);
    }
    .request-note {
        font-size: 0.95rem;
        color: #888;
        margin-top: 15px;
    }
    
    @keyframes popupAppear {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .custom-date-picker {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
    }
    .date-part {
        padding: 15px;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        font-size: 1rem;
        background: #f8f9fa;
        margin: 0 2px;
    }
    .date-part:focus {
        border-color: #ff416c;
        outline: none;
    }
    
    @media (max-width: 420px) {
        body { font-size: 15px; }
        .app-shell { max-width: 100%; }
        .logo-text { font-size: 4.2rem; }
        h2 { font-size: 1.8rem; }
        .btn-pink, .btn-dark { width: 95%; padding: 18px; font-size: 1.2rem; }
        .custom-date-picker { flex-wrap: wrap; }
        .date-part { width: 100% !important; margin: 5px 0; }
    }
</style>
`;

// ============================================
// SCRIPT DE NOTIFICATION ET VIBRATION
// ============================================
const notifyScript = `
<script>
    function showNotify(msg, type) {
        const n = document.getElementById('genlove-notify');
        const m = document.getElementById('notify-msg');
        if(m) m.innerText = msg;
        if(n) {
            n.style.backgroundColor = type === 'success' ? '#4CAF50' : '#1a2a44';
            n.classList.add('show');
        }
        setTimeout(() => { 
            if(n) n.classList.remove('show'); 
        }, 3000);
    }
    
    // Fonction pour faire vibrer le téléphone
    function vibrate(pattern) {
        if ("vibrate" in navigator) {
            navigator.vibrate(pattern);
        }
    }
</script>
`;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function calculerAge(dateNaissance) {
    if (!dateNaissance) return "?";
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

function formatTimeAgo(timestamp, lang = 'fr') {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (lang === 'fr') {
        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours} h`;
        if (diffDays === 1) return 'Hier';
        return date.toLocaleDateString('fr-FR');
    } else if (lang === 'en') {
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString('en-US');
    } else if (lang === 'pt') {
        if (diffMins < 1) return "Agora mesmo";
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours} horas atrás`;
        if (diffDays === 1) return 'Ontem';
        return date.toLocaleDateString('pt-BR');
    } else if (lang === 'es') {
        if (diffMins < 1) return "Ahora mismo";
        if (diffMins < 60) return `hace ${diffMins} min`;
        if (diffHours < 24) return `hace ${diffHours} h`;
        if (diffDays === 1) return 'Ayer';
        return date.toLocaleDateString('es-ES');
    } else if (lang === 'ar') {
        if (diffMins < 1) return "الآن";
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays === 1) return 'أمس';
        return date.toLocaleDateString('ar-SA');
    } else if (lang === 'zh') {
        if (diffMins < 1) return "刚刚";
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays === 1) return '昨天';
        return date.toLocaleDateString('zh-CN');
    }
    return date.toLocaleDateString();
}

function generateDateOptions(req, selectedDate = null) {
    const t = req.t;
    const lang = req.lang;
    
    const monthNames = {
        fr: [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')],
        en: [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')],
        pt: [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')],
        es: [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')],
        ar: [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')],
        zh: [t('january'), t('february'), t('march'), t('april'), t('may'), t('june'), t('july'), t('august'), t('september'), t('october'), t('november'), t('december')]
    };
    
    const months = monthNames[lang] || monthNames.fr;
    const currentYear = new Date().getFullYear();
    const selected = selectedDate ? new Date(selectedDate) : null;
    
    let html = '<div class="custom-date-picker">';
    
    // Jour
    html += '<select name="day" class="input-box date-part" required style="width:30%;">';
    html += '<option value="">' + t('day') + '</option>';
    for (let d = 1; d <= 31; d++) {
        const selectedAttr = (selected && selected.getDate() === d) ? 'selected' : '';
        html += `<option value="${d}" ${selectedAttr}>${d}</option>`;
    }
    html += '</select>';
    
    // Mois
    html += '<select name="month" class="input-box date-part" required style="width:38%;">';
    html += '<option value="">' + t('month') + '</option>';
    for (let m = 0; m < 12; m++) {
        const monthValue = m + 1;
        const selectedAttr = (selected && selected.getMonth() === m) ? 'selected' : '';
        html += `<option value="${monthValue}" ${selectedAttr}>${months[m]}</option>`;
    }
    html += '</select>';
    
    // Année
    html += '<select name="year" class="input-box date-part" required style="width:28%;">';
    html += '<option value="">' + t('year') + '</option>';
    for (let y = currentYear - 100; y <= currentYear - 18; y++) {
        const selectedAttr = (selected && selected.getFullYear() === y) ? 'selected' : '';
        html += `<option value="${y}" ${selectedAttr}>${y}</option>`;
    }
    html += '</select>';
    html += '</div>';
    
    return html;
}

// ============================================
// ROUTE POUR CHANGER DE LANGUE
// ============================================
app.get('/lang/:lang', async (req, res) => {
    const lang = req.params.lang;
    if (['fr', 'en', 'pt', 'es', 'ar', 'zh'].includes(lang)) {
        if (req.session.userId) {
            await User.findByIdAndUpdate(req.session.userId, { language: lang });
        }
        req.session.lang = lang;
    }
    res.redirect(req.get('referer') || '/');
});

// ============================================
// ROUTES PRINCIPALES
// ============================================

// ACCUEIL MULTILINGUE
app.get('/', (req, res) => {
    const t = req.t;
    const currentLang = req.lang;
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('welcome')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="home-screen">
            <div class="language-selector-home">
                <a href="/lang/fr" class="lang-btn ${currentLang === 'fr' ? 'active' : ''}">🇫🇷 ${t('french')}</a>
                <a href="/lang/en" class="lang-btn ${currentLang === 'en' ? 'active' : ''}">🇬🇧 ${t('english')}</a>
                <a href="/lang/pt" class="lang-btn ${currentLang === 'pt' ? 'active' : ''}">🇵🇹 ${t('portuguese')}</a>
                <a href="/lang/es" class="lang-btn ${currentLang === 'es' ? 'active' : ''}">🇪🇸 ${t('spanish')}</a>
                <a href="/lang/ar" class="lang-btn ${currentLang === 'ar' ? 'active' : ''}">🇸🇦 ${t('arabic')}</a>
                <a href="/lang/zh" class="lang-btn ${currentLang === 'zh' ? 'active' : ''}">🇨🇳 ${t('chinese')}</a>
            </div>
            <div class="logo-text">
                <span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span>
            </div>
            <div class="slogan">${t('slogan')}</div>
            <div class="login-prompt">${t('haveAccount')}</div>
            <a href="/login" class="btn-dark">🔐 ${t('login')}</a>
            <a href="/charte-engagement" class="btn-pink">✨ ${t('createAccount')}</a>
            <div style="margin-top:40px; font-size:1rem; color:#666;">${t('security')}</div>
        </div>
    </div>
</body>
</html>`);
});

// PAGE DE CONNEXION MULTILINGUE
app.get('/login', (req, res) => {
    const t = req.t;
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('loginTitle')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('loginTitle')}</h2>
            <p style="font-size:1.2rem; margin:20px 0;">${t('enterName')}</p>
            <form id="loginForm">
                <input type="text" id="firstName" class="input-box" placeholder="${t('yourName')}" required>
                <button type="submit" class="btn-pink">${t('login')}</button>
            </form>
            <a href="/" class="back-link">← ${t('backHome')}</a>
        </div>
    </div>
    <script>
        document.getElementById("loginForm").addEventListener("submit", async function(e){
            e.preventDefault();
            const firstName = document.getElementById("firstName").value;
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({firstName})
            });
            if(res.ok){
                window.location.href = "/profile";
            } else {
                alert("${t('nameNotFound')}");
            }
        });
    </script>
</body>
</html>`);
});

// CHARTE ENGAGEMENT MULTILINGUE
app.get('/charte-engagement', (req, res) => {
    const t = req.t;
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('charterTitle')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('charterTitle')}</h2>
            <p style="font-size:1.2rem; margin-bottom:25px;">${t('charterSubtitle')}</p>
            <div class="charte-box" id="charteBox" onscroll="checkScroll(this)">
                <div class="charte-section">
                    <div class="charte-title">${t('oath1')}</div>
                    <div class="charte-subtitle">${t('oath1Sub')}</div>
                    <p>${t('oath1Text')}</p>
                </div>
                <div class="charte-section">
                    <div class="charte-title">${t('oath2')}</div>
                    <div class="charte-subtitle">${t('oath2Sub')}</div>
                    <p>${t('oath2Text')}</p>
                </div>
                <div class="charte-section">
                    <div class="charte-title">${t('oath3')}</div>
                    <div class="charte-subtitle">${t('oath3Sub')}</div>
                    <p>${t('oath3Text')}</p>
                </div>
                <div class="charte-section">
                    <div class="charte-title">${t('oath4')}</div>
                    <div class="charte-subtitle">${t('oath4Sub')}</div>
                    <p>${t('oath4Text')}</p>
                </div>
                <div class="charte-section">
                    <div class="charte-title">${t('oath5')}</div>
                    <div class="charte-subtitle">${t('oath5Sub')}</div>
                    <p>${t('oath5Text')}</p>
                </div>
            </div>
            <div class="scroll-indicator" id="scrollIndicator">${t('scrollDown')}</div>
            <button id="agreeBtn" class="btn-pink" onclick="acceptCharte()" disabled>${t('accept')}</button>
            <a href="/" class="back-link">← ${t('backHome')}</a>
        </div>
    </div>
    <script>
        function checkScroll(el){
            if(el.scrollHeight - el.scrollTop <= el.clientHeight + 5){
                document.getElementById("agreeBtn").disabled = false;
                document.getElementById("agreeBtn").style.opacity = "1";
                document.getElementById("scrollIndicator").style.opacity = "0.3";
            }
        }
        function acceptCharte(){
            if(!document.getElementById("agreeBtn").disabled) window.location.href = "/signup";
        }
    </script>
</body>
</html>`);
});

// INSCRIPTION MULTILINGUE AVEC CALENDRIER PERSONNALISÉ
app.get('/signup', (req, res) => {
    const t = req.t;
    
    // Générer le calendrier personnalisé
    const datePicker = generateDateOptions(req);
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('signupTitle')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('signupTitle')}</h2>
            <p style="font-size:1.2rem; margin-bottom:20px;">${t('signupSub')}</p>
            <form id="signupForm">
                <div class="input-label">${t('firstName')}</div>
                <input type="text" name="firstName" class="input-box" placeholder="${t('firstName')}" required>
                
                <div class="input-label">${t('lastName')}</div>
                <input type="text" name="lastName" class="input-box" placeholder="${t('lastName')}" required>
                
                <div class="input-label">${t('gender')}</div>
                <select name="gender" class="input-box" required>
                    <option value="">${t('gender')}</option>
                    <option value="Homme">${t('male')}</option>
                    <option value="Femme">${t('female')}</option>
                </select>
                
                <div class="input-label">${t('dob')}</div>
                ${datePicker}
                
                <div class="input-label">${t('city')}</div>
                <input type="text" name="residence" class="input-box" placeholder="${t('city')}" required>
                
                <div class="input-label">${t('genotype')}</div>
                <select name="genotype" class="input-box" required>
                    <option value="">${t('genotype')}</option>
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                </select>
                
                <div class="input-label">${t('bloodGroup')}</div>
                <select name="bloodGroup" class="input-box" required>
                    <option value="">${t('bloodGroup')}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
                
                <div class="input-label">${t('desireChild')}</div>
                <select name="desireChild" class="input-box" required>
                    <option value="">${t('desireChild')}</option>
                    <option value="Oui">${t('yes')}</option>
                    <option value="Non">${t('no')}</option>
                </select>
                
                <input type="hidden" name="language" value="${req.lang}">
                <button type="submit" class="btn-pink">${t('createProfile')}</button>
            </form>
            <a href="/charte-engagement" class="back-link">← ${t('backCharter')}</a>
        </div>
    </div>
    <script>
        document.getElementById("signupForm").addEventListener("submit", async function(e){
            e.preventDefault();
            
            // Reconstituer la date à partir des selects
            const day = document.querySelector('select[name="day"]').value;
            const month = document.querySelector('select[name="month"]').value;
            const year = document.querySelector('select[name="year"]').value;
            
            if (!day || !month || !year) {
                alert("${t('dob')} ${t('required')}");
                return;
            }
            
            const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.dob = dob;
            
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
            if(res.ok) window.location.href = "/sas-validation";
            else alert("Erreur lors de l'inscription");
        });
    </script>
</body>
</html>`);
});

// SAS DE VALIDATION MULTILINGUE
app.get('/sas-validation', async (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const t = req.t;
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('honorTitle')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <div style="font-size:5rem; margin:20px 0;">⚖️</div>
            <h2>${t('honorTitle')}</h2>
            <div style="background:#fff5f7; border-radius:25px; padding:30px; margin:20px 0; border:2px solid #ffdae0; text-align:left; font-size:1.2rem;">
                <p><strong>${t('honorText')}</strong></p>
            </div>
            <label style="display:flex; align-items:center; justify-content:center; gap:15px; padding:20px; background:#f8f9fa; border-radius:15px; margin:20px 0; font-size:1.2rem;">
                <input type="checkbox" id="honorCheck" style="width:25px; height:25px;"> ${t('swear')}
            </label>
            <button id="validateBtn" class="btn-pink" onclick="validateHonor()" disabled>${t('accessProfile')}</button>
        </div>
    </div>
    <script>
        document.getElementById("honorCheck").addEventListener("change", function(){
            document.getElementById("validateBtn").disabled = !this.checked;
        });
        async function validateHonor(){
            const res = await fetch("/api/validate-honor", {method: "POST"});
            if(res.ok) window.location.href = "/profile";
        }
    </script>
</body>
</html>`);
});

// PROFIL MULTILINGUE
app.get('/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const t = req.t;
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false });
        
        // Traduction du genre
        const genderDisplay = user.gender === 'Homme' ? t('male') : t('female');
        
        const unreadBadge = unreadCount > 0 
            ? '<span class="profile-unread">' + unreadCount + '</span>'
            : '';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('myProfile')}</title>
    ${styles}
    ${notifyScript}
    <script>
        // Fonction pour vérifier les demandes en attente
        let currentRequestId = null;
        
        async function checkPendingRequests() {
            try {
                const res = await fetch('/api/requests/pending');
                const requests = await res.json();
                
                if (requests.length > 0) {
                    showRequestPopup(requests[0]);
                }
            } catch (e) {
                console.error('Erreur lors de la vérification des demandes', e);
            }
        }
        
        function showRequestPopup(request) {
            currentRequestId = request._id;
            
            document.getElementById('request-sender-name').textContent = 
                request.senderId.firstName + ', ' + calculerAge(request.senderId.dob) + ' ans';
            document.getElementById('request-sender-details').textContent = 
                'Génotype: ' + request.senderId.genotype + ' • Résidence: ' + request.senderId.residence;
            document.getElementById('request-message-text').textContent = request.message;
            document.getElementById('request-note').textContent = 
                'ℹ️ ' + request.senderId.firstName + ' sera informé(e) de votre choix.';
            
            // Faire vibrer le téléphone (pattern: deux petites vibrations)
            vibrate([200, 100, 200]);
            
            document.getElementById('request-popup').style.display = 'flex';
        }
        
        async function acceptRequest() {
            if (!currentRequestId) return;
            
            const res = await fetch('/api/requests/' + currentRequestId + '/accept', {
                method: 'POST'
            });
            
            if (res.ok) {
                document.getElementById('request-popup').style.display = 'none';
                window.location.href = '/inbox';
            }
        }
        
        async function ignoreRequest() {
            if (!currentRequestId) return;
            
            if (confirm('Ignorer cette demande ?')) {
                const res = await fetch('/api/requests/' + currentRequestId + '/ignore', {
                    method: 'POST'
                });
                
                if (res.ok) {
                    document.getElementById('request-popup').style.display = 'none';
                    showNotify('Demande ignorée', 'info');
                }
            }
        }
        
        function calculerAge(dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
        }
        
        // Vérifier les demandes toutes les 10 secondes
        setInterval(checkPendingRequests, 10000);
        
        // Vérifier au chargement de la page
        document.addEventListener('DOMContentLoaded', checkPendingRequests);
    </script>
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <!-- POPUP DE DEMANDE DE PREMIER CONTACT -->
            <div id="request-popup">
                <div class="request-card">
                    <div class="request-icon">📬</div>
                    <div class="request-title">${t('newRequest')}</div>
                    
                    <div class="request-user" id="request-sender-name"></div>
                    <div class="request-details" id="request-sender-details"></div>
                    
                    <div class="request-message" id="request-message-text"></div>
                    
                    <div class="request-question">${t('whatToDo')}</div>
                    
                    <div class="request-buttons">
                        <button class="accept-btn" onclick="acceptRequest()">${t('openChat')}</button>
                        <button class="ignore-btn" onclick="ignoreRequest()">${t('ignore')}</button>
                    </div>
                    
                    <div class="request-note" id="request-note"></div>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <a href="/" class="btn-dark" style="padding:12px 20px; margin:0; font-size:1rem;">🏠 ${t('home')}</a>
                <a href="/inbox" class="btn-pink" style="padding:12px 20px; margin:0; font-size:1rem; display:flex; align-items:center;">
                    📬 ${unreadBadge}
                </a>
                <a href="/settings" style="font-size:2rem; color:#1a2a44;">⚙️</a>
            </div>
            
            <div class="language-selector-compact">
                <span class="language-label">${t('language')} :</span>
                <select onchange="window.location.href='/lang/'+this.value">
                    <option value="fr" ${user.language === 'fr' ? 'selected' : ''}>🇫🇷 ${t('french')}</option>
                    <option value="en" ${user.language === 'en' ? 'selected' : ''}>🇬🇧 ${t('english')}</option>
                    <option value="pt" ${user.language === 'pt' ? 'selected' : ''}>🇵🇹 ${t('portuguese')}</option>
                    <option value="es" ${user.language === 'es' ? 'selected' : ''}>🇪🇸 ${t('spanish')}</option>
                    <option value="ar" ${user.language === 'ar' ? 'selected' : ''}>🇸🇦 ${t('arabic')}</option>
                    <option value="zh" ${user.language === 'zh' ? 'selected' : ''}>🇨🇳 ${t('chinese')}</option>
                </select>
            </div>
            
            <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
            <h2>${user.firstName} ${user.lastName}</h2>
            <p style="font-size:1.2rem;">📍 ${user.residence || ''} • ${genderDisplay}</p>
            <div class="st-group">
                <div class="st-item"><span>🧬 ${t('genotype_label')}</span><b>${user.genotype}</b></div>
                <div class="st-item"><span>🩸 ${t('blood_label')}</span><b>${user.bloodGroup}</b></div>
                <div class="st-item"><span>📅 ${t('age_label')}</span><b>${calculerAge(user.dob)} ${t('age_label') === 'Âge' ? 'ans' : t('age_label') === 'Age' ? 'years' : t('age_label') === 'Edad' ? 'años' : ''}</b></div>
                <div class="st-item"><span>👶 ${t('project_label')}</span><b>${user.desireChild === 'Oui' ? t('yes') : t('no')}</b></div>
            </div>
            <a href="/matching" class="btn-pink">${t('findPartner')}</a>
        </div>
    </div>
</body>
</html>`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur profil');
    }
});

// ÉDITION PROFIL MULTILINGUE
app.get('/edit-profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const t = req.t;
        const datePicker = generateDateOptions(req, user.dob);
        
        const bloodOptions = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => 
            '<option value="' + g + '" ' + (user.bloodGroup === g ? 'selected' : '') + '>' + g + '</option>'
        ).join('');
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('editProfile')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('editProfile')}</h2>
            <form id="editForm">
                <div class="input-label">${t('firstName')}</div>
                <input type="text" name="firstName" class="input-box" value="${user.firstName}" placeholder="${t('firstName')}" required>
                
                <div class="input-label">${t('lastName')}</div>
                <input type="text" name="lastName" class="input-box" value="${user.lastName}" placeholder="${t('lastName')}" required>
                
                <div class="input-label">${t('gender')}</div>
                <select name="gender" class="input-box">
                    <option value="Homme" ${user.gender === 'Homme' ? 'selected' : ''}>${t('male')}</option>
                    <option value="Femme" ${user.gender === 'Femme' ? 'selected' : ''}>${t('female')}</option>
                </select>
                
                <div class="input-label">${t('dob')}</div>
                ${datePicker}
                
                <div class="input-label">${t('city')}</div>
                <input type="text" name="residence" class="input-box" value="${user.residence}" placeholder="${t('city')}" required>
                
                <div class="input-label">${t('genotype')}</div>
                <select name="genotype" class="input-box">
                    <option value="AA" ${user.genotype === 'AA' ? 'selected' : ''}>AA</option>
                    <option value="AS" ${user.genotype === 'AS' ? 'selected' : ''}>AS</option>
                    <option value="SS" ${user.genotype === 'SS' ? 'selected' : ''}>SS</option>
                </select>
                
                <div class="input-label">${t('bloodGroup')}</div>
                <select name="bloodGroup" class="input-box">
                    ${bloodOptions}
                </select>
                
                <div class="input-label">${t('desireChild')}</div>
                <select name="desireChild" class="input-box">
                    <option value="Oui" ${user.desireChild === 'Oui' ? 'selected' : ''}>${t('yes')}</option>
                    <option value="Non" ${user.desireChild === 'Non' ? 'selected' : ''}>${t('no')}</option>
                </select>
                
                <button type="submit" class="btn-pink">${t('editProfile')}</button>
            </form>
            <a href="/profile" class="back-link">← ${t('backProfile')}</a>
        </div>
    </div>
    <script>
        document.getElementById("editForm").addEventListener("submit", async function(e){
            e.preventDefault();
            
            const day = document.querySelector('select[name="day"]').value;
            const month = document.querySelector('select[name="month"]').value;
            const year = document.querySelector('select[name="year"]').value;
            
            if (!day || !month || !year) {
                alert("${t('dob')} ${t('required')}");
                return;
            }
            
            const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.dob = dob;
            
            const res = await fetch("/api/users/profile", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
            if(res.ok) window.location.href = "/profile";
            else alert("Erreur");
        });
    </script>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur édition');
    }
});

// MATCHING MULTILINGUE
app.get('/matching', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const t = req.t;
        const isSSorAS = currentUser.genotype === 'SS' || currentUser.genotype === 'AS';
        
        let query = { _id: { $ne: currentUser._id } };
        
        if (currentUser.blockedUsers?.length) query._id.$nin = currentUser.blockedUsers;
        
        const blockedByOthers = await User.find({ blockedBy: currentUser._id }).distinct('_id');
        if (blockedByOthers.length > 0) {
            query._id.$nin = query._id.$nin ? [...query._id.$nin, ...blockedByOthers] : blockedByOthers;
        }
        
        if (currentUser.gender === 'Homme') query.gender = 'Femme';
        else if (currentUser.gender === 'Femme') query.gender = 'Homme';
        
        let partners = await User.find(query);
        
        if (currentUser.genotype === 'SS' || currentUser.genotype === 'AS') {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        let partnersHTML = '';
        if (partners.length === 0) {
            partnersHTML = `<div class="empty-message"><span>🔍</span><h3>${t('searchOngoing')}</h3><p>${t('expandCommunity')}</p></div>`;
        } else {
            partners.forEach(p => {
                partnersHTML += `<div class="match-card">
                    <div class="match-header">
                        <div class="match-photo-blur"></div>
                        <div style="flex:1">
                            <b style="font-size:1.3rem;">${p.firstName}</b>
                            <br><span style="font-size:1.1rem;">${p.genotype} • ${p.residence}</span>
                        </div>
                    </div>
                    <div class="match-actions">
                        <button class="btn-action btn-details small" onclick='showDetails(${JSON.stringify({
                            name: p.firstName + ' ' + p.lastName,
                            genotype: p.genotype,
                            bloodGroup: p.bloodGroup,
                            residence: p.residence,
                            desireChild: p.desireChild,
                            age: calculerAge(p.dob)
                        })})'>📋 ${t('details')}</button>
                        <button class="btn-action btn-contact small" onclick="sendRequest('${p._id}', '${p.firstName}')">💬 ${t('contact')}</button>
                    </div>
                </div>`;
            });
        }
        
        const popupMessage = isSSorAS ? `
        <div id="genlove-popup" style="display:flex;">
            <div class="popup-card">
                <div class="popup-icon">🛡️</div>
                <div class="popup-title">${t('healthCommitment')}</div>
                <div class="popup-message">
                    ${currentUser.genotype === 'AS' ? t('popupMessageAS') : t('popupMessageSS')}
                </div>
                <button class="popup-button" onclick="document.getElementById('genlove-popup').style.display='none';">${t('understood')}</button>
            </div>
        </div>
        ` : '';
        
        const detailsPopupStyles = `
        <div id="details-popup" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:10001; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(5px);">
            <div style="background:white; border-radius:30px; padding:30px; max-width:380px; width:100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="color:#ff416c;">📋 ${t('details')}</h3>
                    <span onclick="document.getElementById('details-popup').style.display='none'" style="font-size:2rem; cursor:pointer;">&times;</span>
                </div>
                <div id="details-content" style="font-size:1.2rem; line-height:2;"></div>
            </div>
        </div>
        `;
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('compatiblePartners')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        ${popupMessage}
        ${detailsPopupStyles}
        <div class="page-white">
            <h2>${t('compatiblePartners')}</h2>
            ${partnersHTML}
            <div class="navigation">
                <a href="/profile" class="nav-link">← ${t('backProfile')}</a>
                <a href="/inbox" class="nav-link">${t('toMessages')}</a>
            </div>
        </div>
    </div>
    <script>
        function showDetails(partner) {
            const content = document.getElementById('details-content');
            content.innerHTML = \`
                <p><strong>${t('firstName')} :</strong> \${partner.name}</p>
                <p><strong>${t('genotype_label')} :</strong> \${partner.genotype}</p>
                <p><strong>${t('blood_label')} :</strong> \${partner.bloodGroup}</p>
                <p><strong>${t('residence_label')} :</strong> \${partner.residence}</p>
                <p><strong>${t('age_label')} :</strong> \${partner.age} ${t('age_label') === 'Âge' ? 'ans' : t('age_label') === 'Age' ? 'years' : t('age_label') === 'Edad' ? 'años' : ''}</p>
                <p><strong>${t('project_life')} :</strong> \${partner.desireChild === 'Oui' ? '${t('yes')}' : '${t('no')}'}</p>
            \`;
            document.getElementById('details-popup').style.display = 'flex';
        }
        
        function sendRequest(receiverId, receiverName) {
            const message = prompt("Votre message d'introduction:", "Bonjour, je suis très intéressé par votre profil !");
            if (message) {
                fetch('/api/requests', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ receiverId, message })
                }).then(res => res.json()).then(data => {
                    if (data.success) {
                        showNotify('✅ Demande envoyée à ' + receiverName, 'success');
                    } else {
                        showNotify('❌ Erreur lors de l\'envoi', 'error');
                    }
                });
            }
        }
    </script>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur matching');
    }
});

// INBOX MULTILINGUE
app.get('/inbox', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const t = req.t;
        
        const messages = await Message.find({ $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }] })
            .populate('senderId receiverId').sort({ timestamp: -1 });
        
        const conversations = new Map();
        for (const msg of messages) {
            const otherUser = msg.senderId._id.equals(currentUser._id) ? msg.receiverId : msg.senderId;
            
            const otherUserDoc = await User.findById(otherUser._id);
            if (otherUserDoc && otherUserDoc.blockedBy?.includes(currentUser._id)) continue;
            if (currentUser.blockedUsers?.includes(otherUser._id)) continue;
            
            if (!conversations.has(otherUser._id.toString())) {
                const unreadCount = await Message.countDocuments({
                    senderId: otherUser._id,
                    receiverId: currentUser._id,
                    read: false
                });
                
                conversations.set(otherUser._id.toString(), { 
                    user: otherUser, 
                    lastMessage: msg,
                    unreadCount: unreadCount
                });
            }
        }
        
        let inboxHTML = '';
        if (conversations.size === 0) {
            inboxHTML = `<div class="empty-message"><span>📭</span><h3>${t('emptyInbox')}</h3><p>${t('startConversation')}</p><a href="/matching" class="btn-pink" style="width:auto; display:inline-block; margin-top:15px;">${t('findPartners')}</a></div>`;
        } else {
            conversations.forEach(conv => {
                const hasUnread = conv.unreadCount > 0;
                const unreadClass = hasUnread ? 'unread' : '';
                const unreadBadge = hasUnread ? `<span class="unread-badge">${conv.unreadCount}</span>` : '';
                const lastMessageText = conv.lastMessage.text.substring(0, 50) + (conv.lastMessage.text.length > 50 ? '...' : '');
                const timeAgo = formatTimeAgo(conv.lastMessage.timestamp, currentUser.language);
                
                inboxHTML += `<div class="inbox-item ${unreadClass}" onclick="window.location.href='/chat?partnerId=${conv.user._id}'">
                    <div style="flex:1">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <b class="user-name" style="font-size:1.3rem;">${conv.user.firstName} ${conv.user.lastName}${unreadBadge}</b>
                            <span style="font-size:0.9rem; color:#999;">${timeAgo}</span>
                        </div>
                        <div class="message-preview" style="font-size:1.1rem; margin-top:5px; ${hasUnread ? 'font-weight:600; color:#1a2a44;' : 'color:#666;'}">
                            ${lastMessageText}
                        </div>
                    </div>
                </div>`;
            });
        }
        
        const totalUnread = await Message.countDocuments({ receiverId: currentUser._id, read: false });
        const titleUnread = totalUnread > 0 ? ' (' + totalUnread + ')' : '';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('inboxTitle')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('inboxTitle')}${titleUnread}</h2>
            ${inboxHTML}
            <div class="navigation">
                <a href="/profile" class="nav-link">← ${t('backProfile')}</a>
                <a href="/matching" class="nav-link">${t('toMessages')}</a>
            </div>
        </div>
    </div>
</body>
</html>`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur inbox');
    }
});

// CHAT MULTILINGUE
app.get('/chat', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const t = req.t;
        const partnerId = req.query.partnerId;
        if (!partnerId) return res.redirect('/inbox');
        
        const partner = await User.findById(partnerId);
        if (!partner) return res.redirect('/inbox');
        
        if (partner.blockedBy?.includes(currentUser._id)) {
            return res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${t('blockedByUser')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('blockedByUser')}</h2>
            <p style="font-size:1.2rem; margin:30px 0;">${t('blockedMessage')}</p>
            <a href="/inbox" class="btn-pink">${t('backProfile')}</a>
        </div>
    </div>
</body>
</html>`);
        }
        
        if (currentUser.blockedUsers?.includes(partnerId)) return res.redirect('/inbox');
        
        await Message.updateMany(
            { senderId: partnerId, receiverId: currentUser._id, read: false },
            { read: true }
        );
        
        const messages = await Message.find({ 
            $or: [
                { senderId: currentUser._id, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUser._id }
            ] 
        }).sort({ timestamp: 1 });
        
        let messagesHTML = '';
        messages.forEach(m => {
            const classe = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            messagesHTML += `<div class="bubble ${classe}">${m.text}</div>`;
        });
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - Chat avec ${partner.firstName}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="chat-header">
            <span><b>${partner.firstName}</b></span>
            <button class="btn-action btn-block" onclick="blockUser('${partnerId}')" style="padding:10px 15px;">${t('block')}</button>
            <button onclick="window.location.href='/inbox'" style="background:none; border:none; color:white; font-size:1.5rem;">❌</button>
        </div>
        <div class="chat-messages" id="messages">
            ${messagesHTML}
        </div>
        <div class="input-area">
            <input id="msgInput" placeholder="${t('yourMessage')}">
            <button onclick="sendMessage('${partnerId}')">${t('send')}</button>
        </div>
    </div>
    <script>
        async function sendMessage(id){
            const msg = document.getElementById("msgInput");
            if(msg.value.trim()){
                await fetch("/api/messages", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({receiverId: id, text: msg.value})
                });
                location.reload();
            }
        }
        async function blockUser(id){
            if(confirm("${t('block')} ?")){
                await fetch("/api/block/"+id, {method: "POST"});
                window.location.href = "/inbox";
            }
        }
    </script>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur chat');
    }
});

// PARAMÈTRES MULTILINGUE
app.get('/settings', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const t = req.t;
        const blockedCount = currentUser.blockedUsers?.length || 0;
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('settingsTitle')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('settingsTitle')}</h2>
            <div class="st-group">
                <div class="st-item">${t('visibility')}<input type="checkbox" checked></div>
                <div class="st-item">${t('notifications')}<input type="checkbox"></div>
            </div>
            <div class="st-group">
                <div class="st-item">${t('language')}
                    <select onchange="window.location.href='/lang/'+this.value" style="padding:8px; border-radius:10px;">
                        <option value="fr" ${currentUser.language === 'fr' ? 'selected' : ''}>🇫🇷 ${t('french')}</option>
                        <option value="en" ${currentUser.language === 'en' ? 'selected' : ''}>🇬🇧 ${t('english')}</option>
                        <option value="pt" ${currentUser.language === 'pt' ? 'selected' : ''}>🇵🇹 ${t('portuguese')}</option>
                        <option value="es" ${currentUser.language === 'es' ? 'selected' : ''}>🇪🇸 ${t('spanish')}</option>
                        <option value="ar" ${currentUser.language === 'ar' ? 'selected' : ''}>🇸🇦 ${t('arabic')}</option>
                        <option value="zh" ${currentUser.language === 'zh' ? 'selected' : ''}>🇨🇳 ${t('chinese')}</option>
                    </select>
                </div>
            </div>
            <a href="/edit-profile" class="btn-dark">✏️ ${t('editProfile')}</a>
            <a href="/blocked-list" class="btn-dark">🚫 ${t('blockedUsers')} (${blockedCount})</a>
            <div class="st-group danger-zone">
                <div class="st-item" style="color:#dc3545;">${t('dangerZone')}</div>
                <div class="st-item">
                    <span>${t('deleteAccount')}</span>
                    <button class="btn-action btn-block" onclick="deleteAccount()">${t('delete')}</button>
                </div>
            </div>
            <div class="navigation">
                <a href="/profile" class="nav-link">← ${t('backProfile')}</a>
                <a href="/logout-success" class="nav-link" style="color:#ff416c;">${t('logout')}</a>
            </div>
        </div>
    </div>
    <script>
        async function deleteAccount(){
            if(confirm("${t('confirmDelete')}")){
                await fetch("/api/delete-account", {method: "DELETE"});
                window.location.href = "/logout-success";
            }
        }
    </script>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur paramètres');
    }
});

// LISTE DES BLOQUÉS MULTILINGUE
app.get('/blocked-list', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId).populate('blockedUsers');
        const t = req.t;
        
        let blockedHTML = '';
        if (currentUser.blockedUsers?.length) {
            currentUser.blockedUsers.forEach(user => {
                blockedHTML += `<div class="inbox-item" style="justify-content:space-between;">
                    <span><b style="font-size:1.3rem;">${user.firstName} ${user.lastName}</b></span>
                    <button class="btn-action" onclick="unblockUser('${user._id}')" style="background:#4CAF50; color:white;">${t('unblock')}</button>
                </div>`;
            });
        } else {
            blockedHTML = `<div class="empty-message"><span>🔓</span><p>${t('noBlocked')}</p></div>`;
        }
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('blockedUsers')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('blockedUsers')}</h2>
            ${blockedHTML}
            <a href="/settings" class="back-link">← ${t('backHome')}</a>
        </div>
    </div>
    <script>
        async function unblockUser(id){
            await fetch("/api/unblock/"+id, {method: "POST"});
            location.reload();
        }
    </script>
</body>
</html>`);
    } catch (error) {
        res.status(500).send('Erreur');
    }
});

// FIN DE CHAT MULTILINGUE
app.get('/chat-end', (req, res) => {
    const t = req.t;
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('thankYou')}</title>
    ${styles}
    ${notifyScript}
</head>
<body class="end-overlay">
    <div class="end-card">
        <h2 style="font-size:2.2rem;">${t('thankYou')}</h2>
        <p style="font-size:1.3rem; margin:25px 0;">${t('thanksMessage')}</p>
        <a href="/matching" class="btn-pink">${t('newSearch')}</a>
        <a href="/profile" class="btn-dark" style="margin-top:15px;">${t('myProfile')}</a>
    </div>
</body>
</html>`);
});

// DÉCONNEXION MULTILINGUE
app.get('/logout-success', (req, res) => {
    const t = req.t;
    req.session.destroy();
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('logoutSuccess')}</title>
    ${styles}
    ${notifyScript}
</head>
<body class="end-overlay">
    <div class="end-card">
        <h2 style="font-size:2.2rem;">${t('logoutSuccess')}</h2>
        <p style="font-size:1.3rem; margin:25px 0;">${t('seeYouSoon')}</p>
        <a href="/" class="btn-pink">${t('home')}</a>
    </div>
</body>
</html>`);
});

// ============================================
// ROUTES API POUR LES DEMANDES
// ============================================

// Envoyer une demande de premier contact
app.post('/api/requests', requireAuth, requireVerified, async (req, res) => {
    try {
        const senderId = req.session.userId;
        const { receiverId, message } = req.body;
        
        // Vérifier s'il y a déjà une conversation entre ces deux personnes
        const existingConversation = await Message.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        });
        
        if (existingConversation) {
            // Si conversation existe, créer directement le message
            const newMessage = new Message({
                senderId: senderId,
                receiverId: receiverId,
                text: message,
                read: false
            });
            await newMessage.save();
            return res.json({ success: true, direct: true });
        }
        
        // Vérifier si une demande est déjà en attente
        const existingRequest = await Request.findOne({
            senderId: senderId,
            receiverId: receiverId,
            status: 'pending'
        });
        
        if (existingRequest) {
            return res.status(400).json({ error: 'Une demande est déjà en attente' });
        }
        
        // Créer une nouvelle demande
        const request = new Request({
            senderId: senderId,
            receiverId: receiverId,
            message: message,
            status: 'pending'
        });
        await request.save();
        
        res.json({ success: true, pending: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer les demandes en attente pour l'utilisateur connecté
app.get('/api/requests/pending', requireAuth, requireVerified, async (req, res) => {
    try {
        const requests = await Request.find({
            receiverId: req.session.userId,
            status: 'pending'
        }).populate('senderId', 'firstName lastName genotype residence dob');
        
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Accepter une demande
app.post('/api/requests/:id/accept', requireAuth, requireVerified, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        
        if (!request) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }
        
        if (request.receiverId._id.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        
        // Créer le premier message
        const message = new Message({
            senderId: request.senderId._id,
            receiverId: request.receiverId._id,
            text: request.message,
            read: false
        });
        await message.save();
        
        // Envoyer un message de confirmation au demandeur
        const confirmationMessage = new Message({
            senderId: request.receiverId._id,
            receiverId: request.senderId._id,
            text: `✅ ${request.receiverId.firstName} a accepté votre demande. Vous pouvez maintenant échanger !`,
            read: false
        });
        await confirmationMessage.save();
        
        // Mettre à jour le statut de la demande
        request.status = 'accepted';
        await request.save();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ignorer une demande
app.post('/api/requests/:id/ignore', requireAuth, requireVerified, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        
        if (!request) {
            return res.status(404).json({ error: 'Demande non trouvée' });
        }
        
        if (request.receiverId._id.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        
        // Envoyer un message de rejet bienveillant
        const rejectMessage = new Message({
            senderId: request.receiverId._id,
            receiverId: request.senderId._id,
            text: `🌸 Merci pour votre message. Cette personne préfère ne pas donner suite pour le moment. Continuez votre chemin, la bonne personne vous attend ailleurs.`,
            read: false
        });
        await rejectMessage.save();
        
        // Mettre à jour le statut de la demande
        request.status = 'rejected';
        await request.save();
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// AUTRES ROUTES API
// ============================================

// CONNEXION
app.post('/api/login', async (req, res) => {
    try {
        const { firstName } = req.body;
        const user = await User.findOne({ firstName: firstName }).sort({ createdAt: -1 });
        
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        await new Promise((resolve) => {
            req.session.userId = user._id;
            req.session.isVerified = user.isVerified;
            req.session.save(resolve);
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENREGISTREMENT
app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        
        await new Promise((resolve) => {
            req.session.userId = newUser._id;
            req.session.isVerified = false;
            req.session.save(resolve);
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VALIDATION D'HONNEUR
app.post('/api/validate-honor', requireAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, { isVerified: true });
        
        await new Promise((resolve) => {
            req.session.isVerified = true;
            req.session.save(resolve);
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ENVOI MESSAGE (pour conversations existantes)
app.post('/api/messages', requireAuth, requireVerified, async (req, res) => {
    try {
        const message = new Message({ 
            senderId: req.session.userId, 
            receiverId: req.body.receiverId, 
            text: req.body.text, 
            read: false 
        });
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RÉCUPÉRATION DES MESSAGES NON LUS
app.get('/api/messages/unread', requireAuth, requireVerified, async (req, res) => {
    try {
        const count = await Message.countDocuments({ 
            receiverId: req.session.userId, 
            read: false 
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BLOQUER AVEC EFFET MIROIR
app.post('/api/block/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const targetUserId = req.params.userId;
        
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.blockedUsers) currentUser.blockedUsers = [];
        if (!currentUser.blockedUsers.includes(targetUserId)) {
            currentUser.blockedUsers.push(targetUserId);
            await currentUser.save();
        }
        
        const targetUser = await User.findById(targetUserId);
        if (!targetUser.blockedBy) targetUser.blockedBy = [];
        if (!targetUser.blockedBy.includes(currentUserId)) {
            targetUser.blockedBy.push(currentUserId);
            await targetUser.save();
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DÉBLOQUER AVEC EFFET MIROIR
app.post('/api/unblock/:userId', requireAuth, requireVerified, async (req, res) => {
    try {
        const currentUserId = req.session.userId;
        const targetUserId = req.params.userId;
        
        const currentUser = await User.findById(currentUserId);
        if (currentUser.blockedUsers) {
            currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== targetUserId);
            await currentUser.save();
        }
        
        const targetUser = await User.findById(targetUserId);
        if (targetUser.blockedBy) {
            targetUser.blockedBy = targetUser.blockedBy.filter(id => id.toString() !== currentUserId);
            await targetUser.save();
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// MISE À JOUR PROFIL
app.put('/api/users/profile', requireAuth, requireVerified, async (req, res) => {
    try {
        const allowedUpdates = ['firstName','lastName','gender','dob','residence','genotype','bloodGroup','desireChild','photo'];
        const updates = {};
        allowedUpdates.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        await User.findByIdAndUpdate(req.session.userId, updates);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUPPRIMER COMPTE
app.delete('/api/delete-account', requireAuth, requireVerified, async (req, res) => {
    try {
        const userId = req.session.userId;
        await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
        await Request.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
        await User.updateMany({ blockedBy: userId }, { $pull: { blockedBy: userId } });
        await User.findByIdAndDelete(userId);
        req.session.destroy();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SANTÉ
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ============================================
// GESTION 404 MULTILINGUE
// ============================================
app.use((req, res) => {
    const t = req.t;
    
    res.status(404).send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>404 - ${t('appName')}</title>
    ${styles}
    ${notifyScript}
</head>
<body class="end-overlay">
    <div class="end-card">
        <h2>${t('pageNotFound')}</h2>
        <p style="margin:20px;">${t('pageNotFoundMessage')}</p>
        <a href="/" class="btn-pink">${t('home')}</a>
    </div>
</body>
</html>`);
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
    console.log('🚀 Genlove démarré sur http://localhost:' + port);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('✅ Déconnexion MongoDB');
        process.exit(0);
    });
});