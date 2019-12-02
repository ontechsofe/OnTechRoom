import {Service} from "typedi";
import request from "request";
import moment from "moment";
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import {CalendarDay} from "../Types/DayEnum";
import {RoomBookingEnum} from "../Types/RoomBookingEnum";
import logger from "../../Util/Log";
import {BookingLengthEnum} from "../Types/BookingLengthEnum";

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

    public async getCalendarByDay(day: CalendarDay): Promise<{}> {
        const {browser, page} = await this.getCalendar(day);
        await page.screenshot({path: 'example.png'}); // This seems to wait for long enough to get the page loaded?
        await page.waitForSelector('form#Form1');
        let tableBody = await page.$('form#Form1');
        const body = await page.evaluate(b => b.innerHTML, tableBody);
        let $ = cheerio.load(body);
        let roomNames = [];
        let timeObject = {};
        $(`table#ContentPlaceHolder1_Table1 tbody > tr:first-child td a`).each((i, e) => roomNames.push(e.children[0].data));
        $(`table#ContentPlaceHolder1_Table1 tbody > tr:not(:first-child)`).each((i, e) => {
            let s = cheerio.load(e);
            let t = s("td:first-child")[0].children[0].data.trim();
            timeObject[t] = this.convertArrayToObject(roomNames); // ensure new instance of object per time
            s(`td:not(:first-child)`).each((index, element) => {
                let tableString = "";
                if (element.children[0].data) {
                    tableString = element.children[0].data;
                } else if (element.children[0].children[0].data) {
                    tableString = element.children[0].children[0].data;
                } else {
                    tableString = "=OPEN=";
                }
                timeObject[t][roomNames[index]] = tableString;
            })
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
        browser.close();
        return timeObject;
    }

    public async getIncompleteBookings(day: CalendarDay) {
        const {browser, page} = await this.getCalendar(day);
        await page.screenshot({path: 'example.png'}); // This seems to wait for long enough to get the page loaded?
        await page.waitForSelector('form#Form1');
        let tableBody = await page.$('form#Form1');
        const body = await page.evaluate(b => b.innerHTML, tableBody);
        let $ = cheerio.load(body);
        let allCurrentBookingTimes = [];
        $('a img[src*="open1"]').each((index, element) => {
            let longRawData = $(element).attr("title");
            let split1 = longRawData.split(" / ");
            let split2 = split1[1].split(".");
            allCurrentBookingTimes.push({time: split1[0], room: split2[0]})
        });
        let incompleteBookingsSet = new Set();
        for (let i = 0; i < allCurrentBookingTimes.length; i++) {
            let searchString = `${allCurrentBookingTimes[i].time} / ${allCurrentBookingTimes[i].room}. Incomplete reservation. This slot is open for reservation`;
            await page.screenshot({path: 'example.png'});
            this.clickButton(page, `a[title="${searchString}"]`);
            await page.waitForSelector("#ContentPlaceHolder1_RadioButtonListJoinOrCreateGroup");
            let availableBookings = await page.$("#ContentPlaceHolder1_RadioButtonListJoinOrCreateGroup");
            const body = await page.evaluate(b => b.innerHTML, availableBookings);
            let pr = cheerio.load(body);
            pr(`input[type="radio"]`).each(((index, element) => {
                incompleteBookingsSet.add(`${allCurrentBookingTimes[i].room}~~~~${pr(element).attr("value")}~~~~${allCurrentBookingTimes[i].time}`);
            }));
            await page.goBack();
        }
        let incompleteBooking = Array.from(incompleteBookingsSet);
        incompleteBooking = incompleteBooking
            .filter((e: any) => !e.includes("invalid_code"))
            .map((e: any) => {
                let pa = e.split("~~~~");
                return {
                    room: pa[0],
                    code: pa[1],
                    time: pa[2]
                };
            });
        let parsedEvents = {};
        incompleteBooking.forEach((e: any) => {
            if (!parsedEvents[e.code]) {
                parsedEvents[e.code] = {
                    room: e.room,
                    time: []
                };
            }
            parsedEvents[e.code].time.push(e.time);
        });

        let processedEvents = [];
        let codes = Object.keys(parsedEvents);
        for (let code in codes) {
            processedEvents.push({
                code: codes[code],
                room: parsedEvents[codes[code]].room,
                time: parsedEvents[codes[code]].time
            })
        }
        await browser.close();
        return processedEvents;
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
        const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto(`https://rooms.library.dc-uoit.ca/uo_rooms/myreservations.aspx`);
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

    public async leaveBooking(id: string, password: string, date: CalendarDay, time: string, room: string) {
        const {browser, page} = await this.getCalendar(date);
        await this.clickButton(page, `td[title="Time: ${time}. Room no.: ${room.toUpperCase()}"] > a`);
        await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxStudentID', id);
        await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxPassword', password);
        await page.waitForSelector("#ContentPlaceHolder1_ButtonLeaveGroup");
        await page.click("#ContentPlaceHolder1_ButtonLeaveGroup");
        await browser.close();
        return {bookingState: RoomBookingEnum.INCOMPLETE_BOOKING};
    }

    public async bookRoom(id: string, password: string, date: CalendarDay, time: string, room: string, bookingType: RoomBookingEnum, code: string, name: string, length: BookingLengthEnum): Promise<{}> {
        try {
            let retState = RoomBookingEnum.NOT_BOOKED;
            let errorMessage = "";
            const {browser, page} = await this.getCalendar(date);
            console.log(bookingType);
            switch (bookingType) {
                case RoomBookingEnum.NOT_BOOKED:
                    await this.clickButton(page, `a[title="Time: ${time}. Room no.: ${room.toUpperCase()}"]`);
                    await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxName', name);
                    await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxGroupCode', code);
                    switch (length) {
                        case BookingLengthEnum.L30MINUTES:
                            await this.clickButton(page, '#ContentPlaceHolder1_RadioButtonListDuration_0');
                            break;
                        case BookingLengthEnum.L1HOUR:
                            await this.clickButton(page, '#ContentPlaceHolder1_RadioButtonListDuration_1');
                            break;
                        case BookingLengthEnum.L1HOUR_30MINUTES:
                            await this.clickButton(page, '#ContentPlaceHolder1_RadioButtonListDuration_2');
                            break;
                        case BookingLengthEnum.L2HOURS:
                            await this.clickButton(page, '#ContentPlaceHolder1_RadioButtonListDuration_3');
                            break;
                    }
                    await this.clickButton(page, '#ContentPlaceHolder1_RadioButtonListInstitutions_1');
                    await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxNotes', 'Booked using OTR!');
                    await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxStudentID', id);
                    await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxPassword', password);
                    await this.clickButton(page, '#ContentPlaceHolder1_ButtonReserve');
                    if (await page.$("#ContentPlaceHolder1_LabelError") !== null) {
                        const element = await page.$("#ContentPlaceHolder1_LabelError");
                        errorMessage = await page.evaluate(element => element.textContent, element);
                        retState = RoomBookingEnum.NOT_BOOKED;
                    } else {
                        await page.waitForSelector('#ContentPlaceHolder1_LabelMessage');
                        let bodyHandle = await page.$('#ContentPlaceHolder1_LabelMessage');
                        const message = await page.evaluate(body => body.innerHTML, bodyHandle);
                        if (message.includes('allocated to you')) {
                            retState = RoomBookingEnum.INCOMPLETE_BOOKING;
                        } else if (message.includes('Success')) {
                            retState = RoomBookingEnum.BOOKING_COMPLETED;
                        } else {
                            retState = RoomBookingEnum.NOT_BOOKED;
                        }
                    }
                    break;
                case RoomBookingEnum.INCOMPLETE_BOOKING:
                    await this.clickButton(page, `a[title="${time} / ${room.toUpperCase()}. Incomplete reservation. This slot is open for reservation"]`);
                    await this.clickButton(page, `input[value="${code}"]`);
                    await this.clickButton(page, "#ContentPlaceHolder1_ButtonJoinOrCreate");
                    await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxID', id);
                    await this.writeToTextbox(page, '#ContentPlaceHolder1_TextBoxPassword', password);
                    await this.clickButton(page, "#ContentPlaceHolder1_ButtonJoin");
                    await page.waitForSelector('#ContentPlaceHolder1_LabelMessage');
                    let body = await page.$('#ContentPlaceHolder1_LabelMessage');
                    const m = await page.evaluate(body => body.innerHTML, body);
                    if (m.includes('allocated to you')) {
                        retState = RoomBookingEnum.INCOMPLETE_BOOKING;
                    } else if (m.includes('Success')) {
                        retState = RoomBookingEnum.BOOKING_COMPLETED;
                    } else {
                        retState = RoomBookingEnum.NOT_BOOKED;
                    }
                    break;
                case RoomBookingEnum.BOOKING_COMPLETED:
                    retState = RoomBookingEnum.BOOKING_COMPLETED;
                    break;
            }
            await browser.close();
            return {bookingState: retState, error: errorMessage};
        } catch (e) {
            logger.error(e.stack);
        }
        return {bookingState: RoomBookingEnum.NOT_BOOKED};
    }

    private async getCalendar(date: CalendarDay) {
        try {
            const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
            const page = await browser.newPage();
            await page.goto('https://rooms.library.dc-uoit.ca/uo_rooms/calendar.aspx');
            await this.clickButton(page, '#ContentPlaceHolder1_ButtonContinue');
            await this.clickButton(page, (date === CalendarDay.TODAY ? '#ContentPlaceHolder1_RadioButtonListDateSelection_0' : '#ContentPlaceHolder1_RadioButtonListDateSelection_1'));
            return {browser, page};
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    private async writeToTextbox(page, selector: string, data: string) {
        await page.waitForSelector(selector);
        await page.type(selector, data);
    }

    private async clickButton(page, selector: string) {
        await page.waitForSelector(selector);
        await page.click(selector);
    }

    /**
     * Note to self
     * TODO:
     * The Calendar restricts the length of the booking till the last time on the calendar
     * This could be better controlled from inside the app... but also valuable on the api
     */
    public async searchForRoom(day: CalendarDay, time: string, length: BookingLengthEnum, peopleCount: number) {
        let cal = await this.getCalendarByDay(day);
        let times = Object.keys(cal);
        let startIndex = 0;
        if (time[0] === "0") {
            time = time.substr(1);
        }
        for (let i = 0; i < times.length; i++) {
            if (times[i] === time) {
                startIndex = i;
                break;
            }
        }
        let roomList = Object.keys(cal[times[startIndex]]);
        let roomStatus = {};
        for (let room in roomList) {
            roomStatus[roomList[room]] = 0;
        }
        for (let i = 0; i <= length; i++) {
            if (cal[times[startIndex + i]]) {
                let roomStats = cal[times[startIndex + i]];
                for (let j = 0; j < roomList.length; j++) {
                    if (roomStats[roomList[j]] === "=OPEN=") {
                        roomStatus[roomList[j]]++;
                    }
                }
            }
        }
        let goodRooms = [];
        let possibleSuggestions = []; // this is a last minute addition
        for (let room in roomStatus) {
            if (roomStatus[room] === (length + 1)) {
                goodRooms.push(room);
            }
        }
        return {goodRooms, possibleSuggestions};
    }
}
