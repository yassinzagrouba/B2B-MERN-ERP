import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { analyticsAPI } from "../../services/api";

interface MonthlyTargetData {
  overallProgress: number;
  revenueProgress: number;
  orderProgress: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenueTarget: number;
  monthlyOrdersTarget: number;
  revenueGrowth: number;
  monthName: string;
  daysPassed: number;
  daysInMonth: number;
  message: string;
  projectedRevenue: number;
  remainingDays: number;
  dailyTargetRevenue: number;
}

export default function MonthlyTarget() {
  const [series, setSeries] = useState([0]);
  const [targetData, setTargetData] = useState<MonthlyTargetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyTarget = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getMonthlyTarget();
        console.log('Monthly target response:', response.data); // Debug log
        
        const data = response.data.data;
        setTargetData(data);
        setSeries([Math.min(data.overallProgress || 0, 100)]); // Cap at 100%
      } catch (error: any) {
        console.error('Error fetching monthly target:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Set fallback data on error
        setTargetData({
          overallProgress: 0,
          revenueProgress: 0,
          orderProgress: 0,
          monthlyRevenue: 0,
          monthlyOrders: 0,
          todayRevenue: 0,
          todayOrders: 0,
          monthlyRevenueTarget: 50000,
          monthlyOrdersTarget: 100,
          revenueGrowth: 0,
          monthName: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          daysPassed: new Date().getDate(),
          daysInMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
          message: "Unable to load target data. Please try again later.",
          projectedRevenue: 0,
          remainingDays: 0,
          dailyTargetRevenue: 0
        });
        setSeries([0]);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyTarget();
  }, []);

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };
  
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              {targetData?.monthName || 'Current Month'} progress tracking
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Details
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Set Target
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="relative ">
          <div className="max-h-[330px]" id="chartDarkStyle">
            {loading ? (
              <div className="flex items-center justify-center h-[330px]">
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
              </div>
            ) : (
              <Chart
                options={options}
                series={series}
                type="radialBar"
                height={330}
              />
            )}
          </div>

          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {targetData?.revenueGrowth !== undefined ? 
              `${targetData.revenueGrowth >= 0 ? '+' : ''}${targetData.revenueGrowth.toFixed(1)}%` 
              : '+0%'
            }
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {targetData?.message || "Loading target data..."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Target
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            ${targetData?.monthlyRevenueTarget ? 
              (targetData.monthlyRevenueTarget / 1000).toFixed(0) + 'K' : 
              '50K'
            }
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.26816 13.6632C7.4056 13.8192 7.60686 13.9176 7.8311 13.9176C7.83148 13.9176 7.83187 13.9176 7.83226 13.9176C8.02445 13.9178 8.21671 13.8447 8.36339 13.6981L12.3635 9.70076C12.6565 9.40797 12.6567 8.9331 12.3639 8.6401C12.0711 8.34711 11.5962 8.34694 11.3032 8.63973L8.5811 11.36L8.5811 2.5C8.5811 2.08579 8.24531 1.75 7.8311 1.75C7.41688 1.75 7.0811 2.08579 7.0811 2.5L7.0811 11.3556L4.36354 8.63975C4.07055 8.34695 3.59568 8.3471 3.30288 8.64009C3.01008 8.93307 3.01023 9.40794 3.30321 9.70075L7.26816 13.6632Z"
                fill="#D92D20"
              />
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Revenue
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            ${targetData?.monthlyRevenue ? 
              (targetData.monthlyRevenue / 1000).toFixed(1) + 'K' : 
              '0K'
            }
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75014 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64996L4.69671 7.36026C4.40372 7.65306 3.92885 7.65289 3.63606 7.35991C3.34327 7.06692 3.34344 6.59205 3.63642 6.29926L7.60141 2.33683Z"
                fill="#039855"
              />
            </svg>
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Today
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            ${targetData?.todayRevenue ? 
              (targetData.todayRevenue / 1000).toFixed(1) + 'K' : 
              '0K'
            }
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.60141 2.33683C7.73885 2.18084 7.9401 2.08243 8.16435 2.08243C8.16475 2.08243 8.16516 2.08243 8.16556 2.08243C8.35773 2.08219 8.54998 2.15535 8.69664 2.30191L12.6968 6.29924C12.9898 6.59203 12.9899 7.0669 12.6971 7.3599C12.4044 7.6529 11.9295 7.65306 11.6365 7.36027L8.91435 4.64004L8.91435 13.5C8.91435 13.9142 8.57856 14.25 8.16435 14.25C7.75014 14.25 7.41435 13.9142 7.41435 13.5L7.41435 4.64996L4.69671 7.36026C4.40372 7.65306 3.92885 7.65289 3.63606 7.35991C3.34327 7.06692 3.34344 6.59205 3.63642 6.29926L7.60141 2.33683Z"
                fill="#039855"
              />
            </svg>
          </p>
        </div>
      </div>
    </div>
  );
}
