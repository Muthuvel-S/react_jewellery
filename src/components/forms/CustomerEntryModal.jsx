import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Users, Gem } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function CustomerEntryModal({ onClose, onSuccess }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    CustomerName: '',
    Phone: '',
    Email: '',
    Address: '',
    City: '',
    Pincode: '',
    GSTIN: '',
    AadhaarNo: '',
    OpeningBalance: '0.00'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!formData.CustomerName || !formData.Phone) {
      setError('Please fill in Customer Name and Mobile Number.');
      return;
    }
    setLoading(true);
    try {
      await api('/masters/customers', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success(`Customer "${formData.CustomerName}" onboarded successfully!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to save customer');
      toast.error(err.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <header className="modal-header">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Customer Directory</p>
            <h2 style={{ fontSize: '1.25rem', marginTop: '2px' }}>New Customer Registration</h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </header>

        {error && <div className="alert error" style={{ margin: '1rem 1.65rem 0' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. S. Murugan"
                  value={formData.CustomerName}
                  onChange={e => setFormData({ ...formData, CustomerName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number <span className="required">*</span></label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.Phone}
                  onChange={e => setFormData({ ...formData, Phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={formData.Email}
                  onChange={e => setFormData({ ...formData, Email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>GSTIN / Tax ID</label>
                <input
                  type="text"
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={formData.GSTIN}
                  onChange={e => setFormData({ ...formData, GSTIN: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Address Details</label>
                <input
                  type="text"
                  placeholder="Door No, Street Name, Area"
                  value={formData.Address}
                  onChange={e => setFormData({ ...formData, Address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>City / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Madurai"
                  value={formData.City}
                  onChange={e => setFormData({ ...formData, City: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Opening Ledger Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.OpeningBalance}
                  onChange={e => setFormData({ ...formData, OpeningBalance: e.target.value })}
                />
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              <span>{loading ? 'Registering Customer…' : 'Save Customer Profile'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
