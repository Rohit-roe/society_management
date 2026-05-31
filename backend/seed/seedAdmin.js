const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Society = require('../models/Society');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: 'admin@app.com' });
  if (existing) {
    console.log('Seed already run. App Admin exists.');
    process.exit(0);
  }

  const society = await Society.create({
    name: 'Green Valley Apartments',
    address: '123 Main Road',
    city: 'Hyderabad',
    totalFlats: 50,
  });

  await User.create({
    name: 'App Admin',
    email: 'admin@app.com',
    password: 'Admin@1234',
    role: 'app_admin',
  });

  const societyAdmin = await User.create({
    name: 'Society Admin',
    email: 'societyadmin@greenvalley.com',
    password: 'Admin@1234',
    role: 'society_admin',
    societyId: society._id,
    phone: '9000000001',
  });

  await User.create({
    name: 'Demo Resident',
    email: 'resident@greenvalley.com',
    password: 'Admin@1234',
    role: 'resident',
    societyId: society._id,
    flatNumber: 'A-101',
    phone: '9000000002',
  });

  await User.create({
    name: 'Gate Security',
    email: 'security@greenvalley.com',
    password: 'Admin@1234',
    role: 'security',
    societyId: society._id,
    phone: '9000000003',
  });

  console.log('Seed complete.');
  console.log('Society ID:', society._id);
  console.log('Demo accounts (password: Admin@1234):');
  console.log('  App Admin:      admin@app.com');
  console.log('  Society Admin:  societyadmin@greenvalley.com');
  console.log('  Resident:       resident@greenvalley.com');
  console.log('  Security:       security@greenvalley.com');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
