# ATS Uyumlu Typst CV

[Typst](https://typst.app/) ile hazırlanmış tek sütunlu bir CV şablonu ve aynı şablonu canlı olarak önizleyip PDF biçiminde dışa aktaran tarayıcı tabanlı bir düzenleyici.

> [Canlı demoyu açın](https://cv-template-steel.vercel.app/)

[English documentation](README.md)

## Özellikler

- Değiştirilebilir bölüm başlıklarına sahip ATS uyumlu tek sütunlu düzen
- Veri odaklı şablon: tasarım kodu yerine JSON dosyasını düzenleme
- Dinamik eğitim, deneyim, proje, yetenek, dil ve topluluk bölümleri
- Değiştirilebilir font ailesi, temel punto, yerleşim yoğunluğu ve vurgu rengi
- Başlık, çizgi, madde işareti, link ve ikonların tamamına uygulanan ortak renk
- Okunabilir 7.4 punto alt sınırına sahip isteğe bağlı tek sayfaya sığdırma
- Typst WebAssembly ile tamamen tarayıcıda PDF oluşturma
- Canlı önizleme ve tek tıkla PDF indirme
- Dil tercihini hatırlayan Türkçe ve İngilizce düzenleyici arayüzü
- Hesap, veritabanı veya sunucu taraflı kayıt olmadan yerel taslak saklama
- Deploy seviyesinde kullanım bilgileri için [Vercel Web Analytics](https://vercel.com/docs/analytics) entegrasyonu
- Tutarlı çıktı için projeye dahil edilmiş Inter ve JetBrains Mono yazı tipleri
- Vercel'da statik olarak yayınlanmaya hazır duyarlı arayüz

## Gizlilik

CV içeriği, oluşturulan belgeler ve kaydedilen taslaklar tarayıcıda kalır. Taslaklar yerel depolama alanında saklanır ve tarayıcının site verileri temizlenerek silinebilir. Yayındaki uygulamada Vercel Web Analytics bulunur; ancak uygulama CV form alanlarını veya oluşturulan belge içeriğini analytics olaylarına eklemez.

## Yerelde çalıştırma

GitHub üzerinde [kendi fork'unuzu oluşturun](https://github.com/hgunduzoglu/cv-template/fork) ve ardından yerel ortamınıza klonlayın. Node.js 20 veya üzeri gereklidir.

```bash
git clone https://github.com/<github-kullanici-adiniz>/cv-template.git
cd cv-template
npm install
npm run dev
```

Üretim çıktısı oluşturmak için:

```bash
npm run build
```

Statik çıktı `dist/` klasörüne yazılır.

## Kendi Vercel dağıtımınızı oluşturma

1. Repoyu [GitHub hesabınıza forklayın](https://github.com/hgunduzoglu/cv-template/fork).
2. Oluşturduğunuz fork'u yeni bir Vercel projesine aktarın.
3. Vercel'ın algıladığı Vite ayarlarını koruyun veya şu değerleri kullanın:
   - Build komutu: `npm run build`
   - Çıktı klasörü: `dist`
4. Projeyi yayınlayın.

Ortam değişkeni, API anahtarı, backend veya veritabanı gerekmez. Vercel Web Analytics desteği uygulamaya dahildir; yeni projede etkinleştirmek için Vercel'ın [Web Analytics başlangıç rehberini](https://vercel.com/docs/analytics/quickstart) izleyebilirsiniz.

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
  "sectionTitles": {
    "projects": "Seçili Çalışmalar",
    "additional": "Hobiler ve İlgi Alanları"
  },
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
- `customSections`

Deneyim ve proje kayıtlarında istenen sayıda `bullets` maddesi bulunabilir. Her yetenek grubunda özel bir `category` adı ve istenen sayıda `items` yer alır. Bu nedenle Programlama, Backend, Tasarım, Bulut, Araçlar veya Diller gibi kategoriler tamamen dinamiktir.

CV'de görünen tüm ana başlıklar `sectionTitles` üzerinden yeniden adlandırılabilir. Kullanılabilen anahtarlar `summary`, `education`, `experience`, `projects`, `skills` ve `additional` alanlarıdır. Aynı ayarlar tarayıcı düzenleyicisinde de bulunur; böylece örneğin Open Source & Volunteer bölümü, Typst kaynağı değiştirilmeden Hobiler ve İlgi Alanları olarak kullanılabilir.

`customSections` üzerinden CV'nin sonuna yeni bölümler eklenebilir. Her bölüm kendi başlığına ve istenen sayıda ad-açıklama kaydına sahiptir:

```json
{
  "customSections": [
    {
      "title": "Sertifikalar",
      "items": [
        {
          "name": "Mesleki Sertifika",
          "description": "Sertifikayı veren kurum · 2025"
        }
      ]
    }
  ]
}
```

EN/TR seçici yalnızca düzenleyici arayüzünü değiştirir. CV içeriği ve `language` alanı bağımsız kaldığı için şablon diğer Latin alfabeli dillerde de kullanılabilir.

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

## Hata bildirimleri ve katkılar

Hata bildirimleri, özellik talepleri, erişilebilirlik iyileştirmeleri, dokümantasyon düzeltmeleri ve diğer yapıcı öneriler memnuniyetle karşılanır. Uygun durumlarda açık bir açıklama, beklenen davranış ve tekrar üretme adımlarıyla birlikte [GitHub issue kaydı açabilirsiniz](https://github.com/hgunduzoglu/cv-template/issues/new).

Proje kod katkılarına da açıktır. Bir değişiklik önermek için:

1. Repoyu forklayın ve değişikliğe odaklanan ayrı bir branch oluşturun.
2. Herkese açık örnek verilere kişisel CV bilgileri eklemeden değişikliği uygulayın.
3. `npm run check` komutunu çalıştırın ve oluşturulan PDF'nin geçerli kaldığını doğrulayın.
4. Değişikliğin gerekçesini, uygulama biçimini ve kullanıcıya yansıyan davranış farklılıklarını açıklayan bir [pull request açın](https://github.com/hgunduzoglu/cv-template/pulls).

Dar kapsamlı ve kolay incelenebilir pull request'ler değişikliklerin tartışılmasını, test edilmesini ve projeye dahil edilmesini kolaylaştırır.

## Lisans

Bu proje MIT Lisansı ile sunulur. Ayrıntılar için [LICENSE](LICENSE) dosyasına bakın.
