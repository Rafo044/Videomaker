# Modal.com Deploy Təlimatı

Bu layihəni **Modal** platformasına deploy etmək üçün aşağıdakı addımları izləyin.

### 1. Secret-lərin Qurulması
Github Repository-nizdə (və ya `.env` faylınızda) aşağıdakı secret-ləri əlavə edin:
- `MODAL_TOKEN_ID`
- `MODAL_TOKEN_SECRET`

### 2. Deployment Script (CD/CI üçün nümunə)
Əgər Github Actions istifadə edirsinizsə, aşağıdakı addımı `.github/workflows/deploy.yml` faylına əlavə edə bilərsiniz:

```yaml
- name: Deploy to Modal
  run: |
    pip install modal
    modal token set --token-id ${{ secrets.MODAL_TOKEN_ID }} --token-secret ${{ secrets.MODAL_TOKEN_SECRET }}
    modal deploy modal_app.py
```

### 3. Yerli (Local) Deploy
Əgər öz kompyuterinizdə deploy etmək istəyirsinizsə:

```bash
# Modal kitabxanasını yükləyin
pip install modal

# Tokenləri qurun (yalnız bir dəfə)
modal token set --token-id SİZİN_TOKEN_ID --token-secret SİZİN_TOKEN_SECRET

# Proyekti deploy edin
modal deploy modal_app.py
```

### 4. Parametrlər Haqqında
`modal_app.py` faylında render sürətini artırmaq üçün aşağıdakı güclü konfiqurasiya tətbiq olunub:
- **CPU:** 16 Core (Parallel render üçün)
- **Memory:** 32GB RAM
- **Concurrency:** 16 (Remotion 16 kadrı eyni anda emal edir)
- **Timeout:** 20 dəqiqə (Uzun videolar üçün kifayətdir)

### 5. Web API Call
Deploy etdikdən sonra sizə bir URL veriləcək (məsələn: `https://rafael--remotion-video-service-api-render.modal.run`). Bu linkə `POST` request göndərərək videonu render edə bilərsiniz.

---
**Xətaların İdarəolunması:**
Script daxilində `try-except` blokları əlavə olunub. Əgər Remotion daxilində kadr renderi zamanı xəta baş verərsə (məsələn, şəkil linki tapılmazsa), Modal bunu `500 Internal Server Error` olaraq JSON formatında qaytaracaq.
