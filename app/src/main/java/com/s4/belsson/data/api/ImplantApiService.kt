package com.s4.belsson.data.api

import com.s4.belsson.data.model.AnalysisResponse
import com.s4.belsson.data.model.MeasureRequest
import com.s4.belsson.data.model.MeasureResponse
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

/**
 * Ktor-based API service for communicating with the
 * Dental Implant Planning FastAPI backend.
 */
object ImplantApiService {

    // For emulator use "10.0.2.2"; for physical device use your machine's LAN IP
    private const val BASE_URL = "http://10.0.2.2:8000"

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        prettyPrint = false
    }

    val client = HttpClient(Android) {
        install(ContentNegotiation) {
            json(json)
        }
        install(Logging) {
            level = LogLevel.BODY
            logger = Logger.ANDROID
        }
        engine {
            connectTimeout = 60_000
            socketTimeout = 120_000
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
                    append(HttpHeaders.ContentType, "application/dicom")
                    append(HttpHeaders.ContentDisposition, "filename=\"$fileName\"")
                })
            }
        )

        if (!response.status.isSuccess()) {
            throw Exception("Server error: ${response.status}")
        }

        return response.body()
    }

    /**
     * Measure bone metrics at a specific coordinate on a cached session.
     */
    suspend fun measure(sessionId: String, x: Int, y: Int): MeasureResponse {
        val response = client.post("$BASE_URL/measure") {
            contentType(ContentType.Application.Json)
            setBody(MeasureRequest(sessionId = sessionId, x = x, y = y))
        }

        if (!response.status.isSuccess()) {
            throw Exception("Server error: ${response.status}")
        }

        return response.body()
    }
}

