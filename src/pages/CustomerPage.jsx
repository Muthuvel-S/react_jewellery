import React from 'react';
import MasterListPage from '../components/masters/MasterListPage';

export default function CustomerPage() {
  const fields = [
    { name: 'CustomerName', label: 'Customer Name', type: 'text', required: true },
    { name: 'Phone', label: 'Phone Number', type: 'text', required: true },
    { name: 'Email', label: 'Email Address', type: 'email' },
    { name: 'Address', label: 'Address', type: 'text' },
    { name: 'City', label: 'City', type: 'text' },
    { name: 'GSTIN', label: 'GSTIN / Tax ID', type: 'text' },
    { name: 'OpeningBalance', label: 'Opening Balance (₹)', type: 'number', step: '0.01', defaultValue: 0 }
  ];

  return (
    <MasterListPage
      formCode="ACCOUNT_MASTER"
      title="Customer & Account Master"
      subtitle="Register and manage customer profiles, contact numbers, tax IDs, and ledger balances."
      endpoint="/masters/customers"
      idKey="CustomerId"
      fields={fields}
    />
  );
}
