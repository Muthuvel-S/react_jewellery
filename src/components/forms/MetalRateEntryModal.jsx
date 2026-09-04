import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Coins } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function MetalRateEntryModal({ onClose, onSuccess }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    MetalType: 'Gold',
    Purity: '22K (916)',
    BoardRate: '',
    BuyRate: '',
    EffectiveDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const puritiesMap = {
    Gold: ['22K (916)', '24K (999)', '18K (750)'],
    Silver: ['92.5 Fine', '99.9 Pure'],
    Platinum: ['Pt 950']
  };

  function handleChange(field, value) {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'MetalType') {
        next.Purity = puritiesMap[value]?.[0] || '';
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!formData.BoardRate || Number(formData.BoardRate) <= 0) {
      setError('Please enter a valid Board Rate.');
      return;
    }
    setLoading(true);
    try {
      await api('/masters/metal-rates', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success(`${formData.MetalType} rate of ₹${formData.BoardRate}/g saved successfully!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to save metal rate');
      toast.error(err.message || 'Failed to save metal rate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <header className="modal-header">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Daily Market Rates</p>
            <h2 style={{ fontSize: '1.25rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={18} style={{ color: 'var(--gold-primary)' }} /> Daily Metal Rate Entry
            </h2>
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
                <label>Metal Type</label>
                <select value={formData.MetalType} onChange={e => handleChange('MetalType', e.target.value)}>
                  <option value="Gold">Gold 🥇</option>
                  <option value="Silver">Silver 🥈</option>
                  <option value="Platinum">Platinum 💎</option>
                </select>
              </div>

              <div className="form-group">
                <label>Purity Standard</label>
                <select value={formData.Purity} onChange={e => handleChange('Purity', e.target.value)}>
                  {puritiesMap[formData.MetalType]?.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Board Selling Rate (₹ / g) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 6850.00"
                  value={formData.BoardRate}
                  onChange={e => handleChange('BoardRate', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Exchange / Buy Rate (₹ / g)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 6650.00"
                  value={formData.BuyRate}
                  onChange={e => handleChange('BuyRate', e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Effective Date</label>
                <input
                  type="date"
                  value={formData.EffectiveDate}
                  onChange={e => handleChange('EffectiveDate', e.target.value)}
                  required
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
              <span>{loading ? 'Publishing Rate…' : 'Publish Metal Rate'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
