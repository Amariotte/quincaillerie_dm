const resolvedBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const fallbackDevBaseUrl = "http://localhost:3000/api";

const apiConfig = {
  baseURL: resolvedBaseUrl || (__DEV__ ? fallbackDevBaseUrl : ""),
  endpoints: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    currentUser: "/auth/me",
    profilePhoto: "/auth/photos",
    soldes: "/soldes",
    mouvements: "/mouvements",
    changePassword: "/auth/update-password",
    factures: "/factures",
    stats: "/stats",
    produits: "/produits",
    reglements: "/reglements",
    promotions: "/promotions",
    commissions: "/commissions",
    operations: "/operations",
    bonAchats: "/bon-achats",
    devis: "/devis",
    bonLivraisons: "/bon-livraisons",
    sousComptes: "/sous-comptes",
      statistiques: "/statistiques",
  },
};

export function getApiUrl(endpoint: string): string {
  if (!apiConfig.baseURL) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is missing. Set it before creating a production build.",
    );
  }

  return `${apiConfig.baseURL}${endpoint}`;
}

export default apiConfig;
