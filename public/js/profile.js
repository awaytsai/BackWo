const token = localStorage.getItem("access_token");
const notification = document.querySelector(".notifications");
const posts = document.querySelector(".posts");

getNotification();
getPosts();
// show notification
async function getNotification() {
  const response = await fetch("/api/notification", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const notificationData = await response.json();
  console.log(notificationData);
  if (notificationData.length > 0) {
    console.log("data");
    createNotification(notificationData);
  } else {
    console.log("no data");
    const p = document.createElement("p");
    p.textContent = `沒有資料`;
    notification.appendChild(p);
  }
}

// show existing post (edit/delete)
async function getPosts() {
  const response = await fetch("/api/getAllPostsByUser", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const postsData = await response.json();
  await createExistingPosts(postsData);
  await deleteItem(postsData);
  // delete existing post
}

async function deleteItem(postsData) {
  const deleteItem = document.querySelectorAll(".delete");
  deleteItem.forEach((item) => {
    item.addEventListener("click", () => {
      //
      deleteFetch();
    });
  });
}

async function deleteFetch() {
  const response = await fetch("/api/");
  const data = await response.json();
}
// show confirmed post
// update existing post

// update confirm post status

function createNotification(findownerid) {
  console.log(findownerid);
  findownerid.map((id) => {
    const div = document.createElement("div");
    div.className = "notification";
    div.innerHTML = `
    <a href="/findowners/detail.html?id=${id.find_owners_id}">
      <div class="noti-text-time">
          <p>
          <span class="highlight">！通知 </span>：這可能是你走失的寵物，快來查看 <span class="link"> 詳細資訊</span>。
          </p>
          <p class="notification-time">2021/11/3</p>
      </div>
      </a>
      `;
    notification.appendChild(div);
  });
}

async function createExistingPosts(postsData) {
  postsData.map((post) => {
    const div = document.createElement("div");
    div.classList = "post";
    let title;
    let edit;
    const time = new Date(Date.parse(post.date))
      .toLocaleString("en-US")
      .split(", ")[0];
    if (post.person == "owner") {
      title = "找寵物";
      edit = `/findpets/edit.html?id=`;
    }
    if (post.person == "finder") {
      title = "找主人";
      edit = `/findowners/edit.html?id=`;
    }
    div.innerHTML = `
              <img
                src="${post.photo}"
              />
              <div class="post-content">
              <div class="post-title">${title}</div>
                <div>品種: ${post.kind}</div>
                <div>地點: ${post.county}${post.district}${post.address}</div>
                <div>日期: ${time}</div>
                <div>狀態: ${post.status}</div>
              </div>
              <a class="edit" href="${edit}${post.id}">編輯</a>
              <div class="delete">
                <img src="/images/delete_icon.png">
              </div>
    `;
    posts.appendChild(div);
  });
}
