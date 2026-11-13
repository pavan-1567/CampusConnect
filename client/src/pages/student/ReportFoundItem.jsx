import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createFoundItem } from '../../features/foundItems/foundItemSlice';

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

const ReportFoundItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.foundItems);

  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    description: '',
    foundLocation: '',
    foundDate: new Date().toISOString().split('T')[0],
    foundTime: '',
    privateObservations: '',
    possessionStatus: 'Still with me',
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

    if (!formData.itemName || !formData.category || !formData.description || !formData.foundLocation || !formData.foundDate) {
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

    const result = await dispatch(createFoundItem(data));

    if (createFoundItem.fulfilled.match(result)) {
      toast.success('Found item report published! Thank you for your integrity in helping reconnect belongings.');
      navigate('/student/my-found');
    } else {
      toast.error(result.payload || 'Failed to submit report. Please check your inputs.');
    }
  };

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '900px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Report a Found Item</h3>
          <p className="text-muted small mb-0">
            Submit details of an item you found on campus to help its rightful owner locate it.
          </p>
        </div>
        <Link to="/student/my-found" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> My Found Reports
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Found Item Info */}
            <h5 className="fw-bold text-navy border-bottom pb-2 mb-3">1. Found Item Information</h5>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold text-secondary small">
                  Item Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="itemName"
                  className="form-control"
                  placeholder="e.g. Student Identity Card with Navy Lanyard"
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
                Description of Found Item <span className="text-danger">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                placeholder="General description of color, make, brand, condition (avoid giving away secret details that only the true owner would know)."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
              <small className="text-muted">
                Tip: Leave some distinct traits unmentioned in public descriptions so the administrator can verify claimants.
              </small>
            </div>

            {/* Found Incident Details */}
            <h5 className="fw-bold text-navy border-bottom pb-2 mb-3">2. When & Where Found</h5>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  Found Location <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="foundLocation"
                  className="form-control"
                  placeholder="e.g. Central Library 2nd Floor Staircase"
                  value={formData.foundLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label fw-semibold text-secondary small">
                  Found Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="foundDate"
                  className="form-control"
                  value={formData.foundDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label fw-semibold text-secondary small">
                  Approx. Found Time
                </label>
                <input
                  type="text"
                  name="foundTime"
                  className="form-control"
                  placeholder="e.g. 12:15 PM"
                  value={formData.foundTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Possession Status */}
            <h5 className="fw-bold text-navy border-bottom pb-2 mb-3">3. Current Possession Status</h5>

            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">
                Where is the item currently kept? <span className="text-danger">*</span>
              </label>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div className="form-check p-3 border rounded">
                    <input
                      className="form-check-input ms-0 me-3"
                      type="radio"
                      name="possessionStatus"
                      id="possession1"
                      value="Still with me"
                      checked={formData.possessionStatus === 'Still with me'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="possession1">
                      Still with me
                      <small className="d-block text-muted fw-normal">
                        I am holding the item and will deposit it when admin requests.
                      </small>
                    </label>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div className="form-check p-3 border rounded">
                    <input
                      className="form-check-input ms-0 me-3"
                      type="radio"
                      name="possessionStatus"
                      id="possession2"
                      value="Deposited at admin office"
                      checked={formData.possessionStatus === 'Deposited at admin office'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="possession2">
                      Deposited at admin office
                      <small className="d-block text-muted fw-normal">
                        I have already handed the item over to the College Admin Block.
                      </small>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Item Image */}
            <h5 className="fw-bold text-navy border-bottom pb-2 mb-3">4. Photograph (Optional)</h5>

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
                  <p className="text-muted small mb-2">Upload a photograph of the found item (Max: 5MB)</p>
                  <label className="btn btn-outline-teal btn-sm px-3 fw-semibold cursor-pointer">
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

            {/* Private Observations for Admin Verification */}
            <div className="p-3 bg-teal bg-opacity-10 rounded border border-teal border-opacity-25 mb-4">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-eye-slash-fill text-teal fs-5 me-2"></i>
                <h6 className="fw-bold text-navy mb-0">Private Verifying Observations (Confidential)</h6>
              </div>
              <p className="text-secondary small mb-3">
                Enter details only visible to college administrators. For instance: name on a hidden card,
                exact lock screen photo, distinctive scratches, or serial identifiers.
              </p>

              <div>
                <input
                  type="text"
                  name="privateObservations"
                  className="form-control"
                  placeholder="e.g. Card bears name John Doe, or earbud case has small initials 'SM' on clip"
                  value={formData.privateObservations}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
              <Link to="/student/dashboard" className="btn btn-light px-4">
                Cancel
              </Link>
              <button type="submit" className="btn btn-teal px-5 fw-bold shadow-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting Report...
                  </>
                ) : (
                  'Publish Found Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportFoundItem;

