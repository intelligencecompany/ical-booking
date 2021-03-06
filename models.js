module.exports = {
    Weekdays: {
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 4,
        THURSDAY: 8,
        FRIDAY: 16,
        SATURDAY: 32,
        SUNDAY: 64
    },
    ICalTypes: {
        AIRBNB: 1,
        BOOKINGCOM: 2,
        HOMEAWAY: 3
    },
    ICal: function (i) {
        return {
            url: i.url,
            type: i.type,
            name: i.name
        };
    },
    Booking: function (i) 
    {
        return {
            name: i.name,
            email: i.email,
            dStart: i.dStart,
            dEnd: i.dEnd,
            location: i.location,
            summary: i.summary,
            description: i.description,
            uid: i.uid
        };
    }
}