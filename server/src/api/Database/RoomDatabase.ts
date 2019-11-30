import {Service} from "typedi";
import ddb from 'diskdb';
import {Room} from "../Types/Room";
import {env} from "../../env";

@Service()
export class RoomDatabase {
    private db: any;
    private TABLE_NAME: string = "rooms";
    constructor() {
        // on load of this class, we connect, delete the table, connect again, and add the new data
        this.db = ddb.connect(env.database.storagePath, [this.TABLE_NAME]);
    }

    public getAllRooms(): Array<Room> {
        return this.db[this.TABLE_NAME].find();
    }

    public getRoomById(id: string): Room {
        return this.db[this.TABLE_NAME].find({name: id});
    }

    public addNewRoom(room: Room) {
        this.db[this.TABLE_NAME].save(room);
    }

    public addNewRooms(room: Array<Room>) {
        this.db[this.TABLE_NAME].save(room);
    }

    public clearAllRooms() {
        this.db[this.TABLE_NAME].remove(); // clean and disconnect
        this.db = ddb.connect(env.database.storagePath, [this.TABLE_NAME]);
    }
}
