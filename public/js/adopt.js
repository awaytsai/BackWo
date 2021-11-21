const token = localStorage.getItem("access_token");
// const region = document.querySelector(".region");
const shelterSelect = document.querySelector(".shelter");
const posts = document.querySelector(".adopt-posts");
let paging = 0;
let shelters;
let kind;
let region;
let shelter;
const action = [];

// render shelter
loadShelter();
async function loadShelter() {
  const response = await fetch("/api/getShelters");
  shelters = await response.json();
  console.log(shelters);
  shelters.shelterNorth.forEach((shelter) => {
    addOptions(shelter);
  });
}

function addOptions(shelter) {
  const option = document.createElement("option");
  option.value = shelter;
  option.id = "shelter";
  option.innerHTML = shelter;
  shelterSelect.appendChild(option);
}

function toggle(option) {
  const value = option.value;
  changeRegion(shelterList[value]);
}

const shelterList = {
  北部: "shelterNorth",
  中部: "shelterCentral",
  南部: "shelterSouth",
  東部: "shelterEast",
  外島: "shelterIsland",
};

function changeRegion(region) {
  const options = document.querySelectorAll("#shelter");
  options.forEach((o) => {
    shelterSelect.removeChild(o);
  });
  shelters[region].forEach((shelter) => {
    addOptions(shelter);
  });
}

// all adopt post
getAdoptData(paging);

let adoptData;
async function getAdoptData() {
  try {
    const response = await fetch(`/api/getAdoptData?paging=${paging}`);
    adoptData = await response.json();
    console.log(adoptData);
    createPost(adoptData.adoptData);
    action.pop();
    action.push("all");
    console.log(action);
  } catch (err) {
    console.log(err);
  }
}

function createPost(adoptData) {
  adoptData.map((data) => {
    const div = document.createElement("div");
    const a = document.createElement("a");
    const img = document.createElement("img");
    const title = document.createElement("div");
    div.className = "box";
    a.href = data.link;
    a.target = "_blank";
    img.src = data.album_file;
    img.classList = "adopt-image";
    img.onerror = imgError(this);
    if (!data.album_file) {
      img.src =
        "https://www.lvh.com.au/wp-content/uploads/2019/06/lvh-logo-1.png";
      img.classList.add("default");
    }
    title.className = "post-title";
    title.textContent = data.animal_place;
    posts.appendChild(div);
    div.appendChild(a);
    a.appendChild(img);
    div.appendChild(title);
  });
  const updateTime = document.querySelector(".update-time");
  console.log(adoptData[0].update_time);
  let time = new Date(Date.parse(adoptData[0].update_time))
    .toLocaleString("en-US")
    .split(", ")[0];
  updateTime.textContent = `更新時間: ${time}`;
}

function imgError(image) {
  image.src =
    "https://www.lvh.com.au/wp-content/uploads/2019/06/lvh-logo-1.png";
  image.classList = "default, adopt-image";
}

function deleteElement() {
  const postDiv = document.querySelector(".adopt-posts");
  postDiv.innerHTML = "";
}

// filter
const applyBtn = document.querySelector(".apply");
applyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  paging = 0;
  kind = document.querySelector(".filterkind").value;
  region = document.querySelector(".region").value;
  shelter = document.querySelector(".shelter").value;
  // check if inut null
  if (kind && region && shelter) {
    showFilterPosts(kind, region, shelter);
  } else {
    Swal.fire({
      icon: "info",
      text: `請選擇全部篩選項目`,
    });
  }
});

let filterData;
async function showFilterPosts(kind, region, shelter) {
  const response = await fetch(
    `/api/getAdoptData?kind=${kind}&region=${region}&shelter=${shelter}&paging=${paging}`
  );
  filterData = await response.json();
  console.log("filterData");
  console.log(filterData);
  deleteElement();
  action.pop();
  action.push("filter");
  console.log(action);
  if (filterData.filterData.length > 0) {
    createPost(filterData.filterData);
  } else {
    const postDiv = document.querySelector(".adopt-posts");
    postDiv.innerHTML = `<h5> 資料不存在 </h5>`;
    action.pop();
    action.push("filter");
  }
}

// region
const north = document.querySelector(".north");
const central = document.querySelector(".central");
const south = document.querySelector(".south");
const east = document.querySelector(".east");
const island = document.querySelector(".island");
const regions = [];
regions.push(north, central, south, east, island);

const regionList = {
  north: "北部",
  central: "中部",
  south: "南部",
  east: "東部",
  island: "外島",
};

regions.map((r) => {
  r.addEventListener("click", (e) => {
    paging = 0;
    const classNam = e.target.className;
    kind = "全部";
    region = regionList[classNam];
    shelter = "all";
    getRegionData(kind, region, shelter);
  });
});

let regionData;
async function getRegionData(kind, region, shelter) {
  const response = await fetch(
    `/api/getAdoptData?kind=${kind}&region=${region}&shelter=${shelter}&paging=${paging}`
  );
  regionData = await response.json();
  console.log("regionData");
  console.log(regionData);
  deleteElement();
  if (regionData.regionData.length > 0) {
    createPost(regionData.regionData);

    action.pop();
    action.push("region");
    console.log(action);
  } else {
    const postDiv = document.querySelector(".adopt-posts");
    postDiv.innerHTML = `<h5> 資料不存在 </h5>`;
    action.pop();
    action.push("region");
    console.log(action);
  }
}

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (clientHeight + scrollTop >= scrollHeight - 1) {
    paging++;
    // check adopt/filter/region data
    if (action[0] == "all") {
      Swal.fire({
        html: "Loading.",
        timer: 500,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      getAdoptData(paging);
    }
    if (action[0] == "filter") {
      if (filterData.nextPaging) {
        Swal.fire({
          html: "Loading...",
          timer: 500,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            const b = Swal.getHtmlContainer().querySelector("b");
            timerInterval = setInterval(() => {
              b.textContent = Swal.getTimerLeft();
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        });
        showFilterPosts(kind, region, shelter);
      }
    }
    if (action[0] == "region") {
      if (regionData.nextPaging) {
        Swal.fire({
          html: "Loading.",
          timer: 500,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        getRegionData(kind, region, shelter);
      }
    }
  }
});
