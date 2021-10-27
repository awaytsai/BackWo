// sign in
const signin = document.querySelector(".signin");
const signup = document.querySelector(".signup");

// sign up
signup.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.querySelector("#signupname").value;
  const email = document.querySelector("#signupemail").value;
  const password = document.querySelector("#signuppassword").value;
  if (!email || !password) {
    Swal.fire({
      icon: "info",
      text: "請輸入名字、email 和密碼",
    });
  } else {
    const body = {
      name: name,
      email: email,
      password: password,
    };
    signUp(body);
  }
});

async function signUp(body) {
  try {
    const param = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    };
    const response = await fetch("/api/member/signup", param);
    const result = await response.json();
    if (result.error) {
      Swal.fire({
        icon: "info",
        text: `${result.error}`,
      });
    } else {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "註冊成功",
        showConfirmButton: false,
        timer: 1000,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

// sign in
signin.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.querySelector("#signinemail").value;
  const password = document.querySelector("#signinpassword").value;
  if (!email || !password) {
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
  try {
    const param = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    };
    const response = await fetch("/api/member/signin", param);
    const result = await response.json();
    console.log(result);
    if (result.error) {
      Swal.fire({
        icon: "info",
        text: `${result.error}`,
      });
    } else {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "註冊成功",
        showConfirmButton: false,
        timer: 1000,
      });
      // redirect to profile page
    }
  } catch (err) {
    console.log(err);
  }
}
