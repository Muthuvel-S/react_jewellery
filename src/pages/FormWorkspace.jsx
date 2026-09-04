import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertTriangle, ChevronLeft, ChevronRight, Database, Download,
  Plus, Printer, RefreshCw, Search, ShieldAlert, Edit2, Trash2, X
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import PermissionButton from '../components/common/PermissionButton';
import { SkeletonTable } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

import MetalRatePage from './MetalRatePage';
import ProductPage from './ProductPage';
import CustomerPage from './CustomerPage';
import LotEntryPage from './LotEntryPage';
import TagEntryPage from './TagEntryPage';
import NonTagEntryPage from './NonTagEntryPage';
import SalesPurchaseEntryPage from './SalesPurchaseEntryPage';
import VoucherEntryPage from './VoucherEntryPage';
import StockReportPage from './StockReportPage';
import ChitSchemePage from './ChitSchemePage';
import GoldLoanPage from './GoldLoanPage';
import GoldsmithPage from './GoldsmithPage';

const pageRegistry = {
  METAL_RATE: MetalRatePage,
  PRODUCT: ProductPage,
  SUB_PRODUCT: ProductPage,
  ACCOUNT_MASTER: CustomerPage,
  CUSTOMER: CustomerPage,
  LOT_ENTRIES: LotEntryPage,
  TAG_ENTRY: TagEntryPage,
  NON_TAG_ENTRY: NonTagEntryPage,
  SPE: SalesPurchaseEntryPage,
  UNEATIMATE_SPE: SalesPurchaseEntryPage,
  SALES_RETURN: SalesPurchaseEntryPage,
  GOLD_EXCHANGE: SalesPurchaseEntryPage,
  PAYMENT_VOUCHER: VoucherEntryPage,
  RECEIPT_VOUCHER: VoucherEntryPage,
  JOURNAL_VOUCHER: VoucherEntryPage,
  CONTRA_VOUCHER: VoucherEntryPage,
  STOCK_REPORT: StockReportPage,
  SALES_PURCHASE_REPORTS: StockReportPage,
  DAY_BOOK: StockReportPage,
  TRIAL_BALANCE: StockReportPage,

  CUSTOMER_CHIT_ENTRY: ChitSchemePage,
  CUSTOMER_CHIT_DETAILS: ChitSchemePage,
  CUSTOMER_CHIT_GROUP: ChitSchemePage,
  JEWELL_LOAN: GoldLoanPage,
  GOLD_SMITH: GoldsmithPage,
  GOLD_SMITH_WORK: GoldsmithPage,
  METAL_ISSUE: GoldsmithPage,
  METAL_RECEIPT: GoldsmithPage
};

function show(value) {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

export default function FormWorkspace() {
  const { formPath } = useParams();
  const { forms, permissionFor } = useAuth();
  const form = forms.find(item => item.path === formPath);

  if (!form) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Page not permitted or not registered"
        description={`Ask an administrator to grant CanMenu/CanView permissions for this form path (${formPath}).`}
      />
    );
  }

  // 1. Render Dedicated Functional Component if registered in registry
  const DedicatedComponent = pageRegistry[form.code];
  if (DedicatedComponent) {
    return <DedicatedComponent />;
  }

  // 2. Fallback Schema Inspection / Adapter Pending View
  return <FallbackWorkspace form={form} permission={permissionFor(form.code)} />;
}

function FallbackWorkspace({ form, permission }) {
  const toast = useToast();
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const take = 50;

  async function load(nextSkip = skip, isSilent = false) {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const metadata = await api(`/forms/${form.code}/metadata`);
      setMeta(metadata.data);
      if (metadata.data?.available && permission.CanView) {
        const records = await api(`/forms/${form.code}/records?skip=${nextSkip}&take=${take}`);
        setRows(records.data || []);
      } else {
        setRows([]);
      }
      if (isSilent) toast.success('Records refreshed');
    } catch (e) {
      setError(e.message);
      setRows([]);
      toast.error(e.message || 'Failed to load records');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  useEffect(() => {
    setSkip(0);
    load(0);
  }, [form?.code]);

  const columns = useMemo(() => {
    if (!rows || !rows.length) return meta?.columns?.map(c => c.name) || [];
    return Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object');
  }, [meta, rows]);

  const visibleRows = useMemo(() => {
    if (!query) return rows;
    return rows.filter(row =>
      Object.values(row).some(v => String(v ?? '').toLowerCase().includes(query.toLowerCase()))
    );
  }, [rows, query]);

  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const handleSaveRecord = async (formData) => {
    try {
      if (editRow) {
        const pkCol = columns[0];
        const idVal = editRow[pkCol];
        await api(`/forms/${form.code}/records/${idVal}`, { method: 'PUT', body: JSON.stringify(formData) });
        toast.success('Record updated successfully in database!');
      } else {
        await api(`/forms/${form.code}/records`, { method: 'POST', body: JSON.stringify(formData) });
        toast.success('New record created and saved to database!');
      }
      setShowModal(false);
      await load(0, true);
    } catch (err) {
      toast.error(err.message || 'Failed to save record.');
    }
  };

  const handleDeleteRecord = async (row) => {
    const pkCol = columns[0];
    const idVal = row[pkCol];
    if (!window.confirm(`Are you sure you want to delete record (${pkCol}: ${idVal})?`)) return;
    try {
      await api(`/forms/${form.code}/records/${idVal}`, { method: 'DELETE' });
      toast.info('Record deleted from database.');
      await load(skip, true);
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    }
  };

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">{form.module} · {form.legacyName}</p>
          <h1>{form.title}</h1>
          <p className="subtle">Web route & security permission code: <code>{form.code}</code></p>
        </div>
        <div className="title-actions">
          <button className="btn btn-secondary" onClick={() => window.print()} disabled={!permission.CanPrint}>
            <Printer size={16} /> Print
          </button>
          <PermissionButton
            variant="primary"
            disabled={!permission.CanAdd || !meta?.available}
            onClick={() => { setEditRow(null); setShowModal(true); }}
          >
            <Plus size={16} /> New Entry
          </PermissionButton>
        </div>
      </section>

      {!meta?.available && (
        <div className="alert neutral">
          <ShieldAlert size={19} />
          <div>
            <strong>Database Schema Standby</strong>
            <span>Table <code>{form.table || 'N/A'}</code> is initializing in database migrations.</span>
          </div>
        </div>
      )}

      {/* Main Data Panel */}
      <section className="panel data-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Filter loaded rows…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="table-toolbar-actions">
            <StatusBadge variant={meta?.available ? 'success' : 'neutral'}>
              {meta?.available ? meta.form.table : 'Adapter Standby'}
            </StatusBadge>
            <button className="btn-icon" onClick={() => load(skip, true)} title="Refresh data" aria-label="Refresh data">
              <RefreshCw size={16} />
            </button>
            <button
              className="btn-icon"
              disabled={!rows.length}
              onClick={() => toast.info('Exporting table data...')}
              title="Export table"
              aria-label="Export table"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {error ? (
          <EmptyState
            icon={AlertTriangle}
            title="Could not load workspace metadata"
            description={error}
            action={<button className="btn btn-secondary" onClick={() => load(0)}>Retry Loading</button>}
          />
        ) : loading ? (
          <SkeletonTable rows={8} columns={columns.length || 5} />
        ) : visibleRows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                  <th className="action-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr key={i}>
                    {columns.map(col => (
                      <td key={col} title={String(row[col] ?? '')}>
                        {show(row[col])}
                      </td>
                    ))}
                    <td className="action-cell">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <PermissionButton
                          variant="icon"
                          permission={permission.CanEdit}
                          onClick={() => { setEditRow(row); setShowModal(true); }}
                          title="Edit record"
                          aria-label="Edit record"
                        >
                          <Edit2 size={14} />
                        </PermissionButton>
                        <PermissionButton
                          variant="icon"
                          className="danger"
                          permission={permission.CanDelete}
                          onClick={() => handleDeleteRecord(row)}
                          title="Delete record"
                          aria-label="Delete record"
                        >
                          <Trash2 size={14} />
                        </PermissionButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Database}
            title="No records loaded"
            description={
              meta?.available
                ? 'Mapped database table has 0 rows. Click "+ New Entry" to create a record.'
                : 'Adapter pending for this legacy form.'
            }
            action={
              meta?.available && permission.CanAdd ? (
                <button className="btn btn-primary btn-sm" onClick={() => { setEditRow(null); setShowModal(true); }}>
                  <Plus size={15} /> Add First Record
                </button>
              ) : null
            }
          />
        )}

        <footer className="table-footer">
          <span>Showing {visibleRows.length} of {rows.length} row(s) · {columns.length} column(s)</span>
          <div className="table-footer-actions">
            <button
              disabled={skip === 0}
              onClick={() => { const next = Math.max(0, skip - take); setSkip(next); load(next); }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              disabled={rows.length < take}
              onClick={() => { const next = skip + take; setSkip(next); load(next); }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>

      {/* Dynamic Form Modal */}
      {showModal && (
        <DynamicFormModal
          title={form.title}
          columns={meta?.columns || []}
          initialData={editRow}
          onClose={() => setShowModal(false)}
          onSave={handleSaveRecord}
        />
      )}
    </div>
  );
}

function DynamicFormModal({ title, columns, initialData, onClose, onSave }) {
  const editableCols = columns.filter((col, idx) => {
    const name = col.name.toLowerCase();
    if (!initialData && (idx === 0 || name === 'createdat' || name === 'updatedat')) return false;
    return true;
  });

  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '620px' }}>
        <header className="modal-header">
          <h3>{initialData ? `Edit ${title} Entry` : `New ${title} Entry`}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {editableCols.map(col => {
                const name = col.name;
                const isNum = col.dataType.toLowerCase().includes('int') || col.dataType.toLowerCase().includes('decimal');
                const isDate = col.dataType.toLowerCase().includes('date');
                const isBool = col.dataType.toLowerCase().includes('bit');

                return (
                  <div key={name} className="form-group" style={{ margin: 0 }}>
                    <label>{name}</label>
                    {isBool ? (
                      <select
                        value={formData[name] ?? true}
                        onChange={e => setFormData({ ...formData, [name]: e.target.value === 'true' })}
                      >
                        <option value="true">True / Active</option>
                        <option value="false">False / Inactive</option>
                      </select>
                    ) : (
                      <input
                        type={isDate ? 'date' : isNum ? 'number' : 'text'}
                        step={isNum ? 'any' : undefined}
                        value={formData[name] ?? ''}
                        onChange={e => setFormData({ ...formData, [name]: isNum ? Number(e.target.value) : e.target.value })}
                        required={!col.nullable}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              <span>{loading ? 'Saving to Database…' : 'Save Record Entry'}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
