package com.s4.belsson.ui.patients

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
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
    val patientLookup = remember(state.patients) { state.patients.associateBy { it.id } }
    val reports = remember(state.reports) { state.reports.sortedByDescending { it.createdAt } }

    LazyColumn(
        modifier = modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Past Reports", style = MaterialTheme.typography.titleLarge)
        }

        if (reports.isEmpty()) {
            item {
                Text("No reports yet. Run an analysis to see it here.")
            }
        }

        items(reports, key = { it.id }) { report ->
            val patientLabel = patientLookup[report.patientId]?.let { patient ->
                "${patient.firstName} ${patient.lastName}"
            } ?: "Unknown patient"

            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(patientLabel, style = MaterialTheme.typography.titleMedium)
                    Text("Session: ${report.sessionId}")
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
}

private fun Long.toReadableDate(): String {
    return runCatching {
        SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date(this))
    }.getOrDefault("-")
}
