package ca.jame.ontechroom;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.types.Room;

import android.os.Bundle;
import android.util.Log;
import android.view.View;

import java.util.ArrayList;
import java.util.Locale;

public class BookingActivity extends AppCompatActivity {

    private static final String TAG = "BookingActivity";

    private ArrayList<Room> mRooms = new ArrayList<>();
    RoomCardAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking);
        initList();
        initRecyclerView();
    }

    public void goBack(View view) {
        finish();
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_right);
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_right);
    }

    public void initList() {
        this.mRooms = OnTechRoom.getInstance().getRooms();
    }

    private void initRecyclerView() {
        Log.d(TAG, "initRecyclerView: init recycler view");
        RecyclerView recyclerView = findViewById(R.id.roomCardRecycler);
        adapter = new RoomCardAdapter(this, mRooms);
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
    }
}
