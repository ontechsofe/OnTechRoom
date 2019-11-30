import {Service} from "typedi";
import {Room} from "../Types/Room";
import {RoomDatabase} from "../Database/RoomDatabase";
import {OTRService} from "./OTRService";


@Service()
export class RoomService {

    constructor(
        private otrService: OTRService,
        private roomDatabase: RoomDatabase
    ) {
        this.updateRooms().then();
    }

    public find(): Array<Room> {
        return this.roomDatabase.getAllRooms();
    }

    public findOne(id: string): Room | undefined {
        return this.roomDatabase.getRoomById(id);
    }

    public newRoom(room: Room): void {
        this.roomDatabase.addNewRoom(room);
    }

    public async updateRooms(): Promise<void> {
        this.roomDatabase.clearAllRooms();
        let rooms = await this.getRoomsFromMyCampus();
        this.roomDatabase.addNewRooms(rooms);
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
