package ca.jame.ontechroom;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.bumptech.glide.Glide;

import java.io.Serializable;
import java.util.ArrayList;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import ca.jame.ontechroom.types.Room;

public class RoomCardAdapter extends RecyclerView.Adapter<RoomCardAdapter.ViewHolder> {
    private static final String TAG = "RoomCardAdapter";
    ArrayList<Room> mRooms;
    private Context mContext;

    RoomCardAdapter(Context mContext, ArrayList<Room> mRooms) {
        this.mRooms = mRooms;
        this.mContext = mContext;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.room_card, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Log.d(TAG, "onBindViewHolder: called");
        holder.textView.setText(mRooms.get(position).name);
        holder.parentLayout.setOnClickListener(v -> {
            Log.d(TAG, "onClick: clicked on: " + mRooms.get(position));
            Activity mContext = (Activity) v.getContext();
            Intent intent = new Intent(mContext, RoomViewActivity.class);
            intent.putExtra("room-data", OnTechRoom.getInstance().getRoom(mRooms.get(position).name));
            mContext.startActivity(intent);
            mContext.overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
        });
    }

    @Override
    public int getItemCount() {
        return mRooms.size();
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
