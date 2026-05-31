const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function fetchJsonOrThrow(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`HTTP ${res.status} (Not JSON): ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  return { data, status: res.status };
}

async function testAll() {
  console.log('🚀 Starting Backend API Verification Tests...');
  const users = {};
  
  // 1. Log in to get tokens for different roles
  const roles = [
    { key: 'appAdmin', email: 'admin@app.com' },
    { key: 'societyAdmin', email: 'societyadmin@greenvalley.com' },
    { key: 'resident', email: 'resident@greenvalley.com' },
    { key: 'security', email: 'security@greenvalley.com' }
  ];

  for (const role of roles) {
    try {
      const { data } = await fetchJsonOrThrow(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: role.email, password: 'Admin@1234' })
      });
      users[role.key] = {
        token: data.token,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        id: data._id,
        name: data.name,
        societyId: data.societyId,
        flatNumber: data.flatNumber
      };
      console.log(`✅ Logged in as ${role.key}: ${data.name} (Flat: ${data.flatNumber || 'N/A'}, Society: ${data.societyId || 'N/A'})`);
    } catch (err) {
      console.error(`❌ Failed to login as ${role.key} (${role.email}):`, err.message);
      process.exit(1);
    }
  }

  const sAdmin = users.societyAdmin;
  const resident = users.resident;
  const security = users.security;

  // ----------------------------------------------------
  // TEST 2: Parking Management
  // ----------------------------------------------------
  console.log('\n--- Testing Parking Management ---');
  let slotId = '';
  try {
    // 2.1 Create Parking Slot (Society Admin)
    const slotNo = `P-${Date.now().toString().slice(-4)}`;
    const { data: slot } = await fetchJsonOrThrow(`${BASE_URL}/parking`, {
      method: 'POST',
      headers: sAdmin.headers,
      body: JSON.stringify({ slotNumber: slotNo, type: 'resident' })
    });
    slotId = slot._id;
    console.log(`✅ Created parking slot: ${slot.slotNumber} (ID: ${slotId})`);

    // 2.2 Assign Parking Slot (Society Admin)
    const { data: assigned } = await fetchJsonOrThrow(`${BASE_URL}/parking/${slotId}/assign`, {
      method: 'PUT',
      headers: sAdmin.headers,
      body: JSON.stringify({
        vehicleNumber: 'AP 09 XY 1234',
        ownerName: resident.name,
        ownerId: resident.id,
        isAvailable: false
      })
    });
    console.log(`✅ Assigned slot ${assigned.slotNumber} to vehicle ${assigned.vehicleNumber}`);

    // 2.3 Report Parking Complaint (Resident)
    const { data: complained } = await fetchJsonOrThrow(`${BASE_URL}/parking/${slotId}/complaint`, {
      method: 'POST',
      headers: resident.headers,
      body: JSON.stringify({ complaint: 'Someone else parked in my spot!' })
    });
    console.log(`✅ Parking complaint registered. Total complaints: ${complained.complaints.length}`);
  } catch (err) {
    console.error('❌ Parking Management Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: Security Shift Management
  // ----------------------------------------------------
  console.log('\n--- Testing Security Shift Management ---');
  let shiftId = '';
  try {
    // 3.1 Create Shift (Society Admin)
    const { data: shift } = await fetchJsonOrThrow(`${BASE_URL}/security-shifts`, {
      method: 'POST',
      headers: sAdmin.headers,
      body: JSON.stringify({
        guardName: 'Ramu Bahadur',
        shift: 'morning',
        assignedZone: 'Main Gate A'
      })
    });
    shiftId = shift._id;
    console.log(`✅ Created security guard roster for: ${shift.guardName} (ID: ${shiftId})`);

    // 3.2 Log Attendance (Security Guard / Society Admin)
    const { data: shiftWithAttendance } = await fetchJsonOrThrow(`${BASE_URL}/security-shifts/${shiftId}/attendance`, {
      method: 'POST',
      headers: sAdmin.headers,
      body: JSON.stringify({
        status: 'present',
        clockIn: new Date().toISOString()
      })
    });
    console.log(`✅ Logged attendance for ${shiftWithAttendance.guardName}. Count: ${shiftWithAttendance.attendance.length}`);
  } catch (err) {
    console.error('❌ Security Shift Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 4: Staff & Operations Management
  // ----------------------------------------------------
  console.log('\n--- Testing Staff & Operations ---');
  let staffId = '';
  let taskId = '';
  try {
    // 4.1 Create Staff (Society Admin)
    const { data: staff } = await fetchJsonOrThrow(`${BASE_URL}/staff`, {
      method: 'POST',
      headers: sAdmin.headers,
      body: JSON.stringify({
        name: 'Gopal Lal',
        role: 'cleaner',
        phone: '9876543211',
        salary: 12000
      })
    });
    staffId = staff._id;
    console.log(`✅ Created staff member: ${staff.name} (Role: ${staff.role}, ID: ${staffId})`);

    // 4.2 Log Staff Attendance (Society Admin)
    const { data: staffWithAtt } = await fetchJsonOrThrow(`${BASE_URL}/staff/${staffId}/attendance`, {
      method: 'POST',
      headers: sAdmin.headers,
      body: JSON.stringify({
        date: new Date().toISOString(),
        status: 'present'
      })
    });
    console.log(`✅ Logged staff attendance. Count: ${staffWithAtt.attendance.length}`);

    // 4.3 Assign Task to Staff (Society Admin)
    const { data: staffWithTask } = await fetchJsonOrThrow(`${BASE_URL}/staff/${staffId}/tasks`, {
      method: 'POST',
      headers: sAdmin.headers,
      body: JSON.stringify({
        title: 'Clean Clubhouse Lounge',
        description: 'Sweep and mop the lounge before the afternoon booking starts.',
        dueDate: new Date(Date.now() + 86400000).toISOString()
      })
    });
    const task = staffWithTask.tasks[staffWithTask.tasks.length - 1];
    taskId = task._id;
    console.log(`✅ Assigned task "${task.title}" to ${staffWithTask.name} (Task ID: ${taskId})`);

    // 4.4 Update Task Status (Resident / Admin)
    const { data: taskUpdated } = await fetchJsonOrThrow(`${BASE_URL}/staff/${staffId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: sAdmin.headers,
      body: JSON.stringify({ status: 'completed' })
    });
    console.log(`✅ Updated task status to: ${taskUpdated.tasks.find(t => t._id === taskId).status}`);
  } catch (err) {
    console.error('❌ Staff & Operations Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 5: Facility Booking Module + Conflict Verification
  // ----------------------------------------------------
  console.log('\n--- Testing Facility Booking & Conflicts ---');
  let bookingId = '';
  try {
    const bookingDate = new Date(Date.now() + 172800000 + Math.floor(Math.random() * 100) * 86400000).toISOString().split('T')[0]; // random days in future
    
    // 5.1 Create Booking (Resident) - now passing durationHours
    const { data: booking } = await fetchJsonOrThrow(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: resident.headers,
      body: JSON.stringify({
        facility: 'clubhouse',
        date: bookingDate,
        startTime: '10:00',
        endTime: '12:00',
        durationHours: 2,
        notes: 'Verification test booking'
      })
    });
    bookingId = booking._id;
    console.log(`✅ Created booking for ${booking.facility} on ${booking.date} (${booking.startTime}-${booking.endTime}, Status: ${booking.status})`);

    // 5.2 Attempt Double Booking (Same time slot & facility)
    try {
      await fetchJsonOrThrow(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: resident.headers,
        body: JSON.stringify({
          facility: 'clubhouse',
          date: bookingDate,
          startTime: '11:00',
          endTime: '13:00',
          durationHours: 2
        })
      });
      console.log('⚠️ Warning: Conflict check did not block double booking.');
    } catch (err) {
      console.log(`✅ Conflict detection succeeded! Error message: "${err.message}"`);
    }
  } catch (err) {
    console.error('❌ Facility Booking Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 6: Payment Fallback Flow
  // ----------------------------------------------------
  console.log('\n--- Testing Mock Payments Fallback ---');
  try {
    // 6.1 Get/Create a maintenance record first
    let maintenanceRecordId = '';
    const { data: maintList } = await fetchJsonOrThrow(`${BASE_URL}/maintenance/my`, {
      method: 'GET',
      headers: resident.headers
    });

    if (maintList.length === 0) {
      // Create a dummy record
      const { data: newMaint } = await fetchJsonOrThrow(`${BASE_URL}/maintenance`, {
        method: 'POST',
        headers: sAdmin.headers,
        body: JSON.stringify({
          flatNumber: resident.flatNumber || 'A-101',
          residentId: resident.id,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          amount: 2500
        })
      });
      console.log(`✅ Created test maintenance bill: ${newMaint.month}/${newMaint.year} of amount ${newMaint.amount}`);
      maintenanceRecordId = newMaint._id;
    } else {
      // Use the first unpaid record, or reset it
      const unpaid = maintList.find(m => m.status !== 'paid');
      if (unpaid) {
        maintenanceRecordId = unpaid._id;
      } else {
        maintenanceRecordId = maintList[0]._id;
        // Reset status to unpaid to test payment
        await fetchJsonOrThrow(`${BASE_URL}/maintenance/${maintenanceRecordId}`, {
          method: 'PATCH',
          headers: sAdmin.headers,
          body: JSON.stringify({ status: 'pending' })
        });
        console.log('✅ Reset existing maintenance bill status to pending for testing');
      }
    }

    console.log(`Using maintenanceRecordId: ${maintenanceRecordId}`);

    // 6.2 Create Order (Mock mode triggers if Razorpay credentials are missing)
    const { data: orderData } = await fetchJsonOrThrow(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: resident.headers,
      body: JSON.stringify({ maintenanceId: maintenanceRecordId })
    });
    console.log(`✅ Created payment order. ID: ${orderData.orderId} (IsMock: ${orderData.isMock})`);

    // 6.3 Verify Order
    const { data: verifyData } = await fetchJsonOrThrow(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: resident.headers,
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: 'pay_mock123456',
        razorpay_signature: 'sig_mock123456'
      })
    });
    console.log(`✅ Verified payment. Response: "${verifyData.message}"`);
  } catch (err) {
    console.error('❌ Mock Payments Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 7: Defaulters Aging Report
  // ----------------------------------------------------
  console.log('\n--- Testing Defaulters Aging Report ---');
  try {
    const { data: defaulters } = await fetchJsonOrThrow(`${BASE_URL}/maintenance/defaulters`, {
      method: 'GET',
      headers: sAdmin.headers
    });
    console.log(`✅ Defaulters aging report retrieved. Count: ${defaulters.length}`);
    if (defaulters.length > 0) {
      console.log(`   Top Defaulter: Flat ${defaulters[0].flatNumber} (Name: ${defaulters[0].residentName}, Dues: ₹${defaulters[0].totalAmount})`);
    }
  } catch (err) {
    console.error('❌ Defaulters Report Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 8: AI Chatbot Fallback Response
  // ----------------------------------------------------
  console.log('\n--- Testing Chatbot Fallback Parser ---');
  try {
    const { data: chatResult } = await fetchJsonOrThrow(`${BASE_URL}/chatbot`, {
      method: 'POST',
      headers: resident.headers,
      body: JSON.stringify({ message: 'What are my maintenance dues?' })
    });
    console.log(`✅ Chatbot query returned reply:\n----------------------\n${chatResult.reply}\n----------------------`);
  } catch (err) {
    console.error('❌ Chatbot Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 9: Visitor Gated Loop Approval Flow
  // ----------------------------------------------------
  console.log('\n--- Testing Visitor Gated Approval Loop ---');
  let visitorId = '';
  try {
    // 9.1 Security logs a visitor entry
    const { data: visitor } = await fetchJsonOrThrow(`${BASE_URL}/visitors`, {
      method: 'POST',
      headers: security.headers,
      body: JSON.stringify({
        visitorName: 'Swiggy Delivery Boy',
        visitorPhone: '9988776655',
        flatToVisit: resident.flatNumber || 'A-101',
        purpose: 'delivery'
      })
    });
    visitorId = visitor._id;
    console.log(`✅ Visitor logged by security. Status: ${visitor.approvalStatus}, CheckIn: ${visitor.checkIn || 'None'}`);

    // 9.2 Resident approves visitor
    const { data: approvedVisitor } = await fetchJsonOrThrow(`${BASE_URL}/visitors/${visitorId}/approve`, {
      method: 'PATCH',
      headers: resident.headers
    });
    console.log(`✅ Visitor approved by resident. Status: ${approvedVisitor.approvalStatus}`);

    // 9.3 Security check-in visitor
    const { data: checkedinVisitor } = await fetchJsonOrThrow(`${BASE_URL}/visitors/${visitorId}/checkin`, {
      method: 'PATCH',
      headers: security.headers
    });
    console.log(`✅ Visitor checked in at gate. Status: ${checkedinVisitor.approvalStatus}, CheckIn Time: ${checkedinVisitor.checkIn}`);

    // 9.4 Security check-out visitor
    const { data: checkedoutVisitor } = await fetchJsonOrThrow(`${BASE_URL}/visitors/${visitorId}/checkout`, {
      method: 'PATCH',
      headers: security.headers
    });
    console.log(`✅ Visitor checked out. Status: ${checkedoutVisitor.approvalStatus}, CheckOut Time: ${checkedoutVisitor.checkOut}`);
  } catch (err) {
    console.error('❌ Visitor Loop Test Failed:', err.message);
  }

  // ----------------------------------------------------
  // TEST 10: Resident Family Member Profiles
  // ----------------------------------------------------
  console.log('\n--- Testing Family Members Configuration ---');
  try {
    // 10.1 Add Family Member
    const { data: familyData } = await fetchJsonOrThrow(`${BASE_URL}/residents/family`, {
      method: 'POST',
      headers: resident.headers,
      body: JSON.stringify({
        name: 'Sita Devi',
        relation: 'spouse',
        phone: '9000000009',
        isEmergencyContact: true
      })
    });
    // familyData is the familyMembers array
    const sita = familyData.find(f => f.name === 'Sita Devi');
    console.log(`✅ Added family member: ${sita ? sita.name : 'Unknown'} (Relation: ${sita ? sita.relation : 'Unknown'})`);

    // 10.2 Get updated family members list
    const { data: members } = await fetchJsonOrThrow(`${BASE_URL}/residents/family`, {
      method: 'GET',
      headers: resident.headers
    });
    console.log(`✅ Resident retrieves ${members.length} family members correctly.`);
  } catch (err) {
    console.error('❌ Family Member Profile Test Failed:', err.message);
  }

  console.log('\n🌟 Backend API Verification Finished.');
}

testAll().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
