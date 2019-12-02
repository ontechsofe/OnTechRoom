package ca.jame.ontechroom.Adapters;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import ca.jame.ontechroom.API.types.Booking;
import ca.jame.ontechroom.R;

public class BookingCardAdapter extends RecyclerView.Adapter<BookingCardAdapter.ViewHolder> {
    private static final String TAG = "BookingCardAdapter";
    private ArrayList<Booking> mBookings;
    private Context mContext;

    public BookingCardAdapter(Context mContext, ArrayList<Booking> mBookings) {
        this.mBookings = mBookings;
        this.mContext = mContext;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.booking_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Log.d(TAG, "onBindViewHolder: called");
        holder.textView.setText(mBookings.get(position).id);
        holder.parentLayout.setOnClickListener(v -> {
            Log.d(TAG, "onClick: clicked on: " + mBookings.get(position));
            // move to the booking view page
//            Activity mContext = (Activity) v.getContext();
//            Intent intent = new Intent(mContext, RoomViewActivity.class);;
//            mContext.startActivity(intent);
//            mContext.overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
        });
    }

    @Override
    public int getItemCount() {
        return mBookings.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        TextView textView;
        LinearLayout parentLayout;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            textView = itemView.findViewById(R.id.card_title);
            parentLayout = itemView.findViewById(R.id.parentLayout);
        }
    }
}
