/**
 * Visitor Pass Expiry Scheduler
 *
 * Runs every 15 minutes to expire pre-approved visitor passes
 * whose expectedAt window has passed and check-in is still null.
 * Uses plain setInterval to avoid external cron dependencies.
 */

const Visitor = require('../models/Visitor');

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const expireVisitorPasses = async () => {
  try {
    const now = new Date();

    const result = await Visitor.updateMany(
      {
        approvalStatus: 'approved',
        preApproved: true,
        checkIn: null,
        expectedAt: { $lt: now },
      },
      { $set: { approvalStatus: 'expired' } }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[VisitorScheduler] Expired ${result.modifiedCount} overdue visitor pass(es) at ${now.toISOString()}`
      );
    }
  } catch (err) {
    console.error('[VisitorScheduler] Error expiring visitor passes:', err.message);
  }
};

const startVisitorScheduler = () => {
  console.log('[VisitorScheduler] Started — checking for expired passes every 15 minutes.');

  // Run once immediately on startup to catch any passes that expired while server was down
  expireVisitorPasses();

  // Then run on interval
  setInterval(expireVisitorPasses, INTERVAL_MS);
};

module.exports = { startVisitorScheduler };
