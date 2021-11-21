window.fbAsyncInit = function () {
  FB.init({
    appId: "700343897588452",
    autoLogAppEvents: true,
    xfbml: true,
    version: "v12.0",
  });
};

FB.getLoginStatus(function (response) {
  statusChangeCallback(response);
});

FB.login(function (response) {
  if (response.status === "connected") {
    // Logged into your webpage and Facebook.
    console.log("login");
  } else {
    // The person is not logged into your webpage or we are unable to tell.
    console.log("not login");
  }
});
