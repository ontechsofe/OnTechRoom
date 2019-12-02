package ca.jame.ontechroom.Activities;

import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Spinner;

import java.util.Calendar;
import java.util.Locale;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.R;

public class NewBookingActivity extends AppCompatActivity {
    private static final String TAG = "NewBookingActivity";

    Spinner dateSpinner;
    Spinner lengthSpinner;
    Spinner peopleSpinner;
    EditText timeTxt;
    TimePickerDialog timePickerDialog;
    Calendar cal;
    int hour;
    int minute;
    String amPm;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_new_booking);
        dateSpinner = findViewById(R.id.dateSpinner);
        lengthSpinner = findViewById(R.id.lengthSpinner);
        peopleSpinner = findViewById(R.id.peopleSpinner);
        timeTxt = findViewById(R.id.timeTxt);
        timeTxt.setOnClickListener(view -> {
            cal = Calendar.getInstance();
            hour = cal.get(Calendar.HOUR_OF_DAY);
            minute = cal.get(Calendar.MINUTE);
            timePickerDialog = new TimePickerDialog(NewBookingActivity.this, (timePicker, hourOfDay, minutes) -> {
                if (hourOfDay >= 12) {
                    amPm = "PM";
                } else {
                    amPm = "AM";
                }
                hourOfDay = hourOfDay % 12;
                Log.d(TAG, "doPickTime: " + String.format("%02d:%02d", hourOfDay, minutes) + amPm);
                timeTxt.setText(String.format(Locale.CANADA, "%02d:%02d %s", hourOfDay, minutes, amPm));
            }, hour, minute, false);
            timePickerDialog.show();
        });
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

    public void doSearch(View view) {
        Intent intent = new Intent(NewBookingActivity.this, RoomBookingSearchActivity.class);
        intent.putExtra("day", dateSpinner.getSelectedItemPosition());
        intent.putExtra("time", timeTxt.getText().toString());
        intent.putExtra("length", lengthSpinner.getSelectedItemPosition());
        intent.putExtra("peopleCount", peopleSpinner.getSelectedItemPosition() + 1);
        startActivity(intent);
        overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
    }
}
