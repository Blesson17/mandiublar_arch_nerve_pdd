package com.s4.belsson.ui.patients

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ReportHistoryScreen(
    viewModel: PatientRecordsViewModel,
    modifier: Modifier = Modifier,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    var firstName by rememberSaveable { mutableStateOf("") }
    var lastName by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var editingPatientId by remember { mutableStateOf<Long?>(null) }

    val editingPatient = state.patients.firstOrNull { it.id == editingPatientId }
    val selected = state.patients.firstOrNull { it.id == state.selectedPatientId }

    val reports = if (selected == null) {
        state.reports
    } else {
        state.reports.filter { it.patientId == selected.id }
    }

    LazyColumn(
        modifier = modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(
                text = if (selected == null) "Patients" else "Visit History: ${selected.firstName} ${selected.lastName}",
                style = MaterialTheme.typography.titleLarge,
            )
        }

        if (selected == null) {
            item {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Add Patient", style = MaterialTheme.typography.titleMedium)
                        OutlinedTextField(
                            value = firstName,
                            onValueChange = { firstName = it },
                            label = { Text("First Name") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        OutlinedTextField(
                            value = lastName,
                            onValueChange = { lastName = it },
                            label = { Text("Last Name") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("Phone") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Email") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        Button(
                            onClick = {
                                viewModel.addPatient(
                                    firstName = firstName,
                                    lastName = lastName,
                                    dob = null,
                                    gender = null,
                                    phone = phone,
                                    email = email,
                                )
                                firstName = ""
                                lastName = ""
                                phone = ""
                                email = ""
                            },
                            enabled = !state.isSavingPatient,
                        ) {
                            Text(if (state.isSavingPatient) "Saving..." else "Create Patient")
                        }
                        state.message?.let { msg ->
                            Text(
                                text = msg,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }

        if (selected == null && state.patients.isEmpty()) {
            item {
                Text("No patients yet. Process a scan first to create report history.")
            }
        }

        if (selected == null) {
            items(state.patients, key = { it.id }) { patient ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "${patient.firstName} ${patient.lastName}",
                            style = MaterialTheme.typography.titleMedium,
                        )
                        Text(
                            text = "Tap to view reports",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { viewModel.selectPatient(patient.id) }) {
                                Text("Open History")
                            }
                            TextButton(onClick = { editingPatientId = patient.id }) {
                                Text("Edit")
                            }
                            TextButton(
                                onClick = { viewModel.deletePatient(patient.id) },
                                enabled = !state.isSavingPatient,
                            ) {
                                Text("Delete")
                            }
                        }
                    }
                }
            }
            return@LazyColumn
        }

        item {
            Button(onClick = { viewModel.selectPatient(null) }) {
                Text("Back to patients")
            }
        }

        if (reports.isEmpty()) {
            item {
                Text("No reports for this patient yet.")
            }
        }

        items(reports, key = { it.id }) { report ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Session: ${report.sessionId}", style = MaterialTheme.typography.titleMedium)
                    Text("Workflow: ${report.workflow}")
                    Text("Scan Region: ${report.scanRegion}")
                    Text("Safe Height: ${"%.2f".format(report.safeHeightMm)} mm")
                    Text("Bone Width: ${"%.2f".format(report.boneWidthMm)} mm")
                    Text("Bone Height: ${"%.2f".format(report.boneHeightMm)} mm")
                    Text("Nerve Detected: ${if (report.nerveDetected) "Yes" else "No"}")
                    Text("Recommendation: ${report.recommendation}")
                    Text("Visit Time: ${report.createdAt.toReadableDate()}")
                    Text("PDF: ${report.pdfPath}")
                }
            }
        }
    }

    if (editingPatient != null) {
        var editFirstName by remember(editingPatient.id) { mutableStateOf(editingPatient.firstName) }
        var editLastName by remember(editingPatient.id) { mutableStateOf(editingPatient.lastName) }
        var editPhone by remember(editingPatient.id) { mutableStateOf(editingPatient.phone.orEmpty()) }
        var editEmail by remember(editingPatient.id) { mutableStateOf(editingPatient.email.orEmpty()) }

        AlertDialog(
            onDismissRequest = { editingPatientId = null },
            title = { Text("Edit Patient") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = editFirstName,
                        onValueChange = { editFirstName = it },
                        label = { Text("First Name") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    OutlinedTextField(
                        value = editLastName,
                        onValueChange = { editLastName = it },
                        label = { Text("Last Name") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    OutlinedTextField(
                        value = editPhone,
                        onValueChange = { editPhone = it },
                        label = { Text("Phone") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    OutlinedTextField(
                        value = editEmail,
                        onValueChange = { editEmail = it },
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.updatePatient(
                            patientId = editingPatient.id,
                            firstName = editFirstName,
                            lastName = editLastName,
                            dob = editingPatient.dob,
                            gender = editingPatient.gender,
                            phone = editPhone,
                            email = editEmail,
                        )
                        editingPatientId = null
                    },
                    enabled = !state.isSavingPatient,
                ) {
                    Text("Update")
                }
            },
            dismissButton = {
                TextButton(onClick = { editingPatientId = null }) {
                    Text("Cancel")
                }
            },
        )
    }
}

private fun Long.toReadableDate(): String {
    return runCatching {
        SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date(this))
    }.getOrDefault("-")
}
