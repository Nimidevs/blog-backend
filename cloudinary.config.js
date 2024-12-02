require("dotenv").config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const imageUploadFunction = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath);
    //console.log(result.secure_url);
    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
  }
};

const imageUploadFunctionModifiedToUseBuffers = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "Culture images" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};
const makingTheBufferModificationAsync = async () => {};

module.exports.imageUploadFunction = imageUploadFunction;
module.exports.imageUploadFunctionModifiedToUseBuffers =
  imageUploadFunctionModifiedToUseBuffers;
