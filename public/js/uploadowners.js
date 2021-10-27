const dog = document.querySelector(".doglabel");
const cat = document.querySelector(".catlabel");
const breedSelect = document.getElementById("breedselect");
let breedList;

loadBreedList();
async function loadBreedList() {
  const response = await fetch("/api/getBreeds");
  breedList = await response.json();
  // add dog options(default)
  breedList.dog_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
}

// show dog options
dog.addEventListener("click", () => {
  // remove all options if existed
  const options = document.querySelectorAll("#pets");
  options.forEach((o) => {
    breedSelect.removeChild(o);
  });
  // add dog options
  breedList.dog_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
});

// show cat options
cat.addEventListener("click", () => {
  // remove all options if existed
  const options = document.querySelectorAll("#pets");
  options.forEach((o) => {
    breedSelect.removeChild(o);
  });
  // add cat options
  breedList.cat_breed.forEach((breed) => {
    addOptions(breed, breedSelect);
  });
});

// submit form data
const uploadBtn = document.querySelector(".uploadBtn");
const formData = document.querySelector(".uploadform");

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
    if (county.value == "") {
      Swal.fire({
        icon: "info",
        text: "請填寫走失區域",
      });
    } else if (!address.value) {
      Swal.fire({
        icon: "info",
        text: "請填寫走失地點",
      });
    } else if (!date.value) {
      Swal.fire({
        icon: "info",
        text: "請填寫走失時間",
      });
    } else if (!photo.value) {
      Swal.fire({
        icon: "info",
        text: "請上傳一張照片，格式限定 .jpg 或 .jpeg",
      });
    } else {
      const response = await fetch("/api/findowners/upload", {
        method: "POST",
        // headers: {
        //     Authorization: "Bearer " + token,
        //   },
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
            window.location = "/findowners.html";
          }, 1700);
        }
      }
    }
  } catch (err) {
    console.log(err);
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

// listen on radio change
const radio = document.querySelectorAll(".btn-check");
for (i = 0; i < radio.length; i++) {
  radio[i].onclick = function () {
    radioChange();
  };
}
function radioChange() {
  console.log("change");
  const input = document.querySelector(".other-breed");
  input.style.display = "none";
}
