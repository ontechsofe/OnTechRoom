package ca.jame.ontechroom.Adapters;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.BookingResponse;
import ca.jame.ontechroom.API.types.IncompleteBooking;
import ca.jame.ontechroom.API.types.User;
import ca.jame.ontechroom.R;

public class BookingCardAdapter extends RecyclerView.Adapter<BookingCardAdapter.ViewHolder> {
    private static final String TAG = "BookingCardAdapter";
    private ArrayList<IncompleteBooking> mBookings;
    private Context mContext;

    public BookingCardAdapter(Context mContext, ArrayList<IncompleteBooking> mBookings) {
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
        holder.codeTxt.setText(mBookings.get(position).code);
        holder.roomTxt.setText(mBookings.get(position).room);
        holder.timeTxt.setText(String.join(", ", mBookings.get(position).time));
        holder.joinBtn.setOnClickListener((View view) -> {
            UserDB userDB = new UserDB(mContext);
            User u = userDB.getUser();
            new Thread(() -> {
                BookingResponse response = OTR.getInstance().joinBooking(u.studentId, u.password, mBookings.get(position).time.get(0), mBookings.get(position).room, mBookings.get(position).code);
                System.out.println(response);
            }).start();
        });
    }

    @Override
    public int getItemCount() {
        return mBookings.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        TextView codeTxt;
        TextView roomTxt;
        TextView timeTxt;
        Button joinBtn;
        LinearLayout parentLayout;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            codeTxt = itemView.findViewById(R.id.bookingCodeTxt);
            roomTxt = itemView.findViewById(R.id.bookingRoomTxt);
            timeTxt = itemView.findViewById(R.id.bookingTimeTxt);
            joinBtn = itemView.findViewById(R.id.joinBookingBtn);
            parentLayout = itemView.findViewById(R.id.parentLayout);
        }
    }
}
