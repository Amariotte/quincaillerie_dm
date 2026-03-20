
export const formatAmount = (amount: number | string | null | undefined) => {
  const normalized =
    typeof amount === 'number'
      ? amount
      : typeof amount === 'string'
        ? Number(amount.replace(/\s/g, '').replace(',', '.'))
        : 0;

  const safeValue = Number.isFinite(normalized) ? normalized : 0;
  return `${safeValue.toLocaleString('fr-FR')} FCFA`;
};


const formatDisplayDate = (value?: Date | string | null) => {
  if (!value) return '—';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('fr-FR');
};

  
 export const isFakeModeEnabled = (): boolean => {
    return process.env.EXPO_PUBLIC_MODE_FAKE_DATA === 'true';
  }


 export const toComparableDate = (value: Date | string | null | undefined): string | null => {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        return null;
      }

      const day = value.getDate();
      const month = value.getMonth() + 1;
      const year = value.getFullYear();
      return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
    }

    const raw = value.trim();
    if (!raw) {
      return null;
    }

    // Handles dd/mm/yyyy first to avoid locale parsing ambiguity.
    const slashParts = raw.split('/');
    if (slashParts.length === 3) {
      const [day, month, year] = slashParts;
      const dayNum = Number(day);
      const monthNum = Number(month);
      const yearNum = Number(year);

      if (
        Number.isInteger(dayNum) &&
        Number.isInteger(monthNum) &&
        Number.isInteger(yearNum) &&
        dayNum >= 1 && dayNum <= 31 &&
        monthNum >= 1 && monthNum <= 12 &&
        yearNum >= 1900
      ) {
        return `${yearNum}${String(monthNum).padStart(2, '0')}${String(dayNum).padStart(2, '0')}`;
      }
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const day = parsed.getDate();
    const month = parsed.getMonth() + 1;
    const year = parsed.getFullYear();
    return `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  };
