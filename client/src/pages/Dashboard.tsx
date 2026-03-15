import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { Expense, ExpenseStats } from '../types';
import AmountDisplay from '../components/AmountDisplay';
import { formatDateShort } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchJson = async (url: string) => {
  const response = await fetch(`/api${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

const Dashboard: React.FC = () => {
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [currencyStats, setCurrencyStats] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [recurringStats, setRecurringStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const [expensesResponse, statsResponse, currencyResponse, weeklyResponse] = await Promise.all([
          fetchJson('/expenses?limit=5'),
          fetchJson('/expenses/stats/summary'),
          fetchJson('/expenses/stats/currency-summary'),
          fetchJson(`/expenses/stats/summary?startDate=${startOfWeek.toISOString().split('T')[0]}&endDate=${endOfWeek.toISOString().split('T')[0]}`),
        ]);

        if (!mounted) return;

        setRecentExpenses(Array.isArray(expensesResponse.expenses) ? expensesResponse.expenses : []);
        setStats(statsResponse || null);
        setCurrencyStats(currencyResponse || null);
        setWeeklyStats(weeklyResponse || null);

        try {
          const recurringResponse = await fetchJson('/expenses?limit=1000');
          if (!mounted) return;
          const recurringCount = Array.isArray(recurringResponse.expenses)
            ? recurringResponse.expenses.filter((expense: any) => expense.is_recurring).length
            : 0;
          setRecurringStats({ count: recurringCount });
        } catch (error) {
          console.error('Error fetching recurring stats:', error);
          if (mounted) setRecurringStats({ count: 0 });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalAmount = Number(stats?.totalStats?.total_amount || 0);
  const totalExpenses = Number(stats?.totalStats?.total_expenses || 0);
  const weeklyAmount = Number(weeklyStats?.totalStats?.total_amount_cop || weeklyStats?.totalStats?.total_amount || 0);
  const totalAmountCOP = Number(currencyStats?.totalStats?.total_amount_cop || 0);
  const recurringCount = Number(recurringStats?.count || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total en COP</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${totalAmountCOP.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Gastos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalExpenses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${weeklyAmount.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos Recurrentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{recurringCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Acciones rápidas</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/expenses?action=add" className="flex flex-col items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200">
            <FiPlus className="w-6 h-6 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-primary-700">Agregar gasto</span>
          </Link>
          <Link to="/expenses" className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <FiDollarSign className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Ver todos</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <FiTrendingUp className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Categorías</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <FiCalendar className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Configuración</span>
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gastos recientes</h3>
          <Link to="/expenses" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Ver todos</Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-8">
            <FiDollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aún no hay gastos</p>
            <Link to="/expenses?action=add" className="btn-primary">Agrega tu primer gasto</Link>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: expense.category_color }}>
                    {expense.category_name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{expense.category_name} • {formatDateShort(expense.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <AmountDisplay
                    amount={expense.amount}
                    currencySymbol={expense.currency_symbol}
                    currencyCode={expense.currency_code}
                    amountCOP={expense.amount_cop}
                    exchangeRate={expense.exchange_rate}
                    className="text-sm"
                    showCOPInline={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
