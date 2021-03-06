## Synopsis

This package gets bookings from the AirBnB, HomeAway and other calendars.

npm install ical-booking

## Code Example
``` js
var model = new models.ICal({
    name: 'AirBnB',
    type: models.ICalTypes.AIRBNB,
    url: "https://www.airbnb.nl/calendar/ical/xxxx",
});

ical.importICal(model).then(function () {
    ical.getICalToJSON(model).then(function (data) {
        console.log(data);
    });
});
```

## Motivation

This package was build to integrate the NUKI Smartlock with AirBnB, Booking.com, HomeAway and other internet calendars.

## API Reference

Export your iCal from AirBnB or HomeAway and call the importICal to add the calendar.

Request                     | Parameters 
--------------------------- | -----------------------------------------------------------------------
getICal                     | (string) name
getICals                    | 
importICal                  | (models.ICal) ical
removeICal                  | (string) name
getICalToJSON               | (models.ICal) ical

## Contributors

If you want to contribute or donate to the project, please contact me on gijs@intelligencecompany.net.

## License

MIT