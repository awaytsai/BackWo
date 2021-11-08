const aws = require("aws-sdk");
const fetch = require("node-fetch");
const breedsList = require("../public/data/breeds.json");

const Lables = require("../model/labels_model");
const Notification = require("../model/notification_model");
const Pet = require("../model/petposts_model");
const { switchPerson } = require("../util/util");

async function awsReko(param, photo, postId, breed, person, county, date) {
  aws.config.update({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });
  const params = {
    Image: {
      S3Object: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Name: `${param}/${photo}`,
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
    // console.log(labels);
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
    const labelResult = await Lables.storeLable(JSON.stringify(labels), postId);
    // update pet_post breed
    if (detectBreed) {
      breed = detectBreed;
      const updatePostResult = await Pet.updatePetsPost(breed, postId);
    }
    // check if owner post (breed/county/time) match
    person = "finder";
    person = switchPerson(param);
    const matchBreedData = await Pet.getMatchBreedPosts(
      person,
      breed,
      county,
      date
    );
    console.log("match done");
    if (matchBreedData.length > 0) {
      const petPostIds = [];
      matchBreedData.map((data) => {
        petPostIds.push(data.id);
      });
      // console.log(petPostIds);
      const notiStauts = "exist";
      // create notification data (fp_id/fo_id/)
      const notificationData = await Notification.insertNotification(
        petPostIds,
        postId,
        notiStauts
      );
      // console.log(notificationData);
      const response = { status: "updated" };
      return response;
    }
  });
}

module.exports = {
  awsReko,
};
