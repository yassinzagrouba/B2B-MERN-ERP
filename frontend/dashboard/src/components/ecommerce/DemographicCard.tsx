import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { clientsAPI } from "../../services/api";

export default function DemographicCard() {
  const [clientsByCompany, setClientsByCompany] = useState<any[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await clientsAPI.getAll();
        const clients = Array.isArray(response.data?.data) ? response.data.data : [];
        
        // Group clients by company
        const companyGroups: { [key: string]: number } = {};
        
        clients.forEach((client: any) => {
          const companyName = client.company?.name || 'No Company';
          companyGroups[companyName] = (companyGroups[companyName] || 0) + 1;
        });
        
        // Convert to array and sort by count
        const companiesArray = Object.entries(companyGroups)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3); // Top 3 companies
        
        setClientsByCompany(companiesArray);
        setTotalClients(clients.length);
      } catch (error) {
        console.error('Error fetching client data:', error);
      }
    };

    fetchClientData();
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
            Client Distribution
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of clients by company
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
        <div className="flex flex-col items-center justify-center h-[212px] text-center">
          <div className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {totalClients}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Total Clients</div>
        </div>
      </div>

      <div className="space-y-5">
        {clientsByCompany.map((company, index) => {
          const percentage = totalClients > 0 ? Math.round((company.count / totalClients) * 100) : 0;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                    {company.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {company.name}
                  </p>
                  <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    {company.count} Clients
                  </span>
                </div>
              </div>

              <div className="flex w-full max-w-[140px] items-center gap-3">
                <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div 
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-blue-500 text-xs font-medium text-white"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {percentage}%
                </p>
              </div>
            </div>
          );
        })}
        
        {clientsByCompany.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No client data available
          </div>
        )}
      </div>
    </div>
  );
}
