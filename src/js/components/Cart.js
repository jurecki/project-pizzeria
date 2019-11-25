import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';


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
        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
        thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

        thisCart.renderTotalKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

        for (let key of thisCart.renderTotalKeys) {
            thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
        }
    }

    initAction() {
        const thisCart = this;

        thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
            event.preventDefault();
            thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });

        thisCart.dom.productList.addEventListener('updated', function () {
            thisCart.update();
        });

        thisCart.dom.productList.addEventListener('remove', function () {
            thisCart.remove(event.detail.cartProduct);
        });

        thisCart.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisCart.sendOrder();
        });
    }

    sendOrder() {
        const thisCart = this;

        const url = settings.db.url + '/' + settings.db.order;
        /*event change update wartości albo ręczne zczytanie wartości */

        const payload = {
            phone: thisCart.dom.phone.value,
            adress: thisCart.dom.address.value,
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
            .then(function (response) {
                return response.json();
            })
            .then(function (parsedResponse) {
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

export default Cart;