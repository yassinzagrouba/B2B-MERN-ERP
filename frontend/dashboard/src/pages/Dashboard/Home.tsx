import { useState, useEffect } from "react";
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { dashboardAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import SalesAnalyticsCard from "../../components/analytics/SalesAnalyticsCard";
import TopPerformersCard from "../../components/analytics/TopPerformersCard";
import GrowthMetricsCard from "../../components/analytics/GrowthMetricsCard";
import ConversionRatesCard from "../../components/analytics/ConversionRatesCard";

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalClients: number;
  totalProducts: number;
  totalOrders: number;
  users: any[];
  companies: any[];
  clients: any[];
  products: any[];
  orders: any[];
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalClients: 0,
    totalProducts: 0,
    totalOrders: 0,
    users: [],
    companies: [],
    clients: [],
    products: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="B2B ERP Dashboard | TailAdmin - React.js Admin Dashboard"
        description="This is B2B ERP Dashboard for managing companies, clients, products and orders"
      />
      
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.username || user?.email?.split('@')[0] || 'Admin'}! 👋
              </h1>
              <p className="text-gray-600">Here's what's happening with your B2B operations today.</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
                <div className="text-right">
                  <p className="text-sm opacity-90">Today</p>
                  <p className="text-xl font-bold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Companies</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalCompanies}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Clients</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Products</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Orders</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">Advanced analytics and performance metrics</p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Sales Analytics */}
          <div className="col-span-12 xl:col-span-8">
            <SalesAnalyticsCard />
          </div>

          {/* Growth Metrics */}
          <div className="col-span-12 xl:col-span-4">
            <GrowthMetricsCard />
          </div>

          {/* Top Performers */}
          <div className="col-span-12 xl:col-span-6">
            <TopPerformersCard />
          </div>

          {/* Conversion Rates */}
          <div className="col-span-12 xl:col-span-6">
            <ConversionRatesCard />
          </div>
        </div>
      </div>
    </>
  );
}
