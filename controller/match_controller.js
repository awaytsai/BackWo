const Pet = require("../model/petposts_model");

const getMatchPostDetail = async (req, res) => {
  const userId = req.decoded.payload.id;
  const person = "owner";
  const id = req.query.id;
  // get post detail
  const postData = await Pet.getPostDetailById(person, id);
  const postDetail = postData[0];
  const date = postDetail.date.toISOString().split("T")[0];
  // user's existing post
  const historyPost = await Pet.getFindPetPostByUser(userId);
  //   const formatData = {
  //     postDetail,
  //     historyPost,
  //   };

  const formatData = {
    id: postDetail.id,
    breed: postDetail.breed,
    color: postDetail.color,
    address: `${postDetail.county}${postDetail.district}${postDetail.address}`,
    date: date,
    note: postDetail.note,
    photo: `${process.env.CLOUDFRONT}/findowners/${postDetail.photo}`,
    postUserId: postDetail.user_id,
    postUserName: postDetail.name,
    postUserPic: postDetail.picture,
  };
  console.log(formatData);
  res.json({ formatData, historyPost });
};

module.exports = {
  getMatchPostDetail,
};
