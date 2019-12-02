import {OTRService} from "./OTRService";
import {Service} from "typedi";
import {CalendarDay} from "../Types/DayEnum";
import {BookingLengthEnum} from "../Types/BookingLengthEnum";

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

    public async searchForRoom(day: CalendarDay, time: string, length: BookingLengthEnum, peopleCount: number) {
        return await this.otrService.searchForRoom(day, time, length, peopleCount);
    }
}
