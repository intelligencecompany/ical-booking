const fs = require("fs"),
    request = require("request"),
    icalendar = require("icalendar"),
    models = require('./models');

fs.writeFile(__dirname + '/ical.json', '[]', { flag: 'wx' }, function (err) {
    console.log(err);
});

function processICalAirBnB(cal) {
    var items = [];
    for(var key in cal.components.VEVENT) {
        var vevent = cal.components.VEVENT[key];
        var description = descriptionToJSON(vevent);
        
        var email = description["EMAIL"];

        if(vevent.properties.SUMMARY[0].value.toLowerCase() != "not available" 
        && vevent.properties.LOCATION != null
        && vevent.properties.LOCATION.length > 0
        && vevent.properties.LOCATION[0].value.toLowerCase() != "not available") {
            items.push(new models.Booking({
                name: vevent.properties.SUMMARY[0].value,
                email: email,
                dStart: vevent.properties.DTSTART[0].value,
                dEnd: vevent.properties.DTEND[0].value,
                locations: (vevent.properties.LOCATION != null) ? vevent.properties.LOCATION[0].value : null,
                summary: vevent.summary,
                description: description,
                uid: vevent.properties.UID[0].value
            }));
        } else {
            console.log(vevent);
        }
    };
    return items;
};

function processICalHomeAway(cal) {
    var items = [];
    for(var key in cal.components.VEVENT) {
        var vevent = cal.components.VEVENT[key];
        var description = descriptionToJSON(vevent);
        
        var email = description["EMAIL"];

        if(vevent.properties["SUMMARY"][0].value.toLowerCase().indexOf("geblokkeerd") < 0
        && vevent.properties["SUMMARY"][0].value.toLowerCase().indexOf("block") < 0) {
            items.push(new models.Booking({
                name: vevent.properties.SUMMARY[0].value.split('-')[1].trim(),
                email: email,
                dStart: vevent.properties.DTSTART[0].value,
                dEnd: vevent.properties.DTEND[0].value,
                locations: (vevent.properties.LOCATION != null) ? vevent.properties.LOCATION[0].value : null,
                summary: vevent.summary,
                description: description,
                uid: vevent.properties.UID[0].value
            }));
        };
    };
    return items;
};

function processICal(cal) {
    var items = [];
    for(var key in cal.components.VEVENT) {
        var vevent = cal.components.VEVENT[key];
        var description = descriptionToJSON(vevent);
        
        var email = description["EMAIL"];

        items.push(new models.Booking({
            name: vevent.properties.SUMMARY[0].value,
            email: email,
            dStart: vevent.properties.DTSTART[0].value,
            dEnd: vevent.properties.DTEND[0].value,
            locations: (vevent.properties.LOCATION != null) ? vevent.properties.LOCATION[0].value : null,
            summary: vevent.summary,
            description: description,
            uid: vevent.properties.UID[0].value
        }));
    };
    return items;
};

function descriptionToJSON(vevent) {
    var description = {};
    for(var dKey in vevent.properties.DESCRIPTION) {
        var value = vevent.properties.DESCRIPTION[dKey].value;
        var array = value.split(/\r?\n/);
        for(var aKey in array) {
            var index = array[aKey].indexOf(":");
            var k = array[aKey].substring(0, index).trim();
            var v = array[aKey].substring(index + 1, array[aKey].length).trim();
            description[k] = v;
        };
    };
    return description;
};

module.exports = {
    models: models,
    getICal: function (name) {
        return new Promise(function (resolve, reject) {
            fs.readFile(dir + "/ical.json", "UTF8", function (error, data) {
                if(error != null)
                    return reject(error);

                if(data.length > 0)
                    json = JSON.parse(data);

                if(typeof(json) != "object")
                    json = [];
                
                var exists = json.filter(function (item) {
                    return item.name == name;
                });
                if(exists.length > 0)
                    return resolve(exists[0]);
                return reject(new Error("No iCal found!"));
            });
        });
    },
    getICals: function () {
        return new Promise(function (resolve, reject) {
            fs.readFile(dir + "/ical.json", "UTF8", function (error, data) {
                if(error != null)
                    return reject(error);

                if(data.length > 0)
                    json = JSON.parse(data);

                if(typeof(json) != "object")
                    json = [];
                
                if(json.length > 0)
                    return resolve(json);
                return reject(new Error("No iCal found!"));
            });
        });
    },
    importICal: function (ical) {
        return new Promise(function (resolve, reject) {
            if(ical.name == null || ical.name == "")
                return reject(new Error("No Name"));
            
            if(ical.url == null || ical.url == "")
                return reject(new Error("No URL"));

            if(ical.type == null || ical.type == "")
                return reject(new Error("No Type"));

            var dir = __dirname,
                json = [];

            fs.readFile(dir + "/ical.json", "UTF8", function (error, data) {
                if(error != null)
                    return reject(error);
                    
                if(data.length > 0)
                    json = JSON.parse(data);

                if(typeof(json) != "object")
                    json = [];
                
                var exists = json.filter(function (item) {
                    return item.name == ical.name;
                });
                if(exists.length > 0)
                    return reject(new Error("iCal already exists, name must be unique"));

                json.push(ical);
                fs.writeFile(dir + '/ical.json', JSON.stringify(json), 'utf8', function (error) {
                    if(error == null)
                        return resolve("OK");
                    return reject(error);
                });
            });
        });
    },
    removeICal: function (name) {
        return new Promise(function (resolve, reject) {
            var dir = __dirname,
                json = [];

            fs.readFile(dir + "/ical.json", "UTF8", function (error, data) {
                if(error != null)
                    return reject(error);

                json = JSON.parse(data);
                if(typeof(json) != "object")
                    json = [];
                
                var exists = json.filter(function (item) {
                    return item.name == name;
                });
                if(exists.length == 0)
                    return reject(new Error("iCal does not exist"));
                
                for(var key in exists) {
                    var index = json.indexOf(exists[key]);
                    json.splice(index, 1);
                };
                
                fs.writeFile(dir + '/ical.json', JSON.stringify(json), 'utf8', function (error) {
                    if(error == null)
                        return resolve("OK");
                    return reject(error);
                });
            });
        });
    },
    getICalToJSON: function (ical) {
        return new Promise(function (resolve, reject) {
            var options = {
                url: ical.url,
                method: "GET",
                headers: {
                    'User-Agent': 'none'
                }
            };

            function callback(error, response, body) {
                if(error != null)
                    return reject(error);

                if(response.statusCode === 200) {
                    var cal = icalendar.parse_calendar(body);
                    switch(ical.type) {
                        case models.ICalTypes.HOMEAWAY:
                            items = processICalHomeAway(cal);
                            break;
                        case models.ICalTypes.AIRBNB:
                            items = processICalAirBnB(cal);
                            break;
                        default:
                            items = processICal(cal);
                            break;
                    }
                    return resolve(items);
                } else {
                    return reject(new Error(response.responseMessage));
                };
            };
            request(options, callback);
        });
    }
};
