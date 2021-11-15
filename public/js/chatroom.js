const token = localStorage.getItem("access_token");
const chatform = document.querySelector("#chatform");
const input = document.querySelector("#chatinput");
const messages = document.querySelector("#messages");
const rooms = document.querySelector(".rooms");

let self;

//get query string
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const roomId = params.room;

// check access (frontent)
if (roomId == "null") {
  Swal.fire({
    icon: "info",
    title: "請重新登入",
    showConfirmButton: false,
    timer: 1500,
  });
  setTimeout(() => {
    window.location.href = "/member.html";
  }, 1600);
}
if (!roomId) {
  Swal.fire({
    icon: "info",
    title: "請先登入或註冊",
    showConfirmButton: false,
    timer: 1500,
  });
  setTimeout(() => {
    window.location.href = "/member.html";
  }, 1600);
}
if (roomId == "0") {
  createBlankElement();
} else {
  checkAccess();
}

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
    self = usersData.senderId;
    console.log(usersData);
    if (usersData.message == "blankroom") {
      console.log("blankroom");
      createBlankElement();
    } else if (
      usersData.message == "請重新登入" ||
      usersData.message == "請先登入或註冊"
    ) {
      // token expire or not login
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
      // userid not in room ids
      Swal.fire({
        icon: "info",
        title: "此頁面不存在",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1600);
    } else {
      // ok
      showRoomsAndConnectIO(usersData);
    }
  } catch (err) {
    console.log(err);
  }
}

async function showRoomsAndConnectIO(usersData) {
  // get existing room data
  const historyData = await getExistingRoomsRecord(usersData);
  // connect socket io
  connectToIo(usersData);
  console.log(historyData);
  // show history room info
  if (historyData.error) {
    const item = document.createElement("div");
    item.textContent = `沒有聊天記錄`;
    item.className = "nochat";
    rooms.appendChild(item);
  } else {
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
async function getExistingRoomsRecord(usersData) {
  const historyResponse = await fetch(
    `/api/chatroomrecord?uid=${usersData.senderId}`
  );
  const historyData = await historyResponse.json();
  console.log(historyData);
  return historyData;
}

function createChatMessage(msg, usersData) {
  let time = new Date();
  time = time.toLocaleString("en-US").split(", ")[1];
  const ampm = time.slice(-3);
  time = time.split(" ")[0].slice(0, -3);
  console.log(time);
  const item = document.createElement("div");
  // check who said the message
  if (usersData.senderId != self) {
    item.innerHTML = `
      <div class="message-content receive">
        <p>${msg}</p>
      </div>
      <div class="message-time-receive">
        <p>${time} ${ampm}</p>
      </div>`;
    item.classList.add("message-box");
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  } else {
    item.innerHTML = `
      <div class="message-content send">
        <p>${msg}</p>
      </div>
      <div class="message-time-send">
        <p>${time} ${ampm}</p>
      </div>`;
    item.classList.add("message-box");
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }
}

function createHistoryMessage(historyMessage, usersData) {
  console.log(historyMessage);
  createReceiverInfo(usersData);
  if (historyMessage.length == 0) {
  }
  historyMessage.reverse().map((message) => {
    const wrapitem = document.createElement("div");
    wrapitem.classList.add("history-message");
    const messageBox = document.createElement("div");
    messageBox.classList.add("message-box");
    const messageTime = document.createElement("div");

    let time = new Date(Date.parse(message.time))
      .toLocaleString("en-US")
      .split(", ")[1];
    const ampm = time.slice(-3);
    time = time.split(" ")[0].slice(0, -3);

    if (message.sender == self) {
      // print self message(send class)
      messageBox.innerHTML = `
      <div class="message-content send">
        <p>${message.message}</p>
      </div>`;
      messageTime.className = "message-time-send";
      messageTime.innerHTML = `<p>${time} ${ampm}</p>`;
      // messageBox.classList.add("send");

      messages.appendChild(wrapitem);
      wrapitem.appendChild(messageBox);
      wrapitem.appendChild(messageTime);
      messages.scrollTop = messages.scrollHeight;

      // const item = document.createElement("div");
      // item.classList.add("history-message", "message-box");
      // let time = new Date(Date.parse(message.time))
      //   .toLocaleString("en-US")
      //   .split(", ")[1];
      // const ampm = time.slice(-3);
      // time = time.split(" ")[0].slice(0, -3);
      // if (message.sender == self) {
      //   // print self message(send class)
      //   item.innerHTML = `
      //   <div class="message-content">
      //     <p>${message.message}</p>
      //   </div>
      //   <div class="message-time">
      //     <p>${time} ${ampm}</p>
      //   </div>`;
      //   item.classList.add("send");
      //   messages.appendChild(item);
      //   messages.scrollTop = messages.scrollHeight;
    } else {
      // const userBox = document.createElement("div");
      // userBox.className = "message-sender receive";
      // userBox.innerHTML = `
      // <img class="memberpic" src="${usersData.receiverPicture}">
      // <div>${usersData.receiverName}</div>`;
      messageBox.innerHTML = `
      <div class="message-content receive">
      <p>${message.message}</p>
      </div>`;
      messageTime.innerHTML = `<p>${time} ${ampm}</p>`;
      messageTime.className = "message-time-receive";

      messages.appendChild(wrapitem);
      // wrapitem.appendChild(userBox);
      wrapitem.appendChild(messageBox);
      wrapitem.appendChild(messageTime);
      messages.scrollTop = messages.scrollHeight;

      // prinet others message(receive class)
      // item.innerHTML = `
      // <div class="message-sender">
      //   <img class="memberpic" src="${usersData.receiverPicture}">
      //   <span>${usersData.receiverName}</span>
      // </div>
      // <div class="message-content">
      //   <p>${message.message}</p>
      // </div>
      // <div class="message-time">
      //   <p>${time} ${ampm}</p>
      // </div>`;
      // item.classList.add("receive");
      // messages.appendChild(item);
      // messages.scrollTop = messages.scrollHeight;
    }
  });
}

function createExistingRooms(historyData) {
  historyData.map((data) => {
    console.log(data);
    let time = new Date(Date.parse(data[0].time))
      .toLocaleString("en-US")
      .split(", ");
    const date = time[0];
    const ampm = time[1].slice(-3);
    time = time[1].split(" ")[0].slice(0, -3);
    const item = document.createElement("div");
    item.className = "room";
    item.innerHTML = `
      <a class="room-a" href="/chatroom.html?room=${data[0].room_id}">
        <div class="room-user">
          <img src="${data[0].picture}" width="30px" />
          <p>${data[0].name}</p>
        </div>
        <div class="room-content">
          <p class="room-message">${data[0].message}</p>
          <p class="room-time">${date} ${time} ${ampm}</p>
        </div>
      </a>`;
    rooms.appendChild(item);
  });
  checkFocusRoom();
}

const chatArea = document.querySelector(".chat-area");

function createReceiverInfo(usersData) {
  console.log("no history");
  const div = document.createElement("div");
  const wrapdiv = document.createElement("div");
  const img = document.createElement("img");
  const p = document.createElement("p");
  div.className = "user-info";
  wrapdiv.className = "user-wrap";
  img.src = usersData.receiverPicture;
  p.textContent = usersData.receiverName;
  p.className = "username";
  chatArea.prepend(div, chatArea.firstChild);
  div.appendChild(wrapdiv);
  wrapdiv.appendChild(img);
  wrapdiv.appendChild(p);
}

function createBlankElement() {
  const div = document.querySelector("#messages");
  div.textContent = "no data";
  const form = document.querySelector("#chatform");
  form.remove();
}

// change room class if selected
async function checkFocusRoom() {
  const existingRooms = document.querySelectorAll(".room");
  for (let i = 0; i < existingRooms.length; i++) {
    if (existingRooms[i].children[0].href.split("=")[1] == roomId) {
      existingRooms[i].classList = "room selected";
    }
  }
}
