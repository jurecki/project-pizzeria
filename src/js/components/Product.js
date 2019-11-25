import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
        
        thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

        thisProduct.amountWidgetElem.addEventListener('updated', function() {
            thisProduct.processOrder();
        });
    }

    addToCart() {
        const thisProduct = this;

        thisProduct.name = thisProduct.data.name;
        thisProduct.amount = thisProduct.amountWidget.value;
        
        //app.cart.add(thisProduct);

        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct,
            },
        });

        thisProduct.element.dispatchEvent(event);
    }
}

export default Product;