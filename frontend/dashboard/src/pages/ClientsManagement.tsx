import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { clientsAPI, companiesAPI } from "../services/api";
import ClientModal from "../components/modals/ClientModal";
import ConfirmModal from "../components/modals/ConfirmModal";

// Define the TypeScript interfaces
interface ClientData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  adresse?: string;
  company?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Company {
  _id: string;
  name: string;
  address?: string;
  industry?: string;
}

export default function ClientsManagement() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientData | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsResponse, companiesResponse] = await Promise.all([
        clientsAPI.getAll(),
        companiesAPI.getAll()
      ]);
      
      // Backend returns { success: true, data: clients, pagination: {...} }
      const clientsData = clientsResponse.data?.data || clientsResponse.data;
      const companiesData = companiesResponse.data?.data || companiesResponse.data;
      
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
      setClients([]);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = () => {
    setSelectedClient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditClient = (client: ClientData) => {
    setSelectedClient(client);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewClient = (client: ClientData) => {
    setSelectedClient(client);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteClient = (client: ClientData) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    try {
      await clientsAPI.delete(clientToDelete._id);
      setClients(clients.filter(client => client._id !== clientToDelete._id));
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      console.log('🚀 Saving client data:', JSON.stringify(clientData, null, 2));
      
      if (modalMode === 'create') {
        const response = await clientsAPI.create(clientData);
        console.log('✅ Create response:', response.data);
        await fetchData(); // Refresh to get populated data
      } else if (modalMode === 'edit' && selectedClient) {
        const response = await clientsAPI.update(selectedClient._id, clientData);
        console.log('✅ Update response:', response.data);
        await fetchData(); // Refresh to get populated data
      }
      setIsModalOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      console.error('❌ Error saving client:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error;
    }
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
          Clients Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your client relationships and contact information
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleCreateClient}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Address
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Company
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
            {filteredClients.length === 0 ? (
              <TableRow>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No clients found matching your search.' : 'No clients found.'}
                </td>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {client.phone || 'N/A'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {client.adresse || 'N/A'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {client.company?.name || 'No company'}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Client"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Client"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Client"
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

      {/* Client Modal */}
      {isModalOpen && (
        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveClient}
          client={selectedClient}
          companies={companies}
          mode={modalMode}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Client"
          message={`Are you sure you want to delete "${clientToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
