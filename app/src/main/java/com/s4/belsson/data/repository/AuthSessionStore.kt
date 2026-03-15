package com.s4.belsson.data.repository

import android.content.Context

class AuthSessionStore(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun saveSession(token: String, email: String) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_EMAIL, email)
            .apply()
    }

    fun clearSession() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_EMAIL)
            .apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)

    companion object {
        private const val PREFS_NAME = "belsson_auth"
        private const val KEY_TOKEN = "token"
        private const val KEY_EMAIL = "email"
    }
}

