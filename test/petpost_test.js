const chai = require("chai");
const chaiHttp = require("chai-http");
const {
  truncateTestData,
  createFakeData,
} = require("../test/test_data_generator");
const { app } = require("../app");
const expect = chai.expect;

chai.use(chaiHttp);
const requester = chai.request(app).keepOpen();
const env = process.env.NODE_ENV;
let accessToken;

describe("update findowners post without upload image", () => {
  before(async () => {
    if (env !== "test") {
      throw "test env required";
    }
    await truncateTestData("pet_post");
    await truncateTestData("user");
    await createFakeData();

    const user = {
      email: "test@gmail.com",
      password: "test123",
    };
    const res = await requester.post("/api/member/signin").send(user);
    const data = res.body;
    accessToken = data.access_token;
  });

  it("update findowners post data", async () => {
    const postData = {
      kind: "狗",
      breed: "黃金獵犬",
      color: "白色",
      county: "台北市",
      district: "中正區",
      address: "中正路",
      date: "2021-11-11",
      note: "備註",
    };

    const res = await requester
      .put(`/api/findowners/updatePostdata?id=1&tag=findowners`)
      .set("Authorization", `Bearer ${accessToken}`)
      .type("form")
      .send(postData);

    const postExpected = {
      status: "updated",
    };

    expect(res.body).to.deep.equal(postExpected);
  });

  it("update findowners post data with wrong date format", async () => {
    const postData = {
      kind: "狗",
      breed: "黃金獵犬",
      color: "白色",
      county: "台北市",
      district: "中正區",
      address: "中正路",
      date: "2021-1111111",
      note: "備註",
    };
    const res = await requester
      .put(`/api/findowners/updatePostdata?id=1&tag=findowners`)
      .set("Authorization", `Bearer ${accessToken}`)
      .type("form")
      .send(postData);

    const postExpected = {
      message: "日期格式錯誤",
    };
    expect(res.body).to.deep.equal(postExpected);
  });

  it("update findowners post data with wrong id", async () => {
    const postData = {
      kind: "狗",
      breed: "黃金獵犬",
      color: "白色",
      county: "台北市",
      district: "中正區",
      address: "中正路",
      date: "2021-11-11",
      note: "備註",
    };
    const res = await requester
      .put(`/api/findowners/updatePostdata?id=10&tag=findowners`)
      .set("Authorization", `Bearer ${accessToken}`)
      .type("form")
      .send(postData);

    const postExpected = {
      message: "頁面不存在",
    };
    expect(res.body).to.deep.equal(postExpected);
  });
});
