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

module.exports = {
  truncateTestData,
  createFakeData,
};
