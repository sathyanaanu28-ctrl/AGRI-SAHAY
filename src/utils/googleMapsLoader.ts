export const getGoogleMapsApiKey = (): string => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAys3f7gHRjRtbA3P3ODVzhjtAHTFJa25A';
};
