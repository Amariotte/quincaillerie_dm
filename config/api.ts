
const apiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  endpoints: {
    login: '/auth/login',
    logout: '/auth/logout',
    currentUser: '/auth/me',
    soldes: '/soldes',
    mouvements: '/mouvements',
    changePassword: '/auth/update-password',
    factures: '/factures',
    stats: '/stats',
    produits: '/produits',
    reglements: '/reglements',
    promotions: '/promotions',
    commissions: '/commissions',
    operations: '/operations',
    bonAchats: '/bon-achats',

  },
};

export function getApiUrl(endpoint: string): string {
  return `${apiConfig.baseURL}${endpoint}`;
}

export default apiConfig;
