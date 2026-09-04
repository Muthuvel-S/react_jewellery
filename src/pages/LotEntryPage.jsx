import React, { useState, useEffect } from 'react';
import { Layers, Plus, RefreshCw, CheckCircle2, Boxes } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

export default function LotEntryPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('LOT_ENTRIES');

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    LotNo: `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    ProductId: 1,
    TotalPieces: 10,
    TotalGrossWt: 100.0,
    TotalStoneWt: 2.0,
    TotalNetWt: 98.0,
    WastagePercent: 4.5,
    MakingCharge: 350.0
  });
  const [msg, setMsg] = useState('');

  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/stock/lots');
      setLots(res.data || []);
      if (isSilent) toast.success('Stock lots refreshed');
    } catch (err) {
      toast.error(err.message || 'Failed to load stock lots');
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
      const res = await api('/stock/lots', { method: 'POST', body: JSON.stringify(formData) });
      setMsg(res.message || 'Stock lot saved successfully!');
      toast.success(`Lot #${formData.LotNo} created successfully!`);
      load(true);
      setFormData(prev => ({
        ...prev,
        LotNo: `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
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
          <p className="eyebrow">Stock Inward · LOT_ENTRIES</p>
          <h1>Bulk Stock Lot Entry</h1>
          <p className="subtle">
            Register wholesale jewellery stock lots and compute piece counts, gross weight, and stone weight allocations.
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
        {/* Register New Lot Panel */}
        <section className="panel">
          <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: 'var(--gold-primary)' }} /> Register New Lot
            </h2>
            <StatusBadge variant="gold">Wholesale Inward</StatusBadge>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Lot Number / Batch Code</label>
              <input
                value={formData.LotNo}
                onChange={e => setFormData({ ...formData, LotNo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Total Pieces / Items Count</label>
              <input
                type="number"
                value={formData.TotalPieces}
                onChange={e => setFormData({ ...formData, TotalPieces: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Total Gross Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.TotalGrossWt}
                  onChange={e => {
                    const gross = Number(e.target.value);
                    setFormData({ ...formData, TotalGrossWt: gross, TotalNetWt: gross - formData.TotalStoneWt });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Stone Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.TotalStoneWt}
                  onChange={e => {
                    const stone = Number(e.target.value);
                    setFormData({ ...formData, TotalStoneWt: stone, TotalNetWt: formData.TotalGrossWt - stone });
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Computed Total Net Weight (g)</label>
              <input
                type="number"
                step="0.001"
                value={formData.TotalNetWt}
                readOnly
                style={{ backgroundColor: 'var(--bg-subtle)', fontWeight: 'bold', color: 'var(--gold-dark)' }}
              />
            </div>

            <PermissionButton
              type="submit"
              permission={permission.CanAdd}
              variant="primary"
              loading={saving}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Plus size={16} /> Save Wholesale Lot
            </PermissionButton>
          </form>
        </section>

        {/* Registered Lots Table Panel */}
        <section className="panel data-panel">
          <div className="table-toolbar">
            <div>
              <h3>Registered Stock Lots</h3>
              <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
                Batch allocations ready for individual barcode tagging
              </p>
            </div>
            <button className="btn-icon" onClick={() => load(true)} title="Refresh stock lots" aria-label="Refresh stock lots">
              <RefreshCw size={16} />
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Lot Number</th>
                    <th className="num-cell">Total Pieces</th>
                    <th className="weight-cell">Gross Wt</th>
                    <th className="weight-cell">Net Wt</th>
                    <th className="status-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.length ? (
                    lots.map((l, i) => (
                      <tr key={i}>
                        <td><strong>{l.LotNo}</strong></td>
                        <td className="num-cell">{l.TotalPieces} pcs</td>
                        <td className="weight-cell">{Number(l.TotalGrossWt).toFixed(2)} g</td>
                        <td className="weight-cell"><strong>{Number(l.TotalNetWt).toFixed(2)} g</strong></td>
                        <td className="status-cell">
                          <StatusBadge status={l.Status || 'ACTIVE'} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No stock lots registered. Add one using the form on the left.
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
