// Configuración centralizada para URLs
export const getApiBaseUrl = (): string => {
  return window.location.origin;
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