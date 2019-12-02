import {Body, Get, JsonController, Post} from 'routing-controllers';
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

    @Post('/past')
    public async getBookings(@Body() body: PreviousBookingBody) {
        return await this.bookingService.getPreviousBookings(body.id, body.password);
    }

    @Post('/new')
    public async makeBooking(@Body() body: NewBookingBody) {
        return this.bookingService.makeBooking(body.id, body.password, body.date, body.time, body.room, body.bookingType, body.code, body.name, body.length);
    }

    @Post('/leave')
    public async leaveBooking(@Body() body: LeaveBookingBody) {
        return this.bookingService.leaveBooking(body.id, body.password, body.date, body.time, body.room);
    }
}
