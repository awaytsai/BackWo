const token = localStorage.getItem("access_token");
const chatform = document.querySelector("#chatform");
const input = document.querySelector("#chatinput");
const messages = document.querySelector("#messages");
const rooms = document.querySelector(".rooms");

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const roomId = params.room;
let self;

// check access
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
    if (usersData.message == "blankroom") {
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
  // show history room info
  if (historyData.message) {
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
  createReceiverInfo(usersData);
  // listen on message
  chatform.addEventListener("submit", function (e) {
    e.preventDefault();
    let msg = input.value;
    if (msg == "") {
      Swal.fire({
        icon: "info",
        title: "請輸入訊息",
        showConfirmButton: false,
        timer: 1000,
      });
    }
    if (msg.length > 255) {
      Swal.fire({
        icon: "info",
        title: "訊息過長無法傳送",
        showConfirmButton: false,
        timer: 1000,
      });
      input.value = "";
    }
    if (msg.length <= 255 && msg !== "") {
      socket.emit("chatMessage", msg, usersData);
      input.value = "";
    }
  });
  // on chatnessage(chat)
  socket.on("chatMessage", function (msg, usersData) {
    createChatElement(msg, usersData);
  });
  // history message
  socket.on("historymessage", function (historyMessage, usersData) {
    createHistoryMessage(historyMessage, usersData);
  });
  socket.on("error", function (errorMessage) {
    Swal.fire({
      icon: "info",
      title: `${errorMessage}`,
      showConfirmButton: false,
      timer: 1000,
    });
  });
}

// fetch for render existing rooms
async function getExistingRoomsRecord(usersData) {
  const historyResponse = await fetch(
    `/api/chatroomrecord?uid=${usersData.senderId}`
  );
  const historyData = await historyResponse.json();
  return historyData;
}

function createHistoryMessage(historyMessage) {
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

    const msgContentDiv = document.createElement("div");
    const p = document.createElement("p");
    p.textContent = `${message.message}`;
    msgContentDiv.appendChild(p);
    messageBox.appendChild(msgContentDiv);
    const messageTimeDiv = document.createElement("p");
    messageTimeDiv.textContent = `${time} ${ampm}`;
    messageTime.appendChild(messageTimeDiv);

    if (message.sender == self) {
      msgContentDiv.classList = `message-content send`;
      messageTime.className = "message-time-send";
    }
    if (message.sender !== self) {
      msgContentDiv.classList = `message-content receive`;
      messageTime.className = "message-time-receive";
    }
    messages.appendChild(wrapitem);
    wrapitem.appendChild(messageBox);
    wrapitem.appendChild(messageTime);
    messages.scrollTop = messages.scrollHeight;
  });
}

function createExistingRooms(historyData) {
  historyData.map((data) => {
    let time = new Date(Date.parse(data[0].time))
      .toLocaleString("en-US")
      .split(", ");
    const date = time[0];
    const ampm = time[1].slice(-3);
    time = time[1].split(" ")[0].slice(0, -3);
    const item = document.createElement("div");
    item.className = "room";
    const a = document.createElement("a");
    a.className = `room-a`;
    a.href = `/chatroom.html?room=${data[0].room_id}`;
    item.appendChild(a);
    const roomUserDiv = document.createElement("div");
    const roomContentDiv = document.createElement("div");
    a.append(roomUserDiv, roomContentDiv);
    roomUserDiv.className = `room-user`;
    const userImg = document.createElement("img");
    userImg.src = `${data[0].picture}`;
    userImg.style.width = "30px";
    const userName = document.createElement("p");
    userName.textContent = `${data[0].name}`;
    roomUserDiv.append(userImg, userName);
    const roomMessage = document.createElement("p");
    const roomTime = document.createElement("p");
    roomMessage.textContent = `${data[0].message}`;
    roomTime.textContent = `${date} ${time} ${ampm}`;
    roomMessage.className = `room-message`;
    roomTime.className = `room-time`;
    roomContentDiv.className = `room-content`;
    roomContentDiv.append(roomMessage, roomTime);
    rooms.appendChild(item);
  });
  checkFocusRoom();
}

const chatArea = document.querySelector(".chat-area");

function createReceiverInfo(usersData) {
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

function createChatElement(msg, usersData) {
  let time = new Date();
  time = time.toLocaleString("en-US").split(", ")[1];
  const ampm = time.slice(-3);
  time = time.split(" ")[0].slice(0, -3);
  const item = document.createElement("div");
  const msgContentDiv = document.createElement("div");
  const msgTimeDiv = document.createElement("div");
  const message = document.createElement("p");
  const msgTime = document.createElement("p");
  message.textContent = `${msg}`;
  msgTime.textContent = `${time} ${ampm}`;
  item.append(msgContentDiv, msgTimeDiv);
  msgContentDiv.appendChild(message);
  msgTimeDiv.appendChild(msgTime);
  if (usersData.senderId == self) {
    msgContentDiv.classList = `message-content send`;
    msgTimeDiv.classList = `message-time-send`;
  }
  if (usersData.senderId !== self) {
    msgContentDiv.classList = `message-content receive`;
    msgTimeDiv.classList = `message-time-receive`;
  }
  item.classList.add("message-box");
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
}
