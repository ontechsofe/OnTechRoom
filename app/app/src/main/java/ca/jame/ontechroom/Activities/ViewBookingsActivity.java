package ca.jame.ontechroom.Activities;

import android.app.Dialog;
import android.os.Bundle;
import android.util.Log;
import android.view.View;

import java.util.ArrayList;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.db.user.BookingDB;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.Booking;
import ca.jame.ontechroom.API.types.PastBooking;
import ca.jame.ontechroom.API.types.User;
import ca.jame.ontechroom.Adapters.PastBookingsCardAdapter;
import ca.jame.ontechroom.Adapters.UpcomingBookingsCardAdapter;
import ca.jame.ontechroom.R;

public class ViewBookingsActivity extends AppCompatActivity {
    private static final String TAG = "ViewBookingsActivity";
    private ArrayList<PastBooking> pastBookings = new ArrayList<>();
    private ArrayList<Booking> upcomingBookings = new ArrayList<>();
    PastBookingsCardAdapter pastBookingsCardAdapter;
    UpcomingBookingsCardAdapter upcomingBookingsCardAdapter;

    Dialog dialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_bookings);
        dialog = new Dialog(ViewBookingsActivity.this);
        showDialog();
        new Thread(() -> {
            initPastBookingList();
            initUpcomingBookingList();
            inigPastBookingRecycler();
            inigUpcomingBookingRecycler();
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

    public void initPastBookingList() {
        UserDB userDB = new UserDB(getApplicationContext());
        User u = userDB.getUser();
        this.pastBookings = OTR.getInstance().getBookings(u.studentId, u.password);
    }

    private void inigPastBookingRecycler() {
        runOnUiThread(() -> {
            Log.d(TAG, "inigPastBookingRecycler: init recycler view");
            RecyclerView recyclerView = findViewById(R.id.pastBookingsCardRecycler);
            pastBookingsCardAdapter = new PastBookingsCardAdapter(this, pastBookings);
            Log.d(TAG, "inigPastBookingRecycler: " + pastBookingsCardAdapter);
            recyclerView.setAdapter(pastBookingsCardAdapter);
            recyclerView.setLayoutManager(new LinearLayoutManager(this));
        });
    }

    public void initUpcomingBookingList() {
        BookingDB userDB = new BookingDB(getApplicationContext());
        this.upcomingBookings = userDB.getAllBookings();
    }

    private void inigUpcomingBookingRecycler() {
        runOnUiThread(() -> {
            Log.d(TAG, "inigUpcomingBookingRecycler: init recycler view");
            RecyclerView recyclerView = findViewById(R.id.upcomingBookingsCardRecycler);
            upcomingBookingsCardAdapter = new UpcomingBookingsCardAdapter(this, upcomingBookings);
            Log.d(TAG, "inigUpcomingBookingRecycler: " + upcomingBookingsCardAdapter);
            recyclerView.setAdapter(upcomingBookingsCardAdapter);
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
