import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLostItems } from '../../features/lostItems/lostItemSlice';
import ItemCard from '../../components/common/ItemCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const categories = [
  'All',
  'ID Cards',
  'Electronics',
  'Personal Accessories',
  'Books and Stationery',
  'Bags',
  'Clothing',
  'Documents',
  'Keys',
  'Other',
];

const BrowseLostItems = () => {
  const dispatch = useDispatch();
  const { items, pagination, isLoading } = useSelector((state) => state.lostItems);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(
        fetchLostItems({
          page,
          limit: 12,
          search: search.trim(),
          category: category !== 'All' ? category : undefined,
          location: location.trim() || undefined,
        })
      );
    }, 300);

    return () => clearTimeout(handler);
  }, [dispatch, search, category, location, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('');
    setPage(1);
  };

  return (
    <div className="container-fluid px-0">
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">Browse Lost Belongings</h3>
        <p className="text-muted small mb-0">
          Search reports submitted by fellow students. If you have found any of these items, click "View Details" to respond.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-lg-4">
          <div className="row g-3">
            {/* Search Input */}
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Search Item</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g. ID card, AirPods, Calculator..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary">Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Library, Cafeteria"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Reset Button */}
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleResetFilters}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Grid */}
      {isLoading ? (
        <LoadingSpinner message="Searching lost items..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon="bi-search"
          title="No Lost Items Found"
          description="We couldn't find any lost item reports matching your filters. Try adjusting your search query or check back later."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="row g-4">
            {items.map((item) => (
              <div key={item._id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <ItemCard item={item} type="lost" />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
};

export default BrowseLostItems;

