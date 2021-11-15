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

const storeMorePhoto = async (postId, morePhoto) => {
  const data = morePhoto.map((p) => [postId, p]);
  const [storePhotos] = await db.query(
    `INSERT INTO photos(pet_post_id, photo) VALUES ?;`,
    [data]
  );
  return storePhotos;
};

const getPhotosById = async (id) => {
  const [matchBreedPosts] = await db.query(
    `SELECT pp.id, pp.person, p.photo FROM photos as p 
    INNER JOIN pet_post as pp 
    ON pp.id = p.pet_post_id
    WHERE p.pet_post_id in (?) ;
    `,
    [id]
  );
  return matchBreedPosts;
};

const removeMorePhoto = async (postId) => {
  const [removePhotos] = await db.query(
    `DELETE FROM photos WHERE pet_post_id = ?;`,
    [postId]
  );
  return removePhotos;
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
    "SELECT p.id, p.user_id, p.kind, p.breed, p.color, p.county, p.district, p.address, p.date, p.photo, p.note, u.name, u.picture FROM pet_post as p INNER JOIN user as u ON p.user_id = u.id WHERE person= ? and status ='lost' and p.id=? ;",
    [person, id]
  );
  return PetsPosts;
};

const getAllPostsByUser = async (id) => {
  const [PetsPosts] = await db.query(
    "SELECT * FROM pet_post WHERE user_id = ? and status = 'lost' ORDER BY id DESC;",
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

const getPostByUser = async (userId, person, status) => {
  const [PetsPosts] = await db.query(
    "SELECT * FROM pet_post WHERE user_id = ? AND person= ? AND status = ? ORDER BY id DESC;",
    [userId, person, status]
  );
  return PetsPosts;
};

const getFindPostById = async (id) => {
  const [PetsPosts] = await db.query(
    "SELECT * FROM pet_post WHERE id in (?) ;",
    [id]
  );
  return PetsPosts;
};

const getPostByUserAndId = async (userId, postId) => {
  const [PetsPosts] = await db.query(
    "SELECT * FROM pet_post WHERE user_id = ? and id = ?;",
    [userId, postId]
  );
  return PetsPosts;
};

const updateFindPost = async (
  kind,
  breed,
  color,
  county,
  district,
  address,
  date,
  note,
  lat,
  lng,
  id
) => {
  const [PetsPosts] = await db.query(
    "UPDATE pet_post SET kind = ?,  breed=?, color=?, county=?, district=?, address=?, date=?, note=?, lat=?, lng=? WHERE id = ? ;",
    [kind, breed, color, county, district, address, date, note, lat, lng, id]
  );
  return PetsPosts;
};

const updatePostWithImage = async (
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
) => {
  const [PetsPosts] = await db.query(
    "UPDATE pet_post SET kind = ?,  breed=?, color=?, county=?, district=?, address=?, date=?, photo=?, note=?, lat=?, lng=? WHERE id = ? ;",
    [
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
      id,
    ]
  );
  return PetsPosts;
};

const deletePost = async (postId) => {
  const [PetsPosts] = await db.query(
    "UPDATE pet_post SET status='delete' WHERE id = ?;",
    postId
  );
  return PetsPosts;
};

const updatePostStatus = async (ids) => {
  const [PetsPosts] = await db.query(
    "UPDATE pet_post SET status='match' WHERE id in (?);",
    [ids]
  );
  return PetsPosts;
};

module.exports = {
  createPetsPost,
  storeMorePhoto,
  removeMorePhoto,
  getPhotosById,
  updatePetsPost,
  getMatchBreedPosts,
  getAllBreedsFilterPosts,
  getFilterPosts,
  getPetsPosts,
  getPostDetailById,
  getAllPostsByUser,
  getFindPetPostByUser,
  getPostByUser,
  getFindPostById,
  updateFindPost,
  updatePostWithImage,
  getPostByUserAndId,
  deletePost,
  updatePostStatus,
};
