while ($true) {
    Write-Host "🔄 Checking for changes..."
    
    # نضيف كل الملفات المعدلة
    git add .

    # نتحقق إذا في تغييرات قبل الكوميت
    $changes = git status --porcelain
    if ($changes) {
        $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $message = "auto commit - $time"
        git commit -m $message
        git push origin feature/upgrade-alss
        Write-Host "✅ Pushed at $time"
    } else {
        Write-Host "⚡ No changes detected"
    }

    # ننتظر دقيقتين قبل التكرار
    Start-Sleep -Seconds 120
}
