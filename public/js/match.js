const currentUrl = location.href;
const id = currentUrl.split("?id=")[1];
const token = localStorage.getItem("access_token");

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
}
if (token) {
  getPostDetail();
}

// render by id
async function getPostDetail() {
  const fetchData = await fetch(`/api/match/detail?id=${id}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const matchPostData = await fetchData.json();
  if (
    matchPostData.message == "請重新登入" ||
    matchPostData.message == "請先登入或註冊"
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
  createDetail(matchPostData.formatData);
  if (matchPostData.historyData !== "nodata") {
    // if login and history post existed
    createHistoryPost(matchPostData.historyData);
  }
}

function createDetail(data) {
  let time = new Date(Date.parse(data.date))
    .toLocaleString("en-US")
    .split(", ")[0];
  data.date = time;

  const div = document.createElement("div");
  div.className = "photo-info-wrap";
  const parentDiv = document.querySelector(".post-detail");
  const photoDiv = document.createElement("div");
  photoDiv.className = `photo`;
  const photoImg = document.createElement("img");
  photoImg.src = `${data.photo}`;
  photoDiv.appendChild(photoImg);
  const infoWrapDiv = document.createElement("div");
  infoWrapDiv.className = `info-wrap`;
  div.append(photoDiv, infoWrapDiv);
  const infoDiv = document.createElement("div");
  const breedInfo = document.createElement("div");
  const colorInfo = document.createElement("div");
  const locationInfo = document.createElement("div");
  const dateInfo = document.createElement("div");
  const noteInfo = document.createElement("div");
  breedInfo.className = "info";
  breedInfo.textContent = `品種 : ${data.breed}`;
  colorInfo.className = "info";
  colorInfo.textContent = `顏色 : ${data.color}`;
  locationInfo.className = "info";
  locationInfo.textContent = `地點 : ${data.fullAddress}`;
  dateInfo.className = "info";
  dateInfo.textContent = `時間 : ${data.date}`;
  noteInfo.className = "info";
  noteInfo.textContent = `備註 : ${data.note}`;
  infoDiv.append(breedInfo, colorInfo, locationInfo, dateInfo, noteInfo);
  const finderInfo = document.createElement("div");
  finderInfo.className = `finderinfo`;
  const finderPic = document.createElement("img");
  finderPic.src = `${data.postUserPic}`;
  const finderName = document.createElement("div");
  finderName.className = "finder-name";
  finderName.textContent = `協尋者： ${data.postUserName}`;
  finderInfo.append(finderPic, finderName);
  infoWrapDiv.append(infoDiv, finderInfo);

  parentDiv.appendChild(div);
}

function createHistoryPost(data) {
  const h5 = document.createElement("h5");
  const div = document.createElement("div");
  const p = document.createElement("p");
  const wrapDiv = document.querySelector(".main-wrap");
  h5.textContent = "請選擇您走失的寵物";
  p.textContent = `系統會將您的貼文，傳送給協尋者做比對確認`;
  h5.className = "subtitle";
  p.className = "match-desc";
  div.className = "existing-post";
  wrapDiv.appendChild(h5);
  wrapDiv.appendChild(p);
  wrapDiv.appendChild(div);
  data.map((post) => {
    let time = new Date(Date.parse(post.date))
      .toLocaleString("en-US")
      .split(", ")[0];
    post.date = time;

    const div = document.createElement("div");
    const parentDiv = document.querySelector(".existing-post");
    div.classList = `post ${post.id}`;
    const label = document.createElement("label");
    label.className = `check-label`;
    const postImg = document.createElement("img");
    postImg.src = `${post.photo}`;
    const postInfo = document.createElement("div");
    postInfo.className = `post-info`;
    const postInfoTitle = document.createElement("div");
    postInfoTitle.className = `post-info-title`;
    postInfoTitle.textContent = `找寵物`;
    div.appendChild(label);

    const breedDiv = document.createElement("div");
    const breedSpan = document.createElement("span");
    breedSpan.textContent = `品種: `;
    breedDiv.textContent = `${post.breed}`;
    breedDiv.prepend(breedSpan);
    const locationDiv = document.createElement("div");
    const locationSpan = document.createElement("span");
    locationSpan.textContent = `地點: `;
    locationDiv.textContent = `${post.fullAddress}`;
    locationDiv.prepend(locationSpan);
    const dateDiv = document.createElement("div");
    const dateSpan = document.createElement("span");
    dateSpan.textContent = `日期: `;
    dateDiv.textContent = `${post.date}`;
    dateDiv.prepend(dateSpan);
    const statusDiv = document.createElement("div");
    const statusSpan = document.createElement("span");
    statusSpan.textContent = `狀態: `;
    statusDiv.textContent = `${post.status}`;
    statusDiv.prepend(statusSpan);
    postInfo.append(postInfoTitle, breedDiv, locationDiv, dateDiv, statusDiv);

    const checkDiv = document.createElement("div");
    checkDiv.classList = `check ${post.id}`;
    const input = document.createElement("input");
    input.type = `radio`;
    input.name = "post";
    input.value = `${post.id}`;

    label.append(postImg, postInfo, checkDiv, input);
    parentDiv.appendChild(div);
  });
}

let fpid;
// store thank you message
// update post for owner to check(update) status
const submitBtn = document.querySelector(".submit");
submitBtn.addEventListener("click", () => {
  const radios = document.querySelectorAll('input[type="radio"]:checked');
  if (radios.length > 0) {
    const message = "待協尋者確認後，會協助您將找寵物的貼文移除";
    fpid = radios[0].value;
    alertAndSave(message, fpid);
  } else {
    const message = "將傳送感謝訊息給協尋者";
    fpid = 0;
    alertAndSave(message, fpid);
  }
});

function alertAndSave(message, fpid) {
  Swal.fire({
    title: "確認送出",
    text: message,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "確認",
    denyButtonText: `取消`,
  }).then((result) => {
    if (result.isConfirmed) {
      storeMatchList(fpid);
    }
  });
}

async function storeMatchList(fpid) {
  const thankmessage = document.querySelector(".thankyou-message").value;
  const body = {
    thankmessage: thankmessage,
  };
  const response = await fetch(`/api/storeMatchList?foid=${id}&fpid=${fpid}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (result.message == "請重新登入" || result.message == "請先登入或註冊") {
    localStorage.clear();
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
  if (result.message == "noaccess") {
    Swal.fire({
      icon: "warning",
      text: "頁面不存在",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/findowners.html";
    }, 1600);
  }
  if (result.status == "updated") {
    Swal.fire({
      icon: "success",
      text: "已成功送出",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/findowners.html";
    }, 1600);
  }
}
