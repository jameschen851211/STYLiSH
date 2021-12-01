function login() {
  FB.login((response) => {
    if (response.status === 'connected') {
      alert('登入成功');
    } else {
      alert('無法登入Facebook帳號');
      window.location.href = './';
    }
  }, {
    scope: 'public_profile, email',
  });
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
      .then(() => {
        window.location.href = './member.html';
      });
  } else if (response.status === 'not_authorized' || response.status === 'unknown') {
    alert('尚未登入Facebook帳號');
    // location.href = "./"
    login();
  }
}

// Facebook SDK
function faceBookInitial() {
  window.fbAsyncInit = function () {
    FB.init({
      appId: '4248301728618895',
      cookie: true,
      xfbml: true,
      version: 'v11.0',
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

  document.getElementsByClassName('member')[0].addEventListener('click', () => {
    FB.getLoginStatus((response) => {
      statusChangeCallback(response);
    });
  });

  document.getElementsByClassName('member')[1].addEventListener('click', () => {
    FB.getLoginStatus((response) => {
      statusChangeCallback(response);
    });
  });
}
faceBookInitial();
