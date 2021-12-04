const db = require("../db");

const createLable = async (data) => {
  // const data = labels.map((lb) => [lb, petPostId]);
  const [labelResult] = await db.query(
    "INSERT INTO label (labels_detail, pet_post_id) VALUES ?;",
    [data]
  );
  return labelResult;
};

module.exports = {
  createLable,
};
