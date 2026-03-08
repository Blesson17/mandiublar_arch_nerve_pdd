package com.s4.belsson.util

import android.content.Context
import android.graphics.*
import android.graphics.pdf.PdfDocument
import com.s4.belsson.data.model.AnalysisResponse
import com.s4.belsson.data.model.BoneMetrics
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

/**
 * Generates a PDF report summarising dental implant planning results.
 */
class ReportGenerator(private val context: Context) {

    companion object {
        private const val PAGE_WIDTH = 595   // A4 in points
        private const val PAGE_HEIGHT = 842
        private const val MARGIN = 40f
    }

    /**
     * Generate a PDF report and return the File.
     */
    fun generateReport(
        analysis: AnalysisResponse,
        opgBitmap: Bitmap?,
        toothLabel: String = "Tooth 36"
    ): File {
        val document = PdfDocument()

        val pageInfo = PdfDocument.PageInfo.Builder(PAGE_WIDTH, PAGE_HEIGHT, 1).create()
        val page = document.startPage(pageInfo)
        val canvas = page.canvas

        var y = MARGIN

        // ── Title ──
        val titlePaint = Paint().apply {
            color = Color.parseColor("#1565C0")
            textSize = 24f
            typeface = Typeface.DEFAULT_BOLD
            isAntiAlias = true
        }
        canvas.drawText("Dental Implant Planning Report", MARGIN, y + 24f, titlePaint)
        y += 50f

        // Divider
        val dividerPaint = Paint().apply {
            color = Color.parseColor("#1565C0")
            strokeWidth = 2f
        }
        canvas.drawLine(MARGIN, y, PAGE_WIDTH - MARGIN, y, dividerPaint)
        y += 20f

        // ── Patient Info ──
        val headerPaint = Paint().apply {
            color = Color.DKGRAY
            textSize = 14f
            typeface = Typeface.DEFAULT_BOLD
            isAntiAlias = true
        }
        val bodyPaint = Paint().apply {
            color = Color.DKGRAY
            textSize = 12f
            isAntiAlias = true
        }

        canvas.drawText("Patient Information", MARGIN, y, headerPaint)
        y += 20f
        canvas.drawText("Name: ${analysis.patientName}", MARGIN + 10f, y, bodyPaint)
        y += 18f
        val dateStr = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(Date())
        canvas.drawText("Report Date: $dateStr", MARGIN + 10f, y, bodyPaint)
        y += 18f
        canvas.drawText("Region: $toothLabel", MARGIN + 10f, y, bodyPaint)
        y += 30f

        // ── OPG Image ──
        if (opgBitmap != null) {
            canvas.drawText("Panoramic Radiograph (OPG)", MARGIN, y, headerPaint)
            y += 10f
            val imgWidth = (PAGE_WIDTH - 2 * MARGIN).toInt()
            val imgHeight = (imgWidth * opgBitmap.height / opgBitmap.width.toFloat()).toInt()
            val scaledBmp = Bitmap.createScaledBitmap(opgBitmap, imgWidth, imgHeight, true)
            canvas.drawBitmap(scaledBmp, MARGIN, y, null)
            y += imgHeight + 20f
        }

        // ── Bone Measurements ──
        canvas.drawText("Bone Measurements", MARGIN, y, headerPaint)
        y += 20f

        val metrics = analysis.boneMetrics
        val mm = MeasurementManager(
            pixelSpacingRow = analysis.metadata.pixelSpacing.getOrElse(0) { 1.0 },
            pixelSpacingCol = analysis.metadata.pixelSpacing.getOrElse(1) { 1.0 },
            sliceThickness = analysis.metadata.sliceThickness
        )

        y = drawMetricRow(canvas, y, "Bone Width", "${metrics.widthMm} mm", bodyPaint)
        y = drawMetricRow(canvas, y, "Bone Height", "${metrics.heightMm} mm", bodyPaint)
        y = drawMetricRow(canvas, y, "Safe Height (−2mm)", "${metrics.safeHeightMm} mm", bodyPaint)
        y = drawMetricRow(canvas, y, "Bone Density (est.)", "${metrics.densityEstimateHu} HU", bodyPaint)
        y += 10f

        // ── Safety Assessment ──
        val safety = mm.evaluateSafety(metrics.widthMm, metrics.heightMm)
        val safetyPaint = Paint().apply {
            textSize = 14f
            typeface = Typeface.DEFAULT_BOLD
            isAntiAlias = true
            color = when (safety) {
                MeasurementManager.SafetyLevel.SAFE -> Color.parseColor("#2E7D32")
                MeasurementManager.SafetyLevel.WARNING -> Color.parseColor("#F57F17")
                MeasurementManager.SafetyLevel.DANGER -> Color.parseColor("#C62828")
            }
        }
        canvas.drawText("Safety: ${safety.label}", MARGIN, y, safetyPaint)
        y += 30f

        // ── Nerve Path ──
        canvas.drawText("Inferior Alveolar Nerve", MARGIN, y, headerPaint)
        y += 20f
        val nerveInfo = "${analysis.nervePath.size} traced points"
        canvas.drawText(nerveInfo, MARGIN + 10f, y, bodyPaint)
        y += 18f

        if (analysis.nervePath.isNotEmpty()) {
            val first = analysis.nervePath.first()
            val last = analysis.nervePath.last()
            canvas.drawText(
                "Path range: (${first.x}, ${first.y}) → (${last.x}, ${last.y})",
                MARGIN + 10f, y, bodyPaint
            )
        }
        y += 30f

        // ── Footer ──
        val footerPaint = Paint().apply {
            color = Color.GRAY
            textSize = 10f
            isAntiAlias = true
        }
        canvas.drawText(
            "Generated by Belsson Dental Implant Planning System",
            MARGIN,
            PAGE_HEIGHT - MARGIN,
            footerPaint
        )

        document.finishPage(page)

        // Save to app files directory
        val reportsDir = File(context.filesDir, "reports").apply { mkdirs() }
        val file = File(reportsDir, "implant_report_${System.currentTimeMillis()}.pdf")
        FileOutputStream(file).use { document.writeTo(it) }
        document.close()

        return file
    }

    private fun drawMetricRow(
        canvas: Canvas, y: Float, label: String, value: String, paint: Paint
    ): Float {
        val labelPaint = Paint(paint).apply { typeface = Typeface.DEFAULT_BOLD }
        canvas.drawText("$label:", MARGIN + 10f, y, labelPaint)
        canvas.drawText(value, MARGIN + 200f, y, paint)
        return y + 18f
    }
}

