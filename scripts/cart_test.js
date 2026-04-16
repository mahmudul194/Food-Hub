const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const window = new JSDOM("<body><div class='nav-actions'><div class='icon-btn'></div></div><div class='cart-items'></div><div class='cart-summary'></div></body>").window;
global.document = window.document;
global.window = window;
global.localStorage = { getItem: () => null, setItem: () => {} };
//commented
window.api = { getCurrentUser: () => null };

eval(fs.readFileSync('frontend/js/cart.js', 'utf8'));
eval(fs.readFileSync('frontend/js/cart-ui.js', 'utf8'));

window.cartManager.addToCart({ id: 1, name: 'Pizza', price: '14.99' });

console.log(document.querySelector('.cart-items').innerHTML);


