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
  
  // My Tasks
  myCreatedTasks: string;
  myTasks: string;
  longPressMapToCreate: string;
  createNewTask: string;
  
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
  
  // Tooltips & Modals
  close: string;
  cancel: string;
  confirm: string;
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
    
    // My Tasks
    myCreatedTasks: 'Mis Tareas Creadas',
    myTasks: 'Mis Tareas',
    longPressMapToCreate: 'Mantén presionado el mapa para crear una nueva tarea',
    createNewTask: 'Crear Nueva Tarea',
    
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
    
    // Tooltips & Modals
    close: 'Cerrar',
    cancel: 'Cancelar',
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
    onboardingStep1Description: 'Usa el mapa para encontrar trabajos disponibles en tu área. Cada marcador representa una oportunidad de trabajo.',
    onboardingStep2Title: 'Filtra por categoría',
    onboardingStep2Description: 'Encuentra exactamente lo que buscas usando nuestros filtros por categoría: limpieza, plomería, jardinería y más.',
    onboardingStep3Title: 'Crea y gestiona tus trabajos',
    onboardingStep3Description: 'Publica tus propios trabajos o aplica a otros. Mantén un control total de tus actividades.',
    onboardingStep4Title: '¡Listo para empezar!',
    onboardingStep4Description: 'Ya tienes todo lo que necesitas para comenzar a trabajar. ¡Bienvenido a la comunidad de CurriJobs!',
    
    // Additional strings
    category: 'Categoría',
    postedBy: 'Publicado por',
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
    
    // My Tasks
    myCreatedTasks: 'My Created Tasks',
    myTasks: 'My Tasks',
    longPressMapToCreate: 'Long press the map to create a new task',
    createNewTask: 'Create New Task',
    
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
    
    // Tooltips & Modals
    close: 'Close',
    cancel: 'Cancel',
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
    onboardingStep1Description: 'Use the map to find available jobs in your area. Each marker represents a job opportunity.',
    onboardingStep2Title: 'Filter by category',
    onboardingStep2Description: 'Find exactly what you\'re looking for using our category filters: cleaning, plumbing, gardening, and more.',
    onboardingStep3Title: 'Create and manage your jobs',
    onboardingStep3Description: 'Post your own jobs or apply to others. Keep full control of your activities.',
    onboardingStep4Title: 'Ready to start!',
    onboardingStep4Description: 'You have everything you need to start working. Welcome to the CurriJobs community!',
    
    // Additional strings
    category: 'Category',
    postedBy: 'Posted by',
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
    onboardingStep1Description: '使用地图查找您附近的可用职位。每个标记代表一个工作机会。',
    onboardingStep2Title: '按类别筛选',
    onboardingStep2Description: '使用我们的类别筛选器找到您要找的内容：清洁、管道、园艺等。',
    onboardingStep3Title: '创建和管理您的职位',
    onboardingStep3Description: '发布您自己的职位或申请其他职位。完全控制您的活动。',
    onboardingStep4Title: '准备开始！',
    onboardingStep4Description: '您拥有开始工作所需的一切。欢迎加入 CurriJobs 社区！',
    
    // Additional strings
    category: '类别',
  },
};

export default localizations;
