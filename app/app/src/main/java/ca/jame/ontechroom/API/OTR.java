package ca.jame.ontechroom.API;

import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import ca.jame.ontechroom.API.httpClient.HTTPClient;
import ca.jame.ontechroom.API.types.AvailableRoom;
import ca.jame.ontechroom.API.types.Booking;
import ca.jame.ontechroom.API.types.CalendarSearchResult;
import ca.jame.ontechroom.API.types.PastBooking;
import ca.jame.ontechroom.API.types.Room;

public class OTR {
    private static final String TAG = "OTR";
    private static OTR instance = null;

    public static OTR getInstance() {
        if (instance == null) {
            instance = new OTR();
        }
        return instance;
    }

    private static final String BASE_URL = "http://10.0.2.2:12345/api"; // Loopback reference to localhost on root machine
//    private static final String BASE_URL = "http://api.otr.ontechsofe.tk/api";

    private OTR() {
    }

    public ArrayList<Room> getRooms() {
        try {
            return new Gson().fromJson(HTTPClient.get(String.format("%s/rooms", BASE_URL)), new TypeToken<ArrayList<Room>>() {
            }.getType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Map<String, String> authenticate(String id, String password) {
        try {
            HashMap<String, String> payload = new HashMap<>();
            payload.put("id", id);
            payload.put("password", password);
            return new Gson().fromJson(HTTPClient.post(String.format("%s/auth/login", BASE_URL), payload), new TypeToken<Map<String, Object>>() {
            }.getType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public CalendarSearchResult searchForRoom(int day, String time, int length, int peopleCount) {
        try {
            Log.d(TAG, "searchForRoom: " + time);
            HashMap<String, String> payload = new HashMap<>();
            payload.put("day", Integer.toString(day));
            payload.put("time", time);
            payload.put("length", Integer.toString(length));
            payload.put("peopleCount", Integer.toString(peopleCount));
            return new Gson().fromJson(HTTPClient.post(String.format("%s/calendar/search", BASE_URL), payload), new TypeToken<CalendarSearchResult>() {
            }.getType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public ArrayList<PastBooking> getBookings(String id, String password) {
        try {
            HashMap<String, String> payload = new HashMap<>();
            payload.put("id", id);
            payload.put("password", password);
            return new Gson().fromJson(HTTPClient.post(String.format("%s/booking/past", BASE_URL), payload), new TypeToken<ArrayList<PastBooking>>() {
            }.getType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Room getRoomById(String roomName) {
        try {
            return new Gson().fromJson(HTTPClient.get(String.format("%s/rooms/%s", BASE_URL, roomName)), new TypeToken<Room>() {
            }.getType());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
