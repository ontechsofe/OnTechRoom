package ca.jame.ontechroom.Activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.PopupMenu;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import java.util.Locale;

import ca.jame.ontechroom.R;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.User;

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

//    void showNotification(String title, String message) {
//        NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
//        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
//            NotificationChannel channel = new NotificationChannel("generalnotifications", "General Notifications", NotificationManager.IMPORTANCE_HIGH);
//            channel.setDescription("General notifications from the app");
//            mNotificationManager.createNotificationChannel(channel);
//        }
//        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(getApplicationContext(), "generalnotifications")
//                .setSmallIcon(R.drawable.shield)
//                .setContentTitle(title)
//                .setContentText(message)
//                .setAutoCancel(true)
//                .setPriority(NotificationCompat.PRIORITY_HIGH);
//        Intent intent = new Intent(getApplicationContext(), MainActivity.class);
//        PendingIntent pi = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
//        mBuilder.setContentIntent(pi);
//        mNotificationManager.notify(0, mBuilder.build());
//    }

    public void doBookingActivity(View view) {
        Intent intent = new Intent(MainActivity.this, BookingActivity.class);
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
