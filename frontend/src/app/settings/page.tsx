"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { lang, setLang } = useI18n()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Configure your preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Language</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant={lang === "en" ? "default" : "outline"}
              onClick={() => setLang("en")}
            >
              English
            </Button>
            <Button
              variant={lang === "ar" ? "default" : "outline"}
              onClick={() => setLang("ar")}
            >
              العربية
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Current: <span className="font-medium">{lang === "ar" ? "العربية" : "English"}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
