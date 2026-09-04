import React, { useState, useEffect } from 'react';
import { Hammer, Plus, RefreshCw, CheckCircle2, Scale, Users, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

export default function GoldsmithPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('GOLD_SMITH');

  const [smiths, setSmiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('ISSUE');

  const [issueData, setIssueData] = useState({
    SmithName: 'Murugan Karigar',
    PureGoldWeight: 10.0,
    Purity: '24K (999)',
    IssueDate: new Date().toISOString().split('T')[0],
    Remarks: 'Fine gold bar for 22K Bangle crafting'
  });

  const [receiveData, setReceiveData] = useState({
    SmithName: 'Murugan Karigar',
    ItemName: '22K Designer Bangle',
    GrossWt: 10.5,
    NetWt: 10.0,
    WastagePercent: 4.0,
    MakingCharge: 350.0
  });

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/transactions/goldsmiths');
      setSmiths(res.data || []);
      if (isSilent) toast.success('Karigar ledgers refreshed');
    } catch (err) {
      toast.error(err.message || 'Failed to load Karigar data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueGold = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api('/transactions/goldsmiths/issue', {
        method: 'POST',
        body: JSON.stringify(issueData)
      });
      setMsg(res.message || 'Fine gold issued to Karigar successfully!');
      toast.success(`Issued ${issueData.PureGoldWeight}g 24K gold to ${issueData.SmithName}`);
      loadData(true);
    } catch (err) {
      const errMsg = `Error: ${err.message}`;
      setMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleReceiveWork = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api('/transactions/goldsmiths/receive', {
        method: 'POST',
        body: JSON.stringify(receiveData)
      });
      setMsg(res.message || 'Finished ornament received and ledger adjusted!');
      toast.success(`Received ${receiveData.ItemName} from ${receiveData.SmithName}`);
      loadData(true);
    } catch (err) {
      const errMsg = `Error: ${err.message}`;
      setMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const totalSmithBalance = smiths.reduce((acc, curr) => acc + Number(curr.PureGoldBalance || 0), 0);

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Manufacturing & Workshop · GOLD_SMITH</p>
          <h1>Goldsmith / Karigar Workshop Management</h1>
          <p className="subtle">
            Issue 24K pure gold to craftsmen, receive finished ornaments with wastage & making charge accounting, and track live workshop fine gold ledgers.
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-surface) 100%)', border: '1px solid var(--border-gold)' }}>
          <div className="metric-icon">
            <Scale size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: 'var(--gold-dark)' }}>Total Karigar Fine Gold Balance</span>
            <span className="metric-value">{totalSmithBalance.toFixed(3)} g</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pure 24K metal outstanding with workshops</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Users size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Registered Karigars</span>
            <span className="metric-value">{smiths.length} Craftsmen</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>In-house & external jewellery artisans</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(0, 1.85fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Workshop Action Tabs & Form */}
        <section className="panel">
          {/* Dual Action Switcher Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setActiveTab('ISSUE')}
              className={activeTab === 'ISSUE' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ flex: 1 }}
            >
              Issue Fine Gold (24K)
            </button>
            <button
              onClick={() => setActiveTab('RECEIVE')}
              className={activeTab === 'RECEIVE' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ flex: 1 }}
            >
              Receive Ornaments
            </button>
          </div>

          {activeTab === 'ISSUE' ? (
            <form onSubmit={handleIssueGold}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hammer size={17} style={{ color: 'var(--gold-primary)' }} /> Issue Raw Gold to Karigar
              </h3>

              <div className="form-group">
                <label>Goldsmith / Karigar Name</label>
                <input
                  value={issueData.SmithName}
                  onChange={e => setIssueData({ ...issueData, SmithName: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Pure Gold Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={issueData.PureGoldWeight}
                    onChange={e => setIssueData({ ...issueData, PureGoldWeight: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Purity Standard</label>
                  <input
                    value={issueData.Purity}
                    onChange={e => setIssueData({ ...issueData, Purity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={issueData.IssueDate}
                  onChange={e => setIssueData({ ...issueData, IssueDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Remarks / Work Order Notes</label>
                <input
                  value={issueData.Remarks}
                  onChange={e => setIssueData({ ...issueData, Remarks: e.target.value })}
                />
              </div>

              <PermissionButton
                type="submit"
                permission={permission.CanAdd}
                variant="primary"
                loading={saving}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Plus size={16} /> Post Gold Issue Voucher
              </PermissionButton>
            </form>
          ) : (
            <form onSubmit={handleReceiveWork}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={17} style={{ color: 'var(--gold-primary)' }} /> Receive Crafted Ornaments
              </h3>

              <div className="form-group">
                <label>Goldsmith Name</label>
                <input
                  value={receiveData.SmithName}
                  onChange={e => setReceiveData({ ...receiveData, SmithName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ornament Description</label>
                <input
                  value={receiveData.ItemName}
                  onChange={e => setReceiveData({ ...receiveData, ItemName: e.target.value })}
                  required
                  placeholder="e.g. 22K Antique Lakshmi Bangle"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Gross Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={receiveData.GrossWt}
                    onChange={e => setReceiveData({ ...receiveData, GrossWt: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Net Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={receiveData.NetWt}
                    onChange={e => setReceiveData({ ...receiveData, NetWt: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Wastage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={receiveData.WastagePercent}
                    onChange={e => setReceiveData({ ...receiveData, WastagePercent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Making Charge (₹)</label>
                  <input
                    type="number"
                    value={receiveData.MakingCharge}
                    onChange={e => setReceiveData({ ...receiveData, MakingCharge: Number(e.target.value) })}
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
                <Plus size={16} /> Receive & Adjust Karigar Balance
              </PermissionButton>
            </form>
          )}
        </section>

        {/* Goldsmith Ledger Table */}
        <section className="panel data-panel">
          <div className="table-toolbar">
            <div>
              <h3>Karigar Fine Gold & Cash Ledgers</h3>
              <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
                Pure gold weight pending return and making charges payable
              </p>
            </div>
            <button className="btn-icon" onClick={() => loadData(true)} title="Refresh Karigars" aria-label="Refresh Karigars">
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
                    <th>Karigar Name</th>
                    <th>Workshop Location</th>
                    <th>Phone</th>
                    <th className="weight-cell">Fine Gold Balance</th>
                    <th className="currency-cell">Payable (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {smiths.length ? (
                    smiths.map((smith, i) => (
                      <tr key={i}>
                        <td><strong>{smith.SmithName}</strong></td>
                        <td>{smith.City || 'Showroom Workshop'}</td>
                        <td>{smith.Phone}</td>
                        <td className="weight-cell">
                          <StatusBadge variant="gold">
                            {Number(smith.PureGoldBalance).toFixed(3)} g
                          </StatusBadge>
                        </td>
                        <td className="currency-cell">
                          <strong>₹{Number(smith.CashBalance).toLocaleString('en-IN')}</strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No Karigars found.
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
