const db = require("../db");
const crypto = require("crypto");

async function truncateTestData() {
  if (process.env.NODE_ENV !== "test") {
    console.log("test env required");
    return;
  }

  const truncateTestTable = async (table) => {
    const conn = await db.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
    await conn.query("COMMIT");
    await conn.release();
    return;
  };
  const tables = [
    "chat",
    "label",
    "photos",
    "notification",
    "match_list",
    "user",
    "pet_post",
  ];
  for (let table of tables) {
    await truncateTestTable(table);
  }
  return;
}

async function createFakeData() {
  if (process.env.NODE_ENV !== "test") {
    console.log("test env required");
    return;
  }

  const conn = await db.getConnection();
  await conn.query("START TRANSACTION");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  await createFakeUser(conn);
  await createFakePetpost(conn);
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await conn.query("COMMIT");
  await conn.release();
}

async function createFakeUser(conn) {
  const hashPassword = crypto
    .createHash("sha256")
    .update("test123")
    .digest("hex");
  const fakeUser = {
    provider: "native",
    name: "test",
    email: "test@gmail.com",
    password: hashPassword,
    picture: `${process.env.CLOUDFRONT}/member_default_image.png`,
  };

  return await conn.query(
    "INSERT INTO user(provider, name, email, password, picture) VALUES (?,?,?,?,?) ;",
    Object.values(fakeUser)
  );
}

async function createFakePetpost(conn) {
  const fakePetpost = {
    person: "owner",
    user_id: "1",
    status: "lost",
    kind: "狗",
    breed: "黃金獵犬",
    color: "黃色",
    county: "臺北市",
    district: "中正區",
    address: "中正路",
    date: "2021-11-01 00:00:00",
    photo: "golden.jpeg-1638106960308",
    note: "",
    lat: "25.0919088",
    lng: "121.5180051",
  };

  return await conn.query(
    `INSERT INTO pet_post (person, user_id, status, kind, breed, color, county, district, address, date, photo, note, lat, lng)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);`,
    Object.values(fakePetpost)
  );
}

module.exports = {
  truncateTestData,
  createFakeData,
};
