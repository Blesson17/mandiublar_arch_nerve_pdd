package com.s4.belsson.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "medical_reports",
    foreignKeys = [
        ForeignKey(
            entity = PatientEntity::class,
            parentColumns = ["id"],
            childColumns = ["patient_id"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["patient_id"]),
        Index(value = ["session_id"], unique = true),
        Index(value = ["created_at"])
    ]
)
data class MedicalReportEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "patient_id")
    val patientId: Long,
    @ColumnInfo(name = "session_id")
    val sessionId: String,
    @ColumnInfo(name = "scan_region")
    val scanRegion: String,
    @ColumnInfo(name = "workflow")
    val workflow: String,
    @ColumnInfo(name = "safe_height_mm")
    val safeHeightMm: Double,
    @ColumnInfo(name = "bone_width_mm")
    val boneWidthMm: Double,
    @ColumnInfo(name = "bone_height_mm")
    val boneHeightMm: Double,
    @ColumnInfo(name = "nerve_detected")
    val nerveDetected: Boolean,
    @ColumnInfo(name = "recommendation")
    val recommendation: String,
    @ColumnInfo(name = "pdf_path")
    val pdfPath: String,
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis()
)
