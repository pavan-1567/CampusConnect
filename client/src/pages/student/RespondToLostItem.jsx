import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import lostItemService from '../../services/lostItemService';
import foundItemService from '../../services/foundItemService';
import { createResponse } from '../../features/responses/responseSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RespondToLostItem = () => {
  const { lostItemId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [lostItem, setLostItem] = useState(null);
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    message: '',
    description: '',
    foundLocation: '',
    foundDate: new Date().toISOString().split('T')[0],
    foundItemId: '',
  });

  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lostRes, foundRes] = await Promise.all([
          lostItemService.getLostItemById(lostItemId),
          foundItemService.getMyFoundItems(),
        ]);
        setLostItem(lostRes.data);
        setMyFoundItems(foundRes.data || []);
      } catch (err) {
        toast.error('Failed to load lost item details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lostItemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If linking an existing found item, auto-fill some fields
    if (name === 'foundItemId' && value) {
      const selectedItem = myFoundItems.find((item) => item._id === value);
      if (selectedItem) {
        setFormData((prev) => ({
          ...prev,
          foundItemId: value,
          description: selectedItem.description || prev.description,
          foundLocation: selectedItem.foundLocation || prev.foundLocation,
        }));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image exceeds 5MB limit.');
        return;
      }
      setEvidenceFile(file);
      setEvidencePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim() || !formData.description.trim() || !formData.foundLocation.trim()) {
      toast.warning('Please complete all response fields.');
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('lostItemId', lostItemId);
    data.append('message', formData.message);
    data.append('description', formData.description);
    data.append('foundLocation', formData.foundLocation);
    data.append('foundDate', formData.foundDate);

    if (formData.foundItemId) {
      data.append('foundItemId', formData.foundItemId);
    }
    if (evidenceFile) {
      data.append('evidenceImage', evidenceFile);
    }

    const result = await dispatch(createResponse(data));
    setSubmitting(false);

    if (createResponse.fulfilled.match(result)) {
      toast.success('Your response has been sent to college administration for review.');
      navigate('/student/my-responses');
    } else {
      toast.error(result.payload || 'Failed to submit response.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading request..." />;
  }

  if (!lostItem) {
    return (
      <div className="alert alert-danger p-4 text-center">
        <h5>Lost Request Not Found</h5>
        <Link to="/student/browse-lost" className="btn btn-outline-danger mt-2">
          Browse Lost Items
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '850px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Respond – I Found This Item</h3>
          <p className="text-muted small mb-0">
            Submit information to the college administrator regarding this lost item report.
          </p>
        </div>
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Cancel
        </button>
      </div>

      {/* Target Lost Item Summary Card */}
      <div className="card border-0 shadow-sm mb-4 bg-light">
        <div className="card-body p-3 d-flex align-items-center">
          <div
            className="rounded bg-white border d-flex align-items-center justify-content-center me-3"
            style={{ width: '64px', height: '64px', minWidth: '64px' }}
          >
            {lostItem.image ? (
              <img src={lostItem.image} alt="" className="w-100 h-100 object-fit-cover rounded" />
            ) : (
              <i className="bi bi-search text-muted fs-4"></i>
            )}
          </div>
          <div>
            <span className="badge bg-primary rounded-pill mb-1">{lostItem.category}</span>
            <h5 className="fw-bold text-navy mb-0">{lostItem.itemName}</h5>
            <small className="text-secondary">
              Reported lost near <strong>{lostItem.lastSeenLocation}</strong> on{' '}
              {new Date(lostItem.lostDate).toLocaleDateString()}
            </small>
          </div>
        </div>
      </div>

      {/* Response Form */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            {/* Optional Link to an Existing Found Report */}
            {myFoundItems.length > 0 && (
              <div className="p-3 bg-light rounded border mb-4">
                <label className="form-label fw-semibold text-navy small mb-1">
                  <i className="bi bi-link-45deg text-primary me-1"></i>
                  Link an Existing Found Item Report (Optional)
                </label>
                <select
                  name="foundItemId"
                  className="form-select"
                  value={formData.foundItemId}
                  onChange={handleChange}
                >
                  <option value="">-- Submit Independent Response (No linked report) --</option>
                  {myFoundItems.map((fi) => (
                    <option key={fi._id} value={fi._id}>
                      {fi.itemName} (Found at: {fi.foundLocation} - {new Date(fi.foundDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <small className="text-muted d-block mt-1">
                  If you already submitted a "Report Found Item" earlier, select it here to automatically link them.
                </small>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">
                Message to Administrator & Owner <span className="text-danger">*</span>
              </label>
              <textarea
                name="message"
                rows="2"
                className="form-control"
                placeholder="e.g. Hello, I found this item on the 2nd floor library table right after class."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">
                Description of Found Item <span className="text-danger">*</span>
              </label>
              <textarea
                name="description"
                rows="3"
                className="form-control"
                placeholder="Describe the item you have in your possession..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  Where was it found? <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="foundLocation"
                  className="form-control"
                  placeholder="e.g. Central Library 2nd Floor"
                  value={formData.foundLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  Date Found <span className="text-danger">*</span>
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
            </div>

            {/* Optional Photo upload */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">
                Optional Photograph of the Found Item
              </label>
              {evidencePreview ? (
                <div className="position-relative d-inline-block">
                  <img
                    src={evidencePreview}
                    alt="Preview"
                    className="rounded border"
                    style={{ maxHeight: '160px', objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFile(null);
                      setEvidencePreview(null);
                    }}
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">Maximum file size: 5MB</small>
                </div>
              )}
            </div>

            {/* Privacy notice */}
            <div className="alert alert-light border small text-muted mb-4">
              <i className="bi bi-shield-lock text-primary me-2"></i>
              Your private phone number and email will not be exposed to the other student. The campus administrator will verify ownership and coordinate handover safely.
            </div>

            <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-light px-4"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-teal px-5 fw-bold shadow-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RespondToLostItem;

