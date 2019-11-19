package ca.jame.ontechroom;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        showNotification("Hello", "Thanks for opening the app");
    }

    void showNotification(String title, String message) {
        NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("generalnotifications", "General Notifications", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("General notifications from the app");
            mNotificationManager.createNotificationChannel(channel);
        }
        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(getApplicationContext(), "generalnotifications")
                .setSmallIcon(R.drawable.shield)
                .setContentTitle(title)
                .setContentText(message)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH);
        Intent intent = new Intent(getApplicationContext(), MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        mBuilder.setContentIntent(pi);
        mNotificationManager.notify(0, mBuilder.build());
    }

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
}
