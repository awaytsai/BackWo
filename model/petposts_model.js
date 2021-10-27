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

module.exports = {
  createPetsPost,
  updatePetsPost,
  getMatchBreedPosts,
  getAllBreedsFilterPosts,
  getFilterPosts,
  getPetsPosts,
};
