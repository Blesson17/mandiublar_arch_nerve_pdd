package com.s4.belsson.data.model

import kotlinx.serialization.Serializable

@Serializable
data class AuthRequest(
    val email: String,
    val password: String
)

@Serializable
data class AuthUser(
    val id: Int,
    val email: String
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: AuthUser
)

