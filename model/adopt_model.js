const db = require("../db");

const truncateAdoptData = async () => {
  const [adoptResult] = await db.query("TRUNCATE TABLE adopt ;");
  return adoptResult;
};

const updateAdoptData = async (adoptData) => {
  const data = adoptData.map((p) => [
    p.animal_id,
    p.animal_subid,
    p.animal_place,
    p.animal_kind,
    p.animal_sex,
    p.animal_colour,
    p.animal_foundplace,
    p.animal_status,
    p.animal_update,
    p.animal_createtime,
    p.shelter_name,
    p.album_file,
    p.shelter_address,
    p.link,
    p.region,
  ]);
  const [adoptResult] = await db.query(
    `INSERT INTO adopt (animal_id, animal_subid, animal_place, animal_kind, animal_sex, 
        animal_colour, animal_foundplace, animal_status, animal_update, animal_createtime, 
        shelter_name, album_file, shelter_address, link , region) VALUES ?;`,
    [data]
  );
  return adoptResult;
};

const getAllAdoptData = async (limit, offset) => {
  const [adoptResult] = await db.query(
    "SELECT * FROM adopt ORDER BY id ASC LIMIT ? OFFSET ? ; ",
    [limit, offset]
  );
  return adoptResult;
};

const countAdoptData = async () => {
  const [adoptResult] = await db.query("SELECT count(*) AS count FROM adopt ;");
  return adoptResult;
};

const getFilterAdoptData = async (kind, region, shelter, limit, offset) => {
  const [adoptResult] = await db.query(
    "SELECT * FROM adopt WHERE animal_kind in (?) and region = ? and animal_place = ? ORDER BY id ASC LIMIT ? OFFSET ? ; ",
    [kind, region, shelter, limit, offset]
  );
  return adoptResult;
};

const countAdoptDataByFilter = async (kind, region, shelter) => {
  const [adoptResult] = await db.query(
    "SELECT count(*) AS count FROM adopt WHERE animal_kind in (?) and region = ? and animal_place = ? ;",
    [kind, region, shelter]
  );
  return adoptResult;
};

const getRegionAdoptData = async (kind, region, limit, offset) => {
  const [adoptResult] = await db.query(
    "SELECT * FROM adopt WHERE animal_kind in (?) and region = ? ORDER BY id ASC LIMIT ? OFFSET ? ; ",
    [kind, region, limit, offset]
  );
  return adoptResult;
};

const countAdoptDataByRegion = async (kind, region, shelter) => {
  const [adoptResult] = await db.query(
    "SELECT count(*) AS count FROM adopt WHERE animal_kind in (?) and region = ? ;",
    [kind, region, shelter]
  );
  return adoptResult;
};

module.exports = {
  truncateAdoptData,
  updateAdoptData,
  getAllAdoptData,
  countAdoptData,
  getFilterAdoptData,
  countAdoptDataByFilter,
  getRegionAdoptData,
  countAdoptDataByRegion,
};
