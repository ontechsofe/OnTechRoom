import {Get, JsonController} from 'routing-controllers';
import {CalendarDay, CalendarService} from "../Services/CalendarService";

@JsonController('/calendar')
export class CalendarController {

    constructor(
        private calendarService: CalendarService
    ) {
    }

    @Get('/room/today')
    public getCalendarTodayByRoom() {
        this.calendarService.getCalendarByRoom(CalendarDay.TODAY);
    }

    @Get('/room/tomorrow')
    public getCalendarTomorrowByRoom() {
        this.calendarService.getCalendarByRoom(CalendarDay.TOMORROW);
    }

    @Get('/time/today')
    public getCalendarTodayByTime() {
        this.calendarService.getCalendarByTime(CalendarDay.TODAY);
    }

    @Get('/time/tomorrow')
    public getCalendarTomorrowByTime() {
        this.calendarService.getCalendarByTime(CalendarDay.TOMORROW);
    }
}
