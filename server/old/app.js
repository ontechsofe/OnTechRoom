"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3333;
const diskdb = require('diskdb');
const moment = require('moment');
const request = require("request");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');

let cookie = request.jar();
const baseURL = "https://rooms.library.dc-uoit.ca/uo_rooms/";
const calendarURL = baseURL + 'calendar.aspx';
const roomURL = baseURL + 'room.aspx?room=';
const tempUrl = baseURL + 'temp.aspx';

const dbs = ['rooms'];
const db = diskdb.connect('./', dbs);

app.use(bodyParser.urlencoded({extended: true}));

function getStateData() {
    return new Promise((resolve, reject) => {
        request.get({
            url: calendarURL,
            jar: cookie,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
            }
        }, (error, response, body) => {
            const $ = cheerio.load(body);
            let data = {};
            $('form#Form1 input').each((i, element) => {
                let con = $(element);
                data[con.attr('name')] = con.attr('value');
            });
            resolve(data);
        });
    })
}

function postStateData(data) {
    return new Promise((resolve, reject) => {
        request.post({
            url: calendarURL,
            formData: data,
            jar: cookie,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
            }
        }, (error, response, body) => {
            const $ = cheerio.load(body);
            let data = {};
            $('form#Form1 input').each((i, element) => {
                let con = $(element);
                data[con.attr('name')] = con.attr('value');
            });
            resolve(data);
        });
    })
}

function getDataForDate(data) {
    let today = moment().format('dddd, MMMM DD, YYYY');
    let tomorrow = moment().add(1, 'days').format('dddd, MMMM DD, YYYY');
    data['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$RadioButtonListDateSelection$0";
    data['__EVENTARGUMENT'] = "";
    data['ctl00$ContentPlaceHolder1$RadioButtonListDateSelection'] = today;
    return new Promise((resolve, reject) => {
        request.post({
            url: calendarURL,
            formData: data,
            jar: cookie,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
            }
        }, (error, response, body) => {
            resolve(body);
        });
    })
}

function getRoomData(roomName) {
    const roomDataMap = {
        "Facilities": {n: 'facilities', c: false},
        "Floor no.": {n: 'floor', c: true},
        "Seating capacity": {n: 'capacity', c: true},
        "Min. people required to book": {n: 'minRequired', c: true},
        "Max. bookable duration": {n: 'maxDuration', c: true}
    };
    return new Promise((resolve, reject) => {
        request.get({
            url: roomURL + roomName,
            jar: cookie
        }, (error, response, body) => {
            const $ = cheerio.load(body);
            let imagePhotoElement = $('#ContentPlaceHolder1_ImagePhoto')[0];
            let data = $('#ContentPlaceHolder1_TableRoomInfo tbody tr td');
            let pts = [];
            data.each((i, tr) => {
                if (tr.children[0].children[0]) {
                    if (tr.children[0].children[0].data) {
                        pts.push(tr.children[0].children[0].data);
                    } else {
                        pts.push(tr.children[0].children[0].children[0].data + tr.children[0].children[0].next.data);
                    }
                } else {
                }
            });
            let roomData = {};
            for (let i = 0; i < pts.length; i += 2) {
                roomData[roomDataMap[pts[i]].n] = (roomDataMap[pts[i]].c ? parseInt(pts[i + 1]) : pts[i + 1]);
            }
            roomData['facilities'] = roomData['facilities'].split(',').map(e => e.trim().toLowerCase());
            let completeRoomData = Object.assign({
                name: roomName,
                imageURL: baseURL + imagePhotoElement.attribs.src
            }, roomData);
            resolve(completeRoomData);
        });
    })
}

const convertArrayToObject = (array) => {
    let g = {};
    array.forEach((e) => {
        g[e] = "";
    });
    return g;
};

function getCalendarData(rawCalendar) {
    let timeObject = {};
    let roomNames = [];
    return new Promise((resolve, reject) => {
        const $ = cheerio.load(rawCalendar);
        $(`table#ContentPlaceHolder1_Table1 tbody > tr:first-child td a`)
            .each((i, e) => roomNames.push(e.children[0].data));
        $(`table#ContentPlaceHolder1_Table1 tbody > tr`).each((i, e) => {
            let s = cheerio.load(e);
            let sr = s(`td:first-child`)[0].children[0].children;
            if (sr[0]) {
                timeObject[sr[0].data] = convertArrayToObject(roomNames);
                s(`td:not(:first-child)`).each((index, element) => {
                    let tableString = "";
                    if (element.children[0].children[0].data) {
                        tableString = element.children[0].children[0].data;
                    } else if (element.children[0].children[0].children[0]) {
                        tableString = `$$${element.children[0].children[0].children[0].data}$$`;
                    } else {
                        tableString = "=OPEN=";
                    }
                    timeObject[sr[0].data][roomNames[index]] = tableString;
                })
            }
        });
        let previousTime = null;
        for (let key in timeObject) {
            if (!timeObject.hasOwnProperty(key)) continue;
            let obj = timeObject[key];
            for (let prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue;
                if (previousTime !== null) {
                    if (timeObject[previousTime][prop] !== "\"" && timeObject[key][prop] === "\"") {
                        timeObject[key][prop] = timeObject[previousTime][prop];
                    }
                }
            }
            previousTime = key;
        }
        console.table(timeObject);
        resolve(timeObject);
    })
}

async function getRooms(calendar) {
    const $ = cheerio.load(calendar);
    let roomData = [];
    let roomNames = [];
    let rooms = $("table#ContentPlaceHolder1_Table1  tbody > tr:first-child td a");
    rooms.each((i, e) => roomNames.push(e.children[0].data));
    for (let index = 0; index < roomNames.length; index++) {
        let r = await getRoomData(roomNames[index]);
        roomData.push(r);
    }
    return roomData;
}

// async function x() {
//     let data = await getStateData();
//     let postContinueData = await postStateData(data);
//     let calendar = await getDataForDate(postContinueData);
//     let result = await getRooms(calendar);
//     result.forEach(e => {
//         console.log(e.name);
//         DB.rooms.update({name: e.name}, e, {multi: true, upsert: true})
//     });
//
//     const $ = cheerio.load(calendar);
//     let calendarTable = $("table#ContentPlaceHolder1_Table1  tbody tr");
//
// }

function checkLoginOnMyCampus(username, password) {
    const LOGIN_URL = 'http://portal.mycampus.ca/cp/home/login';
    const BASE_URL = 'http://portal.mycampus.ca/cp/ip/login?sys=sct&url=';
    const NAME_URL = 'http://ssbp.mycampus.ca/prod_uoit/bwskoacc.P_ViewAcctTotal';
    const PAYLOAD = {
        'user': username,
        'pass': password,
        'uuid': '0xACA021'
    };
    let sess = request.jar();
    return new Promise((resolve, reject) => {
        request.post({
            url: LOGIN_URL,
            form: PAYLOAD,
            jar: sess
        }, (_err0, _res0, body0) => {
            if (!body0.includes('Error: Failed Login')) {
                request.get({
                    url: (BASE_URL + NAME_URL),
                    jar: sess
                }, (_err01, _res01, body01) => {
                    let nameContentArray = [];
                    cheerio.load(body01)('p.whitespace1').each(function () {
                        nameContentArray.push(this)
                    });
                    let fal = nameContentArray[0].children[0].data.replace(/\n/g, '').split('(')[0].trim().split(' ');
                    resolve({first: fal[0], last: fal[1]})
                })
            } else {
                reject("Invalid Login");
            }
        });
    });
}

const makeBooking = (time, room, jar) => {
    let bookURL = `${tempUrl}?starttime=${time}&room=${room}&next=book.aspx`;
    let getFormURL = `${baseURL}book.aspx`;
    return new Promise(((resolve, reject) => {
        request.get({
            url: bookURL,
            jar: cookie,
            followRedirect: false,
        }, (e, r, b) => {
            let PAYLOAD = {};
            let $ = cheerio.load(b);
            $("#Form1 input").each((index, element) => {
                PAYLOAD[element.attribs.name] = element.attribs.value;
            });
        });
    }))
};

// request.post({
//     url: bookURL,
//     formData: PAYLOAD,
//     jar: cookie,
//     followRedirect: true,
//     headers: {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
//     }
// }, (error, response, body) => {
//     request.get({
//         url: getFormURL,
//         jar: cookie,
//         followRedirect: true,
//         headers: {
//             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
//         }
//     }, (er, re, bo) => {
//         resolve(bo);
//     });
// });

app.get('/', (req, res) => {
    return res.json({data: 'Hello World!'});
});

app.get('/rooms', (req, res) => {
    getStateData()
        .then(data => postStateData(data)
            .then(postContinueData => getDataForDate(postContinueData)
                .then(calendar => getRooms(calendar)
                    .then(result => res.json(result)))));
});

app.get('/calendar', (req, res) => {
    getStateData().then(data => postStateData(data).then(postContinueData => getDataForDate(postContinueData).then(calendar => getCalendarData(calendar).then(result => res.json(result)))));
});


app.post('/auth', (req, res) => {
    checkLoginOnMyCampus(req.body.id, req.body.password).then(name => {
        res.json({name});
    }).catch(err => {
        res.json({error: err});
        console.log(err);
    })
});

app.get('/book', async (req, res) => {
    res.json({});
});


app.listen(port, () => console.log(`OnTechRoom is listening on port ${port}!`));

