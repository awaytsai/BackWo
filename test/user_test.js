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

describe("user signup", () => {
  before(async () => {
    if (env !== "test") {
      throw "test env required";
    }
    await truncateTestData("user");
    await createFakeData();
  });

  it("native sign up", async () => {
    const user = {
      name: "test",
      email: "test1@gmail.com",
      password: "000000",
    };

    const res = await requester.post("/api/member/signup").send(user);
    const data = res.body;

    const userExpected = {
      id: data.user.id,
      name: user.name,
      email: user.email,
      provider: "native",
      picture: "https://d3271x2nhsfyjz.cloudfront.net/member_default_image.png",
    };

    expect(data.user).to.deep.equal(userExpected);
  });

  it("signup without name or email or password", async () => {
    // no name
    const user1 = {
      email: "aaaa@gmail.com",
      password: "aaaaaa",
    };
    const res1 = await requester.post("/api/member/signup").send(user1);

    expect(res1.body.error).to.equal("請輸入名字、email 和密碼");

    // no email
    const user2 = {
      name: "Away Tsai",
      password: "aaaaaa",
    };
    const res2 = await requester.post("/api/member/signup").send(user2);

    expect(res2.body.error).to.equal("請輸入名字、email 和密碼");

    // no password
    const user3 = {
      name: "Away Tsai",
      email: "aaaa@gmail.com",
    };
    const res3 = await requester.post("/api/member/signup").send(user3);

    expect(res3.body.error).to.equal("請輸入名字、email 和密碼");
  });

  it("sign up with wrong email format", async () => {
    // wrong email validate
    const user4 = {
      name: "Away Tsai",
      email: "aaaagmail.com",
      password: "aaaaaa",
    };
    const res4 = await requester.post("/api/member/signup").send(user4);

    expect(res4.body.error).to.equal("請輸入正確的 email");
  });

  it("sign up with wrong password length", async () => {
    // wrong password length
    const user5 = {
      name: "Away Tsai",
      email: "aaaa@gmail.com",
      password: "aaa",
    };
    const res5 = await requester.post("/api/member/signup").send(user5);

    expect(res5.body.error).to.equal("請輸入至少6位數密碼");
  });

  it("sign up with existed email", async () => {
    // existed email
    const user6 = {
      name: "aaa",
      email: "test@gmail.com",
      password: "000000",
    };
    const res6 = await requester.post("/api/member/signup").send(user6);

    expect(res6.body.error).to.equal("email 已經被註冊過，請更換");
  });
});
