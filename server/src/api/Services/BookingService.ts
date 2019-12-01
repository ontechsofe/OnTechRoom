import {Service} from "typedi";
import {OTRService} from "./OTRService";
import {CalendarDay} from "../Types/DayEnum";
import {RoomBookingEnum} from "../Types/RoomBookingEnum";

@Service()
export class BookingService {
    public static MAX_BOOKINGS: number = 20;
    constructor(
        private otrService: OTRService
    ) {
    }

    public async makeBooking(id: string, password: string, date: CalendarDay, time: string, room: string, bookingType: RoomBookingEnum, code: string, name: string) {
        return await this.otrService.bookRoom(id, password, date, time, room, bookingType, code, name);
    }

    public async getPreviousBookings(id: string, password: string) {
        return await this.otrService.getBookings(id, password);
    }
}
