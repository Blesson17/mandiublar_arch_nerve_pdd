package com.s4.belsson

import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.net.http.SslError
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.print.PrintAttributes
import android.print.PrintManager
import android.util.Base64
import android.view.View
import android.webkit.CookieManager
import android.webkit.DownloadListener
import android.webkit.JavascriptInterface
import android.webkit.SslErrorHandler
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import android.widget.RelativeLayout
import androidx.activity.ComponentActivity
import java.io.File
import java.io.FileOutputStream

// ─── JavaScript Bridge ──────────────────────────────────────────────────────────────────────────
class WebAppInterface(private val activity: MainActivity) {
    private val mainHandler = Handler(Looper.getMainLooper())

    /** Called from web → Android native share sheet */
    @JavascriptInterface
    fun share(text: String) {
        // Must dispatch to main thread — JS interface runs on a background thread
        mainHandler.post {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, text)
            }
            activity.startActivity(Intent.createChooser(intent, "Share via"))
        }
    }

    /** Called from web → Android native print dialog */
    @JavascriptInterface
    fun print() {
        mainHandler.post {
            activity.triggerPrint()
        }
    }

    /**
     * Called from web to download a base64-encoded blob (e.g. from html2pdf.js).
     * The web sends: "data:application/pdf;base64,<data>"
     */
    @JavascriptInterface
    fun downloadBase64(dataUrl: String, fileName: String) {
        mainHandler.post {
            try {
                // Strip "data:<mime>;base64," prefix
                val base64 = dataUrl.substringAfter(",")
                val bytes = Base64.decode(base64, Base64.DEFAULT)

                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                downloadsDir.mkdirs()
                val file = File(downloadsDir, fileName)
                FileOutputStream(file).use { it.write(bytes) }

                // Notify the user via system notification
                val dm = activity.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                // Scan the file so it appears in DownloadManager / Files app
                android.media.MediaScannerConnection.scanFile(
                    activity,
                    arrayOf(file.absolutePath),
                    arrayOf("application/pdf"),
                    null
                )
                android.widget.Toast.makeText(
                    activity,
                    "PDF saved to Downloads: $fileName",
                    android.widget.Toast.LENGTH_LONG
                ).show()
            } catch (e: Exception) {
                e.printStackTrace()
                android.widget.Toast.makeText(
                    activity,
                    "Download failed: ${e.message}",
                    android.widget.Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
}

// ─── MainActivity ───────────────────────────────────────────────────────────────────────────────
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_REQUEST = 1001

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // ── Build layout programmatically ─────────────────────────────────────
        val layout = RelativeLayout(this)

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            id = View.generateViewId()
            max = 100
            layoutParams = RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT, 8
            ).apply { addRule(RelativeLayout.ALIGN_PARENT_TOP) }
        }

        webView = WebView(this).apply {
            layoutParams = RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.MATCH_PARENT
            )
        }

        layout.addView(progressBar)
        layout.addView(webView)
        setContentView(layout)

        // ── WebView settings ──────────────────────────────────────────────────
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = true
            loadsImagesAutomatically = true
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
        }

        // ── Attach JS bridge ──────────────────────────────────────────────────
        webView.addJavascriptInterface(WebAppInterface(this), "Android")

        // ── WebViewClient ─────────────────────────────────────────────────────
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                return if (url.startsWith("https://impl.s4home.dpdns.org")) {
                    false // Stay in WebView
                } else {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    true
                }
            }

            override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: SslError) {
                handler.proceed()
            }
        }

        // ── WebChromeClient: progress bar + file upload ───────────────────────
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, newProgress: Int) {
                progressBar.progress = newProgress
                progressBar.visibility = if (newProgress == 100) View.GONE else View.VISIBLE
            }

            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback
                startActivityForResult(fileChooserParams.createIntent(), FILE_CHOOSER_REQUEST)
                return true
            }
        }

        // ── Download Listener ─────────────────────────────────────────────────
        webView.setDownloadListener(DownloadListener { url, userAgent, contentDisposition, mimeType, _ ->

            if (url.startsWith("blob:")) {
                // html2pdf.js and other libraries generate blob: URLs.
                // DownloadManager cannot handle these — convert via JS injection instead.
                val safeFileName = URLUtil.guessFileName(url, contentDisposition, mimeType)
                    .replace("'", "\\'")
                val js = """
                    javascript:(function() {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', '$url', true);
                        xhr.responseType = 'blob';
                        xhr.onload = function() {
                            var reader = new FileReader();
                            reader.onloadend = function() {
                                Android.downloadBase64(reader.result, '$safeFileName');
                            };
                            reader.readAsDataURL(xhr.response);
                        };
                        xhr.send();
                    })();
                """.trimIndent()
                webView.loadUrl(js)
                return@DownloadListener
            }

            // Standard HTTP/HTTPS download
            val cookies = CookieManager.getInstance().getCookie(url)
            val fileName = URLUtil.guessFileName(url, contentDisposition, mimeType)

            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setMimeType(mimeType)
                addRequestHeader("cookie", cookies)
                addRequestHeader("User-Agent", userAgent)
                setTitle(fileName)
                setDescription("Downloading $fileName…")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
            }

            val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
        })

        // ── Load or restore ───────────────────────────────────────────────────
        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl("https://impl.s4home.dpdns.org")
        }
    }

    /** Triggered by the JS bridge → runs on main thread */
    fun triggerPrint() {
        val printManager = getSystemService(Context.PRINT_SERVICE) as PrintManager
        val printAdapter = webView.createPrintDocumentAdapter("ImplantAI Report")
        printManager.print(
            "ImplantAI_PrintJob",
            printAdapter,
            PrintAttributes.Builder().build()
        )
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST) {
            val results = if (resultCode == Activity.RESULT_OK && data != null) {
                arrayOf(data.data ?: return)
            } else null
            fileUploadCallback?.onReceiveValue(results)
            fileUploadCallback = null
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}