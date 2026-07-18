# ATS Uyumlu Typst CV

[Typst](https://typst.app/) ile hazırlanmış, herkese açık paylaşıma uygun tek sütunlu bir CV şablonu ve aynı şablonu tarayıcıda doldurup PDF olarak indirmeyi sağlayan basit bir CV oluşturucu.

> Canlı demo: `https://cv-template-steel.vercel.app/`

[English documentation](README.md)

## Özellikler

- Standart bölüm başlıklarına sahip ATS uyumlu tek sütunlu düzen
- Veri odaklı şablon: tasarım kodu yerine JSON dosyasını düzenleme
- Dinamik eğitim, deneyim, proje, yetenek, dil ve topluluk bölümleri
- Değiştirilebilir font ailesi, temel punto, yerleşim yoğunluğu ve vurgu rengi
- Başlık, çizgi, madde işareti, link ve ikonların tamamına uygulanan ortak renk
- Okunabilir 7.4 punto alt sınırına sahip isteğe bağlı tek sayfaya sığdırma
- Typst WebAssembly ile tamamen tarayıcıda PDF oluşturma
- Canlı önizleme ve tek tıkla PDF indirme
- Hesap, veritabanı veya sunucu taraflı kayıt olmadan yerel taslak saklama
- Tutarlı çıktı için projeye dahil edilmiş Inter ve JetBrains Mono yazı tipleri
- Vercel'da statik olarak yayınlanmaya hazır duyarlı arayüz

## Gizlilik

Web oluşturucu tamamen tarayıcıda çalışır. CV bilgileri yalnızca kullanılan tarayıcının yerel depolama alanında tutulur ve bu proje tarafından hiçbir sunucuya yüklenmez. Tarayıcı verilerini temizlemek kaydedilmiş taslağı da siler.

## Web oluşturucuyu yerelde çalıştırma

Gereksinim: Node.js 20 veya üzeri.

```bash
npm install
npm run dev
```

Üretim çıktısı oluşturmak için:

```bash
npm run build
```

Statik çıktı `dist/` klasörüne yazılır.

## Vercel'a yayınlama

1. Bu repoyu GitHub'a gönderin.
2. Repoyu Vercel'a aktarın.
3. Algılanan Vite ayarlarını koruyun veya şu değerleri kullanın:
   - Build komutu: `npm run build`
   - Çıktı klasörü: `dist`
4. Deploy işlemini başlatın.

Ortam değişkeni, API anahtarı, backend veya veritabanı gerekmez.

## Typst şablonunu doğrudan kullanma

[Typst CLI](https://github.com/typst/typst/releases) aracını kurun, `resume.example.json` dosyasını düzenleyin ve şu komutu çalıştırın:

```bash
typst compile --font-path fonts cv.typ resume.pdf
```

Homebrew ile kurulum:

```bash
brew install typst
```

Alternatif olarak `cv.typ`, `resume.example.json`, `fonts/` ve `icons/` dosyalarını [Typst web uygulamasına](https://typst.app/) yükleyebilirsiniz.

## CV bilgilerini özelleştirme

Örnek dosyadaki tüm değerler bilerek genel placeholder olarak hazırlanmıştır. `resume.example.json` içindeki alanları kendi bilgilerinizle değiştirin:

```json
{
  "name": "Adınız Soyadınız",
  "title": "Yazılım Mühendisi",
  "contact": {
    "email": "siz@example.com"
  }
}
```

Şu listelere istenen sayıda kayıt eklenebilir:

- `education`
- `experience`
- `projects`
- `skills`
- `additional`

Deneyim ve proje kayıtlarında istenen sayıda `bullets` maddesi bulunabilir. Her yetenek grubunda özel bir `category` adı ve istenen sayıda `items` yer alır. Bu nedenle Programlama, Backend, Tasarım, Bulut, Araçlar veya Diller gibi kategoriler tamamen dinamiktir.

CV vurgu rengini `theme.accent` alanından değiştirebilirsiniz:

```json
{
  "theme": {
    "accent": "#7E2A3B"
  }
}
```

Font ve yerleşim ayarları `layout` alanından yönetilir:

```json
{
  "layout": {
    "fontFamily": "Inter",
    "fontSize": 9.2,
    "density": "standard",
    "autoFit": true
  }
}
```

Projeye dahil edilmiş font seçenekleri `Inter` ve `JetBrains Mono`dur. Yerleşim yoğunluğu `standard`, `compact` veya `dense` olabilir. `autoFit` açıkken tarayıcı önce seçilen tasarımı korur. CV bir sayfayı aşarsa sıkı yerleşime geçer ve 7.4 puntonun altına inmeden tek sayfaya sığan en büyük puntoyu bulur. İçerik bu sınırda da birden fazla sayfaysa CV'yi okunamayacak kadar küçültmek yerine uyarı gösterir.

## Proje yapısı

```text
.
├── cv.typ                 # Typst tasarım ve çıktı mantığı
├── resume.example.json    # Herkese açık placeholder CV verisi
├── fonts/                 # CV yazı tipleri
├── icons/                 # Bölüm ve iletişim ikonları
├── src/                   # React web oluşturucu
├── vercel.json            # Statik Vercel ayarları
└── README.md              # İngilizce dokümantasyon
```

## ATS notları

Şablon tek okuma sütunu ve Summary, Education, Experience, Skills gibi yaygın başlıklar kullanır. İkonlar yalnızca dekoratif SVG'lerdir ve önemli bilgilerin yerine geçmez. İletişim bilgileri ve URL'ler PDF içinde gerçek metin olarak kalır.

Puntoyu küçültmek biraz daha uzun bir CV'yi sığdırabilir; ancak kısa ve sonuç odaklı içerik hem ATS hem okunabilirlik açısından daha güçlüdür. Tek sayfaya sığdırma seçeneği sınırsız içerik garantisi değil, güvenli bir yardımcıdır.

Ek kontrol için oluşturulan PDF'nin metin katmanını çıkarabilirsiniz:

```bash
pdftotext -layout resume.pdf -
```

Son PDF'yi başvuru yapacağınız sistemde ayrıca test edin. Hiçbir şablon tüm ATS sağlayıcılarında tamamen aynı ayrıştırmayı garanti edemez.

## Kullanılan projeler

- [Typst](https://github.com/typst/typst)
- Tarayıcı taraflı derleme için [typst.ts](https://github.com/Myriad-Dreamin/typst.ts)
- [Inter](https://github.com/rsms/inter) ve [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) yazı tipleri
- [Lucide](https://lucide.dev/) ikonları

Projeye dahil edilen yazı tipleri SIL Open Font License 1.1 altında dağıtılır. Telif bildirimleri ve lisans metni [`fonts/LICENSES.md`](fonts/LICENSES.md) içinde yer alır.

## Lisans

Bu proje MIT Lisansı ile sunulur. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.
