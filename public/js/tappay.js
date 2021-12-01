const APP_ID = 12348;
const APP_KEY = 'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF';
TPDirect.setupSDK(APP_ID, `${APP_KEY}`, 'sandbox');

const fields = {
  number: {
    element: '#card-number',
    placeholder: '**** **** **** ****',
  },
  expirationDate: {
    element: '#card-expiration-date',
    placeholder: 'MM / YY',
  },
  ccv: {
    element: '#card-ccv',
    placeholder: '後三碼',
  },
};

TPDirect.card.setup({
  fields,

  styles: {
    input: {
      color: 'gray',
    },
    ':focus': {
      color: 'black',
    },
    '.valid': {
      color: 'green',
    },
    '.invalid': {
      color: 'red',
    },
  },
});
// 當選擇商品數為0時給cart一個空值[]
if (localStorage.getItem('stylishCart') == null) {
  localStorage.setItem('stylishCart', JSON.stringify([]));
}
// 客戶訂單基本資料檢查
let token;
const productListAll = JSON.parse(localStorage.getItem('stylishCart'));
const checkOutDatails = { order: {} };

function checkCustomerInfo() {
  const coustomerName = document.getElementById('name');
  const coustomerEmail = document.getElementById('email');
  const coustomerPhone = document.getElementById('phone');
  const coustomerAddress = document.getElementById('address');

  checkOutDatails.order.recipient = {};

  if (productListAll.length === 0) {
    alert('還未選購商品');
    return false;
  } if (coustomerName.value === '') {
    alert('請填寫收件人姓名');
    return false;
  }
  checkOutDatails.order.recipient.name = coustomerName.value;

  if (coustomerEmail.value === '') {
    alert('請填入Email');
    return false;
  } if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(coustomerEmail.value)) {
    alert('請填寫正確Email格式');
    return false;
  }
  checkOutDatails.order.recipient.email = coustomerEmail.value;
  if (coustomerPhone.value === '') {
    alert('請輸入手機號碼');
    return false;
  } if (!/^\d{10}$/.test(coustomerPhone.value)) {
    alert('請輸入有效手機號碼');
    return false;
  }
  checkOutDatails.order.recipient.phone = coustomerPhone.value;
  if (coustomerAddress.value === '') {
    alert('請填寫寄件地址');
    return false;
  }
  checkOutDatails.order.recipient.address = coustomerAddress.value;

  const coustomerTime = document.getElementsByClassName('victor');
  for (let i = 0; i < coustomerTime.length; i++) {
    if (coustomerTime[i].checked === true) {
      checkOutDatails.order.recipient.time = coustomerTime[i].value;
      return true;
    }
  }
  return false;
}

// FB function initialization
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
  if (d.getElementById(id)) {
    return;
  }
  const js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function postCheckOutData() {
  fetch('https://api.appworks-school.tw/api/1.0/order/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(checkOutDatails),
  })
    .then((res) => res.json())
    .then((res) => {
      localStorage.removeItem('stylishCart');
      window.location.href = `./thankyou.html?number=${res.data.number}`;
    });
}

// Get access token or ask user to login
function statusChangeCheckoutCallback(response) {
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
      .then((res) => {
        token = res.data.access_token;
      })
      .then(() => { postCheckOutData(); })
      .catch((error) => console.error('Error:', error));
  } else {
    alert('請先登入會員');
  }
}

function checkOut() {
  const checkInfoComplete = checkCustomerInfo(checkOutDatails);
  if (checkInfoComplete) {
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    // get Prime
    if (tappayStatus.canGetPrime === false) {
      if (tappayStatus.status.number === 1
        && tappayStatus.status.expiry === 1
        && tappayStatus.status.ccv === 1) {
        alert('請輸入信用卡資料');
      } else if (tappayStatus.status.number !== 0) {
        alert('信用卡號碼有誤');
      } else if (tappayStatus.status.expiry !== 0) {
        alert('有效期限有誤');
      } else if (tappayStatus.status.ccv !== 0) {
        alert('安全碼有誤');
      }
      return;
    }
    for (let i = 0; i < productListAll.length; i++) {
      delete productListAll[i].stock;
    }
    checkOutDatails.order.list = productListAll;
    checkOutDatails.order.shipping = 'delivery';
    checkOutDatails.order.payment = 'credit_card';
    checkOutDatails.order.subtotal = parseInt(document.querySelector('#subtotal .value span').innerText, 10);
    checkOutDatails.order.freight = 60;
    checkOutDatails.order.total = parseInt(document.querySelector('#total .value span').innerText, 10);

    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        alert(`信用卡資料取得異常：${result.msg}`);
        return;
      }
      checkOutDatails.prime = result.card.prime;
    });

    FB.getLoginStatus((response) => {
      statusChangeCheckoutCallback(response);
    });
  }
}
document.getElementById('checkout').addEventListener('click', checkOut);
