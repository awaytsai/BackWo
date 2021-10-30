const token = localStorage.getItem("access_token");
const chatform = document.getElementById("chatform");
const input = document.getElementById("chatinput");
const messages = document.getElementById("messages");
let self;

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
      self = usersData.senderId;
      connectToIo(usersData);
    }
  } catch (err) {
    // catch error, you dont have access
    console.log(err);
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

  // // on message(connect/disconnect)
  socket.on("online", (msg) => {
    statusUpdate(msg);
  });
  socket.on("leave", (msg) => {
    statusUpdate(msg);
  });

  // on chatnessage(chat)
  socket.on("chatMessage", function (msg, usersData) {
    createChatMessage(msg, usersData);
  });
  // history message
  socket.on("historymessage", function (historyMessage) {
    createHistoryMessage(historyMessage);
  });
}

function createChatMessage(msg, usersData) {
  const item = document.createElement("div");
  if (usersData.senderId != self) {
    // item.textContent = `${msg.username} says: ${msg.text} on${msg.time} `;
    item.innerHTML = `
    <div>
      <div class="message-sender">
        <img class="memberpic" src="${usersData.senderPicture}">
        <span>${usersData.senderName}</span>
      </div>
      <div class="message-content">${msg}</div>
    </div>`;
    item.className = "receive";
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  } else {
    item.textContent = `${msg}`;
    item.className = "send";
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    // messages.scrollTo(0, document.body.scrollHeight);
  }
}

function statusUpdate(msg) {
  const item = document.createElement("div");
  item.innerHTML = `<div>${msg}</div>`;
  messages.appendChild(item);
}

function createHistoryMessage(historyMessage) {
  historyMessage.map((message) => {
    const item = document.createElement("div");
    item.innerHTML = `<div>${message.message}</div>`;
    messages.appendChild(item);
  });
}
