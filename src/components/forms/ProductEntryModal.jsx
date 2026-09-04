import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Gem } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function ProductEntryModal({ onClose, onSuccess }) {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    CategoryId: '',
    ProductName: '',
    ProductCode: '',
    HSNCode: '7113',
    MakingChargePerGram: '',
    WastagePercent: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api('/masters/categories');
        if (res.data?.length) {
          setCategories(res.data);
          setFormData(prev => ({
            ...prev,
            CategoryId: res.data[0].CategoryId,
            MakingChargePerGram: prev.MakingChargePerGram || '300.00',
            WastagePercent: prev.WastagePercent || res.data[0].DefaultWastage || '5.00'
          }));
        }
      } catch (e) {
        setError('Failed to load categories');
      }
    }
    loadCategories();
  }, []);

  function handleCategoryChange(catId) {
    const selected = categories.find(c => String(c.CategoryId) === String(catId));
    setFormData(prev => ({
      ...prev,
      CategoryId: catId,
      WastagePercent: selected ? selected.DefaultWastage : prev.WastagePercent
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!formData.CategoryId || !formData.ProductName || !formData.ProductCode) {
      setError('Please fill in Category, Product Name, and Product Code.');
      return;
    }
    setLoading(true);
    try {
      await api('/masters/products', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      toast.success(`Product "${formData.ProductName}" saved to catalog!`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err) {
      setError(err.message || 'Failed to save product');
      toast.error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <header className="modal-header">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Product Master Catalog</p>
            <h2 style={{ fontSize: '1.25rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gem size={18} style={{ color: 'var(--gold-primary)' }} /> New Jewellery Item Entry
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
              <div className="form-group full-width">
                <label>Item Category <span className="required">*</span></label>
                <select value={formData.CategoryId} onChange={e => handleCategoryChange(e.target.value)}>
                  {categories.map(c => (
                    <option key={c.CategoryId} value={c.CategoryId}>
                      {c.CategoryName} ({c.MetalType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product Title / Name <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. 22K Designer Antique Bangle"
                  value={formData.ProductName}
                  onChange={e => setFormData({ ...formData, ProductName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>SKU / Product Code <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. GBA-002"
                  value={formData.ProductCode}
                  onChange={e => setFormData({ ...formData, ProductCode: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Default Making Charge (₹ / g)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 350.00"
                  value={formData.MakingChargePerGram}
                  onChange={e => setFormData({ ...formData, MakingChargePerGram: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Default Wastage Allowance (%)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 6.00"
                  value={formData.WastagePercent}
                  onChange={e => setFormData({ ...formData, WastagePercent: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>HSN Code</label>
                <input
                  type="text"
                  value={formData.HSNCode}
                  onChange={e => setFormData({ ...formData, HSNCode: e.target.value })}
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
              <span>{loading ? 'Saving Item…' : 'Save Jewellery Item'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
