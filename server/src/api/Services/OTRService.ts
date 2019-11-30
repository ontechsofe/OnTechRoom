import {Service} from "typedi";
import request from "request";
import moment from "moment";
import cheerio from 'cheerio';

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

    public getCalendarData(rawCalendar) {
        return new Promise(((resolve, reject) => {
            resolve(true);
        }))
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

    public getDataForDate(data): Promise<string> {
        let today = moment().format('dddd, MMMM DD, YYYY');
        // let tomorrow = moment().add(1, 'days').format('dddd, MMMM DD, YYYY');
        data['__EVENTTARGET'] = "ctl00$ContentPlaceHolder1$RadioButtonListDateSelection$0";
        data['__EVENTARGUMENT'] = "";
        data['ctl00$ContentPlaceHolder1$RadioButtonListDateSelection'] = today;
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
        let calendar: string = await this.getDataForDate(postContinueData);
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

}
