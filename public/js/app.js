const divContainer = document.getElementById('products');
let paging = 0;

function ajax(src, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const data = JSON.parse(xhr.responseText);
      callback(data);
    }
  };
  xhr.open('GET', src);
  xhr.send();
}

function render(data) {
  // 取得頁碼資料，方便後續 infinite scroll 使用
  paging = data.next_paging;

  if (data.data.length === 0) {
    const notFound = document.getElementById('not_found');
    divContainer.style.display = 'none';
    notFound.style.display = 'block';
  } else {
    data.data.forEach((e) => {
      const a = document.createElement('a');
      const img = document.createElement('img');
      const productColors = document.createElement('div');
      const productTitle = document.createElement('div');
      const productPrice = document.createElement('div');

      a.classList.add('product');
      productColors.classList.add('product_colors');
      productTitle.classList.add('product_title');
      productPrice.classList.add('product_price');

      // 處理圖片
      img.src = e.main_image;
      img.alt = 'product-img';

      // 處理商品標題
      const titleTxt = document.createTextNode(e.title);
      productTitle.appendChild(titleTxt);

      // 處理商品價格
      const priceTxt = document.createTextNode(`TWD.${e.price}`);
      productPrice.appendChild(priceTxt);

      // 處理商品顏色
      e.colors.forEach((event) => {
        const productColor = document.createElement('div');
        productColor.classList.add('product_color');
        productColor.style.backgroundColor = `#${event.code}`;
        productColors.appendChild(productColor);
      });
      // 增加商品頁的超連結
      a.href = `./product.html?id=${e.id}`;

      a.appendChild(img);
      a.appendChild(productColors);
      a.appendChild(productTitle);
      a.appendChild(productPrice);
      divContainer.appendChild(a);
    });
  }
}

const url = 'https://api.appworks-school.tw/api/1.0/products/';
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const category = urlParams.get('tag');

if (queryString === '') {
  ajax(`${url}all`, render);
} else if (category === 'men') {
  ajax(`${url}men`, render);
} else if (category === 'women') {
  ajax(`${url}women`, render);
} else if (category === 'accessories') {
  ajax(`${url}accessories`, render);
}

const keyword = window.location.search;
if (keyword.split('=')[0] === '?keyword') {
  ajax(`${url}search${keyword}`, render);
}

// scroll可讓畫面滑動到下一頁
window.addEventListener('scroll', () => {
  const { scrollTop } = document.documentElement;
  const { scrollHeight } = document.documentElement;
  const { clientHeight } = document.documentElement;

  if (scrollTop + clientHeight === scrollHeight) {
    let more;
    if (category) {
      more = `${url}${category}?paging=${paging}`;
    } else {
      more = `${url}all?paging=${paging}`;
    }
    if (paging === undefined) {
      return;
    }

    ajax(more, render);
  }
});

// 製作 campaign 輪播功能
const campaign = document.getElementById('campaigns');
const campaignImg = document.getElementsByClassName('campaign');
const dot = document.getElementsByClassName('dot');

// campaign 圖片自動輪播，讓 campaign--active 這個 class 名稱自動在不同的圖片上切換
let slideIndex = 0;
function startAutoPlay() {
  const campaignLength = campaignImg.length;
  setInterval(() => {
    campaignImg[slideIndex].classList.remove('campaign--active');
    dot[slideIndex].classList.remove('dot--active');
    if (slideIndex >= (campaignLength - 1)) {
      campaignImg[0].classList.add('campaign--active');
      dot[0].classList.add('dot--active');
      slideIndex = 0;
    } else {
      campaignImg[slideIndex + 1].classList.add('campaign--active');
      dot[slideIndex + 1].classList.add('dot--active');
      slideIndex += 1;
    }
  }, 2000);
}

function buttonActive(i) {
  // 先把目前的 active 清掉
  const currentDot = document.getElementsByClassName('dot--active');
  const currentCampaign = document.getElementsByClassName('campaign--active');
  currentDot[0].className = currentDot[0].className.replace(' dot--active', '');
  currentCampaign[0].className = currentCampaign[0].className.replace(' campaign--active', '');
  // 在點擊的地方加上 active
  dot[i].classList.add('dot--active');
  campaignImg[i].classList.add('campaign--active');
  // 調整自動輪播的順序從點擊處開始
  slideIndex = i;
}

// 按點點會出現相對應的 campaign 圖片
function clickButton() {
  for (let i = 0; i < dot.length; i++) {
    dot[i].addEventListener('click', () => buttonActive(i));
  }
}

function renderCampaign(data) {
  // 將 campaign 的圖片寫進 HTML 中
  data.data.forEach((e) => {
    const a = document.createElement('a');
    const campaignStory = document.createElement('div');

    a.classList.add('campaign');
    campaignStory.classList.add('campaign_story');
    // 加入 background image
    a.style.backgroundImage = `url(${e.picture})`;

    // 加入連結
    a.href = `./product.html?id=${e.product_id}`;

    // 加入 campaign story text
    const campaignTxt = document.createTextNode(`${e.story}`);
    campaignStory.appendChild(campaignTxt);
    // 結合所有子集合
    a.appendChild(campaignStory);
    campaign.appendChild(a);
  });
  // 將“dots”寫進 HTML 中
  const dots = document.createElement('div');
  dots.classList.add('dots');
  for (let i = 0; i < data.data.length; i++) {
    const dotDiv = document.createElement('div');
    dotDiv.classList.add('dot');
    dots.appendChild(dotDiv);
  }
  campaign.appendChild(dots);

  // 先把第一張圖和第一個點點放進動畫初始頁面
  campaignImg[0].classList.add('campaign--active');
  dot[0].classList.add('dot--active');
  // 啟動輪播的功能
  startAutoPlay();
  clickButton();
}

// create cart

if (localStorage.getItem('stylishCart') == null) {
  localStorage.setItem('stylishCart', JSON.stringify([]));
}

const allProductsInCart = JSON.parse(localStorage.getItem('stylishCart'));
const count = document.getElementsByClassName('count');

for (let i = 0; i < count.length; i++) {
  count[i].innerHTML = allProductsInCart.length;
}

ajax('https://api.appworks-school.tw/api/1.0/marketing/campaigns', renderCampaign);
