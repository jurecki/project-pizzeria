import {select, settings} from '../set.js';
import {utils} from '../utils.js';
import BaseWidget from './BaseWidget.js';


class DatePicker extends BaseWidget  {
    constructor(wrapper) {
        super(wrapper, utils.dateToStr(new Date()))
        const thisWidget = this;

        thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
        thisWidget.initPlugin()
    }

    initPlugin() {
        const thisWidget = this;
    
        thisWidget.minDate = new Date(thisWidget.value);
        thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));

        const options = {
            defaultDate: thisWidget.minDate,
            minDate: thisWidget.minDate,
            maxDate: thisWidget.maxDate,
            "disable": [
                function(date) {
                    // return true to disable
                    return (date.getDay() === 1);
        
                }
            ],
            "locale": {
                "firstDayOfWeek": 1 // start week on Monday
            },
            onChange: function(dateStr) {
                thisWidget.value = utils.dateToStr(new Date(dateStr));

                //console.log('New Value',thisWidget.value);
            }
        };

        
        flatpickr(thisWidget.dom.input, options)

        //console.log('thisWidgetValue',thisWidget.value);
        
    }

    parseValue(value) {
        return value;
    }

    isValid() {
        return true;
    }
    
    renderValue() {

    }

}

export default DatePicker