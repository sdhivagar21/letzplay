import fs from 'fs';
import path from 'path';

const CSV_PATH =
  process.env.PREORDER_CSV_PATH ||
  path.join(process.cwd(), 'preorders.csv'); // default: project root

const HEADERS = [
  'OrderID',
  'UserName',
  'UserEmail',
  'ProductID',
  'ProductName',
  'Size',
  'Color',
  'Quantity',
  'Price',
  'PreorderDate',
  'DeliveryDate',
  'Status'
];

function esc(v) {
  if (v === undefined || v === null) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function ensureHeader() {
  try {
    await fs.promises.access(CSV_PATH, fs.constants.F_OK);
    // exists -> leave as is
  } catch {
    const dir = path.dirname(CSV_PATH);
    await fs.promises.mkdir(dir, { recursive: true });
    const bom = '\uFEFF'; // UTF-8 BOM for Excel
    const header = HEADERS.join(',') + '\r\n';
    await fs.promises.writeFile(CSV_PATH, bom + header, 'utf8');
  }
}

export async function appendPreorderToCSV(doc, user) {
  await ensureHeader();

  const row = [
    esc(doc._id),
    esc(user?.name || ''),
    esc(user?.email || doc.email || ''),
    esc(doc.sku),
    esc(doc.name),
    esc(doc.size || ''),
    esc(doc.color || ''),
    esc(doc.qty ?? 1),
    esc(doc.price ?? ''),
    esc(doc.createdAt?.toISOString?.() || new Date().toISOString()),
    esc(doc.deliveryDate || ''),
    esc(doc.status || 'pending')
  ].join(',') + '\r\n';

  await fs.promises.appendFile(CSV_PATH, row, 'utf8');
}

export { CSV_PATH, HEADERS };
