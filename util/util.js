const multer = require("multer");
const multerS3 = require("multer-s3");
const S3 = require("aws-sdk/clients/s3");
const fetch = require("node-fetch");
const maxSize = 3 * 1024 * 1024; // 3MB

// error catching
const wrapAsync = (fn) => {
  return function (req, res, next) {
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
    fileSize: maxSize,
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
      return cb(new Error("Please upload a .jpg or .jpeg image"));
    }
    cb(null, true);
  },
  limit: {
    fileSize: maxSize,
  },
});

const uploadFindPets = uploadS3_pets.fields([
  { name: "photo", maxCount: 1 },
  { name: "more_photo", maxCount: 2 },
]);
const uploadFindOwners = uploadS3_owners.fields([
  { name: "photo", maxCount: 1 },
  { name: "more_photo", maxCount: 2 },
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

function isValidDate(dateString) {
  // First check for the pattern
  var regex_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
  if (!regex_date.test(dateString)) {
    return false;
  }
  // Parse the date parts to integers
  var parts = dateString.split("-");
  var day = parseInt(parts[2], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);
  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month == 0 || month > 12) {
    return false;
  }
  var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Adjust for leap years
  if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
    monthLength[1] = 29;
  }
  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
}

function getOtherUserId(existingIds, userId) {
  existingIds.map((data) => {
    let ids = data.room_id.split("-");
    ids.forEach((id) => {
      if (id != userId) {
        console.log(id);
        data.othersId = id;
      }
    });
  });
  return existingIds;
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
  isValidDate,
  getOtherUserId,
};
