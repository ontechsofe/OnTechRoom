package ca.jame.ontechroom.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.PopupMenu;
import android.widget.TextView;

import java.util.Locale;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.User;
import ca.jame.ontechroom.R;

public class MainActivity extends AppCompatActivity implements PopupMenu.OnMenuItemClickListener {

    TextView welcomeMessage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        welcomeMessage = findViewById(R.id.welcomeMessageTxt);

//        showNotification("Hello", "Thanks for opening the app");
        UserDB userDB = new UserDB(getApplicationContext());
        User u = userDB.getUser();
        welcomeMessage.setText(String.format(Locale.CANADA, "Welcome, %s!", u.firstName));
    }

    public void doBookingActivity(View view) {
        Intent intent = new Intent(MainActivity.this, JoinOrNewActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
    }

    public void doViewBookings(View view) {
        Intent intent = new Intent(MainActivity.this, ViewBookingsActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.slide_out_left, R.anim.slide_in_left);
    }

    public void showPopup(View v) {
        PopupMenu popup = new PopupMenu(MainActivity.this, v);
        popup.setOnMenuItemClickListener(MainActivity.this);
        popup.inflate(R.menu.menu_example);
        popup.show();
    }

    @Override
    public boolean onMenuItemClick(MenuItem item) {
        if (item.getItemId() == R.id.logout) {
            UserDB userDB = new UserDB(getApplicationContext());
            userDB.clean();
            Intent intent = new Intent(MainActivity.this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
            finish();
            return true;
        }
        return false;
    }
}
