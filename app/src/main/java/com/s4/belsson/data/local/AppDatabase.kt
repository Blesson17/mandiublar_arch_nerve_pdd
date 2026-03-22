package com.s4.belsson.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.s4.belsson.data.local.dao.MedicalReportDao
import com.s4.belsson.data.local.dao.PatientDao
import com.s4.belsson.data.local.entity.MedicalReportEntity
import com.s4.belsson.data.local.entity.PatientEntity

@Database(
    entities = [PatientEntity::class, MedicalReportEntity::class],
    version = 1,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun patientDao(): PatientDao
    abstract fun medicalReportDao(): MedicalReportDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "belsson_local.db"
                ).fallbackToDestructiveMigration().build().also {
                    INSTANCE = it
                }
            }
        }
    }
}
