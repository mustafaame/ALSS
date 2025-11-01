Add-Type -AssemblyName PresentationFramework

while ($true) {
    Write-Host "🔍 Checking for changes in project..."

    # نجيب التغييرات
    $changes = git status --porcelain

    if ($changes) {
        $changedFiles = ($changes -split "`n") -join ", "
        $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $message = "Auto Commit at $time | Files changed: $changedFiles"

        git add .
        git commit -m "$message"
        git push origin feature/upgrade-alss

        # إشعار مرئي
        [System.Windows.MessageBox]::Show("✅ Auto pushed to GitHub at $time`n`n$changedFiles", "ALSS Auto Push")

        # صوت تنبيه
        [console]::beep(1000, 300)
        [console]::beep(1300, 300)
        [console]::beep(1600, 300)

        Write-Host "✅ Auto push done at $time"
    } else {
        Write-Host "⚡ No changes detected. Waiting..."
    }

    # ننتظر دقيقتين
    Start-Sleep -Seconds 120
}
