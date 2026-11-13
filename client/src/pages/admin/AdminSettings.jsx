import React, { useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';

const AdminSettings = () => {
  const [csvText, setCsvText] = useState(
    'collegeId,name,email,department,academicYear\nCS2025001,Samantha Reed,samantha.r@campusconnect.edu,Computer Science & Engineering,1st Year\nEC2025012,Marcus Vance,marcus.v@campusconnect.edu,Electronics & Communication,1st Year\nME2025033,Liam Chen,liam.c@campusconnect.edu,Mechanical Engineering,1st Year'
  );
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);
      const lines = csvText.trim().split('\n');
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 3) {
          records.push({
            collegeId: parts[0],
            name: parts[1],
            email: parts[2],
            department: parts[3] || 'General',
            academicYear: parts[4] || '1st Year',
            isDemonstration: false,
          });
        }
      }

      if (records.length === 0) {
        toast.warning('No records found in CSV.');
        return;
      }

      const res = await adminService.importRoster(records);
      toast.success(
        `Import complete: ${res.data.insertedCount} inserted, ${res.data.updatedCount} updated.`
      );
    } catch (err) {
      toast.error('Import failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '900px' }}>
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">Administrative Settings</h3>
        <p className="text-muted small mb-0">
          Configure college parameters, manage authorized student rosters, and view environment configuration.
        </p>
      </div>

      {/* College Identity Settings Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold text-navy mb-0">Institutional System Profile</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">Institution Name</label>
              <input
                type="text"
                className="form-control"
                value="CampusConnect University Central Campus"
                disabled
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-secondary">Central Collection Desk</label>
              <input
                type="text"
                className="form-control"
                value="College Admin Block, Room 104"
                disabled
              />
            </div>
          </div>
          <p className="text-muted small mb-0">
            Physical handovers and verifications are centralized at the College Admin Block to guarantee chain of custody.
          </p>
        </div>
      </div>

      {/* Roster Import Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold text-navy mb-0">
            <i className="bi bi-file-earmark-spreadsheet text-primary me-2"></i>
            Bulk Student Roster Import (CSV)
          </h5>
        </div>
        <div className="card-body p-4">
          <p className="text-secondary small mb-3">
            Students whose College IDs are present on this roster will automatically bypass administrative approval
            and be granted immediate active status upon registration.
          </p>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-secondary">
              CSV Format: <code>collegeId,name,email,department,academicYear</code>
            </label>
            <textarea
              rows="6"
              className="form-control font-monospace small"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            ></textarea>
          </div>

          <button
            type="button"
            className="btn btn-primary fw-semibold"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? 'Importing Roster Records...' : 'Import to Authorized Roster'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

