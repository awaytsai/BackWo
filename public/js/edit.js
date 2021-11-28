const token = localStorage.getItem("access_token");
const id = location.href.split("?id=")[1];
const breedSelect = document.getElementById("breedselect");
const dog = document.querySelector(".doglabel");
const cat = document.querySelector(".catlabel");
const uploadBtn = document.querySelector(".uploadBtn");

const breeds = [];
let person;
const urlParam = window.location.href;
checkPerson(urlParam);

function checkPerson(urlParam) {
  if (urlParam.includes("findowners")) {
    person = "findowners";
  }
  if (urlParam.includes("findpets")) {
    person = "findpets";
  }
}

loadBreedList();
async function loadBreedList() {
  const response = await fetch("/api/getBreeds");
  breedList = await response.json();
  breeds.push(breedList.dog_breed, breedList.cat_breed);
  breedList.dog_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
  getExistingPostData();
}

async function getExistingPostData() {
  const response = await fetch(
    `/api/findpost/edit/detail?id=${id}&tag=${person}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  const postData = await response.json();
  if (postData.message) {
    Swal.fire({
      icon: "info",
      text: "頁面不存在",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1600);
  }
  fillInData(postData);
}

// show dog options
dog.addEventListener("click", () => {
  const options = document.querySelectorAll("#pets");
  options.forEach((o) => {
    breedSelect.removeChild(o);
  });
  breedList.dog_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
});

// show cat options
cat.addEventListener("click", () => {
  const options = document.querySelectorAll("#pets");
  options.forEach((o) => {
    breedSelect.removeChild(o);
  });
  breedList.cat_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
});

// add breed options
async function addOptions(breed, breedSelect) {
  const option = document.createElement("option");
  option.id = "pets";
  option.value = breed;
  option.innerHTML = breed;
  if (breed == "未知") {
    option.selected = "selected";
  }
  if (breed == "其他") {
    option.className = "other";
  }
  breedSelect.appendChild(option);
  // check if breed name input existed
  const breedInput = document.querySelector(".other-breed");
  if (!breedInput) {
    renderBreedInput(breed);
  }
}

function renderBreedInput(breed) {
  if (breed == "其他") {
    const other = document.querySelector(".breed-other");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "other-breed";
    input.name = "breedName";
    input.style.display = "none";
    input.placeholder = "其他品種";
    other.appendChild(input);
  }
}

function toggle(option) {
  const value = option.value;
  if (value == "其他") {
    const input = document.querySelector(".other-breed");
    input.style.display = "block";
  } else {
    const input = document.querySelector(".other-breed");
    input.style.display = "none";
  }
}

// listen on radio change
const radio = document.querySelectorAll(".btn-check");
for (i = 0; i < radio.length; i++) {
  radio[i].onclick = function () {
    radioChange();
  };
}
function radioChange() {
  const input = document.querySelector(".other-breed");
  input.style.display = "none";
}

// image preview
function preview() {
  const preview = document.querySelector(".preview");
  const file = document.querySelector("input[type=file]").files[0];
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      // convert image file to base64 string
      preview.src = reader.result;
    },
    false
  );
  if (file) {
    reader.readAsDataURL(file);
  }
}

// rednder existing post data
function fillInData(data) {
  // kind
  let kind;
  let breed;
  if (data.kind == "狗") {
    kind = document.querySelector("#btn-check-outlined");
  }
  if (data.kind == "貓") {
    kind = document.querySelector("#btn-check-2-outlined");
    const options = document.querySelectorAll("#pets");
    options.forEach((o) => {
      breedSelect.removeChild(o);
    });
    breedList.cat_breed.forEach((breed) => {
      addOptions(breed, breedSelect);
    });
  }
  kind.checked = true;
  // check if breed not in breedlist
  breed = document.querySelector("#breedselect");
  breed.value = data.breed;
  if (!breeds[0].includes(data.breed) && !breeds[1].includes(data.breed)) {
    const input = document.querySelector(".other-breed");
    input.style.display = "block";
    breed.value = "其他";
    otherbreed = document.querySelector(".other-breed");
    otherbreed.value = data.breed;
  }

  // color
  const color = document.querySelector(`#${data.color}`);
  color.selected = true;
  // county/ district
  $("#twzipcode").twzipcode("set", {
    county: `${data.county}`,
    district: `${data.district}`,
    zipcode: 110,
  });
  // address
  const address = document.querySelector(".address");
  address.value = `${data.address}`;
  // date
  $("#datepicker").datepicker("setDate", new Date(`${data.date}`));
  // note
  const note = document.querySelector(".note-message");
  note.value = `${data.note}`;
  // image
  const originalPhoto = document.querySelector(".original-photo");
  originalPhoto.src = `${data.photo}`;
}

const file = document.querySelector("#formFile");

uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const address = document.querySelector(".address");
  const county = document.querySelector(".filtercounty");
  const date = document.querySelector("#datepicker");
  const photo = document.querySelector("#formFile");
  const note = document.querySelector(".note-message");

  if (token == null) {
    Swal.fire({
      icon: "info",
      text: "請先登入或註冊",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/member.html";
    }, 1600);
  } else if (county.value == "") {
    Swal.fire({
      icon: "info",
      text: "請填寫走失/尋獲區域",
    });
  } else if (!address.value) {
    Swal.fire({
      icon: "info",
      text: "請填寫走失/尋獲地點",
    });
  } else if (!date.value) {
    Swal.fire({
      icon: "info",
      text: "請填寫走失/尋獲時間",
    });
  } else if (note.value.length > 250) {
    Swal.fire({
      icon: "info",
      text: "字數過多，請勿超過250字",
    });
  } else {
    // check if upload images again
    if (file.value == "") {
      // update db only
      updatefield();
    } else {
      updateWithImage();
    }
  }
});

const formData = document.querySelector(".uploadform");
async function updatefield() {
  const response = await fetch(
    `/api/${person}/updatePostdata?id=${id}&tag=${person}`,
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: new FormData(formData),
    }
  );
  const result = await response.json();
  if (
    result.message == "請填寫所有欄位" ||
    result.message == "日期格式錯誤" ||
    result.message == "字數過多，請勿超過250字"
  ) {
    // alert fill in all the blank
    Swal.fire({
      icon: "info",
      text: `${result.message}`,
      showConfirmButton: false,
      timer: 1500,
    });
  }
  if (result.message == "頁面不存在") {
    Swal.fire({
      icon: "info",
      text: "頁面不存在",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1600);
  }
  if (result.status == "updated") {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "上傳成功",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1700);
  }
}

async function updateWithImage() {
  const response = await fetch(
    `/api/${person}/updateWithImage?id=${id}&tag=${person}`,
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: new FormData(formData),
    }
  );
  const result = await response.json();
  if (
    result.message == "請填寫所有欄位" ||
    result.message == "日期格式錯誤" ||
    result.message == "字數過多，請勿超過250字"
  ) {
    Swal.fire({
      icon: "info",
      text: `${result.message}`,
      showConfirmButton: false,
      timer: 1500,
    });
  }
  if (result.message == "noPostExistById" || result.message == "noaccess") {
    Swal.fire({
      icon: "info",
      text: "頁面不存在",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1600);
  }
  if (result.status == "updated") {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "上傳成功",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1700);
  }
}

function validatePhoto(input) {
  const fileNum = input.files.length;
  const file1Size = input.files[0].size / 1024 / 1024;
  let file2Size;
  if (fileNum > 1) {
    file2Size = input.files[1].size / 1024 / 1024;
  }
  if (fileNum > 2) {
    Swal.fire({
      icon: "info",
      text: "圖片僅限兩張",
      showConfirmButton: true,
      timer: 1500,
    });
    const uploadInput = document.querySelector("#formFile");
    uploadInput.value = "";
  }
  if (file1Size > 3 || file2Size > 3) {
    Swal.fire({
      icon: "info",
      text: "檔案大小請勿超過3MB",
      showConfirmButton: true,
      timer: 1500,
    });
    const uploadInput = document.querySelector("#formFile");
    uploadInput.value = "";
  } else {
    preview();
  }
}

function validateMorePhoto(input) {
  const fileNum = input.files.length;
  const file1Size = input.files[0].size / 1024 / 1024;
  let file2Size;
  if (fileNum > 1) {
    file2Size = input.files[1].size / 1024 / 1024;
  }
  if (fileNum > 2) {
    Swal.fire({
      icon: "info",
      text: "圖片僅限兩張",
      showConfirmButton: true,
      timer: 1500,
    });
    const uploadInput = document.querySelector("#formFileMore");
    uploadInput.value = "";
  }
  if (file1Size > 3 || file2Size > 3) {
    Swal.fire({
      icon: "info",
      text: "檔案大小請勿超過3MB",
      showConfirmButton: true,
      timer: 1500,
    });
    const uploadInput = document.querySelector("#formFileMore");
    uploadInput.value = "";
  }
}
