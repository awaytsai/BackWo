// get query string
const currentUrl = location.href;
const queryString = currentUrl.split("?id=");
const id = queryString[1];
const token = localStorage.getItem("access_token");
// const person = location.href.split("/f")[1].split(".")[0].split("/")[0];
// console.log(person);

const urlParam = window.location.href;
let person;
getPostDetail();

function checkPerson(urlParam) {
  if (urlParam.includes("findowners")) {
    person = "findowners";
  }
  if (urlParam.includes("findpets")) {
    person = "findpets";
  }
}

// render by id
async function getPostDetail() {
  try {
    checkPerson(urlParam);
    const fetchData = await fetch(`/api/${person}/detail?id=${id}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const data = await fetchData.json();
    if (data.message) {
      Swal.fire({
        icon: "info",
        text: "頁面不存在",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => {
        window.location.href = `/${person}.html`;
      }, 1600);
    }
    console.log(data);
    let time = new Date(Date.parse(data.formatData.date))
      .toLocaleString("en-US")
      .split(", ")[0];
    data.formatData.date = time;
    console.log(time);
    if (data.formatData.roomId) {
      // user login
      if (data.formatData.roomId == "null") {
        // self post
        createElementSelfPost(data);
      } else {
        // element with roomid
        const roomIdHref = `/chatroom.html?room=${data.formatData.roomId}`;
        createElement(data, roomIdHref);
      }
    } else {
      // user not login
      const href = `/chatroom.html`;
      createElement(data, href);
    }
  } catch (err) {
    console.log(err);
  }
}

function createElement(data, href) {
  if (person == "findowners") {
    const name = "協尋者: ";
    createBreedElement(data);
    createfinderElement(data, name);
    createChatElement(href);
    createMatchElement(data);
    createPhoto(data.photoData);
  }
  if (person == "findpets") {
    const name = "飼主: ";
    createBreedElement(data);
    createfinderElement(data, name);
    createChatElement(href);
    createPhoto(data.photoData);
  }
}

function createElementSelfPost(data) {
  let name = "飼主: ";
  if (person == "findowners") {
    name = "協尋者: ";
  }
  createBreedElement(data);
  createfinderElement(data, name);
  createPhoto(data.photoData);
}

function createPhoto(data) {
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

function createBreedElement(data) {
  const breedDiv = document.querySelector(".breed");
  const colorDiv = document.querySelector(".color");
  const locationDiv = document.querySelector(".location");
  const dateDiv = document.querySelector(".date");
  const noteDiv = document.querySelector(".note");
  breedDiv.textContent = `${data.formatData.breed}`;
  colorDiv.textContent = `${data.formatData.color}`;
  locationDiv.textContent = `${data.formatData.fullAddress}`;
  dateDiv.textContent = `${data.formatData.date}`;
  noteDiv.textContent = `${data.formatData.note}`;
}

function createfinderElement(data, name) {
  const finderImg = document.querySelector(".finderinfo-img");
  const finderName = document.querySelector(".finder-name");
  const span = document.createElement("span");
  const p = document.createElement("p");
  finderImg.src = `${data.formatData.postUserPic}`;
  span.textContent = `${name}`;
  p.className = "name";
  p.textContent = `${data.formatData.postUserName}`;
  finderName.appendChild(span);
  finderName.appendChild(p);
}

function createChatElement(href) {
  const chatBtn = document.querySelector(".chat-button");
  const a = document.createElement("a");
  a.textContent = `傳送訊息`;
  a.href = `${href}`;
  chatBtn.appendChild(a);
}

function createMatchElement(data) {
  const matchBtn = document.querySelector(".match-button");
  const a = document.createElement("a");
  a.href = `/checkmatch.html?id=${data.formatData.id}`;
  a.textContent = `送出比對`;
  matchBtn.appendChild(a);
}
