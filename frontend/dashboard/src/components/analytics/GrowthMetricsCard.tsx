import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';

interface GrowthData {
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  clients: {
    current: number;
    previous: number;
    growth: number;
  };
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
}

export default function GrowthMetricsCard() {
  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getGrowthMetrics();
        setGrowthData(response.data.data);
      } catch (error: any) {
        console.error('Error fetching growth metrics:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set default data on error
        setGrowthData({
          orders: { current: 0, previous: 0, growth: 0 },
          clients: { current: 0, previous: 0, growth: 0 },
          revenue: { current: 0, previous: 0, growth: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!growthData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No growth data available
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Growth Metrics
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Month-over-month growth comparison
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders Growth */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Orders</h4>
            <span className="text-lg">{getGrowthIcon(growthData.orders?.growth || 0)}</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {growthData.orders?.current || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Previous: {growthData.orders?.previous || 0}
            </p>
            <p className={`text-sm font-medium ${getGrowthColor(growthData.orders?.growth || 0)}`}>
              {(growthData.orders?.growth || 0) >= 0 ? '+' : ''}{(growthData.orders?.growth || 0).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Clients Growth */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">New Clients</h4>
            <span className="text-lg">{getGrowthIcon(growthData.clients?.growth || 0)}</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {growthData.clients?.current || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Previous: {growthData.clients?.previous || 0}
            </p>
            <p className={`text-sm font-medium ${getGrowthColor(growthData.clients?.growth || 0)}`}>
              {(growthData.clients?.growth || 0) >= 0 ? '+' : ''}{(growthData.clients?.growth || 0).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</h4>
            <span className="text-lg">{getGrowthIcon(growthData.revenue?.growth || 0)}</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${(growthData.revenue?.current || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Previous: ${(growthData.revenue?.previous || 0).toFixed(2)}
            </p>
            <p className={`text-sm font-medium ${getGrowthColor(growthData.revenue?.growth || 0)}`}>
              {(growthData.revenue?.growth || 0) >= 0 ? '+' : ''}{(growthData.revenue?.growth || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
