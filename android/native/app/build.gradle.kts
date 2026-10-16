import java.util.Properties

plugins {
    id("com.android.application")
}

// Upload signing lives in keystore.properties (never committed).
// Public production AdMob identifiers live separately in admob-production.properties.
// Debug builds always use Google's public test ids, so no real ads are ever requested while testing.
val local = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
val productionAds = Properties().apply {
    val f = rootProject.file("admob-production.properties")
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
        versionCode = 8
        versionName = "1.0.7"
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
            manifestPlaceholders["admobAppId"] = productionAds.getProperty("admobAppId", "")
            buildConfigField("String", "ADMOB_REWARDED_ID", "\"${productionAds.getProperty("admobRewardedId", "")}\"")
            buildConfigField("String", "ADMOB_INTERSTITIAL_ID", "\"${productionAds.getProperty("admobInterstitialId", "")}\"")
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

// Validate every selected release task, including manifest/config inspection, without requesting an ad.
gradle.taskGraph.whenReady {
    val releasing = allTasks.any { it.project == project && it.name.contains("Release") }
    if (releasing) {
        val publisher = "8054612600809568"
        val expected = mapOf(
            "admobAppId" to Regex("ca-app-pub-$publisher~[0-9]{10}"),
            "admobRewardedId" to Regex("ca-app-pub-$publisher/[0-9]{10}"),
            "admobInterstitialId" to Regex("ca-app-pub-$publisher/[0-9]{10}")
        )
        if (expected.any { (key, format) -> !format.matches(productionAds.getProperty(key, "")) }
                || productionAds.getProperty("admobRewardedId") == productionAds.getProperty("admobInterstitialId")) {
            throw GradleException("Release tasks require this publisher's valid production app/rewarded/interstitial IDs in android/native/admob-production.properties; test IDs are forbidden")
        }
    }
}
