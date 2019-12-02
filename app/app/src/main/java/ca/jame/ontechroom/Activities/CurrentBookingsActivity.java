package ca.jame.ontechroom.Activities;

import android.os.Bundle;
import android.util.Log;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import ca.jame.ontechroom.API.OnTechRoom.OnTechRoom;
import ca.jame.ontechroom.API.types.Booking;
import ca.jame.ontechroom.Adapters.BookingCardAdapter;
import ca.jame.ontechroom.R;

public class CurrentBookingsActivity extends AppCompatActivity {

    private static final String TAG = "CurrentBookingsActivity";

    private ArrayList<Booking> mBookings = new ArrayList<>();
    BookingCardAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_current_bookings);
        initList();
        initRecyclerView();
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

    public void initList() {
        this.mBookings = OnTechRoom.getInstance().getIncompleteBookings();
    }

    private void initRecyclerView() {
        Log.d(TAG, "initRecyclerView: init recycler view");
        RecyclerView recyclerView = findViewById(R.id.roomCardRecycler);
        adapter = new BookingCardAdapter(this, mBookings);
        logd
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
    }
}
