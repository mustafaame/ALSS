import { motion } from "framer-motion"
import { Shield, Link as LinkIcon, FileWarning } from "lucide-react"

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">التعلّم — أساسيات الأمان الرقمي</h1>
        <p className="text-muted-foreground mt-2">
          دليل سريع لفهم الروابط الآمنة، كشف التصيّد، والتعامل السليم مع الملفات.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 hover:shadow-brand/30 transition-shadow">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div className="font-semibold">HTTPS vs HTTP</div>
            </div>
            <p className="text-sm text-muted-foreground">
              يوفّر HTTPS قناة مشفّرة بينك وبين الموقع. تحقّق من القفل واسم النطاق الصحيح.
            </p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.05 }}>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 hover:shadow-brand/30 transition-shadow">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div className="font-semibold">التحقق من الروابط</div>
            </div>
            <p className="text-sm text-muted-foreground">
              مرّر المؤشّر على الرابط لمعاينة العنوان الحقيقي، وابتعد عن الروابط المختصرة من مصادر مجهولة.
            </p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }}>
          <div className="rounded-xl border border-border bg-card p-5 space-y-2 hover:shadow-brand/30 transition-shadow">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <FileWarning className="h-5 w-5" />
              </div>
              <div className="font-semibold">التعامل مع الملفات</div>
            </div>
            <p className="text-sm text-muted-foreground">
              افحص الملفات المرفقة قبل التشغيل، واستخدم بيئة معزولة للملفات المجهولة.
            </p>
          </div>
        </motion.div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">اختبر نفسك</h2>
        <QuizLazy />
      </section>
    </div>
  )
}

// Lazy client import to keep page light
// eslint-disable-next-line @next/next/no-sync-scripts
import dynamic from "next/dynamic"
const QuizLazy = dynamic(() => import("@/components/learn/quiz"), { ssr: false })
