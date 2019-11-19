package ca.jame.ontechroom.db.user;

import android.content.ContentValues;
import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.Locale;

import ca.jame.ontechroom.types.User;

public class UserDB extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "UserDB";
    private static final String TABLE_NAME = "USER";
    private static final String COL_ID = "id";
    private static final String COL_UUID = "uuid";
    private static final String COL_FIRST_NAME = "firstName";
    private static final String COL_LAST_NAME = "lastName";
    private static final String COL_STUDENT_ID = "studentId";
    private static final String COL_PASSWORD = "password";

    public UserDB(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase sqLiteDatabase) {
        String CREATE_USERS_TABLE = String.format( Locale.CANADA,
                "CREATE TABLE %s(%s INTEGER PRIMARY KEY, %s TEXT, %s TEXT, %s TEXT, %s TEXT, %s TEXT)",
                TABLE_NAME,
                COL_ID,
                COL_UUID,
                COL_FIRST_NAME,
                COL_LAST_NAME,
                COL_STUDENT_ID,
                COL_PASSWORD
        );
        sqLiteDatabase.execSQL(CREATE_USERS_TABLE);
    }

    @Override
    public void onUpgrade(SQLiteDatabase sqLiteDatabase, int i, int i1) {
        // do nothing
    }

    public void addUserData(User user) {
        SQLiteDatabase db = this.getReadableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_UUID, user.uuid);
        values.put(COL_FIRST_NAME, user.firstName);
        values.put(COL_LAST_NAME, user.lastName);
        values.put(COL_STUDENT_ID, user.studentId);
        values.put(COL_PASSWORD, user.password);
        db.execSQL("DELETE FROM " + TABLE_NAME);
        db.insert(TABLE_NAME, null, values);
        db.close();
    }
}
