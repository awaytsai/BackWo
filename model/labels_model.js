const db = require("../db");

const storeLable = async (labels, petPostId) => {
  const [labelResult] = await db.query(
    "INSERT INTO label (labels_detail, pet_post_id) VALUES (?,?);",
    [labels, petPostId]
  );
  return labelResult;
};

module.exports = {
  storeLable,
};
