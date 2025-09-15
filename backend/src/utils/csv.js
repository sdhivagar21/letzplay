import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

const file = './preorders.csv';
const header = [
  { id: 'OrderID', title: 'OrderID' },
  { id: 'UserName', title: 'UserName' },
  { id: 'UserEmail', title: 'UserEmail' },
  { id: 'ProductID', title: 'ProductID' },
  { id: 'ProductName', title: 'ProductName' },
  { id: 'Size', title: 'Size' },
  { id: 'Color', title: 'Color' },
  { id: 'Quantity', title: 'Quantity' },
  { id: 'Price', title: 'Price' },
  { id: 'PreorderDate', title: 'PreorderDate' },
  { id: 'DeliveryDate', title: 'DeliveryDate' },
  { id: 'Status', title: 'Status' }
];

export const appendPreorderCsv = async (po) => {
  if (!fs.existsSync(file)) {
    const w = createObjectCsvWriter({ path: file, header });
    await w.writeRecords([]);
  }
  const w = createObjectCsvWriter({ path: file, header, append: true });
  await w.writeRecords([{
    OrderID: po._id,
    UserName: po.userName,
    UserEmail: po.userEmail,
    ProductID: po.productSKU,
    ProductName: po.productName,
    Size: po.size,
    Color: po.color,
    Quantity: po.quantity,
    Price: po.price,
    PreorderDate: po.preorderDate,
    DeliveryDate: po.deliveryDate || '',
    Status: po.status
  }]);
};

export const getCsvPath = () => file;
