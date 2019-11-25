class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.render(element)
        thisBooking.initWidget()
    }

    render(element) {
        const thisBooking = this;

        console.log('Booking render in progress')
    }

    initWidget() {
        const thisBooking = this;
    }
}



export default Booking;