# خادم محلي بسيط لموقع Luna Nail Studio
$root = 'C:\Users\elaff\OneDrive\Desktop\nails'
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://127.0.0.1:8080/')
$listener.Start()
Write-Host "SERVER_OK http://127.0.0.1:8080/"

$mimes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.png'  = 'image/png'
  '.webp' = 'image/webp'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = $ctx.Request.Url.LocalPath
    if ($rel -eq '/' -or $rel -eq '') { $rel = '/index.html' }
    $path = Join-Path $root ($rel.TrimStart('\'))
    if (Test-Path $path -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $ext = [System.IO.Path]::GetExtension($path).ToLower()
      $ctx.Response.ContentType = $mimes[$ext]
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.OutputStream.Close()
  } catch { }
}
