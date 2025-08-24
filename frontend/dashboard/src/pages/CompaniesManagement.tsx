import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, Building } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { companiesAPI } from "../services/api";
import CompanyModal from "../components/modals/CompanyModal";
import ConfirmModal from "../components/modals/ConfirmModal";

// Define the TypeScript interface
interface CompanyData {
  _id: string;
  name: string;
  adresse: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export default function CompaniesManagement() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<CompanyData | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getAll();
      
      // Backend returns { success: true, data: companies, pagination: {...} }
      const companiesData = response.data?.data || response.data;
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: CompanyData) => {
    setSelectedCompany(company);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewCompany = (company: CompanyData) => {
    setSelectedCompany(company);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteCompany = (company: CompanyData) => {
    setCompanyToDelete(company);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!companyToDelete) return;
    
    try {
      await companiesAPI.delete(companyToDelete._id);
      setCompanies(companies.filter(company => company._id !== companyToDelete._id));
      setIsDeleteModalOpen(false);
      setCompanyToDelete(null);
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleSaveCompany = async (companyData: any) => {
    console.log('Attempting to save company data:', companyData);
    try {
      if (modalMode === 'create') {
        console.log('Creating new company with data:', companyData);
        await companiesAPI.create(companyData);
        await fetchCompanies(); // Refresh to get updated data
      } else if (modalMode === 'edit' && selectedCompany) {
        console.log('Updating company with data:', companyData);
        await companiesAPI.update(selectedCompany._id, companyData);
        await fetchCompanies(); // Refresh to get updated data
      }
      setIsModalOpen(false);
      setSelectedCompany(null);
    } catch (error: any) {
      console.error('Error saving company:', error);
      // Log the full error details
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => 
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Companies Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your business partnerships and company information
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateCompany}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Company
        </button>
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Company
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Address
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date Added
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No companies found matching your search.' : 'No companies found.'}
                </td>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <Building className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {company.phone}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {company.email}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                      {company.adresse}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCompany(company)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Company"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditCompany(company)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Company"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Company"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Company Modal */}
      {isModalOpen && (
        <CompanyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCompany}
          company={selectedCompany}
          mode={modalMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Company"
          message={`Are you sure you want to delete "${companyToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
