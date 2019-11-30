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
    @ResponseSchema(Room, {isArray: true})
    public async getAllRooms(): Promise<Array<Room>> {
        return await this.roomService.find();
    }

    @Get('/:id')
    @OnUndefined(RoomNotFoundError)
    @ResponseSchema(Room)
    public async getRoom(@Param('id') id: string): Promise<Room | undefined> {
        return await this.roomService.findOne(id);
    }
}
