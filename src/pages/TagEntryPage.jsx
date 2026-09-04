import React, { useState, useEffect } from 'react';
import { Tag, Plus, RefreshCw, CheckCircle2, ScanLine } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

export default function TagEntryPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('TAG_ENTRY');

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    TagNo: `TAG-${Math.floor(88000 + Math.random() * 1000)}`,
    LotNo: 'LOT-2026-001',
    GrossWt: 12.5,
    StoneWt: 0.5,
    NetWt: 12.0,
    Purity: '22K',
    RackName: 'RACK-A1'
  });
  const [msg, setMsg] = useState('');

  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/stock/tags');
      setTags(res.data || []);
      if (isSilent) toast.success('Tagged inventory refreshed');
    } catch (err) {
      toast.error(err.message || 'Failed to load tags');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api('/stock/tags', { method: 'POST', body: JSON.stringify(formData) });
      setMsg(res.message || 'Tag registered successfully!');
      toast.success(`Tag #${formData.TagNo} generated!`);
      load(true);
      setFormData(prev => ({
        ...prev,
        TagNo: `TAG-${Math.floor(88000 + Math.random() * 1000)}`
      }));
    } catch (err) {
      const errMsg = `Error: ${err.message}`;
      setMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Inventory Tagging · TAG_ENTRY</p>
          <h1>Tagged Inventory & Barcode Entry</h1>
          <p className="subtle">
            Generate unique piece tags from stock lots with purity, showroom rack location, and net metal weight allocations.
          </p>
        </div>
      </section>

      {msg && (
        <div className={`alert ${msg.startsWith('Error') ? 'error' : 'good'}`}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form Panel */}
        <section className="panel">
          <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={18} style={{ color: 'var(--gold-primary)' }} /> Generate Piece Tag
            </h2>
            <StatusBadge variant="gold">Barcode</StatusBadge>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Tag / Barcode Number</label>
              <input
                value={formData.TagNo}
                onChange={e => setFormData({ ...formData, TagNo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Source Lot Number</label>
              <input
                value={formData.LotNo}
                onChange={e => setFormData({ ...formData, LotNo: e.target.value })}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Gross Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.GrossWt}
                  onChange={e => {
                    const gross = Number(e.target.value);
                    setFormData({ ...formData, GrossWt: gross, NetWt: gross - formData.StoneWt });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stone Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.StoneWt}
                  onChange={e => {
                    const stone = Number(e.target.value);
                    setFormData({ ...formData, StoneWt: stone, NetWt: formData.GrossWt - stone });
                  }}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Calculated Net Wt (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.NetWt}
                  readOnly
                  style={{ backgroundColor: 'var(--bg-subtle)', fontWeight: 'bold' }}
                />
              </div>

              <div className="form-group">
                <label>Rack / Shelf Location</label>
                <input
                  value={formData.RackName}
                  onChange={e => setFormData({ ...formData, RackName: e.target.value })}
                />
              </div>
            </div>

            <PermissionButton
              type="submit"
              permission={permission.CanAdd}
              variant="primary"
              loading={saving}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Plus size={16} /> Generate & Save Barcode Tag
            </PermissionButton>
          </form>
        </section>

        {/* Active Tagged Inventory Table */}
        <section className="panel data-panel">
          <div className="table-toolbar">
            <div>
              <h3>Active Showroom Tagged Inventory</h3>
              <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
                Barcode items available for counter billing lookup
              </p>
            </div>
            <button className="btn-icon" onClick={() => load(true)} title="Refresh tags" aria-label="Refresh tags">
              <RefreshCw size={16} />
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={5} columns={6} />
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Tag Number</th>
                    <th>Source Lot</th>
                    <th className="weight-cell">Gross Wt</th>
                    <th className="weight-cell">Net Wt</th>
                    <th>Rack Shelf</th>
                    <th className="status-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.length ? (
                    tags.map((t, i) => (
                      <tr key={i}>
                        <td><code>{t.TagNo}</code></td>
                        <td>{t.LotNo}</td>
                        <td className="weight-cell">{Number(t.GrossWt).toFixed(2)} g</td>
                        <td className="weight-cell"><strong>{Number(t.NetWt).toFixed(2)} g</strong></td>
                        <td>{t.RackName || 'Counter A'}</td>
                        <td className="status-cell">
                          <StatusBadge status={t.Status || 'AVAILABLE'} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No tagged items on file. Generate a new tag using the form on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
