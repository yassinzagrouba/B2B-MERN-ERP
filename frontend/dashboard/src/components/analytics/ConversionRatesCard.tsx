import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';

interface ConversionData {
  visitorToLead: number;
  leadToClient: number;
  clientToOrder: number;
  overallConversion: number;
  totalVisitors: number;
  totalLeads: number;
  totalClients: number;
  totalOrders: number;
}

export default function ConversionRatesCard() {
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversionData = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getConversionRates();
        console.log('Conversion rates response:', response.data); // Debug log
        setConversionData(response.data.data);
      } catch (error: any) {
        console.error('Error fetching conversion rates:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set default data on error
        setConversionData({
          visitorToLead: 0,
          leadToClient: 0,
          clientToOrder: 0,
          overallConversion: 0,
          totalVisitors: 0,
          totalLeads: 0,
          totalClients: 0,
          totalOrders: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversionData();
  }, []);

  const getConversionColor = (rate: number) => {
    if (rate >= 20) return 'from-green-500 to-green-600';
    if (rate >= 10) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getConversionBg = (rate: number) => {
    if (rate >= 20) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (rate >= 10) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!conversionData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No conversion data available
        </p>
      </div>
    );
  }

  const conversions = [
    {
      label: 'Visitor to Lead',
      rate: conversionData.visitorToLead || 0,
      from: conversionData.totalVisitors || 0,
      to: conversionData.totalLeads || 0,
      icon: '👥'
    },
    {
      label: 'Lead to Client',
      rate: conversionData.leadToClient || 0,
      from: conversionData.totalLeads || 0,
      to: conversionData.totalClients || 0,
      icon: '🤝'
    },
    {
      label: 'Client to Order',
      rate: conversionData.clientToOrder || 0,
      from: conversionData.totalClients || 0,
      to: conversionData.totalOrders || 0,
      icon: '🛒'
    }
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Conversion Rates
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          Track your funnel performance
        </p>
      </div>

      {/* Overall Conversion Rate */}
      <div className={`rounded-lg border p-4 mb-6 ${getConversionBg(conversionData.overallConversion)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Conversion Rate
            </h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {conversionData.overallConversion?.toFixed(2) || '0.00'}%
            </p>
          </div>
          <div className="text-3xl">📈</div>
        </div>
      </div>

      {/* Individual Conversion Steps */}
      <div className="space-y-4">
        {conversions.map((conversion, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{conversion.icon}</span>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {conversion.label}
                </h4>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {conversion.rate?.toFixed(2) || '0.00'}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getConversionColor(conversion.rate || 0)}`}
                style={{ width: `${Math.min(conversion.rate || 0, 100)}%` }}
              ></div>
            </div>

            {/* Conversion Numbers */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{(conversion.from || 0).toLocaleString()} → {(conversion.to || 0).toLocaleString()}</span>
              <span>{conversion.to || 0} conversions</span>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel Visualization */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Conversion Funnel
        </h4>
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Visitors</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {(conversionData.totalVisitors || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-gray-400 text-2xl">→</div>
          
          <div className="flex-1">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">📝</span>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Leads</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {(conversionData.totalLeads || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-gray-400 text-2xl">→</div>
          
          <div className="flex-1">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg">🤝</span>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Clients</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {(conversionData.totalClients || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-gray-400 text-2xl">→</div>
          
          <div className="flex-1">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-sm">🛒</span>
            </div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Orders</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {(conversionData.totalOrders || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
