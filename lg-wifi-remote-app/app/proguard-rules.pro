# Libre Remote release rules.
# OkHttp and Kotlin metadata are handled by their consumer rules.

-keepattributes Signature,InnerClasses,EnclosingMethod
-keepattributes RuntimeVisibleAnnotations,RuntimeInvisibleAnnotations,AnnotationDefault

# AndroidX Security uses reflection on encrypted preference internals on older devices.
-keep class androidx.security.crypto.** { *; }
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# Keep the launcher activity name stable for Play updates and shortcuts.
-keep class com.geronimo.controlelgwifi.MainActivity { *; }

# JSON payload models are constructed directly, but keeping enums prevents name
# changes from breaking user-created preset persistence between releases.
-keepclassmembers enum com.geronimo.controlelgwifi.RemotePresetId { *; }
-keepclassmembers enum com.geronimo.controlelgwifi.RemoteModule { *; }
-keepclassmembers enum com.geronimo.controlelgwifi.ThemeMode { *; }
-keepclassmembers enum com.geronimo.controlelgwifi.AccentTheme { *; }
