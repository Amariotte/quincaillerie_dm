export type meta = {
  page: number;
  next: number;
  totalPages: number;
  total: number;
  size: number;
};

export type stat = {
  venteNonSoldee: {
    total: number;
  };
  venteNonSoldees: {
    nbre: number;
  };
  venteEchue: {
    nbre: number;
    total: number;
  };
  promotionActive: number;
};
