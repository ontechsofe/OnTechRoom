import {Get, JsonController, OnUndefined, Param} from 'routing-controllers';
import {RoomService} from "../Services/RoomService";
import {Room} from "../Types/Room";
import {ResponseSchema} from "routing-controllers-openapi";
import {RoomNotFoundError} from "../Errors/RoomNotFoundError";

@JsonController('/rooms')
export class RoomController {

    constructor(
        private roomService: RoomService
    ) {
    }

    @Get()
    @ResponseSchema(Room, { isArray: true })
    public getAllRooms(): Array<Room> {
        return this.roomService.find();
    }

    @Get('/:id')
    @OnUndefined(RoomNotFoundError)
    @ResponseSchema(Room)
    public getRoom(@Param('id') id: string): Room | undefined {
        return this.roomService.findOne(id);
    }
}
