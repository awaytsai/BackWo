const aws = require("aws-sdk");
const fetch = require("node-fetch");
const Pet = require("../model/petposts_model");
const Lables = require("../model/labels_model");
const Notification = require("../model/notification_model");
const Geo = require("../model/geo_model");
const breedsList = require("../public/data/breeds.json");

const uploadFindOwnersPost = async (req, res) => {
  const { kind, color, county, district, address, date, note } = req.body;
  let breed = req.body.breed;
  if (!(kind && breed && color && county && district && address && date)) {
    return res.json({ message: "請填寫所有欄位" });
  }
  if (breed == "其他") {
    breed = req.body.breedName;
  }
  let person = "owner";
  const status = "lost";
  const userId = req.decoded.payload.id;
  const photo = req.files.photo[0].key;

  // 1. conver address into lat lng
  const fullAddress = encodeURIComponent(
    `${county}${district}${address}`.replace(/\s/g, "")
  );
  const key = "AIzaSyDJNv7tNr1GMnFgRulEBksMdwlL0Jewigc";
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${fullAddress}&key=${key}`;
  const response = await fetch(url);
  const geoData = await response.json();

  // 2. store geo data in db
  const lat = geoData.results[0].geometry.location.lat;
  const lng = geoData.results[0].geometry.location.lng;
  const postResult = await Pet.createPetsPost(
    person,
    userId,
    status,
    kind,
    breed,
    color,
    county,
    district,
    address,
    date,
    photo,
    note,
    lat,
    lng
  );
  const postId = postResult.insertId;
  console.log(postResult);
  console.log(postId);

  const detectResult = await detectImage();

  async function detectImage() {
    if (breed == "未知") {
      // aws reko
      awsReko();
    }
  }

  // 3. detect labels by aws-rekognition
  async function awsReko() {
    aws.config.update({
      region: process.env.AWS_BUCKET_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
    const params = {
      Image: {
        S3Object: {
          Bucket: process.env.AWS_BUCKET_NAME,
          Name: `findowners/${photo}`,
        },
      },
      MaxLabels: 20,
      MinConfidence: 80,
    };

    const labels = [];
    let detectBreed;

    const rekognition = new aws.Rekognition();
    rekognition.detectLabels(params, async (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
      // 4. AI detect and store labels
      data.Labels.map((lb) => {
        labels.push(lb.Name);
      });
      console.log(labels);
      labels.map((lb) => {
        breedsList.dog_breed_en.map((breed) => {
          // check breed
          if (lb == breed) {
            detectBreed =
              breedsList.dog_breed[breedsList.dog_breed_en.indexOf(breed)];
          }
        });
      });
      // store label data
      const labelResult = await Lables.storeLable(
        JSON.stringify(labels),
        postId
      );
      // update pet_post breed
      if (detectBreed) {
        breed = detectBreed;
        const updatePostResult = await Pet.updatePetsPost(breed, postId);
      }
      // check if owner post (breed/county/time) match
      person = "finder";
      const matchBreedData = await Pet.getMatchBreedPosts(
        person,
        breed,
        county,
        date
      );

      if (matchBreedData.length > 0) {
        const petPostIds = [];
        matchBreedData.map((data) => {
          petPostIds.push(data.id);
        });
        console.log(petPostIds);

        // create notification data (fp_id/fo_id/)
        const notificationData = await Notification.insertNotification(
          petPostIds,
          postId
        );
        console.log(notificationData);
      }
    });
  }
  res.json({ status: "updated" });
};

const getFindOwnersGeoInfo = async (req, res) => {
  const { kind, county, district, date } = req.query;
  const person = "owner";
  // check query string w/o filter
  if (kind && county && district && date) {
    if (kind == "全部") {
      const geoResult = await Geo.getAllBreedsFilterGeo(
        person,
        county,
        district,
        date
      );
      console.log(geoResult);
      return res.json(geoResult);
    } else {
      const geoResult = await Geo.getFilterGeo(
        person,
        kind,
        county,
        district,
        date
      );
      console.log(geoResult);
      return res.json(geoResult);
    }
  } else {
    // without filter
    const geoResult = await Geo.getAllGeo(person);
    res.json(geoResult);
  }
};

const getFindOwnersPosts = async (req, res) => {
  // check query string w/o filter
  const { kind, county, district, date } = req.query;
  const person = "owner";
  if (kind && county && district && date) {
    if (kind == "全部") {
      const postResult = await Pet.getAllBreedsFilterPosts(
        person,
        county,
        district,
        date
      );
      console.log(postResult);
      res.json(postResult);
    } else {
      const postResult = await Pet.getFilterPosts(
        person,
        kind,
        county,
        district,
        date
      );
      console.log(postResult);
      res.json(postResult);
    }
  } else {
    // without filter
    const postResult = await Pet.getPetsPosts(person);
    res.json(postResult);
  }
};

module.exports = {
  uploadFindOwnersPost,
  getFindOwnersGeoInfo,
  getFindOwnersPosts,
};
