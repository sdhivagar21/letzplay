import dotenv from 'dotenv';
dotenv.config();
import './seedConn.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import xlsx from 'xlsx';
import path from 'path';

async function run() {
  // admin user
  if (!(await User.findOne({ email: 'admin@letzplay.local' }))) {
    await User.create({ name: 'Admin', email: 'admin@letzplay.local', password: 'Admin@123', role: 'admin' });
    console.log('Admin created');
  }

  const file = path.resolve(process.cwd(), '../products-sample.csv');
  const wb = xlsx.readFile(file);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws);

  for (const r of rows) {
    await Product.findOneAndUpdate({ sku: r.ProductID }, {
      sku: r.ProductID,
      name: r.Name,
      collection: r.Collection,
      price: r.Price,
      description: r.Description,
      sizes: (r.Sizes || '').split(','),
      colors: (r.Colors || '').split(','),
      images: (r.ImageURLs || '').split(/;|,/),
      stock: r.Stock
    }, { upsert: true });
  }
  console.log('Products seeded');
  process.exit();
}
run();
