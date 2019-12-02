import {Body, Get, JsonController, Post} from 'routing-controllers';
import {CalendarService} from "../Services/CalendarService";
import {CalendarDay} from "../Types/DayEnum";
import {BookingLengthEnum} from "../Types/BookingLengthEnum";
import logger from "../../Util/Log";

class CalendarSearchBody {
    public day: CalendarDay;
    public time: string;
    public length: BookingLengthEnum;
    public peopleCount: number;
}

@JsonController('/calendar')
export class CalendarController {

    constructor(
        private calendarService: CalendarService
    ) {
    }

    @Get('/room/today')
    public async getCalendarTodayByRoom() {
        return await this.calendarService.getCalendarByRoom(CalendarDay.TODAY);
    }

    @Get('/room/tomorrow')
    public async getCalendarTomorrowByRoom() {
        return await this.calendarService.getCalendarByRoom(CalendarDay.TOMORROW);
    }

    @Get('/time/today')
    public async getCalendarTodayByTime() {
        return await this.calendarService.getCalendarByTime(CalendarDay.TODAY);
    }

    @Get('/time/tomorrow')
    public async getCalendarTomorrowByTime() {
        return await this.calendarService.getCalendarByTime(CalendarDay.TOMORROW);
    }

    @Post('/search')
    public async searchForRoom(@Body() body: CalendarSearchBody) {
        try {
            let day = (typeof body.day === "string" ? parseInt(body.day) : body.day);
            let length = (typeof body.length === "string" ? parseInt(body.length) : body.length);
            let peopleCount = (typeof body.peopleCount === "string" ? parseInt(body.peopleCount) : body.peopleCount);
            return await this.calendarService.searchForRoom(day, body.time, length, peopleCount);
        } catch (e) {
            logger.error(e.stack);
        }
        return null;
    }
}
