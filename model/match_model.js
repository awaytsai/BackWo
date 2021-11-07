const db = require("../db");

const storeMatchList = async (message, userId, foid, status, fpid) => {
  const [matchResult] = await db.query(
    "INSERT INTO match_list (thank_message, sender, find_owner_id, status, find_pet_id) VALUES (?,?,?,?,?);",
    [message, userId, foid, status, fpid]
  );
  return matchResult;
};

const storeMatchListNoFP = async (message, userId, foid, status) => {
  const [matchResult] = await db.query(
    "INSERT INTO match_list (thank_message, sender, find_owner_id, status) VALUES (?,?,?,?);",
    [message, userId, foid, status]
  );
  return matchResult;
};

const getMatchList = async (id, status) => {
  const [matchResult] = await db.query(
    "SELECT * FROM match_list WHERE find_owner_id = ? AND status = ? ;",
    [id, status]
  );
  return matchResult;
};

const updateMatchList = async (status, id) => {
  const [matchResult] = await db.query(
    "UPDATE match_list SET status = ? WHERE id = ? ;",
    [status, id]
  );
  return matchResult;
};

module.exports = {
  storeMatchList,
  storeMatchListNoFP,
  getMatchList,
  updateMatchList,
};
