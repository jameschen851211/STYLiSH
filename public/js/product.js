const url = 'https://api.appworks-school.tw/api/1.0/products/details';

function ajax(src, callback) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      callback(data);
    }
  };
  xhr.open('GET', src);
  xhr.send();
}

/* =====================
    product details API
   ===================== */
let productDetails;
let productVariantData;
let num = document.getElementById('quantity').innerHTML;
let maxStockNum;
const allProductsInCart = JSON.parse(localStorage.getItem('stylishCart'));
const productColorBtn = document.getElementsByClassName('product_color');
const productSizeBtn = document.getElementsByClassName('product_size');
const addBtn = document.getElementById('increment');
const minusBtn = document.getElementById('decrement');
const addToCartBtn = document.getElementById('add-to-cart');
const colorSelected = document.getElementsByClassName('product_color--selected');
const outOfSize = document.getElementsByClassName('out_of_size');
const outOfColor = document.getElementsByClassName('out_of_color');
const sizeSelected = document.getElementsByClassName('product_size--selected');
const count = document.getElementsByClassName('count');

// 選擇顏色時，確認該顏色的每個尺寸是否有庫存，若無庫存，則該顏色無庫存的尺寸無法選擇
function haveNoStockByColor(aim, color, stock) {
  return aim
    .filter((item) => item.color_code === color && item.stock === stock)
    .map((item) => item.size);
}

function mapColorCode(hex) {
  const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`;
  const color = rgba2hex(hex).toUpperCase().slice(1);
  return color;
}

function handleWithNoSize(color) {
  const noStockSize = haveNoStockByColor(productVariantData, mapColorCode(color), 0);
  for (let i = 0; i < productSizeBtn.length; i++) {
    for (let j = 0; j < noStockSize.length; j++) {
      if (productSizeBtn[i].innerHTML === noStockSize[j]) {
        productSizeBtn[i].classList.add('out_of_size');
      }
    }
  }
}

function renewStockOnload() {
  allProductsInCart.forEach((e) => {
    if (e.id === productDetails.id) {
      productVariantData.forEach((n) => {
        const newStock = n;
        if (e.colorcode === newStock.color_code && e.size === newStock.size) {
          newStock.stock = parseInt(newStock.stock, 10) - parseInt(e.number, 10);
        }
      });
    }
  });
}

function outOfAllProducts() {
  const stock0 = productVariantData.filter((item) => item.stock === 0);
  if (stock0.length === productVariantData.length) {
    for (let i = 0; i < productColorBtn.length; i++) {
      productColorBtn[i].classList.add('out_of_color');
    }
    for (let i = 0; i < productSizeBtn.length; i++) {
      productSizeBtn[i].classList.add('out_of_size');
    }
    addBtn.style.cursor = 'not-allowed';
    minusBtn.style.cursor = 'not-allowed';
    addToCartBtn.classList.add('disable');
    addToCartBtn.innerHTML = '已經賣完囉！';
  }
}

function defaultQuantity() {
  if (num > 1) {
    num = +1;
    document.getElementById('quantity').innerHTML = num;
  }
}

function cleanClassname(currentclassname, remove) {
  const currentName = currentclassname;
  if (currentclassname) {
    currentName.className = currentclassname.className.replace(remove, '');
  }
}

function haveStosk(aim, color, size, stock) {
  return aim
    .filter((item) => item.color_code === color && item.size === size && item.stock !== stock)
    .map((item) => item.stock)[0];
}

function selectColorfeature(i, e) {
  if (productColorBtn[i].classList.contains('out_of_color')) { return; }
  // 功能一：點擊另外一個顏色時，讓數量回到1，點擊同一個顏色時維持使用者原本選擇的數量
  if (colorSelected[0].style.backgroundColor !== e.target.style.backgroundColor) {
    defaultQuantity();
  }
  // 功能二：選顏色時檢查各個尺寸有沒有庫存，沒有的話尺寸設定成不能選
  if (outOfSize) {
    for (let j = 0; j < outOfSize.length; j++) {
      cleanClassname(outOfSize[j], ' out_of_size');
    }
  }
  handleWithNoSize(e.target.style.backgroundColor);
  // 功能三：讓使用者知道自己選到哪個顏色，讓product_color--selected可以切換
  cleanClassname(colorSelected[0], ' product_color--selected');
  e.target.classList.add('product_color--selected');
  // 功能四：切換顏色後，如果先前選到的尺寸沒有庫存，預設第一個有庫存的size是被選到的，若有，則維持本來已選的size
  if (sizeSelected[0].classList.contains('out_of_size')) {
    cleanClassname(outOfSize[0], ' product_size--selected');
    for (let j = 0; j < productSizeBtn.length; j++) {
      maxStockNum = haveStosk(productVariantData, mapColorCode(e.target.style.backgroundColor),
        productSizeBtn[j].innerHTML, 0);
      if (maxStockNum !== undefined) {
        productSizeBtn[j].classList.add('product_size--selected');
        break;
      }
    }
  } else {
    maxStockNum = haveStosk(productVariantData, mapColorCode(e.target.style.backgroundColor),
      sizeSelected[0].innerHTML, 0);
  }
}

function selectColor() {
  for (let i = 0; i < productColorBtn.length; i++) {
    productColorBtn[i].addEventListener('click', (e) => selectColorfeature(i, e));
  }
}

function selectSizefeature(i, e) {
  if (productSizeBtn[i].classList.contains('out_of_size')) { return; }
  // 功能一：點擊另外一個尺寸時，讓數量回到1，點擊同一個尺寸時維持使用者原本選擇的數量
  if (sizeSelected[0].innerHTML !== e.target.innerHTML) { defaultQuantity(); }
  // 功能二：讓使用者知道自己選到哪個尺寸，讓product_size--selected可以切換
  cleanClassname(sizeSelected[0], ' product_size--selected');
  e.target.classList.add('product_size--selected');
  // 功能三：選尺寸時檢查各個顏色和尺寸對應的庫存數量，改變數量的最大限制
  maxStockNum = haveStosk(productVariantData,
    mapColorCode(colorSelected[0].style.backgroundColor),
    e.target.innerHTML, 0);
}

function selectSize() {
  for (let i = 0; i < productSizeBtn.length; i++) {
    productSizeBtn[i].addEventListener('click', (e) => selectSizefeature(i, e));
  }
}

function renewStockAddToCartBtn(chosenProduct) {
  productVariantData.forEach((e) => {
    if (e.color_code === chosenProduct.colorcode && e.size === chosenProduct.size) {
      e.stock = parseInt(e.stock, 10) - parseInt(chosenProduct.number, 10);
    }
  });
}

function addToCart() {
  addToCartBtn.addEventListener('click', () => {
    if (!addToCartBtn.classList.contains('disable')) {
      // 使用者選購的商品
      const chosenProduct = {};
      chosenProduct.id = productDetails.id;
      chosenProduct.title = productDetails.title;
      chosenProduct.image = productDetails.main_image;
      chosenProduct.price = productDetails.price;
      chosenProduct.colorcode = mapColorCode(colorSelected[0].style.backgroundColor);
      chosenProduct.color = () => productDetails.colors
        .filter((item) => item.code === chosenProduct.colorcode)
        .map((item) => item.name)[0];
      chosenProduct.size = sizeSelected[0].innerHTML;
      chosenProduct.number = parseInt(num, 10);
      chosenProduct.totalStock = haveStosk(productDetails.variants,
        mapColorCode(colorSelected[0].style.backgroundColor), sizeSelected[0].innerHTML, 0);
      // 檢查購物車裡是否有相同的品項
      const sameItem = allProductsInCart
        .filter((item) => item.id === chosenProduct.id
        && item.colorcode === chosenProduct.colorcode
        && item.size === chosenProduct.size);
        // 購物車裡面沒有相同品項的話，直接將商品加入購物車
      if (sameItem.length === 0) {
        allProductsInCart.push(chosenProduct);
        renewStockAddToCartBtn(chosenProduct);
        window.alert('成功加入購物車！');
        defaultQuantity();
      }
      // 購物車裡有相同品項的話，更新購物車裡的數量
      if (sameItem.length !== 0) {
        allProductsInCart.forEach((e) => {
          if (e.id === chosenProduct.id
            && e.colorcode === chosenProduct.colorcode
            && e.size === chosenProduct.size) {
            e.number = parseInt(e.number, 10) + parseInt(chosenProduct.number, 10);
          }
        });
        renewStockAddToCartBtn(chosenProduct);
        window.alert('已更新購物車中的商品數量！');
        defaultQuantity();
      }
      maxStockNum -= parseInt(chosenProduct.number, 10);
      // 該顏色該尺寸被選購完後，預設第一個有庫存的size被選到
      if (maxStockNum === 0) {
        sizeSelected[0].classList.add('out_of_size');
        cleanClassname(sizeSelected[0], ' product_size--selected');
        for (let i = 0; i < productSizeBtn.length; i++) {
          maxStockNum = haveStosk(productVariantData,
            mapColorCode(colorSelected[0].style.backgroundColor), productSizeBtn[i].innerHTML, 0);
          if (maxStockNum > 0) {
            productSizeBtn[i].classList.add('product_size--selected');
            break;
          }
        }
        defaultQuantity();
      }
      // 該顏色所有尺寸都沒庫存後，而且其他顏色還有庫存時，
      if (outOfSize.length === productSizeBtn.length
        && outOfColor.length < (productColorBtn.length) - 1) {
        // 將該顏色設定成不能選
        colorSelected[0].classList.add('out_of_color');
        cleanClassname(colorSelected[0], ' product_color--selected');
        for (let i = 0; i < productSizeBtn.length; i++) {
          cleanClassname(productSizeBtn[i], ' out_of_size');
        }
        // 預設選到第一個有庫存的顏色和有庫存的size
        for (let i = 0; i < productColorBtn.length; i++) {
          for (let j = 0; j < productSizeBtn.length; i++) {
            maxStockNum = haveStosk(productVariantData,
              mapColorCode(productColorBtn[i].style.backgroundColor),
              productSizeBtn[j].innerHTML, 0);
            if (maxStockNum !== undefined) {
              productColorBtn[i].classList.add('product_color--selected');
              break;
            }
          }
          break;
        }
        handleWithNoSize(colorSelected[0].style.backgroundColor);
        for (let i = 0; i < productSizeBtn.length; i++) {
          maxStockNum = haveStosk(productVariantData,
            mapColorCode(colorSelected[0].style.backgroundColor), productSizeBtn[i].innerHTML, 0);
          if (maxStockNum !== undefined) {
            productSizeBtn[i].classList.add('product_size--selected');
            break;
          }
        }
      }
      // 所有顏色和尺寸都沒有庫存時，顯示商品已售完
      outOfAllProducts();
      // 將使用者所選商品存到localstorage
      localStorage.setItem('stylishCart', JSON.stringify(allProductsInCart));
      // 更新購物車顯示的商品數量
      for (let i = 0; i < count.length; i++) {
        count[i].innerHTML = allProductsInCart.length;
      }
    }
  });
}
// 處理主圖
function renderMainImg(image) {
  const mainImg = document.createElement('img');
  const product = document.getElementById('product');
  mainImg.classList.add('product_main-image');
  mainImg.src = `${image}`;
  mainImg.alt = 'main_img';
  product.insertBefore(mainImg, product.children[0]);
}
// 處理商品資訊
function renderProductDetail(title, id, price) {
  const productTitle = document.createElement('div');
  const productId = document.createElement('div');
  const productPrice = document.createElement('div');
  const productTitleTxt = document.createTextNode(`${title}`);
  const productIdTxt = document.createTextNode(`${id}`);
  const productPriceTxt = document.createTextNode(`TWD.${price}`);
  const productDetail = document.querySelector('.product_detail');
  productTitle.classList.add('product_title');
  productId.classList.add('product_id');
  productPrice.classList.add('product_price');
  productTitle.appendChild(productTitleTxt);
  productId.appendChild(productIdTxt);
  productPrice.appendChild(productPriceTxt);
  productDetail.insertBefore(productTitle, productDetail.children[0]);
  productDetail.insertBefore(productId, productDetail.children[1]);
  productDetail.insertBefore(productPrice, productDetail.children[2]);
}
// 處理顏色&t尺寸
function renderColorAndSize(colors, sizes) {
  const productVariant = document.getElementsByClassName('product_variant');
  const productColors = document.createElement('div');
  const productSizes = document.createElement('div');
  productColors.id = 'colors';
  productColors.classList.add('product_colors');
  productSizes.id = 'sizes';
  productSizes.classList.add('product_sizes');
  colors.forEach((e) => {
    const productColor = document.createElement('div');
    productColor.classList.add('product_color');
    productColor.style.backgroundColor = `#${e.code}`;
    productColors.appendChild(productColor);
  });
  sizes.forEach((e) => {
    const productSize = document.createElement('div');
    const productSizeTxt = document.createTextNode(e);
    productSize.classList.add('product_size');
    productSize.appendChild(productSizeTxt);
    productSizes.appendChild(productSize);
  });
  productVariant[0].appendChild(productColors);
  productVariant[1].appendChild(productSizes);
}

// 處理note, texture, description, wash, place

function renderProductmoreDetail(note, texture, description, wash, place) {
  const productDetail = document.querySelector('.product_detail');
  const productNote = document.createElement('div');
  const productTexture = document.createElement('div');
  const productDescription = document.createElement('div');
  const productWash = document.createElement('div');
  const productPlace = document.createElement('div');
  const productNoteTxt = document.createTextNode(note);
  const productTextureTxt = document.createTextNode(texture);
  const productDescriptionTxt = document.createTextNode(description);
  const productWashTxt = document.createTextNode(wash);
  const productPlaceTxt = document.createTextNode(place);
  productNote.classList.add('product_note');
  productTexture.classList.add('product_texture');
  productDescription.classList.add('product_description');
  productWash.classList.add('product_wash');
  productPlace.classList.add('product_place');
  productNote.appendChild(productNoteTxt);
  productTexture.appendChild(productTextureTxt);
  productDescription.appendChild(productDescriptionTxt);
  productWash.appendChild(productWashTxt);
  productPlace.appendChild(productPlaceTxt);
  productDetail.appendChild(productNote);
  productDetail.appendChild(productTexture);
  productDetail.appendChild(productDescription);
  productDetail.appendChild(productWash);
  productDetail.appendChild(productPlace);
}

// 處理更多產品資訊
function renderMore(story, images) {
  const product = document.getElementById('product');
  const productStory = document.createElement('div');
  const productStoryTxt = document.createTextNode(story);
  productStory.classList.add('product_story');
  productStory.appendChild(productStoryTxt);
  product.appendChild(productStory);
  images.forEach((e) => {
    const img = document.createElement('img');
    img.classList.add('product_image');
    img.src = e;
    img.alt = 'more_img';
    product.appendChild(img);
  });
}

function render(data) {
  const {
    // eslint-disable-next-line camelcase
    main_image, title, id, price, colors, sizes, note, texture,
    description, wash, place, story, images,
  } = data.data;

  productDetails = data.data;
  productVariantData = data.data.variants;
  renderMainImg(main_image);
  renderProductDetail(title, id, price);
  renderColorAndSize(colors, sizes);
  renderProductmoreDetail(note, texture, description, wash, place);
  renderMore(story, images);

  // check localstorage stock
  renewStockOnload();
  outOfAllProducts();

  // 載入頁面時，如果商品沒有完售，將完售的顏色標為不可選
  for (let i = 0; i < productColorBtn.length; i++) {
    const noStock = haveNoStockByColor(productVariantData,
      mapColorCode(productColorBtn[i].style.backgroundColor), 0);
    if (noStock.length === productSizeBtn.length) {
      productColorBtn[i].classList.add('out_of_color');
    }
  }

  // 載入頁面時，如果商品沒有完售，預設第一個有庫存的顏色是被選到的
  for (let i = 0; i < productColorBtn.length; i++) {
    if (!productColorBtn[i].classList.contains('out_of_color')) {
      productColorBtn[i].classList.add('product_color--selected');
      break;
    }
  }
  handleWithNoSize(colorSelected[0].style.backgroundColor);

  // 載入頁面時，預設第一個有庫存的尺寸是被選到的
  for (let i = 0; i < productSizeBtn.length; i++) {
    maxStockNum = haveStosk(productVariantData,
      mapColorCode(colorSelected[0].style.backgroundColor), productSizeBtn[i].innerHTML, 0);
    if (maxStockNum !== undefined) {
      productSizeBtn[i].classList.add('product_size--selected');
      break;
    }
  }

  // product variants
  selectColor();
  selectSize();

  // add to cart0
  addToCart();
}
addBtn.addEventListener('click', () => {
  if (num < maxStockNum) {
    num = parseInt(num, 10) + 1;
    document.getElementById('quantity').innerHTML = num;
  }
});

minusBtn.addEventListener('click', () => {
  if (num > 1) {
    num = parseInt(num, 10) - 1;
    document.getElementById('quantity').innerHTML = num;
  }
});

if (localStorage.getItem('stylishCart') == null) {
  localStorage.setItem('stylishCart', JSON.stringify([]));
}

/* =======================
    load all into webpage
   ======================= */

window.onload = function () {
  if (keyword.split('=')[0] === '?id') {
    ajax(`${url}${keyword}`, render);
  }
};
