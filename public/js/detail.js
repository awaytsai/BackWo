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
        Authorization: "Bearer " + token,
      },
    });
    const data = await fetchData.json();
    console.log(data);
    let time = new Date(Date.parse(data.formatData.date))
      .toLocaleString("en-US")
      .split(", ")[0];
    data.formatData.date = time;
    console.log(time);
    // check person
    if (data.formatData.roomId) {
      // check if user login or not
      if (data.formatData.roomId == "null") {
        // element with self post
        createElementSelfPost(data);
      } else {
        // element with roomid
        const roomIdHref = `/chatroom.html?room=${data.formatData.roomId}`;
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
    const parentDiv = document.querySelector(".info-wrap");
    const div = document.createElement("div");
    div.innerHTML = `
      <div>
      <div class="info"><span>品種 : </span>${data.formatData.breed}</div>
      <div class="info"><span>顏色 : </span>${data.formatData.color}</div>
      <div class="info"><span>地點 : </span>${data.formatData.fullAddress}</div>
      <div class="info"><span>時間 : </span>${data.formatData.date}</div>
      <div class="info"><span>備註 : </span>${data.formatData.note}</div>
    </div>
    <div class="finderinfo">
      <div><img src="${data.formatData.postUserPic}"/></div>
      <div class="finder-name"><span>Finder Name: </span>${data.formatData.postUserName}</div>
      <div class=chat-button>
        <a href="${href}">傳送訊息</a>
      </div>
    </div>
    <div class="match-button">
      <a href="/checkmatch.html?id=${data.formatData.id}">送出比對</a>
      <p class="check-desc">請先和協尋者聯絡，確認為自己的寵物後，再請按下送出比對。</p>
    </div>
    `;
    parentDiv.appendChild(div);
    createCarousel(data.photoData);
  } else {
    const parentDiv = document.querySelector(".info-wrap");
    const div = document.createElement("div");
    div.innerHTML = `
      <div>
        <div class="info"><span>品種 : </span>${data.formatData.breed}</div>
        <div class="info"><span>顏色 : </span>${data.formatData.color}</div>
        <div class="info"><span>地點 : </span>${data.formatData.fullAddress}</div>
        <div class="info"><span>時間 : </span>${data.formatData.date}</div>
        <div class="info"><span>備註 : </span>${data.formatData.note}</div>
      </div>
      <div class="finderinfo">
        <div><img src="${data.formatData.postUserPic}"/></div>
        <div class="finder-name"><span>Finder Name: </span>${data.formatData.postUserName}</div>
        <div class=chat-button>
          <a href="${href}">傳送訊息</a>
        </div>
      </div>
    `;
    parentDiv.appendChild(div);
    createCarousel(data.photoData);
  }
}

function createElementSelfPost(data) {
  const div = document.createElement("div");
  div.className = "photo-info-wrap";
  const parentDiv = document.querySelector(".info-wrap");
  div.innerHTML = `
    <div>
      <div class="info"><span>品種 : </span>${data.formatData.breed}</div>
      <div class="info"><span>顏色 : </span>${data.formatData.color}</div>
      <div class="info"><span>地點 : </span>${data.formatData.fullAddress}</div>
      <div class="info"><span>時間 : </span>${data.formatData.date}</div>
      <div class="info"><span>備註 : </span>${data.formatData.note}</div>
    </div>
    <div class="finderinfo">
      <div><img src="${data.formatData.postUserPic}"/></div>
      <div class="finder-name"><span>Finder Name: </span>${data.formatData.postUserName}</div>
    </div>`;
  parentDiv.appendChild(div);
  createCarousel(data.photoData);
}

function createCarousel(data) {
  const carousel = document.querySelector("#carouselExampleControls");
  if (data.length < 2) {
    carousel.innerHTML = "";
    const img = document.createElement("img");
    img.className = "detail-img";
    img.src = data;
    carousel.prepend(img);
  } else {
    console.log(data);
    const div = document.createElement("div");
    div.className = "carousel-inner";
    carousel.prepend(div);
    const innerCarousel = document.querySelector(".carousel-inner");
    data.map((p) => {
      const div = document.createElement("div");
      div.className = "carousel-item";
      div.innerHTML = `<img src="${p}" class="d-block w-100"/>`;
      innerCarousel.appendChild(div);
    });
    const firstCard = document.querySelectorAll(".carousel-item");
    firstCard[0].classList.add("active");
  }
}
