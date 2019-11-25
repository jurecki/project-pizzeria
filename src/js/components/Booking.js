import { select, templates } from '../set.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.render(element)
        thisBooking.initWidget()
    }

    render(element) {
        const thisBooking = this;

        const bookingHTML = templates.bookingWidget(element);

        thisBooking.dom = {};

        thisBooking.dom.wrapper = utils.createDOMFromHTML(bookingHTML);

        const bookingContainer = document.querySelector(select.containerOf.booking);

        bookingContainer.appendChild(thisBooking.dom.wrapper);


        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    }

    initWidget() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    }
}



export default Booking;