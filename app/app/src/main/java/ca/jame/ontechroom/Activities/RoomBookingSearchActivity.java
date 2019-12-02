package ca.jame.ontechroom.Activities;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;

import java.util.ArrayList;
import java.util.stream.Collectors;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.types.Room;
import ca.jame.ontechroom.Adapters.AvailableRoomAdapter;
import ca.jame.ontechroom.R;

public class RoomBookingSearchActivity extends AppCompatActivity {
    private static final String TAG = "RoomBookingSearchActivi";
    private ArrayList<Room> availableRooms = new ArrayList<>();
    AvailableRoomAdapter adapter;

    Dialog dialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_room_booking_search);
        Intent i = getIntent();
        int day = i.getIntExtra("day", 0);
        String time = i.getStringExtra("time");
        int length = i.getIntExtra("length", 0);
        int peopleCount = i.getIntExtra("peopleCount", 1);
        dialog = new Dialog(RoomBookingSearchActivity.this);
        new Thread(() -> {
            showDialog();
            // do the actual search in initList
            initList(day, time, length, peopleCount);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            initRecyclerView();
            hideDialog();
        }).start();
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

    public void initList(int day, String time, int length, int peopleCount) {
        ArrayList<String> rs = OTR.getInstance().searchForRoom(day, time, length, peopleCount).goodRooms;
        this.availableRooms = (ArrayList<Room>) rs
                .stream()
                .map((String e) -> OTR.getInstance().getRoomById(e))
                .collect(Collectors.toList());
    }

    private void initRecyclerView() {
        runOnUiThread(() -> {
            Log.d(TAG, "initRecyclerView: init recycler view");
            RecyclerView recyclerView = findViewById(R.id.availableRoomRecycler);
            adapter = new AvailableRoomAdapter(this, availableRooms);
            Log.d(TAG, "initRecyclerView: " + adapter);
            recyclerView.setAdapter(adapter);
            recyclerView.setLayoutManager(new LinearLayoutManager(this));
        });
    }

    private void showDialog() {
        runOnUiThread(() -> {
            dialog.setContentView(R.layout.dialog_loading);
            dialog.setCancelable(false);
            dialog.setCanceledOnTouchOutside(false);
            dialog.show();
        });
    }

    private void hideDialog() {
        runOnUiThread(() -> dialog.dismiss());
    }
}
