package com.s4.belsson

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.s4.belsson.ui.planning.PlanningDashboard
import com.s4.belsson.ui.theme.BelssonTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BelssonTheme {
                BelssonApp()
            }
        }
    }
}

@Composable
fun BelssonApp() {
    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
        PlanningDashboard(modifier = Modifier.padding(innerPadding))
    }
}