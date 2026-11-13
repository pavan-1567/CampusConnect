import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createLostItem } from '../../features/lostItems/lostItemSlice';

const categories = [
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

const ReportLostItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.lostItems);

  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    lastSeenLocation: '',
    lostDate: new Date().toISOString().split('T')[0],
    lostTime: '',
    identifyingDetails: '',
    contactNumber: user?.phone || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Invalid image type. Only JPEG, PNG, or WebP images are allowed.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName || !formData.category || !formData.description || !formData.lastSeenLocation || !formData.lostDate) {
      toast.warning('Please fill in all mandatory fields.');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (imageFile) {
      data.append('image', imageFile);
    }

    const result = await dispatch(createLostItem(data));

    if (createLostItem.fulfilled.match(result)) {
      toast.success('Lost item report submitted successfully! College administrators have been notified.');
      navigate('/student/my-lost');
    } else {
      toast.error(result.payload || 'Failed to submit report. Please check your inputs.');
    }
  };

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '900px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Report a Lost Item</h3>
          <p className="text-muted small mb-0">
            Submit details of your lost belonging to notify campus administrators and fellow students.
          </p>
        </div>
        <Link to="/student/my-lost" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> My Lost Items
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Basic Information */}
            <h5 className="fw-bold text-navy border-bottom pb-2 mb-3">1. Item Information</h5>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold text-secondary small">
                  Item Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="itemName"
                  className="form-control"
                  placeholder="e.g. Blue Apple AirPods Pro in Teal Case"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold text-secondary small">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">
                Detailed Description <span className="text-danger">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                placeholder="Describe brand, color, physical condition, unique markings, model, etc."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
              <small className="text-muted">
                This public description helps fellow students identify your item when browsing listings.
              </small>
            </div>

            {/* Incident Details */}
            <h5 className="fw-bold text-navy border-bottom pb-2 mb-3">2. When & Where</h5>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  Last Seen Location <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="lastSeenLocation"
                  className="form-control"
                  placeholder="e.g. Central Library 2nd Floor or Cafeteria Booth"
                  value={formData.lastSeenLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label fw-semibold text-secondary small">
                  Lost Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="lostDate"
                  className="form-control"
                  value={formData.lostDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label fw-semibold text-secondary small">
                  Approx. Time (Optional)
                </label>
                <input
                  type="text"
                  name="lostTime"
                  className="form-control"
                  placeholder="e.g. 11:30 AM or Afternoon"
                  value={formData.lostTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Item Image Upload */}
            <h5 className="fw-bold text-navy border-bottom pb-2 mb-3">3. Photograph (Optional)</h5>

            <div className="mb-4">
              {imagePreview ? (
                <div className="position-relative d-inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded border"
                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                    title="Remove Image"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ) : (
                <div className="p-4 border border-dashed rounded text-center bg-light">
                  <i className="bi bi-cloud-arrow-up fs-2 text-secondary mb-2 d-block"></i>
                  <p className="text-muted small mb-2">Upload a reference photograph of your item (Max: 5MB)</p>
                  <label className="btn btn-outline-primary btn-sm px-3 fw-semibold cursor-pointer">
                    <i className="bi bi-camera me-1"></i> Choose Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Private Identifying Details for Ownership Verification */}
            <div className="p-3 bg-primary bg-opacity-10 rounded border border-primary border-opacity-25 mb-4">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-shield-lock-fill text-primary fs-5 me-2"></i>
                <h6 className="fw-bold text-navy mb-0">Private Verification Information</h6>
              </div>
              <p className="text-secondary small mb-3">
                Information entered below is <strong>STRICTLY CONFIDENTIAL</strong>. It is never displayed
                publicly and will only be viewed by college administrators to verify your legitimate ownership
                before authorizing an item handover.
              </p>

              <div className="row g-3">
                <div className="col-12 col-md-7">
                  <label className="form-label fw-semibold text-navy small">
                    Secret / Private Identifying Details
                  </label>
                  <input
                    type="text"
                    name="identifyingDetails"
                    className="form-control"
                    placeholder="e.g. Serial number, lock-screen wallpaper, engraving, internal card IDs"
                    value={formData.identifyingDetails}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-5">
                  <label className="form-label fw-semibold text-navy small">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    className="form-control"
                    placeholder="+1 555-0100"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
              <Link to="/student/dashboard" className="btn btn-light px-4">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary px-5 fw-bold shadow-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting Report...
                  </>
                ) : (
                  'Publish Lost Item Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportLostItem;

