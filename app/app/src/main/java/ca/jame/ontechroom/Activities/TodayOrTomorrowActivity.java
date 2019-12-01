package ca.jame.ontechroom.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.R;

public class TodayOrTomorrowActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_today_or_tomorrow);
    }

    public void goBack(View view) {
        finish();
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_right);
    }

    public void doBookTomorrow(View view) {
        Intent intent = new Intent(TodayOrTomorrowActivity.this, ViewBookingsActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
    }

    public void doBookToday(View view) {
        Intent intent = new Intent(TodayOrTomorrowActivity.this, ViewBookingsActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
    }
}
