const chat = document.querySelector(".chat");
chat.addEventListener("click", () => {
  if (!token) {
    Swal.fire({
      icon: "info",
      text: "請先登入或註冊",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/member.html";
    }, 1600);
  } else {
    getRoomData();
  }
});

async function getRoomData() {
  const response = await fetch(`/api/userchatroom`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + token,
    },
  });
  const latestRoomId = await response.json();

  if (
    latestRoomId.message == "請先登入或註冊" ||
    latestRoomId.message == "請重新登入"
  ) {
    Swal.fire({
      icon: "info",
      text: "請先登入或註冊",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/member.html";
    }, 1600);
  }
  if (latestRoomId.message == "noExistingRoom") {
    window.location.href = `/chatroom.html?room=0`;
  }
  if (latestRoomId.room_id) {
    window.location.href = `/chatroom.html?room=${latestRoomId.room_id}`;
  }
}
