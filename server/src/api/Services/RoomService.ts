import {Service} from "typedi";
import {Room} from "../Types/Room";
import {OTRService} from "./OTRService";


@Service()
export class RoomService {

    constructor(
        private otrService: OTRService,
    ) {
    }

    public async find(): Promise<Array<Room>> {
        return await this.getRoomsFromMyCampus();
    }

    public async findOne(id: string): Promise<Room | undefined> {
        let rooms = await this.getRoomsFromMyCampus();
        return rooms.filter(e => e.name.toUpperCase() === id.toUpperCase())[0];
    }

    private async getRoomsFromMyCampus(): Promise<Array<Room>> {
        let roomData = await this.otrService.getRooms();
        return roomData.map(room => {
            let x = new Room();
            x.name = room.name;
            x.imageURL = room.imageURL;
            x.facilities = room.facilities;
            x.floor = room.floor;
            x.capacity = room.capacity;
            x.minRequired = room.minRequired;
            x.maxDuration = room.maxDuration;
            return x;
        });
    }
}
