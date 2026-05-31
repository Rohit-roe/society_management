const EventProposal = require('../models/EventProposal');
const Poll = require('../models/Poll');
const Society = require('../models/Society');
const AuditLog = require('../models/AuditLog');

// Get all event proposals for the society
const getEvents = async (req, res) => {
  try {
    const events = await EventProposal.find({ societyId: req.user.societyId })
      .populate('proposedBy', 'name flatNumber')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Propose a new event (Resident)
const proposeEvent = async (req, res) => {
  try {
    const { title, description, category, budget, contributionRequirement, deadline } = req.body;
    if (!title || !description || !category || !budget || !deadline) {
      return res.status(400).json({ message: 'Title, Description, Category, Budget, and Deadline are required' });
    }

    if (budget <= 0) {
      return res.status(400).json({ message: 'Budget must be greater than zero' });
    }

    const society = await Society.findById(req.user.societyId);
    if (!society) return res.status(404).json({ message: 'Society not found' });

    const event = await EventProposal.create({
      societyId: req.user.societyId,
      title,
      description,
      category,
      budget,
      contributionRequirement: contributionRequirement || 0,
      proposedBy: req.user._id,
      eligibleVotersCount: society.totalFlats,
      deadline,
      status: 'proposed',
      votesYes: [],
      votesNo: [],
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote yes or no on an event (one vote per flat number)
const voteOnEvent = async (req, res) => {
  try {
    const { vote } = req.body; // 'yes' or 'no'
    if (vote !== 'yes' && vote !== 'no') {
      return res.status(400).json({ message: 'Vote must be either "yes" or "no"' });
    }

    if (!req.user.flatNumber) {
      return res.status(400).json({ message: 'Only residents with flat numbers can vote' });
    }

    const event = await EventProposal.findOne({ _id: req.params.id, societyId: req.user.societyId });
    if (!event) return res.status(404).json({ message: 'Event proposal not found' });

    if (event.status !== 'proposed') {
      return res.status(400).json({ message: 'Voting has already closed for this event' });
    }

    if (new Date() > new Date(event.deadline)) {
      return res.status(400).json({ message: 'Voting deadline has passed' });
    }

    const flat = req.user.flatNumber;

    // Check if flat already voted
    if (event.votesYes.includes(flat) || event.votesNo.includes(flat)) {
      return res.status(400).json({ message: `A vote has already been cast for Flat ${flat}` });
    }

    if (vote === 'yes') {
      event.votesYes.push(flat);
    } else {
      event.votesNo.push(flat);
    }

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Close event voting and decide status (Society Admin or Proposer)
const closeEventVoting = async (req, res) => {
  try {
    const event = await EventProposal.findOne({ _id: req.params.id, societyId: req.user.societyId });
    if (!event) return res.status(404).json({ message: 'Event proposal not found' });

    if (req.user.role !== 'society_admin' && event.proposedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the proposer or society admin can close voting' });
    }

    if (event.status !== 'proposed') {
      return res.status(400).json({ message: 'Event is not in voting phase' });
    }

    const yesCount = event.votesYes.length;
    const noCount = event.votesNo.length;

    // If yes votes are strictly greater than no votes, it is approved
    if (yesCount > noCount) {
      event.status = 'approved';
    } else {
      event.status = 'rejected';
    }

    await event.save();

    await AuditLog.create({
      action: 'EVENT_VOTE_CLOSED',
      performedBy: req.user._id,
      details: `Closed voting on event: "${event.title}". Result: ${event.status} (Yes: ${yesCount}, No: ${noCount})`,
      societyId: req.user.societyId,
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manage event logistics (Society Admin)
const updateEventLogistics = async (req, res) => {
  try {
    const { logistics, status } = req.body; // status can be 'completed'
    const event = await EventProposal.findOne({ _id: req.params.id, societyId: req.user.societyId });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status === 'proposed' || event.status === 'rejected') {
      return res.status(400).json({ message: 'Logistics can only be managed for approved events' });
    }

    if (logistics !== undefined) event.logistics = logistics;
    if (status && ['approved', 'completed'].includes(status)) event.status = status;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get decision polls
const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ societyId: req.user.societyId })
      .populate('proposedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new decision poll (Society Admin)
const createPoll = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    if (!title || !description || !deadline) {
      return res.status(400).json({ message: 'Title, Description, and Deadline are required' });
    }

    const poll = await Poll.create({
      societyId: req.user.societyId,
      title,
      description,
      proposedBy: req.user._id,
      deadline,
      status: 'active',
      votesYes: [],
      votesNo: [],
    });

    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote yes or no on a poll (one vote per flat number)
const voteOnPoll = async (req, res) => {
  try {
    const { vote } = req.body; // 'yes' or 'no'
    if (vote !== 'yes' && vote !== 'no') {
      return res.status(400).json({ message: 'Vote must be either "yes" or "no"' });
    }

    if (!req.user.flatNumber) {
      return res.status(400).json({ message: 'Only residents with flat numbers can vote' });
    }

    const poll = await Poll.findOne({ _id: req.params.id, societyId: req.user.societyId });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    if (poll.status !== 'active') {
      return res.status(400).json({ message: 'Poll has been closed' });
    }

    if (new Date() > new Date(poll.deadline)) {
      poll.status = 'closed';
      await poll.save();
      return res.status(400).json({ message: 'Poll deadline has passed' });
    }

    const flat = req.user.flatNumber;

    if (poll.votesYes.includes(flat) || poll.votesNo.includes(flat)) {
      return res.status(400).json({ message: `A vote has already been cast for Flat ${flat}` });
    }

    if (vote === 'yes') {
      poll.votesYes.push(flat);
    } else {
      poll.votesNo.push(flat);
    }

    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEvents,
  proposeEvent,
  voteOnEvent,
  closeEventVoting,
  updateEventLogistics,
  getPolls,
  createPoll,
  voteOnPoll,
};
