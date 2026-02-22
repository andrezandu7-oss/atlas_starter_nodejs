const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;

// ========================
// CONNEXION MONGODB
// ========================
const mongouRI = process.env.MONGODB_URI || 'mongodb://localhost:27017/genlove';

mongoose.connect(mongouRI)
    .then(() => console.log("✅ Connecté à MongoDB pour Genlove !"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// ========================
// CONFIGURATION SESSION
// ========================
app.set('trust proxy', 1);

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'genlove-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongouRI }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    },
    proxy: true
};

app.use(session(sessionConfig));

// ========================
// MODÈLES DE DONNÉES
// ========================
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
    rejectedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

const requestSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    viewed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', requestSchema);

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/');
    next();
};

const requireVerified = (req, res, next) => {
    if (!req.session.isVerified) return res.redirect('/sas-validation');
    next();
};

// ==============================================
// SYSTÈME DE TRADUCTION MULTILINGUE COMPLET (6 LANGUES)
// ==============================================
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
        honorText: 'Je confirme sur mon honneur que mes informations sont sincères et conformes à la réalité.',
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
        findPartner: 'Trouver un partenaire',
        editProfile: 'Modifier mon profil',
        compatiblePartners: 'Partenaires compatibles',
        noPartners: 'Aucun partenaire trouvé pour le moment',
        searchOngoing: 'Recherche en cours...',
        expandCommunity: 'Nous élargissons notre communauté. Revenez bientôt !',
        details: 'Détails',
        contact: 'Contacter',
        backProfile: '← Mon profil',
        toMessages: 'Messages →',
        healthCommitment: 'Votre engagement santé',
        popupMessageAS: 'En tant que profil AS, nous ne vous présentons que des partenaires AA. Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose.',
        popupMessageSS: 'En tant que profil SS, nous ne vous présentons que des partenaires AA. Ce choix responsable garantit la sérénité de votre futur foyer et protège votre descendance contre la drépanocytose.',
        understood: 'J\'ai compris',
        inboxTitle: 'Boîte de réception',
        emptyInbox: 'Boîte vide',
        startConversation: 'Commencez une conversation !',
        findPartners: 'Trouver des partenaires',
        block: 'Bloquer',
        unblock: 'Débloquer',
        yourMessage: 'Votre message...',
        send: 'Envoyer',
        blockedByUser: 'Conversation impossible',
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
        interestPopup: '{name} est très attiré par votre profil car vous partagez une bonne compatibilité. Pouvez-vous prendre quelques minutes pour échanger ?',
        acceptRequest: '✓ Accepter',
        rejectRequest: '✗ Refuser',
        rejectionPopup: 'Désolé, {name} n\'a pas donné une suite favorable à votre demande. Lancez d\'autres recherches.',
        gotIt: 'J\'ai compris',
        returnProfile: '📋 Mon profil',
        newMatch: '🔍 Nouvelle recherche',
        sendingRequest: '⏳ Votre demande est en cours d\'envoi...',
        requestSent: '✅ Demande envoyée !',
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
        december: 'Décembre',
        day: 'Jour',
        month: 'Mois',
        year: 'Année'
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
        honorText: 'I confirm on my honor that my information is sincere and conforms to reality.',
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
        findPartner: 'Find a partner',
        editProfile: 'Edit my profile',
        compatiblePartners: 'Compatible partners',
        noPartners: 'No partners found at the moment',
        searchOngoing: 'Search in progress...',
        expandCommunity: 'We are expanding our community. Come back soon!',
        details: 'Details',
        contact: 'Contact',
        backProfile: '← My profile',
        toMessages: 'Messages →',
        healthCommitment: 'Your health commitment',
        popupMessageAS: 'As an AS profile, we only show you AA partners. This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease.',
        popupMessageSS: 'As an SS profile, we only show you AA partners. This responsible choice guarantees the serenity of your future family and protects your offspring against sickle cell disease.',
        understood: 'I understand',
        inboxTitle: 'Inbox',
        emptyInbox: 'Empty inbox',
        startConversation: 'Start a conversation!',
        findPartners: 'Find partners',
        block: 'Block',
        unblock: 'Unblock',
        yourMessage: 'Your message...',
        send: 'Send',
        blockedByUser: 'Conversation impossible',
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
        interestPopup: '{name} is very attracted to your profile because you share good compatibility. Can you take a few minutes to chat?',
        acceptRequest: '✓ Accept',
        rejectRequest: '✗ Reject',
        rejectionPopup: 'Sorry, {name} did not give a favorable response to your request. Start other searches.',
        gotIt: 'Got it',
        returnProfile: '📋 My profile',
        newMatch: '🔍 New search',
        sendingRequest: '⏳ Your request is being sent...',
        requestSent: '✅ Request sent!',
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
        december: 'December',
        day: 'Day',
        month: 'Month',
        year: 'Year'
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
        honorText: 'Confirmo por minha honra que minhas informações são sinceras e conformes à realidade.',
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
        findPartner: 'Encontrar parceiro(a)',
        editProfile: 'Editar perfil',
        compatiblePartners: 'Parceiros compatíveis',
        noPartners: 'Nenhum parceiro encontrado no momento',
        searchOngoing: 'Pesquisa em andamento...',
        expandCommunity: 'Estamos expandindo nossa comunidade. Volte em breve!',
        details: 'Detalhes',
        contact: 'Contatar',
        backProfile: '← Meu perfil',
        toMessages: 'Mensagens →',
        healthCommitment: 'Seu compromisso com a saúde',
        popupMessageAS: 'Como perfil AS, mostramos apenas parceiros AA. Esta escolha responsável garante a serenidade do seu futuro lar e protege seus descendentes contra a doença falciforme.',
        popupMessageSS: 'Como perfil SS, mostramos apenas parceiros AA. Esta escolha responsável garante a serenidade do seu futuro lar e protege seus descendentes contra a doença falciforme.',
        understood: 'Entendi',
        inboxTitle: 'Caixa de entrada',
        emptyInbox: 'Caixa vazia',
        startConversation: 'Comece uma conversa!',
        findPartners: 'Encontrar parceiros',
        block: 'Bloquear',
        unblock: 'Desbloquear',
        yourMessage: 'Sua mensagem...',
        send: 'Enviar',
        blockedByUser: 'Conversa impossível',
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
        interestPopup: '{name} está muito atraído(a) pelo seu perfil porque vocês compartilham boa compatibilidade. Você pode alguns minutos para conversar?',
        acceptRequest: '✓ Aceitar',
        rejectRequest: '✗ Recusar',
        rejectionPopup: 'Desculpe, {name} não deu um retorno favorável ao seu pedido. Faça outras pesquisas.',
        gotIt: 'Entendi',
        returnProfile: '📋 Meu perfil',
        newMatch: '🔍 Nova pesquisa',
        sendingRequest: '⏳ Seu pedido está sendo enviado...',
        requestSent: '✅ Pedido enviado!',
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
        december: 'Dezembro',
        day: 'Dia',
        month: 'Mês',
        year: 'Ano'
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
        honorText: 'Confirmo bajo mi honor que mi información es sincera y conforme a la realidad.',
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
        findPartner: 'Encontrar pareja',
        editProfile: 'Editar perfil',
        compatiblePartners: 'Parejas compatibles',
        noPartners: 'No se encontraron parejas por el momento',
        searchOngoing: 'Búsqueda en curso...',
        expandCommunity: 'Estamos expandiendo nuestra comunidad. ¡Vuelva pronto!',
        details: 'Detalles',
        contact: 'Contactar',
        backProfile: '← Mi perfil',
        toMessages: 'Mensajes →',
        healthCommitment: 'Su compromiso con la salud',
        popupMessageAS: 'Como perfil AS, solo le mostramos parejas AA. Esta elección responsable garantiza la serenidad de su futuro hogar y protege a su descendencia contra la enfermedad de células falciformes.',
        popupMessageSS: 'Como perfil SS, solo le mostramos parejas AA. Esta elección responsable garantiza la serenidad de su futuro hogar y protege a su descendencia contra la enfermedad de células falciformes.',
        understood: 'Entiendo',
        inboxTitle: 'Bandeja de entrada',
        emptyInbox: 'Bandeja vacía',
        startConversation: '¡Comience una conversación!',
        findPartners: 'Encontrar parejas',
        block: 'Bloquear',
        unblock: 'Desbloquear',
        yourMessage: 'Su mensaje...',
        send: 'Enviar',
        blockedByUser: 'Conversación imposible',
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
        interestPopup: '{name} está muy atraído(a) por tu perfil porque comparten buena compatibilidad. ¿Puedes tomar unos minutos para conversar?',
        acceptRequest: '✓ Aceptar',
        rejectRequest: '✗ Rechazar',
        rejectionPopup: 'Lo sentimos, {name} no dio una respuesta favorable a tu solicitud. Realiza otras búsquedas.',
        gotIt: 'Entiendo',
        returnProfile: '📋 Mi perfil',
        newMatch: '🔍 Nueva búsqueda',
        sendingRequest: '⏳ Tu solicitud está siendo enviada...',
        requestSent: '✅ Solicitud enviada!',
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
        december: 'Diciembre',
        day: 'Día',
        month: 'Mes',
        year: 'Año'
    },
    ar: {
        appName: 'جينلوف',
        slogan: '💑 وحد القلب والصحة لبناء أزواج أصحاء',
        security: '🛡️ بياناتك الصحية مشفرة',
        welcome: 'مرحباً بك في جينلوف',
        haveAccount: 'هل لديك حساب بالفعل؟',
        login: 'تسجيل الدخول',
        createAccount: 'إنشاء حساب',
        loginTitle: 'تسجيل الدخول',
        enterName: 'أدخل اسمك الأول لتسجيل الدخول',
        yourName: 'اسمك الأول',
        backHome: '→ العودة إلى الرئيسية',
        nameNotFound: 'الاسم غير موجود. يرجى إنشاء حساب.',
        charterTitle: '📜 ميثاق الشرف',
        charterSubtitle: 'اقرأ هذه الالتزامات الخمسة بعناية',
        scrollDown: '⬇️ انتقل إلى الأسفل ⬇️',
        accept: 'أقبل وأواصل',
        oath1: '١. قسم الإخلاص',
        oath1Sub: 'الحقيقة الطبية',
        oath1Text: 'أتعهد بشرفي بتقديم معلومات دقيقة عن نمطي الوراثي وبياناتي الصحية.',
        oath2: '٢. ميثاق السرية',
        oath2Sub: 'السر المشترك',
        oath2Text: 'ألتزم بالحفاظ على سرية جميع المعلومات الشخصية والطبية.',
        oath3: '٣. مبدأ عدم التمييز',
        oath3Sub: 'المساواة في الاحترام',
        oath3Text: 'أعامل كل عضو بكرامة، بغض النظر عن نمطه الوراثي.',
        oath4: '٤. المسؤولية الوقائية',
        oath4Sub: 'التوجيه الصحي',
        oath4Text: 'أقبل تدابير الحماية مثل تصفية التوافقيات الخطرة.',
        oath5: '٥. الإحسان الأخلاقي',
        oath5Sub: 'المجاملة',
        oath5Text: 'أعتمد سلوكاً مثالياً ومحترماً في رسائلي.',
        signupTitle: 'إنشاء ملفي الشخصي',
        signupSub: 'جميع المعلومات سرية',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        gender: 'الجنس',
        male: 'ذكر',
        female: 'أنثى',
        dob: 'تاريخ الميلاد',
        city: 'مدينة الإقامة',
        genotype: 'النمط الوراثي',
        bloodGroup: 'فصيلة الدم',
        desireChild: 'الرغبة في الأطفال؟',
        yes: 'نعم',
        no: 'لا',
        createProfile: 'إنشاء ملفي الشخصي',
        backCharter: '→ العودة إلى الميثاق',
        required: 'إلزامي',
        honorTitle: 'قسم الشرف',
        honorText: 'أؤكد بشرفي أن معلوماتي صادقة ومطابقة للواقع.',
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
        findPartner: 'العثور على شريك',
        editProfile: 'تعديل الملف الشخصي',
        compatiblePartners: 'الشركاء المتوافقون',
        noPartners: 'لم يتم العثور على شركاء في الوقت الحالي',
        searchOngoing: 'البحث جار...',
        expandCommunity: 'نحن نوسع مجتمعنا. عد قريباً!',
        details: 'التفاصيل',
        contact: 'اتصال',
        backProfile: '→ ملفي الشخصي',
        toMessages: '→ الرسائل',
        healthCommitment: 'التزامك الصحي',
        popupMessageAS: 'كملف AS، نحن نعرض لك فقط شركاء AA. هذا الاختيار المسؤول يضمن سكينة منزلك المستقبلي ويحمي نسلك من مرض الخلايا المنجلية.',
        popupMessageSS: 'كملف SS، نحن نعرض لك فقط شركاء AA. هذا الاختيار المسؤول يضمن سكينة منزلك المستقبلي ويحمي نسلك من مرض الخلايا المنجلية.',
        understood: 'فهمت',
        inboxTitle: 'صندوق الوارد',
        emptyInbox: 'صندوق فارغ',
        startConversation: 'ابدأ محادثة!',
        findPartners: 'العثور على شركاء',
        block: 'حظر',
        unblock: 'إلغاء الحظر',
        yourMessage: 'رسالتك...',
        send: 'إرسال',
        blockedByUser: 'محادثة غير ممكنة',
        blockedMessage: 'هذا المستخدم قام بحظرك. لا يمكنك إرسال رسائل له.',
        settingsTitle: 'الإعدادات',
        visibility: 'رؤية الملف الشخصي',
        notifications: 'إشعارات فورية',
        language: 'اللغة',
        blockedUsers: 'المستخدمون المحظورون',
        dangerZone: '⚠️ منطقة الخطر',
        deleteAccount: '🗑️ حذف حسابي',
        delete: 'حذف',
        logout: 'تسجيل الخروج',
        confirmDelete: 'حذف نهائياً؟',
        noBlocked: 'لا يوجد مستخدمين محظورين',
        thankYou: 'شكراً لهذا التبادل',
        thanksMessage: 'جينلوف تشكرك',
        newSearch: 'بحث جديد',
        logoutSuccess: 'تم تسجيل الخروج بنجاح',
        seeYouSoon: 'أراك قريباً!',
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
        interestPopup: '{name} مهتم جداً بملفك الشخصي لأنكما تشاركان توافقاً جيداً. هل يمكنك أخذ بضع دقائق للدردشة؟',
        acceptRequest: '✓ قبول',
        rejectRequest: '✗ رفض',
        rejectionPopup: 'عذراً، {name} لم يعط رداً إيجابياً لطلبك. قم بإجراء عمليات بحث أخرى.',
        gotIt: 'فهمت',
        returnProfile: '📋 ملفي الشخصي',
        newMatch: '🔍 بحث جديد',
        sendingRequest: '⏳ جاري إرسال طلبك...',
        requestSent: '✅ تم إرسال الطلب!',
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
        december: 'ديسمبر',
        day: 'يوم',
        month: 'شهر',
        year: 'سنة'
    },
    zh: {
        appName: '真爱基因',
        slogan: '💑 结合心灵与健康，建立健康的伴侣关系',
        security: '🛡️ 您的健康数据已加密',
        welcome: '欢迎来到真爱基因',
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
        honorText: '我以荣誉确认我的信息是真实的，符合实际情况。',
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
        findPartner: '寻找伴侣',
        editProfile: '编辑个人资料',
        compatiblePartners: '兼容的伴侣',
        noPartners: '目前未找到伴侣',
        searchOngoing: '搜索中...',
        expandCommunity: '我们正在扩大社区。请稍后再来！',
        details: '详情',
        contact: '联系',
        backProfile: '← 我的个人资料',
        toMessages: '消息 →',
        healthCommitment: '您的健康承诺',
        popupMessageAS: '作为AS档案，我们只向您展示AA伴侣。这一负责任的选择保证了您未来家庭的安宁，并保护您的后代免受镰状细胞病的影响。',
        popupMessageSS: '作为SS档案，我们只向您展示AA伴侣。这一负责任的选择保证了您未来家庭的安宁，并保护您的后代免受镰状细胞病的影响。',
        understood: '我明白',
        inboxTitle: '收件箱',
        emptyInbox: '空收件箱',
        startConversation: '开始对话！',
        findPartners: '寻找伴侣',
        block: '屏蔽',
        unblock: '解除屏蔽',
        yourMessage: '您的消息...',
        send: '发送',
        blockedByUser: '无法对话',
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
        thankYou: '感谢您的交流',
        thanksMessage: '真爱基因感谢您',
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
        interestPopup: '{name} 被您的个人资料深深吸引，因为你们有良好的兼容性。您能花几分钟聊聊吗？',
        acceptRequest: '✓ 接受',
        rejectRequest: '✗ 拒绝',
        rejectionPopup: '抱歉，{name} 没有对您的请求给予积极回应。继续搜索吧。',
        gotIt: '明白了',
        returnProfile: '📋 我的个人资料',
        newMatch: '🔍 新搜索',
        sendingRequest: '⏳ 您的请求正在发送中...',
        requestSent: '✅ 请求已发送！',
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
        december: '十二月',
        day: '日',
        month: '月',
        year: '年'
    }
};

// Middleware de traduction
app.use(async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            req.lang = (user && user.language) ? user.language : 'fr';
        } catch {
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
        let text = translations[req.lang]?.[key] || translations.fr[key] || key;
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    };
    next();
});

// ============================================
// STYLES CSS COMPLETS AVEC NOUVEAUX STYLES
// ============================================
const styles = `
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
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
        margin: 0 auto;
    }
    .page-white {
        background: white;
        padding: 20px;
        flex: 1;
    }
    h1 { font-size: 2.4rem; margin: 10px 0; }
    h2 { font-size: 2rem; margin-bottom: 20px; color: #1a2a44; }
    h3 { font-size: 1.6rem; margin: 15px 0; }
    p { font-size: 1.2rem; line-height: 1.6; }
    
    /* Nouveau logo avec coeur ADN */
    .logo-container {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 20px;
    }
    .logo-text {
        font-size: 5rem;
        font-weight: 800;
        margin: 10px 0 20px;
        letter-spacing: -2px;
        text-shadow: 4px 4px 0 rgba(255,65,108,0.1);
        text-align: center;
    }
    .slogan {
        font-weight: 500;
        color: #1a2a44;
        margin: 10px 25px 30px;
        font-size: 1.2rem;
        line-height: 1.5;
        text-align: center;
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
    
    /* Sélecteur de langue compact */
    .language-selector-compact {
        position: relative;
        margin: 10px 0 20px;
    }
    .lang-btn-compact {
        background: white;
        border: 2px solid #ff416c;
        color: #1a2a44;
        padding: 10px 20px;
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .lang-btn-compact:hover {
        background: #ff416c;
        color: white;
    }
    .language-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 1000;
        min-width: 180px;
        margin-top: 5px;
    }
    .dropdown-item {
        display: block;
        padding: 12px 20px;
        text-decoration: none;
        color: #1a2a44;
        border-bottom: 1px solid #eee;
        transition: background 0.2s;
    }
    .dropdown-item:last-child {
        border-bottom: none;
    }
    .dropdown-item:hover {
        background: #f8f9fa;
    }
    
    /* Boutons */
    .btn-pink, .btn-dark {
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
        padding: 10px 15px;
        font-size: 0.9rem;
        font-weight: 600;
        border-radius: 30px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-contact { background: #ff416c; color: white; }
    .btn-details { background: #1a2a44; color: white; }
    .btn-block { background: #dc3545; color: white; }
    
    /* Inputs */
    .input-box {
        width: 100%;
        padding: 14px;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        margin: 8px 0;
        font-size: 1rem;
        background: #f8f9fa;
        transition: all 0.3s;
    }
    .input-box:focus {
        border-color: #ff416c;
        outline: none;
        box-shadow: 0 0 0 4px rgba(255,65,108,0.2);
    }
    .input-label {
        text-align: left;
        font-size: 0.9rem;
        color: #1a2a44;
        margin-top: 10px;
        font-weight: 600;
    }
    
    /* Date picker horizontal */
    .custom-date-picker {
        display: flex;
        gap: 5px;
        margin: 10px 0;
    }
    .date-part {
        flex: 1;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        font-size: 0.9rem;
        background: #f8f9fa;
    }
    .date-part:focus {
        border-color: #ff416c;
        outline: none;
    }
    
    /* Photo */
    .photo-circle {
        width: 110px;
        height: 110px;
        border: 4px solid #ff416c;
        border-radius: 50%;
        margin: 15px auto;
        background-size: cover;
        background-position: center;
        box-shadow: 0 10px 25px rgba(255,65,108,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    
    /* Match cards */
    .match-card {
        background: white;
        border-radius: 25px;
        margin: 10px 15px;
        padding: 15px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .match-photo-blur {
        width: 55px;
        height: 55px;
        border-radius: 50%;
        background: #eee;
        filter: blur(6px);
        flex-shrink: 0;
    }
    .match-info {
        flex: 1;
    }
    .match-actions {
        display: flex;
        gap: 8px;
    }
    
    /* Style groups */
    .st-group {
        background: white;
        border-radius: 15px;
        margin: 0 15px 15px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        text-align: left;
    }
    .st-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #f8f8f8;
        color: #333;
        font-size: 0.95rem;
    }
    .st-item:last-child {
        border-bottom: none;
    }
    
    /* Charte améliorée */
    .charte-box {
        height: 400px;
        overflow-y: auto;
        background: #fff5f7;
        border: 2px solid #ffdae0;
        border-radius: 25px;
        padding: 30px;
        font-size: 1.1rem;
        color: #1a2a44;
        line-height: 1.6;
        margin: 20px 0;
        text-align: left;
    }
    .charte-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px dashed #ffdae0;
    }
    .charte-section:last-child {
        border-bottom: none;
    }
    .charte-title {
        color: #ff416c;
        font-size: 1.3rem;
        font-weight: bold;
        margin-bottom: 8px;
    }
    .charte-subtitle {
        color: #1a2a44;
        font-size: 1.1rem;
        font-style: italic;
        margin-bottom: 8px;
    }
    .scroll-indicator {
        text-align: center;
        color: #ff416c;
        font-size: 1rem;
        margin: 15px 0;
        padding: 10px;
        background: rgba(255,65,108,0.1);
        border-radius: 40px;
    }
    
    /* Popups */
    #request-popup, #rejection-popup, #loading-popup, #genlove-popup, #popup-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        padding: 20px;
        backdrop-filter: blur(5px);
    }
    .popup-card, .popup-content {
        background: white;
        border-radius: 30px;
        padding: 30px 25px;
        max-width: 380px;
        width: 100%;
        text-align: center;
        animation: popupAppear 0.4s ease-out;
        border: 3px solid #ff416c;
        box-shadow: 0 20px 40px rgba(255,65,108,0.3);
        position: relative;
    }
    .close-popup {
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }
    .popup-icon {
        font-size: 3rem;
        margin-bottom: 10px;
    }
    .popup-title {
        color: #ff416c;
        font-size: 1.4rem;
        font-weight: bold;
        margin-bottom: 15px;
    }
    .popup-message, .popup-msg {
        color: #1a2a44;
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 20px;
        padding: 0 10px;
    }
    .popup-msg {
        background: #e7f3ff;
        padding: 15px;
        border-radius: 12px;
        border-left: 5px solid #007bff;
        text-align: left;
    }
    .popup-buttons {
        display: flex;
        gap: 15px;
        margin: 15px 0;
    }
    .popup-buttons button {
        flex: 1;
        padding: 15px;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
    }
    .accept-btn { background: #ff416c; color: white; }
    .reject-btn { background: #1a2a44; color: white; }
    .action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    .ok-btn {
        background: #ff416c;
        color: white;
        padding: 15px;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
    }
    
    /* Loader */
    #loader {
        display: none;
        position: absolute;
        inset: 0;
        background: white;
        z-index: 100;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 20px;
    }
    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #ff416c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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
    
    /* Notification */
    #genlove-notify {
        position: fixed;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 380px;
        background: #1a2a44;
        color: white;
        padding: 15px 20px;
        border-radius: 60px;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: 0.5s;
        z-index: 9999;
        box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        border-left: 5px solid #ff416c;
        font-size: 1rem;
    }
    #genlove-notify.show { top: 20px; }
    
    /* Navigation */
    .navigation {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    .nav-link {
        flex: 1;
        text-align: center;
        padding: 12px;
        background: white;
        text-decoration: none;
        color: #1a2a44;
        border-radius: 30px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        font-size: 1rem;
    }
    .back-link {
        display: inline-block;
        margin: 15px 0;
        color: #666;
        text-decoration: none;
        font-size: 1rem;
    }
    
    /* Info bubble */
    .info-bubble {
        background: #e7f3ff;
        color: #1a2a44;
        padding: 15px;
        border-radius: 12px;
        margin: 15px;
        font-size: 0.9rem;
        border-left: 5px solid #007bff;
        text-align: left;
    }
    
    /* Switch */
    .switch {
        position: relative;
        display: inline-block;
        width: 45px;
        height: 24px;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }
    input:checked + .slider {
        background-color: #ff416c;
    }
    input:checked + .slider:before {
        transform: translateX(21px);
    }
    
    /* Danger zone */
    .danger-zone {
        border: 2px solid #dc3545;
        background: #fff5f5;
        margin-top: 30px;
    }
    
    /* Empty message */
    .empty-message {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        background: white;
        border-radius: 25px;
        margin: 20px 0;
        font-size: 1.1rem;
    }
    
    /* Unread badges */
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
    
    /* Chat */
    .chat-header {
        background: #1a2a44;
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.1rem;
    }
    .chat-messages {
        padding: 20px;
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #f5f7fb;
    }
    .bubble {
        padding: 12px 18px;
        border-radius: 20px;
        max-width: 80%;
        font-size: 1rem;
        line-height: 1.4;
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
        display: flex;
        gap: 10px;
        padding: 15px;
        background: white;
        border-top: 2px solid #eee;
    }
    .input-area input {
        flex: 1;
        padding: 12px 20px;
        font-size: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 30px;
        outline: none;
    }
    .input-area input:focus {
        border-color: #ff416c;
    }
    .input-area button {
        padding: 12px 25px;
        background: #ff416c;
        color: white;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
    }
    
    /* Inbox */
    .inbox-item {
        background: white;
        border-radius: 25px;
        margin: 10px 0;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        cursor: pointer;
        transition: all 0.3s;
    }
    .inbox-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(255,65,108,0.15);
    }
    .inbox-item.unread {
        background: #e8f0fe;
        border-left: 5px solid #ff416c;
    }
    
    /* Serment */
    .serment-container {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 12px;
        border: 1px solid #ffdae0;
        text-align: left;
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin: 10px 0;
    }
    .serment-text {
        font-size: 0.85rem;
        color: #d63384;
        line-height: 1.4;
    }
    
    @media (max-width: 420px) {
        body { font-size: 15px; }
        .app-shell { max-width: 100%; }
        .logo-text { font-size: 4rem; }
        h2 { font-size: 1.8rem; }
        .btn-pink, .btn-dark { width: 95%; padding: 15px; }
        .custom-date-picker { flex-direction: row; }
        .date-part { padding: 10px; }
    }
</style>
`;

// ============================================
// NOTIFICATION SCRIPT
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
    setTimeout(() => n.classList.remove('show'), 3000);
}
function vibrate(pattern) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
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
    const months = {
        fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    };
    const monthList = months[lang] || months.fr;
    const currentYear = new Date().getFullYear();
    const selected = selectedDate ? new Date(selectedDate) : null;
    
    let html = '<div class="custom-date-picker">';
    
    // Jour
    html += '<select name="day" class="date-part" required><option value="">' + t('day') + '</option>';
    for (let d = 1; d <= 31; d++) {
        const sel = (selected && selected.getDate() === d) ? 'selected' : '';
        html += `<option value="${d}" ${sel}>${d}</option>`;
    }
    html += '</select>';
    
    // Mois
    html += '<select name="month" class="date-part" required><option value="">' + t('month') + '</option>';
    for (let m = 0; m < 12; m++) {
        const monthVal = m + 1;
        const sel = (selected && selected.getMonth() === m) ? 'selected' : '';
        html += `<option value="${monthVal}" ${sel}>${monthList[m]}</option>`;
    }
    html += '</select>';
    
    // Année
    html += '<select name="year" class="date-part" required><option value="">' + t('year') + '</option>';
    for (let y = currentYear - 100; y <= currentYear - 18; y++) {
        const sel = (selected && selected.getFullYear() === y) ? 'selected' : '';
        html += `<option value="${y}" ${sel}>${y}</option>`;
    }
    html += '</select></div>';
    
    return html;
}

// ============================================
// ROUTES
// ============================================

// Route pour changer de langue
app.get('/lang/:lang', async (req, res) => {
    const lang = req.params.lang;
    if (['fr','en','pt','es','ar','zh'].includes(lang)) {
        if (req.session.userId) {
            await User.findByIdAndUpdate(req.session.userId, { language: lang });
        }
        req.session.lang = lang;
    }
    res.redirect(req.get('referer') || '/');
});

// ACCUEIL avec nouveau logo et sélecteur compact
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
            <!-- Sélecteur de langue compact -->
            <div class="language-selector-compact">
                <button onclick="toggleLanguageDropdown()" class="lang-btn-compact">
                    <span>🌐</span> 
                    <span id="selected-language">${t('french')}</span>
                    <span style="font-size: 0.8rem;">▼</span>
                </button>
                <div id="language-dropdown" class="language-dropdown">
                    <a href="/lang/fr" class="dropdown-item">🇫🇷 ${t('french')}</a>
                    <a href="/lang/en" class="dropdown-item">🇬🇧 ${t('english')}</a>
                    <a href="/lang/pt" class="dropdown-item">🇵🇹 ${t('portuguese')}</a>
                    <a href="/lang/es" class="dropdown-item">🇪🇸 ${t('spanish')}</a>
                    <a href="/lang/ar" class="dropdown-item">🇸🇦 ${t('arabic')}</a>
                    <a href="/lang/zh" class="dropdown-item">🇨🇳 ${t('chinese')}</a>
                </div>
            </div>
            
            <!-- Nouveau logo coeur ADN avec loupe -->
            <div class="logo-container">
                <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                    <!-- Cœur principal -->
                    <path d="M50 88 L20 50 C10 35 20 15 35 15 C45 15 50 25 50 25 C50 25 55 15 65 15 C80 15 90 35 80 50 L50 88" 
                          fill="#ff416c" stroke="#1a2a44" stroke-width="2"/>
                    <!-- ADN en spirale à l'intérieur -->
                    <path d="M35 35 Q45 30, 50 35 T65 35 M35 45 Q45 40, 50 45 T65 45 M35 55 Q45 50, 50 55 T65 55" 
                          stroke="white" stroke-width="2" fill="none" stroke-dasharray="3 2"/>
                    <!-- Loupe de recherche -->
                    <circle cx="70" cy="30" r="12" fill="none" stroke="white" stroke-width="3"/>
                    <line x1="78" y1="38" x2="88" y2="48" stroke="white" stroke-width="4" stroke-linecap="round"/>
                </svg>
            </div>
            
            <div class="logo-text">
                <span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span>
            </div>
            
            <div class="slogan">${t('slogan')}</div>
            
            <div style="font-size:1.1rem; color:#1a2a44; margin:20px 0 10px;">${t('haveAccount')}</div>
            <a href="/login" class="btn-dark">${t('login')}</a>
            <a href="/charte-engagement" class="btn-pink">${t('createAccount')}</a>
            <div style="margin-top:30px; font-size:0.9rem; color:#666;">${t('security')}</div>
        </div>
    </div>
    
    <script>
        function toggleLanguageDropdown() {
            const dropdown = document.getElementById('language-dropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }
        
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('language-dropdown');
            const button = event.target.closest('.lang-btn-compact');
            if (!button && dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        });
        
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                document.getElementById('selected-language').innerText = this.innerText.replace(/[🇫🇷🇬🇧🇵🇹🇪🇸🇸🇦🇨🇳]/g, '').trim();
            });
        });
    </script>
</body>
</html>`);
});

// LOGIN
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
            <p style="font-size: 1.2rem; margin: 20px 0;">${t('enterName')}</p>
            <form id="loginForm">
                <input type="text" id="firstName" class="input-box" placeholder="${t('yourName')}" required>
                <button type="submit" class="btn-pink">${t('login')}</button>
            </form>
            <a href="/" class="back-link">← ${t('backHome')}</a>
        </div>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({firstName})
            });
            if (res.ok) window.location.href = '/profile';
            else alert('${t('nameNotFound')}');
        });
    </script>
</body>
</html>`);
});

// CHARTE D'ENGAGEMENT avec scroll corrigé
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
            <div class="scroll-indicator" id="scrollIndicator">⬇️ ${t('scrollDown')} ⬇️</div>
            <button id="agreeBtn" class="btn-pink" onclick="acceptCharte()" disabled style="opacity: 0.5; cursor: not-allowed;">${t('accept')}</button>
            <a href="/" class="back-link">← ${t('backHome')}</a>
        </div>
    </div>
    
    <script>
        function checkScroll(el) {
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 5) {
                document.getElementById('agreeBtn').disabled = false;
                document.getElementById('agreeBtn').style.opacity = '1';
                document.getElementById('agreeBtn').style.cursor = 'pointer';
                document.getElementById('scrollIndicator').style.opacity = '0.3';
            } else {
                document.getElementById('agreeBtn').disabled = true;
                document.getElementById('agreeBtn').style.opacity = '0.5';
                document.getElementById('agreeBtn').style.cursor = 'not-allowed';
                document.getElementById('scrollIndicator').style.opacity = '1';
            }
        }
        
        window.onload = function() {
            const charteBox = document.getElementById('charteBox');
            if (charteBox.scrollTop === 0) {
                document.getElementById('agreeBtn').disabled = true;
                document.getElementById('agreeBtn').style.opacity = '0.5';
            }
        };
        
        function acceptCharte() {
            if (!document.getElementById('agreeBtn').disabled) window.location.href = '/signup';
        }
    </script>
</body>
</html>`);
});

// INSCRIPTION avec date horizontale
app.get('/signup', (req, res) => {
    const t = req.t;
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
        <div id="loader">
            <div class="spinner"></div>
            <h3>Analyse sécurisée...</h3>
            <p>Vérification de vos données médicales.</p>
        </div>
        <div class="page-white" id="main-content">
            <h2 style="color:#ff416c;">${t('signupTitle')}</h2>
            <p style="font-size: 1.2rem; margin-bottom: 20px;">${t('signupSub')}</p>
            <form onsubmit="saveAndRedirect(event)">
                <div class="photo-circle" id="photoCircle" onclick="document.getElementById('photoInput').click()">
                    <span id="photoText">📷 Photo</span>
                </div>
                <input type="file" id="photoInput" style="display:none" onchange="previewPhoto(event)">
                
                <input type="text" id="firstName" class="input-box" placeholder="${t('firstName')}" required>
                <input type="text" id="lastName" class="input-box" placeholder="${t('lastName')}" required>
                
                <select id="gender" class="input-box" required>
                    <option value="">${t('gender')}</option>
                    <option value="Homme">${t('male')}</option>
                    <option value="Femme">${t('female')}</option>
                </select>
                
                <div class="input-label">${t('dob')}</div>
                ${datePicker}
                
                <input type="text" id="residence" class="input-box" placeholder="${t('city')}" required>
                
                <select id="genotype" class="input-box" required>
                    <option value="">${t('genotype')}</option>
                    <option value="AA">AA</option>
                    <option value="AS">AS</option>
                    <option value="SS">SS</option>
                </select>
                
                <div style="display:flex; gap:10px;">
                    <select id="bloodType" class="input-box" style="flex:2;" required>
                        <option value="">${t('bloodGroup')}</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                    </select>
                    <select id="bloodRh" class="input-box" style="flex:1;" required>
                        <option value="+">+</option>
                        <option value="-">-</option>
                    </select>
                </div>
                
                <select id="desireChild" class="input-box" required>
                    <option value="">${t('desireChild')}</option>
                    <option value="Oui">${t('yes')}</option>
                    <option value="Non">${t('no')}</option>
                </select>
                
                <div class="serment-container">
                    <input type="checkbox" id="oath" style="width:20px;height:20px;" required>
                    <label for="oath" class="serment-text">${t('honorText')}</label>
                </div>
                
                <button type="submit" class="btn-pink">${t('createProfile')}</button>
            </form>
            <a href="/charte-engagement" class="back-link">← ${t('backCharter')}</a>
        </div>
    </div>
    
    <script>
        let photoBase64 = localStorage.getItem('userPhoto') || "";
        
        window.onload = function() {
            if(photoBase64) {
                document.getElementById('photoCircle').style.backgroundImage = 'url(' + photoBase64 + ')';
                document.getElementById('photoText').style.display = 'none';
            }
            document.getElementById('firstName').value = localStorage.getItem('userFirstName') || "";
            document.getElementById('lastName').value = localStorage.getItem('userLastName') || "";
            document.getElementById('gender').value = localStorage.getItem('userGender') || "";
            document.getElementById('residence').value = localStorage.getItem('userResidence') || "";
            document.getElementById('genotype').value = localStorage.getItem('userGenotype') || "";
            
            const fullBlood = localStorage.getItem('userBloodGroup') || "";
            if(fullBlood) {
                document.getElementById('bloodType').value = fullBlood.replace(/[+-]/g, "");
                document.getElementById('bloodRh').value = fullBlood.includes('+') ? '+' : '-';
            }
            document.getElementById('desireChild').value = localStorage.getItem('userDesireChild') || "";
            
            // Charger la date
            const savedDob = localStorage.getItem('userDob');
            if(savedDob) {
                const date = new Date(savedDob);
                document.querySelector('select[name="day"]').value = date.getDate();
                document.querySelector('select[name="month"]').value = date.getMonth() + 1;
                document.querySelector('select[name="year"]').value = date.getFullYear();
            }
        };
        
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
            
            document.getElementById('loader').style.display = 'flex';
            
            localStorage.setItem('userPhoto', photoBase64);
            localStorage.setItem('userFirstName', document.getElementById('firstName').value);
            localStorage.setItem('userLastName', document.getElementById('lastName').value);
            localStorage.setItem('userGender', document.getElementById('gender').value);
            localStorage.setItem('userDob', dob);
            localStorage.setItem('userResidence', document.getElementById('residence').value);
            localStorage.setItem('userGenotype', document.getElementById('genotype').value);
            localStorage.setItem('userBloodGroup', document.getElementById('bloodType').value + document.getElementById('bloodRh').value);
            localStorage.setItem('userDesireChild', document.getElementById('desireChild').value);
            
            setTimeout(() => {
                window.location.href = '/profile';
            }, 2000);
        }
    </script>
</body>
</html>`);
});

// PROFIL
app.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const t = req.t;
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false, isBlocked: false });
        const genderDisplay = user.gender === 'Homme' ? t('male') : t('female');
        const unreadBadge = unreadCount > 0 ? `<span class="profile-unread">${unreadCount}</span>` : '';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('myProfile')}</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <!-- POPUP DE DEMANDE -->
        <div id="request-popup">
            <div class="popup-card">
                <div class="popup-icon">💌</div>
                <div class="popup-message" id="request-message"></div>
                <div class="popup-buttons">
                    <button class="accept-btn" onclick="acceptRequest()">${t('acceptRequest')}</button>
                    <button class="reject-btn" onclick="rejectRequest()">${t('rejectRequest')}</button>
                </div>
            </div>
        </div>
        
        <!-- POPUP DE REJET -->
        <div id="rejection-popup">
            <div class="popup-card">
                <div class="popup-icon">🌸</div>
                <div class="popup-message" id="rejection-message"></div>
                <div class="action-buttons">
                    <button class="btn-pink" onclick="goToProfile()" style="flex:1;">${t('returnProfile')}</button>
                    <button class="btn-dark" onclick="goToMatching()" style="flex:1;">${t('newMatch')}</button>
                </div>
            </div>
        </div>
        
        <!-- POPUP DE LOADING -->
        <div id="loading-popup">
            <div class="popup-card">
                <div class="spinner"></div>
                <div class="popup-message" id="loading-message">${t('sendingRequest')}</div>
            </div>
        </div>
        
        <div class="page-white">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <a href="/" class="btn-dark" style="padding: 12px 20px; width: auto;">${t('home')}</a>
                <a href="/inbox" class="btn-pink" style="padding: 12px 20px; width: auto; display: flex; align-items: center;">
                    ${t('messages')} ${unreadBadge}
                </a>
                <a href="/settings" style="font-size: 2rem; text-decoration: none;">⚙️</a>
            </div>
            
            <div style="display: flex; justify-content: center; margin: 10px 0;">
                <select onchange="window.location.href='/lang/'+this.value" style="padding: 8px 15px; border-radius: 20px; border: 2px solid #ff416c; background: white; font-size: 1rem;">
                    <option value="fr" ${user.language === 'fr' ? 'selected' : ''}>🇫🇷 ${t('french')}</option>
                    <option value="en" ${user.language === 'en' ? 'selected' : ''}>🇬🇧 ${t('english')}</option>
                    <option value="pt" ${user.language === 'pt' ? 'selected' : ''}>🇵🇹 ${t('portuguese')}</option>
                    <option value="es" ${user.language === 'es' ? 'selected' : ''}>🇪🇸 ${t('spanish')}</option>
                    <option value="ar" ${user.language === 'ar' ? 'selected' : ''}>🇸🇦 ${t('arabic')}</option>
                    <option value="zh" ${user.language === 'zh' ? 'selected' : ''}>🇨🇳 ${t('chinese')}</option>
                </select>
            </div>
            
            <div class="photo-circle" style="background-image:url('${user.photo || ''}');"></div>
            
            <h2 style="text-align: center;">${user.firstName} ${user.lastName}</h2>
            <p style="text-align: center; font-size:1.2rem;">${user.residence || ''} • ${genderDisplay}</p>
            
            <div class="st-group">
                <div class="st-item"><span>${t('genotype_label')}</span><b>${user.genotype}</b></div>
                <div class="st-item"><span>${t('blood_label')}</span><b>${user.bloodGroup}</b></div>
                <div class="st-item"><span>${t('age_label')}</span><b>${calculerAge(user.dob)} ${t('age_label')}</b></div>
                <div class="st-item"><span>${t('project_label')}</span><b>${user.desireChild === 'Oui' ? t('yes') : t('no')}</b></div>
            </div>
            
            <a href="/matching" class="btn-pink">${t('findPartner')}</a>
        </div>
    </div>
    
    <script>
        let currentRequestId = null;
        
        async function checkRequests() {
            try {
                const res = await fetch('/api/requests/pending');
                const reqs = await res.json();
                if (reqs.length > 0) {
                    showRequestPopup(reqs[0]);
                }
            } catch(e) {}
        }
        
        function showRequestPopup(r) {
            currentRequestId = r._id;
            const msg = '${t('interestPopup')}'.replace('{name}', r.senderId.firstName);
            document.getElementById('request-message').innerText = msg;
            document.getElementById('request-popup').style.display = 'flex';
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
        
        async function acceptRequest() {
            if (!currentRequestId) return;
            const res = await fetch('/api/requests/' + currentRequestId + '/accept', { method: 'POST' });
            if (res.ok) {
                document.getElementById('request-popup').style.display = 'none';
                window.location.href = '/inbox';
            }
        }
        
        async function rejectRequest() {
            if (!currentRequestId) return;
            const res = await fetch('/api/requests/' + currentRequestId + '/reject', { method: 'POST' });
            if (res.ok) {
                document.getElementById('request-popup').style.display = 'none';
            }
        }
        
        async function checkRejections() {
            try {
                const res = await fetch('/api/rejections/unread');
                const rejs = await res.json();
                if (rejs.length > 0) {
                    showRejectionPopup(rejs[0]);
                }
            } catch(e) {}
        }
        
        function showRejectionPopup(r) {
            const msg = '${t('rejectionPopup')}'.replace('{name}', r.senderFirstName);
            document.getElementById('rejection-message').innerText = msg;
            document.getElementById('rejection-popup').style.display = 'flex';
            fetch('/api/rejections/' + r.requestId + '/view', { method: 'POST' });
        }
        
        function goToProfile() {
            document.getElementById('rejection-popup').style.display = 'none';
            window.location.href = '/profile';
        }
        
        function goToMatching() {
            document.getElementById('rejection-popup').style.display = 'none';
            window.location.href = '/matching';
        }
        
        setInterval(checkRequests, 5000);
        setInterval(checkRejections, 5000);
        checkRequests();
        checkRejections();
    </script>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur profil');
    }
});

// MATCHING avec commentaires inspirés du nouveau code et blocage symétrique corrigé
app.get('/matching', requireAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const t = req.t;
        const isSSorAS = (currentUser.genotype === 'SS' || currentUser.genotype === 'AS');
        
        // Récupérer les IDs exclus (avec blocage symétrique)
        const messages = await Message.find({
            $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }],
            isBlocked: false
        });
        
        const conversationIds = new Set();
        messages.forEach(msg => {
            if (msg.senderId.toString() !== currentUser._id.toString()) {
                conversationIds.add(msg.senderId.toString());
            }
            if (msg.receiverId.toString() !== currentUser._id.toString()) {
                conversationIds.add(msg.receiverId.toString());
            }
        });
        
        const rejectedArray = currentUser.rejectedRequests ? currentUser.rejectedRequests.map(id => id.toString()) : [];
        const blockedArray = currentUser.blockedUsers ? currentUser.blockedUsers.map(id => id.toString()) : [];
        const blockedByArray = currentUser.blockedBy ? currentUser.blockedBy.map(id => id.toString()) : [];
        
        const excludedIds = [...new Set([
            ...blockedArray, 
            ...blockedByArray,
            ...Array.from(conversationIds), 
            ...rejectedArray
        ])];
        
        // Requête de base
        let query = { 
            _id: { $ne: currentUser._id },
            gender: currentUser.gender === 'Homme' ? 'Femme' : 'Homme'
        };
        
        if (excludedIds.length > 0) {
            query._id.$nin = excludedIds;
        }
        
        let partners = await User.find(query);
        
        // Filtre génétique
        if (isSSorAS) {
            partners = partners.filter(p => p.genotype === 'AA');
        }
        
        let partnersHTML = '';
        if (partners.length === 0) {
            partnersHTML = `
                <div class="empty-message">
                    <span>🔍</span>
                    <h3>${t('searchOngoing')}</h3>
                    <p>${t('expandCommunity')}</p>
                </div>
            `;
        } else {
            partners.forEach(p => {
                const age = calculerAge(p.dob);
                partnersHTML += `
                    <div class="match-card">
                        <div class="match-photo-blur"></div>
                        <div class="match-info">
                            <b style="font-size:1.2rem;">${p.firstName}</b>
                            <br><span style="font-size:0.9rem;">${p.genotype} • ${age} ans</span>
                        </div>
                        <div class="match-actions">
                            <button class="btn-action btn-contact" onclick="sendInterest('${p._id}', '${p.firstName}')">
                                💬 ${t('contact')}
                            </button>
                            <button class="btn-action btn-details" onclick="showDetails(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                                ${t('details')}
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        const ssasPopup = isSSorAS ? `
            <div id="genlove-popup" style="display:flex;">
                <div class="popup-card">
                    <div class="popup-icon">🛡️</div>
                    <div class="popup-title">${t('healthCommitment')}</div>
                    <div class="popup-message">
                        ${currentUser.genotype === 'AS' ? t('popupMessageAS') : t('popupMessageSS')}
                    </div>
                    <button class="ok-btn" onclick="document.getElementById('genlove-popup').style.display='none';">${t('understood')}</button>
                </div>
            </div>
        ` : '';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - ${t('compatiblePartners')}</title>
    ${styles}
    ${notifyScript}
    <style>
        #genlove-popup { display: none; position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.8); z-index:10000; align-items:center; justify-content:center; padding:20px; }
        #loading-popup { display: none; position: fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.9); z-index:20000; align-items:center; justify-content:center; padding:20px; }
        #popup-overlay { display: none; }
    </style>
</head>
<body>
    <div class="app-shell">
        <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
        
        ${ssasPopup}
        
        <div id="loading-popup">
            <div class="popup-card">
                <div class="spinner"></div>
                <div class="popup-message" id="loading-message">${t('sendingRequest')}</div>
            </div>
        </div>
        
        <div id="popup-overlay" onclick="closePopup()">
            <div class="popup-content" onclick="event.stopPropagation()">
                <span class="close-popup" onclick="closePopup()">&times;</span>
                <h3 id="pop-name" style="color:#ff416c; margin-top:0;">${t('details')}</h3>
                <div id="pop-details" style="font-size:0.95rem; color:#333; line-height:1.6;"></div>
                <div id="pop-msg" class="popup-msg"></div>
                <button class="btn-pink" style="margin:20px 0 0 0; width:100%" onclick="sendInterestFromPopup()"> ${t('contact')}</button>
            </div>
        </div>
        
        <div style="padding:20px; background:white; text-align:center; border-bottom:1px solid #eee;">
            <h3 style="margin:0; color:#1a2a44;">${t('compatiblePartners')}</h3>
        </div>
        
        <div id="match-container">
            ${partnersHTML}
        </div>
        
        <a href="/profile" class="btn-pink">${t('backProfile')}</a>
    </div>
    
    <script>
        let currentPartner = null;
        let currentPartnerId = null;
        
        function sendInterest(receiverId, receiverName) {
            currentPartnerId = receiverId;
            document.getElementById('loading-popup').style.display = 'flex';
            document.getElementById('loading-message').innerText = '${t('sendingRequest')}';
            
            setTimeout(() => {
                fetch('/api/requests', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ receiverId })
                })
                .then(res => res.json())
                .then(data => {
                    document.getElementById('loading-message').innerText = '${t('requestSent')}';
                    setTimeout(() => {
                        document.getElementById('loading-popup').style.display = 'none';
                        if (data.success) {
                            showNotify('Intérêt envoyé à ' + receiverName, 'success');
                        }
                    }, 1000);
                })
                .catch(() => {
                    document.getElementById('loading-popup').style.display = 'none';
                    showNotify('Erreur réseau', 'error');
                });
            }, 2000);
        }
        
        function sendInterestFromPopup() {
            if (currentPartnerId) {
                sendInterest(currentPartnerId, currentPartner ? currentPartner.firstName : '');
                closePopup();
            }
        }
        
        function showDetails(partner) {
            currentPartner = partner;
            currentPartnerId = partner._id;
            
            const myGt = '${currentUser.genotype}';
            
            document.getElementById('pop-name').innerText = partner.firstName || "Profil";
            document.getElementById('pop-details').innerHTML = \`
                <b>${t('genotype_label')} :</b> \${partner.genotype}<br>
                <b>${t('blood_label')} :</b> \${partner.bloodGroup}<br><br>
                <b>${t('project_label')} :</b><br>
                <i>\${partner.desireChild === 'Oui' ? '${t('yes')}' : '${t('no')}'}</i>
            \`;
            
            let msg = "";
            if(myGt === "AA" && partner.genotype === "AA") {
                msg = "<b>💞 L'Union Sérénité :</b> Félicitations ! Votre compatibilité génétique est idéale. En choisissant un partenaire AA, vous offrez à votre future descendance une protection totale contre la drépanocytose.";
            }
            else if(myGt === "AA" && partner.genotype === "AS") {
                msg = "<b>🛡️ L'Union Protectrice :</b> Excellent choix. En tant que AA, vous jouez un rôle protecteur essentiel. Votre union ne présente aucun risque de naissance d'un enfant SS.";
            }
            else if(myGt === "AA" && partner.genotype === "SS") {
                msg = "<b>💪 L'Union Solidaire :</b> Une union magnifique et sans crainte. Votre profil AA est le partenaire idéal pour une personne SS. Aucun de vos enfants ne souffrira de la forme majeure.";
            }
            else if(myGt === "AS" && partner.genotype === "AA") {
                msg = "<b>✨ L'Union Équilibrée :</b> Votre choix est responsable ! En vous unissant à un partenaire AA, vous éliminez tout risque de drépanocytose pour vos enfants.";
            }
            else if(myGt === "SS" && partner.genotype === "AA") {
                msg = "<b>🌈 L'Union Espoir :</b> Vous avez fait le choix le plus sûr. Votre union avec un partenaire AA garantit que tous vos enfants seront porteurs AS mais jamais atteints de la forme SS.";
            }
            else {
                msg = "<b>💬 Compatibilité standard :</b> Vous pouvez échanger avec ce profil.";
            }
            
            document.getElementById('pop-msg').innerHTML = msg;
            document.getElementById('popup-overlay').style.display = 'flex';
        }
        
        function closePopup() {
            document.getElementById('popup-overlay').style.display = 'none';
        }
    </script>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur matching');
    }
});

// INBOX
app.get('/inbox', requireAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const t = req.t;
        
        const messages = await Message.find({
            $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }],
            isBlocked: false
        })
        .populate('senderId receiverId')
        .sort({ timestamp: -1 });
        
        const conversations = new Map();
        
        for (const m of messages) {
            const other = m.senderId._id.equals(currentUser._id) ? m.receiverId : m.senderId;
            
            // Vérifier si l'autre utilisateur n'est pas bloqué
            if (currentUser.blockedUsers && currentUser.blockedUsers.includes(other._id)) {
                continue;
            }
            
            if (!conversations.has(other._id.toString())) {
                const unread = await Message.countDocuments({
                    senderId: other._id,
                    receiverId: currentUser._id,
                    read: false,
                    isBlocked: false
                });
                conversations.set(other._id.toString(), {
                    user: other,
                    last: m,
                    unread
                });
            }
        }
        
        let inboxHTML = '';
        if (conversations.size === 0) {
            inboxHTML = `
                <div class="empty-message">
                    <span>📭</span>
                    <h3>${t('emptyInbox')}</h3>
                    <p>${t('startConversation')}</p>
                    <a href="/matching" class="btn-pink" style="display: inline-block; width: auto; margin-top: 20px;">${t('findPartners')}</a>
                </div>
            `;
        } else {
            conversations.forEach((conv, id) => {
                const timeAgo = formatTimeAgo(conv.last.timestamp, currentUser.language);
                inboxHTML += `
                    <div class="inbox-item ${conv.unread ? 'unread' : ''}" onclick="window.location.href='/chat?partnerId=${id}'">
                        <div style="display: flex; justify-content: space-between;">
                            <b class="user-name">${conv.user.firstName} ${conv.user.lastName}</b>
                            <span style="font-size:0.9rem; color:#999;">${timeAgo}</span>
                        </div>
                        <div class="message-preview" style="margin-top: 5px;">
                            ${conv.last.text.substring(0, 50)}${conv.last.text.length > 50 ? '...' : ''}
                        </div>
                        ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
                    </div>
                `;
            });
        }
        
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
        <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
        <div class="page-white">
            <h2>${t('inboxTitle')}</h2>
            ${inboxHTML}
            <div class="navigation">
                <a href="/profile" class="nav-link">← ${t('backProfile')}</a>
                <a href="/matching" class="nav-link">${t('findPartner')}</a>
            </div>
        </div>
    </div>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur inbox');
    }
});

// CHAT
app.get('/chat', requireAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const partnerId = req.query.partnerId;
        
        if (!partnerId) return res.redirect('/inbox');
        
        const partner = await User.findById(partnerId);
        if (!partner) return res.redirect('/inbox');
        
        const t = req.t;
        
        // Vérifier blocage
        const isBlockedByPartner = partner.blockedBy && partner.blockedBy.includes(currentUser._id);
        const hasBlockedPartner = currentUser.blockedUsers && currentUser.blockedUsers.includes(partnerId);
        
        if (isBlockedByPartner) {
            return res.send(`
                <div class="app-shell">
                    <div class="page-white" style="text-align: center; padding: 50px 20px;">
                        <h2>⛔ ${t('blockedByUser')}</h2>
                        <p>${t('blockedMessage')}</p>
                        <a href="/inbox" class="btn-pink">${t('backHome')}</a>
                    </div>
                </div>
            `);
        }
        
        // Marquer les messages comme lus
        await Message.updateMany(
            { senderId: partnerId, receiverId: currentUser._id, read: false, isBlocked: false },
            { read: true }
        );
        
        const messages = await Message.find({
            $or: [
                { senderId: currentUser._id, receiverId: partnerId },
                { senderId: partnerId, receiverId: currentUser._id }
            ],
            isBlocked: false
        }).sort({ timestamp: 1 });
        
        let msgs = '';
        messages.forEach(m => {
            const cls = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            msgs += `<div class="bubble ${cls}">${m.text}</div>`;
        });
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>${t('appName')} - Chat</title>
    ${styles}
    ${notifyScript}
</head>
<body>
    <div class="app-shell">
        <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
        <div class="chat-header">
            <span><b>${partner.firstName}</b></span>
            <div>
                <button class="btn-action btn-block" onclick="blockUser('${partnerId}')" style="padding:8px 15px; margin-right:10px;">${t('block')}</button>
                <a href="/inbox" style="color: white; text-decoration: none; font-size: 1.5rem;">✕</a>
            </div>
        </div>
        
        <div class="chat-messages" id="messages">
            ${msgs}
        </div>
        
        ${!hasBlockedPartner ? `
            <div class="input-area">
                <input id="msgInput" placeholder="${t('yourMessage')}">
                <button onclick="sendMessage('${partnerId}')">${t('send')}</button>
            </div>
        ` : ''}
    </div>
    
    <script>
        async function sendMessage(id) {
            const msg = document.getElementById('msgInput');
            if (msg.value.trim()) {
                await fetch('/api/messages', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ receiverId: id, text: msg.value })
                });
                location.reload();
            }
        }
        
        async function blockUser(id) {
            if (confirm('${t('block')} ?')) {
                await fetch('/api/block/' + id, { method: 'POST' });
                window.location.href = '/inbox';
            }
        }
        
        window.scrollTo(0, document.body.scrollHeight);
    </script>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur chat');
    }
});

// SETTINGS
app.get('/settings', requireAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const t = req.t;
        const blockedCount = currentUser.blockedUsers ? currentUser.blockedUsers.length : 0;
        
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
        <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
        <div style="padding:25px; background:white; text-align:center;">
            <div style="font-size:2.5rem; font-weight:bold;">
                <span style="color:#1a2a44;">Gen</span><span style="color:#ff416c;">love</span>
            </div>
        </div>
        
        <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">CONFIDENTIALITÉ</div>
        <div class="st-group">
            <div class="st-item">
                <span>${t('visibility')}</span>
                <label class="switch">
                    <input type="checkbox" checked onchange="document.getElementById('status').innerText = this.checked ? 'Public' : 'Privé'; showNotify('${t('settingsTitle')} mis à jour !')">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="st-item" style="font-size:0.8rem; color:#666;">Statut actuel : <b id="status" style="color:#ff416c;">Public</b></div>
        </div>
        
        <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">${t('language')}</div>
        <div class="st-group">
            <div class="st-item">
                <span>${t('language')}</span>
                <select onchange="window.location.href='/lang/'+this.value" style="padding:8px; border-radius:10px; border:1px solid #ddd;">
                    <option value="fr" ${currentUser.language === 'fr' ? 'selected' : ''}>🇫🇷 ${t('french')}</option>
                    <option value="en" ${currentUser.language === 'en' ? 'selected' : ''}>🇬🇧 ${t('english')}</option>
                    <option value="pt" ${currentUser.language === 'pt' ? 'selected' : ''}>🇵🇹 ${t('portuguese')}</option>
                    <option value="es" ${currentUser.language === 'es' ? 'selected' : ''}>🇪🇸 ${t('spanish')}</option>
                    <option value="ar" ${currentUser.language === 'ar' ? 'selected' : ''}>🇸🇦 ${t('arabic')}</option>
                    <option value="zh" ${currentUser.language === 'zh' ? 'selected' : ''}>🇨🇳 ${t('chinese')}</option>
                </select>
            </div>
        </div>
        
        <div style="padding:15px 20px 5px 20px; font-size:0.75rem; color:#888; font-weight:bold;">COMPTE</div>
        <div class="st-group">
            <a href="/edit-profile" style="text-decoration:none;" class="st-item">
                <span>✏️ ${t('editProfile')}</span>
                <b>Modifier ➔</b>
            </a>
            <a href="/blocked-list" style="text-decoration:none;" class="st-item">
                <span>🚫 ${t('blockedUsers')}</span>
                <b>${blockedCount} ➔</b>
            </a>
        </div>
        
        <div class="st-group danger-zone">
            <div class="st-item" style="color:#dc3545; font-weight:bold;">${t('dangerZone')}</div>
            <div style="display:flex; justify-content:space-around; padding:15px;">
                <button onclick="deleteAccount()" style="background:#1a2a44; color:white; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">${t('delete')}</button>
                <button onclick="showNotify('Action annulée')" style="background:#eee; color:#333; border:none; padding:10px 25px; border-radius:10px; cursor:pointer;">Annuler</button>
            </div>
        </div>
        
        <a href="/profile" class="btn-pink">${t('backProfile')}</a>
        <a href="/logout-success" class="btn-dark" style="text-decoration:none;">${t('logout')}</a>
    </div>
    
    <script>
        async function deleteAccount() {
            if (confirm('${t('confirmDelete')}')) {
                await fetch('/api/delete-account', { method: 'DELETE' });
                window.location.href = '/';
            }
        }
    </script>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur paramètres');
    }
});

// EDIT PROFILE
app.get('/edit-profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const t = req.t;
        const datePicker = generateDateOptions(req, user.dob);
        
        const bloodOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => 
            `<option value="${g}" ${user.bloodGroup === g ? 'selected' : ''}>${g}</option>`
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
        <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
        <div class="page-white">
            <h2>${t('editProfile')}</h2>
            <form id="editForm">
                <div class="input-label">${t('firstName')}</div>
                <input type="text" name="firstName" class="input-box" value="${user.firstName}" required>
                
                <div class="input-label">${t('lastName')}</div>
                <input type="text" name="lastName" class="input-box" value="${user.lastName}" required>
                
                <div class="input-label">${t('gender')}</div>
                <select name="gender" class="input-box" required>
                    <option value="Homme" ${user.gender === 'Homme' ? 'selected' : ''}>${t('male')}</option>
                    <option value="Femme" ${user.gender === 'Femme' ? 'selected' : ''}>${t('female')}</option>
                </select>
                
                <div class="input-label">${t('dob')}</div>
                ${datePicker}
                
                <div class="input-label">${t('city')}</div>
                <input type="text" name="residence" class="input-box" value="${user.residence || ''}" required>
                
                <div class="input-label">${t('genotype')}</div>
                <select name="genotype" class="input-box" required>
                    <option value="AA" ${user.genotype === 'AA' ? 'selected' : ''}>AA</option>
                    <option value="AS" ${user.genotype === 'AS' ? 'selected' : ''}>AS</option>
                    <option value="SS" ${user.genotype === 'SS' ? 'selected' : ''}>SS</option>
                </select>
                
                <div class="input-label">${t('bloodGroup')}</div>
                <select name="bloodGroup" class="input-box" required>
                    ${bloodOptions}
                </select>
                
                <div class="input-label">${t('desireChild')}</div>
                <select name="desireChild" class="input-box" required>
                    <option value="Oui" ${user.desireChild === 'Oui' ? 'selected' : ''}>${t('yes')}</option>
                    <option value="Non" ${user.desireChild === 'Non' ? 'selected' : ''}>${t('no')}</option>
                </select>
                
                <button type="submit" class="btn-pink">${t('editProfile')}</button>
            </form>
            <a href="/profile" class="back-link">← ${t('backProfile')}</a>
        </div>
    </div>
    
    <script>
        document.getElementById('editForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const day = document.querySelector('select[name="day"]').value;
            const month = document.querySelector('select[name="month"]').value;
            const year = document.querySelector('select[name="year"]').value;
            
            if (!day || !month || !year) {
                alert('${t('dob')} ${t('required')}');
                return;
            }
            
            const dob = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.dob = dob;
            
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showNotify('Profil mis à jour', 'success');
                setTimeout(() => window.location.href = '/profile', 1000);
            } else {
                alert('Erreur lors de la modification');
            }
        });
    </script>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur édition');
    }
});

// BLOCKED LIST
app.get('/blocked-list', requireAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId).populate('blockedUsers');
        const t = req.t;
        
        let blockedHTML = '';
        if (currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
            currentUser.blockedUsers.forEach(user => {
                blockedHTML += `
                    <div class="inbox-item" style="display: flex; justify-content: space-between; align-items: center;">
                        <span><b style="font-size:1.2rem;">${user.firstName} ${user.lastName}</b></span>
                        <button class="btn-action" onclick="unblockUser('${user._id}')" style="background:#4CAF50; color:white; padding:8px 15px;">${t('unblock')}</button>
                    </div>
                `;
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
        <div id="genlove-notify"><span>🔔</span> <span id="notify-msg"></span></div>
        <div class="page-white">
            <h2>${t('blockedUsers')}</h2>
            ${blockedHTML}
            <a href="/settings" class="back-link">← ${t('backHome')}</a>
        </div>
    </div>
    
    <script>
        async function unblockUser(id) {
            await fetch('/api/unblock/' + id, { method: 'POST' });
            showNotify('Utilisateur débloqué', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    </script>
</body>
</html>`);
    } catch(error) {
        console.error(error);
        res.status(500).send('Erreur');
    }
});

// LOGOUT SUCCESS
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
    <style>
        .end-overlay {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a2a44, #ff416c);
        }
        .end-card {
            background: white;
            border-radius: 30px;
            padding: 40px 30px;
            text-align: center;
            max-width: 380px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body class="end-overlay">
    <div class="end-card">
        <h2 style="font-size:2.2rem; color: #1a2a44;">${t('logoutSuccess')}</h2>
        <p style="font-size:1.3rem; margin:25px 0; color: #666;">${t('seeYouSoon')}</p>
        <a href="/" class="btn-pink" style="text-decoration: none;">${t('home')}</a>
    </div>
</body>
</html>`);
});

// ============================================
// ROUTES API
// ============================================

// Login
app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ firstName: req.body.firstName }).sort({ createdAt: -1 });
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        
        req.session.userId = user._id;
        req.session.isVerified = user.isVerified;
        await new Promise(resolve => req.session.save(resolve));
        
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// Register
app.post('/api/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        
        req.session.userId = user._id;
        req.session.isVerified = false;
        await new Promise(resolve => req.session.save(resolve));
        
        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// Envoyer un intérêt
app.post('/api/requests', requireAuth, async (req, res) => {
    try {
        const { receiverId } = req.body;
        
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ error: "Destinataire non trouvé" });
        }
        
        const existingRequest = await Request.findOne({
            senderId: req.session.userId,
            receiverId,
            status: 'pending'
        });
        
        if (existingRequest) {
            return res.status(400).json({ error: "Demande déjà envoyée" });
        }
        
        const existingConversation = await Message.findOne({
            $or: [
                { senderId: req.session.userId, receiverId },
                { senderId: receiverId, receiverId: req.session.userId }
            ],
            isBlocked: false
        });
        
        if (existingConversation) {
            return res.status(400).json({ error: "Vous avez déjà une conversation avec cette personne" });
        }
        
        const request = new Request({
            senderId: req.session.userId,
            receiverId,
            status: 'pending'
        });
        
        await request.save();
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans /api/requests:", e);
        res.status(500).json({ error: e.message });
    }
});

// Récupérer les demandes en attente
app.get('/api/requests/pending', requireAuth, async (req, res) => {
    try {
        const requests = await Request.find({
            receiverId: req.session.userId,
            status: 'pending',
            viewed: false
        }).populate('senderId', 'firstName');
        
        res.json(requests);
    } catch(e) {
        console.error("Erreur dans /api/requests/pending:", e);
        res.status(500).json({ error: e.message });
    }
});

// Accepter une demande
app.post('/api/requests/:id/accept', requireAuth, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });
        
        if (request.receiverId._id.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        
        const welcomeMsg = new Message({
            senderId: request.senderId._id,
            receiverId: request.receiverId._id,
            text: "Bonjour ! J'aimerais échanger avec vous.",
            read: false,
            isBlocked: false
        });
        await welcomeMsg.save();
        
        request.status = 'accepted';
        request.viewed = true;
        await request.save();
        
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans accept:", e);
        res.status(500).json({ error: e.message });
    }
});

// Rejeter une demande
app.post('/api/requests/:id/reject', requireAuth, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate('senderId receiverId');
        if (!request) return res.status(404).json({ error: 'Demande non trouvée' });
        
        if (request.receiverId._id.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        
        await User.findByIdAndUpdate(req.session.userId, {
            $addToSet: { rejectedRequests: request.senderId._id }
        });
        
        request.status = 'rejected';
        request.viewed = true;
        await request.save();
        
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans reject:", e);
        res.status(500).json({ error: e.message });
    }
});

// Récupérer les rejets non vus
app.get('/api/rejections/unread', requireAuth, async (req, res) => {
    try {
        const requests = await Request.find({
            senderId: req.session.userId,
            status: 'rejected',
            viewed: false
        }).populate('receiverId', 'firstName');
        
        const result = requests.map(r => ({
            requestId: r._id,
            senderFirstName: r.receiverId.firstName
        }));
        
        res.json(result);
    } catch(e) {
        console.error("Erreur dans /api/rejections/unread:", e);
        res.status(500).json({ error: e.message });
    }
});

// Marquer un rejet comme vu
app.post('/api/rejections/:id/view', requireAuth, async (req, res) => {
    try {
        await Request.findByIdAndUpdate(req.params.id, { viewed: true });
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans /api/rejections/view:", e);
        res.status(500).json({ error: e.message });
    }
});

// Envoyer un message
app.post('/api/messages', requireAuth, async (req, res) => {
    try {
        const receiverId = req.body.receiverId;
        
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.blockedBy && receiver.blockedBy.includes(req.session.userId)) {
            return res.status(403).json({ error: "Vous avez bloqué cet utilisateur" });
        }
        
        const msg = new Message({
            senderId: req.session.userId,
            receiverId: receiverId,
            text: req.body.text,
            read: false,
            isBlocked: false
        });
        await msg.save();
        res.json(msg);
    } catch(e) {
        console.error("Erreur dans /api/messages:", e);
        res.status(500).json({ error: e.message });
    }
});

// Bloquer
app.post('/api/block/:userId', requireAuth, async (req, res) => {
    try {
        const current = await User.findById(req.session.userId);
        const target = await User.findById(req.params.userId);
        
        if (!current || !target) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        
        if (!current.blockedUsers) current.blockedUsers = [];
        if (!current.blockedUsers.includes(req.params.userId)) {
            current.blockedUsers.push(req.params.userId);
        }
        
        if (!target.blockedBy) target.blockedBy = [];
        if (!target.blockedBy.includes(req.session.userId)) {
            target.blockedBy.push(req.session.userId);
        }
        
        await Message.updateMany(
            {
                $or: [
                    { senderId: req.session.userId, receiverId: req.params.userId },
                    { senderId: req.params.userId, receiverId: req.session.userId }
                ]
            },
            { isBlocked: true }
        );
        
        await current.save();
        await target.save();
        
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans /api/block:", e);
        res.status(500).json({ error: e.message });
    }
});

// Débloquer
app.post('/api/unblock/:userId', requireAuth, async (req, res) => {
    try {
        const current = await User.findById(req.session.userId);
        const target = await User.findById(req.params.userId);
        
        if (current.blockedUsers) {
            current.blockedUsers = current.blockedUsers.filter(id => id.toString() !== req.params.userId);
        }
        
        if (target && target.blockedBy) {
            target.blockedBy = target.blockedBy.filter(id => id.toString() !== req.session.userId);
        }
        
        await Message.updateMany(
            {
                $or: [
                    { senderId: req.session.userId, receiverId: req.params.userId },
                    { senderId: req.params.userId, receiverId: req.session.userId }
                ]
            },
            { isBlocked: false }
        );
        
        await current.save();
        if (target) await target.save();
        
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans /api/unblock:", e);
        res.status(500).json({ error: e.message });
    }
});

// Update profile
app.put('/api/users/profile', requireAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.session.userId, req.body);
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans /api/users/profile:", e);
        res.status(500).json({ error: e.message });
    }
});

// Supprimer compte
app.delete('/api/delete-account', requireAuth, async (req, res) => {
    try {
        const id = req.session.userId;
        await Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
        await Request.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });
        await User.findByIdAndDelete(id);
        req.session.destroy();
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans /api/delete-account:", e);
        res.status(500).json({ error: e.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// 404
app.use((req, res) => {
    const t = req.t;
    res.status(404).send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - ${t('appName')}</title>
    ${styles}
    <style>
        .end-overlay {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1a2a44, #ff416c);
        }
        .end-card {
            background: white;
            border-radius: 30px;
            padding: 40px 30px;
            text-align: center;
            max-width: 380px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body class="end-overlay">
    <div class="end-card">
        <h2 style="font-size:2.2rem; color: #1a2a44;">${t('pageNotFound')}</h2>
        <p style="margin:20px; color: #666;">${t('pageNotFoundMessage')}</p>
        <a href="/" class="btn-pink" style="text-decoration: none;">${t('home')}</a>
    </div>
</body>
</html>`);
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Genlove démarré sur http://localhost:${port}`);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('📦 Déconnexion MongoDB');
        process.exit(0);
    });
});