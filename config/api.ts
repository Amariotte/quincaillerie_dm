
const resolvedBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const fallbackDevBaseUrl = 'http://localhost:3000/api';

const apiConfig = {
  baseURL: resolvedBaseUrl || (__DEV__ ? fallbackDevBaseUrl : ''),
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
    devis: '/devis',
    bonLivraisons: '/bon-livraisons',

  },
};

export function getApiUrl(endpoint: string): string {
  if (!apiConfig.baseURL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL is missing. Set it before creating a production build.'
    );
  }

  return `${apiConfig.baseURL}${endpoint}`;
}

export default apiConfig;
