package com.fkucukpala.baglanti.ui

import android.Manifest
import android.content.Context
import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.foundation.text.TextAutoSize
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fkucukpala.baglanti.Graph
import com.fkucukpala.baglanti.R
import com.fkucukpala.baglanti.core.Group
import com.fkucukpala.baglanti.data.Flag
import com.fkucukpala.baglanti.engagement.Reminders
import com.fkucukpala.baglanti.ui.theme.LevelColors
import com.fkucukpala.baglanti.ui.theme.LocalAppColors
import kotlinx.coroutines.delay
import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.Locale

private val TR = Locale.forLanguageTag("tr-TR")

/** Başlık çubuklu ekran iskeleti; geri düğmesi ancak onBack verildiğinde görünür. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScaffold(title: String?, onBack: (() -> Unit)?, content: @Composable (Modifier) -> Unit) {
    val c = LocalAppColors.current
    Scaffold(
        containerColor = c.background,
        topBar = {
            if (title != null) {
                TopAppBar(
                    title = { Text(title, fontWeight = FontWeight.ExtraBold, color = c.text) },
                    navigationIcon = {
                        if (onBack != null) {
                            IconButton(onClick = onBack) {
                                Icon(painterResource(R.drawable.ic_back), contentDescription = "Geri", tint = c.text)
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = c.background),
                )
            }
        },
    ) { padding -> content(Modifier.padding(padding)) }
}

@Composable
fun AppButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    primary: Boolean = false,
    enabled: Boolean = true,
    dashed: Boolean = false,
) {
    val c = LocalAppColors.current
    val shape = RoundedCornerShape(24.dp)
    val base = modifier
        .heightIn(min = 48.dp)
        .clip(shape)
        .then(if (primary) Modifier.background(c.accent) else Modifier.border(if (dashed) 1.dp else 1.5.dp, c.accent, shape))
        .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
        .padding(horizontal = 16.dp, vertical = 12.dp)
    Box(base, contentAlignment = Alignment.Center) {
        Text(
            label,
            color = (if (primary) c.onSelected else c.accent).copy(alpha = if (enabled) 1f else 0.35f),
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
fun WordTile(word: String, selected: Boolean, enabled: Boolean, size: Dp, onClick: () -> Unit) {
    val c = LocalAppColors.current
    Box(
        Modifier
            .size(width = size, height = size * 0.8f)
            .clip(RoundedCornerShape(8.dp))
            .background(if (selected) c.selected else c.tile)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(horizontal = 4.dp),
        contentAlignment = Alignment.Center,
    ) {
        BasicText(
            text = word,
            style = TextStyle(
                color = if (selected) c.onSelected else c.text,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            ),
            maxLines = if (' ' in word) 2 else 1,
            autoSize = TextAutoSize.StepBased(minFontSize = 8.sp, maxFontSize = 15.sp),
        )
    }
}

@Composable
fun SolvedGroupBar(group: Group, height: Dp) {
    val c = LocalAppColors.current
    Column(
        Modifier
            .fillMaxWidth()
            .height(height)
            .clip(RoundedCornerShape(8.dp))
            .background(LevelColors[group.level])
            .padding(horizontal = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(group.title.uppercase(TR), color = c.onLevel, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, maxLines = 1)
        BasicText(
            text = group.words.joinToString(", "),
            style = TextStyle(color = c.onLevel, textAlign = TextAlign.Center),
            maxLines = 2,
            autoSize = TextAutoSize.StepBased(minFontSize = 9.sp, maxFontSize = 14.sp),
        )
    }
}

@Composable
fun HintCard(group: Group) {
    val c = LocalAppColors.current
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(c.tile),
    ) {
        Box(Modifier.size(width = 6.dp, height = 56.dp).background(LevelColors[group.level]))
        Column(Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
            Text("💡 Gruplardan biri", color = c.muted, fontSize = 13.sp)
            Text(group.title.uppercase(TR), color = c.text, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
        }
    }
}

/** Gece yarısına (günlük hakların yenilenmesine) kalan süre, "SS:DD:ss" biçiminde. */
@Composable
fun rememberMidnightCountdown(): String {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1_000)
            now = System.currentTimeMillis()
        }
    }
    val current = LocalDateTime.ofInstant(Instant.ofEpochMilli(now), ZoneId.systemDefault())
    val left = Duration.between(current, current.toLocalDate().plusDays(1).atStartOfDay()).seconds.coerceAtLeast(0)
    return "%02d:%02d:%02d".format(left / 3600, (left % 3600) / 60, left % 60)
}

fun shareText(context: Context, text: String) {
    val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, text)
    context.startActivity(Intent.createChooser(send, null))
}

/**
 * Günlük hatırlatmayı açan işlev. Android 13+ bildirim iznini ister; sonucu (açıldı mı)
 * onResult ile bildirir.
 */
@Composable
fun rememberReminderEnabler(onResult: (Boolean) -> Unit): () -> Unit {
    val context = LocalContext.current
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        Graph.store.setFlag(Flag.REMINDER_ASKED, true)
        if (granted) Reminders.enable(context)
        onResult(granted)
    }
    return {
        if (Reminders.needsPermission(context)) {
            launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            Reminders.enable(context)
            onResult(true)
        }
    }
}

@Composable
fun SectionSpacer(height: Dp = 16.dp) = Spacer(Modifier.height(height))
