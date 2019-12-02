package ca.jame.ontechroom.Adapters;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.ArrayList;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.db.user.BookingDB;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.Booking;
import ca.jame.ontechroom.API.types.LeaveBookingResponse;
import ca.jame.ontechroom.API.types.User;
import ca.jame.ontechroom.Activities.MainActivity;
import ca.jame.ontechroom.R;

public class UpcomingBookingsCardAdapter extends RecyclerView.Adapter<UpcomingBookingsCardAdapter.ViewHolder> {
    private static final String TAG = "UpcomingBookingsCardAdapter";
    private ArrayList<Booking> mBookings;
    private Context mContext;

    public UpcomingBookingsCardAdapter(Context mContext, ArrayList<Booking> mBookings) {
        this.mBookings = mBookings;
        this.mContext = mContext;
    }

    public void showNotification(Context context, String title, String message) {
        NotificationManager mNotificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("generalnotifications", "General Notifications", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("General notifications from the app");
            mNotificationManager.createNotificationChannel(channel);
        }
        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(context, "generalnotifications")
                .setSmallIcon(R.drawable.shield)
                .setContentTitle(title)
                .setContentText(message)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH);
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        mBuilder.setContentIntent(pi);
        mNotificationManager.notify(0, mBuilder.build());
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.upcoming_booking_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Log.d(TAG, "onBindViewHolder: called");
        holder.codeTxt.setText(mBookings.get(position).code);
        holder.roomTxt.setText(mBookings.get(position).room);
        holder.timeTxt.setText(String.join(", ", mBookings.get(position).time));
        holder.leaveBtn.setOnClickListener((View view) -> {
            UserDB userDB = new UserDB(mContext);
            User u = userDB.getUser();
            BookingDB bookingDB = new BookingDB(mContext);
            bookingDB.removeBooking(mBookings.get(position).code);
            new Thread(() -> {
                LeaveBookingResponse response = OTR.getInstance().leaveBooking(u.studentId, u.password, 0, mBookings.get(position).time, mBookings.get(position).room, mBookings.get(position).code);
                System.out.println(response);
            }).start();
        });

        holder.notifyBtn.setOnClickListener((View view) -> {
            this.showNotification(mContext, "Room Booking Starting Soon!", String.format("The room you booked: %s at %s is starting soon!", mBookings.get(position).room, mBookings.get(position).time));
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
        Button leaveBtn;
        Button notifyBtn;
        LinearLayout parentLayout;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            codeTxt = itemView.findViewById(R.id.upBookingCodeTxt);
            roomTxt = itemView.findViewById(R.id.upBookingRoomTxt);
            timeTxt = itemView.findViewById(R.id.upBookingTimeTxt);
            leaveBtn = itemView.findViewById(R.id.leaveBookingBtn);
            notifyBtn = itemView.findViewById(R.id.notifyBookingBtn);
            parentLayout = itemView.findViewById(R.id.parentLayout);
        }
    }
}
