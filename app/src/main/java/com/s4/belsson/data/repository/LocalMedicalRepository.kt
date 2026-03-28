package com.s4.belsson.data.repository

import android.content.Context
import com.s4.belsson.data.local.AppDatabase
import com.s4.belsson.data.local.entity.CaseEntity
import com.s4.belsson.data.local.entity.MedicalReportEntity
import com.s4.belsson.data.local.entity.PatientEntity
import com.s4.belsson.data.model.AnalysisResponse
import com.s4.belsson.data.model.CaseAnalysisResponse
import kotlinx.coroutines.flow.Flow

class LocalMedicalRepository(context: Context) {
    private val database = AppDatabase.getInstance(context)
    private val patientDao = database.patientDao()
    private val reportDao = database.medicalReportDao()

    fun observePatients(): Flow<List<PatientEntity>> = patientDao.observeAll()

    fun observeReports(): Flow<List<MedicalReportEntity>> = reportDao.observeAll()

    fun observeReportsByPatient(patientId: Long): Flow<List<MedicalReportEntity>> =
        reportDao.observeByPatient(patientId)

    suspend fun addPatient(
        firstName: String,
        lastName: String,
        dob: String? = null,
        gender: String? = null,
        phone: String? = null,
        email: String? = null,
    ): Long {
        return patientDao.upsert(
            PatientEntity(
                firstName = firstName,
                lastName = lastName,
                dob = dob,
                gender = gender,
                phone = phone,
                email = email,
            )
        )
    }

    suspend fun updatePatient(
        patientId: Long,
        firstName: String,
        lastName: String,
        dob: String? = null,
        gender: String? = null,
        phone: String? = null,
        email: String? = null,
    ) {
        val existing = patientDao.getById(patientId) ?: return
        patientDao.update(
            existing.copy(
                firstName = firstName,
                lastName = lastName,
                dob = dob,
                gender = gender,
                phone = phone,
                email = email,
                updatedAt = System.currentTimeMillis(),
            )
        )
    }

    suspend fun deletePatient(patientId: Long) {
        patientDao.deleteById(patientId)
    }

    suspend fun upsertPatientFromAnalysis(analysis: AnalysisResponse): Long {
        val names = analysis.patientName.trim().split(" ").filter { it.isNotBlank() }
        val firstName = names.firstOrNull() ?: "Unknown"
        val lastName = names.drop(1).joinToString(" ").ifBlank { "Patient" }

        val remoteId = analysis.sessionId.takeIf { it.isNotBlank() }
        val existingByRemote = remoteId?.let { patientDao.getByRemoteId(it) }
        val existingByName = patientDao.getByName(firstName, lastName)
        val existing = existingByRemote ?: existingByName

        val entity = PatientEntity(
            id = existing?.id ?: 0,
            remotePatientId = existing?.remotePatientId ?: remoteId,
            firstName = firstName,
            lastName = lastName,
            updatedAt = System.currentTimeMillis(),
            createdAt = existing?.createdAt ?: System.currentTimeMillis()
        )

        val insertedId = patientDao.upsert(entity)
        return if (entity.id != 0L) entity.id else insertedId
    }

    suspend fun saveReport(patientId: Long, analysis: AnalysisResponse, pdfPath: String) {
        reportDao.upsert(
            MedicalReportEntity(
                patientId = patientId,
                sessionId = analysis.sessionId,
                workflow = analysis.workflow,
                scanRegion = analysis.scanRegion,
                safeHeightMm = analysis.boneMetrics.safeHeightMm,
                boneWidthMm = analysis.boneMetrics.widthMm,
                boneHeightMm = analysis.boneMetrics.heightMm,
                nerveDetected = analysis.ianDetected,
                recommendation = analysis.recommendationLine,
                pdfPath = pdfPath
            )
        )
    }

    suspend fun saveCaseFlowReport(case: CaseEntity?, analysis: CaseAnalysisResponse) {
        val firstName = case?.fname?.ifBlank { null } ?: "Patient"
        val lastName = case?.lname?.ifBlank { null } ?: "Case"
        val remoteId = case?.caseId

        val existingByRemote = remoteId?.let { patientDao.getByRemoteId(it) }
        val existingByName = patientDao.getByName(firstName, lastName)
        val existing = existingByRemote ?: existingByName

        val patientEntity = PatientEntity(
            id = existing?.id ?: 0,
            remotePatientId = existing?.remotePatientId ?: remoteId,
            firstName = firstName,
            lastName = lastName,
            updatedAt = System.currentTimeMillis(),
            createdAt = existing?.createdAt ?: System.currentTimeMillis(),
        )
        val patientId = patientDao.upsert(patientEntity).let { inserted ->
            if (patientEntity.id != 0L) patientEntity.id else inserted
        }

        val sessionId = "case-${analysis.caseId}-${analysis.createdAt}".takeIf { it.isNotBlank() }
            ?: "case-${System.currentTimeMillis()}"

        val toDoubleOrZero: (String?) -> Double = { it?.toDoubleOrNull() ?: 0.0 }

        reportDao.upsert(
            MedicalReportEntity(
                patientId = patientId,
                sessionId = sessionId,
                workflow = "case_flow",
                scanRegion = "mandible",
                safeHeightMm = toDoubleOrZero(analysis.safeImplantLength),
                boneWidthMm = toDoubleOrZero(analysis.boneWidth36),
                boneHeightMm = toDoubleOrZero(analysis.boneHeight),
                nerveDetected = !analysis.ianStatusMessage.isNullOrBlank(),
                recommendation = analysis.recommendationLine ?: analysis.patientExplanation ?: "-",
                pdfPath = "",
            )
        )
    }
}
