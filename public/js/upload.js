const dogBtn = document.querySelector(".doglabel");
const catBtn = document.querySelector(".catlabel");
const breedSelect = document.getElementById("breedselect");
const uploadBtn = document.querySelector(".uploadBtn");
const formData = document.querySelector(".uploadform");
const token = localStorage.getItem("access_token");
const urlParam = window.location.href;
let breedList;
let person;

async function loadBreedList() {
  const response = await fetch("/api/breeds");
  breedList = await response.json();
  breedList.dog_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
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

function addOptions(breed, breedSelect) {
  const option = document.createElement("option");
  option.id = "pets";
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

function petKindChange() {
  const input = document.querySelector(".other-breed");
  input.style.display = "none";
}

function uploadImgPreview() {
  const preview = document.querySelector(".preview");
  const file = document.querySelector("input[type=file]").files[0];
  const reader = new FileReader();
  reader.addEventListener(
    "load",
    function () {
      preview.src = reader.result;
    },
    false
  );
  if (file) {
    reader.readAsDataURL(file);
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
    uploadImgPreview();
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

function checkPerson(urlParam) {
  if (urlParam.includes("findowners")) {
    person = "findowners";
  }
  if (urlParam.includes("findpets")) {
    person = "findpets";
  }
}

async function alertLoading() {
  Swal.fire({
    html: "Loading...",
    timer: 2000,
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
}

// show dog options
dogBtn.addEventListener("click", () => {
  const options = document.querySelectorAll("#pets");
  options.forEach((o) => {
    breedSelect.removeChild(o);
  });
  breedList.dog_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
});

// show cat options
catBtn.addEventListener("click", () => {
  const options = document.querySelectorAll("#pets");
  options.forEach((o) => {
    breedSelect.removeChild(o);
  });
  breedList.cat_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
});

// listen on pet kind change
const petKindRadio = document.querySelectorAll(".btn-check");
for (i = 0; i < petKindRadio.length; i++) {
  petKindRadio[i].onclick = function () {
    petKindChange();
  };
}

uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  uploadPost();
});

async function uploadPost() {
  try {
    const address = document.querySelector(".address");
    const county = document.querySelector(".filtercounty");
    const date = document.querySelector("#datepicker");
    const photo = document.querySelector("#formFile");
    const note = document.querySelector(".note-message");
    // error handling
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
        text: "請填寫尋獲區域",
      });
    } else if (!address.value) {
      Swal.fire({
        icon: "info",
        text: "請填寫尋獲地點",
      });
    } else if (!date.value) {
      Swal.fire({
        icon: "info",
        text: "請填寫尋獲時間",
      });
    } else if (!photo.value) {
      Swal.fire({
        icon: "info",
        text: "請上傳一張照片，格式限定 .jpg 或 .jpeg",
      });
    } else if (note.value.length > 250) {
      Swal.fire({
        icon: "info",
        text: "字數過多，請勿超過250字",
      });
    } else {
      await alertLoading();
      checkPerson(urlParam);
      const response = await fetch(`/api/${person}/posts`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: new FormData(formData),
      });
      const result = await response.json();
      if (result.message) {
        Swal.fire({
          icon: "info",
          text: `${result.message}`,
        });
      } else {
        if (result.status == "updated") {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "上傳成功",
            showConfirmButton: false,
            timer: 1500,
          });
          setTimeout(() => {
            window.location.href = `/${person}.html`;
          }, 1700);
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

loadBreedList();
