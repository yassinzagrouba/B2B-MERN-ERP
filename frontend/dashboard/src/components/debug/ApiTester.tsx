import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { companiesAPI, clientsAPI, productsAPI, ordersAPI } from "../../services/api";

export default function ApiTester() {
  const { user, isAuthenticated } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const testResults: any = {};

    // Test each endpoint
    const endpoints = [
      { name: 'companies', api: companiesAPI },
      { name: 'clients', api: clientsAPI },
      { name: 'products', api: productsAPI },
      { name: 'orders', api: ordersAPI }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await endpoint.api.getAll();
        testResults[endpoint.name] = {
          success: true,
          data: response.data,
          count: Array.isArray(response.data) ? response.data.length : 'Not an array'
        };
      } catch (error: any) {
        testResults[endpoint.name] = {
          success: false,
          error: error.response?.status || error.message,
          message: error.response?.data?.message || error.message
        };
      }
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        API Connection Tester
      </h2>

      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Authentication Status:</h3>
        <p className="text-sm">
          Authenticated: <span className={isAuthenticated ? "text-green-600" : "text-red-600"}>
            {isAuthenticated ? "Yes" : "No"}
          </span>
        </p>
        {user && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p>User: {user.username} ({user.email})</p>
            <p>Role: {user.role}</p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
        </p>
      </div>

      <button
        onClick={testEndpoints}
        disabled={loading || !isAuthenticated}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Testing...' : 'Test API Endpoints'}
      </button>

      {!isAuthenticated && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please sign in first to test the API endpoints.
          </p>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">Test Results:</h3>
          {Object.entries(results).map(([endpoint, result]: [string, any]) => (
            <div
              key={endpoint}
              className={`p-3 rounded border ${
                result.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize text-gray-800 dark:text-white">
                  {endpoint}
                </h4>
                <span className={`text-sm font-bold ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              
              {result.success ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  <p>Count: {result.count}</p>
                  <p>Data type: {typeof result.data}</p>
                </div>
              ) : (
                <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                  <p>Error: {result.error}</p>
                  <p>Message: {result.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
