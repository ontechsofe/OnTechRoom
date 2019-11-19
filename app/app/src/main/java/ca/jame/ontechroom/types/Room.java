package ca.jame.ontechroom.types;

import java.io.Serializable;
import java.util.ArrayList;

public class Room implements Serializable {
    public String name;
    public String imageURL;
    public ArrayList<String> facilities;
    public int floor;
    public int capacity;
    public int minRequired;
    public int maxDuration;
    public String _id;
}
