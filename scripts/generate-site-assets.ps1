param(
  [string]$OutputDir = "public/site"
)

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$target = Join-Path $root $OutputDir
New-Item -ItemType Directory -Path $target -Force | Out-Null

function New-Brush([System.Drawing.Color]$start, [System.Drawing.Color]$end, [int]$width, [int]$height) {
  return New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle(0, 0, $width, $height)),
    $start,
    $end,
    45
  )
}

function Draw-BrandMark([System.Drawing.Graphics]$graphics, [int]$size) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 5, 8, 7))

  $backgroundBrush = New-Brush ([System.Drawing.Color]::FromArgb(255, 11, 42, 29)) ([System.Drawing.Color]::FromArgb(255, 8, 14, 12)) $size $size
  $graphics.FillRectangle($backgroundBrush, 0, 0, $size, $size)
  $backgroundBrush.Dispose()

  $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(36, 64, 255, 156))
  $graphics.FillEllipse($glowBrush, $size * 0.08, $size * 0.08, $size * 0.84, $size * 0.84)
  $glowBrush.Dispose()

  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 64, 255, 156), [Math]::Max(2, $size * 0.06))
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($pen, $size * 0.16, $size * 0.16, $size * 0.68, $size * 0.68, 200, 270)
  $pen.Dispose()

  $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 209, 102))
  $dotSize = $size * 0.13
  $graphics.FillEllipse($dotBrush, $size * 0.67, $size * 0.2, $dotSize, $dotSize)
  $dotBrush.Dispose()

  $fontSize = [Math]::Max(10, $size * 0.26)
  $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 238, 245, 240))
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $layout = [System.Drawing.RectangleF]::new([float]0, [float]($size * 0.14), [float]$size, [float]($size * 0.58))
  $graphics.DrawString("AG", $font, $textBrush, $layout, $format)
  $format.Dispose()
  $textBrush.Dispose()
  $font.Dispose()
}

function Save-BrandPng([int]$size, [string]$path) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Draw-BrandMark $graphics $size
  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

function Save-BrandIco([int]$size, [string]$path) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  Draw-BrandMark $graphics $size
  $graphics.Dispose()
  $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
  $stream = [System.IO.File]::Open($path, [System.IO.FileMode]::Create)
  $icon.Save($stream)
  $stream.Dispose()
  $icon.Dispose()
  $bitmap.Dispose()
}

function Save-OgImage([string]$path) {
  $width = 1200
  $height = 630
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 5, 8, 7))

  $backgroundBrush = New-Brush ([System.Drawing.Color]::FromArgb(255, 7, 23, 17)) ([System.Drawing.Color]::FromArgb(255, 5, 8, 7)) $width $height
  $graphics.FillRectangle($backgroundBrush, 0, 0, $width, $height)
  $backgroundBrush.Dispose()

  $haloBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(42, 64, 255, 156))
  $graphics.FillEllipse($haloBrush, 710, 80, 360, 360)
  $graphics.FillEllipse($haloBrush, 850, 250, 220, 220)
  $haloBrush.Dispose()

  $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(232, 8, 14, 12))
  $cardRect = New-Object System.Drawing.RectangleF(70, 68, 1060, 494)
  $graphics.FillRectangle($cardBrush, $cardRect)
  $cardBrush.Dispose()

  $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(54, 255, 255, 255), 2)
  $graphics.DrawRectangle($borderPen, 70, 68, 1060, 494)
  $borderPen.Dispose()

  $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $titleFont = New-Object System.Drawing.Font("Segoe UI", 66, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $bodyFont = New-Object System.Drawing.Font("Segoe UI", 28, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $pillFont = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $lightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 238, 245, 240))
  $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 186, 197, 191))
  $greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 64, 255, 156))

  $titleRect = [System.Drawing.RectangleF]::new([float]120, [float]176, [float]620, [float]200)
  $bodyRect = [System.Drawing.RectangleF]::new([float]120, [float]398, [float]610, [float]110)
  $graphics.DrawString("AURA GLOBAL", $eyebrowFont, $greenBrush, [float]120, [float]124)
  $graphics.DrawString("Digital systems that turn traffic into clients.", $titleFont, $lightBrush, $titleRect)
  $graphics.DrawString("Websites, Google, paid traffic, AI and automations combined into one premium growth layer.", $bodyFont, $mutedBrush, $bodyRect)

  $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 64, 255, 156))
  $pillRect = New-Object System.Drawing.RectangleF(842, 420, 190, 58)
  $graphics.FillRectangle($pillBrush, $pillRect)
  $graphics.DrawString("Aura Global", $pillFont, (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 5, 19, 11))), 875, 436)
  $pillBrush.Dispose()

  $eyebrowFont.Dispose()
  $titleFont.Dispose()
  $bodyFont.Dispose()
  $pillFont.Dispose()
  $lightBrush.Dispose()
  $mutedBrush.Dispose()
  $greenBrush.Dispose()

  $graphics.Dispose()
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

$svg = @'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Aura Global">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b2a1d" />
      <stop offset="100%" stop-color="#08110c" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="#050807" />
  <rect x="8" y="8" width="112" height="112" rx="24" fill="url(#bg)" />
  <circle cx="64" cy="64" r="48" fill="rgba(64,255,156,0.12)" />
  <path d="M37 78c3-27 18-41 43-41 8 0 16 2 24 6" fill="none" stroke="#40ff9c" stroke-width="8" stroke-linecap="round" />
  <circle cx="93" cy="31" r="8" fill="#ffd166" />
  <text x="64" y="74" text-anchor="middle" fill="#eef5f0" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">AG</text>
</svg>
'@

Set-Content -Path (Join-Path $target "favicon.svg") -Value $svg -Encoding utf8
Save-BrandPng -size 32 -path (Join-Path $target "favicon-32.png")
Save-BrandPng -size 180 -path (Join-Path $target "apple-touch-icon.png")
Save-BrandPng -size 192 -path (Join-Path $target "icon-192.png")
Save-BrandPng -size 512 -path (Join-Path $target "icon-512.png")
Save-BrandIco -size 64 -path (Join-Path $target "favicon.ico")
Save-OgImage -path (Join-Path $target "og-image.png")

Write-Host "Site assets generated in $target"
