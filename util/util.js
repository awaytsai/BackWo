const multer = require("multer");
const multerS3 = require("multer-s3");
const S3 = require("aws-sdk/clients/s3");

// error catching
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

// S3 upload
const s3 = new S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const uploadS3_pets = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME + "/findpets",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname.replace(/\s/g, "") + "-" + Date.now());
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
      cb(new Error("Please upload a .jpg or .jpeg image"));
    }
    cb(null, true);
  },
  limit: {
    fileSize: 3000000,
  },
});

const uploadS3_owners = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME + "/findowners",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, file.originalname.replace(/\s/g, "") + "-" + Date.now());
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
      cb(new Error("Please upload a .jpg or .jpeg image"));
    }
    cb(null, true);
  },
  limit: {
    fileSize: 3000000,
  },
});
const uploadFindPets = uploadS3_pets.fields([{ name: "photo", maxCount: 1 }]);
const uploadFindOwners = uploadS3_owners.fields([
  { name: "photo", maxCount: 1 },
]);

module.exports = {
  wrapAsync,
  uploadFindPets,
  uploadFindOwners,
};
