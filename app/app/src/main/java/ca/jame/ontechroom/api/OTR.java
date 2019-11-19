package ca.jame.ontechroom.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.util.ArrayList;

import ca.jame.ontechroom.httpClient.HTTPClient;
import ca.jame.ontechroom.types.Room;

public class OTR {
    private static OTR instance = null;
    public static OTR getInstance() {
        if (instance == null) {
            instance = new OTR();
        }
        return instance;
    }

    private static final String BASE_URL = "http://10.0.2.2:3000"; // Loopback reference to localhost on root machine

    private OTR() {
    }

    public TestData getTest() {
        try {
            return new Gson().fromJson(HTTPClient.get(BASE_URL), TestData.class);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public ArrayList<Room> getRooms() {
        try {
            return new Gson().fromJson(HTTPClient.get(String.format("%s/rooms", BASE_URL)), new TypeToken<ArrayList<Room>>(){}.getType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
