const db = require("../db");

const createPetsPost = async (
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
  lat,
  lng
) => {
  const [findOwnerPost] = await db.query(
    "INSERT INTO pet_post (person, user_id, status, kind, breed, color, county, district, address, date, photo, note, lat, lng) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
    [
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
      lat,
      lng,
    ]
  );
  return findOwnerPost;
};

const updatePetsPost = async (breed, postId) => {
  const [updatePetsPost] = await db.query(
    `UPDATE pet_post SET breed= ? WHERE id = ?;`,
    [breed, postId]
  );
  return updatePetsPost;
};

const getMatchBreedPosts = async (person, breed, county, date) => {
  const [matchBreedPosts] = await db.query(
    `SELECT * FROM pet_post WHERE person =? and breed = ? and county = ? and date <= ? and status ='lost';`,
    [person, breed, county, date]
  );
  return matchBreedPosts;
};

const getAllBreedsFilterPosts = async (person, county, district, date) => {
  const [filterPosts] = await db.query(
    `SELECT * FROM pet_post WHERE person=? and county = ? and district = ? and date >= ? and status ='lost';`,
    [person, county, district, date]
  );
  return filterPosts;
};

const getFilterPosts = async (person, kind, county, district, date) => {
  const [filterPosts] = await db.query(
    `SELECT * FROM pet_post WHERE person=? and kind = ? and county = ? and district = ? and date >= ? and status ='lost' ;`,
    [person, kind, county, district, date]
  );
  return filterPosts;
};

const getPetsPosts = async (person) => {
  const [PetsPosts] = await db.query(
    "SELECT * FROM pet_post WHERE person=? and status ='lost' order by id DESC;",
    [person]
  );
  return PetsPosts;
};

const getPostDetailById = async (person, id) => {
  const [PetsPosts] = await db.query(
    "SELECT p.id, p.user_id, p.breed, p.color, p.county, p.district, p.address, p.date, p.photo, p.note, u.name, u.picture FROM pet_post as p INNER JOIN user as u ON p.user_id = u.id WHERE person= ? and status ='lost' and p.id=? ;",
    [person, id]
  );
  return PetsPosts;
};

const getAllPostsByUser = async (id) => {
  const [PetsPosts] = await db.query(
    "SELECT * FROM pet_post WHERE user_id = ? ORDER BY id DESC;",
    [id]
  );
  return PetsPosts;
};

const getFindPetPostByUser = async (userId) => {
  const [PetsPosts] = await db.query(
    "SELECT * FROM pet_post WHERE user_id = ? AND person='finder' AND status = 'lost' ORDER BY id DESC;",
    [userId]
  );
  return PetsPosts;
};

module.exports = {
  createPetsPost,
  updatePetsPost,
  getMatchBreedPosts,
  getAllBreedsFilterPosts,
  getFilterPosts,
  getPetsPosts,
  getPostDetailById,
  getAllPostsByUser,
  getFindPetPostByUser,
};
