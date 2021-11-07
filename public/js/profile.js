const token = localStorage.getItem("access_token");
const notification = document.querySelector(".notifications");
const posts = document.querySelector(".posts");

if (token) {
  getNotification();
  getPosts();
  getConfirmPosts();
}

// show notification
async function getNotification() {
  const response = await fetch("/api/notification", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const notificationData = await response.json();
  console.log("findowner id for notification");
  console.log(notificationData);
  if (notificationData.message) {
    Swal.fire({
      icon: "info",
      text: "請先登入或註冊",
      showConfirmButton: false,
      timer: 1500,
    });
    localStorage.clear();
    setTimeout(() => {
      window.location.href = "/member.html";
    }, 1600);
  } else {
    if (notificationData.length > 0) {
      createNotification(notificationData);
    } else {
      const p = document.createElement("p");
      p.textContent = `沒有資料`;
      notification.appendChild(p);
    }
  }
}

// show existing post
async function getPosts() {
  const response = await fetch("/api/getAllPostsByUser", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const postsData = await response.json();
  console.log("post history");
  console.log(postsData);
  createExistingPosts(postsData);

  // delete existing posts
  const deleteBtn = [...document.querySelectorAll(".delete")];
  deleteBtn.map((del) => {
    del.addEventListener("click", (e) => {
      e.preventDefault();
      // alert to confirm delete
      Swal.fire({
        title: "確定要刪除此篇貼文嗎?",
        showCancelButton: true,
        confirmButtonText: "確認",
        denyButtonText: `取消`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          deletePost(e.target.id);
        }
      });
    });
  });
}

async function deletePost(id) {
  const response = await fetch(`/api/deletePost?id=${id}`, {
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

// show confirm post
async function getConfirmPosts() {
  try {
    const response = await fetch("/api/getConfirmPost", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const result = await response.json();
    console.log("confirm post");
    console.log(result);
    createConfirmPost(result);
  } catch (err) {
    console.log(err);
  }
}

function createConfirmPost(result) {
  if (result.message == "nodata") {
    // show no existing post to confirm
    const div = document.querySelector(".confrim-posts");
    const nopost = document.createElement("div");
    nopost.textContent = "沒有待確認的貼文";
    nopost.className = "nopost";
    div.appendChild(nopost);
  }
  // render
  if (result.userData) {
    const parentDiv = document.querySelector(".confrim-posts");
    result.userData.map((post) => {
      const div = document.createElement("div");
      div.className = "confirm-post";
      let photo = post.petPhoto;
      let noPost = "";
      let href = `/findpets/detail.html?id=${post.find_pet_id}`;
      if (!post.petPhoto) {
        photo = "/images/member_icon.png";
      }
      if (post.find_pet_id == null) {
        href = "/findpets.html";
        noPost = "沒有刊登找寵物貼文";
      }
      div.innerHTML = `
      <a href="${href}">
        <img src="${photo}"/>
      </a>
      <div class="confirm-post-content">
        <div class="user">
          <img src="${post.picture}"></>
          <div>${post.name}</div>
        </div>
        <div>${noPost}</div>
        <div>感謝留言: </div>
        <div class="thankyou-message">${post.thank_message}</div>
      </div>
      <input
        type="radio"
        class="btn-check"
        name="options${post.mid}"
        id="confirm${post.mid}"
        autocomplete="off"
        value="confirm"
      />
      <label class="btn btn-outline-secondary" for="confirm${post.mid}"
        >確認</label>
      <input
        type="radio"
        class="btn-check"
        name="options${post.mid}"
        id="cancel${post.mid}"
        autocomplete="off"
        value="cancel"
      />
      <label class="btn btn-outline-secondary" for="cancel${post.mid}">取消</label>
      <div class="save ${post.mid}">Save</div>
      `;
      parentDiv.appendChild(div);
    });
  }

  // update confirm post status
  const saveBtn = [...document.querySelectorAll(".save")];
  saveBtn.map((btn) => {
    btn.addEventListener("click", (e) => {
      // check if radio checked
      console.log("clickk");
      const id = e.target.className.split(" ")[1];
      console.log(id);

      if (document.getElementById(`confirm${id}`).checked) {
        console.log(`select confirm${id}`);
        // alert to confirm and update("match")
        Swal.fire({
          title: "請確認貼文配對",
          text: "確認後將會成功配對，感謝您的協助 =]",
          showCancelButton: true,
          confirmButtonText: "確認",
          denyButtonText: `取消`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            // update
            const data = { status: "match", id: `${id}` };
            updateConfirmPost(data);
          }
        });
      } else if (document.getElementById(`cancel${id}`).checked) {
        console.log(`select cancel${id}`);
        // alert to cancel and update("fail")
        Swal.fire({
          title: "請確認貼文配對",
          text: "配對將會取消，並通知對方",
          showCancelButton: true,
          confirmButtonText: "確認",
          denyButtonText: `取消`,
        }).then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            // update
            const data = { status: "fail", id: `${id}` };
            updateConfirmPost(data);
          }
        });
      } else {
        console.log(`not selected ${id}`);
        // alert to choose one
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

function createNotification(findownerid) {
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

function createExistingPosts(postsData) {
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
    div.innerHTML = `
              <img
                src="${post.photo}"
              />
              <div class="post-content">
              <div class="post-title">${title}</div>
                <div>品種: ${post.breed}</div>
                <div>地點: ${post.county}${post.district}${post.address}</div>
                <div>日期: ${time}</div>
                <div>狀態: ${post.status}</div>
              </div>
              <a class="edit" href="${edit}${post.id}">編輯</a>
              <div class="delete" id="${post.id}">
                <img id="${post.id}" src="/images/delete_icon.png">
              </div>
    `;
    posts.appendChild(div);
  });
}

async function updateConfirmPost(data) {
  // call api
  const response = await fetch(`/api/updateConfirmPost`, {
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
  if (confirmUpdate.message) {
    console.log("noooo");
  }
}
