package ca.jame.ontechroom.API.OnTechRoom;

import java.util.ArrayList;

import ca.jame.ontechroom.API.types.Room;

public class OnTechRoom {
    private static OnTechRoom instance = null;

    public static OnTechRoom getInstance() {
        if (instance == null) {
            instance = new OnTechRoom();
        }
        return instance;
    }

    private ArrayList<Room> rooms;

    private OnTechRoom() {
        rooms = new ArrayList<>();
    }

    public ArrayList<Room> getRooms() {
        return rooms;
    }

    public Room getRoom(String name) {
        for (int i = 0; i < rooms.size(); i++) {
            if (rooms.get(i).name == name) {
                return rooms.get(i);
            }
        }
        return null;
    }

    public void setRooms(ArrayList<Room> rooms) {
        this.rooms = rooms;
    }
}
