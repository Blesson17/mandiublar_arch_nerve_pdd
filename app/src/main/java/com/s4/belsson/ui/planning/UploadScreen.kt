package com.s4.belsson.ui.planning

import android.net.Uri
import androidx.activity.result.contract.ActivityResultContracts.OpenDocument
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

/**
 * Upload screen – lets the user pick a .dcm DICOM file and upload it.
 */
@Composable
fun UploadScreen(
    uiState: PlanningUiState,
    onProcessRequested: (Uri, Uri) -> Unit,
    modifier: Modifier = Modifier
) {
    var cbctUri by remember { mutableStateOf<Uri?>(null) }
    var panoramicUri by remember { mutableStateOf<Uri?>(null) }

    val cbctLauncher = rememberLauncherForActivityResult(
        contract = OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            cbctUri = uri
        }
    }

    val panoramicLauncher = rememberLauncherForActivityResult(
        contract = OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            panoramicUri = uri
        }
    }

    val canProcess = cbctUri != null && panoramicUri != null

    val isLoading = uiState is PlanningUiState.Loading

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top
    ) {
        Icon(
            imageVector = Icons.Default.Add,
            contentDescription = "Upload",
            modifier = Modifier.size(80.dp),
            tint = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Dental Implant Planning",
            style = MaterialTheme.typography.headlineMedium,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Upload your scans and process analysis",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("CBCT Upload", style = MaterialTheme.typography.titleSmall)
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Button(
                        onClick = {
                            cbctLauncher.launch(
                                arrayOf(
                                    "application/dicom",
                                    "application/zip",
                                    "application/octet-stream"
                                )
                            )
                        },
                        enabled = !isLoading,
                    ) {
                        Text("Select File")
                    }
                }
                Text(
                    text = cbctUri?.lastPathSegment ?: "No file selected",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("Panoramic Upload", style = MaterialTheme.typography.titleSmall)
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Button(
                        onClick = {
                            panoramicLauncher.launch(
                                arrayOf(
                                    "application/dicom",
                                    "image/jpeg",
                                    "image/png"
                                )
                            )
                        },
                        enabled = !isLoading,
                    ) {
                        Text("Select File")
                    }
                }
                Text(
                    text = panoramicUri?.lastPathSegment ?: "No file selected",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = {
                if (cbctUri != null && panoramicUri != null) {
                    onProcessRequested(cbctUri!!, panoramicUri!!)
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            enabled = canProcess && !isLoading,
        ) {
            Text("Process Both", style = MaterialTheme.typography.titleMedium)
        }

        if (isLoading) {
            Spacer(modifier = Modifier.height(14.dp))
            CircularProgressIndicator()
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Processing scan...",
                style = MaterialTheme.typography.bodySmall,
            )
        }

        if (uiState is PlanningUiState.Error) {
            Spacer(modifier = Modifier.height(14.dp))
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Error: ${uiState.message}",
                    modifier = Modifier.padding(16.dp),
                    color = MaterialTheme.colorScheme.onErrorContainer
                )
            }
        }
    }
}

