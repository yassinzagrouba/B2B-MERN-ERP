import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface SalesReportData {
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  trendData: Array<{
    date: string;
    sales: number;
  }>;
}

export default function SalesAnalyticsCard() {
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getSalesReport(period);
        setSalesData(response.data.data);
      } catch (error: any) {
        console.error('Error fetching sales analytics:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set default data on error
        setSalesData({
          period: 'month',
          totalSales: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          trendData: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [period]);

  const chartOptions: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      type: "datetime",
      categories: salesData?.trendData.map(item => item.date) || [],
    },
    yaxis: {
      title: {
        text: "Sales Count",
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.1,
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
  };

  const chartSeries = [
    {
      name: "Sales",
      data: salesData?.trendData.map(item => item.sales) || [],
    },
  ];

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales Analytics
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Sales performance over time
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {salesData?.totalSales || 0}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${salesData?.totalRevenue?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Order Value</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${salesData?.averageOrderValue?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="max-w-full overflow-x-auto">
        <Chart 
          options={chartOptions} 
          series={chartSeries} 
          type="area" 
          height={300} 
        />
      </div>
    </div>
  );
}
