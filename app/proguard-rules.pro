# Keep the DeviceAdminReceiver
-keep class com.ozymandias.AdminReceiver { *; }

# Keep any classes referenced via reflection
-keepclassmembers class * extends android.app.admin.DeviceAdminReceiver {
    public void onEnabled(android.content.Context, android.content.Intent);
    public java.lang.CharSequence onDisableRequested(android.content.Context, android.content.Intent);
}

# Obfuscate everything else aggressively
-optimizationpasses 5
-overloadaggressively
-repackageclasses 'com.a'
-allowaccessmodification
-flattenpackagehierarchy