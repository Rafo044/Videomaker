# 🧠 Antigravity Project Memory: Rafelune

> **MÜTLƏQ OXU (SƏRT XƏBƏRDARLIQ):** Hər sessiya başlanğıcında bu faylı oxumaq məcburidir. Hər hansı bir məlumatı dəyişdikdə, yeni funksiya əlavə etdikdə və ya kritik fəaliyyət yerinə yetirdikdə, həmin dəyişikliyi bu faylın "FƏALİYYƏT LOQU" bölməsinə qeyd etməlisən.

## 🛑 CRITICAL RULES (HEÇ VAXT UNUTMA)

1. **Long-form Looping (Hybrid Metod):** 
   - Layihənin ana məqsədi 1-2 saatlıq videoları **UCZ və STABİL** yaratmaqdır.
   - Remotion cəmi 5-10 dəqiqəlik "Baza Segment" render edir.
   - FFmpeg (`modal_app.py` daxilində) həmin segmenti `targetDuration` qədər loop edir.
   - **Xəta ehtimalı:** Loop olunan baza segmentin daxilində `EndScreen` (Sonluq Ekranı) OLMAMALIDIR.

2. **Modal Stability:**
   - `concurrency` 24-32 arası olmalıdır (64 serveri dondurur).
   - `REMOTION_LOG=error` mütləqdir (log spamı serveri dondurur).

3. **Prompt Integrity:**
   - JSON mütləq universal və təmiz olmalıdır (No markdown, no intro/outro).

4. **Branding:**
   - Layihənin adı: **Rafelune**.
   - Watermark həmişə rəsmi olaraq **"Rafelune"** yazılmalıdır (və ya dinamik `[Channel Name]` placeholderi istifadə edilməlidir).

## 📝 LESSONS LEARNED

- **Diqqətsizlik:** "Clean-up" zamanı vacib sahələri (Watermark) silmə.
- **Ziddiyyət:** Loop sistemində EndScreen təklif etmə.
- **File Management:** `.git` və `node_modules` qovluqlarını Modal deploy-da ignore et.

## 📜 FƏALİYYƏT LOQU (ACTION LOG)

- **[2026-01-23 22:25]**: Layihə adı "Rafelune" olaraq təsdiqləndi. `PROMPTS.md`-də vatermark yeniləndi. PROJECT_MEMORY faylına sərt xəbərdarlıq və loq sistemi əlavə edildi.
