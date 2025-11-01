"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

export default function Quiz() {
  const questions = useMemo(() => ([
    {
      q: "أي رابط يبدو أكثر أمانًا؟",
      choices: [
        "http://secure.bank.com/login",
        "https://secure.bank.com/login",
        "http://192.168.1.50/login",
      ],
      a: 1,
      explain: "وجود HTTPS (مع شهادة موثوقة) أفضل من HTTP، لكن لا يزال يجب التحقق من اسم النطاق الصحيح.",
    },
    {
      q: "ما الخطوة الصحيحة قبل الضغط على رابط غير معروف؟",
      choices: [
        "الضغط بسرعة للتأكد",
        "التمرير بالفأرة لمعاينة العنوان الحقيقي",
        "إرسال الرابط للأصدقاء",
      ],
      a: 1,
      explain: "تمرير الفأرة (Hover) يُظهر العنوان الحقيقي في المتصفح ويساعد على كشف التصيد.",
    },
    {
      q: "أي سلوك آمن مع الملفات المرفقة؟",
      choices: [
        "فتح المرفق فورًا",
        "تحميل وتشغيل من جهاز العمل بدون فحص",
        "فحص الملف ببرنامج حماية أو بيئة معزولة أولًا",
      ],
      a: 2,
      explain: "افحص الملفات أولاً وتجنّب تشغيلها مباشرةً خصوصًا من مصادر غير موثوقة.",
    },
  ]), [])

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<null | { ok: boolean; msg: string }>(null)

  const current = questions[idx]

  function submit() {
    if (selected == null) return
    const ok = selected === current.a
    setResult({ ok, msg: ok ? "إجابة صحيحة!" : current.explain })
  }

  function next() {
    setSelected(null)
    setResult(null)
    setIdx((p) => (p + 1) % questions.length)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="font-semibold">اختبار سريع</div>
      <div>{current.q}</div>
      <div className="grid gap-2">
        {current.choices.map((c, i) => (
          <label key={i} className={`flex items-center gap-2 rounded-md border p-2 cursor-pointer ${selected === i ? 'border-primary' : 'border-border'}`}>
            <input
              type="radio"
              name={`q-${idx}`}
              checked={selected === i}
              onChange={() => setSelected(i)}
            />
            <span>{c}</span>
          </label>
        ))}
      </div>
      {!result && (
        <Button size="sm" onClick={submit} disabled={selected == null}>تحقق</Button>
      )}
      {result && (
        <div className={result.ok ? 'text-emerald-400' : 'text-amber-400'}>
          {result.msg}
        </div>
      )}
      {result && (
        <Button variant="secondary" size="sm" onClick={next}>سؤال آخر</Button>
      )}
    </div>
  )
}
