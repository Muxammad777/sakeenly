import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { KidsProvider } from "@/components/kids/KidsProvider";
import { MuallimLessonClient } from "@/components/kids/MuallimLessonClient";
import { findMuallimLesson } from "@/lib/kids/muallim";

interface PageProps { params: Promise<{ locale: Locale; lessonId: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, lessonId } = await params;
  const lesson = findMuallimLesson(lessonId);
  if (!lesson) return { title: "Muallim Sani" };
  const t = await getTranslations({ locale, namespace: "muallim" });
  const title = t(`${lesson.slug}_t` as never);
  return { title, description: t("hub_lede") };
}

export default async function MuallimLessonPage({ params }: PageProps) {
  const { locale, lessonId } = await params;
  setRequestLocale(locale);
  const lesson = findMuallimLesson(lessonId);
  if (!lesson) notFound();
  return <Content slug={lesson.slug} />;
}

function Content({ slug }: { slug: string }) {
  const t = useTranslations("muallim");
  return (
    <KidsProvider>
      <MuallimLessonClient
        slug={slug}
        labels={{
          back: t("lesson_back"),
          rule: t("lesson_rule_title"),
          practice: t("lesson_practice_title"),
          recite: t("lesson_recite_title"),
          reciteHint: t("lesson_recite_hint"),
          doneBtn: t("lesson_done_btn"),
          doneAgain: t("lesson_done_again"),
          mastered: t("lesson_mastered"),
          next: t("lesson_next"),
          prev: t("lesson_prev"),
          hint: t("lesson_hint"),
          lesson: t("hub_lesson"),
          // Mic + ASR labels
          micIdle: t("lesson_recite_title"),
          micRecording: t("lesson_recite_title"),
          micDone: t("lesson_done_again"),
          unsupported: "Этот браузер не поддерживает распознавание речи. Попробуй Chrome или Edge.",
          errNotAllowed: "🎙 Микрофон выключен. Разреши доступ к микрофону, потом попробуй снова.",
          errNoSpeech: "Я ничего не услышал — попробуй снова, говори громче.",
          errAudioCapture: "🎙 Микрофон не найден.",
          errNetwork: "Сеть недоступна — распознавание речи требует интернета.",
          errLangUnsupported: "Этот браузер не умеет распознавать арабский. Попробуй Chrome последней версии.",
          errOther: "Не удалось запустить распознавание.",
        }}
      />
    </KidsProvider>
  );
}
