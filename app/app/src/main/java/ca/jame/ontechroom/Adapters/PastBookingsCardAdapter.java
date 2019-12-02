package ca.jame.ontechroom.Adapters;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.API.types.PastBooking;
import ca.jame.ontechroom.R;

public class PastBookingsCardAdapter extends RecyclerView.Adapter<PastBookingsCardAdapter.ViewHolder> {
    private static final String TAG = "PastBookingsCardAdapter";
    private ArrayList<PastBooking> mBookings;
    private Context mContext;

    public PastBookingsCardAdapter(Context mContext, ArrayList<PastBooking> mBookings) {
        this.mBookings = mBookings;
        this.mContext = mContext;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.past_booking_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Log.d(TAG, "onBindViewHolder: called");
        holder.textView.setText(String.format("%s %s %s", mBookings.get(position).room, mBookings.get(position).date, mBookings.get(position).time));
        holder.parentLayout.setOnClickListener(v -> {
            // No click action here because its just a list
            Log.d(TAG, "onClick: clicked on: " + mBookings.get(position));
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
