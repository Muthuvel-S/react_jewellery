import React, { useEffect, useMemo, useState } from 'react';
import {
  Check, KeyRound, Plus, RefreshCw, Save, ShieldCheck, UserPlus,
  UsersRound, Lock, UserCheck, UserX, AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonTable } from '../components/common/Skeleton';

const actions = ['CanMenu', 'CanView', 'CanAdd', 'CanEdit', 'CanDelete', 'CanPrint', 'CanOther'];
const labels = {
  CanMenu: 'Menu',
  CanView: 'View',
  CanAdd: 'Add',
  CanEdit: 'Edit',
  CanDelete: 'Delete',
  CanPrint: 'Print',
  CanOther: 'Other'
};

export default function AccessControl() {
  const { user, reloadForms } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('permissions');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleId, setRoleId] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [roleName, setRoleName] = useState('');
  const [newUser, setNewUser] = useState({ UserName: '', password: '', RoleId: '', RoleType: 'user' });

  async function loadBase(isSilent = false) {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const [roleRes, userRes] = await Promise.all([api('/rbac/roles'), api('/rbac/users')]);
      setRoles(roleRes.data || []);
      setUsers(userRes.data || []);
      if (!roleId && roleRes.data?.length) {
        setRoleId(String(roleRes.data[0].RoleId));
      }
      if (isSilent) toast.success('RBAC roles & users refreshed');
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to load RBAC data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.isAdmin) loadBase();
  }, [user?.isAdmin]);

  useEffect(() => {
    if (!roleId) return;
    api(`/rbac/roles/${roleId}/permissions`)
      .then(r => setPermissions(r.data || []))
      .catch(e => {
        setError(e.message);
        toast.error('Failed to load role permissions');
      });
  }, [roleId]);

  const grouped = useMemo(() => {
    return permissions.reduce((acc, item) => {
      (acc[item.ModuleName] ||= []).push(item);
      return acc;
    }, {});
  }, [permissions]);

  function toggle(formId, action) {
    setPermissions(current =>
      current.map(item => (item.FormID === formId ? { ...item, [action]: !item[action] } : item))
    );
  }

  function toggleRow(formId, value) {
    setPermissions(current =>
      current.map(item =>
        item.FormID === formId ? { ...item, ...Object.fromEntries(actions.map(a => [a, value])) } : item
      )
    );
  }

  async function save() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(`/rbac/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions })
      });
      await reloadForms();
      setNotice('Permissions saved successfully.');
      toast.success('Role permissions updated successfully in database!');
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to save permissions');
    } finally {
      setBusy(false);
    }
  }

  async function addRole(event) {
    event.preventDefault();
    if (!roleName.trim()) return;
    try {
      const response = await api('/rbac/roles', {
        method: 'POST',
        body: JSON.stringify({ RoleName: roleName.trim(), RoleType: 'user' })
      });
      setRoleName('');
      await loadBase(true);
      setRoleId(String(response.data.RoleId));
      toast.success(`Role "${response.data.RoleName}" created!`);
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to create role');
    }
  }

  async function addUser(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/rbac/users', {
        method: 'POST',
        body: JSON.stringify({ ...newUser, RoleId: Number(newUser.RoleId) })
      });
      setNewUser({ UserName: '', password: '', RoleId: '', RoleType: 'user' });
      await loadBase(true);
      toast.success(`User "${newUser.UserName}" created successfully!`);
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to create user');
    } finally {
      setBusy(false);
    }
  }

  async function toggleUser(target) {
    try {
      await api(`/rbac/users/${target.UserId}`, {
        method: 'PATCH',
        body: JSON.stringify({ IsActive: !target.IsActive })
      });
      await loadBase(true);
      toast.info(`User "${target.UserName}" status changed`);
    } catch (e) {
      setError(e.message);
      toast.error('Failed to update user status');
    }
  }

  if (!user?.isAdmin) {
    return (
      <div className="luxury-empty-state">
        <div className="empty-icon-wrapper" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
          <Lock size={28} />
        </div>
        <h2 className="empty-title">Super Administrator Access Required</h2>
        <p className="empty-desc">
          Only authorized security administrators can configure role-based access control and user accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Enterprise Security · PS Spare Parts RBAC Engine</p>
          <h1>Access Control & Role Permissions</h1>
          <p className="subtle">
            Granular 7-tier action enforcement (Menu, View, Add, Edit, Delete, Print, Other) mapped to database security tables.
          </p>
        </div>
        <div className="title-actions">
          <button className="btn btn-secondary" onClick={() => loadBase(true)}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="tab-list">
        <button
          className={tab === 'permissions' ? 'active' : ''}
          onClick={() => setTab('permissions')}
        >
          <KeyRound size={17} /> Role Permissions Matrix
        </button>
        <button
          className={tab === 'users' ? 'active' : ''}
          onClick={() => setTab('users')}
        >
          <UsersRound size={17} /> Showroom User Accounts ({users.length})
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {notice && (
        <div className="alert good">
          <Check size={18} />
          <span>{notice}</span>
        </div>
      )}

      {tab === 'permissions' ? (
        <>
          {/* Role Selection & New Role Bar */}
          <section className="panel control-bar" style={{ background: 'var(--bg-surface)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Select Role to Configure</label>
              <select value={roleId} onChange={e => setRoleId(e.target.value)}>
                {roles.map(role => (
                  <option key={role.RoleId} value={role.RoleId}>
                    {role.RoleName} · ({role.RoleType})
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={addRole} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label>Create New Role</label>
                <input
                  placeholder="e.g. Cashier / Appraiser"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" type="submit">
                <Plus size={16} /> Add Role
              </button>
            </form>

            <button
              className="btn btn-primary"
              onClick={save}
              disabled={busy || !roleId}
              style={{ minWidth: '140px' }}
            >
              <Save size={16} /> {busy ? 'Saving...' : 'Save Permissions'}
            </button>
          </section>

          {/* Permissions Matrix Table */}
          <section className="panel data-panel">
            {loading ? (
              <SkeletonTable rows={8} columns={9} />
            ) : (
              <div className="table-scroll" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                <table className="permission-table">
                  <thead>
                    <tr>
                      <th>Module / Page Form</th>
                      {actions.map(action => (
                        <th key={action} style={{ textAlign: 'center' }}>
                          {labels[action]}
                        </th>
                      ))}
                      <th style={{ textAlign: 'center' }}>All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(grouped).map(([moduleName, items]) => (
                      <FragmentRows
                        key={moduleName}
                        module={moduleName}
                        items={items}
                        onToggle={toggle}
                        onToggleRow={toggleRow}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="user-grid">
          {/* Create User Form */}
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Onboarding</p>
                <h2>Create Web User</h2>
              </div>
              <UserPlus size={20} style={{ color: 'var(--gold-primary)' }} />
            </div>

            <form onSubmit={addUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Username</label>
                <input
                  value={newUser.UserName}
                  onChange={e => setNewUser(v => ({ ...v, UserName: e.target.value }))}
                  required
                  placeholder="e.g. murugan_cashier"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Temporary Password (12+ chars)</label>
                <input
                  type="password"
                  minLength={12}
                  value={newUser.password}
                  onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))}
                  required
                  placeholder="••••••••••••"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Assign Role</label>
                <select
                  value={newUser.RoleId}
                  onChange={e => setNewUser(v => ({ ...v, RoleId: e.target.value }))}
                  required
                >
                  <option value="">Select Role...</option>
                  {roles.map(role => (
                    <option key={role.RoleId} value={role.RoleId}>
                      {role.RoleName} ({role.RoleType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Role Type Category</label>
                <select
                  value={newUser.RoleType}
                  onChange={e => setNewUser(v => ({ ...v, RoleType: e.target.value }))}
                >
                  <option value="user">User (Standard Counter)</option>
                  <option value="manager">Manager (Showroom In-charge)</option>
                  <option value="admin">Super Admin (System Owner)</option>
                </select>
              </div>

              <PermissionButton
                type="submit"
                variant="primary"
                loading={busy}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <UserPlus size={16} /> Create User Account
              </PermissionButton>
            </form>
          </section>

          {/* Registered Users List */}
          <section className="panel" style={{ padding: '1.25rem' }}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Directory</p>
                <h2>Showroom Staff Accounts ({users.length})</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {users.map(item => (
                <article
                  key={item.UserId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                    {item.UserName[0].toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem' }}>{item.UserName}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.RoleName} · <span style={{ textTransform: 'capitalize' }}>{item.RoleType}</span>
                    </div>
                  </div>
                  <button
                    className={`btn btn-sm ${item.IsActive ? 'btn-secondary' : 'btn-danger'}`}
                    onClick={() => toggleUser(item)}
                    style={{ minHeight: '30px', padding: '0.25rem 0.75rem', fontSize: '0.76rem' }}
                  >
                    {item.IsActive ? '✓ Active' : '✕ Disabled'}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function FragmentRows({ module, items, onToggle, onToggleRow }) {
  return (
    <>
      <tr className="module-row">
        <td colSpan={9}>
          {module} <span>({items.length} pages)</span>
        </td>
      </tr>
      {items.map(item => {
        const all = actions.every(action => item[action]);
        return (
          <tr key={item.FormID}>
            <td>
              <strong>{item.FormName}</strong>
              <small>{item.FormCode}</small>
            </td>
            {actions.map(action => (
              <td key={action} style={{ textAlign: 'center' }}>
                <input
                  type="checkbox"
                  aria-label={`${item.FormName} ${labels[action]}`}
                  checked={Boolean(item[action])}
                  onChange={() => onToggle(item.FormID, action)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
                />
              </td>
            ))}
            <td style={{ textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={all}
                onChange={() => onToggleRow(item.FormID, !all)}
                aria-label={`All permissions for ${item.FormName}`}
                style={{ width: '16px', height: '16px', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
              />
            </td>
          </tr>
        );
      })}
    </>
  );
}
