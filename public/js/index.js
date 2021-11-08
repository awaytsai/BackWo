const token = localStorage.getItem("access_token");
const parentDiv = document.querySelector(".successful-cases");

getMatchCase();

// show 3 latest cases
async function getMatchCase() {
  const response = await fetch("/api/getSuccessCase");
  const matchData = await response.json();
  //   createCase(matchData);
}

function createCase(data) {
  data.map((post) => {
    let name = post.name;
    // find owner photo
    if (!post.name || !post.photo) {
      name = "";
    }
    const div = document.createElement("div");
    div.className = "case";
    div.innerHTML = `
    <img src="${post.photo}"/>
    <div class="finder">
        <img src="${post.finderPic}"/>
        <div class="finder-name">${post.name}</div>
    </div>
    <div class="thankyou-message">${post.thankyou}</div>`;
    parentDiv.appendChild(div);
  });
}
