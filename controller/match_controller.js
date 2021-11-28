const Pet = require("../model/petposts_model");
const { formatPostData } = require("../util/util");
const Match = require("../model/match_model");
const User = require("../model/user_model");
const Noti = require("../model/notification_model");

const getMatchPostDetail = async (req, res) => {
  const userId = req.decoded.payload.id;
  const person = "owner";
  const id = req.query.id;
  let param = "findowners";
  // get match post detail
  const postData = await Pet.getPostDetailById(person, id);
  const postDetail = postData[0];
  const formatData = await formatPostData(postDetail, userId, param);

  // get user history post
  const historyResult = await Pet.getFindPetPostByUser(userId);
  let historyData;
  if (historyResult.length == 0) {
    historyData = "nodata";
    return res.json({ formatData, historyData });
  }
  historyData = [];
  param = "findpets";
  for (let i = 0; i < historyResult.length; i++) {
    let post = await formatPostData(historyResult[i], userId, param);
    post.status = "lost";
    historyData.push(post);
  }
  return res.json({ formatData, historyData });
};

const storeMatchList = async (req, res) => {
  const userId = req.decoded.payload.id;
  let { foid, fpid } = req.query;
  const message = req.body.thankmessage;
  const matchStatus = "pending";
  // with find pets post
  if (fpid != 0) {
    // check access
    const postData = await Pet.getFindPetPostByUser(userId);
    if (postData.length == 0) {
      return res.json({ message: "noaccess" });
    }
    if (postData.length > 0) {
      const result = postData.filter((post) => post.id == fpid);
      if (result.length == 0) {
        return res.json({ message: "noaccess" });
      }
      if (result.length > 0) {
        const updateTime = null;
        await Match.createMatchList(
          message,
          userId,
          foid,
          matchStatus,
          fpid,
          updateTime
        );
      }
    }
  }
  // without find pets post
  if (fpid == 0) {
    const updateTime = null;
    await Match.createMatchListNoPetPost(
      message,
      userId,
      foid,
      matchStatus,
      updateTime
    );
  }
  return res.json({ status: "updated" });
};

const getConfirmPost = async (req, res) => {
  const userId = req.decoded.payload.id;
  const person = "owner";
  const petStatus = "lost";
  const findOwnersPostData = await Pet.getPostByUser(userId, person, petStatus);
  if (findOwnersPostData.length == 0) {
    return res.json({ message: "nodata" });
  }
  // get all confirm post sender data
  const findOwnerIds = [];
  findOwnersPostData.map((post) => {
    findOwnerIds.push(post.id);
  });
  const userData = await User.getConfirmPostUserData(findOwnerIds);
  if (userData.length == 0) {
    return res.json({ message: "nodata" });
  }
  // get all find pet post
  const findPetIds = [];
  userData.map((data) => {
    findPetIds.push(data.find_pet_id);
  });
  let filterId = findPetIds.filter((id) => id !== null);
  // without find pet post
  if (filterId.length == 0 && findPetIds.includes(null)) {
    return res.json({ userData });
  }
  // with find pet post
  const petData = await Pet.getFindPostById(filterId);
  console.log(petData);
  petData.map((data) => {
    for (i = 0; i < userData.length; i++) {
      if (userData[i].find_pet_id == data.id) {
        userData[
          i
        ].petPhoto = `${process.env.CLOUDFRONT}/findpets/${data.photo}`;
      }
    }
  });
  return res.json({ userData });
};

const updateConfirmPost = async (req, res) => {
  // check access
  // add update time
  const updateTime = new Date();
  const { status, id } = req.body;
  await Match.updateMatchList(status, updateTime, id);

  const matchResult = await Match.getMatchById(id);

  if (matchResult.length > 0) {
    // update pet posts to match
    const ids = [matchResult[0].find_pet_id, matchResult[0].find_owner_id];
    await Pet.updatePostStatus(ids);

    // update notification to match
    const status = "match";
    await Noti.updateNotification(
      status,
      matchResult[0].find_owner_id,
      matchResult[0].find_pet_id
    );
  }

  return res.json({ status: "updated" });
};

const getSuccessCase = async (req, res) => {
  const limitSuccessCase = parseInt(process.env.LIMIT_SUCCESS_CASE);
  const matchData = await Match.getSuccessCase(limitSuccessCase);
  matchData.map((data) => {
    data.photo = `${process.env.CLOUDFRONT}/findowners/${data.photo}`;
  });
  return res.json(matchData);
};

module.exports = {
  getMatchPostDetail,
  storeMatchList,
  getConfirmPost,
  updateConfirmPost,
  getSuccessCase,
};
