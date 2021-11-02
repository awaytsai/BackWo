// get query string
const currentUrl = location.href;
const queryString = currentUrl.split("?id=");
const id = queryString[1];
const token = localStorage.getItem("access_token");
const person = location.href.split("/f")[1].split(".")[0].split("/")[0];
console.log(person);

getPostDetail();

// render by id
async function getPostDetail() {
  try {
    const fetchData = await fetch(`/api/f${person}/detail?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const data = await fetchData.json();
    console.log(data);
    // check person
    if (data.roomId) {
      // check if user login or not
      if (data.roomId == "null") {
        // element with self post
        createElementSelfPost(data);
      } else {
        // element with roomid
        const roomIdHref = `/chatroom.html?room=${data.roomId}`;
        createElement(data, roomIdHref);
      }
    } else {
      // element with redirect href
      const href = `/chatroom.html`;
      createElement(data, href);
    }
  } catch (err) {
    console.log(err);
  }
}

function createElement(data, href) {
  console.log(data);
  if (person == "indowners") {
    const div = document.createElement("div");
    div.className = "photo-info-wrap";
    const parentDiv = document.querySelector(".main-wrap");
    div.innerHTML = `
    <div class="photo-wrap">
      <div class="photo">
        <img src="${data.photo}"/>
      </div>
      <div><a href="/f${person}/match?id=${data.id}">這是我的寵物</a></div>
    </div>
    <div class="info-wrap">
      <div>
        <div class="info"><span>品種 : </span>${data.breed}</div>
        <div class="info"><span>顏色 : </span>${data.color}</div>
        <div class="info"><span>地點 : </span>${data.address}</div>
        <div class="info"><span>時間 : </span>${data.date}</div>
        <div class="info"><span>備註 : </span>${data.note}</div>
      </div>
      <div class="finderinfo">
        <div><img src="${data.postUserPic}"/></div>
        <div class="finder-name"><span>Finder Name: </span>${data.postUserName}</div>
        <div class=chat-button>
          <a href="${href}">傳送訊息</a>
        </div>
      </div>
    </div>`;
    parentDiv.appendChild(div);
  } else {
    const div = document.createElement("div");
    div.className = "photo-info-wrap";
    const parentDiv = document.querySelector(".main-wrap");
    div.innerHTML = `
    <div class="photo-wrap">
      <div class="photo">
        <img src="${data.photo}"/>
      </div>
    </div>
    <div class="info-wrap">
      <div>
        <div class="info"><span>品種 : </span>${data.breed}</div>
        <div class="info"><span>顏色 : </span>${data.color}</div>
        <div class="info"><span>地點 : </span>${data.address}</div>
        <div class="info"><span>時間 : </span>${data.date}</div>
        <div class="info"><span>備註 : </span>${data.note}</div>
      </div>
      <div class="finderinfo">
        <div><img src="${data.postUserPic}"/></div>
        <div class="finder-name"><span>Finder Name: </span>${data.postUserName}</div>
        <div class=chat-button>
          <a href="${href}">傳送訊息</a>
        </div>
      </div>
    </div>`;
    parentDiv.appendChild(div);
  }
}

function createElementSelfPost(data) {
  const div = document.createElement("div");
  div.className = "photo-info-wrap";
  const parentDiv = document.querySelector(".main-wrap");
  div.innerHTML = `
  <div class="photo-wrap">
  <div class="photo">
    <img src="${data.photo}"/>
  </div>
</div>
<div class="info-wrap">
  <div>
    <div class="info"><span>品種 : </span>${data.breed}</div>
    <div class="info"><span>顏色 : </span>${data.color}</div>
    <div class="info"><span>地點 : </span>${data.address}</div>
    <div class="info"><span>時間 : </span>${data.date}</div>
    <div class="info"><span>備註 : </span>${data.note}</div>
  </div>
  <div class="finderinfo">
    <div><img src="${data.postUserPic}"/></div>
    <div class="finder-name"><span>Finder Name: </span>${data.postUserName}</div>
  </div>
</div>`;
  parentDiv.appendChild(div);
}
