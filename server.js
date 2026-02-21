const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const port = process.env.PORT || 3000;

// ========================
// CONNEXION MONGODB
// ========================
const mongouRI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rencontre';

mongoose.connect(mongouRI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// ========================
// CONFIGURATION SESSION
// ========================
app.set('trust proxy', 1);

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'secret-key-2026',
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
    read: { type: Boolean, default: false }
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
        appName: 'Rencontre',
        slogan: 'Unissez cœur et santé pour bâtir des couples sains 💑',
        security: '🛡️ Vos données de santé sont cryptées',
        welcome: 'Bienvenue',
        haveAccount: 'Avez-vous déjà un compte ?',
        login: 'Se connecter',
        createAccount: 'Créer un compte',
        loginTitle: 'Connexion',
        enterName: 'Entrez votre prénom pour vous connecter',
        yourName: 'Votre prénom',
        backHome: 'Retour à l\'accueil',
        nameNotFound: 'Prénom non trouvé. Veuillez créer un compte.',
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
        backCharter: '← Retour',
        required: 'obligatoire',
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
        thanksMessage: 'Rencontre vous remercie',
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
        appName: 'Rencontre',
        slogan: 'Unite heart and health to build healthy couples 💑',
        security: '🛡️ Your health data is encrypted',
        welcome: 'Welcome',
        haveAccount: 'Already have an account?',
        login: 'Login',
        createAccount: 'Create account',
        loginTitle: 'Login',
        enterName: 'Enter your first name to login',
        yourName: 'Your first name',
        backHome: '← Back to home',
        nameNotFound: 'Name not found. Please create an account.',
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
        backCharter: '← Back',
        required: 'required',
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
        thanksMessage: 'Rencontre thanks you',
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
        appName: 'Rencontre',
        slogan: 'Una coração e saúde para construir casais saudáveis 💑',
        security: '🛡️ Seus dados de saúde estão criptografados',
        welcome: 'Bem-vindo',
        haveAccount: 'Já tem uma conta?',
        login: 'Entrar',
        createAccount: 'Criar conta',
        loginTitle: 'Entrar',
        enterName: 'Digite seu primeiro nome para entrar',
        yourName: 'Seu primeiro nome',
        backHome: '← Voltar ao início',
        nameNotFound: 'Nome não encontrado. Por favor, crie uma conta.',
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
        backCharter: '← Voltar',
        required: 'obrigatório',
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
        thanksMessage: 'Rencontre agradece',
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
        appName: 'Rencontre',
        slogan: 'Une corazón y salud para construir parejas saludables 💑',
        security: '🛡️ Sus datos de salud están encriptados',
        welcome: 'Bienvenido',
        haveAccount: '¿Ya tienes una cuenta?',
        login: 'Iniciar sesión',
        createAccount: 'Crear cuenta',
        loginTitle: 'Iniciar sesión',
        enterName: 'Ingrese su nombre para iniciar sesión',
        yourName: 'Su nombre',
        backHome: '← Volver al inicio',
        nameNotFound: 'Nombre no encontrado. Por favor, cree una cuenta.',
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
        backCharter: '← Volver',
        required: 'obligatorio',
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
        thanksMessage: 'Rencontre le agradece',
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
        appName: 'رينكونتر',
        slogan: '💑 وحد القلب والصحة لبناء أزواج أصحاء',
        security: '🛡️ بياناتك الصحية مشفرة',
        welcome: 'مرحباً بك',
        haveAccount: 'هل لديك حساب بالفعل؟',
        login: 'تسجيل الدخول',
        createAccount: 'إنشاء حساب',
        loginTitle: 'تسجيل الدخول',
        enterName: 'أدخل اسمك الأول لتسجيل الدخول',
        yourName: 'اسمك الأول',
        backHome: '→ العودة إلى الرئيسية',
        nameNotFound: 'الاسم غير موجود. يرجى إنشاء حساب.',
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
        backCharter: '→ العودة',
        required: 'إلزامي',
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
        thanksMessage: 'رينكونتر تشكرك',
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
        appName: '相遇',
        slogan: '💑 结合心灵与健康，建立健康的伴侣关系',
        security: '🛡️ 您的健康数据已加密',
        welcome: '欢迎',
        haveAccount: '已有帐户？',
        login: '登录',
        createAccount: '创建帐户',
        loginTitle: '登录',
        enterName: '输入您的名字以登录',
        yourName: '您的名字',
        backHome: '← 返回首页',
        nameNotFound: '未找到名字。请创建帐户。',
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
        backCharter: '← 返回',
        required: '必填',
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
        thanksMessage: '相遇感谢您',
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
// STYLES CSS
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
    .logo-text {
        font-size: 5rem;
        font-weight: 800;
        margin: 20px 0;
        letter-spacing: -2px;
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
    .language-selector-home {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin-bottom: 20px;
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
    .lang-btn:hover, .lang-btn.active {
        background: #ff416c;
        color: white;
    }
    .btn-pink, .btn-dark {
        padding: 15px 25px;
        border-radius: 30px;
        font-size: 1.1rem;
        font-weight: 600;
        width: 100%;
        margin: 10px 0;
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
        padding: 12px 20px;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    .btn-contact {
        background: #ff416c;
        color: white;
    }
    .btn-block {
        background: #dc3545;
        color: white;
    }
    .input-box {
        width: 100%;
        padding: 15px;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        margin: 10px 0;
        font-size: 1rem;
        background: #f8f9fa;
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
    .match-card {
        background: white;
        border-radius: 25px;
        margin: 15px 0;
        padding: 20px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.05);
    }
    .match-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    }
    .match-photo-blur {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #f0f0f0;
        filter: blur(5px);
        flex-shrink: 0;
    }
    .match-actions {
        display: flex;
        gap: 10px;
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
    .chat-header {
        background: #1a2a44;
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
    }
    .back-link {
        display: inline-block;
        margin: 20px 0;
        color: #666;
        text-decoration: none;
        font-size: 1rem;
    }
    .empty-message {
        text-align: center;
        padding: 50px 20px;
        color: #666;
        background: white;
        border-radius: 25px;
        margin: 20px 0;
        font-size: 1.1rem;
    }
    .st-group {
        background: white;
        border-radius: 25px;
        margin: 15px 0;
        padding: 5px 0;
        box-shadow: 0 5px 20px rgba(0,0,0,0.05);
    }
    .st-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 1.1rem;
    }
    .st-item:last-child {
        border-bottom: none;
    }
    .danger-zone {
        border: 2px solid #dc3545;
        background: #fff5f5;
        margin-top: 30px;
    }
    
    /* Popups */
    #request-popup, #rejection-popup, #loading-popup, #genlove-popup {
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
    .popup-card {
        background: white;
        border-radius: 30px;
        padding: 35px 25px;
        max-width: 380px;
        width: 100%;
        text-align: center;
        animation: popupAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 3px solid #ff416c;
        box-shadow: 0 20px 40px rgba(255,65,108,0.3);
    }
    .popup-icon {
        font-size: 4rem;
        margin-bottom: 15px;
    }
    .popup-title {
        color: #ff416c;
        font-size: 1.6rem;
        font-weight: bold;
        margin-bottom: 15px;
    }
    .popup-message {
        color: #1a2a44;
        font-size: 1.2rem;
        line-height: 1.6;
        margin-bottom: 25px;
        padding: 0 10px;
    }
    .popup-buttons {
        display: flex;
        gap: 15px;
        margin: 20px 0;
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
    .accept-btn {
        background: #ff416c;
        color: white;
    }
    .reject-btn {
        background: #1a2a44;
        color: white;
    }
    .action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    .ok-btn {
        background: #ff416c;
        color: white;
        padding: 15px 30px;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        transition: all 0.3s;
    }
    .ok-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(255,65,108,0.3);
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
    .inbox-item {
        background: white;
        border-radius: 25px;
        margin: 15px 0;
        padding: 20px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.05);
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
    @media (max-width: 420px) {
        body { font-size: 15px; }
        .app-shell { max-width: 100%; }
        .logo-text { font-size: 4.2rem; }
        h2 { font-size: 1.8rem; }
        .btn-pink, .btn-dark { width: 95%; padding: 15px; }
    }
</style>
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
    
    let html = '<div class="custom-date-picker" style="display: flex; gap: 5px;">';
    
    // Jour
    html += '<select name="day" class="input-box" style="flex:1;" required><option value="">' + t('day') + '</option>';
    for (let d = 1; d <= 31; d++) {
        const sel = (selected && selected.getDate() === d) ? 'selected' : '';
        html += `<option value="${d}" ${sel}>${d}</option>`;
    }
    html += '</select>';
    
    // Mois
    html += '<select name="month" class="input-box" style="flex:2;" required><option value="">' + t('month') + '</option>';
    for (let m = 0; m < 12; m++) {
        const monthVal = m + 1;
        const sel = (selected && selected.getMonth() === m) ? 'selected' : '';
        html += `<option value="${monthVal}" ${sel}>${monthList[m]}</option>`;
    }
    html += '</select>';
    
    // Année
    html += '<select name="year" class="input-box" style="flex:1;" required><option value="">' + t('year') + '</option>';
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

// ACCUEIL
app.get('/', (req, res) => {
    const t = req.t;
    const currentLang = req.lang;
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('welcome')}</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="home-screen">
            <div class="language-selector-home">
                <a href="/lang/fr" class="lang-btn ${currentLang === 'fr' ? 'active' : ''}">${t('french')}</a>
                <a href="/lang/en" class="lang-btn ${currentLang === 'en' ? 'active' : ''}">${t('english')}</a>
                <a href="/lang/pt" class="lang-btn ${currentLang === 'pt' ? 'active' : ''}">${t('portuguese')}</a>
                <a href="/lang/es" class="lang-btn ${currentLang === 'es' ? 'active' : ''}">${t('spanish')}</a>
                <a href="/lang/ar" class="lang-btn ${currentLang === 'ar' ? 'active' : ''}">${t('arabic')}</a>
                <a href="/lang/zh" class="lang-btn ${currentLang === 'zh' ? 'active' : ''}">${t('chinese')}</a>
            </div>
            <div class="logo-text">
                <span style="color:#1a2a44;">Ren</span><span style="color:#ff416c;">contre</span>
            </div>
            <div class="slogan">${t('slogan')}</div>
            <div class="login-prompt" style="font-size: 1.2rem; color: #1a2a44; margin: 20px 0 10px;">${t('haveAccount')}</div>
            <a href="/login" class="btn-dark">${t('login')}</a>
            <a href="/signup" class="btn-pink">${t('createAccount')}</a>
            <div style="margin-top:40px; font-size:1rem; color:#666;">${t('security')}</div>
        </div>
    </div>
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('loginTitle')}</title>
    ${styles}
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

// INSCRIPTION
app.get('/signup', (req, res) => {
    const t = req.t;
    const datePicker = generateDateOptions(req);
    
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('signupTitle')}</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
        <div class="page-white">
            <h2>${t('signupTitle')}</h2>
            <p style="font-size: 1.2rem; margin-bottom: 20px;">${t('signupSub')}</p>
            <form id="signupForm">
                <div class="input-label">${t('firstName')}</div>
                <input type="text" name="firstName" class="input-box" required>
                
                <div class="input-label">${t('lastName')}</div>
                <input type="text" name="lastName" class="input-box" required>
                
                <div class="input-label">${t('gender')}</div>
                <select name="gender" class="input-box" required>
                    <option value="">${t('gender')}</option>
                    <option value="Homme">${t('male')}</option>
                    <option value="Femme">${t('female')}</option>
                </select>
                
                <div class="input-label">${t('dob')}</div>
                ${datePicker}
                
                <div class="input-label">${t('city')}</div>
                <input type="text" name="residence" class="input-box" required>
                
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
            <a href="/" class="back-link">← ${t('backHome')}</a>
        </div>
    </div>
    <script>
        document.getElementById('signupForm').addEventListener('submit', async function(e) {
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
            
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (res.ok) window.location.href = '/profile';
            else alert('Erreur lors de l\\'inscription');
        });
    </script>
</body>
</html>`);
});

// PROFIL avec popups
app.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/');
        
        const t = req.t;
        const unreadCount = await Message.countDocuments({ receiverId: user._id, read: false });
        const genderDisplay = user.gender === 'Homme' ? t('male') : t('female');
        const unreadBadge = unreadCount > 0 ? `<span class="profile-unread">${unreadCount}</span>` : '';
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('myProfile')}</title>
    ${styles}
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
                <a href="/" class="btn-dark" style="padding: 10px 20px; width: auto;">${t('home')}</a>
                <a href="/inbox" class="btn-pink" style="padding: 10px 20px; width: auto; display: flex; align-items: center;">
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
            
            <div class="photo-circle" style="width: 120px; height: 120px; border-radius: 50%; background: #f0f0f0; margin: 20px auto; border: 3px solid #ff416c;"></div>
            
            <h2 style="text-align: center;">${user.firstName} ${user.lastName}</h2>
            <p style="text-align: center; font-size:1.1rem;">${user.residence || ''} • ${genderDisplay}</p>
            
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

// MATCHING
app.get('/matching', requireAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        if (!currentUser) return res.redirect('/');
        
        const t = req.t;
        const isSSorAS = (currentUser.genotype === 'SS' || currentUser.genotype === 'AS');
        
        // Récupérer les IDs exclus
        const messages = await Message.find({
            $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }]
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
        const excludedIds = [...new Set([...blockedArray, ...Array.from(conversationIds), ...rejectedArray])];
        
        // Requête de base
        let query = { 
            _id: { $ne: currentUser._id },
            gender: currentUser.gender === 'Homme' ? 'Femme' : 'Homme'
        };
        
        if (excludedIds.length > 0) {
            query._id.$nin = excludedIds;
        }
        
        // Exclure ceux qui nous ont bloqués
        const blockedByOthers = await User.find({ blockedBy: currentUser._id }).distinct('_id');
        if (blockedByOthers.length) {
            query._id.$nin = query._id.$nin ? 
                [...query._id.$nin, ...blockedByOthers.map(id => id.toString())] : 
                blockedByOthers.map(id => id.toString());
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
                    <span style="font-size: 3rem;">🔍</span>
                    <h3>${t('searchOngoing')}</h3>
                    <p>${t('expandCommunity')}</p>
                </div>
            `;
        } else {
            partners.forEach(p => {
                const age = calculerAge(p.dob);
                partnersHTML += `
                    <div class="match-card">
                        <div class="match-header">
                            <div class="match-photo-blur"></div>
                            <div class="match-info">
                                <b style="font-size:1.3rem;">${p.firstName}</b>
                                <br><span style="font-size:1.1rem;">${p.genotype} • ${age} ans</span>
                            </div>
                        </div>
                        <div class="match-actions">
                            <button class="btn-action btn-contact" style="flex:1;" onclick="sendInterest('${p._id}', '${p.firstName}')">
                                💬 ${t('contact')}
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('compatiblePartners')}</title>
    ${styles}
    <style>
        #genlove-popup { display: none; }
        #loading-popup { display: none; }
    </style>
</head>
<body>
    <div class="app-shell">
        ${ssasPopup}
        
        <div id="loading-popup">
            <div class="popup-card">
                <div class="spinner"></div>
                <div class="popup-message" id="loading-message">${t('sendingRequest')}</div>
            </div>
        </div>
        
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
        function sendInterest(receiverId, receiverName) {
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
                    }, 1000);
                })
                .catch(() => {
                    document.getElementById('loading-popup').style.display = 'none';
                    alert('Erreur réseau');
                });
            }, 2000);
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
            $or: [{ senderId: currentUser._id }, { receiverId: currentUser._id }]
        })
        .populate('senderId receiverId')
        .sort({ timestamp: -1 });
        
        const conversations = new Map();
        
        for (const m of messages) {
            const other = m.senderId._id.equals(currentUser._id) ? m.receiverId : m.senderId;
            if (!conversations.has(other._id.toString())) {
                const unread = await Message.countDocuments({
                    senderId: other._id,
                    receiverId: currentUser._id,
                    read: false
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
                    <span style="font-size: 3rem;">📭</span>
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('inboxTitle')}</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
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
        if (partner.blockedBy && partner.blockedBy.includes(currentUser._id)) {
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
        
        if (currentUser.blockedUsers && currentUser.blockedUsers.includes(partnerId)) {
            return res.redirect('/inbox');
        }
        
        // Marquer les messages comme lus
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
        
        let msgs = '';
        messages.forEach(m => {
            const cls = m.senderId.equals(currentUser._id) ? 'sent' : 'received';
            msgs += `<div class="bubble ${cls}">${m.text}</div>`;
        });
        
        res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - Chat</title>
    ${styles}
</head>
<body>
    <div class="app-shell">
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
        
        <div class="input-area">
            <input id="msgInput" placeholder="${t('yourMessage')}">
            <button onclick="sendMessage('${partnerId}')">${t('send')}</button>
        </div>
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
        
        // Scroll en bas
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('settingsTitle')}</title>
    ${styles}
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
            
            <a href="/blocked-list" class="btn-dark" style="text-decoration: none;">🚫 ${t('blockedUsers')} (${blockedCount})</a>
            
            <div class="st-group danger-zone">
                <div class="st-item" style="color:#dc3545;">${t('dangerZone')}</div>
                <div class="st-item">
                    <span>${t('deleteAccount')}</span>
                    <button class="btn-action btn-block" onclick="deleteAccount()" style="padding:8px 15px;">${t('delete')}</button>
                </div>
            </div>
            
            <div class="navigation">
                <a href="/profile" class="nav-link">← ${t('backProfile')}</a>
                <a href="/logout-success" class="nav-link" style="color:#ff416c;">${t('logout')}</a>
            </div>
        </div>
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
                        <span><b>${user.firstName} ${user.lastName}</b></span>
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('appName')} - ${t('blockedUsers')}</title>
    ${styles}
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
        async function unblockUser(id) {
            await fetch('/api/unblock/' + id, { method: 'POST' });
            location.reload();
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            ]
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
            read: false
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
        const msg = new Message({
            senderId: req.session.userId,
            receiverId: req.body.receiverId,
            text: req.body.text,
            read: false
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
        
        if (current.blockedUsers) {
            current.blockedUsers = current.blockedUsers.filter(id => id.toString() !== req.params.userId);
            await current.save();
        }
        
        res.json({ success: true });
    } catch(e) {
        console.error("Erreur dans /api/unblock:", e);
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
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});

process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('📦 Déconnexion MongoDB');
        process.exit(0);
    });
});