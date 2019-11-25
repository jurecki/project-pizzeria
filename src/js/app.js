import {settings, select} from './settings/js';
import Product form './components/Product.js';
import Cart from './componentes/Cart.js';

const app = {
		initMenu: function() {
			const thisApp = this;
			for (let productData in thisApp.data.products) {
				new Product(thisApp.data.products[productData].id, this.data.products[productData]);
			}
		},

		initData: function() {
			const thisApp = this;
			const url = settings.db.url + '/' + settings.db.product;
			thisApp.data = {};

			fetch(url)
				.then(function(rawResponse) {
					return rawResponse.json();
				})
				.then(function(parsedResponse) {
					console.log('parsedResponse', parsedResponse);
					/*save parsedResponse as thisApp.data.products */
					thisApp.data.products = parsedResponse;
					/*execute initMenu method */
					thisApp.initMenu();
				});
			console.log('thisApp.data', JSON.stringify(thisApp.data));
		},

		initCart: function() {
			const thisApp = this;

			const cartElem = document.querySelector(select.containerOf.cart);
			thisApp.cart = new Cart(cartElem);
		},

		init: function() {
			const thisApp = this;
			console.log('*** App starting ***');
			console.log('thisApp:', thisApp);
			console.log('classNames:', classNames);
			console.log('settings:', settings);
			console.log('templates:', templates);

			thisApp.initData();
			thisApp.initCart();
		}
	};

	app.init();
