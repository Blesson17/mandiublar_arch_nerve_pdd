package com.s4.belsson.ui.shell

import android.widget.Toast
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.s4.belsson.ui.planning.AuthUiState
import com.s4.belsson.ui.planning.DomainDashboardUiState

object SettingsRoutes {
    const val Home = "settings"
    const val Profile = "settings/profile"
    const val Account = "settings/account"
    const val Privacy = "settings/privacy"
    const val Appearance = "settings/appearance"
    const val Language = "settings/language"
    const val About = "settings/about"
    const val Delete = "settings/delete"
}

data class SettingsMenuItem(
    val title: String,
    val route: String,
    val group: String,
)

private val settingsItems = listOf(
    SettingsMenuItem("My Profile", SettingsRoutes.Profile, "ACCOUNT"),
    SettingsMenuItem("Account Privacy", SettingsRoutes.Account, "ACCOUNT"),
//    SettingsMenuItem("Notifications", SettingsRoutes.Notifications, "ACCOUNT"),
//    SettingsMenuItem("Privacy & Security", SettingsRoutes.Privacy, "ACCOUNT"),
//    SettingsMenuItem("Team Members", SettingsRoutes.Team, "WORKSPACE"),
//    SettingsMenuItem("Integrations", SettingsRoutes.Integrations, "WORKSPACE"),
//    SettingsMenuItem("Billing & Plans", SettingsRoutes.Billing, "WORKSPACE"),
    SettingsMenuItem("Appearance", SettingsRoutes.Appearance, "PREFERENCES"),
    SettingsMenuItem("Language & Region", SettingsRoutes.Language, "PREFERENCES"),
//    SettingsMenuItem("Help & Support", SettingsRoutes.Help, "SUPPORT"),
    SettingsMenuItem("About", SettingsRoutes.About, "SUPPORT"),
    SettingsMenuItem("Delete Account", SettingsRoutes.Delete, "DANGER ZONE"),
)

@Composable
fun SettingsHomeScreen(
    onOpenRoute: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val grouped = settingsItems.groupBy { it.group }

    LazyColumn(
        modifier = modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Text("Settings", style = MaterialTheme.typography.headlineSmall)
        }

        grouped.forEach { (group, entries) ->
            item {
                Text(group, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            items(entries.size) { idx ->
                val item = entries[idx]
                Card(modifier = Modifier.fillMaxWidth().clickable { onOpenRoute(item.route) }) {
                    Text(
                        item.title,
                        modifier = Modifier.padding(14.dp),
                        color = if (item.group == "DANGER ZONE") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface,
                    )
                }
            }
        }
    }
}

@Composable
fun SettingsProfilePage(
    authState: AuthUiState,
    domainState: DomainDashboardUiState,
    onUpdateProfile: (name: String, phone: String?, practiceName: String?, bio: String?, specialty: String?) -> Unit,
    onRefreshDomain: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val profile = domainState.profile
    val authEmail = (authState as? AuthUiState.Authenticated)?.email.orEmpty()

    var name by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var practice by rememberSaveable { mutableStateOf("") }
    var bio by rememberSaveable { mutableStateOf("") }
    var specialty by rememberSaveable { mutableStateOf("") }

    LaunchedEffect(profile) {
        if (profile != null) {
            name = profile.name
            phone = profile.phone.orEmpty()
            practice = profile.practiceName.orEmpty()
            bio = profile.bio.orEmpty()
            specialty = profile.specialty.orEmpty()
        }
    }

    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("My Profile", style = MaterialTheme.typography.headlineSmall)
        Text("Email: ${profile?.email ?: authEmail}")
        OutlinedTextField(name, { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(practice, { practice = it }, label = { Text("Practice") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(specialty, { specialty = it }, label = { Text("Specialty") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(bio, { bio = it }, label = { Text("Bio") }, modifier = Modifier.fillMaxWidth())
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { onUpdateProfile(name, phone.ifBlank { null }, practice.ifBlank { null }, bio.ifBlank { null }, specialty.ifBlank { null }) }) {
                Text("Save")
            }
            Button(onClick = onRefreshDomain) { Text("Refresh") }
        }
    }
}

@Composable
fun SettingsAccountPage(authState: AuthUiState, modifier: Modifier = Modifier) {
    val authEmail = (authState as? AuthUiState.Authenticated)?.email.orEmpty()
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Account Settings", style = MaterialTheme.typography.headlineSmall)
        Text("Login Email: $authEmail")
        OutlinedTextField("", {}, label = { Text("Current Password") }, modifier = Modifier.fillMaxWidth(), enabled = false)
        OutlinedTextField("", {}, label = { Text("New Password") }, modifier = Modifier.fillMaxWidth(), enabled = false)
        Text("Password updates are mocked in this build.")
    }
}

@Composable
fun SettingsNotificationsPage(modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Notifications", style = MaterialTheme.typography.headlineSmall)
        Text("Analysis Complete: Enabled")
        HorizontalDivider()
        Text("Marketing & Updates: Disabled")
        HorizontalDivider()
        Text("Analysis Alerts: Enabled")
        HorizontalDivider()
        Text("New Messages: Enabled")
    }
}

@Composable
fun SettingsPrivacyPage(modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Privacy & Security", style = MaterialTheme.typography.headlineSmall)
        Text("Two-factor authentication and active sessions are mock controls in this build.")
        Button(onClick = {}) { Text("Setup 2FA") }
    }
}

@Composable
fun SettingsTeamPage(
    domainState: DomainDashboardUiState,
    onAddTeamMember: (name: String, email: String, role: String) -> Unit,
    onRemoveTeamMember: (memberId: Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var role by rememberSaveable { mutableStateOf("Assistant") }

    LazyColumn(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        item {
            Text("Team Members", style = MaterialTheme.typography.headlineSmall)
            OutlinedTextField(name, { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
            OutlinedTextField(role, { role = it }, label = { Text("Role") }, modifier = Modifier.fillMaxWidth())
            Button(onClick = {
                onAddTeamMember(name, email, role)
                name = ""
                email = ""
            }, enabled = name.isNotBlank() && email.isNotBlank()) {
                Text("Invite Member")
            }
        }

        items(domainState.teamMembers.size) { idx ->
            val member = domainState.teamMembers[idx]
            Card(modifier = Modifier.fillMaxWidth()) {
                Row(modifier = Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text(member.name, fontWeight = FontWeight.SemiBold)
                        Text(member.email)
                        Text(member.role)
                    }
                    Button(onClick = { onRemoveTeamMember(member.remoteId) }) { Text("Remove") }
                }
            }
        }
    }
}

@Composable
fun SettingsIntegrationsPage(modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Integrations", style = MaterialTheme.typography.headlineSmall)
        Text("DICOM Import: Connected")
        Text("Cloud Backup: Not Connected")
        Text("Calendar Sync: Not Connected")
    }
}

@Composable
fun SettingsBillingPage(domainState: DomainDashboardUiState, modifier: Modifier = Modifier) {
    val billing = domainState.billing
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Billing & Plans", style = MaterialTheme.typography.headlineSmall)
        Text("Plan: ${billing?.planName ?: "-"}")
        Text("Status: ${billing?.status ?: "-"}")
        Text("Next Billing Date: ${billing?.nextBillingDate ?: "-"}")
        Text("Card Last4: ${billing?.cardLast4 ?: "-"}")
    }
}

@Composable
fun SettingsAppearancePage(
    domainState: DomainDashboardUiState,
    onUpdateSettings: (theme: String, language: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var theme by rememberSaveable { mutableStateOf(domainState.settings?.theme ?: "system") }
    val language = domainState.settings?.language ?: "en"

    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Appearance", style = MaterialTheme.typography.headlineSmall)
        OutlinedTextField(theme, { theme = it }, label = { Text("Theme (system/light/dark)") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = { onUpdateSettings(theme, language) }) { Text("Apply") }
    }
}

@Composable
fun SettingsLanguagePage(
    domainState: DomainDashboardUiState,
    onUpdateSettings: (theme: String, language: String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val theme = domainState.settings?.theme ?: "system"
    var language by rememberSaveable { mutableStateOf(domainState.settings?.language ?: "en") }

    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Language & Region", style = MaterialTheme.typography.headlineSmall)
        OutlinedTextField(language, { language = it }, label = { Text("Language (en/es/fr)") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = { onUpdateSettings(theme, language) }) { Text("Save") }
    }
}

@Composable
fun SettingsHelpPage(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Help & Support", style = MaterialTheme.typography.headlineSmall)
        Text("Documentation")
        Text("FAQs")
        Button(onClick = { Toast.makeText(context, "Live chat started (mock)", Toast.LENGTH_SHORT).show() }) {
            Text("Start Live Chat")
        }
    }
}

@Composable
fun SettingsAboutPage(modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("About", style = MaterialTheme.typography.headlineSmall)
        Text("ImplantAI")
        Text("Advanced Surgical Planning & Diagnostics")
        Text("v1.0.2-beta")
        Text("All information in this build is mock/demo data.")
    }
}

@Composable
fun SettingsDeletePage(modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Delete Account", style = MaterialTheme.typography.headlineSmall)
        Text("For safety, account deletion is disabled in this mock app build.")
    }
}
