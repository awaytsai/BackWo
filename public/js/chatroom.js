const token = localStorage.getItem("access_token");
const chatform = document.querySelector("#chatform");
const input = document.querySelector("#chatinput");
const messages = document.querySelector("#messages");
const rooms = document.querySelector(".rooms");

let self;

// default scroll down
window.scrollTo(0, document.querySelector(".messages").scrollHeight);

//get query string
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const roomId = params.room;

// check access (frontent)
// if (roomId == "null") {
//   Swal.fire({
//     icon: "info",
//     title: "請重新登入",
//     showConfirmButton: false,
//     timer: 1500,
//   });
//   setTimeout(() => {
//     window.location.href = "/member.html";
//   }, 1600);
// } else if (!roomId) {
//   Swal.fire({
//     icon: "info",
//     title: "請先登入或註冊",
//     showConfirmButton: false,
//     timer: 1500,
//   });
//   setTimeout(() => {
//     window.location.href = "/member.html";
//   }, 1600);
// } else {
//
// }

checkAccess();
// check access (backend)
async function checkAccess() {
  try {
    const response = await fetch(`/api/chat?room=${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const usersData = await response.json();
    console.log(usersData);
    if (
      usersData.message == "請重新登入" ||
      usersData.message == "請先登入或註冊"
    ) {
      Swal.fire({
        icon: "info",
        title: "請先登入或註冊",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => {
        window.location.href = "/member.html";
      }, 1600);
    } else if (usersData.message == "noaccess") {
      Swal.fire({
        icon: "info",
        title: "no access",
        showConfirmButton: false,
        timer: 1000,
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } else {
      // get history data by roomid
      // const historyData = getExistingRooms(usersData);
      // self = usersData.senderId;
      // connectToIo(usersData);
      // if (!historyData.message) {
      //   createExistingRooms(historyData);
      // }
      showandconnect(usersData);
    }
  } catch (err) {
    console.log(err);
  }
}

///////
async function showandconnect(usersData) {
  const historyData = await getExistingRooms(usersData);
  self = usersData.senderId;
  connectToIo(usersData);
  //
  if (!historyData.message) {
    createExistingRooms(historyData);
  }
}

function connectToIo(usersData) {
  var socket = io();
  // send userid, roomid to server
  socket.emit("joinroom", usersData);

  // listen on message
  chatform.addEventListener("submit", function (e) {
    e.preventDefault();
    let msg = input.value;
    if (msg) {
      socket.emit("chatMessage", msg, usersData);
      input.value = "";
    }
  });
  // on chatnessage(chat)
  socket.on("chatMessage", function (msg, usersData) {
    createChatMessage(msg, usersData);
  });
  // history message
  socket.on("historymessage", function (historyMessage, usersData) {
    createHistoryMessage(historyMessage, usersData);
  });
}

// fetch for render existing rooms
async function getExistingRooms(usersData) {
  const historyResponse = await fetch(
    `/api/chatroomrecord?uid=${usersData.senderId}`
  );
  const historyData = await historyResponse.json();
  console.log(historyData);
  return historyData;
}

function createChatMessage(msg, usersData) {
  const item = document.createElement("div");
  if (usersData.senderId != self) {
    // item.textContent = `${msg.username} says: ${msg.text} on${msg.time} `;
    item.innerHTML = `
      <div class="message-sender">
        <img class="memberpic" src="${usersData.senderPicture}">
        <span>${usersData.senderName}</span>
      </div>
      <div class="message-content">
        <p>${msg}</p>
      </div>
      <div class="message-time">
        <p></p>
      </div>`;
    item.classList.add("receive", "message-box");
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  } else {
    // item.textContent = `${msg}`;
    item.innerHTML = `
      <div class="message-content">
        <p>${msg}</p>
      </div>
      <div class="message-time">
        <p></p>
      </div>`;
    item.classList.add("send", "message-box");
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }
}

function createHistoryMessage(historyMessage, usersData) {
  historyMessage.reverse().map((message) => {
    const item = document.createElement("div");
    item.classList.add("history-message", "message-box");
    // const time = message.time.toLocaleString("en-US", {
    //   timezone: "Asia/Taipei",
    // });
    const time = message.time.toString().split("T")[1].slice(0, 5);
    if (message.sender == self) {
      // print self message(send class)
      item.innerHTML = `
      <div class="message-content">
        <p>${message.message}</p>
      </div>
      <div class="message-time">
        <p>${time}</p>
      </div>`;
      item.classList.add("send");
      messages.appendChild(item);
    } else {
      // prinet others message(receive class)
      item.innerHTML = `
      <div class="message-sender">
        <img class="memberpic" src="${usersData.receiverPicture}">
        <span>${usersData.receiverName}</span>
      </div>
      <div class="message-content">
        <p>${message.message}</p>
      </div>
      <div class="message-time">
        <p>${time}</p>
      </div>`;
      item.classList.add("receive");
      messages.appendChild(item);
    }
  });
}

function createExistingRooms(historyData) {
  console.log(historyData);
  historyData.map((data) => {
    const time = data[0].time.toString().split("T")[1].slice(0, 5);
    const item = document.createElement("div");
    item.innerHTML = `<div class="room">
      <div class="room-user">
        <img src="${data[0].picture}" width="30px" />
        <p>${data[0].name}</p>
      </div>
      <div class="room-content">
        <p class="room-message">${data[0].message}</p>
        <p class="room-time">${time}</p>
      </div>
      </div>
    </div>`;
    rooms.appendChild(item);
  });
}
