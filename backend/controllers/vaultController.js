const DocumentVault = require('../models/DocumentVault');

// Get all documents in the society's vault
const getDocuments = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { societyId: req.user.societyId };
    if (category) {
      filter.category = category;
    }

    const documents = await DocumentVault.find(filter)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a document to the vault (Society Admin)
const createDocument = async (req, res) => {
  try {
    const { title, category, fileUrl } = req.body;
    if (!title || !category || !fileUrl) {
      return res.status(400).json({ message: 'Title, Category, and File URL/Path are required' });
    }

    const document = await DocumentVault.create({
      societyId: req.user.societyId,
      title,
      category,
      fileUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDocuments, createDocument };
