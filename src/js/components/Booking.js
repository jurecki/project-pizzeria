import { select, templates, settings, classNames } from '../set.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
	constructor(element) {
		const thisBooking = this;
		
		thisBooking.render(element);
		thisBooking.initWidgets();
		thisBooking.getData();
		
	}

	getData() {
		const thisBooking = this;

		const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
		const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

		const params = {
			booking: [startDateParam, endDateParam],
			eventCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
			eventRepeat: [settings.db.repeatParam, startDateParam, endDateParam]
		};

		//console.log('getData', params);

		const urls = {
			booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
			eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventCurrent.join('&'),
			eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventRepeat.join('&')
		};

		// console.log('getData url', urls);

		Promise.all([fetch(urls.booking), fetch(urls.eventsCurrent), fetch(urls.eventsRepeat)])
			.then(function (allResponses) {
				const bookingsResponse = allResponses[0];
				const eventsCurrentResponse = allResponses[1];
				const eventsRepeatResponse = allResponses[2];
				return Promise.all([
					bookingsResponse.json(),
					eventsCurrentResponse.json(),
					eventsRepeatResponse.json()
				]);
			})
			.then(function ([bookings, eventsCurrent, eventsRepeat]) {
				//   console.log(bookings);
				//   console.log(eventsCurrent);
				//   console.log(eventsRepeat);
				thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
			});
	}

	parseData(bookings, eventsCurrent, eventsRepeat) {
		const thisBooking = this;

		thisBooking.booked = {};

		for (let item of eventsCurrent) {
			thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
		}

		for (let item of bookings) {
			thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
		}
		const minDate = thisBooking.datePicker.minDate;
		const maxDate = thisBooking.datePicker.maxDate;

		for (let item of eventsRepeat) {
			if (item.repeat == 'daily') {
				for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
					thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
				}
			}
		}

		thisBooking.updateDOM();
	}

	makeBooked(date, hour, duration, table) {
		const thisBooking = this;

		if (typeof thisBooking.booked[date] == 'undefined') {
			thisBooking.booked[date] = {};
		}

		const startHour = utils.hourToNumber(hour);

		for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
			// console.log('loop', hourBlock);

			if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
				thisBooking.booked[date][hourBlock] = [];
			}

			thisBooking.booked[date][hourBlock].push(table);
		}

	}

	updateHourPicker() {
		// start update HourPicker
		const thisBooking = this;
		
		thisBooking.date = thisBooking.datePicker.value;
		
		for (let i = 12; i <= 24; i += 0.5) {

			if (typeof thisBooking.booked[thisBooking.date][i] !== 'undefined') {
			document.getElementById(i).classList.remove('red','orange');
			}
		}

		for (let i = 12; i <= 24; i += 0.5) {

			if (typeof thisBooking.booked[thisBooking.date][i] !== 'undefined' &&
				thisBooking.booked[thisBooking.date][i].length == 3) {
				document.getElementById(i).classList.add('red');
			}

			if (typeof thisBooking.booked[thisBooking.date][i] !== 'undefined' &&
				thisBooking.booked[thisBooking.date][i].length == 2) {
				document.getElementById(i).classList.add('orange');
			}
		}
		
	}

	updateDOM() {
		const thisBooking = this;

		thisBooking.date = thisBooking.datePicker.value;
		thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);


		let allAvailable = false;

		if (
			typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
			typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
		) {
			allAvailable = true;
		}

		for (let table of thisBooking.dom.tables) {
			let tableId = table.getAttribute(settings.booking.tableIdAttribute);
			if (!isNaN(tableId)) {
				tableId = parseInt(tableId);
			}

			if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
				table.classList.add(classNames.booking.tableBooked);
			} else {
				table.classList.remove(classNames.booking.tableBooked);
			}

			// choose available table
			table.addEventListener('click', function (event) {
				event.preventDefault();
				if (!table.classList.contains(classNames.booking.tableBooked)) {
					table.classList.add(classNames.booking.tableBooked);
					thisBooking.table = tableId;
				}
			});
		}

		thisBooking.updateHourPicker();
	}

	sendBooking() {
		const thisBooking = this;

		const url = settings.db.url + '/' + settings.db.booking;


		thisBooking.starters = [];

		if (thisBooking.dom.wrapper.querySelector("input[type='checkbox'][value='bread']").checked) {
			thisBooking.starters.push('bread');
		}
		if (thisBooking.dom.wrapper.querySelector("input[type='checkbox'][value='water']").checked) {
			thisBooking.starters.push('lemonWater');
		}

		thisBooking.people = thisBooking.dom.wrapper.querySelector("input[name='people']").value;
		thisBooking.duration = thisBooking.dom.wrapper.querySelector("input[name='hours']").value;


		const payload = {
			date: thisBooking.date,
			hour: thisBooking.hourPicker.value,
			table: thisBooking.table,
			duration: thisBooking.duration,
			ppl: thisBooking.people,
			starters: thisBooking.starters,
		};

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
			});
			//.then(function (parsedResponse) {});

	}

	render(wrapper) {
		const thisBooking = this;

		const bookingHTML = templates.bookingWidget(wrapper);
		thisBooking.dom = {};
		thisBooking.dom.wrapper = utils.createDOMFromHTML(bookingHTML);

		const bookingContainer = document.querySelector(select.containerOf.booking);

		bookingContainer.appendChild(thisBooking.dom.wrapper);

		thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
		thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
		thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
		thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
		thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
	}

	initWidgets() {
		const thisBooking = this;

		thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
		thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
		thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
		thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
	

		thisBooking.dom.wrapper.addEventListener('updated', function (event) {
			if (!event.target.classList.contains('widget-amount')) {
				thisBooking.updateDOM();
			}
		});

		thisBooking.dom.wrapper.addEventListener('submit', function (event) {
			event.preventDefault();
			thisBooking.sendBooking();
		});
	}
}

export default Booking;
