const db = require("../db");

const getAllBreedsFilterGeo = async (person, county, district, date) => {
  const [allBreedsFilterGeo] = await db.query(
    "SELECT lat, lng, id, kind, breed, color from pet_post WHERE person=? and status ='lost' and county=? and district=? and date >= ?;",
    [person, county, district, date]
  );
  return allBreedsFilterGeo;
};

const getFilterGeo = async (person, kind, county, district, date) => {
  const [filterFindPetsGeo] = await db.query(
    "SELECT lat, lng, id, kind, breed, color from pet_post WHERE person=? and status ='lost' and kind=? and county=? and district=? and date >= ?;",
    [person, kind, county, district, date]
  );
  return filterFindPetsGeo;
};

const getAllGeo = async (person) => {
  const [findPetsGeo] = await db.query(
    "SELECT lat, lng, id, kind, breed, color from pet_post WHERE person=? and status ='lost';",
    [person]
  );
  return findPetsGeo;
};

module.exports = {
  getAllBreedsFilterGeo,
  getFilterGeo,
  getAllGeo,
};
