package ca.jame.ontechroom.Activities;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.BookingResponse;
import ca.jame.ontechroom.API.types.User;
import ca.jame.ontechroom.R;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

public class DoBookingActivity extends AppCompatActivity {

    private int day;
    private String time;
    private int length;
    private int peopleCount;
    private String room;

    EditText bookingCodeTxt;
    EditText bookingNameTxt;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_do_booking);
        Intent intent = getIntent();
        this.day = intent.getIntExtra("day", 0);
        this.time = intent.getStringExtra("time");
        this.length = intent.getIntExtra("length", 0);
        this.peopleCount = intent.getIntExtra("peopleCount", 0);
        this.room = intent.getStringExtra("room");
        bookingCodeTxt = findViewById(R.id.bookingCodeTxt);
        bookingNameTxt = findViewById(R.id.bookingNameTxt);
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_right);
    }

    public void goBack(View view) {
        finish();
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_right);
    }

    public void bookTheRoom(View view) {
        new Thread(() -> {
            UserDB userDB = new UserDB(getApplicationContext());
            User user = userDB.getUser();
            BookingResponse response = OTR.getInstance().newBooking(user.studentId, user.password, day, time, room, bookingCodeTxt.getText().toString(), bookingNameTxt.getText().toString(), length);
            System.out.println(response);
            runOnUiThread(() -> {
                Intent intent = new Intent(DoBookingActivity.this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
            });
        }).start();
    }
}
