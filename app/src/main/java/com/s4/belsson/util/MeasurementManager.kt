package com.s4.belsson.util

/**
 * Converts pixel distances to millimetres using DICOM (0028,0030) Pixel Spacing
 * and provides safety-margin evaluation for implant planning.
 *
 * @param pixelSpacingRow Row spacing in mm/pixel (from DICOM tag)
 * @param pixelSpacingCol Column spacing in mm/pixel (from DICOM tag)
 * @param sliceThickness  Slice thickness in mm (from DICOM tag)
 */
class MeasurementManager(
    private val pixelSpacingRow: Double,
    private val pixelSpacingCol: Double,
    private val sliceThickness: Double = 1.0
) {
    companion object {
        /** Standard safety margin above the Inferior Alveolar Nerve */
        const val SAFETY_MARGIN_MM = 2.0

        /** Minimum recommended bone width for standard implants */
        const val MIN_BONE_WIDTH_MM = 6.0

        /** Minimum recommended bone height for standard implants */
        const val MIN_BONE_HEIGHT_MM = 10.0
    }

    /**
     * Convert a horizontal pixel distance to millimetres.
     */
    fun pixelToMmHorizontal(px: Double): Double = px * pixelSpacingCol

    /**
     * Convert a vertical pixel distance to millimetres.
     */
    fun pixelToMmVertical(px: Double): Double = px * pixelSpacingRow

    /**
     * Convert a slice-direction pixel distance to millimetres.
     */
    fun pixelToMmDepth(px: Double): Double = px * sliceThickness

    /**
     * Convert millimetres to pixels (horizontal).
     */
    fun mmToPixelHorizontal(mm: Double): Double = mm / pixelSpacingCol

    /**
     * Convert millimetres to pixels (vertical).
     */
    fun mmToPixelVertical(mm: Double): Double = mm / pixelSpacingRow

    /**
     * Calculate the safe usable height by subtracting the 2mm safety margin
     * from the actual bone height above the IAN.
     */
    fun calculateSafeHeight(actualHeightMm: Double): Double {
        return maxOf(0.0, actualHeightMm - SAFETY_MARGIN_MM)
    }

    /**
     * Evaluate implant safety based on available bone dimensions.
     */
    fun evaluateSafety(widthMm: Double, heightMm: Double): SafetyLevel {
        val safeHeight = calculateSafeHeight(heightMm)
        return when {
            safeHeight < 8.0 || widthMm < 5.0 -> SafetyLevel.DANGER
            safeHeight < MIN_BONE_HEIGHT_MM || widthMm < MIN_BONE_WIDTH_MM -> SafetyLevel.WARNING
            else -> SafetyLevel.SAFE
        }
    }

    /**
     * Generate a human-readable measurement summary.
     */
    fun formatSummary(widthMm: Double, heightMm: Double): String {
        val safeHeight = calculateSafeHeight(heightMm)
        val safety = evaluateSafety(widthMm, heightMm)
        return buildString {
            appendLine("Bone Width:  ${"%.1f".format(widthMm)} mm")
            appendLine("Bone Height: ${"%.1f".format(heightMm)} mm")
            appendLine("Safe Height: ${"%.1f".format(safeHeight)} mm (−${SAFETY_MARGIN_MM}mm margin)")
            appendLine("Status:      ${safety.label}")
        }
    }

    enum class SafetyLevel(val label: String) {
        SAFE("✅ Safe for implant placement"),
        WARNING("⚠️ Marginal – consider narrow implant"),
        DANGER("🚫 Insufficient bone – augmentation needed")
    }
}

