/* ====================
    product search API
   ==================== */

const keyword = window.location.search;
if (keyword.split('=')[0] === '?keyword') {
  window.location.href = `./index.html${keyword}`;
}
