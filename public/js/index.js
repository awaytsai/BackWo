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
    let time = new Date(Date.parse(post.update_time))
      .toLocaleString("en-US")
      .split(", ")[0];
    const div = document.createElement("div");
    div.className = "case";
    div.innerHTML = `
    <img src="${post.photo}"/>
    <div class="finder-wrap">
        <div class="finder">
            <img src="${post.picture}"/>
            <div class="finder-name">${post.name}</div>
        </div>
        <div>${time}</div>
    </div>
    <div class="thank-title"> 感謝留言：</div>
    <div class="thankyou-message">${post.thank_message}</div>`;
    parentDiv.appendChild(div);
  });
}
