import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { ProductGrid, Pagination, Breadcrumb } from '../components/ui';
import { ProductFilter, SortOptions, ViewToggle, ProductListItem } from '../components/product';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProducts, fetchCategories } from '../redux/productSlice';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, page, pages, categories } = useAppSelector(
    (state) => state.products
  );

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  );
  
  const selectedCategory = searchParams.get('category') || '';
  const searchTerm = searchParams.get('keyword') || '';
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  
  // View mode state (grid or list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (localStorage.getItem('productViewMode') as 'grid' | 'list') || 'grid'
  );

  useEffect(() => {
    dispatch(
      fetchProducts({
        keyword: searchParams.get('keyword') || '',
        pageNumber: parseInt(searchParams.get('page') || '1'),
        category: searchParams.get('category') || '',
        sort: searchParams.get('sort') || 'newest',
      })
    );
  }, [dispatch, searchParams]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('keyword', query);
    } else {
      newParams.delete('keyword');
    }
    newParams.set('page', '1'); // Reset to page 1 on new search
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1'); // Reset to page 1 on category change
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    setCurrentPage(newPage);
  };
  
  const handleSortChange = (sortOption: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortOption);
    setSearchParams(newParams);
    setSortOption(sortOption);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('productViewMode', mode);
  };

  // Create breadcrumb items based on current state
  const breadcrumbItems = [
    { name: 'Products', path: '/products' },
    ...(selectedCategory ? [{ name: selectedCategory, path: `/products?category=${selectedCategory}` }] : []),
    ...(searchTerm ? [{ name: `Search: "${searchTerm}"`, path: `/products?keyword=${searchTerm}` }] : [])
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <h1 className="text-3xl font-bold mb-8">
          {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <ProductFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onSearch={handleSearch}
              initialSearchTerm={searchTerm}
            />
          </div>

          {/* Products grid */}
          <div className="lg:col-span-3">
            {/* Sort options and view toggle */}
            {!loading && products.length > 0 && (
              <div className="flex justify-between items-center mb-6">
                <SortOptions sortBy={sortOption} onSortChange={handleSortChange} />
                <ViewToggle currentView={viewMode} onViewChange={handleViewModeChange} />
              </div>
            )}
            
            {/* Products display - grid or list view */}
            {viewMode === 'grid' ? (
              <ProductGrid
                products={products}
                loading={loading}
                error={error}
                emptyMessage="No products found. Try a different search or category."
              />
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 text-red-700 p-4 rounded">
                    {error}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No products found. Try a different search or category.</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductListItem key={product._id} product={product} />
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && !loading && products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
