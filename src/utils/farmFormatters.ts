export const formatIndianCurrency = (amount: number): string => {
  if (!amount || isNaN(amount)) return '₹0';

  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, '')} Lakh`;
  } else if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatPerAcrePrice = (totalPrice: number, acres: number): string => {
  if (!totalPrice || !acres || acres <= 0) return '';
  const perAcre = totalPrice / acres;
  return `${formatIndianCurrency(perAcre)} / acre`;
};

export const getGoogleDirectionsUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};

export const getGoogleMapsViewUrl = (lat: number, lng: number): string => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
};

export const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
};
