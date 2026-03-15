package com.s4.belsson.ui.planning

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp

@Composable
fun AuthScreen(
    authState: AuthUiState,
    onLogin: (email: String, password: String) -> Unit,
    onSignup: (email: String, password: String) -> Unit,
    onDismissError: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var isSignup by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = if (isSignup) "Create account" else "Login",
            style = MaterialTheme.typography.headlineSmall,
        )
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        if (authState is AuthUiState.Error) {
            Spacer(modifier = Modifier.height(12.dp))
            Card {
                Text(
                    text = authState.message,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(12.dp),
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        Button(
            onClick = {
                if (isSignup) onSignup(email.trim(), password) else onLogin(email.trim(), password)
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = authState !is AuthUiState.Loading && email.isNotBlank() && password.isNotBlank(),
        ) {
            Text(if (authState is AuthUiState.Loading) "Please wait..." else if (isSignup) "Sign up" else "Login")
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
            onClick = {
                isSignup = !isSignup
                onDismissError()
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = authState !is AuthUiState.Loading,
        ) {
            Text(if (isSignup) "I already have an account" else "Create new account")
        }
    }
}

