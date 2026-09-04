import React, { useState, useEffect } from 'react';
import { Landmark, Plus, RefreshCw, CheckCircle2, DollarSign, X, Sparkles, Scale, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

export default function GoldLoanPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('JEWELL_LOAN');

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [settleLoanNo, setSettleLoanNo] = useState(null);
  const [discountInterest, setDiscountInterest] = useState(0);

  const [formData, setFormData] = useState({
    CustomerName: 'R. Ananth',
    Phone: '9840123456',
    PledgedItems: '22K Gold Bangle (2 Pcs)',
    GrossWt: 24.5,
    NetWt: 23.0,
    AppraisedValue: 157000,
    LoanAmount: 110000,
    InterestRatePerMonth: 1.5,
    StartDate: new Date().toISOString().split('T')[0]
  });

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/transactions/loans');
      setLoans(res.data || []);
      if (isSilent) toast.success('Gold loan portfolio refreshed');
    } catch (err) {
      toast.error(err.message || 'Failed to load loans');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveLoan = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api('/transactions/loans', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setMsg(res.message || 'Gold loan disbursed successfully!');
      toast.success(`Gold loan disbursed for ₹${Number(formData.LoanAmount).toLocaleString('en-IN')}`);
      loadData(true);
    } catch (err) {
      const errMsg = `Error: ${err.message}`;
      setMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSettle = async () => {
    if (!settleLoanNo) return;
    try {
      const res = await api('/transactions/loans/settle', {
        method: 'POST',
        body: JSON.stringify({ LoanNo: settleLoanNo, DiscountInterest: Number(discountInterest) })
      });
      toast.success(res.message || `Loan #${settleLoanNo} settled and closed`);
      setSettleLoanNo(null);
      setDiscountInterest(0);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Settlement failed');
    }
  };

  const activeLoans = loans.filter(l => l.Status === 'ACTIVE');
  const totalLoanDisbursed = activeLoans.reduce((acc, curr) => acc + Number(curr.LoanAmount || 0), 0);
  const totalPledgedWeight = activeLoans.reduce((acc, curr) => acc + Number(curr.GrossWt || 0), 0);

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Finance & Lending · JEWELL_LOAN</p>
          <h1>Gold Loan / Finance Management</h1>
          <p className="subtle">
            Pledge customer gold ornaments, disburse principal advances, and manage monthly interest settlement & gold release.
          </p>
        </div>
      </section>

      {msg && (
        <div className={`alert ${msg.startsWith('Error') ? 'error' : 'good'}`}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      {/* Summary KPI Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Landmark size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Loan Portfolio</span>
            <span className="metric-value">₹{totalLoanDisbursed.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Across {activeLoans.length} active customer pledges</span>
          </div>
        </div>

        <div className="metric-card" style={{ background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-surface) 100%)', border: '1px solid var(--border-gold)' }}>
          <div className="metric-icon">
            <Scale size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: 'var(--gold-dark)' }}>Pledged Vault Gold</span>
            <span className="metric-value">{totalPledgedWeight.toFixed(2)} g</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Secured in showroom locker vault</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Standard Interest Rate</span>
            <span className="metric-value">1.5% / mo</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Simple monthly interest computation</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(0, 1.9fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* New Gold Loan Entry Form */}
        <section className="panel">
          <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} style={{ color: 'var(--gold-primary)' }} /> Issue New Gold Loan
            </h2>
            <StatusBadge variant="gold">Pledge</StatusBadge>
          </div>

          <form onSubmit={handleSaveLoan}>
            <div className="form-group">
              <label>Customer Name</label>
              <input
                value={formData.CustomerName}
                onChange={e => setFormData({ ...formData, CustomerName: e.target.value })}
                required
                placeholder="e.g. R. Ananth"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                value={formData.Phone}
                onChange={e => setFormData({ ...formData, Phone: e.target.value })}
                placeholder="e.g. 9840123456"
              />
            </div>

            <div className="form-group">
              <label>Pledged Ornaments Description</label>
              <input
                value={formData.PledgedItems}
                onChange={e => setFormData({ ...formData, PledgedItems: e.target.value })}
                required
                placeholder="e.g. 22K Gold Bangle (2 Pcs)"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Gross Weight (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.GrossWt}
                  onChange={e => setFormData({ ...formData, GrossWt: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Net Weight (g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.NetWt}
                  onChange={e => setFormData({ ...formData, NetWt: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Loan Principal (₹)</label>
                <input
                  type="number"
                  value={formData.LoanAmount}
                  onChange={e => setFormData({ ...formData, LoanAmount: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Interest Rate (% / mo)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.InterestRatePerMonth}
                  onChange={e => setFormData({ ...formData, InterestRatePerMonth: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Disbursement Date</label>
              <input
                type="date"
                value={formData.StartDate}
                onChange={e => setFormData({ ...formData, StartDate: e.target.value })}
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
              <Plus size={16} /> Disburse Loan & Print Receipt
            </PermissionButton>
          </form>
        </section>

        {/* Active Loans Register */}
        <section className="panel data-panel">
          <div className="table-toolbar">
            <div>
              <h3>Active Gold Loans Register</h3>
              <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
                Customer loan balances, pledged ornaments, and settlement status
              </p>
            </div>
            <button className="btn-icon" onClick={() => loadData(true)} title="Refresh loans" aria-label="Refresh loans">
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
                    <th>Loan No</th>
                    <th>Customer & Phone</th>
                    <th>Pledged Item</th>
                    <th className="weight-cell">Gross Wt</th>
                    <th className="currency-cell">Principal (₹)</th>
                    <th className="status-cell">Status</th>
                    <th className="action-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.length ? (
                    loans.map((loan, i) => (
                      <tr key={i}>
                        <td><code>{loan.LoanNo}</code></td>
                        <td>
                          <strong>{loan.CustomerName}</strong>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {loan.Phone}
                          </div>
                        </td>
                        <td>{loan.PledgedItems}</td>
                        <td className="weight-cell">{Number(loan.GrossWt).toFixed(2)} g</td>
                        <td className="currency-cell">
                          <strong>₹{Number(loan.LoanAmount).toLocaleString('en-IN')}</strong>
                        </td>
                        <td className="status-cell">
                          <StatusBadge status={loan.Status} />
                        </td>
                        <td className="action-cell">
                          {loan.Status === 'ACTIVE' ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setSettleLoanNo(loan.LoanNo)}
                            >
                              Settle & Close
                            </button>
                          ) : (
                            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.82rem' }}>
                              ✓ Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No loans on file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Loan Settlement & Gold Release Modal */}
      {settleLoanNo && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <header className="modal-header">
              <h3>Settle & Close Loan #{settleLoanNo}</h3>
              <button className="btn-icon" onClick={() => setSettleLoanNo(null)} aria-label="Close modal">
                <X size={18} />
              </button>
            </header>

            <div className="modal-body">
              <p className="subtle">
                Reconcile accrued interest, collect outstanding principal balance, and release pledged gold ornaments back to customer.
              </p>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Interest Discount / Waiver (₹)</label>
                <input
                  type="number"
                  value={discountInterest}
                  onChange={e => setDiscountInterest(e.target.value)}
                  placeholder="Enter discount amount if any..."
                />
              </div>
            </div>

            <footer className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSettleLoanNo(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSettle}>
                Confirm Settlement & Release Gold
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
