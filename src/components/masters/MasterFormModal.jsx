import React, { useState } from 'react';
import { X, Gem } from 'lucide-react';

export default function MasterFormModal({ title, fields, initialData, onClose, onSave }) {
  const [formData, setFormData] = useState(
    initialData || fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? '' }), {})
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <header className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gem size={18} style={{ color: 'var(--gold-primary)' }} />
            <h3>{initialData ? `Edit ${title}` : `New ${title}`}</h3>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert error">{error}</div>}

            <div className="form-grid">
              {fields.map(field => (
                <div
                  key={field.name}
                  className={`form-group ${field.fullWidth || fields.length <= 3 ? 'full-width' : ''}`}
                  style={{ margin: 0 }}
                >
                  <label>
                    {field.label} {field.required && <span className="required">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={e => handleChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      <option value="">Select {field.label}...</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] ?? ''}
                      onChange={e =>
                        handleChange(
                          field.name,
                          field.type === 'number' ? Number(e.target.value) : e.target.value
                        )
                      }
                      placeholder={field.placeholder || ''}
                      required={field.required}
                      step={field.step || undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              <span>{loading ? 'Saving to Database…' : 'Save Record'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
