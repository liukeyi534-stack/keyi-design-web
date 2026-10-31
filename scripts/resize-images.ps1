$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = (Get-Item $PSScriptRoot).Parent.FullName
$sourceDir = Join-Path $projectRoot '..\..\个人网站2\简历&作品集'
# Resolve to absolute and verify
$sourceDir = (Resolve-Path $sourceDir).Path
$outDir = Join-Path $projectRoot 'public\archive\works'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$map = [ordered]@{
    'Frame 10.jpg' = 'warm-gift'
    'Frame 11.jpg' = 'orange-study'
    'Frame 15.jpg' = 'wet-street'
    'Frame 16.jpg' = 'footsteps'
    'Frame 17.jpg' = 'tea-ritual'
    'Frame 18.jpg' = 'in-the-clouds'
    'Frame 19.jpg' = 'color-pencil'
}

$targetWidth = 1800
$jpegQuality = 82L

foreach ($entry in $map.GetEnumerator()) {
    $src = Join-Path $sourceDir $entry.Key
    $slug = $entry.Value
    $dst = Join-Path $outDir ("{0}-01.jpg" -f $slug)

    if (-not (Test-Path $src)) { Write-Error ("Missing source: " + $src); continue }

    $img = [System.Drawing.Image]::FromFile($src)
    $srcW = $img.Width
    $srcH = $img.Height
    $ratio = $targetWidth / $srcW
    $newW = $targetWidth
    $newH = [int]([math]::Round($srcH * $ratio))

    $bmp = New-Object System.Drawing.Bitmap $newW, $newH
    $bmp.SetResolution(96, 96)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $newW, $newH)

    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $jpegQuality
    $encoderParams.Param[0] = $qualityParam

    $bmp.Save($dst, $codec, $encoderParams)
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()

    $info = Get-Item $dst
    Write-Output ("{0} -> {1} ({2}KB, {3}x{4})" -f $entry.Key, $info.Name, [int]($info.Length / 1024), $newW, $newH)
}
