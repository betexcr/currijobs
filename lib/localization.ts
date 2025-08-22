export type Language = 'es-CR' | 'en' | 'zh';

export interface LocalizationStrings {
  // App General
  appName: string;
  appSubtitle: string;
  
  // Navigation
  tasksNearYou: string;
  taskList: string;
  createTask: string;
  profile: string;
  settings: string;
  
  // Authentication
  email: string;
  password: string;
  login: string;
  logout: string;
  signUp: string;
  forgotPassword: string;
  autoLoginInProgress: string;
  loggingIn: string;
  
  // Task Categories
  all: string;
  plumbing: string;
  electrician: string;
  carpentry: string;
  painting: string;
  applianceRepair: string;
  cleaning: string;
  laundryIroning: string;
  cooking: string;
  groceryShopping: string;
  petCare: string;
  gardening: string;
  movingHelp: string;
  trashRemoval: string;
  windowWashing: string;
  babysitting: string;
  elderlyCare: string;
  tutoring: string;
  deliveryErrands: string;
  techSupport: string;
  photography: string;
  
  // Task Details
  taskTitle: string;
  taskDescription: string;
  taskCategory: string;
  taskReward: string;
  taskLocation: string;
  taskTimeEstimate: string;
  taskDistance: string;
  taskStatus: string;
  taskCreatedAt: string;
  
  // Task Actions
  viewDetails: string;
  submitOffer: string;
  makeOffer: string;
  acceptOffer: string;
  rejectOffer: string;
  completeTask: string;
  cancelTask: string;
  // Offers management UI
  selectWorker?: string;
  offers?: string;
  proposedReward?: string;
  offerMessage?: string;
  assign?: string;
  
  // My Tasks
  myCreatedTasks: string;
  myTasks: string;
  longPressMapToCreate: string;
  createNewTask: string;
  myCreatedInProgress?: string;
  assignedToMe?: string;
  
  // Search & Filter
  searchPlaceholder: string;
  searchTasks: string;
  searchCategories: string;
  searchLocations: string;
  filterByCategory: string;
  clearSearch: string;
  noResultsFound: string;
  
  // AI Recommendations
  aiRecommendations: string;
  recommendedForYou: string;
  basedOnYourLocation: string;
  basedOnYourHistory: string;
  
  // Map
  mapView: string;
  listView: string;
  yourLocation: string;
  nearbyTasks: string;
  kilometersAway: string;
  milesAway: string;
  goHome: string;
  longPressToDropPin?: string;
  
  // Tooltips & Modals
  close: string;
  cancel: string;
  confirm: string;
  back?: string;
  save: string;
  delete: string;
  edit: string;
  
  // Status Messages
  loading: string;
  findingTasksNearYou: string;
  noTasksFound: string;
  errorOccurred: string;
  tryAgain: string;
  networkError: string;
  
  // Currency & Numbers
  currency: string;
  reward: string;
  price: string;
  total: string;
  
  // Time & Dates
  timeEstimate: string;
  timeNotSpecified: string;
  hours: string;
  minutes: string;
  days: string;
  
  // Location
  location: string;
  address: string;
  coordinates: string;
  distance: string;
  
  // User & Profile
  userName: string;
  name: string;
  phone: string;
  rating: string;
  reviews: string;
  completedTasks: string;
  memberSince: string;
  
  // Settings
  language: string;
  theme: string;
  notifications: string;
  privacy: string;
  help: string;
  about: string;
  
  // Notifications
  newTaskNearby: string;
  offerReceived: string;
  offerAccepted: string;
  offerRejected: string;
  taskCompleted: string;
  paymentReceived: string;
  
  // Errors
  invalidEmail: string;
  invalidPassword: string;
  networkConnectionError: string;
  locationPermissionDenied: string;
  cameraPermissionDenied: string;
  
  // Success Messages
  taskCreatedSuccessfully: string;
  offerSubmittedSuccessfully: string;
  profileUpdatedSuccessfully: string;
  settingsSavedSuccessfully: string;
  
  // Error Messages
  errorFetchingTasks: string;
  errorCreatingTask: string;
  success: string;
  
  // Welcome & Onboarding
  getStarted: string;
  welcomeToCurriJobs: string;
  loginToContinue: string;
  loginFailed: string;
  skipToDemo: string;
  skipToApp: string;
  error: string;
  next: string;
  previous: string;
  letsGo: string;
  skipOnboarding: string;
  
  // Onboarding Steps
  onboardingStep1Title: string;
  onboardingStep1Description: string;
  onboardingStep2Title: string;
  onboardingStep2Description: string;
  onboardingStep3Title: string;
  onboardingStep3Description: string;
  onboardingStep4Title: string;
  onboardingStep4Description: string;
  
  // Additional strings
  category: string;
  postedBy?: string;
  // Profile specific
  overview: string;
  recentPayments: string;
  currentTasksPosted: string;
  totalTasksCompleted: string;
  earningsThisMonth: string;
  lifetimeEarnings: string;
  viewAllPayments: string;
  paidBy: string;
  account: string;
  preferences: string;
  support: string;
  legal: string;
  editProfile: string;
  editProfileSubtitle: string;
  identityVerification: string;
  identityVerificationSubtitle: string;
  paymentMethods: string;
  paymentMethodsSubtitle: string;
  pushNotifications: string;
  pushNotificationsSubtitle: string;
  locationServices: string;
  locationServicesSubtitle: string;
  appSettings: string;
  appSettingsSubtitle: string;
  helpCenter: string;
  helpCenterSubtitle: string;
  contactSupport: string;
  contactSupportSubtitle: string;
  sendFeedback: string;
  sendFeedbackSubtitle: string;
  privacyPolicy: string;
  privacyPolicySubtitle: string;
  termsOfService: string;
  termsOfServiceSubtitle: string;
  signOutSubtitle: string;
  // Settings & Theme
  themeMode: string;
  lightMode: string;
  darkMode: string;
  colorblindSupport: string;
  customTheme: string;
  customizeTheme: string;
  openThemeCustomizer: string;
  customColorsLabel: string;
  chooseCustomColors: string;
  defaultThemeLabel: string;
  useSystemPalette: string;
  colorblindNormal: string;
  colorblindProtanopia: string;
  colorblindDeuteranopia: string;
  colorblindTritanopia: string;
  colorblindStandardColors: string;
  // Rank screen
  yourRank: string;
  badgesLabel: string;
  reviewsHistory: string;
  howToRankUp: string;
  tipCompleteHighRating: string;
  tipVaryCategories: string;
  tipParticipateEvents: string;
  progress: string;
  averageRating: string;
  payment: string;
  client: string;
  // Status labels
  openStatus?: string;
  inProgressStatus?: string;
  completedStatus?: string;
  cancelledStatus?: string;
}

const localizations: Record<Language, LocalizationStrings> = {
  'es-CR': {
    // App General
    appName: 'CurriJobs',
    appSubtitle: 'Encuentra trabajos cerca de ti',
    
    // Navigation
    tasksNearYou: 'Trabajos Cerca de Ti',
    taskList: 'Lista',
    createTask: 'Crear',
    profile: 'Perfil',
    settings: 'Configuración',
    
    // Authentication
    email: 'Correo',
    password: 'Contraseña',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    signUp: 'Registrarse',
    forgotPassword: '¿Olvidaste tu contraseña?',
    autoLoginInProgress: 'Inicio automático en progreso...',
    loggingIn: 'Iniciando sesión...',
    
    // Task Categories
    all: 'Todos',
    plumbing: 'Plomería',
    electrician: 'Electricidad',
    carpentry: 'Carpintería',
    painting: 'Pintura',
    applianceRepair: 'Reparación de Electrodomésticos',
    cleaning: 'Limpieza',
    laundryIroning: 'Lavandería y Planchado',
    cooking: 'Cocina',
    groceryShopping: 'Compras',
    petCare: 'Cuidado de Mascotas',
    gardening: 'Jardinería',
    movingHelp: 'Ayuda para Mudanzas',
    trashRemoval: 'Eliminación de Basura',
    windowWashing: 'Limpieza de Ventanas',
    babysitting: 'Cuidado de Niños',
    elderlyCare: 'Cuidado de Adultos Mayores',
    tutoring: 'Tutoría',
    deliveryErrands: 'Entregas y Mandados',
    techSupport: 'Soporte Técnico',
    photography: 'Fotografía',
    
    // Task Details
    taskTitle: 'Título del Trabajo',
    taskDescription: 'Descripción',
    taskCategory: 'Categoría',
    taskReward: 'Recompensa',
    taskLocation: 'Ubicación',
    taskTimeEstimate: 'Tiempo Estimado',
    taskDistance: 'Distancia',
    taskStatus: 'Estado',
    taskCreatedAt: 'Fecha de Creación',
    
    // Task Actions
    viewDetails: 'Ver Detalles',
    submitOffer: 'Enviar Oferta',
    makeOffer: 'Hacer Oferta',
    acceptOffer: 'Aceptar Oferta',
    rejectOffer: 'Rechazar Oferta',
    completeTask: 'Completar Trabajo',
    cancelTask: 'Cancelar Trabajo',
      selectWorker: 'Selecciona quién realizará el trabajo',
      offers: 'Ofertas',
      proposedReward: 'Recompensa propuesta',
      offerMessage: 'Mensaje',
      assign: 'Asignar',
    
    // My Tasks
    myCreatedTasks: 'Mis Tareas Creadas',
    myTasks: 'Mis Tareas',
    longPressMapToCreate: 'Mantén presionado el mapa para crear una nueva tarea',
    createNewTask: 'Crear Nueva Tarea',
      myCreatedInProgress: 'Mis creadas - En progreso',
      assignedToMe: 'Asignadas a mí',
    
    // Search & Filter
    searchPlaceholder: 'Buscar trabajos, categorías o ubicaciones...',
    searchTasks: 'Buscar trabajos',
    searchCategories: 'Buscar categorías',
    searchLocations: 'Buscar ubicaciones',
    filterByCategory: 'Filtrar por categoría',
    clearSearch: 'Limpiar búsqueda',
    noResultsFound: 'No se encontraron resultados',
    
    // AI Recommendations
    aiRecommendations: 'Recomendaciones IA',
    recommendedForYou: 'Recomendado para ti',
    basedOnYourLocation: 'Basado en tu ubicación',
    basedOnYourHistory: 'Basado en tu historial',
    
    // Map
    mapView: 'Vista de Mapa',
    listView: 'Vista de Lista',
    yourLocation: 'Tu ubicación',
    nearbyTasks: 'Trabajos cercanos',
    kilometersAway: 'km de distancia',
    milesAway: 'millas de distancia',
    goHome: 'Ir a casa',
    longPressToDropPin: 'Mantén presionado para colocar/mover el pin',
    
    // Tooltips & Modals
    close: 'Cerrar',
    cancel: 'Cancelar',
      back: 'Atrás',
    confirm: 'Confirmar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    
    // Status Messages
    loading: 'Cargando...',
    findingTasksNearYou: 'Buscando trabajos cerca de ti...',
    noTasksFound: 'No se encontraron trabajos',
    errorOccurred: 'Ocurrió un error',
    tryAgain: 'Intentar de nuevo',
    networkError: 'Error de conexión',
    
    // Currency & Numbers
    currency: '₡',
    reward: 'Recompensa',
    price: 'Precio',
    total: 'Total',
    
    // Time & Dates
    timeEstimate: 'Tiempo estimado',
    timeNotSpecified: 'Tiempo no especificado',
    hours: 'horas',
    minutes: 'minutos',
    days: 'días',
    
    // Location
    location: 'Ubicación',
    address: 'Dirección',
    coordinates: 'Coordenadas',
    distance: 'Distancia',
    
    // User & Profile
    userName: 'Perfil',
    name: 'Nombre',
    phone: 'Teléfono',
    rating: 'Calificación',
    reviews: 'Reseñas',
    completedTasks: 'Trabajos completados',
    memberSince: 'Miembro desde',
    
    // Settings
    language: 'Idioma',
    theme: 'Tema',
    notifications: 'Notificaciones',
    privacy: 'Privacidad',
    help: 'Ayuda',
    about: 'Acerca de',
    
    // Notifications
    newTaskNearby: 'Nuevo trabajo cerca',
    offerReceived: 'Oferta recibida',
    offerAccepted: 'Oferta aceptada',
    offerRejected: 'Oferta rechazada',
    taskCompleted: 'Trabajo completado',
    paymentReceived: 'Pago recibido',
    
    // Errors
    invalidEmail: 'Correo inválido',
    invalidPassword: 'Contraseña inválida',
    networkConnectionError: 'Error de conexión de red',
    locationPermissionDenied: 'Permiso de ubicación denegado',
    cameraPermissionDenied: 'Permiso de cámara denegado',
    
    // Success Messages
    taskCreatedSuccessfully: 'Trabajo creado exitosamente',
    offerSubmittedSuccessfully: 'Oferta enviada exitosamente',
    profileUpdatedSuccessfully: 'Perfil actualizado exitosamente',
    settingsSavedSuccessfully: 'Configuración guardada exitosamente',
    
    // Error Messages
    errorFetchingTasks: 'Error al obtener las tareas',
    errorCreatingTask: 'Error al crear la tarea',
    success: 'Éxito',
    
    // Welcome & Onboarding
    getStarted: 'Comenzar',
    welcomeToCurriJobs: 'Bienvenido a CurriJobs',
    loginToContinue: 'Inicia sesión para continuar',
    loginFailed: 'Error al iniciar sesión',
    skipToDemo: 'Saltar al demo',
    skipToApp: 'Ir a la App',
    error: 'Error',
    next: 'Siguiente',
    previous: 'Anterior',
    letsGo: '¡Vamos!',
    skipOnboarding: 'Saltar introducción',
    
    // Onboarding Steps
    onboardingStep1Title: 'Explora trabajos cerca de ti',
    onboardingStep1Description: 'Usa el mapa para encontrar trabajos cerca de ti. Cada marcador es una oportunidad.',
    onboardingStep2Title: 'Filtra por categoría',
    onboardingStep2Description: 'Usa filtros por categoría para encontrar exactamente lo que necesitas.',
    onboardingStep3Title: 'Crea y gestiona tus trabajos',
    onboardingStep3Description: 'Publica tus propios trabajos o aplica a los de otros. Mantén el control total.',
    onboardingStep4Title: '¡Listo para empezar!',
    onboardingStep4Description: 'Ya tienes todo para empezar. ¡Bienvenido a la comunidad Currijobs!',
    
    // Additional strings
    category: 'Categoría',
    postedBy: 'Publicado por',
    // Profile specific
    overview: 'Resumen',
    recentPayments: 'Pagos Recientes',
    currentTasksPosted: 'Trabajos actuales publicados',
    totalTasksCompleted: 'Trabajos completados',
    earningsThisMonth: 'Ganancias de este mes',
    lifetimeEarnings: 'Ganancias totales',
    viewAllPayments: 'Ver todos los pagos',
    paidBy: 'Pagado por',
    account: 'Cuenta',
    preferences: 'Preferencias',
    support: 'Soporte',
    legal: 'Legal',
    editProfile: 'Editar Perfil',
    editProfileSubtitle: 'Actualiza tu información personal',
    identityVerification: 'Verificación de Identidad',
    identityVerificationSubtitle: 'Verifica tu identidad para mayor confianza',
    paymentMethods: 'Métodos de Pago',
    paymentMethodsSubtitle: 'Administra tus opciones de pago',
    pushNotifications: 'Notificaciones Push',
    pushNotificationsSubtitle: 'Recibe avisos de nuevos trabajos y ofertas',
    locationServices: 'Servicios de Ubicación',
    locationServicesSubtitle: 'Permite el acceso a tu ubicación para trabajos cercanos',
    appSettings: 'Configuración de la App',
    appSettingsSubtitle: 'Idioma, tema y accesibilidad',
    helpCenter: 'Centro de Ayuda',
    helpCenterSubtitle: 'Obtén ayuda y respuestas',
    contactSupport: 'Contactar Soporte',
    contactSupportSubtitle: 'Comunícate con nuestro equipo de soporte',
    sendFeedback: 'Enviar Comentarios',
    sendFeedbackSubtitle: 'Ayúdanos a mejorar la app',
    privacyPolicy: 'Política de Privacidad',
    privacyPolicySubtitle: 'Cómo protegemos tus datos',
    termsOfService: 'Términos de Servicio',
    termsOfServiceSubtitle: 'Nuestros términos y condiciones',
    signOutSubtitle: 'Cierra la sesión de tu cuenta',
    // Settings & Theme
    themeMode: 'Modo de tema',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    colorblindSupport: 'Soporte daltonismo',
    customTheme: 'Tema personalizado',
    customizeTheme: 'Personalizar tema',
    openThemeCustomizer: 'Abrir personalizador de tema',
    customColorsLabel: 'Colores personalizados',
    chooseCustomColors: 'Elige tu propia paleta de colores',
    defaultThemeLabel: 'Tema predeterminado',
    useSystemPalette: 'Usar paleta del sistema',
    colorblindNormal: 'Visión normal',
    colorblindProtanopia: 'Protanopia',
    colorblindDeuteranopia: 'Deuteranopia',
    colorblindTritanopia: 'Tritanopia',
    colorblindStandardColors: 'Colores estándar',
    // Rank screen
    yourRank: 'Tu Rango',
    badgesLabel: 'Insignias',
    reviewsHistory: 'Historial de Reseñas',
    howToRankUp: 'Cómo subir de rango',
    tipCompleteHighRating: '• Completa más tareas y mantén una calificación alta.',
    tipVaryCategories: '• Varía las categorías para optar por “Maestro de Categoría”.',
    tipParticipateEvents: '• Participa en eventos especiales para insignias de temporada.',
    progress: 'Progreso',
    averageRating: 'Promedio',
    payment: 'Pago',
    client: 'Cliente',
    openStatus: 'Abierta',
    inProgressStatus: 'En progreso',
    completedStatus: 'Completada',
    cancelledStatus: 'Cancelada',
  },
  
  'en': {
    // App General
    appName: 'CurriJobs',
    appSubtitle: 'Find tasks near you',
    
    // Navigation
    tasksNearYou: 'Tasks Near You',
    taskList: 'List',
    createTask: 'Create',
    profile: 'Profile',
    settings: 'Settings',
    
    // Authentication
    email: 'Email',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
    signUp: 'Sign Up',
    forgotPassword: 'Forgot Password?',
    autoLoginInProgress: 'Auto-login in progress...',
    loggingIn: 'Logging in...',
    
    // Task Categories
    all: 'All',
    plumbing: 'Plumbing',
    electrician: 'Electrician',
    carpentry: 'Carpentry',
    painting: 'Painting',
    applianceRepair: 'Appliance Repair',
    cleaning: 'Cleaning',
    laundryIroning: 'Laundry & Ironing',
    cooking: 'Cooking',
    groceryShopping: 'Grocery Shopping',
    petCare: 'Pet Care',
    gardening: 'Gardening',
    movingHelp: 'Moving Help',
    trashRemoval: 'Trash Removal',
    windowWashing: 'Window Washing',
    babysitting: 'Babysitting',
    elderlyCare: 'Elderly Care',
    tutoring: 'Tutoring',
    deliveryErrands: 'Delivery & Errands',
    techSupport: 'Tech Support',
    photography: 'Photography',
    
    // Task Details
    taskTitle: 'Task Title',
    taskDescription: 'Description',
    taskCategory: 'Category',
    taskReward: 'Reward',
    taskLocation: 'Location',
    taskTimeEstimate: 'Time Estimate',
    taskDistance: 'Distance',
    taskStatus: 'Status',
    taskCreatedAt: 'Created At',
    
    // Task Actions
    viewDetails: 'View Details',
    submitOffer: 'Submit Offer',
    makeOffer: 'Make Offer',
    acceptOffer: 'Accept Offer',
    rejectOffer: 'Reject Offer',
    completeTask: 'Complete Task',
    cancelTask: 'Cancel Task',
      selectWorker: 'Select the worker for this job',
      offers: 'Offers',
      proposedReward: 'Proposed reward',
      offerMessage: 'Message',
      assign: 'Assign',
    
    // My Tasks
    myCreatedTasks: 'My Created Tasks',
    myTasks: 'My Tasks',
    longPressMapToCreate: 'Long press the map to create a new task',
    createNewTask: 'Create New Task',
      myCreatedInProgress: 'My Created - In Progress',
      assignedToMe: 'Assigned To Me',
    
    // Search & Filter
    searchPlaceholder: 'Search tasks, categories, or locations...',
    searchTasks: 'Search tasks',
    searchCategories: 'Search categories',
    searchLocations: 'Search locations',
    filterByCategory: 'Filter by category',
    clearSearch: 'Clear search',
    noResultsFound: 'No results found',
    
    // AI Recommendations
    aiRecommendations: 'AI Recommendations',
    recommendedForYou: 'Recommended for you',
    basedOnYourLocation: 'Based on your location',
    basedOnYourHistory: 'Based on your history',
    
    // Map
    mapView: 'Map View',
    listView: 'List View',
    yourLocation: 'Your location',
    nearbyTasks: 'Nearby tasks',
    kilometersAway: 'km away',
    milesAway: 'miles away',
    goHome: 'Go Home',
    longPressToDropPin: 'Long press to drop/move the pin',
    
    // Tooltips & Modals
    close: 'Close',
    cancel: 'Cancel',
      back: 'Back',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    
    // Status Messages
    loading: 'Loading...',
    findingTasksNearYou: 'Finding tasks near you...',
    noTasksFound: 'No tasks found',
    errorOccurred: 'An error occurred',
    tryAgain: 'Try again',
    networkError: 'Network error',
    
    // Currency & Numbers
    currency: '$',
    reward: 'Reward',
    price: 'Price',
    total: 'Total',
    
    // Time & Dates
    timeEstimate: 'Time estimate',
    timeNotSpecified: 'Time not specified',
    hours: 'hours',
    minutes: 'minutes',
    days: 'days',
    
    // Location
    location: 'Location',
    address: 'Address',
    coordinates: 'Coordinates',
    distance: 'Distance',
    
    // User & Profile
    userName: 'Profile',
    name: 'Name',
    phone: 'Phone',
    rating: 'Rating',
    reviews: 'Reviews',
    completedTasks: 'Completed tasks',
    memberSince: 'Member since',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    privacy: 'Privacy',
    help: 'Help',
    about: 'About',
    
    // Notifications
    newTaskNearby: 'New task nearby',
    offerReceived: 'Offer received',
    offerAccepted: 'Offer accepted',
    offerRejected: 'Offer rejected',
    taskCompleted: 'Task completed',
    paymentReceived: 'Payment received',
    
    // Errors
    invalidEmail: 'Invalid email',
    invalidPassword: 'Invalid password',
    networkConnectionError: 'Network connection error',
    locationPermissionDenied: 'Location permission denied',
    cameraPermissionDenied: 'Camera permission denied',
    
    // Success Messages
    taskCreatedSuccessfully: 'Task created successfully',
    offerSubmittedSuccessfully: 'Offer submitted successfully',
    profileUpdatedSuccessfully: 'Profile updated successfully',
    settingsSavedSuccessfully: 'Settings saved successfully',
    
    // Error Messages
    errorFetchingTasks: 'Error fetching tasks',
    errorCreatingTask: 'Error creating task',
    success: 'Success',
    
    // Welcome & Onboarding
    getStarted: 'Get Started',
    welcomeToCurriJobs: 'Welcome to CurriJobs',
    loginToContinue: 'Login to continue',
    loginFailed: 'Login failed',
    skipToDemo: 'Skip to demo',
    skipToApp: 'Go to App',
    error: 'Error',
    next: 'Next',
    previous: 'Previous',
    letsGo: "Let's Go!",
    skipOnboarding: 'Skip introduction',
    
    // Onboarding Steps
    onboardingStep1Title: 'Explore jobs near you',
    onboardingStep1Description: 'Use the map to find jobs near you. Each marker is an opportunity.',
    onboardingStep2Title: 'Filter by category',
    onboardingStep2Description: 'Use category filters to find exactly what you need.',
    onboardingStep3Title: 'Create and manage your jobs',
    onboardingStep3Description: 'Post your own jobs or apply to others. Stay in full control.',
    onboardingStep4Title: 'Ready to start!',
    onboardingStep4Description: 'You\'re all set. Welcome to the Currijobs community!',
    
    // Additional strings
    category: 'Category',
    postedBy: 'Posted by',
    // Profile specific
    overview: 'Overview',
    recentPayments: 'Recent Payments',
    currentTasksPosted: 'Current tasks posted',
    totalTasksCompleted: 'Total tasks completed',
    earningsThisMonth: 'Earnings this month',
    lifetimeEarnings: 'Lifetime earnings',
    viewAllPayments: 'View all payments',
    paidBy: 'Paid by',
    account: 'Account',
    preferences: 'Preferences',
    support: 'Support',
    legal: 'Legal',
    editProfile: 'Edit Profile',
    editProfileSubtitle: 'Update your personal information',
    identityVerification: 'Identity Verification',
    identityVerificationSubtitle: 'Verify your identity for better trust',
    paymentMethods: 'Payment Methods',
    paymentMethodsSubtitle: 'Manage your payment options',
    pushNotifications: 'Push Notifications',
    pushNotificationsSubtitle: 'Get notified about new tasks and offers',
    locationServices: 'Location Services',
    locationServicesSubtitle: 'Allow location access for nearby tasks',
    appSettings: 'App Settings',
    appSettingsSubtitle: 'Language, theme, and accessibility',
    helpCenter: 'Help Center',
    helpCenterSubtitle: 'Get help and find answers',
    contactSupport: 'Contact Support',
    contactSupportSubtitle: 'Reach out to our support team',
    sendFeedback: 'Send Feedback',
    sendFeedbackSubtitle: 'Help us improve the app',
    privacyPolicy: 'Privacy Policy',
    privacyPolicySubtitle: 'How we protect your data',
    termsOfService: 'Terms of Service',
    termsOfServiceSubtitle: 'Our terms and conditions',
    signOutSubtitle: 'Sign out of your account',
    // Settings & Theme
    themeMode: 'Theme Mode',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    colorblindSupport: 'Colorblind Support',
    customTheme: 'Custom Theme',
    customizeTheme: 'Customize Theme',
    openThemeCustomizer: 'Open Theme Customizer',
    customColorsLabel: 'Custom Colors',
    chooseCustomColors: 'Choose your own color scheme',
    defaultThemeLabel: 'Default Theme',
    useSystemPalette: 'Use system color palette',
    colorblindNormal: 'Normal Vision',
    colorblindProtanopia: 'Protanopia',
    colorblindDeuteranopia: 'Deuteranopia',
    colorblindTritanopia: 'Tritanopia',
    colorblindStandardColors: 'Standard colors',
    // Rank screen
    yourRank: 'Your Rank',
    badgesLabel: 'Badges',
    reviewsHistory: 'Reviews History',
    howToRankUp: 'How to rank up',
    tipCompleteHighRating: '• Complete more tasks and keep a high rating.',
    tipVaryCategories: '• Vary categories to aim for “Category Master”.',
    tipParticipateEvents: '• Participate in seasonal events for special badges.',
    progress: 'Progress',
    averageRating: 'Average',
    payment: 'Payment',
    client: 'Client',
    openStatus: 'Open',
    inProgressStatus: 'In Progress',
    completedStatus: 'Completed',
    cancelledStatus: 'Cancelled',
  },
  
  'zh': {
    // App General
    appName: 'CurriJobs',
    appSubtitle: '在您附近找到任务',
    
    // Navigation
    tasksNearYou: '附近的任务',
    taskList: '列表',
    createTask: '创建',
    profile: '个人资料',
    settings: '设置',
    
    // Authentication
    email: '邮箱',
    password: '密码',
    login: '登录',
    logout: '登出',
    signUp: '注册',
    forgotPassword: '忘记密码？',
    autoLoginInProgress: '自动登录进行中...',
    loggingIn: '登录中...',
    
    // Task Categories
    all: '全部',
    plumbing: '管道工',
    electrician: '电工',
    carpentry: '木工',
    painting: '油漆工',
    applianceRepair: '家电维修',
    cleaning: '清洁',
    laundryIroning: '洗衣熨烫',
    cooking: '烹饪',
    groceryShopping: '杂货购物',
    petCare: '宠物护理',
    gardening: '园艺',
    movingHelp: '搬家帮助',
    trashRemoval: '垃圾清理',
    windowWashing: '窗户清洁',
    babysitting: '保姆',
    elderlyCare: '老人护理',
    tutoring: '辅导',
    deliveryErrands: '送货跑腿',
    techSupport: '技术支持',
    photography: '摄影',
    
    // Task Details
    taskTitle: '任务标题',
    taskDescription: '描述',
    taskCategory: '类别',
    taskReward: '报酬',
    taskLocation: '位置',
    taskTimeEstimate: '时间估算',
    taskDistance: '距离',
    taskStatus: '状态',
    taskCreatedAt: '创建时间',
    
    // Task Actions
    viewDetails: '查看详情',
    submitOffer: '提交报价',
    makeOffer: '出价',
    acceptOffer: '接受报价',
    rejectOffer: '拒绝报价',
    completeTask: '完成任务',
    cancelTask: '取消任务',
    
    // My Tasks
    myCreatedTasks: '我创建的任务',
    myTasks: '我的任务',
    longPressMapToCreate: '长按地图创建新任务',
    createNewTask: '创建新任务',
    
    // Search & Filter
    searchPlaceholder: '搜索任务、类别或位置...',
    searchTasks: '搜索任务',
    searchCategories: '搜索类别',
    searchLocations: '搜索位置',
    filterByCategory: '按类别筛选',
    clearSearch: '清除搜索',
    noResultsFound: '未找到结果',
    
    // AI Recommendations
    aiRecommendations: 'AI推荐',
    recommendedForYou: '为您推荐',
    basedOnYourLocation: '基于您的位置',
    basedOnYourHistory: '基于您的历史',
    
    // Map
    mapView: '地图视图',
    listView: '列表视图',
    yourLocation: '您的位置',
    nearbyTasks: '附近的任务',
    kilometersAway: '公里远',
    milesAway: '英里远',
    goHome: '回家',
    longPressToDropPin: '长按以放置/移动图钉',
    
    // Tooltips & Modals
    close: '关闭',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    
    // Status Messages
    loading: '加载中...',
    findingTasksNearYou: '正在查找您附近的任务...',
    noTasksFound: '未找到任务',
    errorOccurred: '发生错误',
    tryAgain: '重试',
    networkError: '网络错误',
    
    // Currency & Numbers
    currency: '¥',
    reward: '报酬',
    price: '价格',
    total: '总计',
    
    // Time & Dates
    timeEstimate: '时间估算',
    timeNotSpecified: '未指定时间',
    hours: '小时',
    minutes: '分钟',
    days: '天',
    
    // Location
    location: '位置',
    address: '地址',
    coordinates: '坐标',
    distance: '距离',
    
    // User & Profile
    userName: '个人资料',
    name: '姓名',
    phone: '电话',
    rating: '评分',
    reviews: '评论',
    completedTasks: '已完成的任务',
    memberSince: '注册时间',
    
    // Settings
    language: '语言',
    theme: '主题',
    notifications: '通知',
    privacy: '隐私',
    help: '帮助',
    about: '关于',
    
    // Notifications
    newTaskNearby: '附近有新任务',
    offerReceived: '收到报价',
    offerAccepted: '报价已接受',
    offerRejected: '报价已拒绝',
    taskCompleted: '任务已完成',
    paymentReceived: '已收到付款',
    
    // Errors
    invalidEmail: '邮箱无效',
    invalidPassword: '密码无效',
    networkConnectionError: '网络连接错误',
    locationPermissionDenied: '位置权限被拒绝',
    cameraPermissionDenied: '相机权限被拒绝',
    
    // Success Messages
    taskCreatedSuccessfully: '任务创建成功',
    offerSubmittedSuccessfully: '报价提交成功',
    profileUpdatedSuccessfully: '个人资料更新成功',
    settingsSavedSuccessfully: '设置保存成功',
    
    // Error Messages
    errorFetchingTasks: '获取任务时出错',
    errorCreatingTask: '创建任务时出错',
    success: '成功',
    
    // Welcome & Onboarding
    getStarted: '开始使用',
    welcomeToCurriJobs: '欢迎使用 CurriJobs',
    loginToContinue: '登录继续',
    loginFailed: '登录失败',
    skipToDemo: '跳转到演示',
    skipToApp: '进入应用',
    error: '错误',
    next: '下一步',
    previous: '上一步',
    letsGo: '开始吧！',
    skipOnboarding: '跳过介绍',
    
    // Onboarding Steps
    onboardingStep1Title: '探索附近的职位',
    onboardingStep1Description: '使用地图查找您附近的职位。每个标记都是一个机会。',
    onboardingStep2Title: '按类别筛选',
    onboardingStep2Description: '使用类别筛选器找到您需要的确切内容。',
    onboardingStep3Title: '创建和管理您的职位',
    onboardingStep3Description: '发布您自己的职位或申请其他职位。保持完全控制。',
    onboardingStep4Title: '准备开始！',
    onboardingStep4Description: '您已准备就绪。欢迎加入 Currijobs 社区！',
    
    // Additional strings
    category: '类别',
    // Profile specific
    overview: '概览',
    recentPayments: '最近付款',
    currentTasksPosted: '当前发布的任务',
    totalTasksCompleted: '完成的任务总数',
    earningsThisMonth: '本月收入',
    lifetimeEarnings: '累计收入',
    viewAllPayments: '查看所有付款',
    paidBy: '付款方',
    account: '账户',
    preferences: '偏好',
    support: '支持',
    legal: '法律',
    editProfile: '编辑资料',
    editProfileSubtitle: '更新您的个人信息',
    identityVerification: '身份验证',
    identityVerificationSubtitle: '验证身份以提高信任度',
    paymentMethods: '支付方式',
    paymentMethodsSubtitle: '管理您的支付选项',
    pushNotifications: '推送通知',
    pushNotificationsSubtitle: '接收新任务和报价通知',
    locationServices: '定位服务',
    locationServicesSubtitle: '允许访问您的位置以查看附近任务',
    appSettings: '应用设置',
    appSettingsSubtitle: '语言、主题和无障碍',
    helpCenter: '帮助中心',
    helpCenterSubtitle: '获取帮助和答案',
    contactSupport: '联系支持',
    contactSupportSubtitle: '联系技术支持团队',
    sendFeedback: '发送反馈',
    sendFeedbackSubtitle: '帮助我们改进应用',
    privacyPolicy: '隐私政策',
    privacyPolicySubtitle: '我们如何保护您的数据',
    termsOfService: '服务条款',
    termsOfServiceSubtitle: '我们的条款和条件',
    signOutSubtitle: '退出您的账户',
    // Settings & Theme
    themeMode: '主题模式',
    lightMode: '浅色模式',
    darkMode: '深色模式',
    colorblindSupport: '色盲支持',
    customTheme: '自定义主题',
    customizeTheme: '自定义主题',
    openThemeCustomizer: '打开主题定制器',
    customColorsLabel: '自定义颜色',
    chooseCustomColors: '选择您自己的配色方案',
    defaultThemeLabel: '默认主题',
    useSystemPalette: '使用系统配色',
    colorblindNormal: '正常视觉',
    colorblindProtanopia: '红色盲',
    colorblindDeuteranopia: '绿色盲',
    colorblindTritanopia: '蓝黄色盲',
    colorblindStandardColors: '标准颜色',
    // Rank screen
    yourRank: '你的等级',
    badgesLabel: '徽章',
    reviewsHistory: '评价历史',
    howToRankUp: '如何提升等级',
    tipCompleteHighRating: '• 完成更多任务并保持高评分。',
    tipVaryCategories: '• 多尝试不同类别以获得“类别大师”。',
    tipParticipateEvents: '• 参加季节性活动以获取特殊徽章。',
    progress: '进度',
    averageRating: '平均评分',
    payment: '付款',
    client: '客户',
    openStatus: '开放',
    inProgressStatus: '进行中',
    completedStatus: '已完成',
    cancelledStatus: '已取消',
  },
};

export default localizations;
