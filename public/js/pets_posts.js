const person = location.href.split("/f")[1].split(".")[0];
const token = localStorage.getItem("access_token");
console.log(person);
// show all posts
showPosts();

// filter filter posts
const applyBtn = document.querySelector(".apply");
applyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const kind = document.querySelector(".filterkind").value;
  const county = document.querySelector(".filtercounty").value;
  const district = document.querySelector(".filterdistrict").value;
  const date = document.querySelector("#datepicker").value;
  // check if inut null
  if (kind && county && district && date) {
    showFilterPosts(kind, county, district, date);
  } else {
    Swal.fire({
      icon: "info",
      text: `請選擇全部篩選項目`,
    });
  }
});

async function showPosts() {
  const response = await fetch(`/api/getf${person}Posts`);
  const findOwnersPostsData = await response.json();
  deleteElement();
  console.log(findOwnersPostsData);
  const result = createElement(findOwnersPostsData);
}

async function showFilterPosts(kind, county, district, date) {
  const filterResponse = await fetch(
    `/api/getf${person}Posts?kind=${kind}&county=${county}&district=${district}&date=${date}`
  );
  const filterData = await filterResponse.json();
  if (filterData.message == "wrong date format") {
    Swal.fire({
      icon: "info",
      text: `日期無效`,
    });
    return;
  }
  deleteElement();
  if (filterData.length > 0) {
    createElement(filterData);
  } else {
    const postDiv = document.querySelector(".posts");
    postDiv.innerHTML = `<h5> 查無篩選結果 </h5>`;
  }
}

function createElement(data) {
  const postDiv = document.querySelector(".posts");
  if (data.length == 0) {
    postDiv.innerHTML = `<h5> 查無篩選結果 </h5>`;
  }

  data.map((pet) => {
    const box = document.createElement("div");
    const a = document.createElement("a");
    const img = document.createElement("img");
    const title = document.createElement("div");
    box.className = "box";
    title.className = "title";
    title.innerText = `${pet.county}${pet.district}`;
    a.href = `/f${person}/detail.html?id=${pet.id}`;
    img.src = `${pet.photo}`;
    postDiv.appendChild(box);
    box.appendChild(a);
    box.appendChild(title);
    a.appendChild(img);
  });
}

function deleteElement() {
  const postDiv = document.querySelector(".posts");
  postDiv.innerHTML = "";
}
