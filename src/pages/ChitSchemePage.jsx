import React, { useState, useEffect } from 'react';
import { Coins, Plus, RefreshCw, CheckCircle2, Sparkles, Scale, IndianRupee } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable, SkeletonCard } from '../components/common/Skeleton';

export default function ChitSchemePage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('CUSTOMER_CHIT_ENTRY');

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    CustomerName: 'K. Saravanan',
    SchemeName: 'Swarna 11-Month Gold Scheme',
    Amount: 2000,
    GoldRate: 6850,
    PaymentDate: new Date().toISOString().split('T')[0]
  });
  const [msg, setMsg] = useState('');

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/transactions/chit');
      setEntries(res.data || []);
      if (isSilent) toast.success('Chit ledger refreshed');
    } catch (err) {
      toast.error(err.message || 'Failed to load chit ledger');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculatedGrams = formData.Amount && formData.GoldRate
    ? (Number(formData.Amount) / Number(formData.GoldRate)).toFixed(3)
    : '0.000';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api('/transactions/chit', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setMsg(res.message || 'Chit installment recorded successfully!');
      toast.success(`Chit installment of ₹${Number(formData.Amount).toLocaleString('en-IN')} saved!`);
      loadData(true);
    } catch (err) {
      const errMsg = `Error: ${err.message}`;
      setMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const totalCash = entries.reduce((acc, curr) => acc + Number(curr.Amount || 0), 0);
  const totalGrams = entries.reduce((acc, curr) => acc + Number(curr.GramsAccumulated || 0), 0);

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Savings Schemes · Nagai Seettu</p>
          <h1>Nagai Seettu / Gold Savings Scheme</h1>
          <p className="subtle">
            Record customer monthly installments with automatic daily gold gram accumulation (`Amount ÷ Today's Rate = Gold Grams Credited`).
          </p>
        </div>
      </section>

      {msg && (
        <div className={`alert ${msg.startsWith('Error') ? 'error' : 'good'}`}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-surface) 100%)', border: '1px solid var(--border-gold)' }}>
          <div className="metric-icon">
            <Coins size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: 'var(--gold-dark)' }}>Total Accumulated Gold</span>
            <span className="metric-value">{totalGrams.toFixed(3)} g</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Credited across customer schemes</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <IndianRupee size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Cash Collected</span>
            <span className="metric-value">₹{totalCash.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From {entries.length} scheme installments</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Scale size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Today's 22K Benchmark Rate</span>
            <span className="metric-value">₹{formData.GoldRate} / g</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active conversion valuation rate</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Form & Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(0, 1.9fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Payment Entry Form */}
        <section className="panel">
          <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={18} style={{ color: 'var(--gold-primary)' }} /> Installment Collection
            </h2>
            <StatusBadge variant="gold">Active Scheme</StatusBadge>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Customer Name</label>
              <input
                value={formData.CustomerName}
                onChange={e => setFormData({ ...formData, CustomerName: e.target.value })}
                required
                placeholder="e.g. K. Saravanan"
              />
            </div>

            <div className="form-group">
              <label>Scheme Plan Title</label>
              <input
                value={formData.SchemeName}
                onChange={e => setFormData({ ...formData, SchemeName: e.target.value })}
                placeholder="e.g. Swarna 11-Month Gold Scheme"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Payment Amount (₹)</label>
                <input
                  type="number"
                  value={formData.Amount}
                  onChange={e => setFormData({ ...formData, Amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gold Rate (₹ / g)</label>
                <input
                  type="number"
                  value={formData.GoldRate}
                  onChange={e => setFormData({ ...formData, GoldRate: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* Live Converted Gold Grams Display */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--gold-light)',
                border: '1px solid var(--border-gold)',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-dark)', letterSpacing: '0.06em' }}>
                  Credited Pure Weight
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {calculatedGrams} Grams
                </div>
              </div>
              <Sparkles size={20} style={{ color: 'var(--gold-primary)' }} />
            </div>

            <div className="form-group">
              <label>Payment Date</label>
              <input
                type="date"
                value={formData.PaymentDate}
                onChange={e => setFormData({ ...formData, PaymentDate: e.target.value })}
                required
              />
            </div>

            <PermissionButton
              type="submit"
              permission={permission.CanAdd}
              variant="primary"
              loading={saving}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Plus size={16} /> Save Chit Installment
            </PermissionButton>
          </form>
        </section>

        {/* Customer Chit Passbook Ledger */}
        <section className="panel data-panel">
          <div className="table-toolbar">
            <div>
              <h3>Customer Chit Passbook Ledger</h3>
              <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
                All installment transactions and weight balance credits
              </p>
            </div>
            <button className="btn-icon" onClick={() => loadData(true)} title="Refresh ledger" aria-label="Refresh ledger">
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
                    <th>Chit ID</th>
                    <th>Customer & Scheme</th>
                    <th>Date</th>
                    <th className="currency-cell">Amount (₹)</th>
                    <th className="currency-cell">Rate (₹/g)</th>
                    <th className="weight-cell">Grams Credited</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length ? (
                    entries.map((entry, i) => (
                      <tr key={i}>
                        <td><code>{entry.ChitNo}</code></td>
                        <td>
                          <strong>{entry.CustomerName}</strong>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {entry.SchemeName}
                          </div>
                        </td>
                        <td>{entry.PaymentDate}</td>
                        <td className="currency-cell"><strong>₹{Number(entry.Amount).toLocaleString('en-IN')}</strong></td>
                        <td className="currency-cell">₹{entry.GoldRate} /g</td>
                        <td className="weight-cell">
                          <StatusBadge variant="gold">{entry.GramsAccumulated} g</StatusBadge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No chit entries found. Record a new installment on the left.
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
