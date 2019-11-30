import {Body, Get, JsonController, Post} from 'routing-controllers';


@JsonController('/booking')
export class BookingController {

    constructor() {
    }

    @Get()
    public getBookings() {
        return [];
    }

    @Post('/new')
    public makeBooking(@Body() body): void {

    }
}
