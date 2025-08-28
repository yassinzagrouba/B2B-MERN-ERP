import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { dashboardAPI } from "../../services/api";

export default function MonthlyTarget() {
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        
        // Calculate completion percentage based on orders vs products
        // Assume target is 100% when orders equal products
        const percentage = data.totalProducts > 0 ? Math.min((data.totalOrders / data.totalProducts) * 100, 100) : 0;
        setCompletionPercentage(Math.round(percentage * 100) / 100); // Round to 2 decimal places
      } catch (error) {
        console.error('Error fetching target data:', error);
      }
    };

    fetchStats();
  }, []);

  const series = [completionPercentage];
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
    <>
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Order Progress
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Orders completion rate vs products
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
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                This Week
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Last Week
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-5">
          <Chart options={options} series={series} type="radialBar" height={330} />
          <div className="flex items-center gap-5 mt-8">
            <div className="flex items-center gap-3">
              <span className="block size-3 bg-blue-500 rounded-full"></span>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="block size-3 bg-gray-200 rounded-full dark:bg-gray-700"></span>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Remaining
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
