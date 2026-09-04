import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

export default function VoucherEntryPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('PAYMENT_VOUCHER');

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    VoucherType: 'PAYMENT',
    VoucherDate: new Date().toISOString().split('T')[0],
    DebitAccount: 'Office Expenses',
    CreditAccount: 'Cash In Hand',
    Amount: 1500.0,
    Narration: 'Office Stationeries & Maintenance'
  });
  const [msg, setMsg] = useState('');

  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/accounts/vouchers');
      setVouchers(res.data || []);
      if (isSilent) toast.success('Vouchers refreshed');
    } catch (err) {
      toast.error(err.message || 'Failed to load vouchers');
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
      const res = await api('/accounts/vouchers', { method: 'POST', body: JSON.stringify(formData) });
      setMsg(res.message || 'Voucher posted successfully!');
      toast.success(`${formData.VoucherType} voucher for ₹${Number(formData.Amount).toLocaleString('en-IN')} posted!`);
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
          <p className="eyebrow">Financial Accounts · VOUCHER_ENTRY</p>
          <h1>Financial Voucher Entry</h1>
          <p className="subtle">
            Record Payment, Receipt, Journal, and Contra vouchers with automatic double-entry balanced ledger postings.
          </p>
        </div>
      </section>

      {msg && (
        <div className={`alert ${msg.startsWith('Error') ? 'error' : 'good'}`}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(0, 1.9fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Post Voucher Form Panel */}
        <section className="panel">
          <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} style={{ color: 'var(--gold-primary)' }} /> Post Financial Voucher
            </h2>
            <StatusBadge variant="gold">{formData.VoucherType}</StatusBadge>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Voucher Type</label>
              <select
                value={formData.VoucherType}
                onChange={e => setFormData({ ...formData, VoucherType: e.target.value })}
              >
                <option value="PAYMENT">📤 PAYMENT VOUCHER (Cash / Bank Out)</option>
                <option value="RECEIPT">📥 RECEIPT VOUCHER (Cash / Bank In)</option>
                <option value="JOURNAL">📋 JOURNAL VOUCHER (General Ledger)</option>
                <option value="CONTRA">🔄 CONTRA VOUCHER (Bank ↔ Cash Transfer)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Voucher Date</label>
              <input
                type="date"
                value={formData.VoucherDate}
                onChange={e => setFormData({ ...formData, VoucherDate: e.target.value })}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Debit Account (Dr)</label>
                <input
                  value={formData.DebitAccount}
                  onChange={e => setFormData({ ...formData, DebitAccount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Credit Account (Cr)</label>
                <input
                  value={formData.CreditAccount}
                  onChange={e => setFormData({ ...formData, CreditAccount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.Amount}
                onChange={e => setFormData({ ...formData, Amount: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label>Narration / Description</label>
              <input
                value={formData.Narration}
                onChange={e => setFormData({ ...formData, Narration: e.target.value })}
              />
            </div>

            <PermissionButton
              type="submit"
              permission={permission.CanAdd}
              variant="primary"
              loading={saving}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Plus size={16} /> Post & Save Voucher
            </PermissionButton>
          </form>
        </section>

        {/* Recent Posted Vouchers Table */}
        <section className="panel data-panel">
          <div className="table-toolbar">
            <div>
              <h3>Recent Posted Vouchers</h3>
              <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
                Double-entry transaction history
              </p>
            </div>
            <button className="btn-icon" onClick={() => load(true)} title="Refresh vouchers" aria-label="Refresh vouchers">
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
                    <th>Voucher No</th>
                    <th className="status-cell">Type</th>
                    <th>Date</th>
                    <th>Account</th>
                    <th className="currency-cell">Amount (₹)</th>
                    <th>Narration</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.length ? (
                    vouchers.map((v, i) => (
                      <tr key={i}>
                        <td><code>{v.VoucherNo}</code></td>
                        <td className="status-cell">
                          <StatusBadge status={v.VoucherType} />
                        </td>
                        <td>{v.VoucherDate}</td>
                        <td><strong>{v.AccountName || v.DebitAccount}</strong></td>
                        <td className="currency-cell"><strong>₹{Number(v.Amount).toLocaleString('en-IN')}</strong></td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.Narration}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No vouchers posted yet.
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
