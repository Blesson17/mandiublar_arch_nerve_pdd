package com.s4.belsson.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.s4.belsson.data.local.entity.PatientEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PatientDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(patient: PatientEntity): Long

    @Update
    suspend fun update(patient: PatientEntity)

    @Query("SELECT * FROM patients ORDER BY updated_at DESC")
    fun observeAll(): Flow<List<PatientEntity>>

    @Query("SELECT * FROM patients WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): PatientEntity?

    @Query("SELECT * FROM patients WHERE remote_patient_id = :remoteId LIMIT 1")
    suspend fun getByRemoteId(remoteId: String): PatientEntity?

    @Query(
        """
        SELECT * FROM patients
        WHERE LOWER(TRIM(first_name)) = LOWER(TRIM(:firstName))
          AND LOWER(TRIM(last_name)) = LOWER(TRIM(:lastName))
        LIMIT 1
        """
    )
    suspend fun getByName(firstName: String, lastName: String): PatientEntity?

    @Query("DELETE FROM patients WHERE id = :id")
    suspend fun deleteById(id: Long)
}
