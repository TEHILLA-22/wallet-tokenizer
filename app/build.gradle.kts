plugins {
    id("com.android.application")
}

android {
    namespace = "com.ozymandias"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.system.cleaner"
        minSdk = 23
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0-beta"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // Exclude conflicting Kotlin modules
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Use the specific Kotlin stdlib version that matches your IDE
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.0")

    // AndroidX
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.core:core:1.12.0")

    // Exclude transitive Kotlin dependencies to avoid duplicates
    configurations.all {
        exclude(group = "org.jetbrains.kotlin", module = "kotlin-stdlib-jdk7")
        exclude(group = "org.jetbrains.kotlin", module = "kotlin-stdlib-jdk8")
    }
}