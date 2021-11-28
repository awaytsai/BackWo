const aws = require("aws-sdk");
const fetch = require("node-fetch");
const breedsList = require("../data/breeds.json");

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

    // labels
    data.Labels.map((lb) => {
      labels.push(lb.Name);
    });
    labels.map((lb) => {
      breedsList.dog_breed_en.map((breed) => {
        // check if label detect pet breed
        if (lb == breed) {
          detectBreed =
            breedsList.dog_breed[breedsList.dog_breed_en.indexOf(breed)];
        }
      });
    });
    await Lables.createLable(labels, postId);

    if (detectBreed) {
      breed = detectBreed;
      await Pet.updatePetsPost(breed, postId);
    }

    // check if post match
    person = switchPerson(param);
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

      // create notification
      const notiStauts = "created";
      await Notification.insertNotification(petPostIds, postId, notiStauts);

      const response = { status: "updated" };
      return response;
    }
  });
}

module.exports = {
  awsReko,
};
