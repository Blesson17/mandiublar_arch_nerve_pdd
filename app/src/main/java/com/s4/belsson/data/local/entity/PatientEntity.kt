package com.s4.belsson.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "patients",
    indices = [
        Index(value = ["remote_patient_id"], unique = true),
        Index(value = ["last_name", "first_name"]),
        Index(value = ["updated_at"])
    ]
)
data class PatientEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "remote_patient_id")
    val remotePatientId: String? = null,
    @ColumnInfo(name = "first_name")
    val firstName: String,
    @ColumnInfo(name = "last_name")
    val lastName: String,
    val dob: String? = null,
    val gender: String? = null,
    val phone: String? = null,
    val email: String? = null,
    @ColumnInfo(name = "created_at")
    val createdAt: Long = System.currentTimeMillis(),
    @ColumnInfo(name = "updated_at")
    val updatedAt: Long = System.currentTimeMillis()
)
