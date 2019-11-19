/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
	('use strict');

	const select = {
		templateOf: {
			menuProduct: '#template-menu-product',
			cartProduct: '#template-cart-product'
		},
		containerOf: {
			menu: '#product-list',
			cart: '#cart'
		},
		all: {
			menuProducts: '#product-list > .product',
			menuProductsActive: '#product-list > .product.active',
			formInputs: 'input, select'
		},
		menuProduct: {
			clickable: '.product__header',
			form: '.product__order',
			priceElem: '.product__total-price .price',
			imageWrapper: '.product__images',
			amountWidget: '.widget-amount',
			cartButton: '[href="#add-to-cart"]'
		},
		widgets: {
			amount: {
				input: 'input[name="amount"]',
				linkDecrease: 'a[href="#less"]',
				linkIncrease: 'a[href="#more"]'
			}
		},
		cart: {
			productList: '.cart__order-summary',
			toggleTrigger: '.cart__summary',
			totalNumber: '.cart__total-number',
			totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
			subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
			deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
			form: '.cart__order',
			formSubmit: '.cart__order [type="submit"]',
			phone: '[name="phone"]',
			address: '[name="address"]'
		},
		cartProduct: {
			amountWidget: '.widget-amount',
			price: 'cart__product-price',
			edit: '[href="#edit"]',
			remove: '[href="#remove"]'
		}
	};

	const classNames = {
		menuProduct: {
			wrapperActive: 'active',
			imageVisible: 'active'
		},
		cart: {
			wrapperActive: 'active'
		}
	};

	const settings = {
		amountWidget: {
			defaultValue: 1,
			defaultMin: 1,
			defaultMax: 9
		},
		cart: {
			defaultDeliveryFee: 20
		},
		db: {
			url: '//localhost:3131',
			product: 'product',
			order: 'order'
		}
	};

	const templates = {
		menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
		cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML)
	};

	class Product {
		constructor(id, data) {
			const thisProduct = this;

			thisProduct.id = id;
			thisProduct.data = data;
			thisProduct.renderInMenu();
			thisProduct.getElements();
			thisProduct.initAccordion();
			thisProduct.initOrderForm();
			thisProduct.initAmountWidget();
			thisProduct.processOrder();
		}

		renderInMenu() {
			const thisProduct = this;

			/* generate HTML based on template */
			const generatedHTML = templates.menuProduct(thisProduct.data);

			/* create element using utilis.createELementFromHTML */
			thisProduct.element = utils.createDOMFromHTML(generatedHTML);

			/* find menu container */
			const menuContainer = document.querySelector(select.containerOf.menu);

			/* add element to menu */
			menuContainer.appendChild(thisProduct.element);
		}

		getElements() {
			const thisProduct = this;

			thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
			thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
			thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
			thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
			thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
			thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
			thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
		}

		initAccordion() {
			const thisProduct = this;

			/* START: click event listener to triger */

			thisProduct.accordionTrigger.addEventListener('click', function(event) {
				/* prevent default action for event */
				event.preventDefault();

				/* toggle active class on element of thisProduct */

				thisProduct.element.classList.add('active');

				/* find all active products */
				const activeProducts = document.querySelectorAll('article.active');

				/* START LOOP: for each active product */
				for (let activeProduct of activeProducts) {
					/* START: if the active product isn't the element of this Product */
					if (activeProduct !== thisProduct.element) {
						/* remove class active for the active product */
						activeProduct.classList.remove('active');
					}
				}
			});
		}

		initOrderForm() {
			const thisProduct = this;

			thisProduct.form.addEventListener('submit', function(event) {
				event.preventDefault();
				thisProduct.processOrder();
			});

			for (let input of thisProduct.formInputs) {
				input.addEventListener('change', function() {
					thisProduct.processOrder();
				});
			}

			thisProduct.cartButton.addEventListener('click', function(event) {
				event.preventDefault();
				thisProduct.processOrder();
				thisProduct.addToCart();
			});
		}

		processOrder() {
			const thisProduct = this;
			/* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
			const formData = utils.serializeFormToObject(thisProduct.form);

			/* set variable price to equal thisProduct.data.price */
			thisProduct.params = {};
			let price = thisProduct.data.price;

			/* START LOOP: for each paramId in thisProduct.data.params */
			for (let paramId in thisProduct.data.params) {
				/* save the element in thisProduct.data.params with key paramId as const param */
				const param = thisProduct.data.params[paramId];

				/* START LOOP: for each optionId in param.options */
				for (let optionId in param.options) {
					/* save the element in param.options with key optionId as const option */
					const option = param.options[optionId];

					const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

					/* START IF: if option is selected and option is not default */
					if (optionSelected && !option.default) {
						/* add price of option to variable price */
						price = price + option.price;
					} else if (!optionSelected && option.default) {
						price = price - option.price;
					}

					/* Image management added */

					const nameOfClass = paramId + '-' + optionId;
					const imgElements = thisProduct.element.querySelectorAll('img');

					if (optionSelected) {
						if (!thisProduct.params[paramId]) {
							thisProduct.params[paramId] = {
								label: param.label,
								options: {}
							};
						}
						thisProduct.params[paramId].options[optionId] = option.label;

						for (let imgElement of imgElements) {
							if (nameOfClass == imgElement.className) {
								imgElement.classList.add(classNames.menuProduct.imageVisible);
							}
						}
					} else {
						for (let imgElement of imgElements) {
							const nameOfClass2 = nameOfClass + ' ' + classNames.menuProduct.imageVisible;
							if (nameOfClass2 == imgElement.className) {
								imgElement.classList.remove(classNames.menuProduct.imageVisible);
							}
						}
					}
				}
			}
			/* multiply price by amount */
			thisProduct.priceSingle = price;
			thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

			/* set the contents of thisProduct.priceElem to be the value of variable price */
			thisProduct.priceElem.innerHTML = thisProduct.price;
		}

		initAmountWidget() {
			const thisProduct = this;

			thisProduct.amountWidget = new AmountWiget(thisProduct.amountWidgetElem);

			thisProduct.amountWidgetElem.addEventListener('updated', function() {
				thisProduct.processOrder();
			});
		}

		addToCart() {
			const thisProduct = this;

			thisProduct.name = thisProduct.data.name;
			thisProduct.amount = thisProduct.amountWidget.value;
			app.cart.add(thisProduct);
		}
	}

	class AmountWiget {
		constructor(element) {
			const thisWidget = this;

			thisWidget.getElements(element);

			thisWidget.value = settings.amountWidget.defaultValue;
			thisWidget.setValue(thisWidget.input.value);
			thisWidget.initActions();
		}

		getElements(element) {
			const thisWidget = this;

			thisWidget.element = element;
			thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
			thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
			thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
		}

		setValue(value) {
			const thisWidget = this;

			const newValue = parseInt(value);

			if (
				newValue != thisWidget.value &&
				newValue >= settings.amountWidget.defaultMin &&
				newValue <= settings.amountWidget.defaultMax
			) {
				thisWidget.value = newValue;
				thisWidget.announce();
			}

			thisWidget.input.value = thisWidget.value;
		}

		initActions() {
			const thisWidget = this;

			thisWidget.input.addEventListener('change', function() {
				//console.log('input change');
				thisWidget.setValue(thisWidget.element);
			});

			thisWidget.linkDecrease.addEventListener('click', function(event) {
				event.preventDefault();
				thisWidget.setValue(thisWidget.value - 1);
			});

			thisWidget.linkIncrease.addEventListener('click', function(event) {
				event.preventDefault();
				thisWidget.setValue(thisWidget.value + 1);
			});
		}

		announce() {
			const thisWidget = this;

			const event = new CustomEvent('updated', {
				bubles: true
			});

			thisWidget.element.dispatchEvent(event);
		}
	}

	class Cart {
		constructor(element) {
			const thisCart = this;

			thisCart.products = [];
			thisCart.getElements(element);
			thisCart.initAction();
			thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
		}

		getElements(element) {
			const thisCart = this;

			thisCart.dom = {};

			thisCart.dom.wrapper = element;
			thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
			thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
			thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
			thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone).value;
			thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

			thisCart.renderTotalKeys = [ 'totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee' ];

			for (let key of thisCart.renderTotalKeys) {
				thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
			}
		}

		initAction() {
			const thisCart = this;

			thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
				event.preventDefault();
				thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
			});

			thisCart.dom.productList.addEventListener('updated', function() {
				thisCart.update();
			});

			thisCart.dom.productList.addEventListener('remove', function() {
				thisCart.remove(event.detail.cartProduct);
			});

			thisCart.dom.form.addEventListener('submit', function(event) {
				event.preventDefault();
				thisCart.sendOrder();
			});
		}

		sendOrder() {
			const thisCart = this;

			const url = settings.db.url + '/' + settings.db.order;

			const payload = {
				phone: thisCart.dom.phone,
				adress: thisCart.dom.address,
				totalNumber: thisCart.totalNumber,
				subtotalPrice: thisCart.subtotalPrice,
				totalPrice: thisCart.totalPrice,
				deliveryFee: thisCart.deliveryFee,
				products: []
			};

			for (let product of thisCart.products) {
				payload.products.push(thisCart.getData(product));
			}

			console.log(payload.products);

			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			};

			fetch(url, options)
				.then(function(response) {
					return response.json();
				})
				.then(function(parsedResponse) {
					console.log('parsedResponse', parsedResponse);
				});
		}

		getData() {
			const thisCart = this;

			return thisCart.products;
		}

		remove(cartProduct) {
			//deklaracja stałej thisCart
			const thisCart = this;

			// deklaracje indeksu w tablicy thiCartProduct
			const indexOfProduct = thisCart.products.indexOf(cartProduct);

			// usunięcie elementu w tablicy o wskazanym indeksie
			thisCart.products.splice(indexOfProduct, 1);

			// usunięcie elementu z DOM
			cartProduct.dom.wrapper.remove();

			// wywołanie motedy update
			thisCart.update();
		}

		add(menuProduct) {
			const thisCart = this;

			/* generate HTML based on template */
			const generatedHTML = templates.cartProduct(menuProduct);

			/* create generatedDOM using utilis.createELementFromHTML */
			const generatedDOM = utils.createDOMFromHTML(generatedHTML);

			/* add element to cart */
			thisCart.dom.productList.appendChild(generatedDOM);

			thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

			thisCart.update();
		}

		update() {
			const thisCart = this;

			thisCart.totalNumber = 0;
			thisCart.subtotalPrice = 0;

			for (let product of thisCart.products) {
				thisCart.subtotalPrice += product.price;
				thisCart.totalNumber += product.amount;
			}
			thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

			for (let key of thisCart.renderTotalKeys) {
				for (let elem of thisCart.dom[key]) {
					elem.innerHTML = thisCart[key];
				}
			}
		}
	}

	class CartProduct {
		constructor(menuProduct, element) {
			const thisCartProduct = this;

			thisCartProduct.id = menuProduct.id;
			thisCartProduct.name = menuProduct.name;
			thisCartProduct.price = menuProduct.price;
			thisCartProduct.priceSingle = menuProduct.priceSingle;
			thisCartProduct.amount = menuProduct.amount;
			thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

			thisCartProduct.getElements(element);
			thisCartProduct.initAction();
		}

		getElements(element) {
			const thisCartProduct = this;

			thisCartProduct.dom = {};

			thisCartProduct.dom.wrapper = element;
			thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(
				select.cartProduct.amountWidget
			);
			thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
			thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
			thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

			thisCartProduct.initAmountWidget(element);
		}

		initAmountWidget() {
			const thisCartProduct = this;

			/*
      thisCartProduct.amountWidget = new AmountWiget(thisCartProduct.dom.amountWidget);
      
      thisCartProduct.amountWidgetElem.addEventListener('updated', function(){
        ;
      })
      */
		}

		remove() {
			const thisCartProduct = this;

			const event = new CustomEvent('remove', {
				bubbles: true,
				detail: {
					cartProduct: thisCartProduct
				}
			});

			thisCartProduct.dom.wrapper.dispatchEvent(event);
		}

		initAction() {
			const thisCartProduct = this;

			thisCartProduct.dom.edit.addEventListener('click', function(event) {
				event.preventDefault();
				console.log('edycja produktu');
			});
			thisCartProduct.dom.remove.addEventListener('click', function(event) {
				event.preventDefault();
				thisCartProduct.remove();
			});
		}
	}

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
}
