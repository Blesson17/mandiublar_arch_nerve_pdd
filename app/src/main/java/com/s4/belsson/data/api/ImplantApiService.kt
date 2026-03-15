package com.s4.belsson.data.api

import com.s4.belsson.data.model.AnalysisResponse
import com.s4.belsson.data.model.AuthRequest
import com.s4.belsson.data.model.AuthResponse
import com.s4.belsson.data.model.MeasureRequest
import com.s4.belsson.data.model.MeasureResponse
import io.ktor.client.*
import io.ktor.client.plugins.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.bodyAsText
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

/**
 * Ktor-based API service for communicating with the
 * Dental Implant Planning FastAPI backend.
 */
object ImplantApiService {

    // For emulator use "10.0.2.2"; for physical device use your machine's LAN IP
    private const val BASE_URL = "http://10.0.2.2:8001"

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        prettyPrint = false
        coerceInputValues = true
        explicitNulls = false
        allowSpecialFloatingPointValues = true
    }

    @Volatile
    private var authToken: String? = null

    val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(json)
        }
        install(Logging) {
            // IMPORTANT: Do NOT use LogLevel.BODY — it buffers the entire
            // request/response body as a String, which causes OOM on large
            // CBCT ZIP uploads (12+ MB of binary data).
            level = LogLevel.HEADERS
            logger = Logger.ANDROID
        }
        engine {
            connectTimeout = 90_000
            socketTimeout = 300_000
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 300_000
            connectTimeoutMillis = 90_000
            socketTimeoutMillis = 300_000
        }
    }

    /**
     * Upload a DICOM file for full jaw analysis.
     *
     * @param dicomBytes Raw bytes of the .dcm file
     * @param fileName   Original filename
     * @param toothX     Optional tooth X coordinate
     * @param toothY     Optional tooth Y coordinate
     */
    suspend fun analyzeJaw(
        dicomBytes: ByteArray,
        fileName: String,
        contentType: String = "application/dicom",
        toothX: Int? = null,
        toothY: Int? = null
    ): AnalysisResponse {
        val response = client.submitFormWithBinaryData(
            url = buildString {
                append("$BASE_URL/analyze-jaw")
                val params = mutableListOf<String>()
                toothX?.let { params.add("tooth_x=$it") }
                toothY?.let { params.add("tooth_y=$it") }
                if (params.isNotEmpty()) {
                    append("?${params.joinToString("&")}")
                }
            },
            formData = formData {
                append("file", dicomBytes, Headers.build {
                    append(HttpHeaders.ContentType, contentType)
                    append(HttpHeaders.ContentDisposition, "filename=\"$fileName\"")
                })
            }
        ) {
            applyAuthHeader()
        }

        if (!response.status.isSuccess()) {
            val detail = runCatching { response.bodyAsText() }.getOrDefault("")
            throw Exception("Server error: ${response.status} ${detail.take(300)}")
        }

        return response.body()
    }

    suspend fun analyzePanoramic(
        dicomBytes: ByteArray,
        fileName: String,
        contentType: String = "application/dicom",
        toothX: Int? = null,
        toothY: Int? = null
    ): AnalysisResponse {
        val response = client.submitFormWithBinaryData(
            url = buildString {
                append("$BASE_URL/analyze-panoramic")
                val params = mutableListOf<String>()
                toothX?.let { params.add("tooth_x=$it") }
                toothY?.let { params.add("tooth_y=$it") }
                if (params.isNotEmpty()) {
                    append("?${params.joinToString("&")}")
                }
            },
            formData = formData {
                append("file", dicomBytes, Headers.build {
                    append(HttpHeaders.ContentType, contentType)
                    append(HttpHeaders.ContentDisposition, "filename=\"$fileName\"")
                })
            }
        ) {
            applyAuthHeader()
        }

        if (!response.status.isSuccess()) {
            val detail = runCatching { response.bodyAsText() }.getOrDefault("")
            throw Exception("Server error: ${response.status} ${detail.take(300)}")
        }

        return response.body()
    }

    suspend fun signup(email: String, password: String): AuthResponse {
        val response = client.post("$BASE_URL/auth/signup") {
            contentType(ContentType.Application.Json)
            setBody(AuthRequest(email = email, password = password))
        }
        if (!response.status.isSuccess()) {
            throw Exception("Auth error: ${response.status}")
        }
        return response.body()
    }

    suspend fun login(email: String, password: String): AuthResponse {
        val response = client.post("$BASE_URL/auth/login") {
            contentType(ContentType.Application.Json)
            setBody(AuthRequest(email = email, password = password))
        }
        if (!response.status.isSuccess()) {
            throw Exception("Auth error: ${response.status}")
        }
        return response.body()
    }

    fun setAuthToken(token: String?) {
        authToken = token
    }

    /**
     * Measure bone metrics at a specific coordinate on a cached session.
     */
    suspend fun measure(sessionId: String, x: Int, y: Int): MeasureResponse {
        val response = client.post("$BASE_URL/measure") {
            contentType(ContentType.Application.Json)
            setBody(MeasureRequest(sessionId = sessionId, x = x, y = y))
            applyAuthHeader()
        }

        if (!response.status.isSuccess()) {
            val detail = runCatching { response.bodyAsText() }.getOrDefault("")
            throw Exception("Server error: ${response.status} ${detail.take(300)}")
        }

        return response.body()
    }

    private fun HttpRequestBuilder.applyAuthHeader() {
        authToken?.takeIf { it.isNotBlank() }?.let { token ->
            header(HttpHeaders.Authorization, "Bearer $token")
        }
    }
}

