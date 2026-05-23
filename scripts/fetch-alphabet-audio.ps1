# One-shot: download Arabic letter pronunciations via the unofficial
# Google Translate TTS endpoint (no API key, no quota). Run once, commit
# the resulting MP3s under public/audio/alphabet/.
# Glyphs are passed as Unicode code points to avoid Windows codepage
# mangling of the file source.
$ErrorActionPreference = "Stop"
$letters = @(
  @{ slug = "01-alif";    cp = 0x0627 }
  @{ slug = "02-ba";      cp = 0x0628 }
  @{ slug = "03-ta";      cp = 0x062A }
  @{ slug = "04-tha";     cp = 0x062B }
  @{ slug = "05-jim";     cp = 0x062C }
  @{ slug = "06-ha";      cp = 0x062D }
  @{ slug = "07-kha";     cp = 0x062E }
  @{ slug = "08-dal";     cp = 0x062F }
  @{ slug = "09-dhal";    cp = 0x0630 }
  @{ slug = "10-ra";      cp = 0x0631 }
  @{ slug = "11-zay";     cp = 0x0632 }
  @{ slug = "12-sin";     cp = 0x0633 }
  @{ slug = "13-shin";    cp = 0x0634 }
  @{ slug = "14-sad";     cp = 0x0635 }
  @{ slug = "15-dad";     cp = 0x0636 }
  @{ slug = "16-ta-emp";  cp = 0x0637 }
  @{ slug = "17-za-emp";  cp = 0x0638 }
  @{ slug = "18-ayn";     cp = 0x0639 }
  @{ slug = "19-ghayn";   cp = 0x063A }
  @{ slug = "20-fa";      cp = 0x0641 }
  @{ slug = "21-qaf";     cp = 0x0642 }
  @{ slug = "22-kaf";     cp = 0x0643 }
  @{ slug = "23-lam";     cp = 0x0644 }
  @{ slug = "24-mim";     cp = 0x0645 }
  @{ slug = "25-nun";     cp = 0x0646 }
  @{ slug = "26-ha-soft"; cp = 0x0647 }
  @{ slug = "27-waw";     cp = 0x0648 }
  @{ slug = "28-ya";      cp = 0x064A }
)

$outDir = "public\audio\alphabet"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

foreach ($l in $letters) {
  $glyph = [char][int]$l.cp
  $encoded = [System.Net.WebUtility]::UrlEncode($glyph)
  $url = "https://translate.google.com/translate_tts?ie=UTF-8" + "&" + "q=$encoded" + "&" + "tl=ar" + "&" + "client=tw-ob"
  $out = Join-Path $outDir "$($l.slug).mp3"
  Invoke-WebRequest -Uri $url -UserAgent "Mozilla/5.0" -OutFile $out -UseBasicParsing
  $size = (Get-Item $out).Length
  Write-Host "$($l.slug).mp3  $size bytes  (cp=$($l.cp))"
  Start-Sleep -Milliseconds 250
}

if (Test-Path "$outDir\_probe.mp3") { Remove-Item "$outDir\_probe.mp3" -Force }
$count = (Get-ChildItem $outDir).Count
Write-Host ""
Write-Host "Done. Total: $count files."
