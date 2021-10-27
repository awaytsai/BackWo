// sign in
const signin = document.querySelector(".signin");
const signup = document.querySelector(".signup");

// sign up
signup.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.querySelector("#signupname").value;
  const email = document.querySelector("#signinemail").value;
  const password = document.querySelector("#signinpassword").value;
  if (!(email || password)) {
    Swal.fire({
      icon: "info",
      text: "請輸入名字、email 和密碼",
    });
  }
  const body = {
    name: name,
    email: email,
    password: password,
  };
  signUp(body);
});

async function signUp(body) {
  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  };
  const response = await fetch("/api/member/signup", param);
  const result = response.json();
}

// sign in
signin.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#signinemail").value;
  const password = document.querySelector("#signinpassword").value;
  if (!(email || password)) {
    Swal.fire({
      icon: "info",
      text: "請輸入 email 和密碼",
    });
  }
  const body = {
    email: email,
    password: password,
  };
  signIn(body);
});

async function signIn(body) {
  const param = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  };
  const response = await fetch("/api/member/signin", param);
  const result = response.json();
}
