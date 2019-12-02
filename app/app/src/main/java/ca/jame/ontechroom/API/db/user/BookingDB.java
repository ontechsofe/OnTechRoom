package ca.jame.ontechroom.API.db.user;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.Locale;

import ca.jame.ontechroom.API.types.Booking;

public class BookingDB extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "BookingDB";
    private static final String TABLE_NAME = "BOOKINGS";
    private static final String COL_ID = "id";
    private static final String COL_DAY = "day";
    private static final String COL_TIME = "time";
    private static final String COL_ROOM = "room";
    private static final String COL_CODE = "code";
    private static final String COL_NAME = "name";
    private static final String COL_LENGTH = "length";

    public BookingDB(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase sqLiteDatabase) {
        String CREATE_USERS_TABLE = String.format(Locale.CANADA,
                "CREATE TABLE %s(%s INTEGER PRIMARY KEY, %s INTEGER, %s TEXT, %s TEXT, %s TEXT, %s TEXT, %s INTEGER)",
                TABLE_NAME,
                COL_ID,
                COL_DAY,
                COL_TIME,
                COL_ROOM,
                COL_CODE,
                COL_NAME,
                COL_LENGTH
        );
        sqLiteDatabase.execSQL(CREATE_USERS_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase sqLiteDatabase, int i, int i1) {
        // do nothing
    }

    public void addNewBooking(Booking booking) {
        SQLiteDatabase db = this.getReadableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_DAY, booking.day);
        values.put(COL_TIME, booking.time);
        values.put(COL_ROOM, booking.room);
        values.put(COL_CODE, booking.code);
        values.put(COL_NAME, booking.name);
        values.put(COL_LENGTH, booking.length);
        db.insert(TABLE_NAME, null, values);
        db.close();
    }

    public void removeBooking(String code) {
        SQLiteDatabase db = this.getReadableDatabase();
        db.execSQL(String.format("DELETE FROM %s WHERE %s='%s'", TABLE_NAME, COL_CODE, code));
        db.close();
    }

    public ArrayList<Booking> getAllBookings() {
        ArrayList<Booking> bookingList = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c = db.rawQuery("SELECT * FROM " + TABLE_NAME, null);
        c.moveToFirst();
        while (!(c.isAfterLast())) {
            Booking booking = new Booking();
            booking.day = c.getInt(c.getColumnIndex(COL_DAY));
            booking.time = c.getString(c.getColumnIndex(COL_TIME));
            booking.room = c.getString(c.getColumnIndex(COL_ROOM));
            booking.code = c.getString(c.getColumnIndex(COL_CODE));
            booking.name = c.getString(c.getColumnIndex(COL_NAME));
            booking.length = c.getInt(c.getColumnIndex(COL_LENGTH));
            bookingList.add(booking);
            c.moveToNext();
        }
        c.close();
        db.close();
        return bookingList;
    }
}
