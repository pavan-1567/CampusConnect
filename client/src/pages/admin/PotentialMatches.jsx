import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PotentialMatches = () => {
  const [searchParams] = useSearchParams();
  const preselectedLostItemId = searchParams.get('lostItemId');
  const preselectedResponseId = searchParams.get('responseId');

  const [matches, setMatches] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Workspace comparison state
  const [selectedLostItemId, setSelectedLostItemId] = useState(preselectedLostItemId || '');
  const [lostItemDetails, setLostItemDetails] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [matchRemarks, setMatchRemarks] = useState('');
  const [creatingMatch, setCreatingMatch] = useState(false);

  const fetchMatchesList = async () => {
    try {
      setLoading(true);
      const [matchesRes, lostRes] = await Promise.all([
        adminService.getMatches({ limit: 50 }),
        adminService.getLostItemsAdmin({ limit: 50 }),
      ]);
      setMatches(matchesRes.data.matches || []);
      setLostItems(lostRes.data.items || []);
    } catch (err) {
      toast.error('Failed to load matching workspace: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesList();
  }, []);

  // When a lost item is selected in the matching engine dropdown, fetch automated suggestions
  useEffect(() => {
    if (!selectedLostItemId) {
      setLostItemDetails(null);
      setSuggestions([]);
      setSelectedSuggestion(null);
      return;
    }

    const loadSuggestions = async () => {
      try {
        setCalculating(true);
        const res = await adminService.getSuggestedMatches(selectedLostItemId);
        setLostItemDetails(res.data.lostItem);
        setSuggestions(res.data.suggestions || []);
        if (res.data.suggestions && res.data.suggestions.length > 0) {
          setSelectedSuggestion(res.data.suggestions[0]);
        } else {
          setSelectedSuggestion(null);
        }
      } catch (err) {
        toast.error('Failed to compute match suggestions: ' + err.message);
      } finally {
        setCalculating(false);
      }
    };

    loadSuggestions();
  }, [selectedLostItemId]);

  const handleCreateMatch = async () => {
    if (!selectedLostItemId || !selectedSuggestion) {
      toast.warning('Please select both a lost item and a candidate found item.');
      return;
    }

    try {
      setCreatingMatch(true);
      await adminService.createMatch({
        lostItemId: selectedLostItemId,
        foundItemId: selectedSuggestion.foundItem._id,
        responseId: preselectedResponseId || undefined,
        remarks: matchRemarks.trim(),
      });
      toast.success('Potential match confirmed and moved to Ownership Verification queue!');
      setMatchRemarks('');
      fetchMatchesList();
    } catch (err) {
      toast.error(err.message || 'Failed to create match.');
    } finally {
      setCreatingMatch(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Initializing Matching Workspace..." />;
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">Potential Matching Workspace</h3>
          <p className="text-muted small mb-0">
            Rule-based engine with weighted comparison: Name (30%), Category (20%), Location (25%), Date (15%), Description (10%).
          </p>
        </div>
        <Link to="/admin/verification" className="btn btn-warning text-dark fw-bold btn-sm shadow-xs">
          <i className="bi bi-shield-check me-1"></i> Proceed to Ownership Verification
        </Link>
      </div>

      {/* 1. Comparison & Match Creation Workspace */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-navy text-white py-3 d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-diagram-3 me-2 text-primary"></i> Side-by-Side Match Evaluator
          </h5>
          <span className="badge bg-primary rounded-pill px-3 py-1">Interactive Comparison</span>
        </div>

        <div className="card-body p-4">
          <div className="mb-4">
            <label className="form-label fw-bold text-navy small">Select Lost Item to Evaluate:</label>
            <select
              className="form-select form-select-lg"
              value={selectedLostItemId}
              onChange={(e) => setSelectedLostItemId(e.target.value)}
            >
              <option value="">-- Choose a lost item to evaluate candidate matches --</option>
              {lostItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.itemName} ({item.category}) - Reported by {item.studentId?.name || 'Student'} on{' '}
                  {new Date(item.lostDate).toLocaleDateString()} [{item.status}]
                </option>
              ))}
            </select>
          </div>

          {calculating && <LoadingSpinner message="Running rule-based matching engine across found catalog..." />}

          {selectedLostItemId && lostItemDetails && !calculating && (
            <div>
              {/* Candidate found item selector */}
              {suggestions.length === 0 ? (
                <div className="alert alert-warning p-4 text-center">
                  <i className="bi bi-exclamation-triangle fs-3 mb-2 d-block"></i>
                  <h6>No available found items in the catalog to match against.</h6>
                  <p className="small mb-0">
                    Once students report found items or hand them over to the office, they will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-navy small">
                      Select Candidate Found Item (Ranked by Engine Score):
                    </label>
                    <select
                      className="form-select"
                      value={selectedSuggestion?.foundItem?._id || ''}
                      onChange={(e) => {
                        const matchObj = suggestions.find((s) => s.foundItem._id === e.target.value);
                        setSelectedSuggestion(matchObj || null);
                      }}
                    >
                      {suggestions.map((s) => (
                        <option key={s.foundItem._id} value={s.foundItem._id}>
                          Match Score: {s.matchScore}% | {s.foundItem.itemName} ({s.foundItem.category}) - Found at {s.foundItem.foundLocation}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSuggestion && (
                    <>
                      {/* Match Score Indicator Bar */}
                      <div className="p-3 bg-light rounded border mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-bold text-navy">
                            Engine Confidence Recommendation:
                          </span>
                          <span
                            className={`badge fs-6 px-3 py-2 ${
                              selectedSuggestion.matchScore >= 75
                                ? 'bg-success'
                                : selectedSuggestion.matchScore >= 50
                                ? 'bg-primary'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            Suggested Match Score: {selectedSuggestion.matchScore}%
                          </span>
                        </div>

                        {/* Factor breakdown progress */}
                        <div className="row g-2 text-center small mt-2">
                          <div className="col">
                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Name (30%)</span>
                            <strong>{selectedSuggestion.matchingFactors?.nameScore || 0}%</strong>
                          </div>
                          <div className="col">
                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Category (20%)</span>
                            <strong>{selectedSuggestion.matchingFactors?.categoryScore || 0}%</strong>
                          </div>
                          <div className="col">
                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Location (25%)</span>
                            <strong>{selectedSuggestion.matchingFactors?.locationScore || 0}%</strong>
                          </div>
                          <div className="col">
                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Date (15%)</span>
                            <strong>{selectedSuggestion.matchingFactors?.dateScore || 0}%</strong>
                          </div>
                          <div className="col">
                            <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Desc (10%)</span>
                            <strong>{selectedSuggestion.matchingFactors?.descriptionScore || 0}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Side by Side Comparison Grid */}
                      <div className="row g-4 mb-4">
                        {/* Left: Lost Item */}
                        <div className="col-12 col-md-6">
                          <div className="card h-100 border border-primary border-opacity-25 shadow-xs">
                            <div className="card-header bg-primary bg-opacity-10 py-2 fw-bold text-primary">
                              <i className="bi bi-search me-1"></i> Lost Report: {lostItemDetails.itemName}
                            </div>
                            <div className="card-body p-3">
                              {lostItemDetails.image && (
                                <img
                                  src={lostItemDetails.image}
                                  alt="Lost"
                                  className="rounded mb-3 w-100 object-fit-contain bg-light"
                                  style={{ height: '140px' }}
                                />
                              )}
                              <table className="table table-sm table-borderless small mb-0">
                                <tbody>
                                  <tr>
                                    <th className="text-muted" style={{ width: '120px' }}>Category:</th>
                                    <td className="fw-semibold">{lostItemDetails.category}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Description:</th>
                                    <td>{lostItemDetails.description}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Last Seen:</th>
                                    <td>{lostItemDetails.lastSeenLocation}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Lost Date:</th>
                                    <td>{new Date(lostItemDetails.lostDate).toLocaleDateString()}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Owner Student:</th>
                                    <td>
                                      {lostItemDetails.studentId?.name} ({lostItemDetails.studentId?.collegeId}) -{' '}
                                      {lostItemDetails.contactNumber || lostItemDetails.studentId?.phone}
                                    </td>
                                  </tr>
                                  <tr className="bg-warning bg-opacity-10">
                                    <th className="text-danger">Secret Info:</th>
                                    <td className="fw-bold text-navy">
                                      {lostItemDetails.identifyingDetails || 'None entered'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Right: Candidate Found Item */}
                        <div className="col-12 col-md-6">
                          <div className="card h-100 border border-teal border-opacity-25 shadow-xs">
                            <div className="card-header bg-teal bg-opacity-10 py-2 fw-bold text-teal">
                              <i className="bi bi-box-seam me-1"></i> Found Item: {selectedSuggestion.foundItem.itemName}
                            </div>
                            <div className="card-body p-3">
                              {selectedSuggestion.foundItem.image && (
                                <img
                                  src={selectedSuggestion.foundItem.image}
                                  alt="Found"
                                  className="rounded mb-3 w-100 object-fit-contain bg-light"
                                  style={{ height: '140px' }}
                                />
                              )}
                              <table className="table table-sm table-borderless small mb-0">
                                <tbody>
                                  <tr>
                                    <th className="text-muted" style={{ width: '120px' }}>Category:</th>
                                    <td className="fw-semibold">{selectedSuggestion.foundItem.category}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Description:</th>
                                    <td>{selectedSuggestion.foundItem.description}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Found At:</th>
                                    <td>{selectedSuggestion.foundItem.foundLocation}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Found Date:</th>
                                    <td>{new Date(selectedSuggestion.foundItem.foundDate).toLocaleDateString()}</td>
                                  </tr>
                                  <tr>
                                    <th className="text-muted">Finder Student:</th>
                                    <td>
                                      {selectedSuggestion.foundItem.studentId?.name} ({selectedSuggestion.foundItem.studentId?.collegeId}) -{' '}
                                      {selectedSuggestion.foundItem.studentId?.phone}
                                    </td>
                                  </tr>
                                  <tr className="bg-teal bg-opacity-10">
                                    <th className="text-teal">Private Obs:</th>
                                    <td className="fw-bold text-navy">
                                      {selectedSuggestion.foundItem.privateObservations || 'None entered'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Confirm Match Form */}
                      <div className="p-3 bg-light rounded border">
                        <div className="row g-3 align-items-center">
                          <div className="col-12 col-md-8">
                            <label className="form-label small fw-semibold text-secondary mb-1">
                              Admin Comparison Remarks
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Strong match on location and time. Initial 'JD' observed by finder matches owner record."
                              value={matchRemarks}
                              onChange={(e) => setMatchRemarks(e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-4 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn btn-primary w-100 fw-bold py-2 shadow-sm"
                              onClick={handleCreateMatch}
                              disabled={creatingMatch}
                            >
                              {creatingMatch ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Creating Match...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-link-45deg me-1"></i> Create Match & Queue Verification
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Matches Table */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold text-navy mb-0">
            <i className="bi bi-list-check me-2 text-primary"></i> Existing Active Potential Matches ({matches.length})
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Lost Item</th>
                <th>Found Item</th>
                <th>Match Score</th>
                <th>Admin Evaluator</th>
                <th>Status</th>
                <th className="text-end">Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No active potential matches recorded yet. Use the evaluator above to compare and create matches.
                  </td>
                </tr>
              ) : (
                matches.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="fw-bold text-navy">{m.lostItemId?.itemName}</div>
                      <small className="text-muted">
                        Owner: {m.lostItemId?.studentId?.name} ({m.lostItemId?.studentId?.collegeId})
                      </small>
                    </td>

                    <td>
                      <div className="fw-bold text-teal">{m.foundItemId?.itemName}</div>
                      <small className="text-muted">
                        Finder: {m.foundItemId?.studentId?.name} ({m.foundItemId?.studentId?.collegeId})
                      </small>
                    </td>

                    <td>
                      <span className="badge bg-primary rounded-pill px-3 py-2 fw-semibold">
                        {m.matchScore}%
                      </span>
                    </td>

                    <td>
                      <span className="small text-secondary">{m.adminId?.name || 'Administrator'}</span>
                    </td>

                    <td>
                      <StatusBadge status={m.matchStatus} />
                    </td>

                    <td className="text-end">
                      <Link
                        to={`/admin/verification?matchId=${m._id}`}
                        className="btn btn-sm btn-outline-warning text-dark fw-bold"
                      >
                        <i className="bi bi-patch-check me-1"></i> Verify Claim
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PotentialMatches;

