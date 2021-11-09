const Pet = require("../model/petposts_model");
const { formatPostData } = require("../util/util");
const Match = require("../model/match_model");
const User = require("../model/user_model");
const Noti = require("../model/notification_model");

const getMatchPostDetail = async (req, res) => {
  const userId = req.decoded.payload.id;
  const person = "owner";
  const id = req.query.id;
  // get post detail
  const postData = await Pet.getPostDetailById(person, id);
  const postDetail = postData[0];
  const formatData = await formatPostData(postDetail, userId, "findowners");

  // user's existing post
  const historyResult = await Pet.getFindPetPostByUser(userId);
  console.log(historyResult);
  let historyData;
  if (historyResult.length == 0) {
    historyData = "nodata";
    return res.json({ formatData, historyData });
  }
  historyData = [];
  for (let i = 0; i < historyResult.length; i++) {
    let post = await formatPostData(historyResult[i], userId, "findpets");
    post.status = "lost";
    historyData.push(post);
  }
  res.json({ formatData, historyData });
};

const storeMatchList = async (req, res) => {
  // ?foid=${id}&fpid=${fpid}
  const senderId = req.decoded.payload.id;
  let { foid, fpid } = req.query;
  const message = req.body.thankmessage;
  const status = "pending";
  console.log(senderId, foid, fpid);
  if (fpid != 0) {
    // check if sender has those fp post
    const postData = await Pet.getFindPetPostByUser(senderId);
    if (postData.length == 0) {
      return res.json({ message: "noaccess" });
    }
    if (postData.length > 0) {
      const result = postData.filter((post) => post.id == fpid);
      if (result.length == 0) {
        return res.json({ message: "noaccess" });
      }
      if (result.length > 0) {
        const storeResult = await Match.storeMatchList(
          message,
          senderId,
          foid,
          status,
          fpid
        );
      }
    }
  }
  if (fpid == 0) {
    const storeResult = await Match.storeMatchListNoFP(
      message,
      senderId,
      foid,
      status
    );
    console.log(storeResult);
  }
  res.json({ status: "updated" });
};

const getConfirmPost = async (req, res) => {
  const userId = req.decoded.payload.id;
  const postData = await Pet.getPostByUser(userId, "owner", "lost");
  // no owner post => no need to confirm
  if (postData.length == 0) {
    return res.json({ message: "nodata" });
  }
  // get all sender id for user info
  const ids = [];
  postData.map((post) => {
    ids.push(post.id);
  });
  const userData = await User.getPendingUserData(ids);
  if (userData.length == 0) {
    return res.json({ message: "nodata" });
  }

  const findPetIds = [];
  userData.map((data) => {
    findPetIds.push(data.find_pet_id);
  });
  let filterId = findPetIds.filter((id) => id !== null);
  if (filterId.length == 0) {
    if (findPetIds.includes(null)) {
      console.log("only null");
      return res.json({ userData });
    }
  }

  const petData = await Pet.getFindPostById(filterId);
  // combine user & match & post data
  petData.map((data) => {
    for (i = 0; i < userData.length; i++) {
      if (userData[i].find_pet_id == data.id) {
        userData[
          i
        ].petPhoto = `${process.env.CLOUDFRONT}/findpets/${data.photo}`;
      }
    }
  });
  console.log(userData);
  return res.json({ userData });
};

const updateConfirmPost = async (req, res) => {
  console.log(req.body);
  // check access
  const { status, id } = req.body;
  const updateConfirm = await Match.updateMatchList(status, id);
  console.log("updateConfirm");
  console.log(updateConfirm);

  const matchResult = await Match.getMatchById(id);
  console.log("matchResult");
  console.log(matchResult);
  if (matchResult.length > 0) {
    // update pet posts to match
    const ids = [matchResult[0].find_pet_id, matchResult[0].find_owner_id];
    const updateResult = await Pet.updatePostStatus(ids);
    console.log("updateResult");
    console.log(updateResult);
    // update notification to match
    const status = "match";
    const updateNoti = await Noti.updateNotification(
      status,
      matchResult[0].find_owner_id,
      matchResult[0].find_pet_id
    );
  }

  return res.json({ status: "updated" });
};

const getSuccessCase = async (req, res) => {
  const limit = 3;
  const MatchData = await Match.getSuccessCase(limit);
  console.log(MatchData);
  let postIds = [];
  let userIds = [];
  MatchData.map((data) => {
    postIds.push(data.find_owner_id);
    userIds.push(data.sender);
  });
  console.log(postIds, userIds);
  res.json(MatchData);
};

module.exports = {
  getMatchPostDetail,
  storeMatchList,
  getConfirmPost,
  updateConfirmPost,
  getSuccessCase,
};
