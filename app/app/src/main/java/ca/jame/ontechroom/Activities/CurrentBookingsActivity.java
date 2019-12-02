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
import ca.jame.ontechroom.API.types.IncompleteBooking;
import ca.jame.ontechroom.Adapters.BookingCardAdapter;
import ca.jame.ontechroom.R;

public class CurrentBookingsActivity extends AppCompatActivity {

    private static final String TAG = "CurrentBookingsActivity";

    private ArrayList<IncompleteBooking> mBookings = new ArrayList<>();
    BookingCardAdapter adapter;

    Dialog dialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_current_bookings);
        dialog = new Dialog(CurrentBookingsActivity.this);
        new Thread(() -> {
            showDialog();
            initList();
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

    public void initList() {
        this.mBookings = OTR.getInstance().getIncompleteBookings();
    }

    private void initRecyclerView() {
        runOnUiThread(() -> {
            Log.d(TAG, "initRecyclerView: init recycler view");
            RecyclerView recyclerView = findViewById(R.id.bookingsCardRecycler);
            adapter = new BookingCardAdapter(this, mBookings);
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
