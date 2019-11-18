const moment = require('moment');
const request = require("request");
const cheerio = require("cheerio");
const Prompt = require('prompt-password');
const prompt = new Prompt({
    type: 'password',
    message: 'password: ',
    name: 'password',
    mask: '*'
});

const studentID = new Prompt({
    message: 'student id: ',
    name: 'id'
});

let cookie = request.jar();
const baseURL = "https://rooms.library.dc-uoit.ca/uo_rooms/";
const calendarURL = baseURL + 'calendar.aspx';
const roomURL = baseURL + 'room.aspx?room=';

function getStateData() {
    return new Promise((resolve, reject) => {
        request.get({
            url: calendarURL,
            jar: cookie
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
            jar: cookie
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
    // Sunday, November 17, 2019
    let today = moment().format('dddd, MMMM DD, YYYY');
    let tomorrow = moment().add(1, 'days').format('dddd, MMMM DD, YYYY');
    data['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$RadioButtonListDateSelection$0";
    data['__EVENTARGUMENT'] = "";
    data['ctl00$ContentPlaceHolder1$RadioButtonListDateSelection'] = today;
    return new Promise((resolve, reject) => {
        request.post({
            url: calendarURL,
            formData: data,
            jar: cookie
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
            let completeRoomData = Object.assign({
                name: roomName,
                imageURL: baseURL + imagePhotoElement.attribs.src
            }, roomData);
            resolve(completeRoomData);
        });
    })
}

async function getRooms(calendar) {
    const $ = cheerio.load(calendar);
    let roomData = [];
    let rooms = $("table#ContentPlaceHolder1_Table1  tbody > tr:first-child td a");
    rooms.each((i, e) => roomData.push(e.children[0].data));
    for (let i = 0; i < roomData.length; i++) {
        let r = await getRoomData(roomData[i]);
        roomData.push(r);
    }
    return roomData;
}

async function x() {
    let data = await getStateData();
    let postContinueData = await postStateData(data);
    let calendar = await getDataForDate(postContinueData);
    let roomData = await getRooms(calendar);
    console.log(roomData);
    const $ = cheerio.load(calendar);
    let calendarTable = $("table#ContentPlaceHolder1_Table1  tbody tr");

}

x();
