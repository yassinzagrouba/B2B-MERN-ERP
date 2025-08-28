import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import { useState, useEffect } from "react";
import { companiesAPI, clientsAPI } from "../../services/api";

export default function StatisticsChart() {
  const [companiesData, setCompaniesData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [clientsData, setClientsData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesResponse, clientsResponse] = await Promise.all([
          companiesAPI.getAll(),
          clientsAPI.getAll(),
        ]);
        
        const companies = Array.isArray(companiesResponse.data?.data) ? companiesResponse.data.data : [];
        const clients = Array.isArray(clientsResponse.data?.data) ? clientsResponse.data.data : [];
        
        // Initialize monthly counts
        const monthlyCompanies = new Array(12).fill(0);
        const monthlyClients = new Array(12).fill(0);
        
        // Count companies by month
        companies.forEach((company: any) => {
          const month = new Date(company.createdAt).getMonth();
          monthlyCompanies[month]++;
        });
        
        // Count clients by month
        clients.forEach((client: any) => {
          const month = new Date(client.createdAt).getMonth();
          monthlyClients[month]++;
        });
        
        setCompaniesData(monthlyCompanies);
        setClientsData(monthlyClients);
      } catch (error) {
        console.error('Error fetching statistics data:', error);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"], // Define line colors
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line", // Set the chart type to 'line'
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    stroke: {
      curve: "straight", // Define the line style (straight, smooth, or step)
      width: [2, 2], // Line width for each dataset
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        // Access categories (month labels) from chart options
        const categories = w.globals.labels || [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const month = categories[dataPointIndex] || `Month ${dataPointIndex + 1}`;
        const value = series[seriesIndex][dataPointIndex];
        const seriesName = w.globals.seriesNames ? w.globals.seriesNames[seriesIndex] : `Series ${seriesIndex + 1}`;
        
        return (
          '<div class="arrow_box">' +
          "<span>" + seriesName + " in " + month + ": " + value + "</span>" +
          "</div>"
        );
      },
    },
    xaxis: {
      type: "category", // Define x-axis type as category
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ], // Define category labels for x-axis
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px", // Hide y-axis title by setting font size to 0
        },
      },
      min: 0, // Set minimum value for y-axis
      max: 250, // Set maximum value for y-axis
    },
  };

  const series = [
    {
      name: "Companies",
      data: companiesData,
    },
    {
      name: "Clients",
      data: clientsData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Monthly growth of companies and clients
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div>
        <Chart options={options} series={series} type="area" height={310} />
      </div>
    </div>
  );
}
