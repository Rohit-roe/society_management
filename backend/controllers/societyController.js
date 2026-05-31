const Society = require('../models/Society');

const getAllSocieties = async (req, res) => {
  try {
    const societies = await Society.find().select('name city address totalFlats status');
    res.json(societies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createSociety = async (req, res) => {
  try {
    const { name, address, city, totalFlats } = req.body;
    const society = await Society.create({
      name,
      address,
      city,
      totalFlats,
      createdBy: req.user._id,
    });
    res.status(201).json(society);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSociety = async (req, res) => {
  try {
    const society = await Society.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!society) return res.status(404).json({ message: 'Society not found' });
    res.json(society);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSociety = async (req, res) => {
  try {
    await Society.findByIdAndDelete(req.params.id);
    res.json({ message: 'Society deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAvailableResidents = async (req, res) => {
  try {
    const ResidentMember = require('../models/ResidentMember');
    const residents = await ResidentMember.find({
      societyId: req.params.id,
      $or: [{ userId: { $exists: false } }, { userId: null }],
    }).select('houseNo name');
    res.json(residents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllSocieties,
  createSociety,
  updateSociety,
  deleteSociety,
  getAvailableResidents,
};
