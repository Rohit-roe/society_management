const fs = require('fs');

const uploadToCloudinary = async (filePath) => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'auto',
      });

      // Delete local file after uploading to Cloudinary
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error('Failed to delete temp file:', unlinkErr);
      }

      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local URL:', err);
    }
  }
  return null;
};

module.exports = { uploadToCloudinary };
