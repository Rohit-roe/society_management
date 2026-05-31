const OpenAI = require('openai');
const Conversation = require('../models/Conversation');
const Maintenance = require('../models/Maintenance');
const Notice = require('../models/Notice');
const Booking = require('../models/Booking');
const { createTicketFromChat } = require('./supportTicketController');

const SUPPORT_KEYWORDS = /complaint|support|ticket|issue|grievance|raise a complaint|file a complaint/i;

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('xxxx')) return null;
  return new OpenAI({ apiKey });
};

const buildUserContext = async (user) => {
  if (!user.societyId) return `User: ${user.name}, role: ${user.role}`;

  const now = new Date();
  const [maint, notices, bookings] = await Promise.all([
    Maintenance.find({ flatNumber: user.flatNumber, societyId: user.societyId })
      .sort({ year: -1, month: -1 })
      .limit(3),
    Notice.find({ societyId: user.societyId }).sort({ createdAt: -1 }).limit(3),
    Booking.find({ residentId: user._id, status: { $ne: 'rejected' } })
      .sort({ date: 1 })
      .limit(3),
  ]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return [
    `Resident: ${user.name}, Flat: ${user.flatNumber || 'N/A'}`,
    `Maintenance: ${
      maint.length
        ? maint.map((m) => `${MONTHS[m.month - 1]} ${m.year}: ₹${m.amount} — ${m.status}`).join(' | ')
        : 'None'
    }`,
    `Recent notices: ${notices.map((n) => n.title).join(' | ') || 'None'}`,
    `Bookings: ${
      bookings.length
        ? bookings
            .map((b) => `${b.facility} on ${new Date(b.date).toLocaleDateString()} (${b.status})`)
            .join(' | ')
        : 'None'
    }`,
  ].join('\n');
};

const chat = async (req, res) => {
  try {
    const client = getClient();
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

    const userCtx = await buildUserContext(req.user);
    let convo = await Conversation.findOne({ userId: req.user._id });
    if (!convo) convo = new Conversation({ userId: req.user._id, messages: [] });

    convo.messages.push({ role: 'user', content: message });

    if (!client) {
      const lower = message.toLowerCase();
      let reply = '';

      if (lower.includes('due') || lower.includes('maintenance') || lower.includes('pay')) {
        reply = `Hello! Based on your records, here is your maintenance summary:\n${
          userCtx.split('\n').find((l) => l.startsWith('Maintenance:')) || 'No maintenance dues found.'
        }\n\nYou can pay your outstanding dues directly via the Maintenance tab.`;
      } else if (lower.includes('notice') || lower.includes('announcement')) {
        reply = `Here are the recent notices for your society:\n${
          userCtx.split('\n').find((l) => l.startsWith('Recent notices:')) || 'No notices active.'
        }\n\nYou can read full details in the Notices section.`;
      } else if (lower.includes('booking') || lower.includes('facility') || lower.includes('clubhouse')) {
        reply = `Here is your booking status:\n${
          userCtx.split('\n').find((l) => l.startsWith('Bookings:')) || 'You have no active bookings.'
        }\n\nTo reserve a new slot, please navigate to the Facility Booking tab.`;
      } else if (lower.includes('visitor') || lower.includes('guest')) {
        reply = `You can pre-approve your visitors to generate a gate pass. Let security know or use the Gated Visitors section. If you have active visitors, their details will be shown in your Flat visitor log.`;
      } else if (lower.includes('complaint') || lower.includes('issue') || lower.includes('ticket')) {
        reply = `I can help you log complaints. If you write 'raise a complaint' or describe an issue, I will automatically file a support ticket for your society admin!`;
      } else if (lower.includes('wallet') || lower.includes('expense') || lower.includes('fund')) {
        reply = `Your society maintenance funds and expense ledger details are visible under the Finances page. Check it out for full transaction logs.`;
      } else {
        reply = `Hello! I am your society AI chatbot. How can I help you today? You can ask me about:\n- Your maintenance dues\n- Gated visitors\n- Latest notices\n- Active bookings\n- Raising support tickets/complaints`;
      }

      if (SUPPORT_KEYWORDS.test(message) && req.user.role === 'resident') {
        const io = req.app.get('io');
        await createTicketFromChat(io, req.user, message);
        reply += '\n\nI have created a support ticket for the society admin. They will follow up with you soon.';
      }

      convo.messages.push({ role: 'assistant', content: reply });
      await convo.save();
      return res.json({ reply, history: convo.messages, ticketCreated: SUPPORT_KEYWORDS.test(message) });
    }

    const systemPrompt = {
      role: 'system',
      content: [
        'You are a helpful assistant for a residential society management app.',
        'Help with maintenance, notices, facility bookings, and visitor pre-approval.',
        'Keep answers concise. Use ₹ for currency. Do not invent account data.',
        `Current resident data:\n${userCtx}`,
      ].join(' '),
    };

    const recentMessages = convo.messages.slice(-10);
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [systemPrompt, ...recentMessages],
      max_tokens: 400,
    });

    let reply = completion.choices[0].message.content;

    if (SUPPORT_KEYWORDS.test(message) && req.user.role === 'resident') {
      const io = req.app.get('io');
      await createTicketFromChat(io, req.user, message);
      reply +=
        '\n\nI have created a support ticket for the society admin. They will follow up with you soon.';
    }

    convo.messages.push({ role: 'assistant', content: reply });
    await convo.save();

    res.json({ reply, history: convo.messages, ticketCreated: SUPPORT_KEYWORDS.test(message) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const convo = await Conversation.findOne({ userId: req.user._id });
    res.json(convo ? convo.messages : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const clearHistory = async (req, res) => {
  try {
    await Conversation.findOneAndDelete({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Phase 2 compatible endpoint
const sendMessage = async (req, res) => {
  try {
    const client = getClient();
    if (!client) {
      return res.status(503).json({ message: 'OpenAI is not configured' });
    }

    const { messages } = req.body;
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant for a Society Management App used by apartment residents.',
        },
        ...messages,
      ],
      max_tokens: 400,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat, getHistory, clearHistory, sendMessage };
