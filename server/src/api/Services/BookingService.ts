import {Service} from "typedi";
import {OTRService} from "./OTRService";
import {CalendarDay} from "../Types/DayEnum";
import {RoomBookingEnum} from "../Types/RoomBookingEnum";
import {BookingLengthEnum} from "../Types/BookingLengthEnum";

@Service()
export class BookingService {
    public static MAX_BOOKINGS: number = 20;
    constructor(
        private otrService: OTRService
    ) {
    }

    public async makeBooking(id: string, password: string, date: CalendarDay, time: string, room: string, bookingType: RoomBookingEnum, code: string, name: string, length: BookingLengthEnum) {
        return await this.otrService.bookRoom(id, password, date, time, room, bookingType, code, name, length);
    }

    public async leaveBooking(id: string, password: string, date: CalendarDay, time: string, room: string, code: string) {
        return await this.otrService.leaveBooking(id, password, date, time, room, code);
    }

    public async getPreviousBookings(id: string, password: string) {
        return await this.otrService.getBookings(id, password);
    }

    public async getIncompleteBookings(day: CalendarDay) {
        return await this.otrService.getIncompleteBookings(day);
    }
}
