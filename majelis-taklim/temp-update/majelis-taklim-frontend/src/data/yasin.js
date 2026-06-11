// ============================================================
// SURAT YASIN — LENGKAP 83 AYAT
// ============================================================
//
// SUMBER & REFERENSI
// ─────────────────────────────────────────────────────────────
// Mushaf     : Al-Qur'an Standar Indonesia (Kemenag RI)
//              Teks Arab sesuai rasm Utsmani standar Kemenag
// Terjemahan : Al-Qur'an dan Terjemahnya (Kemenag RI, edisi terbaru)
// Transliterasi: Sistem transliterasi ISO/akademik dengan diakritik:
//              ā/ī/ū (vokal panjang), ḥ/ṣ/ṭ/ẓ/ḍ (titik bawah),
//              ġ/g (ghayn), ż (żal), ' (hamzah/ain)
//
// AUDIT
// ─────────────────────────────────────────────────────────────
// Tanggal    : Juni 2026
// Status     : Production Ready
// Catatan    : n=0 adalah basmalah; n=1–83 adalah 83 ayat Yasin
//
// STRUKTUR DATA
// ─────────────────────────────────────────────────────────────
// Setiap entry: { n, arab, latin, terjemahan }
// n=0  → basmalah (bukan bagian dari 83 ayat)
// n=1–83 → 83 ayat Surat Yasin
// Export: SURAT_YASIN (array), validateYasin (function)
// ============================================================
export const SURAT_YASIN = [
  { n: 0,  arab: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', latin: "Bismillāhir-raḥmānir-raḥīm", terjemahan: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang.' },
  { n: 1,  arab: 'يٰسٓ', latin: 'Yā Sīn', terjemahan: 'Yaa Siin.' },
  { n: 2,  arab: 'وَٱلۡقُرۡءَانِ ٱلۡحَكِيمِ', latin: "Wal-qur'ānil-ḥakīm", terjemahan: 'Demi Al-Qur\'an yang penuh hikmah,' },
  { n: 3,  arab: 'إِنَّكَ لَمِنَ ٱلۡمُرۡسَلِينَ', latin: 'Innaka laminal-mursalīn', terjemahan: 'sungguh, engkau (Muhammad) adalah salah seorang rasul,' },
  { n: 4,  arab: 'عَلَىٰ صِرَٰطٍ مُّسۡتَقِيمٍ', latin: "'Alā ṣirāṭim mustaqīm", terjemahan: '(yang berada) di atas jalan yang lurus,' },
  { n: 5,  arab: 'تَنزِيلَ ٱلۡعَزِيزِ ٱلرَّحِيمِ', latin: "Tanzīlal-'azīzir-raḥīm", terjemahan: '(Al-Qur\'an) yang diturunkan oleh Yang Mahaperkasa, Maha Penyayang,' },
  { n: 6,  arab: 'لِتُنذِرَ قَوۡمٗا مَّآ أُنذِرَ ءَابَآؤُهُمۡ فَهُمۡ غَٰفِلُونَ', latin: "Litunżira qawmam mā unżira ābā'uhum fahum gāfilūn", terjemahan: 'agar engkau memberi peringatan kepada suatu kaum yang nenek moyangnya belum pernah diberi peringatan, karena itu mereka lalai.' },
  { n: 7,  arab: 'لَقَدۡ حَقَّ ٱلۡقَوۡلُ عَلَىٰٓ أَكۡثَرِهِمۡ فَهُمۡ لَا يُؤۡمِنُونَ', latin: "Laqad ḥaqqal-qawlu 'alā akṡarihim fahum lā yu'minūn", terjemahan: 'Sungguh, pasti berlaku firman (ketentuan Allah) terhadap kebanyakan mereka, karena mereka tidak beriman.' },
  { n: 8,  arab: 'إِنَّا جَعَلۡنَا فِيٓ أَعۡنَٰقِهِمۡ أَغۡلَٰلٗا فَهِيَ إِلَى ٱلۡأَذۡقَانِ فَهُم مُّقۡمَحُونَ', latin: "Innā ja'alnā fī a'nāqihim aglālan fahiya ilal-ażqāni fahum muqmaḥūn", terjemahan: 'Sungguh, Kami telah memasang belenggu di leher mereka, lalu tangan mereka (diangkat) ke dagu, karena itu mereka tertengadah.' },
  { n: 9,  arab: 'وَجَعَلۡنَا مِنۢ بَيۡنِ أَيۡدِيهِمۡ سَدّٗا وَمِنۡ خَلۡفِهِمۡ سَدّٗا فَأَغۡشَيۡنَٰهُمۡ فَهُمۡ لَا يُبۡصِرُونَ', latin: "Wa ja'alnā mim baini aidīhim saddaw wa min khalfihim saddan fa'agyaināhum fahum lā yubṣirūn", terjemahan: 'Dan Kami jadikan di hadapan mereka sebuah dinding dan di belakang mereka juga sebuah dinding, dan Kami tutup penglihatan mereka sehingga mereka tidak dapat melihat.' },
  { n: 10, arab: 'وَسَوَآءٌ عَلَيۡهِمۡ ءَأَنذَرۡتَهُمۡ أَمۡ لَمۡ تُنذِرۡهُمۡ لَا يُؤۡمِنُونَ', latin: "Wa sawā'un 'alaihim a'anżartahum am lam tunżirhum lā yu'minūn", terjemahan: 'Dan sama saja bagi mereka, engkau beri peringatan atau tidak, mereka tidak akan beriman.' },
  { n: 11, arab: 'إِنَّمَا تُنذِرُ مَنِ ٱتَّبَعَ ٱلذِّكۡرَ وَخَشِيَ ٱلرَّحۡمَٰنَ بِٱلۡغَيۡبِۖ فَبَشِّرۡهُ بِمَغۡفِرَةٍ وَأَجۡرٍ كَرِيمٍ', latin: "Innamā tunżiru manittaba'ażżikra wa khasyiyar-raḥmāna bil-gaib, fabasyirhu bimagfirataw wa ajrin karīm", terjemahan: 'Sesungguhnya engkau hanya memberi peringatan kepada orang yang mau mengikuti peringatan dan yang takut kepada Tuhan Yang Maha Pengasih, walaupun dia tidak melihat-Nya. Maka berilah mereka kabar gembira dengan ampunan dan pahala yang mulia.' },
  { n: 12, arab: 'إِنَّا نَحۡنُ نُحۡيِ ٱلۡمَوۡتَىٰ وَنَكۡتُبُ مَا قَدَّمُواْ وَءَاثَٰرَهُمۡۚ وَكُلَّ شَيۡءٍ أَحۡصَيۡنَٰهُ فِيٓ إِمَامٍ مُّبِينٍ', latin: "Innā naḥnu nuḥyil-mautā wa naktubu mā qaddamū wa āṡārahum, wa kulla šay'in aḥṣaināhu fī imāmim mubīn", terjemahan: 'Sungguh, Kami menghidupkan orang-orang yang mati, dan Kami mencatat apa yang telah mereka kerjakan dan bekas-bekas yang mereka tinggalkan. Dan segala sesuatu Kami kumpulkan dalam kitab yang jelas (Lauh Mahfuzh).' },
  { n: 13, arab: 'وَٱضۡرِبۡ لَهُم مَّثَلًا أَصۡحَٰبَ ٱلۡقَرۡيَةِ إِذۡ جَآءَهَا ٱلۡمُرۡسَلُونَ', latin: "Waḍrib lahum maṡalan aṣḥābal-qaryati iż jā'ahal-mursalūn", terjemahan: 'Dan buatkanlah suatu perumpamaan bagi mereka, yaitu penduduk suatu negeri, ketika utusan-utusan datang kepada mereka.' },
  { n: 14, arab: 'إِذۡ أَرۡسَلۡنَآ إِلَيۡهِمُ ٱثۡنَيۡنِ فَكَذَّبُوهُمَا فَعَزَّزۡنَا بِثَالِثٍ فَقَالُوٓاْ إِنَّآ إِلَيۡكُم مُّرۡسَلُونَ', latin: "Iż arsalnā ilaihimuṡnaini fakaż̈żabūhumā fa'azzaznā biṡāliṡin faqālū innā ilaikum mursalūn", terjemahan: '(yaitu) ketika Kami mengutus dua orang utusan kepada mereka, lalu mereka mendustakan keduanya, kemudian Kami kuatkan dengan (utusan) yang ketiga, maka ketiga (utusan itu) berkata, "Sungguh, kami adalah orang-orang yang diutus kepadamu."' },
  { n: 15, arab: 'قَالُواْ مَآ أَنتُمۡ إِلَّا بَشَرٌ مِّثۡلُنَا وَمَآ أَنزَلَ ٱلرَّحۡمَٰنُ مِن شَيۡءٍ إِنۡ أَنتُمۡ إِلَّا تَكۡذِبُونَ', latin: "Qālū mā antum illā basyarum miṡlunā wa mā anzalar-raḥmānu min šay'in in antum illā takżibūn", terjemahan: 'Mereka menjawab, "Kamu hanyalah manusia seperti kami, dan Yang Maha Pengasih tidak menurunkan sesuatu pun. Kamu hanyalah pendusta belaka."' },
  { n: 16, arab: 'قَالُواْ رَبُّنَا يَعۡلَمُ إِنَّآ إِلَيۡكُمۡ لَمُرۡسَلُونَ', latin: "Qālū rabbunā ya'lamu innā ilaikum lamursalūn", terjemahan: 'Mereka berkata, "Tuhan kami mengetahui bahwa sesungguhnya kami adalah utusan-Nya kepada kamu."' },
  { n: 17, arab: 'وَمَا عَلَيۡنَآ إِلَّا ٱلۡبَلَٰغُ ٱلۡمُبِينُ', latin: "Wa mā 'alainā illal-balāgul-mubīn", terjemahan: 'Dan kewajiban kami hanyalah menyampaikan (perintah Allah) dengan jelas.' },
  { n: 18, arab: 'قَالُوٓاْ إِنَّا تَطَيَّرۡنَا بِكُمۡۖ لَئِن لَّمۡ تَنتَهُواْ لَنَرۡجُمَنَّكُمۡ وَلَيَمَسَّنَّكُم مِّنَّا عَذَابٌ أَلِيمٌ', latin: "Qālū innā taṭayyarnā bikum, la'il lam tantahū lanarjumannakum wa layamassannakum minnā 'ażābun alīm", terjemahan: 'Mereka menjawab, "Sesungguhnya kami bernasib malang karena kamu. Sungguh, jika kamu tidak berhenti, niscaya kami akan merajam kamu dan kamu pasti akan merasakan siksaan yang pedih dari kami."' },
  { n: 19, arab: 'قَالُواْ طَٰٓئِرُكُم مَّعَكُمۡۚ أَئِن ذُكِّرۡتُمۚ بَلۡ أَنتُمۡ قَوۡمٌ مُّسۡرِفُونَ', latin: "Qālū ṭā'irukum ma'akum, a'in żukkirtum bal antum qawmum musrifūn", terjemahan: 'Utusan-utusan itu berkata, "Nasib burukmu itu ada bersamamu sendiri. Apakah jika kamu diberi peringatan (kamu mengancam kami)? Sebenarnya kamu adalah kaum yang melampaui batas."' },
  { n: 20, arab: 'وَجَآءَ مِنۡ أَقۡصَا ٱلۡمَدِينَةِ رَجُلٌ يَسۡعَىٰ قَالَ يَٰقَوۡمِ ٱتَّبِعُواْ ٱلۡمُرۡسَلِينَ', latin: "Wa jā'a min aqṣal-madīnati rajuluy yas'ā qāla yā qawmittabi'ul-mursalīn", terjemahan: 'Dan datanglah dari ujung kota, seorang laki-laki dengan bergegas-gegas ia berkata, "Wahai kaumku! Ikutilah utusan-utusan itu."' },
  { n: 21, arab: 'ٱتَّبِعُواْ مَن لَّا يَسۡـَٔلُكُمۡ أَجۡرٗا وَهُم مُّهۡتَدُونَ', latin: "Ittabi'ū mal lā yas'alukum ajraw wa hum muhtadūn", terjemahan: 'Ikutilah orang yang tidak meminta imbalan kepadamu; dan mereka adalah orang yang mendapat petunjuk.' },
  { n: 22, arab: 'وَمَا لِيَ لَآ أَعۡبُدُ ٱلَّذِي فَطَرَنِي وَإِلَيۡهِ تُرۡجَعُونَ', latin: "Wa mā liya lā a'budul-lażī faṭaranī wa ilaihi turja'ūn", terjemahan: 'Dan mengapa aku tidak menyembah (Allah) yang telah menciptakanku dan hanya kepada-Nyalah kamu (semua) akan dikembalikan?' },
  { n: 23, arab: 'ءَأَتَّخِذُ مِن دُونِهِۦٓ ءَالِهَةً إِن يُرِدۡنِ ٱلرَّحۡمَٰنُ بِضُرٍّ لَّا تُغۡنِ عَنِّي شَفَٰعَتُهُمۡ شَيۡـٔٗا وَلَا يُنقِذُونِ', latin: "A'attakhiżu min dūnihī ālihatan iy yuridnir-raḥmānu biḍurril lā tugnī 'annī šafā'atuhum šay'aw wa lā yunqiżūn", terjemahan: 'Apakah aku akan menjadikan selain-Nya sebagai tuhan? Jika Yang Maha Pengasih menghendaki bencana terhadapku, pasti pertolongan mereka tidak berguna sedikit pun bagi diriku dan mereka juga tidak dapat menyelamatkanku.' },
  { n: 24, arab: 'إِنِّيٓ إِذٗا لَّفِي ضَلَٰلٍ مُّبِينٍ', latin: "Innī iżal lafī ḍalālim mubīn", terjemahan: 'Sesungguhnya jika aku (berbuat) demikian, pastilah aku berada dalam kesesatan yang nyata.' },
  { n: 25, arab: 'إِنِّيٓ ءَامَنتُ بِرَبِّكُمۡ فَٱسۡمَعُونِ', latin: "Innī āmantu birabbikum fasma'ūn", terjemahan: 'Sesungguhnya aku telah beriman kepada Tuhanmu; maka dengarkanlah (pengakuan keimanan)ku.' },
  { n: 26, arab: 'قِيلَ ٱدۡخُلِ ٱلۡجَنَّةَۖ قَالَ يَٰلَيۡتَ قَوۡمِي يَعۡلَمُونَ', latin: "Qīladkhulil-jannata qāla yā laita qawmī ya'lamūn", terjemahan: 'Dikatakan (kepadanya), "Masuklah ke surga." Dia berkata, "Alangkah baiknya sekiranya kaumku mengetahui,"' },
  { n: 27, arab: 'بِمَا غَفَرَ لِي رَبِّي وَجَعَلَنِي مِنَ ٱلۡمُكۡرَمِينَ', latin: "Bimā gafara lī rabbī wa ja'alanī minal-mukramīn", terjemahan: 'tentang apa yang telah diampunkan Tuhanku kepadaku dan Dia telah menjadikan aku termasuk orang-orang yang dimuliakan.' },
  { n: 28, arab: 'وَمَآ أَنزَلۡنَا عَلَىٰ قَوۡمِهِۦ مِنۢ بَعۡدِهِۦ مِن جُندٍ مِّنَ ٱلسَّمَآءِ وَمَا كُنَّا مُنزِلِينَ', latin: "Wa mā anzalnā 'alā qawmihī mim ba'dihī min jundim minas-samā'i wa mā kunnā munzilīn", terjemahan: 'Dan setelah dia (mati), Kami tidak menurunkan suatu pasukan pun dari langit kepada kaumnya, dan Kami tidak perlu menurunkannya.' },
  { n: 29, arab: 'إِن كَانَتۡ إِلَّا صَيۡحَةٗ وَٰحِدَةٗ فَإِذَا هُمۡ خَٰمِدُونَ', latin: "In kānat illā ṣaiḥataw wāḥidatan fa'iżā hum khāmidūn", terjemahan: 'Hukuman itu tidak lain hanyalah satu teriakan saja, maka seketika itu mereka semua mati.' },
  { n: 30, arab: 'يَٰحَسۡرَةً عَلَى ٱلۡعِبَادِۚ مَا يَأۡتِيهِم مِّن رَّسُولٍ إِلَّا كَانُواْ بِهِۦ يَسۡتَهۡزِءُونَ', latin: "Yā ḥasratan 'alal-'ibādi mā ya'tīhim mir rasūlin illā kānū bihī yastahzi'ūn", terjemahan: 'Alangkah besarnya penyesalan terhadap hamba-hamba itu! Setiap kali seorang rasul datang kepada mereka, mereka selalu memperolok-oloknya.' },
  { n: 31, arab: 'أَلَمۡ يَرَوۡاْ كَمۡ أَهۡلَكۡنَا قَبۡلَهُم مِّنَ ٱلۡقُرُونِ أَنَّهُمۡ إِلَيۡهِمۡ لَا يَرۡجِعُونَ', latin: "Alam yaraw kam ahlaknā qablahum minal-qurūni annahum ilaihim lā yarji'ūn", terjemahan: 'Apakah mereka tidak memperhatikan berapa banyak umat-umat sebelum mereka yang telah Kami binasakan, bahwa mereka (yang telah dibinasakan) itu tidak ada yang kembali kepada mereka?' },
  { n: 32, arab: 'وَإِن كُلٌّ لَّمَّا جَمِيعٌ لَّدَيۡنَا مُحۡضَرُونَ', latin: "Wa in kullul lammā jamī'ul ladainā muḥḍarūn", terjemahan: 'Dan setiap umat, semuanya pasti akan dikumpulkan untuk menghadap kepada Kami.' },
  { n: 33, arab: 'وَءَايَةٌ لَّهُمُ ٱلۡأَرۡضُ ٱلۡمَيۡتَةُ أَحۡيَيۡنَٰهَا وَأَخۡرَجۡنَا مِنۡهَا حَبّٗا فَمِنۡهُ يَأۡكُلُونَ', latin: "Wa āyatul lahumul-arḍul-maitatu aḥyaināhā wa akhrajnā minhā ḥabban faminhu ya'kulūn", terjemahan: 'Dan suatu tanda (kebesaran Allah) bagi mereka adalah bumi yang mati (tandus). Kami hidupkan bumi itu dan Kami keluarkan darinya biji-bijian, maka dari (biji-bijian) itu mereka makan.' },
  { n: 34, arab: 'وَجَعَلۡنَا فِيهَا جَنَّٰتٍ مِّن نَّخِيلٍ وَأَعۡنَٰبٍ وَفَجَّرۡنَا فِيهَا مِنَ ٱلۡعُيُونِ', latin: "Wa ja'alnā fīhā jannātim min nakhīliw wa a'nābiw wa fajjarnā fīhā minal-'uyūn", terjemahan: 'Dan Kami jadikan padanya kebun-kebun dari pohon kurma dan anggur, dan Kami pancarkan padanya beberapa mata air,' },
  { n: 35, arab: 'لِيَأۡكُلُواْ مِن ثَمَرِهِۦ وَمَا عَمِلَتۡهُ أَيۡدِيهِمۡۚ أَفَلَا يَشۡكُرُونَ', latin: "Liya'kulū min ṡamarihī wa mā 'amilat'hu aidīhim, afalā yasykurūn", terjemahan: 'agar mereka dapat makan dari buahnya, dan dari apa yang diusahakan oleh tangan mereka. Maka mengapa mereka tidak bersyukur?' },
  { n: 36, arab: 'سُبۡحَٰنَ ٱلَّذِي خَلَقَ ٱلۡأَزۡوَٰجَ كُلَّهَا مِمَّا تُنۢبِتُ ٱلۡأَرۡضُ وَمِنۡ أَنفُسِهِمۡ وَمِمَّا لَا يَعۡلَمُونَ', latin: "Subḥānal-lażī khalaqal-azwāja kullahā mimmā tunbitul-arḍu wa min anfusihim wa mimmā lā ya'lamūn", terjemahan: 'Maha Suci (Allah) yang telah menciptakan semuanya berpasang-pasangan, baik dari apa yang ditumbuhkan oleh bumi dan dari diri mereka sendiri, maupun dari apa yang tidak mereka ketahui.' },
  { n: 37, arab: 'وَءَايَةٌ لَّهُمُ ٱلَّيۡلُ نَسۡلَخُ مِنۡهُ ٱلنَّهَارَ فَإِذَا هُم مُّظۡلِمُونَ', latin: "Wa āyatul lahumul-lailu naslakhu minhun-nahāra fa'iżā hum muẓlimūn", terjemahan: 'Dan suatu tanda (kebesaran Allah) bagi mereka adalah malam; Kami tanggalkan siang dari (malam) itu, maka seketika mereka dalam kegelapan.' },
  { n: 38, arab: 'وَٱلشَّمۡسُ تَجۡرِي لِمُسۡتَقَرٍّ لَّهَاۚ ذَٰلِكَ تَقۡدِيرُ ٱلۡعَزِيزِ ٱلۡعَلِيمِ', latin: "Wasy-syamsu tajrī limustaqarril lahā, żālika taqdīrul-'azīzil-'alīm", terjemahan: 'Dan matahari berjalan di tempat peredarannya. Demikianlah ketetapan (Allah) Yang Mahaperkasa, Maha Mengetahui.' },
  { n: 39, arab: 'وَٱلۡقَمَرَ قَدَّرۡنَٰهُ مَنَازِلَ حَتَّىٰ عَادَ كَٱلۡعُرۡجُونِ ٱلۡقَدِيمِ', latin: "Wal-qamara qaddarnāhu manāzila ḥattā 'āda kal-'urjūnil-qadīm", terjemahan: 'Dan telah Kami tetapkan tempat peredaran bagi bulan, sehingga (setelah ia sampai ke tempat peredaran yang terakhir) kembalilah ia seperti bentuk tandan yang tua.' },
  { n: 40, arab: 'لَا ٱلشَّمۡسُ يَنۢبَغِي لَهَآ أَن تُدۡرِكَ ٱلۡقَمَرَ وَلَا ٱلَّيۡلُ سَابِقُ ٱلنَّهَارِۚ وَكُلٌّ فِي فَلَكٍ يَسۡبَحُونَ', latin: "Las-syamsu yambaġī lahā an tudrikal-qamara wa lal-lailu sābiqun-nahār, wa kullun fī falakiy yasbaḥūn", terjemahan: 'Tidaklah mungkin bagi matahari mendapatkan bulan dan malam pun tidak dapat mendahului siang. Dan masing-masing beredar pada garis edarnya.' },
  { n: 41, arab: 'وَءَايَةٌ لَّهُمۡ أَنَّا حَمَلۡنَا ذُرِّيَّتَهُمۡ فِي ٱلۡفُلۡكِ ٱلۡمَشۡحُونِ', latin: "Wa āyatul lahum annā ḥamalnā żurriyyatahum fil-fulkil-masyḥūn", terjemahan: 'Dan suatu tanda (kebesaran Allah) bagi mereka adalah bahwa Kami angkut keturunan mereka dalam kapal yang penuh muatan.' },
  { n: 42, arab: 'وَخَلَقۡنَا لَهُم مِّن مِّثۡلِهِۦ مَا يَرۡكَبُونَ', latin: "Wa khalaqnā lahum mim miṡlihī mā yarkabūn", terjemahan: 'dan Kami ciptakan (juga) untuk mereka (angkutan lain) seperti apa yang mereka kendarai.' },
  { n: 43, arab: 'وَإِن نَّشَأۡ نُغۡرِقۡهُمۡ فَلَا صَرِيخَ لَهُمۡ وَلَا هُمۡ يُنقَذُونَ', latin: "Wa in nasya' nugriqhum falā ṣarīkha lahum wa lā hum yunqażūn", terjemahan: 'Dan jika Kami menghendaki niscaya Kami tenggelamkan mereka, maka tidak ada penolong bagi mereka dan tidak pula mereka diselamatkan,' },
  { n: 44, arab: 'إِلَّا رَحۡمَةٗ مِّنَّا وَمَتَٰعًا إِلَىٰ حِينٍ', latin: "Illā raḥmatam minnā wa matā'an ilā ḥīn", terjemahan: 'melainkan (Kami selamatkan mereka) karena rahmat dari Kami dan untuk memberikan kesenangan hidup sampai waktu tertentu.' },
  { n: 45, arab: 'وَإِذَا قِيلَ لَهُمُ ٱتَّقُواْ مَا بَيۡنَ أَيۡدِيكُمۡ وَمَا خَلۡفَكُمۡ لَعَلَّكُمۡ تُرۡحَمُونَ', latin: "Wa iżā qīla lahumuttaqū mā baina aidīkum wa mā khalfakum la'allakum turḥamūn", terjemahan: 'Dan apabila dikatakan kepada mereka, "Takutlah kamu akan siksa yang ada di hadapanmu (di dunia) dan siksa yang ada di belakangmu (di akhirat) agar kamu mendapat rahmat."' },
  { n: 46, arab: 'وَمَا تَأۡتِيهِم مِّنۡ ءَايَةٍ مِّنۡ ءَايَٰتِ رَبِّهِمۡ إِلَّا كَانُواْ عَنۡهَا مُعۡرِضِينَ', latin: "Wa mā ta'tīhim min āyatim min āyāti rabbihim illā kānū 'anhā mu'riḍīn", terjemahan: 'Dan setiap kali suatu tanda dari tanda-tanda (kebesaran) Tuhannya sampai kepada mereka, mereka selalu berpaling darinya.' },
  { n: 47, arab: 'وَإِذَا قِيلَ لَهُمۡ أَنفِقُواْ مِمَّا رَزَقَكُمُ ٱللَّهُ قَالَ ٱلَّذِينَ كَفَرُواْ لِلَّذِينَ ءَامَنُوٓاْ أَنُطۡعِمُ مَن لَّوۡ يَشَآءُ ٱللَّهُ أَطۡعَمَهُۥٓ إِنۡ أَنتُمۡ إِلَّا فِي ضَلَٰلٍ مُّبِينٍ', latin: "Wa iżā qīla lahum anfiqū mimmā razaqakumullāhu qālal-lażīna kafarū lil-lażīna āmanū anuṭ'imu mal lau yasyā'ullāhu aṭ'amahū in antum illā fī ḍalālim mubīn", terjemahan: 'Dan apabila dikatakan kepada mereka, "Infakkanlah sebagian dari rezeki yang diberikan Allah kepadamu," orang-orang kafir itu berkata kepada orang-orang beriman, "Apakah pantas kami memberi makan kepada orang yang jika Allah menghendaki akan diberi-Nya makan? Kamu tidak lain hanyalah dalam kesesatan yang nyata."' },
  { n: 48, arab: 'وَيَقُولُونَ مَتَىٰ هَٰذَا ٱلۡوَعۡدُ إِن كُنتُمۡ صَٰدِقِينَ', latin: "Wa yaqūlūna matā hāżal-wa'du in kuntum ṣādiqīn", terjemahan: 'Dan mereka berkata, "Kapan (datangnya) janji (hari berbangkit) ini, jika kamu orang-orang yang benar?"' },
  { n: 49, arab: 'مَا يَنظُرُونَ إِلَّا صَيۡحَةٗ وَٰحِدَةٗ تَأۡخُذُهُمۡ وَهُمۡ يَخِصِّمُونَ', latin: "Mā yanẓurūna illā ṣaiḥataw wāḥidatan ta'khużuhum wa hum yakhiṣṣimūn", terjemahan: 'Mereka tidak menunggu kecuali satu teriakan saja yang akan membinasakan mereka ketika mereka sedang bertengkar.' },
  { n: 50, arab: 'فَلَا يَسۡتَطِيعُونَ تَوۡصِيَةٗ وَلَآ إِلَىٰٓ أَهۡلِهِمۡ يَرۡجِعُونَ', latin: "Falā yastaṭī'ūna tawṣiyataw wa lā ilā ahlihim yarji'ūn", terjemahan: 'Lalu mereka tidak mampu membuat suatu wasiat dan tidak (pula) dapat kembali kepada keluarganya.' },
  { n: 51, arab: 'وَنُفِخَ فِي ٱلصُّورِ فَإِذَا هُم مِّنَ ٱلۡأَجۡدَاثِ إِلَىٰ رَبِّهِمۡ يَنسِلُونَ', latin: "Wa nufikha fiṣ-ṣūri fa'iżā hum minal-ajdāṡi ilā rabbihim yansilūn", terjemahan: 'Dan sangkakala pun ditiup, maka seketika itu mereka keluar dari kubur menuju Tuhannya.' },
  { n: 52, arab: 'قَالُواْ يَٰوَيۡلَنَا مَنۢ بَعَثَنَا مِن مَّرۡقَدِنَاۜۗ هَٰذَا مَا وَعَدَ ٱلرَّحۡمَٰنُ وَصَدَقَ ٱلۡمُرۡسَلُونَ', latin: "Qālū yā wailanā mam ba'aṡanā mim marqadinā, hāżā mā wa'adar-raḥmānu wa ṣadaqal-mursalūn", terjemahan: 'Mereka berkata, "Betapa celakanya kami! Siapakah yang membangkitkan kami dari tempat tidur kami (kubur)?" Inilah yang dijanjikan (Allah) Yang Maha Pengasih dan benarlah rasul-rasul(-Nya).' },
  { n: 53, arab: 'إِن كَانَتۡ إِلَّا صَيۡحَةٗ وَٰحِدَةٗ فَإِذَا هُمۡ جَمِيعٌ لَّدَيۡنَا مُحۡضَرُونَ', latin: "In kānat illā ṣaiḥataw wāḥidatan fa'iżā hum jamī'ul ladainā muḥḍarūn", terjemahan: 'Teriakan itu hanya satu kali saja, maka seketika itu mereka semua dikumpulkan di hadapan Kami.' },
  { n: 54, arab: 'فَٱلۡيَوۡمَ لَا تُظۡلَمُ نَفۡسٌ شَيۡـٔٗا وَلَا تُجۡزَوۡنَ إِلَّا مَا كُنتُمۡ تَعۡمَلُونَ', latin: "Fal-yawma lā tuẓlamu nafsun syai'aw wa lā tujzawna illā mā kuntum ta'malūn", terjemahan: 'Maka pada hari itu seseorang tidak akan dirugikan sedikit pun dan kamu tidak dibalas kecuali dengan apa yang telah kamu kerjakan.' },
  { n: 55, arab: 'إِنَّ أَصۡحَٰبَ ٱلۡجَنَّةِ ٱلۡيَوۡمَ فِي شُغُلٍ فَٰكِهُونَ', latin: "Inna aṣḥābal-jannatil-yawma fī syuglin fākihūn", terjemahan: 'Sesungguhnya penghuni surga pada hari itu bersenang-senang dalam kesibukan (mereka).' },
  { n: 56, arab: 'هُمۡ وَأَزۡوَٰجُهُمۡ فِي ظِلَٰلٍ عَلَى ٱلۡأَرَآئِكِ مُتَّكِـُٔونَ', latin: "Hum wa azwājuhum fī ẓilālin 'alal-arā'iki muttaki'ūn", terjemahan: 'Mereka dan pasangan-pasangannya berada dalam tempat yang teduh, bersandar di atas dipan-dipan.' },
  { n: 57, arab: 'لَهُمۡ فِيهَا فَٰكِهَةٌ وَلَهُم مَّا يَدَّعُونَ', latin: "Lahum fīhā fākihatuw wa lahum mā yadda'ūn", terjemahan: 'Di sana mereka memperoleh buah-buahan dan memperoleh apa saja yang mereka inginkan.' },
  { n: 58, arab: 'سَلَٰمٌ قَوۡلٗا مِّن رَّبٍّ رَّحِيمٍ', latin: "Salāmun qawlam mir rabbir raḥīm", terjemahan: '"Salam," sebagai ucapan selamat dari Tuhan Yang Maha Penyayang.' },
  { n: 59, arab: 'وَٱمۡتَٰزُواْ ٱلۡيَوۡمَ أَيُّهَا ٱلۡمُجۡرِمُونَ', latin: "Wamtāzul-yawma ayyuhal-mujrimūn", terjemahan: 'Dan (dikatakan kepada orang-orang kafir), "Berpisahlah kamu (dari orang-orang mukmin) pada hari ini, wahai orang-orang yang berbuat jahat."' },
  { n: 60, arab: 'أَلَمۡ أَعۡهَدۡ إِلَيۡكُمۡ يَٰبَنِيٓ ءَادَمَ أَن لَّا تَعۡبُدُواْ ٱلشَّيۡطَٰنَۖ إِنَّهُۥ لَكُمۡ عَدُوٌّ مُّبِينٌ', latin: "Alam a'had ilaikum yā banī ādama al lā ta'budusy-syaiṭāna innahū lakum 'aduwwum mubīn", terjemahan: 'Bukankah Aku telah memerintahkan kepadamu wahai anak cucu Adam agar kamu tidak menyembah setan? Sungguh, setan itu musuh yang nyata bagi kamu,' },
  { n: 61, arab: 'وَأَنِ ٱعۡبُدُونِيۚ هَٰذَا صِرَٰطٌ مُّسۡتَقِيمٌ', latin: "Wa ani'budūnī, hāżā ṣirāṭum mustaqīm", terjemahan: 'dan hendaklah kamu menyembah-Ku. Inilah jalan yang lurus.' },
  { n: 62, arab: 'وَلَقَدۡ أَضَلَّ مِنكُمۡ جِبِلّٗا كَثِيرًاۖ أَفَلَمۡ تَكُونُواْ تَعۡقِلُونَ', latin: "Wa laqad aḍalla minkum jibillang kaṡīrā, afalam takūnū ta'qilūn", terjemahan: 'Dan sungguh, setan itu telah menyesatkan sebagian besar di antara kamu. Apakah kamu tidak mengerti?' },
  { n: 63, arab: 'هَٰذِهِۦ جَهَنَّمُ ٱلَّتِي كُنتُمۡ تُوعَدُونَ', latin: "Hāżihī jahannamul-latī kuntum tū'adūn", terjemahan: 'Inilah (neraka) Jahanam yang dahulu diancamkan kepadamu.' },
  { n: 64, arab: 'ٱصۡلَوۡهَا ٱلۡيَوۡمَ بِمَا كُنتُمۡ تَكۡفُرُونَ', latin: "Iṣlawhāl-yawma bimā kuntum takfurūn", terjemahan: 'Masuklah ke dalamnya pada hari ini karena dulu kamu mengingkarinya.' },
  { n: 65, arab: 'ٱلۡيَوۡمَ نَخۡتِمُ عَلَىٰٓ أَفۡوَٰهِهِمۡ وَتُكَلِّمُنَآ أَيۡدِيهِمۡ وَتَشۡهَدُ أَرۡجُلُهُم بِمَا كَانُواْ يَكۡسِبُونَ', latin: "Al-yawma nakhtimu 'alā afwāhihim wa tukallimunā aidīhim wa tasyhadu arjuluhum bimā kānū yaksibūn", terjemahan: 'Pada hari ini Kami tutup mulut mereka; tangan mereka akan berkata kepada Kami dan kaki mereka akan memberi kesaksian terhadap apa yang dulu mereka kerjakan.' },
  { n: 66, arab: 'وَلَوۡ نَشَآءُ لَطَمَسۡنَا عَلَىٰٓ أَعۡيُنِهِمۡ فَٱسۡتَبَقُواْ ٱلصِّرَٰطَ فَأَنَّىٰ يُبۡصِرُونَ', latin: "Wa law nasyā'u laṭammasnā 'alā a'yunihim fastabaquṣ-ṣirāṭa fa'annā yubṣirūn", terjemahan: 'Dan kalau Kami menghendaki pastilah Kami hapuskan penglihatan mata mereka; sehingga mereka berlomba-lomba (mencari) jalan, maka bagaimana mungkin mereka dapat melihat?' },
  { n: 67, arab: 'وَلَوۡ نَشَآءُ لَمَسَخۡنَٰهُمۡ عَلَىٰ مَكَانَتِهِمۡ فَمَا ٱسۡتَطَٰعُواْ مُضِيًّا وَلَا يَرۡجِعُونَ', latin: "Wa law nasyā'u lamasakhnāhum 'alā makānatihim famastaṭā'ū muḍiyyaw wa lā yarji'ūn", terjemahan: 'Dan kalau Kami menghendaki, pastilah Kami rubah mereka di tempat mereka berada; sehingga mereka tidak sanggup berjalan lagi dan tidak (pula) sanggup kembali.' },
  { n: 68, arab: 'وَمَن نُّعَمِّرۡهُ نُنَكِّسۡهُ فِي ٱلۡخَلۡقِۚ أَفَلَا يَعۡقِلُونَ', latin: "Wa man nu'ammirhu nunakkishu fil-khalq, afalā ya'qilūn", terjemahan: 'Dan barang siapa Kami panjangkan umurnya, niscaya Kami lemahkan dia. Apakah mereka tidak mengerti?' },
  { n: 69, arab: 'وَمَا عَلَّمۡنَٰهُ ٱلشِّعۡرَ وَمَا يَنۢبَغِي لَهُۥٓۚ إِنۡ هُوَ إِلَّا ذِكۡرٌ وَقُرۡءَانٌ مُّبِينٌ', latin: "Wa mā 'allamnāhusy-syi'ra wa mā yambaġī lahu, in huwa illā żikruw wa qur'ānum mubīn", terjemahan: 'Dan Kami tidak mengajarkan syair kepadanya (Muhammad) dan bersyair itu tidaklah pantas baginya. Al-Qur\'an itu tidak lain hanyalah pelajaran dan kitab yang jelas,' },
  { n: 70, arab: 'لِيُنذِرَ مَن كَانَ حَيًّا وَيَحِقَّ ٱلۡقَوۡلُ عَلَى ٱلۡكَٰفِرِينَ', latin: "Liyunżira man kāna ḥayyaw wa yaḥiqqal-qawlu 'alal-kāfirīn", terjemahan: 'untuk memberi peringatan kepada orang yang hidup dan agar tetap (ketetapan azab) terhadap orang-orang kafir.' },
  { n: 71, arab: 'أَوَلَمۡ يَرَوۡاْ أَنَّا خَلَقۡنَا لَهُم مِّمَّا عَمِلَتۡ أَيۡدِينَآ أَنۡعَٰمٗا فَهُمۡ لَهَا مَٰلِكُونَ', latin: "Awalam yaraw annā khalaqnā lahum mimmā 'amilat aidīnā an'āman fahum lahā mālikūn", terjemahan: 'Dan tidakkah mereka melihat bahwa Kami telah menciptakan hewan ternak untuk mereka, yaitu di antara apa yang Kami ciptakan dengan kekuasaan Kami, sehingga mereka menjadi pemiliknya?' },
  { n: 72, arab: 'وَذَلَّلۡنَٰهَا لَهُمۡ فَمِنۡهَا رَكُوبُهُمۡ وَمِنۡهَا يَأۡكُلُونَ', latin: "Wa żallalnāhā lahum faminhā rakūbuhum wa minhā ya'kulūn", terjemahan: 'Dan Kami tundukkan (hewan-hewan) itu untuk mereka; di antaranya ada yang menjadi tunggangan mereka dan ada yang mereka makan.' },
  { n: 73, arab: 'وَلَهُمۡ فِيهَا مَنَٰفِعُ وَمَشَارِبُۖ أَفَلَا يَشۡكُرُونَ', latin: "Wa lahum fīhā manāfi'u wa masyāribu afalā yasykurūn", terjemahan: 'Dan mereka memperoleh berbagai manfaat dan minuman dari hewan ternak itu. Apakah mereka tidak bersyukur?' },
  { n: 74, arab: 'وَٱتَّخَذُواْ مِن دُونِ ٱللَّهِ ءَالِهَةٗ لَّعَلَّهُمۡ يُنصَرُونَ', latin: "Wattakhażū min dūnillāhi ālihatallā'allahum yunṣarūn", terjemahan: 'Dan mereka mengambil sembahan-sembahan selain Allah, agar mereka mendapat pertolongan.' },
  { n: 75, arab: 'لَا يَسۡتَطِيعُونَ نَصۡرَهُمۡ وَهُمۡ لَهُمۡ جُندٌ مُّحۡضَرُونَ', latin: "Lā yastaṭī'ūna naṣrahum wa hum lahum jundum muḥḍarūn", terjemahan: 'Mereka (sembahan-sembahan) itu tidak mampu menolong mereka, padahal mereka sendiri menjadi tentara yang disiapkan untuk menjaga sembahan-sembahan itu.' },
  { n: 76, arab: 'فَلَا يَحۡزُنكَ قَوۡلُهُمۡۘ إِنَّا نَعۡلَمُ مَا يُسِرُّونَ وَمَا يُعۡلِنُونَ', latin: "Falā yaḥzunka qawluhum, innā na'lamu mā yusirrūna wa mā yu'linūn", terjemahan: 'Maka janganlah ucapan mereka menyedihkan engkau. Sungguh, Kami mengetahui apa yang mereka rahasiakan dan apa yang mereka nyatakan.' },
  { n: 77, arab: 'أَوَلَمۡ يَرَ ٱلۡإِنسَٰنُ أَنَّا خَلَقۡنَٰهُ مِن نُّطۡفَةٍ فَإِذَا هُوَ خَصِيمٌ مُّبِينٌ', latin: "Awalam yaral-insānu annā khalaqnāhu min nuṭfatin fa'iżā huwa khaṣīmum mubīn", terjemahan: 'Apakah manusia tidak memperhatikan bahwa Kami menciptakannya dari setetes mani, ternyata dia menjadi musuh yang nyata?' },
  { n: 78, arab: 'وَضَرَبَ لَنَا مَثَلٗا وَنَسِيَ خَلۡقَهُۥۖ قَالَ مَن يُحۡيِ ٱلۡعِظَٰمَ وَهِيَ رَمِيمٌ', latin: "Wa ḍaraba lanā maṡalaw wa nasiya khalqahu qāla may yuḥyil-'iẓāma wa hiya ramīm", terjemahan: 'Dan dia membuat perumpamaan bagi Kami dan melupakan asal kejadiannya; dia berkata, "Siapakah yang dapat menghidupkan tulang-belulang, yang telah hancur luluh?"' },
  { n: 79, arab: 'قُلۡ يُحۡيِيهَا ٱلَّذِيٓ أَنشَأَهَآ أَوَّلَ مَرَّةٍۖ وَهُوَ بِكُلِّ خَلۡقٍ عَلِيمٌ', latin: "Qul yuḥyīhal-lażī ansya'ahā awwala marratin wa huwa bikulli khalqin 'alīm", terjemahan: 'Katakanlah, "Yang akan menghidupkannya ialah (Allah) yang menciptakannya pertama kali. Dan Dia Maha Mengetahui tentang segala makhluk."' },
  { n: 80, arab: 'ٱلَّذِي جَعَلَ لَكُم مِّنَ ٱلشَّجَرِ ٱلۡأَخۡضَرِ نَارٗا فَإِذَآ أَنتُم مِّنۡهُ تُوقِدُونَ', latin: "Al-lażī ja'ala lakum minasy-syajaril-akhḍari nāran fa'iżā antum minhu tūqidūn", terjemahan: 'Yaitu (Allah) yang menjadikan api untukmu dari kayu yang hijau, sehingga seketika itu kamu nyalakan (api) dari kayu itu.' },
  { n: 81, arab: 'أَوَلَيۡسَ ٱلَّذِي خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضَ بِقَٰدِرٍ عَلَىٰٓ أَن يَخۡلُقَ مِثۡلَهُمۚ بَلَىٰ وَهُوَ ٱلۡخَلَّٰقُ ٱلۡعَلِيمُ', latin: "Awa laisal-lażī khalaqas-samāwāti wal-arḍa biqādirin 'alā ay yakhluqa miṡlahum, balā wa huwal-khallāqul-'alīm", terjemahan: 'Bukankah (Allah) yang menciptakan langit dan bumi, mampu menciptakan kembali yang serupa itu (jasad mereka yang telah hancur)? Benar, dan Dia Maha Pencipta, Maha Mengetahui.' },
  { n: 82, arab: 'إِنَّمَآ أَمۡرُهُۥٓ إِذَآ أَرَادَ شَيۡـًٔا أَن يَقُولَ لَهُۥ كُن فَيَكُونُ', latin: "Innamā amruhū iżā arāda syai'an ay yaqūla lahū kun fayakūn", terjemahan: 'Sesungguhnya urusan-Nya apabila Dia menghendaki sesuatu Dia hanya berkata kepadanya, "Jadilah!" Maka jadilah sesuatu itu.' },
  { n: 83, arab: 'فَسُبۡحَٰنَ ٱلَّذِي بِيَدِهِۦ مَلَكُوتُ كُلِّ شَيۡءٍ وَإِلَيۡهِ تُرۡجَعُونَ', latin: "Fasub-ḥānal-lażī biyadihī malakūtu kulli syay'iw wa ilaihi turja'ūn", terjemahan: 'Maka Mahasuci (Allah) yang di tangan-Nya kekuasaan atas segala sesuatu dan kepada-Nyalah kamu dikembalikan.' },
]

// ============================================================
// VALIDASI DATASET
// ============================================================
export function validateYasin() {
  const errors = []
  const ayat = SURAT_YASIN.filter(e => e.n >= 1)
  const basmalah = SURAT_YASIN.find(e => e.n === 0)

  // Basmalah wajib ada
  if (!basmalah)
    errors.push("Basmalah (n=0) tidak ditemukan")

  // Jumlah ayat harus 83
  if (ayat.length !== 83)
    errors.push(`Jumlah ayat: ${ayat.length} (harus 83)`)

  // Nomor ayat harus 1–83 berurutan tanpa lompat atau duplikat
  const nums = ayat.map(e => e.n).sort((a, b) => a - b)
  nums.forEach((n, i) => {
    if (n !== i + 1)
      errors.push(`Urutan ayat rusak: posisi ${i + 1} berisi n=${n}`)
  })
  const seen = new Set()
  nums.forEach(n => {
    if (seen.has(n)) errors.push(`Nomor ayat duplikat: ${n}`)
    seen.add(n)
  })

  // Setiap ayat harus punya arab, latin, terjemahan
  SURAT_YASIN.forEach(e => {
    if (!e.arab  || !e.arab.trim())  errors.push(`n=${e.n}: arab kosong`)
    if (!e.latin || !e.latin.trim()) errors.push(`n=${e.n}: latin kosong`)
    if (!e.terjemahan || !e.terjemahan.trim()) errors.push(`n=${e.n}: terjemahan kosong`)
    // Teks Arab tidak boleh mengandung huruf Latin
    if (e.arab && /[a-zA-Z]/.test(e.arab))
      errors.push(`n=${e.n}: teks Arab mengandung huruf Latin`)
    // Karakter Unicode rusak
    if (e.arab && e.arab.includes('\uFFFD'))
      errors.push(`n=${e.n}: karakter rusak (U+FFFD) di arab`)
  })

  if (errors.length > 0)
    errors.forEach(e => console.error('[yasin.js] validateYasin:', e))

  return { valid: errors.length === 0, errors, totalAyat: ayat.length }
}

// Jalankan validasi otomatis di luar produksi
if (import.meta.env.DEV) {
  validateYasin()
}
