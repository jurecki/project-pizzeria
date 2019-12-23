/* global Handlebars, dataSource */

export const utils = {};

utils.createDOMFromHTML = function (htmlString) {
  let div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
};

utils.createPropIfUndefined = function (obj, key, value = []) {
  if (!obj.hasOwnProperty(key)) {
    obj[key] = value;
  }
};

utils.serializeFormToObject = function (form) {
  let output = {};
  if (typeof form == 'object' && form.nodeName == 'FORM') {
    for (let field of form.elements) {
      if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
        if (field.type == 'select-multiple') {
          for (let option of field.options) {
            if (option.selected) {
              utils.createPropIfUndefined(output, field.name);
              output[field.name].push(option.value);
            }
          }
        } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
          utils.createPropIfUndefined(output, field.name);
          output[field.name].push(field.value);
        }
      }
    }
  }
  return output;
};

utils.queryParams = function (params) {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
};

utils.convertDataSourceToDbJson = function () {
  const productJson = [];
  for (let key in dataSource.products) {
    productJson.push(Object.assign({ id: key }, dataSource.products[key]));
  }

  //console.log(JSON.stringify({ product: productJson, order: [] }, null, '  '));
};

utils.numberToHour = function (number) {
  return (Math.floor(number) % 24) + ':' + (number % 1 * 60 + '').padStart(2, '0');
};

utils.hourToNumber = function (hour) {
  const parts = hour.split(':');

  return parseInt(parts[0]) + parseInt(parts[1]) / 60;
};

utils.dateToStr = function (dateObj) {
  return dateObj.toISOString().slice(0, 10);
};

utils.addDays = function (dateStr, days) {
  const dateObj = new Date(dateStr);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('joinValues', function (input, options) {
  return Object.values(input).join(options.fn(this));
});

/* Slider */

var slideIndex = 0;
showSlides();

function showSlides() {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) { slideIndex = 1 }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active_dots", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active_dots";
  setTimeout(showSlides, 3000); // Change image every 3 seconds
}