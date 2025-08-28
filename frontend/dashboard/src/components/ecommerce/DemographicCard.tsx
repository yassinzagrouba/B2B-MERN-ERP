import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import CountryMap from "./CountryMap";
import { clientsAPI } from "../../services/api";

interface CompanyDistribution {
  companyName: string;
  count: number;
  percentage: number;
}

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [companyDistribution, setCompanyDistribution] = useState<CompanyDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDistribution = async () => {
      try {
        setLoading(true);
        const response = await clientsAPI.getAll();
        const clients = response.data?.data || response.data || [];

        if (Array.isArray(clients)) {
          // Group clients by company
          const companyGroups: { [key: string]: number } = {};
          let totalClients = 0;

          clients.forEach(client => {
            const companyName = client.company?.name || client.companyName || 'Unknown Company';
            companyGroups[companyName] = (companyGroups[companyName] || 0) + 1;
            totalClients++;
          });

          // Convert to array and calculate percentages
          const distribution = Object.entries(companyGroups)
            .map(([companyName, count]) => ({
              companyName,
              count,
              percentage: totalClients > 0 ? Math.round((count / totalClients) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Show top 5 companies

          setCompanyDistribution(distribution);
        }
      } catch (error) {
        console.error('Error fetching client distribution:', error);
        setCompanyDistribution([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDistribution();
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Client Distribution by Company
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of clients based on company
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
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl dark:border-gray-800 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">Loading client distribution...</p>
          </div>
        ) : companyDistribution.length > 0 ? (
          companyDistribution.map((company, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="items-center w-full rounded-full max-w-8">
                  <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {company.companyName.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {company.companyName}
                  </p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {company.count} Client{company.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div 
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                    style={{ width: `${company.percentage}%` }}
                  ></div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {company.percentage}%
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No client data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
