import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthContextType, User } from '../types';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const parseUserSafely = (userStr: string): User | null => {
  try {
    const parsed = JSON.parse(userStr);

    if (!parsed || typeof parsed !== 'object' ||
        !parsed.id || typeof parsed.id !== 'number' ||
        !parsed.email || typeof parsed.email !== 'string' ||
        !parsed.username || typeof parsed.username !== 'string') {
      throw new Error('Invalid user structure');
    }

    return {
      id: parsed.id,
      username: parsed.username.trim(),
      email: parsed.email.trim().toLowerCase(),
      is_admin: parsed.is_admin || false,
      profile_picture: parsed.profile_picture || null,
      created_at: parsed.created_at || null,
      updated_at: parsed.updated_at || null
    };
  } catch (error) {
    console.error('Failed to parse stored user data:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const isValidTokenFormat = (token: string): boolean => {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const base64Regex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64Regex.test(part));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePictureVersion, setProfilePictureVersion] = useState(Date.now());
  const verifyInFlight = useRef(false);
  const initializedRef = useRef(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('Logged out successfully');
  }, []);

  const verifyToken = useCallback(async () => {
    if (verifyInFlight.current) return;

    verifyInFlight.current = true;
    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        const updatedUser = {
          id: response.data.user.id,
          username: response.data.user.username?.trim() || '',
          email: response.data.user.email?.trim().toLowerCase() || '',
          is_admin: response.data.user.is_admin || false,
          profile_picture: response.data.user.profile_picture || null,
          created_at: response.data.user.created_at || null,
          updated_at: response.data.user.updated_at || null
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error('Invalid user data from server');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
      verifyInFlight.current = false;
    }
  }, [logout]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      if (!isValidTokenFormat(storedToken)) {
        console.warn('Invalid token format, clearing storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      const parsedUser = parseUserSafely(storedUser);
      if (parsedUser) {
        setToken(storedToken);
        setUser(parsedUser);
        verifyToken();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email: email.trim(), password });
      const { token: newToken, user: newUser } = response.data;

      if (!newToken || !isValidTokenFormat(newToken) || !newUser) {
        throw new Error('Invalid response from server');
      }

      const sanitizedUser = {
        id: newUser.id,
        username: newUser.username?.trim() || '',
        email: newUser.email?.trim().toLowerCase() || '',
        is_admin: newUser.is_admin || false,
        profile_picture: newUser.profile_picture || null,
        created_at: newUser.created_at || null,
        updated_at: newUser.updated_at || null
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
      setToken(newToken);
      setUser(sanitizedUser);
      toast.success('Login successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage.includes('server') ? 'Login failed' : errorMessage);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password
      });
      const { token: newToken, user: newUser } = response.data;

      if (!newToken || !isValidTokenFormat(newToken) || !newUser) {
        throw new Error('Invalid response from server');
      }

      const sanitizedUser = {
        id: newUser.id,
        username: newUser.username?.trim() || '',
        email: newUser.email?.trim().toLowerCase() || '',
        is_admin: newUser.is_admin || false,
        profile_picture: newUser.profile_picture || null,
        created_at: newUser.created_at || null,
        updated_at: newUser.updated_at || null
      };

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
      setToken(newToken);
      setUser(sanitizedUser);
      toast.success('Registration successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage.includes('server') ? 'Registration failed' : errorMessage);
    }
  };

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (updates.profile_picture !== undefined) {
        setProfilePictureVersion(Date.now());
      }

      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data?.user) {
            const serverUser = {
              id: response.data.user.id,
              username: response.data.user.username?.trim() || '',
              email: response.data.user.email?.trim().toLowerCase() || '',
              is_admin: response.data.user.is_admin || false,
              profile_picture: response.data.user.profile_picture || null,
              created_at: response.data.user.created_at || null,
              updated_at: response.data.user.updated_at || null
            };
            setUser(serverUser);
            localStorage.setItem('user', JSON.stringify(serverUser));
          }
        } catch (error) {
          console.error('Error al sincronizar usuario con servidor:', error);
        }
      }
    }
  }, [user, token]);

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    profilePictureVersion,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
