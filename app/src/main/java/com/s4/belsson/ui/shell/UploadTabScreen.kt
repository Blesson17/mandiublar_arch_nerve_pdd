package com.s4.belsson.ui.shell

import com.s4.belsson.data.local.entity.CaseEntity
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.s4.belsson.ui.planning.PlanningUiState
import com.s4.belsson.ui.planning.UploadScreen

@Composable
fun UploadTabScreen(
    uiState: PlanningUiState,
    cases: List<CaseEntity>,
    selectedCaseId: Long?,
    onSelectedCaseChange: (Long?) -> Unit,
    onProcessRequested: (android.net.Uri, android.net.Uri) -> Unit,
    modifier: Modifier = Modifier,
) {
    androidx.compose.foundation.layout.Column(modifier = modifier.fillMaxSize().padding(12.dp)) {
        Text("Upload CBCT Slice", modifier = Modifier.padding(8.dp))
        UploadScreen(
            uiState = uiState,
            cases = cases,
            selectedCaseId = selectedCaseId,
            onSelectedCaseChange = onSelectedCaseChange,
            onProcessRequested = onProcessRequested,
            modifier = Modifier.fillMaxSize(),
        )
    }
}
