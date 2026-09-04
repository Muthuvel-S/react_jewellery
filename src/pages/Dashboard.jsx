import React, { useEffect, useState } from 'react';
import {
  Boxes, Gem, PackageCheck, ShoppingBag, UsersRound,
  TrendingUp, TrendingDown, RefreshCw, Plus, Coins, BarChart3, X,
  ArrowUpRight, Sparkles, Scale, ShieldCheck
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/common/Skeleton';
import hero from '../assets/jewellery-hero.png';

const metrics = [
  ['products', 'Jewellery Catalog', Gem, 'Items in Master'],
  ['lots', 'Stock Lots', Boxes, 'Wholesale Batches'],
  ['tags', 'Active Barcode Tags', PackageCheck, 'Ready for Counter Sale'],
  ['orders', 'Sales Orders', ShoppingBag, 'Invoices Generated'],
  ['customers', 'Customer Accounts', UsersRound, 'Registered Ledger Profiles']
];

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({ metalRates: [], trendChart: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('GOLD');
  const [showRateModal, setShowRateModal] = useState(false);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const res = await api('/dashboard/summary');
      setData(res.data || {});
      if (isSilent) toast.success('Showroom data refreshed');
    } catch (err) {
      setError(err.message || 'Dashboard data could not be retrieved');
      toast.error('Failed to load live dashboard data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metalRates = data.metalRates || [];
  const trendChart = data.trendChart || [];
  const counts = data.counts || data;

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="workspace">
      {/* Welcome Banner */}
      <section className="welcome-banner" style={{ '--hero': `url(${hero})` }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p className="eyebrow light" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} /> Today's Showroom Overview · {todayFormatted}
          </p>
          <h1>Welcome, {user?.UserName}</h1>
          <p>
            Real-time Gold & Silver board rates, stock valuations, and showroom ledger postings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 2 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowRateModal(true)}
          >
            <Plus size={16} /> Quick Rate Entry
          </button>
          <button
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            onClick={() => loadData(true)}
            title="Refresh dashboard metrics"
            aria-label="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </section>

      {/* Daily Metal Rate Highlight Cards */}
      <section className="panel" style={{ padding: '1.4rem 1.6rem' }}>
        <div className="panel-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins style={{ color: 'var(--gold-primary)' }} size={20} /> Live Daily Gold & Silver Rates
            </h2>
            <p className="subtle" style={{ margin: 0, fontSize: '0.82rem' }}>
              Official counter selling and buyback rates per gram with daily market price change indicators
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowRateModal(true)}>
            <Plus size={14} /> Update Rate
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <SkeletonCard height="130px" />
            <SkeletonCard height="130px" />
            <SkeletonCard height="130px" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.15rem' }}>
            {metalRates.map((rate, i) => {
              const isGold = String(rate.MetalType).toUpperCase().includes('GOLD');
              const isUp = rate.isUp !== false && rate.changeAmount >= 0;

              return (
                <div
                  key={i}
                  style={{
                    background: isGold
                      ? 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-surface) 100%)'
                      : 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
                    border: isGold ? '1px solid var(--border-gold)' : '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 1.35rem',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isGold ? 'var(--gold-dark)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {rate.MetalType} · {rate.Purity}
                      </span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                        ₹{Number(rate.BoardRate).toLocaleString('en-IN')}
                        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>/ gram</span>
                      </h3>
                    </div>

                    {/* Price Increment / Decrement Badge */}
                    <span
                      className={`status-badge ${isUp ? 'badge-success' : 'badge-danger'}`}
                      style={{ padding: '3px 8px' }}
                    >
                      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{isUp ? '+' : ''}₹{rate.changeAmount || 0} ({isUp ? '+' : ''}{rate.changePercent || 0}%)</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Old Metal Buy Rate:</span>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                      ₹{Number(rate.BuyRate || rate.BoardRate * 0.96).toLocaleString('en-IN')} /g
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Rate Trend Graph (SVG Chart) */}
      <section className="panel" style={{ padding: '1.5rem 1.65rem' }}>
        <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={19} style={{ color: 'var(--gold-primary)' }} /> Rate Movement Trend
            </h2>
            <p className="subtle" style={{ margin: 0, fontSize: '0.82rem' }}>
              Historical price fluctuation across recent market sessions
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setActiveTab('GOLD')}
              className={activeTab === 'GOLD' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ padding: '4px 12px' }}
            >
              Gold 22K (916)
            </button>
            <button
              onClick={() => setActiveTab('SILVER')}
              className={activeTab === 'SILVER' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              style={{ padding: '4px 12px' }}
            >
              Silver 99.9
            </button>
          </div>
        </div>

        <RateTrendGraph data={trendChart} activeMetal={activeTab} />
      </section>

      {/* Core ERP Metrics */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.85rem' }}>Inventory & Operational Status</h2>
        {loading ? (
          <div className="metric-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="metric-grid">
            {metrics.map(([key, label, Icon, subtext]) => (
              <article className="metric-card" key={key}>
                <div className="metric-icon">
                  <Icon size={22} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">{label}</span>
                  <span className="metric-value">
                    {counts[key] == null ? '—' : counts[key].toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {subtext}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {error && <div className="alert warning">Dashboard notice: {error}</div>}

      {/* Quick Daily Metal Rate Modal */}
      {showRateModal && (
        <QuickRateModal
          onClose={() => setShowRateModal(false)}
          onSaved={() => {
            loadData();
            toast.success('Metal rates updated successfully in database!');
          }}
        />
      )}
    </div>
  );
}

// SVG Rate Trend Graph Component with Luxury Styling
function RateTrendGraph({ data, activeMetal }) {
  if (!data || !data.length) {
    return (
      <div style={{ height: '190px', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        Loading rate trend charts...
      </div>
    );
  }

  const key = activeMetal.toLowerCase();
  const values = data.map(d => d[key]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = (maxVal - minVal) || 1;

  const width = 640;
  const height = 190;
  const paddingX = 40;
  const paddingY = 28;

  const points = data.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (data.length - 1);
    const y = height - paddingY - ((d[key] - minVal) * (height - 2 * paddingY)) / range;
    return { x, y, day: d.day, val: d[key] };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const isGold = activeMetal === 'GOLD';
  const strokeColor = isGold ? '#D4AF37' : '#94A3B8';

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '210px' }}>
        <defs>
          <linearGradient id="chartGradGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="chartGradSilver" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Horizontal Guide Lines */}
        {[0.25, 0.5, 0.75].map((factor, i) => {
          const y = height - paddingY - factor * (height - 2 * paddingY);
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--border-subtle)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Gradient Fill Area */}
        <path d={fillD} fill={isGold ? 'url(#chartGradGold)' : 'url(#chartGradSilver)'} />

        {/* Polyline Path */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points with tooltips */}
        {points.map((p, i) => (
          <g key={i} className="chart-point">
            <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-surface)" stroke={strokeColor} strokeWidth="2.5" />
            <text x={p.x} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-sans)">
              {p.day}
            </text>
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text-primary)" fontFamily="var(--font-sans)">
              ₹{p.val}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// Quick Daily Rate Update Modal Component
function QuickRateModal({ onClose, onSaved }) {
  const [formData, setFormData] = useState({
    MetalType: 'GOLD',
    Purity: '22K (916)',
    BoardRate: 6850,
    BuyRate: 6650,
    EffectiveDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await api('/masters/metal-rates', { method: 'POST', body: JSON.stringify(formData) });
      onSaved();
      onClose();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <header className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coins style={{ color: 'var(--gold-primary)' }} size={20} /> Update Today's Metal Rate
          </h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {msg && <div className="alert error">{msg}</div>}

            <div className="form-group">
              <label>Metal Type</label>
              <select
                value={formData.MetalType}
                onChange={e => {
                  const type = e.target.value;
                  setFormData({
                    ...formData,
                    MetalType: type,
                    Purity: type === 'GOLD' ? '22K (916)' : type === 'SILVER' ? '99.9 Pure' : 'Pt 950',
                    BoardRate: type === 'GOLD' ? 6850 : type === 'SILVER' ? 102 : 3800
                  });
                }}
              >
                <option value="GOLD">GOLD (🥇)</option>
                <option value="SILVER">SILVER (🥈)</option>
                <option value="PLATINUM">PLATINUM (💎)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Purity Standard</label>
              <input
                value={formData.Purity}
                onChange={e => setFormData({ ...formData, Purity: e.target.value })}
                required
                placeholder="e.g. 22K (916), 24K (999), 92.5 Fine"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Board Selling Rate (₹ / g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.BoardRate}
                  onChange={e => {
                    const br = Number(e.target.value);
                    setFormData({ ...formData, BoardRate: br, BuyRate: Math.round(br * 0.96) });
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Old Metal Buy Rate (₹ / g)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.BuyRate}
                  onChange={e => setFormData({ ...formData, BuyRate: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Effective Date</label>
              <input
                type="date"
                value={formData.EffectiveDate}
                onChange={e => setFormData({ ...formData, EffectiveDate: e.target.value })}
                required
              />
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Rate...' : 'Publish Board Rate'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
