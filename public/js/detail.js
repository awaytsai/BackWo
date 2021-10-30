// get query string
const currentUrl = location.href;
const queryString = currentUrl.split("?id=");
const id = queryString[1];
const token = localStorage.getItem("access_token");

getPostDetail();

// render by id
async function getPostDetail() {
  try {
    const fetchData = await fetch(`/api/findowners/detail?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const data = await fetchData.json();
    console.log(data);
    // check if user login or not
    if (data.roomId) {
      // element with roomid
      const href = `/chatroom.html?id=${data.ownerId}&room=${data.roomId}`;
      createElement(data, href);
    } else {
      if (data.roomId == "null") {
        // element with self post
        createElementSelfPost(data);
      } else {
        // element with redirect href
        const href = `/chatroom.html`;
        createElement(data, href);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

function createElement(data, href) {
  const div = document.createElement("div");
  const parentDiv = document.querySelector(".main-wrap");
  div.innerHTML = ` <div class="photo">
  <img src="${data.photo}"/>
</div>
<div class="info">
  <div>品種 : ${data.breed}</div>
  <div>地點 : ${data.address}</div>
  <div>時間 : ${data.date}</div>
  <div>備註 : ${data.note}</div>

  <div class="finderinfo">
    <div><img src="${data.picture}"/></div>
    <div>Finder Name: ${data.ownername}</div>
  </div>
  <div class=>
    <a href="${href}">chat with me</a>
    <a href="/">This is my pet</a>
  </div>
</div>`;
  parentDiv.appendChild(div);
}

function createElementSelfPost(data) {
  const div = document.createElement("div");
  const parentDiv = document.querySelector(".main-wrap");
  div.innerHTML = ` <div class="photo">
  <img src="${data.photo}"/>
</div>
<div class="info">
  <div>品種 : ${data.breed}</div>
  <div>地點 : ${data.address}</div>
  <div>時間 : ${data.date}</div>
  <div>備註 : ${data.note}</div>

  <div class="finderinfo">
    <div><img src="${data.picture}"/></div>
    <div>Finder Name: ${data.ownername}</div>
  </div>
</div>`;
  parentDiv.appendChild(div);
}
