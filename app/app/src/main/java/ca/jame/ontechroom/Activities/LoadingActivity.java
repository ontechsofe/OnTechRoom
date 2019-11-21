package ca.jame.ontechroom.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;

import ca.jame.ontechroom.API.OnTechRoom.OnTechRoom;
import ca.jame.ontechroom.R;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.Room;

public class LoadingActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_loading);
        this.goFullscreen();
    }

    @Override
    protected void onResume() {
        super.onResume();
        this.goFullscreen();
    }

    @Override
    protected void onStart() {
        super.onStart();
        this.goFullscreen();
    }

    private void goFullscreen() {
        View mContentView = findViewById(R.id.fullscreenContent);
        mContentView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LOW_PROFILE
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        new Thread(() -> {
            try {
                Thread.sleep(1000);
                OnTechRoom x = OnTechRoom.getInstance();
                ArrayList<Room> rooms = OTR.getInstance().getRooms();
                System.out.println(rooms);
                x.setRooms(rooms);
                UserDB userDB = new UserDB(getApplicationContext());
                boolean loggedIn = userDB.userCount() > 0;
                if (loggedIn) {
                    Intent intent = new Intent(LoadingActivity.this, MainActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                    finish();
                } else {
                    Intent intent = new Intent(LoadingActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                    finish();
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
