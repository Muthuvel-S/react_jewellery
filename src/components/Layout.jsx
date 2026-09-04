import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown, Gem, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, X,
  Coins, ShoppingCart, Landmark, Hammer, Boxes, CreditCard, BarChart3, Tag,
  Sun, Moon, Sparkles, Database, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const erpCategories = [
  {
    name: 'POS & Billing',
    icon: ShoppingCart,
    badge: 'POS',
    codes: ['SPE', 'GOLD_EXCHANGE', 'UNEATIMATE_SPE', 'SALES_RETURN']
  },
  {
    name: 'Nagai Seettu (Chit)',
    icon: Coins,
    badge: 'CHIT',
    codes: ['CUSTOMER_CHIT_ENTRY', 'CUSTOMER_CHIT_DETAILS', 'CUSTOMER_CHIT_GROUP']
  },
  {
    name: 'Gold Loan & Finance',
    icon: Landmark,
    badge: 'LOAN',
    codes: ['JEWELL_LOAN']
  },
  {
    name: 'Karigar Workshops',
    icon: Hammer,
    badge: 'WORKSHOP',
    codes: ['GOLD_SMITH', 'GOLD_SMITH_WORK', 'METAL_ISSUE', 'METAL_RECEIPT']
  },
  {
    name: 'Stock & Barcode Tagging',
    icon: Boxes,
    badge: 'STOCK',
    codes: ['LOT_ENTRIES', 'TAG_ENTRY', 'NON_TAG_ENTRY', 'BAR_CODE_PRINT']
  },
  {
    name: 'Masters & Daily Rates',
    icon: Gem,
    badge: 'MASTER',
    codes: ['METAL_RATE', 'PRODUCT', 'SUB_PRODUCT', 'ACCOUNT_MASTER', 'CASH_COUNTER', 'PAYMENT_MODE']
  },
  {
    name: 'Accounts & Vouchers',
    icon: CreditCard,
    badge: 'VOUCHER',
    codes: ['PAYMENT_VOUCHER', 'RECEIPT_VOUCHER', 'JOURNAL_VOUCHER', 'CONTRA_VOUCHER', 'CREDIT_NOTE', 'DEBIT_NOTE']
  },
  {
    name: 'Reports & Analytics',
    icon: BarChart3,
    badge: 'REPORTS',
    codes: ['STOCK_REPORT', 'SALES_PURCHASE_REPORTS', 'DAY_BOOK', 'TRIAL_BALANCE', 'ACCOUNTS_REPORT', 'GOLD_SMITH_REPORT']
  }
];

export default function Layout() {
  const { user, forms, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set(['POS & Billing', 'Nagai Seettu (Chit)', 'Gold Loan & Finance', 'Karigar Workshops']));

  // Group forms into organized ERP categories
  const categoriesWithForms = useMemo(() => {
    const assignedCodes = new Set();
    const result = [];

    erpCategories.forEach(cat => {
      const codeSet = new Set(cat.codes);
      const catForms = forms.filter(f =>
        f.legacyName !== 'MDIMain' &&
        f.legacyName !== 'frmLogin' &&
        codeSet.has(f.code) &&
        f.title.toLowerCase().includes(query.toLowerCase())
      );
      if (catForms.length) {
        catForms.forEach(f => assignedCodes.add(f.code));
        result.push({ ...cat, forms: catForms });
      }
    });

    // Catch remaining uncategorized forms
    const remainingForms = forms.filter(f =>
      f.legacyName !== 'MDIMain' &&
      f.legacyName !== 'frmLogin' &&
      !assignedCodes.has(f.code) &&
      f.title.toLowerCase().includes(query.toLowerCase())
    );

    if (remainingForms.length) {
      result.push({
        name: 'Other Showroom Forms',
        icon: Tag,
        badge: 'OTHER',
        forms: remainingForms
      });
    }

    return result;
  }, [forms, query]);

  function toggleCategory(catName) {
    setExpanded(current => {
      const next = new Set(current);
      next.has(catName) ? next.delete(catName) : next.add(catName);
      return next;
    });
  }

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  const currentForm = forms.find(f => location.pathname.endsWith(`/${f.path}`));
  const isAccessControl = location.pathname.includes('access-control');
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <div className="app-shell">
      {/* Mobile Hamburger Button */}
      <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation menu">
        <Menu size={20} />
      </button>

      {/* Backdrop scrim for mobile drawer */}
      {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Brand Crest Header */}
        <div className="sidebar-brand">
          <div className="brand-emblem">
            <Gem size={22} />
          </div>
          <div className="brand-details">
            <span className="brand-title">ANDAL</span>
            <span className="brand-subtitle">Showroom ERP Suite</span>
          </div>
          <button onClick={() => setOpen(false)} className="close-side" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Global Module Search */}
        <div className="nav-search">
          <Search size={15} />
          <input
            placeholder="Search forms & modules..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Navigation Item Tree */}
        <nav>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/app/dashboard"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={17} />
            <span>Showroom Dashboard</span>
          </NavLink>

          {user?.isAdmin && (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              to="/app/access-control"
              onClick={() => setOpen(false)}
            >
              <ShieldCheck size={17} />
              <span>Access & RBAC</span>
            </NavLink>
          )}

          {/* Featured Direct Showroom Counters */}
          <div style={{ padding: '12px 10px 6px', fontSize: '10.5px', fontWeight: 700, color: 'var(--sidebar-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Showroom Counters
          </div>

          <div className="shortcut-grid">
            <NavLink to="/app/metal-rate" className="shortcut-btn" onClick={() => setOpen(false)}>
              <span>💰</span> Metal Rates
            </NavLink>
            <NavLink to="/app/sales-purchase-entry" className="shortcut-btn" onClick={() => setOpen(false)}>
              <span>🧾</span> POS Billing
            </NavLink>
            <NavLink to="/app/customer-chit-entry" className="shortcut-btn" onClick={() => setOpen(false)}>
              <span>🪙</span> Nagai Seettu
            </NavLink>
            <NavLink to="/app/jewell-loan" className="shortcut-btn" onClick={() => setOpen(false)}>
              <span>🏦</span> Gold Loan
            </NavLink>
          </div>

          {/* Categorized Form Groups */}
          {categoriesWithForms.map(cat => {
            const IconComp = cat.icon || Boxes;
            const isExp = expanded.has(cat.name) || Boolean(query);

            return (
              <section className="nav-group" key={cat.name}>
                <button
                  type="button"
                  className="nav-heading"
                  onClick={() => toggleCategory(cat.name)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconComp size={15} style={{ color: 'var(--gold-soft)' }} />
                    <span>{cat.name}</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="nav-badge">{cat.badge}</span>
                    <ChevronDown size={13} className={isExp ? 'rotate' : ''} />
                  </div>
                </button>

                {isExp && (
                  <div className="nav-items" style={{ paddingLeft: '4px' }}>
                    {cat.forms.map(form => (
                      <NavLink
                        key={form.code}
                        to={`/app/${form.path}`}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) => `nav-link compact ${isActive ? 'active' : ''}`}
                      >
                        <span className="nav-dot" />
                        <span>{form.title}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </nav>

        {/* Sidebar User Footer */}
        <div className="sidebar-user">
          <div className="avatar">
            {user?.UserName?.slice(0, 1).toUpperCase() || <User size={16} />}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.UserName || 'Showroom User'}</span>
            <span className="user-role">{user?.RoleName || user?.RoleType || 'Staff'}</span>
          </div>
          <div className="sidebar-actions">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme appearance"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={signOut} title="Sign out" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-area">
        {/* Top Bar Header */}
        <header className="topbar">
          <div className="breadcrumb-area">
            <span className="breadcrumb-module">
              {currentForm?.module || (isAccessControl ? 'Security & RBAC' : isDashboard ? 'Overview' : 'Showroom Suite')}
            </span>
            <h1 className="breadcrumb-title">
              {currentForm?.title || (isAccessControl ? 'Access Control & Permissions' : isDashboard ? 'Showroom Dashboard' : 'Jewellery Workspace')}
            </h1>
          </div>

          <div className="topbar-actions">
            {/* Live Database Connection Pill */}
            <div className="status-indicator-pill">
              <span className="status-dot" />
              <span>DB Connection:</span>
              <strong style={{ color: 'var(--text-primary)' }}>LOGIC_JEWELLERY</strong>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Luxury Light Mode' : 'Switch to Luxury Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* Page Container */}
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
