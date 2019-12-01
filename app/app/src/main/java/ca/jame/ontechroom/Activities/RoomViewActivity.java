package ca.jame.ontechroom.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.google.android.material.snackbar.Snackbar;

import java.util.Locale;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.API.types.Room;
import ca.jame.ontechroom.R;

public class RoomViewActivity extends AppCompatActivity {

    TextView roomName;
    TextView floorNumber;
    TextView maximumCapacity;
    TextView bookingMinimum;
    TextView maximumDuration;
    TextView roomFacilities;
    ImageView roomImage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_room_view);
        Intent intent = getIntent();

        roomName = findViewById(R.id.roomNameTxt);
        floorNumber = findViewById(R.id.floorNumberTxt);
        maximumCapacity = findViewById(R.id.maximumCapacityTxt);
        bookingMinimum = findViewById(R.id.bookingMinimumTxt);
        maximumDuration = findViewById(R.id.maximumDurationTxt);
        roomFacilities = findViewById(R.id.roomFacilitiesTxt);
        roomImage = findViewById(R.id.roomImage);

        Room r = (Room) intent.getSerializableExtra("room-data");
        roomName.setText(r.name);
        floorNumber.setText(String.format(Locale.CANADA, "Located on floor %d", r.floor));
        maximumCapacity.setText(String.format(Locale.CANADA, "%d people", r.capacity));
        bookingMinimum.setText(String.format(Locale.CANADA, "%d people", r.minRequired));
        maximumDuration.setText(String.format(Locale.CANADA, "%d hrs", r.maxDuration));

        StringBuilder sb = new StringBuilder();
        for (String s : r.facilities) {
            sb.append("- ");
            sb.append(s);
            sb.append("\n");
        }
        roomFacilities.setText(sb.toString());
        Glide.with(this).load(r.imageURL).into(roomImage);

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

    public void snackTime(View view) {
        Snackbar.make(view, R.string.app_name, Snackbar.LENGTH_SHORT).setAction("UH OH", v -> {
            System.out.println("CLICKED");
        }).show();
    }
}
