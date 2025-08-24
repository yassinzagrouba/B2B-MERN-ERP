import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { companiesAPI } from "../../../services/api";

interface Company {
  _id: string;
  name: string;
  adresse: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export default function BasicTableOne() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await companiesAPI.getAll();
        setCompanies(response.data || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Company Name
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Address
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Contact
            </TableCell>
            <TableCell
              isHeader
              className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Status
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {companies.length === 0 ? (
            <TableRow>
              <TableCell className="py-8 text-center text-gray-500">
                No companies found
              </TableCell>
              <TableCell className="py-8">&nbsp;</TableCell>
              <TableCell className="py-8">&nbsp;</TableCell>
              <TableCell className="py-8">&nbsp;</TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow key={company._id}>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {company.name}
                      </p>
                      <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                        Created {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-gray-500 dark:text-gray-400">
                  <p className="text-theme-sm">{company.adresse}</p>
                </TableCell>
                <TableCell className="py-4 text-gray-500 dark:text-gray-400">
                  <div>
                    <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {company.email}
                    </p>
                    <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                      {company.phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge color="success">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
