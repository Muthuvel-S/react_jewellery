import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, Printer, Download, Sparkles, Gem } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

export default function StockReportPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('STOCK_REPORT');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api('/reports/stock');
      setData(res.data || []);
      if (isSilent) toast.success('Stock report updated');
    } catch (err) {
      toast.error(err.message || 'Failed to generate stock report');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalPieces = data.reduce((acc, curr) => acc + Number(curr.TotalPieces || 0), 0);

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Analytics & Valuation · STOCK_REPORT</p>
          <h1>Jewellery Stock Valuation Report</h1>
          <p className="subtle">
            Aggregated showroom inventory metrics, product category distributions, making charge averages, and wastage allowances.
          </p>
        </div>
        <div className="title-actions">
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
            disabled={!permission.CanPrint}
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </section>

      {/* Summary KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="metric-card" style={{ background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-surface) 100%)', border: '1px solid var(--border-gold)' }}>
          <div className="metric-icon">
            <Gem size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: 'var(--gold-dark)' }}>Total Catalogued Pieces</span>
            <span className="metric-value">{totalPieces} Items</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Across all active jewellery lines</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <BarChart3 size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Categories</span>
            <span className="metric-value">{data.length} Groups</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Gold, Silver & Diamond sections</span>
          </div>
        </div>
      </div>

      {/* Data Table Panel */}
      <section className="panel data-panel">
        <div className="table-toolbar">
          <div>
            <h3>Product Stock & Pricing Summaries</h3>
            <p className="subtle" style={{ margin: 0, fontSize: '0.78rem' }}>
              Consolidated item specifications
            </p>
          </div>
          <div className="table-toolbar-actions">
            <button className="btn-icon" onClick={() => load(true)} title="Refresh report" aria-label="Refresh report">
              <RefreshCw size={16} />
            </button>
            <button
              className="btn-icon"
              disabled={!data.length}
              onClick={() => toast.info('Exporting stock report data...')}
              title="Export report"
              aria-label="Export report"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={6} columns={6} />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th className="status-cell">Metal Type</th>
                  <th className="num-cell">Total Pieces</th>
                  <th className="currency-cell">Avg Making Charge (₹/g)</th>
                  <th className="num-cell">Avg Wastage %</th>
                </tr>
              </thead>
              <tbody>
                {data.length ? (
                  data.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.ProductName}</strong></td>
                      <td>{row.CategoryName || '—'}</td>
                      <td className="status-cell">
                        <StatusBadge status={row.MetalType || 'GOLD'} />
                      </td>
                      <td className="num-cell">{row.TotalPieces} pcs</td>
                      <td className="currency-cell">₹{Number(row.AvgMakingCharge || 0).toLocaleString('en-IN')}</td>
                      <td className="num-cell">{row.AvgWastage || 0}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No stock valuation records loaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
