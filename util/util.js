const multer = require("multer");
const multerS3 = require("multer-s3");
const S3 = require("aws-sdk/clients/s3");
const fetch = require("node-fetch");

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

function checkPerson(param) {
  if (param == "findowners") {
    return "owner";
  }
  if (param == "findpets") {
    return "finder";
  }
}

function switchPerson(param) {
  if (param == "findowners") {
    return "finder";
  }
  if (param == "findpets") {
    return "owner";
  }
}

function getPhotoPath(result, param) {
  result.map(
    (data) => (data.photo = `${process.env.CLOUDFRONT}/${param}/${data.photo}`)
  );
}

async function formatPostData(data, userId, param) {
  return (formatData = {
    id: data.id,
    userId: userId,
    kind: data.kind,
    breed: data.breed,
    color: data.color,
    county: data.county,
    district: data.district,
    address: data.address,
    fullAddress: `${data.county}${data.district}${data.address}`,
    date: data.date,
    note: data.note,
    photo: `${process.env.CLOUDFRONT}/${param}/${data.photo}`,
    postUserId: data.user_id,
    postUserName: data.name,
    postUserPic: data.picture,
  });
}

async function convertGeoCoding(county, district, address) {
  const fullAddress = encodeURIComponent(
    `${county}${district}${address}`.replace(/\s/g, "")
  );
  const key = "AIzaSyDJNv7tNr1GMnFgRulEBksMdwlL0Jewigc";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${fullAddress}&key=${key}`;
  const response = await fetch(url);
  const geoData = await response.json();
  const lat = geoData.results[0].geometry.location.lat;
  const lng = geoData.results[0].geometry.location.lng;
  return { lat, lng };
}

module.exports = {
  wrapAsync,
  uploadFindPets,
  uploadFindOwners,
  checkPerson,
  switchPerson,
  getPhotoPath,
  formatPostData,
  convertGeoCoding,
};
