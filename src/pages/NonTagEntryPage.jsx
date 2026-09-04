import React, { useState, useEffect } from 'react';
import { Package, Plus, RefreshCw, CheckCircle2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

export default function NonTagEntryPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('NON_TAG_ENTRY');

  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    CategoryId: 1,
    InwardQty: 10,
    Weight: 100.0,
    TransactionType: 'INWARD'
  });
  const [msg, setMsg] = useState('');

  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/stock/non-tag');
      setStock(res.data || []);
      if (isSilent) toast.success('Non-tagged balances refreshed');
    } catch (err) {
      toast.error(err.message || 'Failed to load non-tag stock');
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
      const res = await api('/stock/non-tag', { method: 'POST', body: JSON.stringify(formData) });
      setMsg(res.message || 'Stock mutation posted successfully!');
      toast.success(`${formData.TransactionType} of ${formData.Weight}g posted!`);
      load(true);
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
          <p className="eyebrow">Bulk Stock · NON_TAG_ENTRY</p>
          <h1>Non-Tagged Bulk Stock Entry</h1>
          <p className="subtle">
            Manage bulk non-barcoded inventory (silver coins, gold bullion bars, pooja articles) with inward/outward weight reconciliations.
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
        {/* Mutation Form Panel */}
        <section className="panel">
          <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} style={{ color: 'var(--gold-primary)' }} /> Post Stock Mutation
            </h2>
            <StatusBadge variant={formData.TransactionType === 'INWARD' ? 'success' : 'danger'}>
              {formData.TransactionType}
            </StatusBadge>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Transaction Movement</label>
              <select
                value={formData.TransactionType}
                onChange={e => setFormData({ ...formData, TransactionType: e.target.value })}
              >
                <option value="INWARD">📥 INWARD (Add to Inventory)</option>
                <option value="OUTWARD">📤 OUTWARD (Issue / Transfer Out)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category ID / Article Type</label>
              <select
                value={formData.CategoryId}
                onChange={e => setFormData({ ...formData, CategoryId: Number(e.target.value) })}
              >
                <option value={1}>Gold Bullion & Ornaments (Category #1)</option>
                <option value={2}>Silver Articles & Coins (Category #2)</option>
                <option value={3}>Diamond Loose / Certified (Category #3)</option>
              </select>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Pieces / Quantity</label>
                <input
                  type="number"
                  value={formData.InwardQty}
                  onChange={e => setFormData({ ...formData, InwardQty: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.Weight}
                  onChange={e => setFormData({ ...formData, Weight: Number(e.target.value) })}
                  required
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
              <Plus size={16} /> Post {formData.TransactionType} Movement
            </PermissionButton>
          </form>
        </section>

        {/* Non-Tagged Balances Table */}
        <section className="panel data-panel">
          <div className="table-toolbar">
            <div>
              <h3>Bulk Non-Tagged Stock Balances</h3>
              <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
                Live vault physical weight balances
              </p>
            </div>
            <button className="btn-icon" onClick={() => load(true)} title="Refresh stock" aria-label="Refresh stock">
              <RefreshCw size={16} />
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={4} columns={4} />
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th className="num-cell">Total Quantity</th>
                    <th className="weight-cell">Total Gross Wt</th>
                    <th className="weight-cell">Available Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.length ? (
                    stock.map((s, i) => (
                      <tr key={i}>
                        <td><strong>{s.CategoryName}</strong></td>
                        <td className="num-cell">{s.TotalQty} pcs</td>
                        <td className="weight-cell">{Number(s.TotalWeight).toFixed(2)} g</td>
                        <td className="weight-cell">
                          <StatusBadge variant="gold">{Number(s.AvailableWeight).toFixed(2)} g</StatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No non-tagged stock records found.
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
