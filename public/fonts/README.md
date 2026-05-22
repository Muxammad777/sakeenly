# Arabic fonts

Place the following two font files into this folder:

| File              | Source                                                                                              | Purpose                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `KFGQPC-Hafs.ttf` | <https://qurancomplex.gov.sa/en/techquran/dev/> (King Fahd Glorious Qur'an Printing Complex)        | Primary Mushaf typeface — pixel-perfect tashkeel, Hafs `an Asim recitation. |
| `Amiri-Regular.ttf` | <https://github.com/aliftype/amiri/releases> (SIL OFL)                                            | Fallback when KFGQPC is not available or for non-Mushaf contexts.        |

**Why not auto-download?**
KFGQPC's licence asks you to acknowledge the King Fahd Complex when redistributing — the files therefore live in the repo only after a human has read the licence.

After dropping the files in:

```bash
npm run dev
```

then visit any `/reader/*` page. The `ArabicText` component will pick up the fonts via `app/layout.tsx`'s `next/font/local`.
