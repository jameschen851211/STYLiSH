function logout() {
  FB.logout((response) => {
    console.log(response);
  });
  alert('成功登出');
  // redirect
  window.location.href = './';
}

function statusChangeCallback(response) {
  if (response.status === 'connected') {
    fetch('https://api.appworks-school.tw/api/1.0/user/signin', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'facebook',
        access_token: response.authResponse.accessToken,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .catch((error) => console.error('Error:', error))
      .then((res) => {
        document.getElementById('member__img').src = res.data.user.picture;
        document.getElementById('member__name').textContent = res.data.user.name;
        document.getElementById('member__email').textContent = res.data.user.email;
      });
  } else if (response.status === 'not_authorized' || response.status === 'unknown') {
    alert('尚未登入Facebook帳號');
    window.location.href = './';
  }
}

document.getElementsByClassName('member')[0].addEventListener('click', () => {
  alert('已在會員頁面');
});

document.getElementById('member__logout').addEventListener('click', logout);

// Facebook SDK
window.fbAsyncInit = function () {
  FB.init({
    appId: '4248301728618895',
    cookie: true,
    xfbml: true,
    version: 'v11.0',
  });

  FB.AppEvents.logPageView();

  FB.getLoginStatus((response) => {
    statusChangeCallback(response);
  });
};
(function (d, s, id) {
  const fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  const js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
