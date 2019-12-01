package ca.jame.ontechroom.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.R;

public class JoinOrNewActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_join_or_new);
    }

    public void goBack(View view) {
        finish();
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_right);
    }

    public void doNewBooking(View view) {
        Intent intent = new Intent(JoinOrNewActivity.this, TodayOrTomorrowActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
    }

    public void doJoinBookings(View view) {
        Intent intent = new Intent(JoinOrNewActivity.this, TodayOrTomorrowActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
    }
}
