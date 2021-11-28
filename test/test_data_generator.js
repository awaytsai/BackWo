const db = require("../db");

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

module.exports = {
  truncateTestData,
};
