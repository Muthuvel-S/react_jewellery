import React from 'react';
import MasterListPage from '../components/masters/MasterListPage';

export default function ProductPage() {
  const fields = [
    { name: 'CategoryId', label: 'Item Category', type: 'select', required: true, options: [{ value: 1, label: 'Gold Jewellery' }, { value: 2, label: 'Silver Articles' }, { value: 3, label: 'Diamond Ornaments' }] },
    { name: 'ProductName', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g. 22K Plain Gold Chain' },
    { name: 'ProductCode', label: 'Product Code', type: 'text', required: true, placeholder: 'e.g. G-CHN-01' },
    { name: 'HSNCode', label: 'HSN Code', type: 'text', defaultValue: '7113' },
    { name: 'MakingChargePerGram', label: 'Making Charge (₹/g)', type: 'number', step: '0.01' },
    { name: 'WastagePercent', label: 'Default Wastage %', type: 'number', step: '0.01' }
  ];

  return (
    <MasterListPage
      formCode="PRODUCT"
      title="Product Master"
      subtitle="Manage jewellery product catalog, default making charges, and wastage percentages."
      endpoint="/masters/products"
      idKey="ProductId"
      fields={fields}
    />
  );
}
