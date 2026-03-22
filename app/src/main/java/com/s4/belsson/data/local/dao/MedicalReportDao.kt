package com.s4.belsson.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.s4.belsson.data.local.entity.MedicalReportEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MedicalReportDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(report: MedicalReportEntity): Long

    @Query("SELECT * FROM medical_reports WHERE patient_id = :patientId ORDER BY created_at DESC")
    fun observeByPatient(patientId: Long): Flow<List<MedicalReportEntity>>

    @Query("SELECT * FROM medical_reports ORDER BY created_at DESC")
    fun observeAll(): Flow<List<MedicalReportEntity>>
}
