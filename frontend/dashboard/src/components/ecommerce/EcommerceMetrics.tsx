import { useState, useEffect } from "react";
import {
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { dashboardAPI } from "../../services/api";

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    totalOrders: 0,
    loading: true
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setMetrics({
          totalClients: data.totalClients,
          totalOrders: data.totalOrders,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetrics();
  }, []);

  if (metrics.loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
              <div className="mt-5">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Clients
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.totalClients.toLocaleString()}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            Active
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.totalOrders.toLocaleString()}
            </h4>
          </div>

          <Badge color="info">
            <ArrowUpIcon />
            Total
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
