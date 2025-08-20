// Configuración centralizada para URLs
export const getApiBaseUrl = (): string => {
  // TEMPORAL: Hardcodeado para depuración  
  const apiUrl = 'http://5.189.146.163';
  console.log('[CONFIG] API Base URL (hardcoded):', apiUrl);
  console.log('[CONFIG] Environment variable REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  return apiUrl;
};

export const getFileUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  // Asegurar que no haya doble slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const getProfilePictureUrl = (filename: string, version?: number | string): string => {
  const baseUrl = getApiBaseUrl();
  const versionParam = version ? `?v=${version}` : '';
  return `${baseUrl}/api/files/profile/${filename}${versionParam}`;
};

export const getExpenseFileUrl = (fileId: number): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/files/download/${fileId}`;
};