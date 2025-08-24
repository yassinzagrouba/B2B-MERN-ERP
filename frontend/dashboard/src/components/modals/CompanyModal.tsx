import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CompanyData {
  _id: string;
  name: string;
  adresse: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: any) => Promise<void>;
  company?: CompanyData | null;
  mode: 'create' | 'edit' | 'view';
}

export default function CompanyModal({
  isOpen,
  onClose,
  onSave,
  company,
  mode
}: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    adresse: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && company) {
      setFormData({
        name: company.name,
        adresse: company.adresse || '',
        email: company.email || '',
        phone: company.phone || ''
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        adresse: '',
        email: '',
        phone: ''
      });
    }
  }, [mode, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    
    console.log('CompanyModal: Form data being submitted:', formData);
    
    setLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error('CompanyModal: Error saving company:', err);
      setError(err.message || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Create New Company' : mode === 'edit' ? 'Edit Company' : 'Company Details';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              placeholder="Enter company name..."
            />
          </div>

          {/* Grid for Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isReadOnly}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                placeholder="company@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone * (min. 10 digits)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isReadOnly}
                required
                minLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                placeholder="+1234567890 or 0123456789"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address *
            </label>
            <textarea
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              disabled={isReadOnly}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              placeholder="Company address..."
              rows={3}
            />
          </div>

          {/* Read-only fields for view/edit mode */}
          {company && (mode === 'view' || mode === 'edit') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Created
                  </label>
                  <input
                    type="text"
                    value={new Date(company.createdAt).toLocaleDateString()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Updated
                  </label>
                  <input
                    type="text"
                    value={new Date(company.updatedAt).toLocaleDateString()}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  />
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Company' : 'Update Company'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
