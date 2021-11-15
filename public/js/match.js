// /checkmatch.html?id=${data.id}
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
  div.innerHTML = `
      <div class="photo">
        <img src="${data.photo}"/>
      </div>
      <div class="info-wrap">
        <div>
          <div class="info"><span>品種 : </span>${data.breed}</div>
          <div class="info"><span>顏色 : </span>${data.color}</div>
          <div class="info"><span>地點 : </span>${data.fullAddress}</div>
          <div class="info"><span>時間 : </span>${data.date}</div>
          <div class="info"><span>備註 : </span>${data.note}</div>
        </div>
        <div class="finderinfo">
          <div><img src="${data.postUserPic}"/></div>
          <div class="finder-name"><span>協尋者 : </span>${data.postUserName}</div>
        </div>
      </div>`;
  parentDiv.appendChild(div);
}

function createHistoryPost(data) {
  const h5 = document.createElement("h5");
  const div = document.createElement("div");
  const p = document.createElement("p");
  // const button = document.createElement("button");
  const wrapDiv = document.querySelector(".main-wrap");
  h5.textContent = "請選擇對應的找寵物貼文";
  p.textContent = `系統會將您的貼文，傳送給協尋者做比對確認`;
  p.className = "match-desc";
  div.className = "existing-post";
  // button.className = "submit";
  // button.textContent = "Submit";
  wrapDiv.appendChild(h5);
  wrapDiv.appendChild(p);
  wrapDiv.appendChild(div);
  data.map((post) => {
    console.log(post);
    let time = new Date(Date.parse(post.date))
      .toLocaleString("en-US")
      .split(", ")[0];
    post.date = time;
    const div = document.createElement("div");
    const parentDiv = document.querySelector(".existing-post");
    div.classList = `post ${post.id}`;
    div.innerHTML = `
    <label class="check-label">
    <img
      src="${post.photo}"
    />
    <div class="post-info">
      <div class="post-info-title">找寵物</div>
      <div><span>品種: </span>${post.breed}</div>
      <div><span>地點: </span>${post.fullAddress}</div>
      <div><span>日期: </span>${post.date}</div>
      <div><span>狀態: </span>${post.status}</div>
    </div>
    <div class="check ${post.id}"></div>
    <input type="radio" name="post" value="${post.id}" />
  </label>
    `;
    parentDiv.appendChild(div);
  });
  // wrapDiv.appendChild(button);
}

let fpid;
// store thank you message
// update post for owner to check(update) status
const submitBtn = document.querySelector(".submit");
submitBtn.addEventListener("click", () => {
  const radios = document.querySelectorAll('input[type="radio"]:checked');
  console.log(radios);
  if (radios.length > 0) {
    console.log("checked");
    const message = "待協尋者確認後，會協助您將找寵物的貼文移除";
    fpid = radios[0].value;
    alertAndSave(message, fpid);
  } else {
    console.log("no checked or no post");
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
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      console.log("確認");
      // call api
      storeMatchList(fpid);
    }
  });
}

async function storeMatchList(fpid) {
  const thankmessage = document.querySelector(".thankyou-message").value;
  const body = {
    thankmessage: thankmessage,
  };
  // call api
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
