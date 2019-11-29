import { select, templates, settings } from '../set.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.render(element)
        thisBooking.initWidget()
        thisBooking.getData();
    }

    getData() {
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + "=" + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + "=" + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,

            ],
            eventCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventRepeat: [
                settings.db.repeatParam,
                startDateParam,
                endDateParam,
            ],
        };

        // console.log('getData', params);

        const urls = {
            booking:        settings.db.url+'/'+ settings.db.booking+ '?'+ params.booking.join('&'),
            eventsCurrent:  settings.db.url+'/'+ settings.db.event+   '?'+ params.eventCurrent.join('&'),
            eventsRepeat:   settings.db.url+'/'+ settings.db.event+   '?'+ params.eventRepeat.join('&'),
        };

        // console.log('getData url', url);
        Promise.all ([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function(allResponses){
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]); 
            })
            .then(function([bookings, eventsCurrent,eventsRepeat]){
                console.log(bookings);
                console.log(eventsCurrent);
                console.log(eventsRepeat);
            });
                
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
        thisBooking.dom.datePicker  = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker  = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidget() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    }
}



export default Booking;