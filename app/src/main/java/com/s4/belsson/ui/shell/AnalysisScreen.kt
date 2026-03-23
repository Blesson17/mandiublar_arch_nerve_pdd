package com.s4.belsson.ui.shell

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.s4.belsson.data.local.entity.CaseEntity
import com.s4.belsson.ui.planning.PlanningUiState
import com.s4.belsson.ui.planning.ResultsScreen
import com.s4.belsson.ui.planning.PlanningViewModel

@Composable
fun AnalysisScreen(
    viewModel: PlanningViewModel,
    uiState: PlanningUiState,
    cases: List<CaseEntity>,
    selectedCaseId: Long?,
    onSelectedCaseChange: (Long?) -> Unit,
    onAnalyzeSelectedCase: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (uiState !is PlanningUiState.Success) {
        var caseMenuExpanded by remember { mutableStateOf(false) }
        val selectedCase = cases.firstOrNull { it.id == selectedCaseId }

        Column(
            modifier = modifier.fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.Center,
        ) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Start AI Analysis", style = MaterialTheme.typography.headlineSmall)
                    Text("Select a patient case, then tap Analyze with AI to upload CBCT and panoramic files.")

                    Box {
                        OutlinedButton(
                            onClick = { caseMenuExpanded = true },
                            enabled = cases.isNotEmpty(),
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(
                                    text = selectedCase?.let { "${it.fname} ${it.lname} (${it.caseId})" }
                                        ?: "Select a patient case",
                                )
                                Icon(
                                    imageVector = Icons.Default.ArrowDropDown,
                                    contentDescription = "Choose patient",
                                )
                            }
                        }

                        DropdownMenu(
                            expanded = caseMenuExpanded,
                            onDismissRequest = { caseMenuExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f),
                        ) {
                            if (cases.isEmpty()) {
                                DropdownMenuItem(
                                    text = { Text("No patient cases available") },
                                    onClick = { caseMenuExpanded = false },
                                )
                            } else {
                                cases.forEach { case ->
                                    DropdownMenuItem(
                                        text = { Text("${case.fname} ${case.lname} (${case.caseId})") },
                                        onClick = {
                                            onSelectedCaseChange(case.id)
                                            caseMenuExpanded = false
                                        },
                                    )
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(8.dp))
                    Button(onClick = onAnalyzeSelectedCase, enabled = selectedCaseId != null) {
                        Text("Analyze with AI")
                    }
                    Text(
                        if (selectedCaseId == null) {
                            "Please select a case first."
                        } else {
                            "Selected patient is ready. Continue in Upload tab to process files."
                        },
                        color = if (selectedCaseId == null) {
                            MaterialTheme.colorScheme.error
                        } else {
                            MaterialTheme.colorScheme.primary
                        },
                    )
                }
            }
        }
        return
    }

    val state = uiState
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        ResultsScreen(
            analysis = state.cbctAnalysis,
            opgBitmap = state.cbctBitmap,
            measurementManager = state.cbctMeasurementManager,
            tapMetrics = null,
            tapOverlay = null,
            tapSafeZonePath = null,
            tapRecommendationLine = null,
            tapIanStatusMessage = null,
            onTapCoordinate = { _, _ -> },
            onGenerateReport = { viewModel.generateReport() },
            onReset = { viewModel.reset() },
            onLogout = { },
            modifier = Modifier.fillMaxWidth(),
            embedded = true,
            showActions = false,
        )

        ResultsScreen(
            analysis = state.panoramicAnalysis,
            opgBitmap = state.panoramicBitmap,
            measurementManager = state.panoramicMeasurementManager,
            tapMetrics = viewModel.tapMetrics.value,
            tapOverlay = viewModel.tapOverlay.value,
            tapSafeZonePath = viewModel.tapSafeZonePath.value,
            tapRecommendationLine = viewModel.tapRecommendationLine.value,
            tapIanStatusMessage = viewModel.tapIanStatusMessage.value,
            onTapCoordinate = { x, y -> viewModel.measureAtCoordinate(x, y) },
            onGenerateReport = { viewModel.generateReport() },
            onReset = { viewModel.reset() },
            onLogout = { },
            modifier = Modifier.fillMaxWidth(),
            embedded = true,
            showActions = true,
        )
    }
}
