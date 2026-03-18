
const apiConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    currentUser: '/auth/me',
    soldes: '/soldes',
    transactions: '/transactions',
  },
};

export function getApiUrl(endpoint: string): string {
  return `${apiConfig.baseURL}${endpoint}`;
}

export default apiConfig;
