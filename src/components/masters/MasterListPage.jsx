import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, Edit2, Trash2, Database, AlertTriangle, Gem } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PermissionButton from '../common/PermissionButton';
import StatusBadge from '../common/StatusBadge';
import MasterFormModal from './MasterFormModal';
import { SkeletonTable } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';

export default function MasterListPage({
  formCode,
  title,
  subtitle,
  endpoint,
  idKey = 'id',
  fields = []
}) {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor(formCode);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const load = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const res = await api(endpoint);
      setRows(res.data || []);
      if (isSilent) toast.success(`${title} refreshed`);
    } catch (err) {
      setError(err.message || 'Failed to load master records.');
      setRows([]);
      toast.error(err.message || 'Failed to load records');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  const visibleRows = useMemo(() => {
    if (!query) return rows;
    return rows.filter(row =>
      Object.values(row).some(v => String(v ?? '').toLowerCase().includes(query.toLowerCase()))
    );
  }, [rows, query]);

  const columns = useMemo(() => {
    if (fields.length) return fields.map(f => ({ key: f.name, label: f.label, type: f.type }));
    if (!rows.length) return [];
    return Object.keys(rows[0]).map(k => ({ key: k, label: k, type: 'text' }));
  }, [fields, rows]);

  const handleSave = async (formData) => {
    if (editItem) {
      const itemKey = editItem[idKey] || editItem[Object.keys(editItem)[0]];
      await api(`${endpoint}/${itemKey}`, { method: 'PUT', body: JSON.stringify(formData) });
      toast.success('Record updated successfully in database!');
    } else {
      await api(endpoint, { method: 'POST', body: JSON.stringify(formData) });
      toast.success('New record created successfully!');
    }
    await load(true);
  };

  const handleDelete = async (row) => {
    const itemKey = row[idKey] || row[Object.keys(row)[0]];
    if (!window.confirm(`Are you sure you want to delete this record (${itemKey})?`)) return;
    try {
      await api(`${endpoint}/${itemKey}`, { method: 'DELETE' });
      toast.info('Record deleted from database');
      await load(true);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Master Configuration · {formCode}</p>
          <h1>{title}</h1>
          <p className="subtle">{subtitle || `Master management workspace for ${title}`}</p>
        </div>
        <div className="title-actions">
          <PermissionButton
            variant="primary"
            permission={permission.CanAdd}
            onClick={() => { setEditItem(null); setShowModal(true); }}
          >
            <Plus size={16} /> New Entry
          </PermissionButton>
        </div>
      </section>

      {/* Main Data Panel */}
      <section className="panel data-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search master records..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="table-toolbar-actions">
            <StatusBadge variant="gold">{rows.length} records</StatusBadge>
            <button className="btn-icon" onClick={() => load(true)} title="Refresh master data" aria-label="Refresh master data">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="luxury-empty-state">
            <div className="empty-icon-wrapper" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="empty-title">Unable to load master records</h3>
            <p className="empty-desc">{error}</p>
            <button className="btn btn-secondary" onClick={() => load()}>Retry</button>
          </div>
        ) : loading ? (
          <SkeletonTable rows={6} columns={columns.length + 1} />
        ) : visibleRows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map(col => {
                    const isNum = col.type === 'number' || col.key.toLowerCase().includes('rate') || col.key.toLowerCase().includes('charge') || col.key.toLowerCase().includes('balance');
                    return (
                      <th key={col.key} className={isNum ? 'currency-cell' : ''}>
                        {col.label}
                      </th>
                    );
                  })}
                  <th className="action-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map(col => {
                      const val = row[col.key];
                      const isNum = col.type === 'number' || col.key.toLowerCase().includes('rate') || col.key.toLowerCase().includes('charge') || col.key.toLowerCase().includes('balance');

                      return (
                        <td key={col.key} className={isNum ? 'currency-cell' : ''}>
                          {isNum && val != null && !isNaN(val) ? (
                            <strong>₹{Number(val).toLocaleString('en-IN')}</strong>
                          ) : (
                            String(val ?? '—')
                          )}
                        </td>
                      );
                    })}
                    <td className="action-cell">
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <PermissionButton
                          variant="icon"
                          permission={permission.CanEdit}
                          onClick={() => { setEditItem(row); setShowModal(true); }}
                          title="Edit record"
                          aria-label="Edit record"
                        >
                          <Edit2 size={14} />
                        </PermissionButton>
                        <PermissionButton
                          variant="icon"
                          className="danger"
                          permission={permission.CanDelete}
                          onClick={() => handleDelete(row)}
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
            title="No master records found"
            description={query ? `No records matching "${query}".` : 'Click "+ New Entry" above to add your first master record.'}
            action={
              permission.CanAdd ? (
                <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowModal(true); }}>
                  <Plus size={15} /> Add Record
                </button>
              ) : null
            }
          />
        )}
      </section>

      {/* Modal Dialog */}
      {showModal && (
        <MasterFormModal
          title={title}
          fields={fields}
          initialData={editItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
