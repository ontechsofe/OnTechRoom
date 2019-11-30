import {OTRService} from "./OTRService";
import {Service} from "typedi";
import {CalendarDay} from "../Types/DayEnum";

@Service()
export class CalendarService {
    constructor(
        private otrService: OTRService
    ) {
    }

    public async getCalendarByTime(day: CalendarDay) {
        return await this.otrService.getCalendarByDay(day);
    }

    public async getCalendarByRoom(day: CalendarDay) {
        return await this.otrService.getCalendarByRoom(day);
    }
}
