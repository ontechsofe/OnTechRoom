import {Get, JsonController} from 'routing-controllers';
import {CalendarService} from "../Services/CalendarService";
import {CalendarDay} from "../Types/DayEnum";

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
}
