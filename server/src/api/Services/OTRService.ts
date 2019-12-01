import {Service} from "typedi";
import request from "request";
import moment from "moment";
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import {CalendarDay} from "../Types/DayEnum";
import {RoomBookingEnum} from "../Types/RoomBookingEnum";

@Service()
export class OTRService {

    private cookieJar = request.jar();
    private baseURL = "https://rooms.library.dc-uoit.ca/uo_rooms/";
    private calendarURL = this.baseURL + 'calendar.aspx';
    private roomURL = this.baseURL + 'room.aspx?room=';

    constructor() {

    }

    public checkLoginOnMyCampus(username: string, password: string): Promise<{}> {
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
                        cheerio.load(body01)('p.whitespace1').each((index, element) => {
                            nameContentArray.push(element)
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

    public getStateData(): Promise<{}> {
        return new Promise((resolve, reject) => {
            request.get({
                url: this.calendarURL,
                jar: this.cookieJar
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

    public postStateData(data): Promise<{}> {
        return new Promise((resolve, reject) => {
            request.post({
                url: this.calendarURL,
                formData: data,
                jar: this.cookieJar
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

    public getDataForDate(data, date: CalendarDay): Promise<string> {
        let dateValue = null;
        switch (date) {
            case CalendarDay.TODAY:
                dateValue = moment().format('dddd, MMMM DD, YYYY');
                break;
            case CalendarDay.TOMORROW:
                dateValue = moment().add(1, 'days').format('dddd, MMMM DD, YYYY');
                break;
        }
        data['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$RadioButtonListDateSelection$0";
        data['__EVENTARGUMENT'] = "";
        data['ctl00$ContentPlaceHolder1$RadioButtonListDateSelection'] = dateValue;
        return new Promise((resolve, reject) => {
            request.post({
                url: this.calendarURL,
                formData: data,
                jar: this.cookieJar
            }, (error, response, body) => {
                resolve(body);
            });
        })
    }

    public getRoomData(roomName): Promise<{}> {
        const roomDataMap = {
            "Facilities": {n: 'facilities', c: false},
            "Floor no.": {n: 'floor', c: true},
            "Seating capacity": {n: 'capacity', c: true},
            "Min. people required to book": {n: 'minRequired', c: true},
            "Max. bookable duration": {n: 'maxDuration', c: true}
        };
        return new Promise((resolve, reject) => {
            request.get({
                url: this.roomURL + roomName,
                jar: this.cookieJar
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
                    imageURL: this.baseURL + imagePhotoElement.attribs.src
                }, roomData);
                resolve(completeRoomData);
            });
        })
    }

    public async getRooms(): Promise<Array<any>> {
        let stateData = await this.getStateData();
        let postContinueData = await this.postStateData(stateData);
        let calendar: string = await this.getDataForDate(postContinueData, CalendarDay.TODAY);
        const $ = cheerio.load(calendar);
        let roomData = [];
        let roomNames = [];
        let rooms = $("table#ContentPlaceHolder1_Table1  tbody > tr:first-child td a");
        rooms.each((i, e) => roomNames.push(e.children[0].data));
        for (let index = 0; index < roomNames.length; index++) {
            let r = await this.getRoomData(roomNames[index]);
            roomData.push(r);
        }
        return roomData;
    }

    public convertArrayToObject(array) {
        let g = {};
        array.forEach((e) => {
            g[e] = "";
        });
        return g;
    };

    public getCalendarData(rawCalendar) {
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
                    let t = sr[0].data.trim();
                    timeObject[t] = this.convertArrayToObject(roomNames);
                    s(`td:not(:first-child)`).each((index, element) => {
                        let tableString = "";
                        if (element.children[0].children[0].data) {
                            tableString = element.children[0].children[0].data;
                        } else if (element.children[0].children[0].children[0]) {
                            tableString = element.children[0].children[0].children[0].data;
                        } else {
                            tableString = "=OPEN=";
                        }
                        timeObject[t][roomNames[index]] = tableString;
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
            resolve(timeObject);
        })
    }

    public async getCalendarByDay(date: CalendarDay): Promise<{}> {
        let stateData = await this.getStateData();
        let postContinueData = await this.postStateData(stateData);
        let rawCalendar: string = await this.getDataForDate(postContinueData, date);
        let calendar = await this.getCalendarData(rawCalendar);
        return calendar;
    }

    public async getCalendarByRoom(day: CalendarDay) {
        let calendar = await this.getCalendarByDay(day);
        let roomObject = {};
        for (let key in calendar) {
            if (!calendar.hasOwnProperty(key)) continue;
            let obj = calendar[key];
            for (let prop in obj) {
                if (!obj.hasOwnProperty(prop)) continue;
                if (!(prop in roomObject)) {
                    roomObject[prop] = {};
                }
                roomObject[prop][key] = calendar[key][prop];
            }
        }
        return roomObject;
    }

    public async getBookings(id: string, password: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://rooms.library.dc-uoit.ca/uo_rooms/myreservations.aspx');
        const SEL_id = '#ContentPlaceHolder1_TextBoxID';
        const SEL_password = '#ContentPlaceHolder1_TextBoxPassword';
        const SEL_bookingsButton = '#ContentPlaceHolder1_ButtonListBookings';
        const SEL_bookingTable = '#ContentPlaceHolder1_TablePast';

        await page.waitForSelector(SEL_id);
        await page.type(SEL_id, id);

        await page.waitForSelector(SEL_password);
        await page.type(SEL_password, password);

        await page.waitForSelector(SEL_bookingsButton);
        await page.click(SEL_bookingsButton);

        await page.waitForSelector(SEL_bookingTable);
        let bodyHandle = await page.$('html');
        const body = await page.evaluate(body => body.innerHTML, bodyHandle);
        let $ = cheerio.load(body);
        let bookingData = [];
        let swst = 0;
        let bookingIndex = 0;
        $(SEL_bookingTable + ' tr:not(:first-child) > td').each(((index, element) => {
            let data = element.children[0].data;
            switch (swst) {
                case 0:
                    bookingData.push({
                        room: data
                    });
                    swst++;
                    break;
                case 1:
                    bookingData[bookingIndex]["date"] = data;
                    swst++;
                    break;
                case 2:
                    bookingData[bookingIndex]["time"] = data;
                    swst = 0;
                    bookingIndex++;
                    break
            }
        }));
        return bookingData;
    }

    public async bookRoom(id: string, password: string, date: CalendarDay, time: string, room: string, bookingType: RoomBookingEnum, code: string, name: string): Promise<{}> {
        let retState = RoomBookingEnum.NOT_BOOKED;
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://rooms.library.dc-uoit.ca/uo_rooms/calendar.aspx');
        const SEL_continueButton = '#ContentPlaceHolder1_ButtonContinue';
        await page.waitForSelector(SEL_continueButton);
        await page.click(SEL_continueButton);
        const SEL_todayButton = '#ContentPlaceHolder1_RadioButtonListDateSelection_0';
        await page.waitForSelector(SEL_todayButton);
        await page.click(SEL_todayButton);

        switch (bookingType) {
            case RoomBookingEnum.NOT_BOOKED:
                const SEL_date = `a[title="Time: ${time}. Room no.: ${room.toUpperCase()}"]`;
                const SEL_groupName = '#ContentPlaceHolder1_TextBoxName';
                const SEL_groupCode = '#ContentPlaceHolder1_TextBoxGroupCode';
                const SEL_duration = '#ContentPlaceHolder1_RadioButtonListDuration_3';
                const SEL_institution = '#ContentPlaceHolder1_RadioButtonListInstitutions_1';
                const SEL_notes = '#ContentPlaceHolder1_TextBoxNotes';
                const SEL_id = '#ContentPlaceHolder1_TextBoxID';
                const SEL_password = '#ContentPlaceHolder1_TextBoxPassword';
                const SEL_bookButton = '#ContentPlaceHolder1_ButtonReserve';
                const SEL_message = '#ContentPlaceHolder1_LabelMessage';
                await page.waitForSelector(SEL_date);
                await page.click(SEL_date);
                await page.waitForSelector(SEL_groupName);
                await page.type(SEL_groupName, name);
                await page.waitForSelector(SEL_groupCode);
                await page.type(SEL_groupCode, code);
                await page.waitForSelector(SEL_duration);
                await page.click(SEL_duration);
                await page.waitForSelector(SEL_institution);
                await page.click(SEL_institution);
                await page.waitForSelector(SEL_notes);
                await page.type(SEL_notes, 'Booked using OTR!');
                await page.waitForSelector(SEL_id);
                await page.type(SEL_id, id);
                await page.waitForSelector(SEL_password);
                await page.type(SEL_password, password);
                await page.waitForSelector(SEL_bookButton);
                await page.click(SEL_bookButton);
                await page.waitForSelector(SEL_message);
                let bodyHandle = await page.$(SEL_message);
                const message = await page.evaluate(body => body.innerHTML, bodyHandle);
                if (message.includes('allocated to you')) {
                    console.log("Booking made... still need additional people");
                    retState = RoomBookingEnum.INCOMPLETE_BOOKING;
                } else if (message.includes('Success')) {
                    retState = RoomBookingEnum.BOOKING_COMPLETED;
                } else {
                    retState = RoomBookingEnum.NOT_BOOKED;
                }
                break;
            case RoomBookingEnum.INCOMPLETE_BOOKING:
                const SEL_calEntry = `a[title="${time} / ${room.toUpperCase()}. Incomplete reservation. This slot is open for reservation"]`;
                await page.waitForSelector(SEL_calEntry);
                await page.click(SEL_calEntry);
                const SEL_joinGroupCode = `input[value="${code}"]`;
                await page.waitForSelector(SEL_joinGroupCode);
                await page.click(SEL_joinGroupCode);
                const SEL_createOrJoinButton = "#ContentPlaceHolder1_ButtonJoinOrCreate";
                await page.waitForSelector(SEL_createOrJoinButton);
                await page.click(SEL_createOrJoinButton);
                const SEL_idTxt = '#ContentPlaceHolder1_TextBoxID';
                await page.waitForSelector(SEL_idTxt);
                await page.type(SEL_idTxt, id);
                const SEL_passwordTxt = '#ContentPlaceHolder1_TextBoxPassword';
                await page.waitForSelector(SEL_passwordTxt);
                await page.type(SEL_passwordTxt, password);
                const SEL_joinRoomButton = "#ContentPlaceHolder1_ButtonJoin";
                await page.waitForSelector(SEL_joinRoomButton);
                await page.click(SEL_joinRoomButton);
                const SEL_messageTxt = '#ContentPlaceHolder1_LabelMessage';
                await page.waitForSelector(SEL_messageTxt);
                let body = await page.$(SEL_messageTxt);
                const m = await page.evaluate(body => body.innerHTML, body);
                if (m.includes('allocated to you')) {
                    console.log("Booking made... still need additional people");
                    retState = RoomBookingEnum.INCOMPLETE_BOOKING;
                } else if (m.includes('Success')) {
                    retState = RoomBookingEnum.BOOKING_COMPLETED;
                } else {
                    retState = RoomBookingEnum.NOT_BOOKED;
                }
                break;
            case RoomBookingEnum.BOOKING_COMPLETED:
                retState = RoomBookingEnum.BOOKING_COMPLETED;
        }
        await browser.close();
        return {bookingState: retState};
    }
}
