import React from 'react';
import MasterListPage from '../components/masters/MasterListPage';

export default function MetalRatePage() {
  const fields = [
    { name: 'MetalType', label: 'Metal Type', type: 'select', required: true, options: [{ value: 'GOLD', label: 'GOLD' }, { value: 'SILVER', label: 'SILVER' }, { value: 'PLATINUM', label: 'PLATINUM' }] },
    { name: 'Purity', label: 'Purity', type: 'text', required: true, placeholder: 'e.g. 22K, 24K, 925' },
    { name: 'BoardRate', label: 'Board Rate (₹/g)', type: 'number', step: '0.01', required: true },
    { name: 'BuyRate', label: 'Old Metal Buy Rate (₹/g)', type: 'number', step: '0.01' },
    { name: 'EffectiveDate', label: 'Effective Date', type: 'date', required: true }
  ];

  return (
    <MasterListPage
      formCode="METAL_RATE"
      title="Daily Metal Rate Master"
      subtitle="Configure daily buying and selling board rates for Gold, Silver and Platinum."
      endpoint="/masters/metal-rates"
      idKey="RateId"
      fields={fields}
    />
  );
}
