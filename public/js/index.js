const token = localStorage.getItem("access_token");
const parentDiv = document.querySelector(".successful-cases");

getMatchCase();

// show 3 latest cases
async function getMatchCase() {
  const response = await fetch("/api/getSuccessCase");
  const matchData = await response.json();
  console.log(matchData);
  createCase(matchData);
}

function createCase(data) {
  data.map((post) => {
    let time = new Date(Date.parse(post.matchTime))
      .toLocaleString("en-US")
      .split(", ")[0];
    post.matchTime = time;
    const div = document.createElement("div");
    div.className = "case";
    div.innerHTML = `
    <img src="${post.postPic}"/>
    <div class="finder-wrap">
        <div class="finder">
            <img src="${post.userPic}"/>
            <div class="finder-name">${post.userName}</div>
        </div>
        <div>${time}</div>
    </div>
    <div> 感謝留言：</div>
    <div class="thankyou-message">${post.message}</div>`;
    parentDiv.appendChild(div);
  });
}
