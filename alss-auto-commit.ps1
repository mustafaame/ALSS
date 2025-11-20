# Auto Commit Script for ALSS Project
while ($true) {
    git add .
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto commit at $time"
    git push origin feature/upgrade-alss
    Write-Host "✅ Changes committed and pushed at $time"
    Start-Sleep -Seconds 60  # كل دقيقة
}
