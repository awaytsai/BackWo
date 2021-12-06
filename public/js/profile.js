const token = localStorage.getItem("access_token");
const notifications = document.querySelector(".notifications");
const posts = document.querySelector(".posts");

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
  getUserData();
  getNotification();
  getPosts();
  getConfirmPosts();
}

async function getUserData() {
  const response = await fetch("/api/userData", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const result = await response.json();

  if (result.message == "請先登入或註冊") {
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
  if (result.message == "請重新登入") {
    Swal.fire({
      icon: "info",
      text: "請重新登入",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/member.html";
    }, 1600);
  }
  if (result.userData) {
    showWelcomeMessage(result.userData);
  }
}

function showWelcomeMessage(data) {
  const parentDiv = document.querySelector(".welcome-message");
  const img = document.createElement("img");
  const p = document.createElement("p");
  const div = document.createElement("div");
  p.textContent = `歡迎回來，${data.name}`;
  div.textContent = "登出";
  div.className = "logout";
  img.src = `${data.picture}`;
  img.className = "userPic";
  parentDiv.append(img);
  parentDiv.appendChild(p);
  parentDiv.appendChild(div);
  const logout = document.querySelector(".logout");
  logout.addEventListener("click", (e) => {
    localStorage.clear();
    window.location.href = "/member.html";
  });
}

// show notification
async function getNotification() {
  const response = await fetch("/api/notifications", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const notificationData = await response.json();
  if (notificationData.message) {
    Swal.fire({
      icon: "info",
      text: "請先登入或註冊",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/member.html";
    }, 1600);
  } else {
    if (notificationData.length == 0) {
      const div = document.createElement("div");
      div.textContent = `沒有已比對的通知`;
      div.className = "nopost";
      notifications.appendChild(div);
    } else {
      createNotification(notificationData);
    }
  }
}

// show existing post
async function getPosts() {
  const response = await fetch("/api/usersPosts", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const postsData = await response.json();
  if (postsData.length == 0) {
    const div = document.querySelector(".posts");
    const nopost = document.createElement("div");
    nopost.textContent = "沒有已發佈的貼文";
    nopost.className = "nopost";
    div.appendChild(nopost);
  } else {
    await createExistingPosts(postsData);
  }

  // delete existing posts
  const deleteBtn = [...document.querySelectorAll(".delete")];
  deleteBtn.map((del) => {
    del.addEventListener("click", (e) => {
      const person = e.target.className.split(" ")[1];
      const id = e.target.className.split(" ")[2];
      Swal.fire({
        title: "確定要刪除此篇貼文嗎?",
        showCancelButton: true,
        confirmButtonText: "確認",
        denyButtonText: `取消`,
      }).then((result) => {
        if (result.isConfirmed) {
          deletePost(person, id);
        }
      });
    });
  });
}

async function deletePost(person, id) {
  const response = await fetch(`/api/posts?id=${id}&person=${person}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const result = await response.json();
  if (result.message) {
    Swal.fire("刪除失敗，稍後再試", "", "warning");
  }
  if (result.status == "deleted") {
    Swal.fire({
      icon: "success",
      text: "已成功刪除",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1600);
  }
}

async function getConfirmPosts() {
  const response = await fetch("/api/confirmPosts", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const result = await response.json();
  createConfirmPost(result);
}

function createConfirmPost(result) {
  // no existing confirm post
  if (result.message == "nodata") {
    const div = document.querySelector(".confirm-posts");
    const nopost = document.createElement("div");
    nopost.textContent = "沒有待確認的貼文";
    nopost.className = "nopost";
    div.appendChild(nopost);
  }
  if (result.userData) {
    const parentDiv = document.querySelector(".confirm-posts");
    result.userData.map((post) => {
      const div = document.createElement("div");
      div.className = "confirm-post";
      let photo = post.petPhoto;
      let noPost = "";
      let href = `/findpets/detail.html?id=${post.find_pet_id}`;
      if (!post.petPhoto) {
        photo =
          "https://www.lvh.com.au/wp-content/uploads/2019/06/lvh-logo-1.png";
      }
      if (post.find_pet_id == null) {
        href = "/findpets.html";
        noPost = "沒有刊登找寵物貼文";
      }
      const a = document.createElement("a");
      const confirmPostDiv = document.createElement("div");
      const confirmInput = document.createElement("input");
      const confirmLabel = document.createElement("label");
      const cancelInput = document.createElement("input");
      const cancelLabel = document.createElement("label");
      const saveBtn = document.createElement("div");
      confirmPostDiv.className = `confirm-post-content`;
      a.href = `${href}`;
      confirmInput.type = `radio`;
      confirmInput.className = `btn-check`;
      confirmInput.name = `options${post.mid}`;
      confirmInput.id = `confirm${post.mid}`;
      confirmInput.autocomplete = "off";
      confirmInput.value = `confirm`;
      confirmLabel.classList = `btn btn-outline-secondary`;
      confirmLabel.htmlFor = `confirm${post.mid}`;
      confirmLabel.textContent = `確認`;
      cancelInput.type = `radio`;
      cancelInput.className = `btn-check`;
      cancelInput.name = `options${post.mid}`;
      cancelInput.id = `cancel${post.mid}`;
      cancelInput.autocomplete = "off";
      cancelInput.value = `cancel`;
      cancelLabel.classList = `btn btn-outline-secondary`;
      cancelLabel.htmlFor = `cancel${post.mid}`;
      cancelLabel.textContent = `取消`;
      saveBtn.classList = `save ${post.mid}`;
      saveBtn.textContent = `Save`;
      div.append(
        a,
        confirmPostDiv,
        confirmInput,
        confirmLabel,
        cancelInput,
        cancelLabel,
        saveBtn
      );
      const img = document.createElement("img");
      img.src = `${photo}`;
      a.appendChild(img);
      const userDiv = document.createElement("div");
      userDiv.className = `user`;
      const userImg = document.createElement("img");
      const userName = document.createElement("div");
      userImg.src = `${post.picture}`;
      userName.textContent = `${post.name}`;
      userDiv.append(userImg, userName);
      const contentDiv = document.createElement("div");
      contentDiv.textContent = `${noPost}`;
      const thankTitleDiv = document.createElement("div");
      thankTitleDiv.textContent = `感謝留言: `;
      const thankDiv = document.createElement("div");
      thankDiv.textContent = `${post.thank_message}`;
      thankDiv.className = `thankyou-message`;
      confirmPostDiv.append(userDiv, contentDiv, thankTitleDiv, thankDiv);
      parentDiv.appendChild(div);
    });
  }

  // update confirm post status
  const saveBtn = [...document.querySelectorAll(".save")];
  saveBtn.map((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.className.split(" ")[1];
      // confirm radio checked
      if (document.getElementById(`confirm${id}`).checked) {
        Swal.fire({
          title: "請確認貼文配對",
          text: "確認後將會成功配對，感謝您的協助 =]",
          showCancelButton: true,
          confirmButtonText: "確認",
          denyButtonText: `取消`,
        }).then((result) => {
          if (result.isConfirmed) {
            const data = { status: "match", id: `${id}` };
            updateConfirmPost(data);
          }
        });
      }
      // cancel radio checked
      if (document.getElementById(`cancel${id}`).checked) {
        Swal.fire({
          title: "請確認貼文配對",
          text: "配對將會取消，並通知對方",
          showCancelButton: true,
          confirmButtonText: "確認",
          denyButtonText: `取消`,
        }).then((result) => {
          if (result.isConfirmed) {
            const data = { status: "fail", id: `${id}` };
            updateConfirmPost(data);
          }
        });
      }
      // not checked
      if (
        !document.getElementById(`cancel${id}`).checked &&
        !document.getElementById(`confirm${id}`).checked
      ) {
        Swal.fire({
          icon: "info",
          text: "請勾選後再送出",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  });
}

function createNotification(notificationData) {
  notificationData.map((data) => {
    let time = new Date(Date.parse(data.time))
      .toLocaleString("en-US")
      .split(", ")[0];
    data.time = time;
    const div = document.createElement("div");
    div.className = "notification";
    const a = document.createElement("a");
    a.href = `/findowners/detail.html?id=${data.find_owners_id}`;
    const img = document.createElement("img");
    img.src = "/images/cancel_icon.png";
    img.classList = `cancel ${data.id}`;
    div.append(a, img);
    const notiTimeDiv = document.createElement("div");
    notiTimeDiv.className = "noti-text-time";
    a.appendChild(notiTimeDiv);
    const notiIcon = document.createElement("img");
    notiIcon.className = `noti-icon`;
    notiIcon.src = "/images/notification.png";
    const p = document.createElement("p");
    notiTimeDiv.append(notiIcon, p);
    const highlightSpan = document.createElement("span");
    highlightSpan.textContent = `通知：`;
    highlightSpan.className = `highlight`;
    const contentSpan = document.createElement("span");
    contentSpan.textContent = `這可能是你走失的寵物，快來查看`;
    const linkSpan = document.createElement("span");
    linkSpan.textContent = `詳細資訊`;
    linkSpan.className = `link`;
    const timeSpan = document.createElement("span");
    timeSpan.textContent = `${data.time}`;
    timeSpan.className = `noti-time`;
    p.append(highlightSpan, contentSpan, linkSpan, timeSpan);
    notifications.appendChild(div);
  });

  // delete notification
  const cancel = [...document.querySelectorAll(".cancel")];
  cancel.map((data) => {
    data.addEventListener("click", (e) => {
      const id = e.target.className.split(" ")[1];
      const data = { id: id };
      Swal.fire({
        icon: "info",
        text: "這則通知將不會再顯示",
        showCancelButton: true,
        confirmButtonText: "確認",
        denyButtonText: `取消`,
      }).then((result) => {
        if (result.isConfirmed) {
          deleteNotification(data);
        }
      });
    });
  });
}

async function deleteNotification(data) {
  const response = await fetch("/api/notifications", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  const deleteNoti = await response.json();
  if (deleteNoti.status == "updated") {
    Swal.fire({
      icon: "success",
      text: "成功刪除通知",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1600);
  }
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
    if (post.person == "finder") {
      title = "找寵物";
      edit = `/findpets/edit.html?id=`;
    }
    if (post.person == "owner") {
      title = "找主人";
      edit = `/findowners/edit.html?id=`;
    }

    const img = document.createElement("img");
    img.src = `${post.photo}`;
    const postContent = document.createElement("div");
    postContent.className = `post-content`;
    const a = document.createElement("a");
    a.className = `edit`;
    a.href = `${edit}${post.id}`;
    a.textContent = `編輯`;
    const deleteDiv = document.createElement("div");
    deleteDiv.classList = `delete ${post.person} ${post.id}`;
    deleteDiv.id = `${post.id}`;
    const deleteImg = document.createElement("img");
    deleteImg.classList = `delete ${post.person} ${post.id}`;
    deleteImg.src = `/images/delete_icon.png`;
    div.append(img, postContent, a, deleteDiv);
    deleteDiv.appendChild(deleteImg);
    const postTitle = document.createElement("div");
    postTitle.textContent = `${title}`;
    const breedDiv = document.createElement("div");
    const locationDiv = document.createElement("div");
    const dateDiv = document.createElement("div");
    const statusDiv = document.createElement("div");
    const breedSpan = document.createElement("span");
    const locationSpan = document.createElement("span");
    const dateSpan = document.createElement("span");
    const statusSpan = document.createElement("span");
    breedSpan.textContent = `品種 : ${post.breed}`;
    locationSpan.textContent = `地點 : ${post.county}${post.district}${post.address}`;
    dateSpan.textContent = `日期 : ${time}`;
    statusSpan.textContent = `狀態 : ${post.status}`;
    postContent.append(postTitle, breedDiv, locationDiv, dateDiv, statusDiv);
    breedDiv.appendChild(breedSpan);
    locationDiv.appendChild(locationSpan);
    dateDiv.appendChild(dateSpan);
    statusDiv.appendChild(statusSpan);
    posts.appendChild(div);
  });
}

async function updateConfirmPost(data) {
  const response = await fetch(`/api/confirmPosts`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
  const confirmUpdate = await response.json();

  if (confirmUpdate.status == "updated") {
    Swal.fire({
      icon: "success",
      text: "成功送出",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1600);
  }
}
