import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoundItems } from '../../features/foundItems/foundItemSlice';
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

const BrowseFoundItems = () => {
  const dispatch = useDispatch();
  const { items, pagination, isLoading } = useSelector((state) => state.foundItems);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(
        fetchFoundItems({
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
        <h3 className="fw-bold text-navy mb-1">Browse Found Belongings</h3>
        <p className="text-muted small mb-0">
          Belongings found across campus waiting to be reconnected with their verified owners.
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
                  placeholder="e.g. ID card, Earbuds, Umbrella..."
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
                placeholder="e.g. Library, Lab 304"
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
        <LoadingSpinner message="Searching found items..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon="bi-box-seam"
          title="No Found Items Available"
          description="We couldn't find any found item reports matching your filters right now."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="row g-4">
            {items.map((item) => (
              <div key={item._id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                <ItemCard item={item} type="found" />
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

export default BrowseFoundItems;

