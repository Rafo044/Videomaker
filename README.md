# Remotion Pro Rendering Service

Bu servis, React mühərriki (Remotion) vasitəsilə yüksək keyfiyyətli, professional cinematic videoların avtomatlaşdırılmış şəkildə yaradılması üçün nəzərdə tutulub.

## Necə İstifadə Etməli?

Video yaratmaq üçün serverin `/render` endpoint-inə JSON request göndərmək lazımdır.

### 1. Video Sifarişi (POST /render)

`curl` vasitəsilə nümunə request:

```bash
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d @universal_template.json
```

**JSON Strukturunun İzahı:**
- `scenes`: Videonun hər bir hissəsi.
  - `images`: Həmin hissədə görünəcək şəkillərin siyahısı (massiv). Sistem onları avtomatik bərabər hissələrə bölərək göstərir.
  - `audio`: Həmin səhnənin səs yazısı (Voiceover).
  - `durationInSeconds`: Səhnənin ümumi müddəti.
  - `zoomDirection`: Şəkil hərəkəti (`in`, `out`, `left-to-right`, `right-to-left`, `still`).
- `backgroundMusic`: Fon musiqisi.
- `audioDucking`: `true` olarsa, səs (voiceover) gələndə musiqi avtomatik səssizləşir.

### 2. Statusun İzlənməsi (GET /status/:jobId)

Request göndərdikdən sonra sizə bənzərsiz bir `jobId` qaytarılır. Statusu belə yoxlaya bilərsiniz:

```bash
curl http://localhost:3000/status/{jobId}
```

### 3. Videonun Yüklənməsi (Download)

Status `completed` olduqda, cavabda sizə `videoUrl` veriləcək (məsələn: `http://localhost:3000/renders/{jobId}.mp4`).

Videonun fiziki olaraq yerləşdiyi qovluq:
/home/rafael/Documents/mindset/remotion_service/renders/

Videonun terminaldan `wget` və ya `curl` ilə yüklənməsi:
```bash
wget http://localhost:3000/renders/{jobId}.mp4
```

## Texnoloji Üstünlüklər
- **Jitter-Free Motion:** FFmpeg-dən fərqli olaraq, şəkillər böyüyərkən heç bir titrəmə olmur.
- **Cinematic Overlays:** Hər bir kadrda avtomatik olaraq Vignette və Film Grain teksturası tətbiq olunur.
- **Dynamic Content:** Səhnələrin uzunluğu və şəkil sayı dinamik olaraq hesablanır.
