window.fbAsyncInit = function () {
  FB.init({
    appId: "700343897588452",
    cookie: true,
    xfbml: true,
    version: "v12.0",
  });
};

function statusChangeCallback(response) {
  if (response.status === "connected") {
    const accessToken = response.authResponse.accessToken;
    facebookLogin(accessToken);
  } else {
    Swal.fire({
      icon: "info",
      text: "請先登入facebook",
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

function checkLoginState() {
  FB.getLoginStatus(function (response) {
    FB.AppEvents.logPageView();
    statusChangeCallback(response);
  });
}

async function facebookLogin(accessToken) {
  let body = {
    provider: "facebook",
    access_token: accessToken,
  };
  const res = await fetch("/api/member/facebooksignin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) {
    Swal.fire({
      icon: "info",
      text: "請重新註冊",
      showConfirmButton: false,
      timer: 1500,
    });
  }
  if (data.access_token) {
    window.localStorage.setItem("access_token", data.access_token);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "登入成功",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/profile.html";
    }, 1600);
  }
}
