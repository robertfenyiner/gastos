import React, { useState, useEffect } from 'react';
import { FiUsers, FiSettings, FiMail, FiDownload, FiTrash2, FiDatabase } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmailTemplateEditor from '../components/EmailTemplateEditor';
import api from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  expense_count: number;
  total_spent_cop: number;
  created_at: string;
}

interface SystemStats {
  totalUsers: number;
  totalExpenses: number;
  totalAmountCop: number;
  totalCategories: number;
  adminUsers: number;
}

interface Backup {
  fileName: string;
  size: number;
  created: string;
  downloadUrl: string;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.is_admin) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'backups') {
      loadBackups();
    }
  }, [activeTab, currentPage, userSearch]);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(userSearch && { search: userSearch })
      });
      
      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/backup/list');
      setBackups(response.data.backups);
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el usuario "${username}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar el usuario');
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      const response = await api.post('/backup/create');
      alert(`Backup creado exitosamente: ${response.data.fileName}`);
      loadBackups();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear el backup');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = (backup: Backup) => {
    window.open(backup.downloadUrl, '_blank');
  };

  const deleteBackup = async (fileName: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el backup "${fileName}"?`)) {
      return;
    }

    try {
      await api.delete(`/backup/${fileName}`);
      loadBackups();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar el backup');
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos de administrador para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600">Gestiona usuarios y configuraciones del sistema</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiSettings className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUsers className="w-4 h-4 inline mr-2" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiMail className="w-4 h-4 inline mr-2" />
            Plantillas Email
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiDatabase className="w-4 h-4 inline mr-2" />
            Backups
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FiUsers className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
                  <p className="text-gray-600">Usuarios</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FiSettings className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalExpenses || 0}</p>
                  <p className="text-gray-600">Gastos</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FiDatabase className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats?.totalCategories || 0}</p>
                  <p className="text-gray-600">Categorías</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FiMail className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">{stats?.adminUsers || 0}</p>
                  <p className="text-gray-600">Admins</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <FiDownload className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-semibold text-gray-900">
                    ${stats?.totalAmountCop?.toLocaleString('es-CO') || 0}
                  </p>
                  <p className="text-gray-600">Total COP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="input-field max-w-md"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gastos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total COP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : users.map((userData) => (
                  <tr key={userData.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{userData.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userData.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userData.expense_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${userData.total_spent_cop?.toLocaleString('es-CO') || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userData.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Usuario
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!userData.is_admin && (
                        <button
                          onClick={() => deleteUser(userData.id, userData.username)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar usuario"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <EmailTemplateEditor />
      )}

      {activeTab === 'backups' && (
        <div className="space-y-4">
          {/* Backup Actions */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Gestión de Backups</h3>
            <button
              onClick={createBackup}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FiDatabase className="w-4 h-4 mr-2" />
              )}
              Crear Backup
            </button>
          </div>

          {/* Backups List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : backups.map((backup) => (
                  <tr key={backup.fileName}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {backup.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(backup.size / 1024).toFixed(2)} KB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(backup.created).toLocaleString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => downloadBackup(backup)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Descargar backup"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBackup(backup.fileName)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar backup"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && backups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No hay backups disponibles. Crea uno para comenzar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;