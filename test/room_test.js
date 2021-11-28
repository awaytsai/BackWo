const expect = require("chai").expect;
const { getOtherUserId } = require("../util/util");

const existingIds = [
  { room_id: "3-4" },
  { room_id: "3-13" },
  { room_id: "2-3" },
  { room_id: "3-14" },
  { room_id: "3-21" },
];
const userId = 3;

const existingIdsExpected = [
  { room_id: "3-4", othersId: "4" },
  { room_id: "3-13", othersId: "13" },
  { room_id: "2-3", othersId: "2" },
  { room_id: "3-14", othersId: "14" },
  { room_id: "3-21", othersId: "21" },
];

// Test suite
describe("checkRoomAndUserIds", () => {
  // Test spec
  it("should return roomid and other user id", () => {
    expect(getOtherUserId(existingIds, userId)).to.eql(existingIdsExpected);
  });
});
