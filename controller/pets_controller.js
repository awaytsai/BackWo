const aws = require("aws-sdk");
const fetch = require("node-fetch");
const breedsList = require("../public/data/breeds.json");

const Pet = require("../model/petposts_model");
const Lables = require("../model/labels_model");
const Notification = require("../model/notification_model");
const Geo = require("../model/geo_model");
const Match = require("../model/match_model");

const awsReko = require("../util/aws_reko");
const {
  checkPerson,
  switchPerson,
  getPhotoPath,
  formatPostData,
  convertGeoCoding,
} = require("../util/util");

const uploadFindPost = async (req, res) => {
  const { kind, color, county, district, address, date, note } = req.body;
  const param = req.originalUrl.split("/")[2];
  let person = checkPerson(param);

  let breed = req.body.breed;
  if (!(kind && breed && color && county && district && address && date)) {
    return res.json({ message: "請填寫所有欄位" });
  }
  if (breed == "其他") {
    breed = req.body.breedName;
  }
  const status = "lost";
  const userId = req.decoded.payload.id;
  const photo = req.files.photo[0].key;

  const geoCoding = await convertGeoCoding(county, district, address);
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
    geoCoding.lat,
    geoCoding.lng
  );
  const postId = postResult.insertId;
  // console.log(postResult);
  // console.log(postId);

  const detectResult = await detectImage();

  async function detectImage() {
    if (breed == "未知") {
      // aws reko
      const awsData = await awsReko.awsReko(
        param,
        photo,
        postId,
        breed,
        person,
        county,
        date
      );
      return;
    }
  }
  // check if owner post (breed/county/time) match
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
    console.log("NOTIFICATION DONE");
  }
  res.json({ status: "updated" });
};

const getPetsGeoInfo = async (req, res) => {
  const { kind, county, district, date, ne, sw } = req.query;
  const param = req.originalUrl.split("/")[2].split("G")[0].slice(3);
  let person = checkPerson(param);
  // check query string w/o filter
  if (kind && county && district && date) {
    if (kind == "全部") {
      const geoResult = await Geo.getAllBreedsFilterGeo(
        person,
        county,
        district,
        date
      );
      getPhotoPath(geoResult, param);
      return res.json(geoResult);
    } else {
      const geoResult = await Geo.getFilterGeo(
        person,
        kind,
        county,
        district,
        date
      );
      getPhotoPath(geoResult, param);
      return res.json(geoResult);
    }
  } else {
    if (ne && sw) {
      // get geoinfo with in bounder
      const north = ne.split(", ")[0].split("(")[1];
      const east = ne.split(", ")[1].split(")")[0];
      const south = sw.split(", ")[0].split("(")[1];
      const west = sw.split(", ")[1].split(")")[0];
      const geoResult = await Geo.getGeoByBounder(
        person,
        west,
        east,
        south,
        north
      );
      getPhotoPath(geoResult, param);
      res.json(geoResult);
    } else {
      // without filter
      const geoResult = await Geo.getAllGeo(person);
      getPhotoPath(geoResult, param);
      res.json(geoResult);
    }
  }
};

const getFindPosts = async (req, res) => {
  // check query string w/o filter
  const { kind, county, district, date } = req.query;
  // const person = "owner";
  const param = req.originalUrl.split("/")[2].split("P")[0].slice(3);
  let person = checkPerson(param);
  if (kind && county && district && date) {
    if (kind == "全部") {
      const postResult = await Pet.getAllBreedsFilterPosts(
        person,
        county,
        district,
        date
      );
      getPhotoPath(postResult, param);
      res.json(postResult);
    } else {
      const postResult = await Pet.getFilterPosts(
        person,
        kind,
        county,
        district,
        date
      );
      getPhotoPath(postResult, param);
      res.json(postResult);
    }
  } else {
    // without filter
    let postResult = await Pet.getPetsPosts(person);
    getPhotoPath(postResult, param);
    res.json(postResult);
  }
};

const getFindPostDetail = async (req, res) => {
  // check person
  const param = req.originalUrl.split("/")[2];
  const person = checkPerson(param);
  const id = req.query.id;
  let userId;
  const postData = await Pet.getPostDetailById(person, id);
  const postDetail = postData[0];
  // check if user login
  if (!req.decoded) {
    const formatData = await formatPostData(postDetail, userId, param);
    res.json(formatData);
  } else {
    // yes => render with roomid/userid
    userId = req.decoded.payload.id;
    console.log(userId);
    let roomId = [userId, postDetail.user_id];
    roomId.sort((a, b) => {
      return a - b;
    });
    const formatData = await formatPostData(postDetail, userId, param);
    formatData.roomId = `${roomId[0]}-${roomId[1]}`;
    // check if chat to self
    // self post & need to log in again
    if (userId == formatData.postUserId || res.locals.message == "loginagain") {
      formatData.roomId = "null";
    }
    res.json(formatData);
  }
};

const getPostEditDetail = async (req, res) => {
  const param = req.originalUrl.split("/")[2];
  const person = checkPerson(param);
  const userId = req.decoded.payload.id;
  const id = req.query.id;
  const postData = await Pet.getPostDetailById(person, id);
  // console.log(postData);
  if (postData.length > 0) {
    const postDetail = postData[0];
    if (userId == postDetail.user_id) {
      // const date = postDetail.date.toISOString().split("T")[0];
      const formatData = await formatPostData(postDetail, userId, param);
      // console.log(formatData);
      return res.json(formatData);
    }
    return res.json({ message: "noaccess" });
  }
  return res.json({ message: "notexist" });
};

const getExistingPostsByUser = async (req, res) => {
  const userId = req.decoded.payload.id;
  const userPosts = await Pet.getAllPostsByUser(userId);
  userPosts.map((data) => {
    if (data.person == "owner") {
      data.photo = `${process.env.CLOUDFRONT}/findowners/${data.photo}`;
    }
    if (data.person == "finder") {
      data.photo = `${process.env.CLOUDFRONT}/findpets/${data.photo}`;
    }
  });
  // console.log(userPosts);
  res.json(userPosts);
};

const updatePostdata = async (req, res) => {
  const { kind, color, county, district, address, date, note } = req.body;
  let breed = req.body.breed;
  let photo;
  if (!(kind && breed && color && county && district && address && date)) {
    return res.json({ message: "請填寫所有欄位" });
  }
  if (breed == "其他") {
    breed = req.body.breedName;
  }
  // search post id user == user id  or not
  const userId = req.decoded.payload.id;
  const id = req.query.id;
  const param = req.originalUrl.split("/")[2];
  const person = checkPerson(param);
  const postData = await Pet.getFindPostById(id);
  console.log("postdata");
  console.log(postData);
  if (postData.length == 0) {
    return res.json({ message: "noPostExistById" });
  }
  if (postData[0].user_id !== userId) {
    return res.json({ message: "noaccess" });
  }
  // only address change => geocoding
  let lat = postData[0].lat;
  let lng = postData[0].lng;
  console.log(lat, lng);
  if (
    postData[0].county !== county ||
    postData[0].district !== district ||
    postData[0].address !== address
  ) {
    const geoCoding = await convertGeoCoding(county, district, address);
    lat = geoCoding.lat;
    lng = geoCoding.lng;
    console.log("geocoding");
  }
  // check if upload image
  if (req.files) {
    // upload with image
    photo = req.files.photo[0].key;
    // aws reko
    const detectResult = await detectImage();
    async function detectImage() {
      if (breed == "未知") {
        // aws reko
        await awsReko.awsReko(param, photo, id, breed, person, county, date);
      }
    }
  }
  if (!req.files) {
    photo = postData[0].photo;
  }
  const storeData = await Pet.updatePostWithImage(
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
    lng,
    id
  );
  res.json({ status: "updated" });
};

const deletePost = async (req, res) => {
  // check token for delete access
  const userId = req.decoded.payload.id;
  const postId = req.query.id;
  let person = req.query.person;
  const postData = await Pet.getPostByUserAndId(userId, postId);
  console.log(postData);
  if (postData.length == 0) {
    console.log("no data");
    return res.json({ message: "noaccess" });
  }
  const deleteData = await Pet.deletePost(postId);
  console.log(deleteData);
  // delete notification and confirm post
  if (person == "finder") {
    const deleteNoti = await Notification.updateFindPetsNoti(postId);
    // update match list status to delete with fpid
    const status = "delete";
    const deleteMatch = await Match.deleteMatchListByFindPet(status, postId);
  }
  if (person == "owner") {
    const deleteNoti = await Notification.updateFindOwnersNoti(postId);
    // update match list status to delete with foid
    const status = "delete";
    const deleteMatch = await Match.deleteMatchListByFindOwner(status, postId);
  }

  res.json({ status: "deleted" });
};

module.exports = {
  uploadFindPost,
  getPetsGeoInfo,
  getFindPosts,
  getFindPostDetail,
  getExistingPostsByUser,
  getPostEditDetail,
  updatePostdata,
  deletePost,
};
