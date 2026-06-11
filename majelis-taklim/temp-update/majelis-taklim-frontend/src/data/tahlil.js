// ============================================================
// DATA TAHLIL & TAWASSUL LENGKAP
// Versi       : 2.2.0 — Final Production Release
// Audit       : 2026-06-06
// ============================================================
//
// SUMBER REFERENSI
// ─────────────────────────────────────────────────────────────
// Al-Qur'an   : Mushaf Al-Qur'an Standar Indonesia (Kemenag RI)
//               quran.nu.or.id (teks, harakat, terjemahan)
// Amaliyah NU : Buku Panduan Yasin & Tahlil, PBNU
//               Buku Yasin Tahlil dan Doa Lailatul Ijtima', LP Ma'arif NU
// Transliterasi: Sistem transliterasi NU (diadaptasi dari pedoman
//               transliterasi Arab–Latin Kemenag & LIPI):
//               - ذ  → dz    - ظ  → dh    - ض  → dl
//               - ش  → sy    - ص  → sh    - ث  → ts
//               - خ  → kh    - غ  → gh    - ق  → q
//               - ع  → ' (apostrof ASCII U+0027)
//               - hamzah → ' (apostrof ASCII U+0027)
//               - huruf panjang → aa / ii / uu (tidak memakai makron)
//
// SUMBER DATA AL-QUR'AN TERPUSAT (Single Source of Truth)
// Seluruh teks Al-Qur'an (Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas,
// Al-Baqarah 1–5, Ayat Kursi, Al-Baqarah 285–286) disimpan di
// objek QURAN dan direferensikan oleh TAWASSUL & TAHLIL.
// Tidak ada duplikasi teks Al-Qur'an di luar objek QURAN.
//
// PERUBAHAN DARI v2.0.0 → v2.1.0
// ─────────────────────────────────────────────────────────────
// [FIX-01] Al-Fatihah: "ladh-dhaalliiin" → "ladz-dzaalliin"
//          (konsistensi dz untuk ذ; hilangkan triple-i non-baku)
// [FIX-02] tw-cemandi: hapus arabisasi non-baku "بِيرُومْ ذِي سِيمَانْدِي"
//          dan "Biirum Dzis-Siimandii"; ganti redaksi Arab baku
// [FIX-03] tw-almarhum: nama Latin tidak lagi disisipkan ke teks Arab;
//          teks Arab tetap murni Arab; nama muncul di latin & terjemahan
// [FIX-04] th-doa-arwah: teks Arab tidak lagi disisipi nama Latin;
//          gunakan redaksi baku "وَلَا سِيَّمَا مَنْ ذَكَرْنَاهُمْ"
// [FIX-05] doaArwahLatin: "Allahummagfir" → "Allahummaghfir"
//
// PERUBAHAN DARI v2.1.0 → v2.1.1
// ─────────────────────────────────────────────────────────────
// [FIX-06] Komentar test alFatihah: "7 tanda ayah" → "6 tanda ayah"
//          (7 ayat dengan 6 tanda ۝ pemisah; assertion === 6 sudah benar)
// [FIX-07] Komentar test alBaqarahAkhir: "2 tanda ayah" → "1 tanda ayah"
//          (2 ayat (285–286) dengan 1 tanda ۝ pemisah; assert === 1 benar)
// [FIX-08] validateDataset: tambah validasi field ulang <= 0 dan
//          validasi struktur objek tidak valid (field wajib hilang)
//
// PERUBAHAN DARI v2.1.1 → v2.2.0
// ─────────────────────────────────────────────────────────────
// [FIX-09] tw-nabi terjemahan: "haribaan" → "hadirat"
//          (redaksi bahasa Indonesia baku dalam konteks tawassul)
// [FIX-10] Transliterasi ض konsisten → dl di seluruh file:
//          ayatKursi: "ardh" → "ardl" (2x)
//          tw-khulafa: "radhiyallaahu" → "radliyallaahu"
// [FIX-11] sanitizeInput: diperketat dengan pendekatan whitelist
//          (hanya huruf Unicode, spasi, titik, tanda hubung; max 60 kar)
// [ADD-01] DATASET_INFO: metadata versi, audit, sumber, standar
// [ADD-02] validateQuranReferences(): validasi eksistensi semua referensi Qur'an
// [ADD-03] getQuranFingerprint(): fingerprint berbasis jumlah karakter Arab
// [ADD-04] Test suite: tambah 3 test baru (validateQuranReferences,
//          getQuranFingerprint, sanitasi whitelist)
// ============================================================

// ============================================================
// SUMBER DATA AL-QUR'AN TERVALIDASI
// ============================================================
const QURAN = {
  basmalah: {
    arab: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ",
    latin: "Bismillaahirrahmaanirrahiim",
    terjemahan: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
  },

  // Al-Fatihah (QS 1: 1–7)
  alFatihah: {
    arab: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۝ اَلْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِيْنَ ۝ اَلرَّحْمَنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّيْنِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِيْنُ ۝ اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِيْنَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّيْنَ",
    latin: "Bismillaahirrahmaanirrahiim. Alhamdu lillaahi rabbil-aalamiin. Arrahmaanirrahiim. Maaliki yaumid-diin. Iyyaaka na'budu wa iyyaaka nasta'iin. Ihdinash-shiraathal mustaqiim. Shiraathal-ladziina an'amta alaihim ghairil-maghdluubi alaihim wa ladz-dzaalliin.",
    terjemahan: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam. Yang Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada Engkau kami menyembah dan hanya kepada Engkau kami mohon pertolongan. Tunjukilah kami jalan yang lurus, yaitu jalan orang-orang yang Engkau beri nikmat kepadanya, bukan jalan mereka yang dimurkai dan bukan pula jalan orang-orang yang sesat.",
  },

  // Al-Ikhlas (QS 112: 1–4)
  alIkhlas: {
    arab: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۝ قُلْ هُوَ اللهُ أَحَدٌ ۝ اَللهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
    latin: "Bismillaahirrahmaanirrahiim. Qul huwallahu ahad. Allaahush-shamad. Lam yalid wa lam yuulad. Wa lam yakul-lahuu kufuwan ahad.",
    terjemahan: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. Tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.",
  },

  // Al-Falaq (QS 113: 1–5)
  alFalaq: {
    arab: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    latin: "Bismillaahirrahmaanirrahiim. Qul a'uudzu birabbil-falaq. Min syarri maa khalaq. Wa min syarri ghaasiqin idzaa waqab. Wa min syarrin-naffaatsaati fil-uqad. Wa min syarri haasidin idzaa hasad.",
    terjemahan: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, Aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk yang Dia ciptakan, dari kejahatan malam apabila telah gelap gulita, dari kejahatan penyihir yang meniup pada buhul-buhul talinya, dan dari kejahatan orang yang dengki apabila dia dengki.",
  },

  // An-Nas (QS 114: 1–6)
  anNas: {
    arab: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    latin: "Bismillaahirrahmaanirrahiim. Qul a'uudzu birabbin-naas. Malikin-naas. Ilahin-naas. Min syarril-waswaasil-khannaas. Alladzii yuwaswisu fii shuduurin-naas. Minal-jinnati wan-naas.",
    terjemahan: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, Aku berlindung kepada Tuhannya manusia, Raja manusia, Sembahan manusia, dari kejahatan bisikan setan yang bersembunyi, yang membisikkan kejahatan ke dalam dada manusia, dari golongan jin dan manusia.",
  },

  // Al-Baqarah 1–5 (QS 2: 1–5)
  alBaqarahAwal: {
    arab: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ ۝ الٓمٓ ۝ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِيْنَ ۝ الَّذِيْنَ يُؤْمِنُوْنَ بِالْغَيْبِ وَيُقِيمُوْنَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُوْنَ ۝ وَالَّذِيْنَ يُؤْمِنُوْنَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُوْنَ ۝ أُولَٰئِكَ عَلَىٰ هُدًى مِّنْ رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُوْنَ",
    latin: "Bismillaahirrahmaanirrahiim. Alif laam miim. Dzaalikal-kitaabu laa raiba fiih, hudan lil-muttaqiin. Alladzii-na yu-minuuna bil-ghaibi wa yuqiimuunash-shalaata wa mimmaa razaqnaahum yunfiquun. Walladziina yu-minuuna bimaa unzila ilaika wa maa unzila min qablik, wa bil-aakhirati hum yuuqinuun. Ulaa-ika 'alaa hudan mir-rabbihim wa ulaa-ika humul-muflihuun.",
    terjemahan: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Alif Lam Mim. Kitab Al-Qur'an ini tidak ada keraguan di dalamnya; ia merupakan petunjuk bagi orang-orang yang bertakwa, yaitu orang-orang yang beriman kepada yang gaib, melaksanakan shalat, dan menginfakkan sebagian rezeki yang Kami berikan kepada mereka, dan mereka yang beriman kepada apa yang diturunkan kepadamu (Muhammad) dan apa yang diturunkan sebelummu, serta mereka yakin akan adanya akhirat. Merekalah yang mendapat petunjuk dari Tuhan mereka dan merekalah orang-orang yang beruntung.",
  },

  // Ayat Kursi (QS 2: 255)
  ayatKursi: {
    arab: "اَللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    latin: "Allaahu laa ilaaha illaa huw, al-hayyul-qayyuum, laa ta'khudzuhuu sinatuw wa laa nawm, lahuu maa fis-samaawaati wa maa fil-ardl, man dzal-ladzii yasyfa'u 'indahuu illaa bi-idznih, ya'lamu maa baina aidiihim wa maa khalfahum, wa laa yuhiithuuna bisyai-im min 'ilmihii illaa bimaa syaa', wasi'a kursiyyuhus-samaawaati wal-ardl, wa laa ya-uuduhuu hifdhuhumaa, wa huwal-'aliyyul-'azhiim.",
    terjemahan: "Allah, tidak ada tuhan selain Dia. Yang Maha Hidup, Yang terus-menerus mengurus makhluk-Nya, tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka, sedang mereka tidak mengetahui sesuatu pun dari ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat memelihara keduanya. Dia Maha Tinggi, Maha Besar.",
  },

  // Al-Baqarah 285–286 (QS 2: 285–286)
  alBaqarahAkhir: {
    arab: "ءَامَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ كُلٌّ ءَامَنَ بِاللهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    latin: "Aamanar-rasuulu bimaa unzila ilaihi mir-rabbihii wal-mu'minuun, kullun aamana billaahi wa malaa'ikatihii wa kutubihii wa rusulih, laa nufarriqu baina ahadim mir-rusulih, wa qaaluu sami'naa wa atha'naa, ghufroonaka rabbanaa wa ilaikal-mashiir. Laa yukallifullaahu nafsan illaa wus'ahaa, lahaa maa kasabat wa 'alaihaa maktasabat, rabbanaa laa tu-aakhidznaa in nasiinaa aw akhtha'naa, rabbanaa wa laa tahmil 'alainaa ishran kamaa hamaltahuu 'alal-ladziina min qablinaa, rabbanaa wa laa tuhammilanaa maa laa thaaqata lanaa bih, wa'fu 'annaa, waghfir lanaa, warhamnaa, anta mawlaanaa fanshurnaa 'alal-qaumil-kaafiriin.",
    terjemahan: "Rasul beriman kepada apa yang diturunkan kepadanya dari Tuhannya, demikian pula orang-orang yang beriman. Masing-masing beriman kepada Allah, malaikat-malaikat-Nya, kitab-kitab-Nya, dan rasul-rasul-Nya. Mereka berkata, Kami dengar dan kami taat. Ampunilah kami ya Tuhan kami, dan kepada-Mu tempat kami kembali. Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya. Dia mendapat pahala dari kebajikan yang dikerjakannya dan mendapat siksa dari kejahatan yang diperbuatnya. Mereka berdoa, Ya Tuhan kami, janganlah Engkau hukum kami jika kami lupa atau kami melakukan kesalahan. Ya Tuhan kami, janganlah Engkau bebani kami dengan beban yang berat sebagaimana Engkau bebankan kepada orang-orang sebelum kami. Ya Tuhan kami, janganlah Engkau pikulkan kepada kami apa yang tidak sanggup kami memikulnya. Maafkanlah kami, ampunilah kami, dan rahmatilah kami. Engkaulah pelindung kami, maka tolonglah kami dalam menghadapi orang-orang kafir.",
  },
}

// ============================================================
// METADATA DATASET
// ============================================================
export const DATASET_INFO = {
  version: "2.1.1",
  auditedAt: "2026-06",
  project: "Majelis Ta'lim Perum The Cemandi",
  quranSource: "Mushaf Al-Qur'an Standar Indonesia (Kemenag RI); quran.nu.or.id",
  tahlilReference: "Buku Panduan Yasin & Tahlil (PBNU); Buku Yasin Tahlil dan Doa Lailatul Ijtima' (LP Ma'arif NU)",
  transliterationStandard: "NU Popular Transliteration — ذ:dz, ظ:dh, ض:dl, ش:sy, ص:sh, ث:ts, خ:kh, غ:gh, ع:', hamzah:', panjang:aa/ii/uu",
}


const validateDataset = (dataset, label) => {
  const errors = []
  const seenIds = new Set()

  // Validasi struktur array
  if (!Array.isArray(dataset)) {
    errors.push(`[${label}]: dataset bukan array`)
    console.error(`[tahlil.js] Validasi gagal (${errors.length} error):`)
    errors.forEach((e) => console.error(" •", e))
    return false
  }

  dataset.forEach((item, idx) => {
    // Validasi struktur objek
    if (!item || typeof item !== "object") {
      errors.push(`[${label}][${idx}]: item bukan objek valid`)
      return
    }

    const loc = `[${label}][${idx}] id="${item.id}"`

    // ID kosong atau duplikat
    if (!item.id || !item.id.trim())
      errors.push(`${loc}: id kosong`)
    else if (seenIds.has(item.id))
      errors.push(`${loc}: id duplikat`)
    else
      seenIds.add(item.id)

    // Label wajib ada
    if (!item.label || !item.label.trim())
      errors.push(`${loc}: label kosong`)

    // Section node tidak butuh arab/latin/terjemahan
    if (item.jenis === "section") return

    // Arab kosong
    if (item.arab !== undefined && !item.arab.trim())
      errors.push(`${loc}: arab kosong`)

    // Latin kosong
    if (item.latin !== undefined && !item.latin.trim())
      errors.push(`${loc}: latin kosong`)

    // Terjemahan kosong
    if (item.terjemahan !== undefined && !item.terjemahan.trim())
      errors.push(`${loc}: terjemahan kosong`)

    // Nilai ulang tidak valid
    if (item.ulang !== undefined && (typeof item.ulang !== "number" || item.ulang <= 0))
      errors.push(`${loc}: ulang harus bilangan > 0 (ditemukan: ${item.ulang})`)

    // Karakter Unicode rusak
    if (item.arab && item.arab.includes("\uFFFD"))
      errors.push(`${loc}: karakter rusak (U+FFFD) di arab`)
    if (item.latin && item.latin.includes("\uFFFD"))
      errors.push(`${loc}: karakter rusak (U+FFFD) di latin`)

    // Periksa karakter kontrol tersembunyi
    const hasHidden = (str) =>
      str && /[\u200B\u200C\u200D\u200E\u200F\uFEFF]/.test(str) // eslint-disable-line no-misleading-character-class
    if (hasHidden(item.arab))        errors.push(`${loc}: karakter tersembunyi di arab`)
    if (hasHidden(item.latin))       errors.push(`${loc}: karakter tersembunyi di latin`)
    if (hasHidden(item.terjemahan))  errors.push(`${loc}: karakter tersembunyi di terjemahan`)

    // Teks Arab tidak boleh mengandung huruf Latin (kecuali section)
    if (item.arab && /[a-zA-Z]/.test(item.arab))
      errors.push(`${loc}: teks Arab mengandung huruf Latin`)
  })

  if (errors.length > 0) {
    console.error(`[tahlil.js] Validasi gagal (${errors.length} error):`)
    errors.forEach((e) => console.error(" •", e))
  }

  return errors.length === 0
}

// ============================================================
// VALIDASI REFERENSI QUR'AN
// ============================================================
export const validateQuranReferences = () => {
  const required = ["basmalah", "alFatihah", "alIkhlas", "alFalaq", "anNas",
                    "alBaqarahAwal", "ayatKursi", "alBaqarahAkhir"]
  const errors = []
  required.forEach(key => {
    if (!QURAN[key])
      errors.push(`QURAN.${key}: referensi tidak ditemukan`)
    else {
      if (!QURAN[key].arab  || !QURAN[key].arab.trim())  errors.push(`QURAN.${key}.arab kosong`)
      if (!QURAN[key].latin || !QURAN[key].latin.trim()) errors.push(`QURAN.${key}.latin kosong`)
      if (!QURAN[key].terjemahan || !QURAN[key].terjemahan.trim()) errors.push(`QURAN.${key}.terjemahan kosong`)
    }
  })
  if (errors.length > 0)
    errors.forEach(e => console.error("[tahlil.js] validateQuranReferences:", e))
  return { valid: errors.length === 0, errors }
}

// ============================================================
// INTEGRITY CHECK — Fingerprint berbasis jumlah karakter Arab
// ============================================================
export const getQuranFingerprint = () => {
  const keys = ["basmalah", "alFatihah", "alIkhlas", "alFalaq", "anNas",
                "alBaqarahAwal", "ayatKursi", "alBaqarahAkhir"]
  const counts = {}
  keys.forEach(key => {
    counts[key] = QURAN[key] ? QURAN[key].arab.length : 0
  })
  const total = keys.reduce((sum, k) => sum + counts[k], 0)
  return { perSurah: counts, totalChars: total }
}


const sanitizeInput = (str) => {
  let clean = String(str)
  // Hapus tag HTML/markup dan URL
  clean = clean.replace(/<[^>]*>/g, "")
  clean = clean.replace(/https?:\/\/[^\s]*/g, "")
  // Hanya izinkan: huruf Unicode, spasi, titik, tanda hubung
  // Mencakup nama dengan bin/binti secara otomatis (huruf biasa)
  clean = clean.replace(/[^\p{L}\s.-]/gu, "")
  // Normalisasi whitespace
  clean = clean.replace(/\s+/g, " ").trim()
  // Batasi panjang maksimal nama (60 karakter)
  return clean.substring(0, 60)
}

// ============================================================
// EXPORT: TAWASSUL
// ============================================================
export const TAWASSUL = (namaAlmarhum = []) => {
  const sanitized = namaAlmarhum.map(sanitizeInput).filter(Boolean)

  const base = [
    {
      id: "tw-basmalah",
      label: "Pembuka",
      arab: QURAN.basmalah.arab,
      latin: "Bismillaahirrahmaanirrahiim",
      terjemahan: "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.",
    },
    {
      id: "tw-nabi",
      label: "Tawassul kepada Nabi Muhammad SAW",
      arab: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى سَيِّدِنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَعَلَى آلِهِ وَأَزْوَاجِهِ وَذُرِّيَّاتِهِ وَأَصْحَابِهِ وَأَهْلِ بَيْتِهِ أَجْمَعِيْنَ",
      latin: "Ilaa hadlrati nabiyyil-mushthafaa sayyidinaa Muhammadin shallallaahu 'alaihi wa sallama wa 'alaa aalihii wa azwaajihii wa dzurriyyaatihii wa ash-haabihii wa ahli baitihii ajma'iin",
      terjemahan: "Kepada hadirat Nabi pilihan, junjungan kami Muhammad SAW, kepada keluarganya, istri-istrinya, keturunannya, para sahabatnya, dan ahli baitnya semua.",
    },
    {
      id: "tw-anbiya",
      label: "Tawassul kepada Para Nabi dan Rasul",
      arab: "وَإِلَى حَضَرَاتِ جَمِيعِ الأَنْبِيَاءِ وَالْمُرْسَلِيْنَ وَالْمَلَائِكَةِ الْمُقَرَّبِيْنَ وَحَمَلَةِ الْعَرْشِ الْعَظِيمِ",
      latin: "Wa ilaa hadlaraati jamii'il-anbiyaa-i wal-mursaliina wal-malaa-ikatul-muqarrabiin wa hamalatal-'arsyil-'azhiim",
      terjemahan: "Dan kepada seluruh Nabi dan Rasul, para malaikat yang didekatkan, dan para pemikul Arasy Yang Agung.",
    },
    {
      id: "tw-khulafa",
      label: "Tawassul kepada Khulafaur Rasyidin",
      arab: "وَإِلَى حَضَرَاتِ سَيِّدِنَا أَبِي بَكْرٍ الصِّدِّيقِ وَسَيِّدِنَا عُمَرَ بْنِ الْخَطَّابِ وَسَيِّدِنَا عُثْمَانَ بْنِ عَفَّانَ وَسَيِّدِنَا عَلِيِّ بْنِ أَبِي طَالِبٍ رَضِيَ اللهُ عَنْهُمْ أَجْمَعِيْنَ",
      latin: "Wa ilaa hadlaraati sayyidinaa Abi Bakris-Shiddiiq wa sayyidinaa Umaral-Khaththaab wa sayyidinaa 'Utsmaan ibni 'Affaan wa sayyidinaa 'Aliy ibni Abi Thaalib radliyallaahu 'anhum ajma'iin",
      terjemahan: "Dan kepada junjungan kami Abu Bakar As-Shiddiq, Umar bin Khattab, Utsman bin Affan, dan Ali bin Abi Thalib, semoga Allah meridhai mereka semua.",
    },
    {
      id: "tw-sahabat",
      label: "Tawassul kepada Para Sahabat",
      arab: "وَإِلَى حَضَرَاتِ جَمِيعِ أَصْحَابِ النَّبِيِّ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ أَجْمَعِيْنَ",
      latin: "Wa ilaa hadlaraati jamii'i ash-haabinnabiyyi shallallaahu 'alaihi wa sallama ajma'iin",
      terjemahan: "Dan kepada seluruh sahabat Nabi SAW semua.",
    },
    {
      id: "tw-auliya",
      label: "Tawassul kepada Para Wali dan Ulama",
      arab: "وَإِلَى حَضَرَاتِ الأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِيْنَ وَالْعُلَمَاءِ وَالْمَشَايِخِ الْعَارِفِيْنَ بِاللهِ تَعَالَى",
      latin: "Wa ilaa hadlaraatil-auliyaa-i wasy-syuhadaa-i wash-shaaliihiina wal-'ulamaa-i wal-masyaayikhil-'aarifiin billaahi ta'aalaa",
      terjemahan: "Dan kepada para wali, syuhada, orang-orang shaleh, ulama, dan masyayikh yang mengenal Allah Ta'ala.",
    },
    {
      id: "tw-guru",
      label: "Tawassul kepada Guru-guru",
      arab: "وَإِلَى أَرْوَاحِ مَشَايِخِنَا وَمَشَايِخِ مَشَايِخِنَا وَأَسَاتِذَتِنَا وَمَنْ أَحْسَنَ إِلَيْنَا",
      latin: "Wa ilaa arwaahi masyaayikhinaa wa masyaayikhi masyaayikhinaa wa asaatizatinaa wa man ahsana ilainaa",
      terjemahan: "Dan kepada arwah guru-guru kami, guru dari guru-guru kami, para pengajar kami, dan semua yang telah berbuat baik kepada kami.",
    },
    {
      id: "tw-ortu",
      label: "Tawassul kepada Orang Tua",
      arab: "وَإِلَى حَضَرَاتِ آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا مِنَ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ",
      latin: "Wa ilaa hadlaraati aabaa-inaa wa ummahaatinaa wa ajdaadinaa wa jaddaatinaa minal-muslimiin wal-muslimaat",
      terjemahan: "Dan kepada para bapak, ibu, kakek, dan nenek kami dari golongan muslimin dan muslimat.",
    },
    {
      id: "tw-cemandi",
      label: "Tawassul kepada Seluruh Jamaah Perum The Cemandi",
      arab: "وَإِلَى أَرْوَاحِ جَمِيعِ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ مِنْ أَهْلِ هَذِهِ الْمَنْطِقَةِ وَمَا حَوْلَهَا",
      latin: "Wa ilaa arwaahi jamii'il-muslimiin wal-muslimaat wal-mu'miniin wal-mu'minaat min ahli haadzihil-manthiqah wa maa haulahaa",
      terjemahan: "Dan kepada arwah seluruh muslimin, muslimat, mukminin, mukminat dari warga Perumahan The Cemandi dan sekitarnya.",
    },
  ]

  if (sanitized.length > 0) {
    base.push({
      id: "tw-almarhum",
      label: "Tawassul kepada Almarhum / Almarhumah",
      arab: "وَإِلَى أَرْوَاحِهِمْ رَحِمَهُمُ اللهُ",
      latin: "Wa ilaa arwaahi " + sanitized.join(", ") + " rahimahumullaah",
      terjemahan: "Dan kepada arwah " + sanitized.join(", ") + ", semoga Allah merahmati mereka.",
    })
  }

  base.push({
    id: "tw-fatihah",
    label: "Hadiahkan Al-Fatihah",
    arab: "شَيْءٌ لِلَّهِ لَهُمُ الْفَاتِحَةُ",
    latin: "Syai-un lillaahi lahumul-Faatihah",
    terjemahan: "Sesuatu karena Allah, untuk mereka, bacalah Al-Fatihah.",
    catatan: "Baca Al-Fatihah dalam hati",
  })

  if (import.meta.env.DEV) {
    validateDataset(base, "TAWASSUL")
  }

  return base
}

// ============================================================
// EXPORT: TAHLIL
// ============================================================
export const TAHLIL = (namaAlmarhum = []) => {
  const sanitized = namaAlmarhum.map(sanitizeInput).filter(Boolean)

  const doaArwahTerjemahan =
    "Ya Allah, ampunilah muslimin dan muslimat, mukminin dan mukminat yang masih hidup maupun yang sudah wafat, dari timur bumi hingga baratnya" +
    (sanitized.length > 0 ? ", khususnya " + sanitized.join(", ") : "") +
    ". Sesungguhnya Engkau Maha Mendengar, Maha Dekat, Maha Mengabulkan doa."

  const doaArwahArab =
    "اَللَّهُمَّ اغْفِرْ لِلْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ الأَحْيَاءِ مِنْهُمْ وَالأَمْوَاتِ مِنَ مَشَارِقِ الأَرْضِ إِلَى مَغَارِبِهَا " +
    (sanitized.length > 0 ? "وَلَا سِيَّمَا مَنْ ذَكَرْنَاهُمْ " : "") +
    "إِنَّكَ سَمِيعٌ قَرِيبٌ مُجِيبُ الدَّعَوَاتِ"

  const doaArwahLatin =
    "Allahummaghfir lil-muslimiin wal-muslimaati wal-mu'miniina wal-mu'minaatil-ahyaa-i minhum wal-amwaat" +
    (sanitized.length > 0 ? " wa laa siyyamaa " + sanitized.join(", ") + " " : " ") +
    "innaka samii'un qariibun mujiibud-da'awaat"

  const data = [
    {
      id: "th-tawassul-note",
      label: "Tawassul",
      jenis: "section",
      catatan: "Baca Tawassul lengkap (lihat menu Tawassul)",
    },
    {
      id: "th-fatihah",
      label: "Al-Fatihah (1x)",
      arab: QURAN.alFatihah.arab,
      latin: QURAN.alFatihah.latin,
      terjemahan: QURAN.alFatihah.terjemahan,
      ulang: 1,
    },
    {
      id: "th-ikhlas",
      label: "Al-Ikhlas (3x)",
      arab: QURAN.alIkhlas.arab,
      latin: QURAN.alIkhlas.latin,
      terjemahan: QURAN.alIkhlas.terjemahan,
      ulang: 3,
    },
    {
      id: "th-falaq",
      label: "Al-Falaq (1x)",
      arab: QURAN.alFalaq.arab,
      latin: QURAN.alFalaq.latin,
      terjemahan: QURAN.alFalaq.terjemahan,
      ulang: 1,
    },
    {
      id: "th-nas",
      label: "An-Nas (1x)",
      arab: QURAN.anNas.arab,
      latin: QURAN.anNas.latin,
      terjemahan: QURAN.anNas.terjemahan,
      ulang: 1,
    },
    {
      id: "th-baqarah-awal",
      label: "Awal Al-Baqarah (Ayat 1-5)",
      arab: QURAN.alBaqarahAwal.arab,
      latin: QURAN.alBaqarahAwal.latin,
      terjemahan: QURAN.alBaqarahAwal.terjemahan,
      ulang: 1,
    },
    {
      id: "th-ayat-kursi",
      label: "Ayat Kursi (1x)",
      arab: QURAN.ayatKursi.arab,
      latin: QURAN.ayatKursi.latin,
      terjemahan: QURAN.ayatKursi.terjemahan,
      ulang: 1,
    },
    {
      id: "th-baqarah-akhir",
      label: "Akhir Al-Baqarah (Ayat 285-286)",
      arab: QURAN.alBaqarahAkhir.arab,
      latin: QURAN.alBaqarahAkhir.latin,
      terjemahan: QURAN.alBaqarahAkhir.terjemahan,
      ulang: 1,
    },
    {
      id: "th-istighfar",
      label: "Istighfar (3x)",
      arab: "أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      latin: "Astaghfirullaahal-'azhiimalladzii laa ilaaha illaa huwal-hayyul-qayyuumu wa atuubu ilaih",
      terjemahan: "Aku memohon ampun kepada Allah Yang Maha Agung, yang tiada tuhan selain Dia, Yang Maha Hidup, Yang terus-menerus mengurus makhluk-Nya, dan aku bertobat kepada-Nya.",
      ulang: 3,
    },
    {
      id: "th-tahlil-100",
      label: "Tahlil (100x)",
      arab: "لَا إِلَهَ إِلَّا اللهُ",
      latin: "Laa ilaaha illallaah",
      terjemahan: "Tiada tuhan selain Allah.",
      ulang: 100,
      besar: true,
    },
    {
      id: "th-tasbih",
      label: "Tasbih (33x)",
      arab: "سُبْحَانَ اللهِ",
      latin: "Subhaanallaah",
      terjemahan: "Maha Suci Allah.",
      ulang: 33,
    },
    {
      id: "th-tahmid",
      label: "Tahmid (33x)",
      arab: "اَلْحَمْدُ لِلَّهِ",
      latin: "Alhamdulillaah",
      terjemahan: "Segala puji bagi Allah.",
      ulang: 33,
    },
    {
      id: "th-takbir",
      label: "Takbir (34x)",
      arab: "اَللهُ أَكْبَرُ",
      latin: "Allaahu akbar",
      terjemahan: "Allah Maha Besar.",
      ulang: 34,
    },
    {
      id: "th-shalawat",
      label: "Shalawat Ibrahimiyah",
      arab: "اَللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ فِي الْعَالَمِيْنَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
      latin: "Allahumma shalli 'alaa sayyidinaa Muhammadin wa 'alaa aali sayyidinaa Muhammadin kamaa shallaita 'alaa sayyidinaa Ibraahiima wa 'alaa aali sayyidinaa Ibraahiim, wa baarik 'alaa sayyidinaa Muhammadin wa 'alaa aali sayyidinaa Muhammadin kamaa baarakta 'alaa sayyidinaa Ibraahiima wa 'alaa aali sayyidinaa Ibraahiima fil-'aalamiina innaka hamiidun majiid",
      terjemahan: "Ya Allah, berikanlah rahmat kepada junjungan kami Muhammad dan kepada keluarga junjungan kami Muhammad, sebagaimana Engkau telah memberikan rahmat kepada junjungan kami Ibrahim dan keluarganya. Berkatilah junjungan kami Muhammad dan keluarga junjungan kami Muhammad, sebagaimana Engkau telah memberkati junjungan kami Ibrahim dan keluarganya di seluruh alam. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.",
      ulang: 1,
    },
    {
      id: "th-hauqalah",
      label: "Hauqalah (10x)",
      arab: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيمِ",
      latin: "Laa hawla wa laa quwwata illaa billaahil-'aliyyil-'azhiim",
      terjemahan: "Tiada daya dan tiada kekuatan kecuali dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.",
      ulang: 10,
    },
    {
      id: "th-tahlil-penutup",
      label: "Tahlil Penutup",
      arab: "لَا إِلَهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ",
      latin: "Laa ilaaha illallaahu Muhammadur-rasuulullaahi shallallaahu 'alaihi wa sallam",
      terjemahan: "Tiada tuhan selain Allah, Muhammad adalah utusan Allah SAW.",
      ulang: 1,
      besar: true,
    },
    {
      id: "th-doa-tahlil",
      label: "Doa Tahlil",
      arab: "اَللَّهُمَّ إِنَّا نَسْأَلُكَ سَلَامَةً فِي الدِّيْنِ وَعَافِيَةً فِي الْجَسَدِ وَزِيَادَةً فِي الْعِلْمِ وَبَرَكَةً فِي الرِّزْقِ وَتَوْبَةً قَبْلَ الْمَوْتِ وَرَحْمَةً عِنْدَ الْمَوْتِ وَمَغْفِرَةً بَعْدَ الْمَوْتِ",
      latin: "Allahumma innaa nas-aluka salaamatan fid-diini wa 'aafiyatan fil-jasadi wa ziyaadatan fil-'ilmi wa barakatan fir-rizqi wa tawbatan qablal-mawti wa rahmatan 'indal-mawti wa maghfiratan ba'dal-mawt",
      terjemahan: "Ya Allah, sesungguhnya kami memohon kepada-Mu keselamatan dalam agama, kesehatan pada badan, tambahan ilmu, keberkahan rezeki, taubat sebelum mati, rahmat saat menghadapi kematian, dan ampunan setelah mati.",
      ulang: 1,
    },
    {
      id: "th-doa-arwah",
      label: "Doa untuk Arwah",
      arab: doaArwahArab,
      latin: doaArwahLatin,
      terjemahan: doaArwahTerjemahan,
      ulang: 1,
    },
    {
      id: "th-penutup",
      label: "Doa Penutup",
      arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ ۝ سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُوْنَ وَسَلَامٌ عَلَى الْمُرْسَلِيْنَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِيْنَ",
      latin: "Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa 'adzaaban-naar. Subhaana rabbika rabbil-'izzati 'ammaa yashifuun, wa salaamun 'alal-mursaliin, wal-hamdu lillaahi rabbil-'aalamiin.",
      terjemahan: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka. Maha Suci Tuhanmu dari apa yang mereka sifatkan. Salam atas para rasul. Segala puji bagi Allah, Tuhan semesta alam.",
      ulang: 1,
    },
  ]

  if (import.meta.env.DEV) {
    validateDataset(data, "TAHLIL")
  }

  return data
}

// ============================================================
// TEST SUITE OTOMATIS
// Jalankan: node --experimental-vm-modules tahlil.test.js
// Atau impor dan panggil: runTahlilTests()
// ============================================================
export const runTahlilTests = () => {
  const results = []
  let passed = 0
  let failed = 0

  const test = (name, fn) => {
    try {
      fn()
      results.push({ name, status: "PASS" })
      passed++
    } catch (e) {
      results.push({ name, status: "FAIL", error: e.message })
      failed++
    }
  }

  const assert = (condition, message) => {
    if (!condition) throw new Error(message)
  }

  const tawassul = TAWASSUL([])
  const tahlil   = TAHLIL([])

  // ── 1. Integrity Tests ─────────────────────────────────────
  test("TAWASSUL: semua item memiliki id", () => {
    tawassul.forEach((item, i) => assert(item.id && item.id.trim(), `Item ${i} tidak memiliki id`))
  })
  test("TAHLIL: semua item memiliki id", () => {
    tahlil.forEach((item, i) => assert(item.id && item.id.trim(), `Item ${i} tidak memiliki id`))
  })
  test("TAWASSUL: semua item memiliki label", () => {
    tawassul.forEach((item, i) => assert(item.label && item.label.trim(), `Item ${i} tidak memiliki label`))
  })
  test("TAHLIL: semua item memiliki label", () => {
    tahlil.forEach((item, i) => assert(item.label && item.label.trim(), `Item ${i} tidak memiliki label`))
  })
  test("TAHLIL: semua item non-section memiliki ulang > 0", () => {
    tahlil.forEach((item, i) => {
      if (item.jenis !== "section" && item.ulang !== undefined)
        assert(item.ulang > 0, `Item ${i} (${item.id}) ulang <= 0`)
    })
  })

  // ── 2. Duplicate ID Tests ──────────────────────────────────
  test("TAWASSUL: tidak ada id duplikat", () => {
    const ids = tawassul.map(i => i.id)
    const unique = new Set(ids)
    assert(ids.length === unique.size, `Duplikat: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`)
  })
  test("TAHLIL: tidak ada id duplikat", () => {
    const ids = tahlil.map(i => i.id)
    const unique = new Set(ids)
    assert(ids.length === unique.size, `Duplikat: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`)
  })

  // ── 3. Unicode Validation Tests ────────────────────────────
  const HIDDEN_RE = /[\u200B\u200C\u200D\u200E\u200F\uFEFF]/  // eslint-disable-line no-misleading-character-class
  const BROKEN_RE = /\uFFFD/
  const allItems  = [...tawassul, ...tahlil]

  test("Tidak ada karakter tersembunyi di seluruh item", () => {
    allItems.forEach(item => {
      ["arab", "latin", "terjemahan"].forEach(field => {
        if (item[field]) assert(!HIDDEN_RE.test(item[field]),
          `${item.id}.${field}: karakter tersembunyi ditemukan`)
      })
    })
  })
  test("Tidak ada karakter rusak (U+FFFD) di seluruh item", () => {
    allItems.forEach(item => {
      ["arab", "latin", "terjemahan"].forEach(field => {
        if (item[field]) assert(!BROKEN_RE.test(item[field]),
          `${item.id}.${field}: karakter rusak U+FFFD ditemukan`)
      })
    })
  })

  // ── 4. Data Consistency Tests ──────────────────────────────
  test("QURAN.alFatihah: mengandung 6 tanda ayah (۝)", () => {
    assert((QURAN.alFatihah.arab.match(/۝/g) || []).length === 6,
      "Al-Fatihah harus mengandung 6 tanda ۝ (7 ayat, 6 pemisah antar ayat)")
  })
  test("QURAN.alIkhlas: mengandung 4 tanda ayah (۝)", () => {
    assert((QURAN.alIkhlas.arab.match(/۝/g) || []).length === 4,
      "Al-Ikhlas harus mengandung 4 tanda ۝ (basmalah + 4 ayat)")
  })
  test("QURAN.alBaqarahAwal: mengandung 5 tanda ayah (۝)", () => {
    assert((QURAN.alBaqarahAwal.arab.match(/۝/g) || []).length === 5,
      "Al-Baqarah 1-5 harus mengandung 5 tanda ۝")
  })
  test("QURAN.alBaqarahAkhir: mengandung 1 tanda ayah (۝)", () => {
    assert((QURAN.alBaqarahAkhir.arab.match(/۝/g) || []).length === 1,
      "Al-Baqarah 285-286 harus mengandung 1 tanda ۝ (pemisah antara ayat 285 dan 286)")
  })
  test("TAHLIL: urutan ID sesuai runtunan", () => {
    const expectedOrder = [
      "th-tawassul-note", "th-fatihah", "th-ikhlas", "th-falaq", "th-nas",
      "th-baqarah-awal", "th-ayat-kursi", "th-baqarah-akhir",
      "th-istighfar", "th-tahlil-100", "th-tasbih", "th-tahmid",
      "th-takbir", "th-shalawat", "th-hauqalah", "th-tahlil-penutup",
      "th-doa-tahlil", "th-doa-arwah", "th-penutup",
    ]
    tahlil.forEach((item, i) => {
      assert(item.id === expectedOrder[i],
        `Posisi ${i}: ekspektasi "${expectedOrder[i]}", aktual "${item.id}"`)
    })
  })

  // ── 5. Dynamic Name Injection Tests ────────────────────────
  test("TAWASSUL dengan nama: tw-almarhum muncul", () => {
    const tw = TAWASSUL(["Ahmad bin Abdullah"])
    const item = tw.find(i => i.id === "tw-almarhum")
    assert(item, "Item tw-almarhum tidak muncul saat nama diberikan")
  })
  test("TAWASSUL tanpa nama: tw-almarhum tidak muncul", () => {
    const tw = TAWASSUL([])
    assert(!tw.find(i => i.id === "tw-almarhum"), "tw-almarhum muncul padahal tidak ada nama")
  })
  test("tw-almarhum arab TIDAK mengandung huruf Latin", () => {
    const tw = TAWASSUL(["Ahmad bin Abdullah", "Siti Maryam"])
    const item = tw.find(i => i.id === "tw-almarhum")
    if (item) assert(!/[a-zA-Z]/.test(item.arab),
      `Teks Arab tw-almarhum mengandung Latin: ${item.arab}`)
  })
  test("th-doa-arwah arab TIDAK mengandung huruf Latin", () => {
    const th = TAHLIL(["Ahmad bin Abdullah", "Siti Maryam"])
    const item = th.find(i => i.id === "th-doa-arwah")
    assert(!/[a-zA-Z]/.test(item.arab),
      `Teks Arab th-doa-arwah mengandung Latin: ${item.arab}`)
  })
  test("Sanitasi input: karakter berbahaya dihapus", () => {
    const tw = TAWASSUL(['<script>alert(1)</script>Ahmad'])
    const item = tw.find(i => i.id === "tw-almarhum")
    if (item) {
      assert(!item.latin.includes("<"), "Karakter < lolos sanitasi")
      assert(!item.latin.includes(">"), "Karakter > lolos sanitasi")
    }
  })
  test("Sanitasi input: hanya huruf, spasi, titik, tanda hubung yang lolos", () => {
    const tw = TAWASSUL(["Ahmad@123", "Siti#Maryam", "http://evil.com/name"])
    const item = tw.find(i => i.id === "tw-almarhum")
    if (item) {
      assert(!item.latin.includes("@"), "@ lolos sanitasi")
      assert(!item.latin.includes("#"), "# lolos sanitasi")
      assert(!item.latin.includes("http"), "URL lolos sanitasi")
    }
  })
  test("Sanitasi input: nama kosong diabaikan", () => {
    const tw = TAWASSUL(["", "   ", "Ahmad"])
    const item = tw.find(i => i.id === "tw-almarhum")
    assert(item, "Item harus muncul karena ada 1 nama valid")
    assert(!item.latin.includes("   "), "Nama kosong lolos ke output")
  })

  // ── 6. No Arabisasi Lokasi ─────────────────────────────────
  test("Tidak ada arabisasi 'Cemandi' yang tidak baku", () => {
    allItems.forEach(item => {
      ["arab", "latin"].forEach(field => {
        if (item[field]) {
          assert(!item[field].includes("سِيمَانْدِي"),
            `${item.id}.${field}: arabisasi non-baku سِيمَانْدِي`)
          assert(!item[field].includes("بِيرُومْ"),
            `${item.id}.${field}: arabisasi non-baku بِيرُومْ`)
          assert(!item[field].includes("Siimandii"),
            `${item.id}.${field}: transliterasi non-baku Siimandii`)
          assert(!item[field].includes("Biirum"),
            `${item.id}.${field}: transliterasi non-baku Biirum`)
        }
      })
    })
  })

  // ── 7. Transliteration Consistency ────────────────────────
  test("Al-Fatihah latin: menggunakan 'dz' bukan 'dh' untuk ذ di akhir", () => {
    const lat = QURAN.alFatihah.latin
    assert(!lat.includes("ladh-"), "Al-Fatihah masih menggunakan 'ladh-' (harus 'ladz-')")
    assert(lat.includes("ladz-"), "Al-Fatihah harus menggunakan 'ladz-'")
  })
  test("doaArwahLatin: menggunakan 'Allahummaghfir' bukan 'Allahummagfir'", () => {
    const th = TAHLIL([])
    const item = th.find(i => i.id === "th-doa-arwah")
    assert(!item.latin.includes("Allahummagfir "), "Masih menggunakan 'Allahummagfir' (typo)")
    assert(item.latin.includes("Allahummaghfir"), "Harus menggunakan 'Allahummaghfir'")
  })

  // ── 8. Struktur Objek & Nilai Ulang ───────────────────────
  test("TAHLIL: nilai ulang selalu bilangan positif", () => {
    tahlil.forEach((item) => {
      if (item.jenis === "section" || item.ulang === undefined) return
      assert(typeof item.ulang === "number" && item.ulang > 0,
        `${item.id}: ulang tidak valid (${item.ulang})`)
    })
  })
  test("TAWASSUL & TAHLIL: teks Arab tidak mengandung huruf Latin", () => {
    allItems.forEach(item => {
      if (item.jenis === "section" || !item.arab) return
      assert(!/[a-zA-Z]/.test(item.arab),
        `${item.id}.arab: mengandung huruf Latin`)
    })
  })
  test("QURAN: semua surah memiliki arab, latin, dan terjemahan", () => {
    const suwar = ["basmalah", "alFatihah", "alIkhlas", "alFalaq", "anNas",
                   "alBaqarahAwal", "ayatKursi", "alBaqarahAkhir"]
    suwar.forEach(key => {
      assert(QURAN[key], `QURAN.${key} tidak ditemukan`)
      assert(QURAN[key].arab && QURAN[key].arab.trim(), `QURAN.${key}.arab kosong`)
      assert(QURAN[key].latin && QURAN[key].latin.trim(), `QURAN.${key}.latin kosong`)
      assert(QURAN[key].terjemahan && QURAN[key].terjemahan.trim(), `QURAN.${key}.terjemahan kosong`)
    })
  })
  test("validateQuranReferences: semua referensi valid", () => {
    const result = validateQuranReferences()
    assert(result.valid, "validateQuranReferences gagal: " + result.errors.join("; "))
  })
  test("getQuranFingerprint: totalChars > 0 dan semua surah tercatat", () => {
    const fp = getQuranFingerprint()
    assert(fp.totalChars > 0, "Fingerprint totalChars harus > 0")
    const keys = ["basmalah", "alFatihah", "alIkhlas", "alFalaq", "anNas",
                  "alBaqarahAwal", "ayatKursi", "alBaqarahAkhir"]
    keys.forEach(k => assert(fp.perSurah[k] > 0, `Fingerprint ${k} tidak tercatat`))
  })

  // ── Summary ─────────────────────────────────────────────────
  const summary = {
    total: passed + failed,
    passed,
    failed,
    results,
  }

  if (failed === 0) {
    console.log(`\n✅ Semua ${passed} test lulus — tahlil.js v2.2.0 production-ready`)
  } else {
    console.error(`\n❌ ${failed} dari ${passed + failed} test gagal:`)
    results.filter(r => r.status === "FAIL").forEach(r =>
      console.error(`   • ${r.name}: ${r.error}`))
  }

  return summary
}

// Jalankan test otomatis di lingkungan non-produksi
if (import.meta.env.DEV) {
  runTahlilTests()
}
