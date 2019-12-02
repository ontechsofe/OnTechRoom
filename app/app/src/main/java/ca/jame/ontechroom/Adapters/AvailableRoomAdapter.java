package ca.jame.ontechroom.Adapters;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.API.OnTechRoom.OnTechRoom;
import ca.jame.ontechroom.API.types.Room;
import ca.jame.ontechroom.Activities.RoomViewActivity;
import ca.jame.ontechroom.R;

public class AvailableRoomAdapter extends RecyclerView.Adapter<AvailableRoomAdapter.ViewHolder> {
    private static final String TAG = "AvailableRoomAdapter";
    private ArrayList<Room> availableRooms;
    private Context mContext;

    public AvailableRoomAdapter(Context mContext, ArrayList<Room> availableRooms) {
        this.availableRooms = availableRooms;
        this.mContext = mContext;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.available_room_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Log.d(TAG, "onBindViewHolder: called");
        holder.roomName.setText(availableRooms.get(position).name);
        holder.roomFacilities.setText(String.join(", ", availableRooms.get(position).facilities));
        Glide.with(holder.refView).load(availableRooms.get(position).imageURL).into(holder.roomImage);
        holder.parentLayout.setOnClickListener(v -> {
            Log.d(TAG, "onClick: clicked on: " + availableRooms.get(position));
        });
        holder.moreInfo.setOnClickListener((View view) -> {
            Intent intent = new Intent(mContext, RoomViewActivity.class);
            intent.putExtra("room-data", availableRooms.get(position));
            mContext.startActivity(intent);
            ((Activity) mContext).overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
        });
        holder.bookTheRoom.setOnClickListener((View view) -> {

        });
    }

    @Override
    public int getItemCount() {
        return availableRooms.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        TextView roomName;
        TextView roomFacilities;
        ImageView roomImage;
        LinearLayout parentLayout;
        View refView;
        Button moreInfo;
        Button bookTheRoom;

        ViewHolder(@NonNull View itemView) {
            super(itemView);
            refView = itemView;
            roomName = itemView.findViewById(R.id.availableRoomName);
            roomFacilities = itemView.findViewById(R.id.availableRoomFacilities);
            roomImage = itemView.findViewById(R.id.availableRoomImg);
            moreInfo = itemView.findViewById(R.id.moreInfoBtn);
            bookTheRoom = itemView.findViewById(R.id.bookTheRoomBtn);
            parentLayout = itemView.findViewById(R.id.parentLayout);
        }
    }
}
