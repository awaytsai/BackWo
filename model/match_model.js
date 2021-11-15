const db = require("../db");

const storeMatchList = async (
  message,
  userId,
  foid,
  status,
  fpid,
  updateTime
) => {
  const [matchResult] = await db.query(
    "INSERT INTO match_list (thank_message, sender, find_owner_id, status, find_pet_id, update_time) VALUES (?,?,?,?,?,?);",
    [message, userId, foid, status, fpid, updateTime]
  );
  return matchResult;
};

const storeMatchListNoFP = async (
  message,
  userId,
  foid,
  status,
  updateTime
) => {
  const [matchResult] = await db.query(
    "INSERT INTO match_list (thank_message, sender, find_owner_id, status, update_time) VALUES (?,?,?,?,?);",
    [message, userId, foid, status, updateTime]
  );
  return matchResult;
};

const getMatchList = async (id, status) => {
  const [matchResult] = await db.query(
    `SELECT * FROM match_list WHERE find_owner_id = ? AND status = ? ;`,
    [id, status]
  );
  return matchResult;
};

const updateMatchList = async (status, updateTime, id) => {
  const [matchResult] = await db.query(
    `UPDATE match_list SET status = ? , update_time=? WHERE id = ? ;`,
    [status, updateTime, id]
  );
  return matchResult;
};

const deleteMatchListByFindPet = async (status, id) => {
  const [matchResult] = await db.query(
    `UPDATE match_list SET status = ? WHERE find_pet_id = ? ;`,
    [status, id]
  );
  return matchResult;
};

const deleteMatchListByFindOwner = async (status, id) => {
  const [matchResult] = await db.query(
    "UPDATE match_list SET status = ? WHERE find_owner_id = ? ;",
    [status, id]
  );
  return matchResult;
};

const getSuccessCase = async (limit) => {
  const [matchResult] = await db.query(
    `SELECT m.thank_message, m.sender, m.find_owner_id, m.update_time, u.name, u.picture, p.photo FROM 
    (SELECT thank_message, sender, find_owner_id, update_time FROM match_list 
    WHERE status ='match' ORDER BY update_time DESC LIMIT ? ) AS m 
    INNER JOIN user AS u 
    ON m.sender = u.id
    INNER JOIN pet_post AS p
    ON m.find_owner_id= p.id 
    ;`,
    [limit]
  );
  return matchResult;
};

const getMatchById = async (id) => {
  const [matchResult] = await db.query(
    "SELECT * FROM match_list WHERE id = ? AND status = 'match' ;",
    [id]
  );
  return matchResult;
};

module.exports = {
  storeMatchList,
  storeMatchListNoFP,
  getMatchList,
  updateMatchList,
  deleteMatchListByFindPet,
  deleteMatchListByFindOwner,
  getSuccessCase,
  getMatchById,
};
