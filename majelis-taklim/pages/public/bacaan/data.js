// ============================================================
// Majelis Taklim — Data Bacaan Islami Lengkap
// Format: { nomor?, arab, latin, arti, keterangan? }
// ============================================================

export const BACAAN_DATA = {

  // ============================================================
  // TAWASUL
  // ============================================================
  tawasul: [
    {
      keterangan: "Pembukaan — Al-Fatihah untuk Nabi Muhammad SAW",
      arab: "إِلَى حَضْرَةِ النَّبِيِّ الْمُصْطَفَى مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ وَآلِهِ وَأَصْحَابِهِ أَجْمَعِينَ، شَيْءٌ لِلهِ لَهُمُ الْفَاتِحَةُ",
      latin: "Ilaa hadrati an-nabiyyil mushthofaa muhammadin shallallaahu 'alaihi wasallam wa-aalihii wa-ash-haabihii ajma'iin, syai-un lillaahi lahumul faatihah",
      arti: "Kepada kehadiran Nabi yang terpilih Muhammad SAW, keluarganya, dan seluruh para sahabatnya, suatu (hadiah) karena Allah untuk mereka Al-Fatihah"
    },
    {
      keterangan: "Al-Fatihah untuk para Nabi dan Rasul",
      arab: "ثُمَّ إِلَى حَضْرَةِ إِخْوَانِهِ مِنَ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ وَالْأَوْلِيَاءِ وَالشُّهَدَاءِ وَالصَّالِحِينَ، وَأَهْلِ بَيْتِهِ وَسَائِرِ عِبَادِ اللهِ الصَّالِحِينَ، شَيْءٌ لِلهِ لَهُمُ الْفَاتِحَةُ",
      latin: "Tsumma ilaa hadrati ikhwaanihii minal anbiyaa-i wal mursaliina wal awliyaa-i wasy-syuhadaa-i wash-shalihiin, wa-ahli baitihii wa-saa-iri 'ibaadillaahish-shaalihiin, syai-un lillaahi lahumul faatihah",
      arti: "Kemudian kepada kehadiran saudara-saudaranya dari para Nabi, Rasul, wali, syuhada, orang-orang shalih, dan ahli baitnya serta seluruh hamba Allah yang shalih, suatu hadiah karena Allah untuk mereka Al-Fatihah"
    },
    {
      keterangan: "Al-Fatihah untuk Syaikh Abdul Qadir Al-Jilani",
      arab: "ثُمَّ إِلَى حَضْرَةِ سَيِّدِنَا الشَّيْخِ مُحْيِي الدِّينِ عَبْدِ الْقَادِرِ الْجَيْلَانِيِّ قَدَّسَ اللهُ سِرَّهُ وَنَفَعَنَا بِعُلُومِهِ وَبَرَكَاتِهِ، شَيْءٌ لِلهِ لَهُ الْفَاتِحَةُ",
      latin: "Tsumma ilaa hadrati sayyidinasy-syaikh muhyid-diini 'abdil qaadiri al-jiilanii qaddasallaahu sirrahuu wa-nafa'anaa bi-'ulumihii wa-barakaatih, syai-un lillaahi lahul faatihah",
      arti: "Kemudian kepada kehadiran tuan kami Syaikh Muhyiddin Abdul Qadir Al-Jilani, semoga Allah mensucikan rahasianya dan memberi manfaat kepada kami dengan ilmu dan berkahnya, suatu hadiah karena Allah untuknya Al-Fatihah"
    },
    {
      keterangan: "Al-Fatihah untuk arwah keluarga yang telah wafat",
      arab: "ثُمَّ إِلَى أَرْوَاحِ آبَائِنَا وَأُمَّهَاتِنَا وَأَجْدَادِنَا وَجَدَّاتِنَا مِنَ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ، شَيْءٌ لِلهِ لَهُمُ الْفَاتِحَةُ",
      latin: "Tsumma ilaa arwaahi aabaa-inaa wa-ummahaaatinaa wa-ajdaadinaa wa-jaddaatinaa minal muslimiina wal muslimaat, syai-un lillaahi lahumul faatihah",
      arti: "Kemudian kepada arwah bapak-bapak, ibu-ibu, kakek-kakek, dan nenek-nenek kami dari kaum muslimin dan muslimat, suatu hadiah karena Allah untuk mereka Al-Fatihah"
    }
  ],

  // ============================================================
  // TAHLIL
  // ============================================================
  tahlil: [
    {
      nomor: 1,
      keterangan: "Pembukaan — dibaca 1x",
      arab: "أَعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
      latin: "A'uudzu billaahi minasy-syaythaanir-rajiim",
      arti: "Aku berlindung kepada Allah dari setan yang terkutuk"
    },
    {
      nomor: 2,
      keterangan: "Basmalah — dibaca 1x",
      arab: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
      latin: "Bismillaahir-rahmaanir-rahiim",
      arti: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang"
    },
    {
      nomor: 3,
      keterangan: "Al-Fatihah — dibaca 1x",
      arab: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      latin: "Alhamdu lillaahi rabbil 'aalamiin. Ar-rahmaanir-rahiim. Maaliki yawmid-diin. Iyyaaka na'budu wa-iyyaaka nasta'iin. Ihdinash-shiraathal mustaqiim. Shiraathal ladziina an'amta 'alayhim ghayril maghdhuubi 'alayhim wa-ladh-dhaaalliin",
      arti: "Segala puji bagi Allah, Tuhan semesta alam. Yang Maha Pengasih, Maha Penyayang. Pemilik hari pembalasan. Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami mohon pertolongan. Tunjukilah kami jalan yang lurus. Jalan orang yang Engkau beri nikmat, bukan jalan orang yang dimurkai dan bukan pula jalan orang yang sesat."
    },
    {
      nomor: 4,
      keterangan: "Al-Ikhlas — dibaca 3x",
      arab: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
      latin: "Qul huwallahu ahad. Allaahush-shamad. Lam yalid wa-lam yuulad. Wa-lam yakul lahuu kufuwan ahad",
      arti: "Katakanlah, Dialah Allah Yang Maha Esa. Allah tempat meminta segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia."
    },
    {
      nomor: 5,
      keterangan: "Shalawat — dibaca 10x atau 100x",
      arab: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ",
      latin: "Allaahumma shalli 'alaa sayyidinaa muhammadin wa-'alaa aali sayyidinaa muhammad",
      arti: "Ya Allah, limpahkan shalawat kepada junjungan kami Muhammad dan kepada keluarga junjungan kami Muhammad"
    },
    {
      nomor: 6,
      keterangan: "Istighfar — dibaca 3x",
      arab: "أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      latin: "Astaghfirul-laahal-'azhiimal-ladzii laa ilaaha illaa huwal-hayyul-qayyuumu wa-atuubu ilaih",
      arti: "Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan selain Dia Yang Maha Hidup dan Berdiri Sendiri, dan aku bertaubat kepada-Nya"
    },
    {
      nomor: 7,
      keterangan: "Tahlil — dibaca 100x atau minimal 33x",
      arab: "لَا إِلَهَ إِلَّا اللهُ",
      latin: "Laa ilaaha illallaah",
      arti: "Tiada Tuhan selain Allah"
    },
    {
      nomor: 8,
      keterangan: "Tahlil Penutup — dibaca 1x",
      arab: "لَا إِلَهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ",
      latin: "Laa ilaaha illallaahu muhammadur-rasuulullahi shallallaahu 'alayhi wasallam",
      arti: "Tiada Tuhan selain Allah, Muhammad adalah utusan Allah SAW"
    }
  ],

  // ============================================================
  // ISTIGHOTSAH
  // ============================================================
  istighotsah: [
    {
      keterangan: "Pembukaan",
      arab: "يَا اللهُ يَا اللهُ يَا اللهُ",
      latin: "Yaa Allaah Yaa Allaah Yaa Allaah",
      arti: "Wahai Allah... Wahai Allah... Wahai Allah..."
    },
    {
      nomor: 1,
      keterangan: "Istighfar — dibaca 3x",
      arab: "أَسْتَغْفِرُ اللهَ الْعَظِيمَ مِمَّا أَوْجَبَ سَخَطَهُ وَأَلِيمَ عِقَابِهِ",
      latin: "Astaghfirul-laahal-'azhiim mimmaa awjaba sakhatahuu wa-aliima 'iqaabih",
      arti: "Aku memohon ampun kepada Allah Yang Maha Agung dari segala yang mendatangkan kemurkaan-Nya dan siksaan-Nya yang pedih"
    },
    {
      nomor: 2,
      keterangan: "Shalawat Tafrijiyyah — dibaca 41x",
      arab: "اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الْخَوَاتِمِ وَيُسْتَسْقَى الْغَمَامُ بِوَجْهِهِ الْكَرِيمِ وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ",
      latin: "Allaahumma shalli shalaa-tan kaamilatan wa-sallim salaaman taamman 'alaa sayyidinaa muhammadil-ladzii tanhallu bihil-'uqadu wa-tanfariju bihil-kuraba wa-tuqdhaa bihil-hawaa-iju wa-tunaalu bihir-raghaa-ibu wa-husnul-khawaatimi wa-yustasqal-ghamamatu biwajhihil-kariim wa-'alaa aalihii wa-shahbihii fii kulli lamhatin wa-nafasin bi'adadi kulli ma'luu-mil-lak",
      arti: "Ya Allah, limpahkan shalawat yang sempurna dan salam yang lengkap atas junjungan kami Muhammad, yang dengan (berkahnya) terbuka segala kesulitan, tersingkirkan segala kesusahan, terpenuhi segala kebutuhan, diperoleh segala keinginan dan husnul khatimah, serta diturunkan hujan dengan wajahnya yang mulia. Juga kepada keluarga dan sahabatnya di setiap kedipan mata dan tarikan nafas sebanyak bilangan semua yang Engkau ketahui."
    },
    {
      nomor: 3,
      keterangan: "Tahlil — dibaca 100x",
      arab: "لَا إِلَهَ إِلَّا اللهُ",
      latin: "Laa ilaaha illallaah",
      arti: "Tiada Tuhan selain Allah"
    },
    {
      nomor: 4,
      keterangan: "Doa Penutup Istighotsah",
      arab: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
      latin: "Yaa hayyu yaa qayyuumu bi-rahmatika astaghiits, ashlih lii sya'nii kullahu wa-laa takilnii ilaa nafsii tharfata 'ayn",
      arti: "Wahai Yang Maha Hidup, wahai Yang Berdiri Sendiri, dengan rahmat-Mu aku meminta pertolongan. Perbaikilah seluruh urusanku dan jangan Engkau serahkan aku kepada diriku sendiri walau sekejap mata"
    }
  ],

  // ============================================================
  // YASIN
  // ============================================================
  yasin: [
    { nomor: 1, arab: "يس", latin: "Yaa Siin", arti: "Yaa Siin" },
    { nomor: 2, arab: "وَالْقُرْآنِ الْحَكِيمِ", latin: "Wal-qur-aanil hakiim", arti: "Demi Al-Quran yang penuh hikmah" },
    { nomor: 3, arab: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ", latin: "Innaka laminal mursaliin", arti: "Sungguh, kamu (Muhammad) termasuk rasul-rasul" },
    { nomor: 4, arab: "عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ", latin: "'Alaa shiraathim mustaqiim", arti: "Yang berada di atas jalan yang lurus" },
    { nomor: 5, arab: "تَنزِيلَ الْعَزِيزِ الرَّحِيمِ", latin: "Tanziilal 'aziizir rahiim", arti: "(Sebagai wahyu) yang diturunkan oleh Yang Mahaperkasa, Maha Penyayang" },
    { nomor: 6, arab: "لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ", latin: "Litundzira qawman maa undzira aabaa-uhum fahum ghaafiluun", arti: "Agar kamu memberi peringatan kepada suatu kaum yang nenek moyang mereka belum pernah diberi peringatan, karena itu mereka lalai" },
    { nomor: 7, arab: "لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ", latin: "Laqad haqqal qawlu 'alaaa aksarihim fahum laa yu'minuun", arti: "Sungguh, telah pasti berlaku firman (Allah) terhadap kebanyakan mereka, karena mereka tidak beriman" },
    { nomor: 8, arab: "إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُم مُّقْمَحُونَ", latin: "Innaa ja'alnaa fii a'naaqihim aghlaalan fahiya ilal adzqaani fahum muqmahuun", arti: "Sungguh, Kami telah memasang belenggu di leher mereka, lalu tangan mereka (diangkat) ke dagu, maka kepala mereka terangkat ke atas" },
    { nomor: 9, arab: "وَجَعَلْنَا مِن بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ", latin: "Wa ja'alnaa mim baini aidiihim saddaw wa-min khalfihim saddan fa-aghsyaynaa-hum fahum laa yubshiruun", arti: "Dan Kami telah menutup jalan di hadapan mereka dan di belakang mereka, lalu Kami tutup pandangan mereka sehingga mereka tidak dapat melihat" },
    { nomor: 10, arab: "وَسَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ", latin: "Wa sawaa-un 'alayhim a-andzartahum am lam tundzirhum laa yu'minuun", arti: "Dan sama saja bagi mereka, apakah kamu memberi peringatan kepada mereka atau kamu tidak memberi peringatan, mereka tidak akan beriman" },
    { nomor: 11, arab: "إِنَّمَا تُنذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَٰنَ بِالْغَيْبِ ۖ فَبَشِّرْهُ بِمَغْفِرَةٍ وَأَجْرٍ كَرِيمٍ", latin: "Innamaa tundziru manit-taba'adz-dzikra wa-khasyiyar-rahmaana bil ghayb, fa-basysyirhu bi-maghfiratin wa-ajrin kariim", arti: "Sesungguhnya kamu hanya memberi peringatan kepada orang yang mau mengikuti peringatan dan yang takut kepada Tuhan Yang Maha Pengasih, meskipun dia tidak melihat-Nya. Maka berilah mereka kabar gembira tentang ampunan dan pahala yang mulia" },
    { nomor: 12, arab: "إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ۚ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ", latin: "Innaa nahnu nuhyil mawtaa wa-naktubu maa qaddamuu wa-aatsaarahum, wa-kulla syay-in ahsaynaahu fii imaamim mubiin", arti: "Sungguh, Kami menghidupkan orang-orang yang mati, dan Kami mencatat apa yang telah mereka kerjakan dan bekas-bekas yang mereka tinggalkan. Dan segala sesuatu Kami kumpulkan dalam Kitab yang jelas (Lauh Mahfuz)" },
    {
      keterangan: "— Ayat 13–83 dilanjutkan sesuai mushaf lengkap —",
      arab: "وَاضْرِبْ لَهُم مَّثَلًا أَصْحَابَ الْقَرْيَةِ إِذْ جَاءَهَا الْمُرْسَلُونَ",
      latin: "Wadhrib lahum matsalan ash-haabal qaryati idz jaa-ahal mursaluun",
      arti: "(Ayat 13) Dan buatlah suatu perumpamaan bagi mereka, yaitu penduduk suatu negeri ketika para utusan datang kepada mereka"
    },
    {
      nomor: 82,
      keterangan: "Ayat paling terkenal dalam Yasin",
      arab: "إِنَّمَا أَمْرُهُ إِذَا أَرَادَ شَيْئًا أَن يَقُولَ لَهُ كُن فَيَكُونُ",
      latin: "Innamaa amruhuu idzaa araada syay-an ay yaquula lahuu kun fa-yakuun",
      arti: "Sesungguhnya urusan-Nya apabila Dia menghendaki sesuatu Dia hanya berkata kepadanya, 'Jadilah!' Maka jadilah sesuatu itu"
    },
    {
      nomor: 83,
      keterangan: "Penutup Surat Yasin",
      arab: "فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ",
      latin: "Fa-subhaanal-ladzii biyadihii malaakuutu kulli syay-in wa-ilayhi turja'uun",
      arti: "Maka Maha Suci (Allah) yang di tangan-Nya kekuasaan atas segala sesuatu dan kepada-Nya kamu dikembalikan"
    }
  ],

  // ============================================================
  // DOA HARIAN
  // ============================================================
  "doa-harian": [
    {
      keterangan: "Doa Bangun Tidur",
      arab: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
      latin: "Alhamdu lillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa-ilayhinn-nusyuur",
      arti: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kami kembali"
    },
    {
      keterangan: "Doa Sebelum Makan",
      arab: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
      latin: "Allaahumma baarik lanaa fiimaa razaqtanaa wa-qinaa 'adzaaban-naar",
      arti: "Ya Allah, berkahilah kami pada apa yang telah Engkau rezekikan kepada kami, dan jauhkanlah kami dari siksa api neraka"
    },
    {
      keterangan: "Doa Sesudah Makan",
      arab: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
      latin: "Alhamdu lillaahil-ladzii ath'amanaa wa-saqaanaa wa-ja'alanaa muslimiin",
      arti: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami orang Islam"
    },
    {
      keterangan: "Doa Masuk Masjid",
      arab: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
      latin: "Allaahumaf-tah lii abwaaba rahmatik",
      arti: "Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu"
    },
    {
      keterangan: "Doa Keluar Masjid",
      arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
      latin: "Allaahumma innii as-aluka min fadhllik",
      arti: "Ya Allah, sesungguhnya aku memohon karunia-Mu"
    },
    {
      keterangan: "Doa Bepergian",
      arab: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى",
      latin: "Allaahumma innaa nas-aluka fii safarinaa haadzal birra wat-taqwaa wa-minal 'amali maa tardhaa",
      arti: "Ya Allah, kami memohon kepada-Mu dalam perjalanan kami ini kebaikan dan ketakwaan, serta amal yang Engkau ridhai"
    },
    {
      keterangan: "Doa Mohon Kesehatan",
      arab: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ",
      latin: "Allaahumma 'aafinii fii badanii, allaahumma 'aafinii fii sam'ii, allaahumma 'aafinii fii bashorii, laa ilaaha illaa ant",
      arti: "Ya Allah, sehatkanlah badanku, sehatkanlah pendengaranku, sehatkanlah penglihatanku. Tiada Tuhan selain Engkau"
    },
    {
      keterangan: "Doa Mohon Ampunan (Sayyidul Istighfar)",
      arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      latin: "Allaahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa-anaa 'abduka wa-anaa 'alaa 'ahdika wa-wa'dika mas-tatho't, a'uudzu bika min syarri maa shona't, abuu-u laka bini'matika 'alayya wa-abuu-u bidzambii faghfir lii fa-innahuu laa yaghfirudz-dzunuuba illaa ant",
      arti: "Ya Allah, Engkau adalah Tuhanku, tiada Tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian dan janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang aku perbuat. Aku mengakui nikmat-Mu atasku dan aku mengakui dosaku, maka ampunilah aku. Sesungguhnya tidak ada yang mengampuni dosa kecuali Engkau."
    }
  ],

  // ============================================================
  // DOA PENUTUP
  // ============================================================
  "doa-penutup": [
    {
      keterangan: "Doa Penutup Majelis",
      arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
      latin: "Subhaanakallaahumma wa-bihamdika asyhadu al-laa ilaaha illaa anta astaghfiruka wa-atuubu ilayk",
      arti: "Maha Suci Engkau ya Allah, dengan memuji-Mu, aku bersaksi bahwa tiada Tuhan selain Engkau, aku memohon ampun dan bertaubat kepada-Mu"
    },
    {
      keterangan: "Doa Kebaikan Dunia dan Akhirat",
      arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      latin: "Rabbanaa aatinaa fid-dunyaa hasanatan wa-fil-aakhirati hasanatan wa-qinaa 'adzaaban-naar",
      arti: "Wahai Tuhan kami, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, serta jauhkanlah kami dari siksa api neraka"
    },
    {
      keterangan: "Shalawat Penutup",
      arab: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      latin: "Allaahumma shalli wa-sallim 'alaa sayyidinaa muhammadin wa-'alaa aalihii wa-shahbihii ajma'iin, walhamdu lillaahi rabbil 'aalamiin",
      arti: "Ya Allah, limpahkan shalawat dan salam atas junjungan kami Muhammad, keluarganya, dan seluruh sahabatnya. Segala puji bagi Allah, Tuhan semesta alam"
    }
  ]
};

// Eksport flat untuk JSON endpoint
export function getBacaanBySlug(slug) {
  return BACAAN_DATA[slug] || null;
}
