import java.util.Properties

plugins {
    id("com.android.application")
}

// Release values live in keystore.properties next to this project (never committed):
//   storeFile, storePassword, keyAlias, keyPassword       upload key for Play
//   admobAppId, admobRewardedId, admobInterstitialId      the real AdMob ids
// Debug builds always use Google's public test ids, so no real ads are ever requested while testing.
val local = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
val testAppId = "ca-app-pub-3940256099942544~3347511713"
val testRewardedId = "ca-app-pub-3940256099942544/5224354917"
val testInterstitialId = "ca-app-pub-3940256099942544/1033173712"

android {
    namespace = "com.worksbien.barbersimulatorasmr"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.worksbien.barbersimulatorasmr"
        minSdk = 26
        targetSdk = 36
        versionCode = 6
        versionName = "1.0.5"
    }

    signingConfigs {
        if (local.getProperty("storeFile") != null) {
            create("upload") {
                storeFile = rootProject.file(local.getProperty("storeFile"))
                storePassword = local.getProperty("storePassword")
                keyAlias = local.getProperty("keyAlias")
                keyPassword = local.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug" // installs beside the Play version
            manifestPlaceholders["admobAppId"] = testAppId
            buildConfigField("String", "ADMOB_REWARDED_ID", "\"$testRewardedId\"")
            buildConfigField("String", "ADMOB_INTERSTITIAL_ID", "\"$testInterstitialId\"")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            manifestPlaceholders["admobAppId"] = local.getProperty("admobAppId", testAppId)
            buildConfigField("String", "ADMOB_REWARDED_ID", "\"${local.getProperty("admobRewardedId", testRewardedId)}\"")
            buildConfigField("String", "ADMOB_INTERSTITIAL_ID", "\"${local.getProperty("admobInterstitialId", testInterstitialId)}\"")
            signingConfigs.findByName("upload")?.let { signingConfig = it }
        }
    }

    buildFeatures { buildConfig = true }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    sourceSets["main"].assets.srcDir(layout.buildDirectory.dir("generated/game-assets"))
}

dependencies {
    implementation("androidx.activity:activity:1.10.1")
    implementation("androidx.core:core:1.16.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.webkit:webkit:1.14.0")
    // the version audited for the Play Data safety form (android/PRIVACY-RELEASE-CONFIG.md)
    implementation("com.google.android.gms:play-services-ads:25.5.0")
    implementation("com.google.android.ump:user-messaging-platform:3.2.0")
}

// The game itself: the Android web build (TARGET=full) of source/, bundled as assets/game.
val repoRoot = rootProject.file("../..")
val buildGame by tasks.registering(Exec::class) {
    workingDir = repoRoot
    environment("TARGET", "full")
    commandLine("bash", "source/buildall.sh")
}
val bundleGame by tasks.registering(Sync::class) {
    dependsOn(buildGame)
    from(File(repoRoot, "source/build")) {
        exclude("playgama-bridge-config.json") // Playgama's settings have no use in the app
    }
    into(layout.buildDirectory.dir("generated/game-assets/game"))
}
tasks.named("preBuild") { dependsOn(bundleGame) }

// Never ship Google's test ad ids in a Play release.
gradle.taskGraph.whenReady {
    val releasing = allTasks.any { it.project == project && it.name.contains("Release") && (it.name.startsWith("bundle") || it.name.startsWith("assemble")) }
    if (releasing && listOf("admobAppId", "admobRewardedId", "admobInterstitialId").any { local.getProperty(it).isNullOrBlank() }) {
        throw GradleException("Release builds need admobAppId, admobRewardedId and admobInterstitialId in android/native/keystore.properties")
    }
}
