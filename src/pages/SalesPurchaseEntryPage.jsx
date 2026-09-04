import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart, Plus, Trash2, Printer, CheckCircle2, ScanLine,
  RefreshCw, Coins, Sparkles, Receipt, ArrowRight, ShieldCheck, Tag
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PermissionButton from '../components/common/PermissionButton';
import StatusBadge from '../components/common/StatusBadge';

export default function SalesPurchaseEntryPage() {
  const { permissionFor } = useAuth();
  const toast = useToast();
  const permission = permissionFor('SPE');

  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [metalRate, setMetalRate] = useState(6850);
  const [items, setItems] = useState([
    { id: 1, TagNo: 'TAG-88001', ProductName: '22K Gold Chain', GrossWt: 12.50, StoneWt: 0.70, NetWt: 11.80, WastagePercent: 4.5, MakingCharge: 350.00 }
  ]);
  const [tagInput, setTagInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Old Gold Exchange State
  const [enableOldGold, setEnableOldGold] = useState(false);
  const [oldGoldData, setOldGoldData] = useState({
    Description: 'Old 22K Gold Jewels / Coins',
    GrossWt: 10.0,
    TouchPurity: 85, // 85% Touch = 8.5g fine wt
    BuyRate: 6650
  });

  // Chit Redemption State
  const [chitRedemption, setChitRedemption] = useState(0);

  // Old Gold Calculated Fine Weight & Credit Amount
  const oldGoldFineWt = useMemo(() => {
    return ((Number(oldGoldData.GrossWt || 0) * Number(oldGoldData.TouchPurity || 0)) / 100).toFixed(3);
  }, [oldGoldData.GrossWt, oldGoldData.TouchPurity]);

  const oldGoldCredit = useMemo(() => {
    if (!enableOldGold) return 0;
    return Math.round(Number(oldGoldFineWt) * Number(oldGoldData.BuyRate || 6650));
  }, [enableOldGold, oldGoldFineWt, oldGoldData.BuyRate]);

  const totals = useMemo(() => {
    let gross = 0;
    let net = 0;
    let metalAmt = 0;
    let makingAmt = 0;

    items.forEach(item => {
      const g = Number(item.GrossWt || 0);
      const s = Number(item.StoneWt || 0);
      const n = g - s;
      const wast = Number(item.WastagePercent || 0);
      const effWt = n + (n * wast / 100);
      const mAmt = effWt * Number(metalRate);
      const mk = Number(item.MakingCharge || 0);

      gross += g;
      net += n;
      metalAmt += mAmt;
      makingAmt += mk;
    });

    const sub = metalAmt + makingAmt - Number(discount || 0);
    const gst = sub * 0.03;
    const grossTotal = Math.round(sub + gst);
    const netPayable = Math.max(0, Math.round(grossTotal - oldGoldCredit - Number(chitRedemption || 0)));

    return { gross, net, metalAmt, makingAmt, sub, gst, grossTotal, netPayable };
  }, [items, metalRate, discount, oldGoldCredit, chitRedemption]);

  const handleScanTag = async () => {
    if (!tagInput.trim()) return;
    try {
      const res = await api(`/stock/tags/lookup/${tagInput.trim()}`);
      if (res.data) {
        setItems(prev => [
          ...prev,
          {
            id: Date.now(),
            TagNo: res.data.TagNo,
            ProductName: res.data.ProductName,
            GrossWt: res.data.GrossWt,
            StoneWt: res.data.StoneWt,
            NetWt: res.data.NetWt,
            WastagePercent: res.data.WastagePercent,
            MakingCharge: res.data.MakingCharge
          }
        ]);
        setTagInput('');
        toast.success(`Item "${res.data.ProductName}" added to bill`);
      }
    } catch (err) {
      toast.error(err.message || 'Tag barcode lookup failed');
    }
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
    toast.info('Item removed from bill');
  };

  const handlePostBill = async () => {
    if (!items.length) {
      toast.warning('Please add at least one jewellery item before posting bill.');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await api('/transactions/spe', {
        method: 'POST',
        body: JSON.stringify({
          CustomerName: customerName,
          MetalRate: metalRate,
          Items: items,
          DiscountAmount: discount,
          OldGoldExchange: enableOldGold ? { ...oldGoldData, FineWt: oldGoldFineWt, CreditAmount: oldGoldCredit } : null,
          ChitRedemptionAmount: chitRedemption,
          PaymentBreakdown: { Mode: paymentMode, Amount: totals.netPayable }
        })
      });
      const successMsg = `Sales Bill #${res.data?.BillNo || '101'} posted successfully! Net Paid: ₹${totals.netPayable.toLocaleString('en-IN')}`;
      setMsg(successMsg);
      toast.success(successMsg);
      setItems([]);
      setDiscount(0);
      setChitRedemption(0);
      setEnableOldGold(false);
    } catch (err) {
      const errMsg = `Error: ${err.message}`;
      setMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace">
      {/* Page Title */}
      <section className="page-title">
        <div>
          <p className="eyebrow">Counter POS · SPE & Gold Exchange</p>
          <h1>Sales & Purchase Billing Terminal</h1>
          <p className="subtle">
            Barcode tag scanning, real-time board rate valuation, old gold touch appraisal, and GST tax invoice generation.
          </p>
        </div>
        <div className="title-actions">
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
            disabled={!permission.CanPrint}
          >
            <Printer size={16} /> Print Tax Invoice
          </button>
        </div>
      </section>

      {msg && (
        <div className={`alert ${msg.startsWith('Error') ? 'error' : 'good'}`}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Split Grid: Left Items / Old Gold & Right Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top Panel: Customer & Board Rate */}
          <section className="panel">
            <div className="form-grid" style={{ marginBottom: '1.15rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Customer Name / Phone</label>
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter customer name or phone"
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Today's 22K Selling Rate (₹ / g)</label>
                <input
                  type="number"
                  value={metalRate}
                  onChange={e => setMetalRate(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Barcode / Tag Scan Input */}
            <div style={{ display: 'flex', gap: '0.65rem', backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div className="search-box" style={{ flex: 1, backgroundColor: 'var(--bg-surface)' }}>
                <ScanLine size={17} style={{ color: 'var(--gold-primary)' }} />
                <input
                  placeholder="Scan Barcode or enter Tag No (e.g. TAG-88001)..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScanTag()}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleScanTag} type="button">
                <Plus size={15} /> Add Item
              </button>
            </div>

            {/* Scanned Items Table */}
            <div className="table-scroll" style={{ maxHeight: '280px', marginTop: '1.25rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Item & Tag</th>
                    <th className="weight-cell">Gross Wt</th>
                    <th className="weight-cell">Net Wt</th>
                    <th className="num-cell">Wastage %</th>
                    <th className="currency-cell">Making (₹)</th>
                    <th className="action-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length ? (
                    items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.ProductName}</strong>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <code>{item.TagNo}</code>
                          </div>
                        </td>
                        <td className="weight-cell">{Number(item.GrossWt).toFixed(2)} g</td>
                        <td className="weight-cell"><strong>{Number(item.NetWt).toFixed(2)} g</strong></td>
                        <td className="num-cell">{item.WastagePercent}%</td>
                        <td className="currency-cell">₹{Number(item.MakingCharge).toLocaleString('en-IN')}</td>
                        <td className="action-cell">
                          <button
                            className="btn-icon danger"
                            onClick={() => removeItem(item.id)}
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No items added. Scan a barcode tag or enter tag number above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Old Gold Exchange Deduction Section */}
          <section className="panel" style={{ background: 'linear-gradient(135deg, var(--gold-light) 0%, var(--bg-surface) 100%)', border: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-dark)' }}>
                <Coins size={18} /> Old Gold Exchange Deduction
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={enableOldGold}
                  onChange={e => setEnableOldGold(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--gold-primary)' }}
                />
                Include Exchange
              </label>
            </div>

            {enableOldGold && (
              <div className="form-grid grid-3" style={{ marginTop: '0.85rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Old Metal Description</label>
                  <input
                    value={oldGoldData.Description}
                    onChange={e => setOldGoldData({ ...oldGoldData, Description: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Gross Weight (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={oldGoldData.GrossWt}
                    onChange={e => setOldGoldData({ ...oldGoldData, GrossWt: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Touch / Purity %</label>
                  <input
                    type="number"
                    value={oldGoldData.TouchPurity}
                    onChange={e => setOldGoldData({ ...oldGoldData, TouchPurity: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Calculated Fine Wt (g)</label>
                  <input
                    value={`${oldGoldFineWt} g`}
                    readOnly
                    style={{ backgroundColor: 'var(--bg-subtle)', fontWeight: 'bold' }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Buy Rate (₹ / g)</label>
                  <input
                    type="number"
                    value={oldGoldData.BuyRate}
                    onChange={e => setOldGoldData({ ...oldGoldData, BuyRate: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ color: 'var(--error)' }}>Credit Deduction</label>
                  <input
                    value={`- ₹${oldGoldCredit.toLocaleString('en-IN')}`}
                    readOnly
                    style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', fontWeight: 800 }}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Professional POS Invoice Summary */}
        <section className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '90px' }}>
          <div className="panel-header" style={{ marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={19} style={{ color: 'var(--gold-primary)' }} /> Bill Summary
            </h2>
            <StatusBadge variant="gold">GST Invoice</StatusBadge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="subtle">Total Gross Weight:</span>
              <strong>{totals.gross.toFixed(2)} g</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="subtle">Total Net Weight:</span>
              <strong>{totals.net.toFixed(2)} g</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="subtle">Jewellery Subtotal:</span>
              <strong>₹{totals.sub.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span className="subtle">GST Tax (3%):</span>
              <span>₹{totals.gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>

            {enableOldGold && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--border-subtle)', color: 'var(--error)', fontWeight: 600 }}>
                <span>Less: Old Gold Credit:</span>
                <span>- ₹{oldGoldCredit.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Chit Scheme Redemption */}
            <div className="form-group" style={{ margin: '0.5rem 0 0' }}>
              <label>Less: Nagai Seettu / Chit Credit (₹)</label>
              <input
                type="number"
                value={chitRedemption}
                onChange={e => setChitRedemption(Number(e.target.value))}
                placeholder="Enter Chit credit amount..."
              />
            </div>

            {/* Total Net Payable Highlight */}
            <div
              style={{
                marginTop: '0.5rem',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
                border: '2px solid var(--gold-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold-dark)', letterSpacing: '0.06em' }}>
                  Net Amount Payable
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                  ₹{totals.netPayable.toLocaleString('en-IN')}
                </div>
              </div>
              <Sparkles style={{ color: 'var(--gold-primary)' }} size={24} />
            </div>

            {/* Payment Mode Selection */}
            <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              <label>Settlement Payment Mode</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option value="CASH">💵 CASH COUNTER</option>
                <option value="CARD">💳 CREDIT / DEBIT CARD POS</option>
                <option value="UPI">📱 UPI / GPAY / QR</option>
                <option value="GOLD_EXCHANGE">🪙 OLD GOLD EXCHANGE ADJUSTMENT</option>
              </select>
            </div>
          </div>

          <PermissionButton
            permission={permission.CanAdd}
            variant="primary"
            size="lg"
            onClick={handlePostBill}
            disabled={loading || !items.length}
            loading={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Post & Complete Bill (₹{totals.netPayable.toLocaleString('en-IN')})
          </PermissionButton>
        </section>
      </div>
    </div>
  );
}
