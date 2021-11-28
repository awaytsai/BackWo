const Pet = require("../model/petposts_model");
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
  isValidDate,
} = require("../util/util");

const MAXLENGTH = parseInt(process.env.MAX_INPUT_LENGTH);

const uploadFindPost = async (req, res) => {
  const { kind, color, county, district, address, date, note } = req.body;
  const param = req.originalUrl.split("/")[2];
  let person = checkPerson(param);
  let breed = req.body.breed;
  if (!(kind && breed && color && county && district && address && date)) {
    return res.status(400).json({ message: "請填寫所有欄位" });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ message: "日期格式錯誤" });
  }
  if (note.length > MAXLENGTH) {
    return res.status(400).json({ message: "字數過多，請勿超過250字" });
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

  let morePhoto;
  if (req.files.more_photo) {
    morePhoto = req.files.more_photo.map((p) => p.key);
    await Pet.storeMorePhoto(postId, morePhoto);
  }

  if (breed == "未知") {
    // aws reko
    await awsReko.awsReko(param, photo, postId, breed, person, county, date);
    return res.status(200).json({ status: "updated" });
  }

  // check if owner post (breed/county/time) match
  if (param == "findpets") {
    return res.status(200).json({ status: "updated" });
  }
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
    const notiStauts = "created";
    const mailStatus = null;
    // create notification data (fp_id/fo_id/)
    await Notification.insertNotification(
      petPostIds,
      postId,
      notiStauts,
      mailStatus
    );
  }
  return res.status(200).json({ status: "updated" });
};

const getPetsGeoInfo = async (req, res) => {
  const { kind, county, district, date, ne, sw, tag } = req.query;
  let person = checkPerson(tag);
  // check query string w/o filter
  if (kind && county && district && date) {
    // check date format
    if (!isValidDate(date)) {
      return res.status(400).json({ message: "wrong date format" });
    }
    if (kind == "全部") {
      const geoResult = await Geo.getAllBreedsFilterGeo(
        person,
        county,
        district,
        date
      );
      getPhotoPath(geoResult, tag);
      return res.status(200).json(geoResult);
    } else {
      const geoResult = await Geo.getFilterGeo(
        person,
        kind,
        county,
        district,
        date
      );
      getPhotoPath(geoResult, tag);
      return res.status(200).json(geoResult);
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
      getPhotoPath(geoResult, tag);
      return res.status(200).json(geoResult);
    } else {
      // without filter
      const geoResult = await Geo.getAllGeo(person);
      getPhotoPath(geoResult, tag);
      return res.status(200).json(geoResult);
    }
  }
};

const getFindPosts = async (req, res) => {
  // check query string w/o filter
  const { kind, county, district, date, tag } = req.query;

  let person = checkPerson(tag);
  if (kind && county && district && date) {
    // check date format
    if (!isValidDate(date)) {
      return res.status(400).json({ message: "wrong date format" });
    }
    if (kind == "全部") {
      const postResult = await Pet.getAllBreedsFilterPosts(
        person,
        county,
        district,
        date
      );
      getPhotoPath(postResult, tag);
      return res.status(200).json(postResult);
    } else {
      const postResult = await Pet.getFilterPosts(
        person,
        kind,
        county,
        district,
        date
      );
      getPhotoPath(postResult, tag);
      return res.status(200).json(postResult);
    }
  } else {
    // without filter
    let postResult = await Pet.getPetsPosts(person);
    getPhotoPath(postResult, tag);
    return res.status(200).json(postResult);
  }
};

const getFindPostDetail = async (req, res) => {
  // check person
  const tag = req.query.tag;
  const person = checkPerson(tag);
  const id = req.query.id;
  let userId;
  const postData = await Pet.getPostDetailById(person, id);
  const morePhoto = await Pet.getPhotosById(id);
  getPhotoPath(morePhoto, tag);

  if (postData.length == 0) {
    return res.status(400).json({ message: "notexist" });
  }
  const postDetail = postData[0];
  // check if user login
  if (!req.decoded) {
    const formatData = await formatPostData(postDetail, userId, tag);
    const photoData = [];
    photoData.push(formatData.photo);
    morePhoto.map((p) => photoData.push(p.photo));
    return res.status(200).json({ formatData, photoData });
  } else {
    // yes => render with roomid/userid
    userId = req.decoded.payload.id;
    let roomId = [userId, postDetail.user_id];
    roomId.sort((a, b) => {
      return a - b;
    });
    const formatData = await formatPostData(postDetail, userId, tag);
    formatData.roomId = `${roomId[0]}-${roomId[1]}`;
    // check if chat to self
    // self post & need to log in again
    if (userId == formatData.postUserId || res.locals.message == "loginagain") {
      formatData.roomId = "null";
    }
    const photoData = [];
    photoData.push(formatData.photo);
    morePhoto.map((p) => photoData.push(p.photo));
    return res.status(200).json({ formatData, photoData });
  }
};

const getPostEditDetail = async (req, res) => {
  const param = req.query.tag;
  const person = checkPerson(param);
  const userId = req.decoded.payload.id;
  const id = req.query.id;
  const postData = await Pet.getPostDetailById(person, id);
  if (postData.length > 0) {
    const postDetail = postData[0];
    if (userId == postDetail.user_id) {
      const formatData = await formatPostData(postDetail, userId, param);
      return res.status(200).json(formatData);
    }
    return res.status(403).json({ message: "noaccess" });
  }
  return res.status(400).json({ message: "notexist" });
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
  return res.status(200).json(userPosts);
};

const updatePostdata = async (req, res) => {
  const { kind, color, county, district, address, date, note } = req.body;
  let breed = req.body.breed;
  let photo;
  let morePhoto;
  if (!(kind && breed && color && county && district && address && date)) {
    return res.status(400).json({ message: "請填寫所有欄位" });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ message: "日期格式錯誤" });
  }
  if (note.length > MAXLENGTH) {
    return res.status(400).json({ message: "字數過多，請勿超過250字" });
  }
  if (breed == "其他") {
    breed = req.body.breedName;
  }
  // check access
  const userId = req.decoded.payload.id;
  const id = req.query.id;
  const param = req.originalUrl.split("/")[2];
  const person = checkPerson(param);
  const postData = await Pet.getFindPostById(id);

  if (postData.length == 0) {
    return res.status(403).json({ message: "頁面不存在" });
  }
  if (postData[0].user_id !== userId) {
    return res.status(403).json({ message: "頁面不存在" });
  }
  // only address change => geocoding
  let lat = postData[0].lat;
  let lng = postData[0].lng;
  if (
    postData[0].county !== county ||
    postData[0].district !== district ||
    postData[0].address !== address
  ) {
    const geoCoding = await convertGeoCoding(county, district, address);
    lat = geoCoding.lat;
    lng = geoCoding.lng;
  }
  // check if upload image
  if (req.files) {
    // upload with image
    photo = req.files.photo[0].key;
    // aws reko
    if (breed == "未知") {
      await awsReko.awsReko(param, photo, id, breed, person, county, date);
    }
    if (req.files.more_photo) {
      morePhoto = req.files.more_photo.map((p) => p.key);
      await Pet.removeMorePhoto(id);
      await Pet.storeMorePhoto(id, morePhoto);
    }
    if (!req.files.more_photo) {
      await Pet.removeMorePhoto(id);
    }
  }

  if (!req.files) {
    photo = postData[0].photo;
  }
  await Pet.updatePostWithImage(
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
  return res.status(200).json({ status: "updated" });
};

const deletePost = async (req, res) => {
  // check access
  const userId = req.decoded.payload.id;
  const postId = req.query.id;
  let person = req.query.person;
  const postData = await Pet.getPostByUserAndId(userId, postId);
  if (postData.length == 0) {
    return res.status(200).json({ message: "noaccess" });
  }
  await Pet.deletePost(postId);
  // delete notification and confirm post
  if (person == "finder") {
    await Notification.updateFindPetsNoti(postId);
    // update match list status to delete with fpid
    const status = "delete";
    await Match.deleteMatchListByFindPet(status, postId);
  }
  if (person == "owner") {
    await Notification.updateFindOwnersNoti(postId);
    // update match list status to delete with foid
    const status = "delete";
    await Match.deleteMatchListByFindOwner(status, postId);
  }

  return res.status(200).json({ status: "deleted" });
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
