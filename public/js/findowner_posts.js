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
    alert("請選擇全部篩選項目");
  }
});

async function showPosts() {
  const response = await fetch("/api/getFindOwnersPosts");
  const findOwnersPostsData = await response.json();
  deleteElement();
  console.log(findOwnersPostsData);
  const result = createElement(findOwnersPostsData);
}

async function showFilterPosts(kind, county, district, date) {
  const filterResponse = await fetch(
    `/api/getFindOwnersPosts?kind=${kind}&county=${county}&district=${district}&date=${date}`
  );
  const filterData = await filterResponse.json();
  deleteElement();
  if (filterData.length > 0) {
    createElement(filterData);
  } else {
    const postDiv = document.querySelector(".posts");
    postDiv.innerHTML = `<h5> 資料不存在 </h5>`;
  }
}

function createElement(data) {
  const postDiv = document.querySelector(".posts");
  data.map((pet) => {
    const box = document.createElement("div");
    const a = document.createElement("a");
    const img = document.createElement("img");
    const title = document.createElement("div");
    box.className = "box";
    title.className = "title";
    title.innerText = `${pet.county}${pet.district}`;
    a.href = `/findowners/detail.html?id=${pet.id}`;
    img.src = `https://d3271x2nhsfyjz.cloudfront.net/findowners/${pet.photo}`;
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
