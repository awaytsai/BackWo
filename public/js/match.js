// /checkmatch.html?id=${data.id}
const currentUrl = location.href;
const id = currentUrl.split("?id=")[1];
const token = localStorage.getItem("access_token");

getPostDetail();

// store thank you message
// update post for owner to check(update) status

// render by id
async function getPostDetail() {
  try {
    const fetchData = await fetch(`/api/match/detail?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const matchPostData = await fetchData.json();
    createDetail(matchPostData.formatData);
    // createHistoryPost(matchPostData.historyPost);
  } catch (err) {
    console.log(err);
  }
}

function createDetail(data) {
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

function createHistoryPost() {}
// rendering match post by user id
// get existing post by userid
// render with thank you message and toggle list
