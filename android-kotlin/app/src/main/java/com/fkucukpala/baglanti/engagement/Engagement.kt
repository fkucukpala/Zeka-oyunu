// Oyuncuyu geri getiren ve mağaza puanını artıran yardımcılar:
// günlük hatırlatma bildirimi ve Play Store puanlama isteği.
package com.fkucukpala.baglanti.engagement

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.fkucukpala.baglanti.Config
import com.fkucukpala.baglanti.Graph
import com.fkucukpala.baglanti.MainActivity
import com.fkucukpala.baglanti.R
import com.fkucukpala.baglanti.data.Flag
import com.google.android.play.core.review.ReviewManagerFactory
import java.time.Duration
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

object Reminders {
    private const val CHANNEL_ID = "gunluk-bolum"
    private const val WORK_NAME = "gunluk-hatirlatma"

    fun createChannel(context: Context) {
        val channel = NotificationChannel(CHANNEL_ID, "Günlük bölüm hakkı", NotificationManager.IMPORTANCE_DEFAULT)
        context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    /** Android 13+ için bildirim izni gerekip gerekmediği. */
    fun needsPermission(context: Context): Boolean =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED

    /** Her gün REMINDER_HOUR'da bildirim gönderen işi kurar. */
    fun enable(context: Context) {
        val now = LocalDateTime.now()
        var next = now.toLocalDate().atTime(Config.REMINDER_HOUR, 0)
        if (!next.isAfter(now)) next = next.plusDays(1)
        val request = PeriodicWorkRequestBuilder<ReminderWorker>(1, TimeUnit.DAYS)
            .setInitialDelay(Duration.between(now, next).toMillis(), TimeUnit.MILLISECONDS)
            .build()
        WorkManager.getInstance(context).enqueueUniquePeriodicWork(WORK_NAME, ExistingPeriodicWorkPolicy.UPDATE, request)
        Graph.store.setFlag(Flag.REMINDER_ASKED, true)
        Graph.store.setFlag(Flag.REMINDER_ON, true)
    }

    fun disable(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
        Graph.store.setFlag(Flag.REMINDER_ON, false)
    }

    @SuppressLint("MissingPermission")
    internal fun post(context: Context) {
        if (needsPermission(context)) return
        val intent = Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        val pending = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("${Config.DAILY_ENERGY} yeni bölüm hakkın hazır 🧩")
            .setContentText("Bugün en az bir bölüm çöz, serini koru!")
            .setContentIntent(pending)
            .setAutoCancel(true)
            .build()
        NotificationManagerCompat.from(context).notify(1, notification)
    }
}

class ReminderWorker(context: Context, params: WorkerParameters) : Worker(context, params) {
    override fun doWork(): Result {
        Reminders.post(applicationContext)
        return Result.success()
    }
}

object Review {
    /**
     * Yeterince galibiyetten sonra Play Store puanlama penceresini bir kez açar.
     * Açtıysa true döner (o bölümün sonunda ayrıca reklam gösterilmez).
     */
    fun maybeAsk(activity: Activity): Boolean {
        val store = Graph.store
        if (store.getFlag(Flag.REVIEW_ASKED) || store.loadStats().won < Config.REVIEW_AFTER_WINS) return false
        store.setFlag(Flag.REVIEW_ASKED, true)
        val manager = ReviewManagerFactory.create(activity)
        manager.requestReviewFlow().addOnCompleteListener { task ->
            if (task.isSuccessful) manager.launchReviewFlow(activity, task.result)
        }
        return true
    }
}
