import {Body, Get, JsonController, Post} from 'routing-controllers';
import {CalendarDay} from "../Types/DayEnum";
import {BookingService} from "../Services/BookingService";
import {RoomBookingEnum} from "../Types/RoomBookingEnum";

class NewBookingBody {
    public id: string;
    public password: string;
    public date: CalendarDay;
    public time: string;
    public room: string;
    public bookingType: RoomBookingEnum;
    public code: string;
    public name: string;
}

class PreviousBookingBody {
    public id: string;
    public password: string;
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

    @Post('/get')
    public async getBookings(@Body() body: PreviousBookingBody) {
        return await this.bookingService.getPreviousBookings(body.id, body.password);
    }

    @Post('/new')
    public async makeBooking(@Body() body: NewBookingBody) {
        return this.bookingService.makeBooking(body.id, body.password, body.date, body.time, body.room, body.bookingType, body.code, body.name);
    }
}
