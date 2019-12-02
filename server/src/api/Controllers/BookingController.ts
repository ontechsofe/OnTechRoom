import {Body, Get, JsonController, Param, Post} from 'routing-controllers';
import {CalendarDay} from "../Types/DayEnum";
import {BookingService} from "../Services/BookingService";
import {RoomBookingEnum} from "../Types/RoomBookingEnum";
import {BookingLengthEnum} from "../Types/BookingLengthEnum";

class NewBookingBody {
    public id: string;
    public password: string;
    public date: CalendarDay;
    public time: string;
    public room: string;
    public bookingType: RoomBookingEnum;
    public code: string;
    public name: string;
    public length: BookingLengthEnum;
}

class PreviousBookingBody {
    public id: string;
    public password: string;
}

class LeaveBookingBody {
    public id: string;
    public password: string;
    public date: CalendarDay;
    public time: string;
    public room: string;
    public code: string;
}

@JsonController('/booking')
export class BookingController {

    constructor(
        private bookingService: BookingService
    ) {
    }

    @Get('/max')
    public async getMaxBookings() {
        return {maxBookings: BookingService.MAX_BOOKINGS};
    }

    @Get('/incomplete/:day')
    public async getIncompleteBookings(@Param('day') day: CalendarDay) {
        return await this.bookingService.getIncompleteBookings(day);
    }

    @Post('/past')
    public async getBookings(@Body() body: PreviousBookingBody) {
        return await this.bookingService.getPreviousBookings(body.id, body.password);
    }

    @Post('/new')
    public async makeBooking(@Body() body: NewBookingBody) {
        let date = (typeof body.date === "string" ? parseInt(body.date) : body.date);
        let bookingType = (typeof body.bookingType === "string" ? parseInt(body.bookingType) : body.bookingType);
        let length = (typeof body.length === "string" ? parseInt(body.length) : body.length);
        return this.bookingService.makeBooking(body.id, body.password, date, body.time, body.room, bookingType, body.code, body.name, length);
    }

    @Post('/leave')
    public async leaveBooking(@Body() body: LeaveBookingBody) {
        let date = (typeof body.date === "string" ? parseInt(body.date) : body.date);
        return this.bookingService.leaveBooking(body.id, body.password, date, body.time, body.room, body.code);
    }
}
