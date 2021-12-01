const numberDiv = document.getElementById('number');
const number = window.location.search.split('=')[1];

numberDiv.innerText = `${number}`;
