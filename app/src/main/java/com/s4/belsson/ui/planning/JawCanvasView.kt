package com.s4.belsson.ui.planning

import android.graphics.Bitmap
import android.graphics.Matrix
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import com.s4.belsson.data.model.NervePathPoint

/**
 * Custom Compose Canvas that renders:
 *  1. The DICOM axial slice at native contrast
 *  2. Mandible outer contour (red, matching clinical reference)
 *  3. IAN nerve canal markers (orange dots)
 */
@Composable
fun JawCanvasView(
    opgBitmap: Bitmap?,
    nervePath: List<NervePathPoint>,
    archPath: List<NervePathPoint> = emptyList(),
    archControlPoints: List<Offset>? = null,
    onTap: ((x: Int, y: Int) -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val displayBitmap = remember(opgBitmap) {
        opgBitmap?.copy(Bitmap.Config.ARGB_8888, false)
    }

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures { offset ->
                    onTap?.invoke(offset.x.toInt(), offset.y.toInt())
                }
            }
    ) {
        val canvasW = size.width
        val canvasH = size.height

        // ── 1. Draw DICOM image ──────────────────────────────────────────
        var imgLeft = 0f
        var imgTop = 0f
        var imgScaleX = 1f
        var imgScaleY = 1f

        if (displayBitmap != null) {
            val bmpW = displayBitmap.width.toFloat()
            val bmpH = displayBitmap.height.toFloat()

            val scale = minOf(canvasW / bmpW, canvasH / bmpH)
            imgLeft = (canvasW - bmpW * scale) / 2f
            imgTop = (canvasH - bmpH * scale) / 2f
            imgScaleX = scale
            imgScaleY = scale

            drawIntoCanvas { canvas ->
                val matrix = Matrix()
                matrix.setScale(scale, scale)
                matrix.postTranslate(imgLeft, imgTop)

                // No brightness boost — the backend already normalises
                // to full 0-255 range with percentile stretch
                val paint = android.graphics.Paint().apply {
                    isAntiAlias = true
                    isFilterBitmap = true
                }
                canvas.nativeCanvas.drawBitmap(displayBitmap, matrix, paint)
            }
        }

        // ── 2. Mandible contour (red outline) ────────────────────────────
        if (archPath.size >= 4 && displayBitmap != null) {
            drawContour(
                points = archPath,
                scaleX = imgScaleX,
                scaleY = imgScaleY,
                offsetX = imgLeft,
                offsetY = imgTop,
                color = Color.Red,
                strokeWidth = 2.5f,
                closed = true
            )
        }

        // ── 3. Nerve canal markers (orange) ──────────────────────────────
        if (nervePath.isNotEmpty() && displayBitmap != null) {
            drawNerveMarkers(
                nervePath = nervePath,
                scaleX = imgScaleX,
                scaleY = imgScaleY,
                offsetX = imgLeft,
                offsetY = imgTop,
                color = Color(0xFFFF9800)
            )
        }
    }
}

// ──────────────────────────────────────────────────────────────────────────────

/**
 * Draw a smooth closed or open contour from DICOM-pixel points,
 * mapped into canvas coordinates.
 */
private fun DrawScope.drawContour(
    points: List<NervePathPoint>,
    scaleX: Float,
    scaleY: Float,
    offsetX: Float,
    offsetY: Float,
    color: Color,
    strokeWidth: Float,
    closed: Boolean
) {
    if (points.size < 2) return

    fun toCanvas(p: NervePathPoint) = Offset(
        p.x * scaleX + offsetX,
        p.y * scaleY + offsetY
    )

    val path = Path()
    val first = toCanvas(points[0])
    path.moveTo(first.x, first.y)

    for (i in 1 until points.size) {
        val pt = toCanvas(points[i])
        path.lineTo(pt.x, pt.y)
    }

    if (closed) path.close()

    drawPath(
        path = path,
        color = color,
        style = Stroke(width = strokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round)
    )
}

/**
 * Draw nerve canal locations as small filled circles with a subtle halo.
 */
private fun DrawScope.drawNerveMarkers(
    nervePath: List<NervePathPoint>,
    scaleX: Float,
    scaleY: Float,
    offsetX: Float,
    offsetY: Float,
    color: Color
) {
    fun toCanvas(p: NervePathPoint) = Offset(
        p.x * scaleX + offsetX,
        p.y * scaleY + offsetY
    )

    // Draw each nerve point as a small marker
    nervePath.forEach { pt ->
        val c = toCanvas(pt)
        // Outer halo
        drawCircle(color = color.copy(alpha = 0.3f), radius = 6f, center = c)
        // Inner dot
        drawCircle(color = color, radius = 3f, center = c)
    }

    // Connect nearby points with lines
    if (nervePath.size >= 2) {
        for (i in 0 until nervePath.size - 1) {
            val a = toCanvas(nervePath[i])
            val b = toCanvas(nervePath[i + 1])
            // Only connect if they are reasonably close (same canal cluster)
            val dist = kotlin.math.sqrt(
                (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)
            )
            if (dist < 30f * scaleX) {
                drawLine(color = color, start = a, end = b, strokeWidth = 2f, cap = StrokeCap.Round)
            }
        }
    }
}
