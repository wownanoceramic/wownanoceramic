$snippet = @'
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
'@

$publicPath = "C:\Projects\wownanoceramic\public"
$htmlFiles = Get-ChildItem -Path $publicPath -Recurse -Filter "*.html"

$modified = 0
$skipped = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    if ($content -match "/_vercel/insights/script.js") {
        Write-Host "SKIP: $($file.Name)"
        $skipped++
    } else {
        $newContent = $content.Replace('</head>', "$snippet`n</head>")
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "OK:   $($file.Name)"
        $modified++
    }
}

Write-Host ""
Write-Host "Modificate: $modified | Sarite: $skipped | Total: $($htmlFiles.Count)"
