import type { Puzzle } from './game';

// Seviye: 0 = kolay (sarı), 1 = orta (yeşil), 2 = zor (mavi), 3 = en zor (mor).
// Her bulmacada bazı kelimeler bilerek birden fazla gruba uyuyor gibi görünür (tuzak);
// ama 16 kelimeyi 4'erli gruplara ayırmanın tek bir doğru yolu vardır.
export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    groups: [
      { level: 0, title: 'Meyveler', words: ['ELMA', 'ARMUT', 'ERİK', 'AYVA'] },
      { level: 1, title: 'Mutfak aletleri', words: ['TENCERE', 'TAVA', 'KEPÇE', 'RENDE'] },
      { level: 2, title: 'İstanbul ilçeleri', words: ['BEŞİKTAŞ', 'KADIKÖY', 'ÜSKÜDAR', 'FATİH'] },
      { level: 3, title: 'Bir nota ile başlar', words: ['DOMATES', 'REÇEL', 'MİSAFİR', 'SOLUCAN'] },
    ],
  },
  {
    id: 2,
    groups: [
      { level: 0, title: 'Kuşlar', words: ['SERÇE', 'KARGA', 'MARTI', 'BAYKUŞ'] },
      { level: 1, title: 'Burçlar', words: ['KOÇ', 'BOĞA', 'YENGEÇ', 'TERAZİ'] },
      { level: 2, title: 'Satranç taşları', words: ['ŞAH', 'VEZİR', 'KALE', 'FİL'] },
      { level: 3, title: 'Futbol takımı lakapları', words: ['ASLAN', 'KARTAL', 'KANARYA', 'FIRTINA'] },
    ],
  },
  {
    id: 3,
    groups: [
      { level: 0, title: 'Sebzeler', words: ['PATATES', 'HAVUÇ', 'ISPANAK', 'PATLICAN'] },
      { level: 1, title: 'Tatlılar', words: ['BAKLAVA', 'KÜNEFE', 'SÜTLAÇ', 'AŞURE'] },
      { level: 2, title: 'Kahvaltılıklar', words: ['ZEYTİN', 'BAL', 'KAYMAK', 'SUCUK'] },
      { level: 3, title: 'Kebap çeşitleri', words: ['ADANA', 'İSKENDER', 'BEYTİ', 'TANDIR'] },
    ],
  },
  {
    id: 4,
    groups: [
      { level: 0, title: 'Vücut bölümleri', words: ['KOL', 'BACAK', 'KULAK', 'BURUN'] },
      { level: 1, title: 'Müzik aletleri', words: ['BAĞLAMA', 'KEMAN', 'DAVUL', 'ZURNA'] },
      { level: 2, title: 'Balıklar', words: ['HAMSİ', 'LÜFER', 'PALAMUT', 'KILIÇ'] },
      { level: 3, title: 'Bir vücut bölümüyle başlar', words: ['ELMAS', 'KAŞAR', 'BELGE', 'BAŞAK'] },
    ],
  },
  {
    id: 5,
    groups: [
      { level: 0, title: 'Hava durumu', words: ['KAR', 'DOLU', 'SİS', 'FIRTINA'] },
      { level: 1, title: 'Ağaçlar', words: ['ÇAM', 'MEŞE', 'KAVAK', 'SÖĞÜT'] },
      { level: 2, title: 'Su kütleleri', words: ['GÖL', 'NEHİR', 'ŞELALE', 'KÖRFEZ'] },
      { level: 3, title: 'Aynı zamanda insan adı', words: ['DENİZ', 'IRMAK', 'ÇINAR', 'YAĞMUR'] },
    ],
  },
  {
    id: 6,
    groups: [
      { level: 0, title: 'Okul eşyaları', words: ['KALEM', 'SİLGİ', 'DEFTER', 'CETVEL'] },
      { level: 1, title: 'İskambil kâğıtları', words: ['AS', 'PAPAZ', 'KIZ', 'VALE'] },
      { level: 2, title: 'Osmanlı padişahları', words: ['OSMAN', 'ORHAN', 'MEHMET', 'SELİM'] },
      { level: 3, title: 'Padişah lakapları', words: ['YAVUZ', 'KANUNİ', 'FATİH', 'YILDIRIM'] },
    ],
  },
  {
    id: 7,
    groups: [
      { level: 0, title: 'İçecekler', words: ['ÇAY', 'KAHVE', 'AYRAN', 'ŞALGAM'] },
      { level: 1, title: 'Baharat ve otlar', words: ['KİMYON', 'NANE', 'SUMAK', 'KEKİK'] },
      { level: 2, title: 'Dağlar', words: ['AĞRI', 'ERCİYES', 'ULUDAĞ', 'PALANDÖKEN'] },
      { level: 3, title: 'Adıyla bilinen şarkıcılar', words: ['TARKAN', 'SEZEN', 'AJDA', 'MÜSLÜM'] },
    ],
  },
  {
    id: 8,
    groups: [
      { level: 0, title: 'Toplu taşıma', words: ['OTOBÜS', 'METRO', 'VAPUR', 'TAKSİ'] },
      { level: 1, title: 'Top ile oynanan sporlar', words: ['VOLEYBOL', 'HENTBOL', 'BASKETBOL', 'TENİS'] },
      { level: 2, title: 'İller', words: ['VAN', 'MUŞ', 'BOLU', 'RİZE'] },
      { level: 3, title: 'Göller', words: ['TUZ', 'EĞİRDİR', 'BEYŞEHİR', 'İZNİK'] },
    ],
  },
  {
    id: 9,
    groups: [
      { level: 0, title: 'Gezegenler', words: ['MARS', 'VENÜS', 'SATÜRN', 'JÜPİTER'] },
      { level: 1, title: 'Haftanın günleri', words: ['PAZAR', 'SALI', 'CUMA', 'PERŞEMBE'] },
      { level: 2, title: 'Dört işlem', words: ['TOPLAMA', 'ÇARPMA', 'BÖLME', 'ÇIKARMA'] },
      { level: 3, title: 'Alışveriş yerleri', words: ['ÇARŞI', 'MAĞAZA', 'BAKKAL', 'MARKET'] },
    ],
  },
  {
    id: 10,
    groups: [
      { level: 0, title: 'Meslekler', words: ['DOKTOR', 'ÖĞRETMEN', 'AŞÇI', 'PİLOT'] },
      { level: 1, title: 'Hastanede', words: ['SERUM', 'SEDYE', 'ŞIRINGA', 'STETOSKOP'] },
      { level: 2, title: 'İnşaat malzemeleri', words: ['ÇİMENTO', 'TUĞLA', 'MOLOZ', 'KİREÇ'] },
      { level: 3, title: '___ saati', words: ['KUM', 'DUVAR', 'KOL', 'CEP'] },
    ],
  },
  {
    id: 11,
    groups: [
      { level: 0, title: 'Çiçekler', words: ['GÜL', 'LALE', 'PAPATYA', 'MENEKŞE'] },
      { level: 1, title: 'Takılar', words: ['KOLYE', 'YÜZÜK', 'KÜPE', 'BİLEZİK'] },
      { level: 2, title: 'Kumaşlar', words: ['İPEK', 'KADİFE', 'PAMUK', 'KETEN'] },
      { level: 3, title: 'Değerli taşlar', words: ['YAKUT', 'ZÜMRÜT', 'SAFİR', 'ELMAS'] },
    ],
  },
  {
    id: 12,
    groups: [
      { level: 0, title: 'Deniz canlıları', words: ['AHTAPOT', 'KÖPEKBALIĞI', 'MİDYE', 'ISTAKOZ'] },
      { level: 1, title: 'Peynirler', words: ['KAŞAR', 'TULUM', 'LOR', 'ÇEÇİL'] },
      { level: 2, title: 'Yazar soyadları', words: ['NESİN', 'TANPINAR', 'PAMUK', 'ATAY'] },
      { level: 3, title: 'Peygamberler', words: ['YUNUS', 'MUSA', 'İSA', 'NUH'] },
    ],
  },
  {
    id: 13,
    groups: [
      { level: 0, title: 'Mevsimler', words: ['İLKBAHAR', 'YAZ', 'SONBAHAR', 'KIŞ'] },
      { level: 1, title: 'Bilgisayar donanımı', words: ['FARE', 'KLAVYE', 'EKRAN', 'YAZICI'] },
      { level: 2, title: 'Kemirgenler', words: ['SİNCAP', 'HAMSTER', 'KUNDUZ', 'SIÇAN'] },
      { level: 3, title: 'Bankacılık', words: ['KASA', 'FAİZ', 'KREDİ', 'HESAP'] },
    ],
  },
  {
    id: 14,
    groups: [
      { level: 0, title: 'Renkler', words: ['KIRMIZI', 'MAVİ', 'YEŞİL', 'BEYAZ'] },
      { level: 1, title: 'Futbolda cezalar', words: ['KART', 'FAUL', 'PENALTI', 'OFSAYT'] },
      { level: 2, title: 'Hayvan yavruları', words: ['KUZU', 'OĞLAK', 'BUZAĞI', 'SIPA'] },
      { level: 3, title: '___ deniz', words: ['KARA', 'AK', 'KIZIL', 'ÖLÜ'] },
    ],
  },
  {
    id: 15,
    groups: [
      { level: 0, title: 'Kış giysileri', words: ['MONT', 'ATKI', 'BERE', 'ELDİVEN'] },
      { level: 1, title: 'Plajda', words: ['ŞEMSİYE', 'MAYO', 'ŞEZLONG', 'KUM'] },
      { level: 2, title: 'Arabada', words: ['DİREKSİYON', 'FREN', 'KORNA', 'VİTES'] },
      { level: 3, title: 'Hamamda', words: ['KESE', 'HAVLU', 'PEŞTEMAL', 'KURNA'] },
    ],
  },
  {
    id: 16,
    groups: [
      { level: 0, title: 'Okul dersleri', words: ['MATEMATİK', 'FİZİK', 'TARİH', 'COĞRAFYA'] },
      { level: 1, title: 'Elektrik birimleri', words: ['VOLT', 'AMPER', 'WATT', 'OHM'] },
      { level: 2, title: 'Ünlü bilim insanları', words: ['NEWTON', 'EINSTEIN', 'CURIE', 'TESLA'] },
      { level: 3, title: 'Türk bilim insanları', words: ['SANCAR', 'ARF', 'ARIKAN', 'YAŞARGİL'] },
    ],
  },
  {
    id: 17,
    groups: [
      { level: 0, title: 'Kahvaltı', words: ['PEYNİR', 'ZEYTİN', 'YUMURTA', 'REÇEL'] },
      { level: 1, title: 'Hamur işleri', words: ['BÖREK', 'POĞAÇA', 'SİMİT', 'AÇMA'] },
      { level: 2, title: 'Yumurta yemekleri', words: ['OMLET', 'ÇILBIR', 'KAYGANA', 'SAHANDA'] },
      { level: 3, title: 'İzmir ilçeleri', words: ['MENEMEN', 'ÇEŞME', 'URLA', 'FOÇA'] },
    ],
  },
  {
    id: 18,
    groups: [
      { level: 0, title: 'Geometrik şekiller', words: ['ÜÇGEN', 'KARE', 'ALTIGEN', 'ELİPS'] },
      { level: 1, title: 'Evin bölümleri', words: ['SALON', 'MUTFAK', 'BANYO', 'BALKON'] },
      { level: 2, title: 'Konut türleri', words: ['VİLLA', 'DAİRE', 'YALI', 'KÖŞK'] },
      { level: 3, title: 'İstanbul sarayları', words: ['TOPKAPI', 'DOLMABAHÇE', 'ÇIRAĞAN', 'YILDIZ'] },
    ],
  },
  {
    id: 19,
    groups: [
      { level: 0, title: 'Organlar', words: ['KALP', 'AKCİĞER', 'BÖBREK', 'DALAK'] },
      { level: 1, title: 'Kâğıt oyunları', words: ['BATAK', 'PİŞTİ', 'POKER', 'BRİÇ'] },
      { level: 2, title: 'Tavla terimleri', words: ['PUL', 'ZAR', 'MARS', 'ŞEŞ'] },
      { level: 3, title: 'KARA ile başlar', words: ['KARACİĞER', 'KARAKOL', 'KARANFİL', 'KARABÜK'] },
    ],
  },
  {
    id: 20,
    groups: [
      { level: 0, title: 'Çiftlik hayvanları', words: ['İNEK', 'KOYUN', 'KEÇİ', 'TAVUK'] },
      { level: 1, title: 'Böcekler', words: ['ARI', 'KARINCA', 'SİVRİSİNEK', 'HAMAMBÖCEĞİ'] },
      { level: 2, title: 'Arıdan gelenler', words: ['BAL', 'POLEN', 'PROPOLİS', 'MUM'] },
      { level: 3, title: 'İçinde bir sayı saklı', words: ['BEŞİK', 'ONUR', 'ALTIN', 'İKİZ'] },
    ],
  },
  {
    id: 21,
    groups: [
      { level: 0, title: 'Kuruyemişler', words: ['FINDIK', 'FISTIK', 'CEVİZ', 'BADEM'] },
      { level: 1, title: 'Karadeniz lezzetleri', words: ['HAMSİ', 'MIHLAMA', 'KARALAHANA', 'LAZBÖREĞİ'] },
      { level: 2, title: 'Karadeniz illeri', words: ['RİZE', 'GİRESUN', 'ORDU', 'TRABZON'] },
      { level: 3, title: 'Askerî rütbeler', words: ['ONBAŞI', 'ÇAVUŞ', 'YÜZBAŞI', 'BİNBAŞI'] },
    ],
  },
  {
    id: 22,
    groups: [
      { level: 0, title: 'Duygular', words: ['SEVİNÇ', 'ÖFKE', 'ÜZÜNTÜ', 'KORKU'] },
      { level: 1, title: 'Film türleri', words: ['KOMEDİ', 'DRAM', 'AKSİYON', 'GERİLİM'] },
      { level: 2, title: 'Film festivali şehirleri', words: ['CANNES', 'VENEDİK', 'BERLİN', 'ANTALYA'] },
      { level: 3, title: 'Sinema terimleri', words: ['SAHNE', 'KAMERA', 'SENARYO', 'KURGU'] },
    ],
  },
  {
    id: 23,
    groups: [
      { level: 0, title: 'Sofrada', words: ['ÇATAL', 'BIÇAK', 'TABAK', 'BARDAK'] },
      { level: 1, title: 'Ağırlık ölçüleri', words: ['KİLO', 'TON', 'ONS', 'LİBRE'] },
      { level: 2, title: 'Halk oyunları', words: ['HORON', 'ZEYBEK', 'HALAY', 'KAŞIK'] },
      { level: 3, title: 'Önüne "mili" gelir', words: ['GRAM', 'LİTRE', 'METRE', 'SANİYE'] },
    ],
  },
  {
    id: 24,
    groups: [
      { level: 0, title: 'Kıtalar', words: ['ASYA', 'AVRUPA', 'AFRİKA', 'OKYANUSYA'] },
      { level: 1, title: 'Başkentler', words: ['PARİS', 'MADRİT', 'ATİNA', 'LİZBON'] },
      { level: 2, title: 'Yunan tanrıları', words: ['ZEUS', 'HERA', 'APOLLON', 'HERMES'] },
      { level: 3, title: 'İtalyan futbol kulüpleri', words: ['ROMA', 'LAZİO', 'JUVENTUS', 'MİLAN'] },
    ],
  },
  {
    id: 25,
    groups: [
      { level: 0, title: 'Elektronik cihazlar', words: ['TELEFON', 'TABLET', 'TELEVİZYON', 'BİLGİSAYAR'] },
      { level: 1, title: 'İş hayatı', words: ['PATRON', 'MAAŞ', 'MESAİ', 'İZİN'] },
      { level: 2, title: 'Gönderi', words: ['PUL', 'POSTA', 'ADRES', 'KARGO'] },
      { level: 3, title: 'Sözcük türleri', words: ['ZARF', 'SIFAT', 'FİİL', 'ZAMİR'] },
    ],
  },
  {
    id: 26,
    groups: [
      { level: 0, title: 'Evcil hayvanlar', words: ['KEDİ', 'KÖPEK', 'TAVŞAN', 'KAPLUMBAĞA'] },
      { level: 1, title: 'Masal kahramanları', words: ['KELOĞLAN', 'PİNOKYO', 'KÜLKEDİSİ', 'KIRMIZI BAŞLIKLI KIZ'] },
      { level: 2, title: 'Uçabilen hayvanlar', words: ['YARASA', 'KELEBEK', 'SİNEK', 'PAPAĞAN'] },
      { level: 3, title: 'La Fontaine masallarından', words: ['TİLKİ', 'KARGA', 'AĞUSTOSBÖCEĞİ', 'KARINCA'] },
    ],
  },
  {
    id: 27,
    groups: [
      { level: 0, title: 'Ülkeler', words: ['JAPONYA', 'BREZİLYA', 'KANADA', 'HİNDİSTAN'] },
      { level: 1, title: 'Tahıllar', words: ['BUĞDAY', 'ARPA', 'ÇAVDAR', 'MISIR'] },
      { level: 2, title: 'Kümes hayvanları', words: ['TAVUK', 'HİNDİ', 'ÖRDEK', 'KAZ'] },
      { level: 3, title: 'İçinde bir ülke saklı', words: ['PERUK', 'MALİYE', 'ÇADIR', 'ROMAN'] },
    ],
  },
  {
    id: 28,
    groups: [
      { level: 0, title: 'Giysiler', words: ['GÖMLEK', 'PANTOLON', 'ETEK', 'CEKET'] },
      { level: 1, title: 'Ayakkabılar', words: ['ÇİZME', 'TERLİK', 'SANDALET', 'PATİK'] },
      { level: 2, title: 'Deniz taşıtları', words: ['GEMİ', 'VAPUR', 'KAYIK', 'BOT'] },
      { level: 3, title: 'Aksesuarlar', words: ['KEMER', 'KRAVAT', 'ŞAPKA', 'ATKI'] },
    ],
  },
  {
    id: 29,
    groups: [
      { level: 0, title: 'Tatlar', words: ['TATLI', 'TUZLU', 'EKŞİ', 'ACI'] },
      { level: 1, title: 'Çiçekler', words: ['GÜL', 'NERGİS', 'ORKİDE', 'ZAMBAK'] },
      { level: 2, title: 'Baharatlar', words: ['TARÇIN', 'ZENCEFİL', 'ZERDEÇAL', 'KARANFİL'] },
      { level: 3, title: 'Şeker çeşitleri', words: ['KESME', 'TOZ', 'PUDRA', 'KÜP'] },
    ],
  },
  {
    id: 30,
    groups: [
      { level: 0, title: 'Müzik türleri', words: ['ROCK', 'POP', 'CAZ', 'ARABESK'] },
      { level: 1, title: 'Ressamlar', words: ['PICASSO', 'DALİ', 'MONET', 'REMBRANDT'] },
      { level: 2, title: 'Danslar', words: ['TANGO', 'VALS', 'ZEYBEK', 'FLAMENKO'] },
      { level: 3, title: 'Soslar', words: ['KETÇAP', 'MAYONEZ', 'PESTO', 'SALSA'] },
    ],
  },
  {
    id: 31,
    groups: [
      { level: 0, title: 'Okyanuslar', words: ['PASİFİK', 'HİNT', 'ARKTİK', 'ATLANTİK'] },
      { level: 1, title: 'Edebî türler', words: ['ROMAN', 'ŞİİR', 'DENEME', 'ÖYKÜ'] },
      { level: 2, title: 'Başvuru kitapları', words: ['ATLAS', 'SÖZLÜK', 'ANSİKLOPEDİ', 'ALMANAK'] },
      { level: 3, title: 'Tersten de aynı okunur', words: ['KABAK', 'KAZAK', 'KEPEK', 'NEDEN'] },
    ],
  },
  {
    id: 32,
    groups: [
      { level: 0, title: 'Bireysel sporlar', words: ['YÜZME', 'OKÇULUK', 'ESKRİM', 'BOKS'] },
      { level: 1, title: 'Yüzme stilleri', words: ['SERBEST', 'KURBAĞALAMA', 'SIRTÜSTÜ', 'KELEBEK'] },
      { level: 2, title: 'Böcekler', words: ['UĞURBÖCEĞİ', 'ÇEKİRGE', 'YUSUFÇUK', 'ATEŞBÖCEĞİ'] },
      { level: 3, title: 'Satranç terimleri', words: ['ROK', 'MAT', 'PAT', 'GAMBİT'] },
    ],
  },
  {
    id: 33,
    groups: [
      { level: 0, title: 'Çorbalar', words: ['EZOGELİN', 'TARHANA', 'YAYLA', 'İŞKEMBE'] },
      { level: 1, title: 'Bakliyat', words: ['NOHUT', 'FASULYE', 'BARBUNYA', 'MERCİMEK'] },
      { level: 2, title: 'Yer şekilleri', words: ['OVA', 'VADİ', 'KANYON', 'PLATO'] },
      { level: 3, title: 'Halk ozanları', words: ['KARACAOĞLAN', 'PİR SULTAN', 'DADALOĞLU', 'VEYSEL'] },
    ],
  },
  {
    id: 34,
    groups: [
      { level: 0, title: 'Zaman birimleri', words: ['SANİYE', 'DAKİKA', 'SAAT', 'HAFTA'] },
      { level: 1, title: 'Uzay', words: ['ROKET', 'UYDU', 'ASTRONOT', 'GÖKTAŞI'] },
      { level: 2, title: 'Ay evreleri', words: ['HİLAL', 'DOLUNAY', 'YENİAY', 'İLKDÖRDÜN'] },
      { level: 3, title: 'Türk bayrağında', words: ['AY', 'YILDIZ', 'KIRMIZI', 'BEYAZ'] },
    ],
  },
  {
    id: 35,
    groups: [
      { level: 0, title: 'Okulda', words: ['TENEFFÜS', 'KARNE', 'ÖDEV', 'SINAV'] },
      { level: 1, title: 'Resmî belgeler', words: ['KİMLİK', 'PASAPORT', 'EHLİYET', 'DİPLOMA'] },
      { level: 2, title: 'Seyahat', words: ['BAVUL', 'BİLET', 'OTEL', 'REHBER'] },
      { level: 3, title: 'Saatin parçaları', words: ['AKREP', 'YELKOVAN', 'KADRAN', 'ZEMBEREK'] },
    ],
  },
  {
    id: 36,
    groups: [
      { level: 0, title: 'Pişirme yöntemleri', words: ['HAŞLAMA', 'KIZARTMA', 'KAVURMA', 'BUĞULAMA'] },
      { level: 1, title: 'Akrabalar', words: ['TEYZE', 'HALA', 'DAYI', 'AMCA'] },
      { level: 2, title: 'Kahve çeşitleri', words: ['MENENGİÇ', 'DİBEK', 'ESPRESSO', 'FİLTRE'] },
      { level: 3, title: 'Hababam Sınıfı karakterleri', words: ['İNEK ŞABAN', 'DAMAT FERİT', 'GÜDÜK NECMİ', 'KEL MAHMUT'] },
    ],
  },
  {
    id: 37,
    groups: [
      { level: 0, title: 'Telefon aksesuarları', words: ['ŞARJ', 'KILIF', 'KULAKLIK', 'POWERBANK'] },
      { level: 1, title: 'Klavye tuşları', words: ['ENTER', 'SHIFT', 'ESC', 'TAB'] },
      { level: 2, title: 'Futbol mevkileri', words: ['KALECİ', 'DEFANS', 'ORTA SAHA', 'FORVET'] },
      { level: 3, title: 'Türk müziği makamları', words: ['HİCAZ', 'RAST', 'UŞŞAK', 'NİHAVENT'] },
    ],
  },
  {
    id: 38,
    groups: [
      { level: 0, title: 'Kırtasiye', words: ['ZIMBA', 'MAKAS', 'YAPIŞTIRICI', 'ATAŞ'] },
      { level: 1, title: 'Berberde', words: ['TARAK', 'USTURA', 'FÖN', 'KÖPÜK'] },
      { level: 2, title: 'Ressamın malzemeleri', words: ['TUVAL', 'PALET', 'ŞÖVALE', 'FIRÇA'] },
      { level: 3, title: 'Türk ressamlar', words: ['ABİDİN DİNO', 'OSMAN HAMDİ', 'FİKRET MUALLA', 'BEDRİ RAHMİ'] },
    ],
  },
  {
    id: 39,
    groups: [
      { level: 0, title: 'Yaz meyveleri', words: ['KAVUN', 'KARPUZ', 'ŞEFTALİ', 'KAYISI'] },
      { level: 1, title: 'Kış meyveleri', words: ['PORTAKAL', 'MANDALİNA', 'NAR', 'GREYFURT'] },
      { level: 2, title: 'Kurusu da yenir', words: ['DUT', 'İNCİR', 'ÜZÜM', 'HURMA'] },
      { level: 3, title: 'Bahçe aletleri', words: ['TIRPAN', 'KÜREK', 'ÇAPA', 'TIRMIK'] },
    ],
  },
  {
    id: 40,
    groups: [
      { level: 0, title: 'Hava taşıtları', words: ['UÇAK', 'HELİKOPTER', 'ZEPLİN', 'PLANÖR'] },
      { level: 1, title: 'Doğum günü', words: ['PASTA', 'MUM', 'HEDİYE', 'BALON'] },
      { level: 2, title: 'Düğün hazırlığı', words: ['NİKÂH', 'KINA', 'ÇEYİZ', 'DAVETİYE'] },
      { level: 3, title: 'İtalyan mutfağı', words: ['PİZZA', 'RİSOTTO', 'LAZANYA', 'TİRAMİSU'] },
    ],
  },
  {
    id: 41,
    groups: [
      { level: 0, title: 'Ev aletleri', words: ['BUZDOLABI', 'FIRIN', 'ÜTÜ', 'SÜPÜRGE'] },
      { level: 1, title: 'Ekmek çeşitleri', words: ['PİDE', 'LAVAŞ', 'BAZLAMA', 'SOMUN'] },
      { level: 2, title: 'Gemide', words: ['DÜMEN', 'ÇAPA', 'DİREK', 'PERVANE'] },
      { level: 3, title: 'Pide çeşitleri', words: ['KIYMALI', 'KAŞARLI', 'KUŞBAŞILI', 'SUCUKLU'] },
    ],
  },
  {
    id: 42,
    groups: [
      { level: 0, title: 'Sınıfta', words: ['TAHTA', 'SIRA', 'TEBEŞİR', 'KÜRSÜ'] },
      { level: 1, title: 'Marangoz aletleri', words: ['TESTERE', 'RENDE', 'ÇEKİÇ', 'KESER'] },
      { level: 2, title: 'Masa oyunları', words: ['TAVLA', 'SATRANÇ', 'DAMA', 'MANGALA'] },
      { level: 3, title: 'Bir renkle başlar', words: ['MORAL', 'ALEV', 'BOZA', 'AKŞAM'] },
    ],
  },
  {
    id: 43,
    groups: [
      { level: 0, title: 'Hayvanat bahçesinde', words: ['ZEBRA', 'ZÜRAFA', 'FİL', 'GERGEDAN'] },
      { level: 1, title: 'Avustralya', words: ['SİDNEY', 'BUMERANG', 'KOALA', 'KANGURU'] },
      { level: 2, title: 'Tuz çeşitleri', words: ['KAYA', 'DENİZ', 'HİMALAYA', 'SOFRA'] },
      { level: 3, title: 'Shakespeare karakterleri', words: ['HAMLET', 'OTELLO', 'MACBETH', 'ROMEO'] },
    ],
  },
  {
    id: 44,
    groups: [
      { level: 0, title: 'Dişçide', words: ['DOLGU', 'KAPLAMA', 'İMPLANT', 'KÖPRÜ'] },
      { level: 1, title: 'Televizyon', words: ['KANAL', 'KUMANDA', 'ANTEN', 'DİZİ'] },
      { level: 2, title: 'Gitarın parçaları', words: ['PERDE', 'SAP', 'PENA', 'TEL'] },
      { level: 3, title: 'Sahne sanatları', words: ['OPERA', 'BALE', 'PANDOMİM', 'MÜZİKAL'] },
    ],
  },
  {
    id: 45,
    groups: [
      { level: 0, title: 'İstanbul simgeleri', words: ['AYASOFYA', 'GALATA KULESİ', 'KIZ KULESİ', 'YEREBATAN'] },
      { level: 1, title: 'Antik Mısır', words: ['PİRAMİT', 'SFENKS', 'FİRAVUN', 'NİL'] },
      { level: 2, title: 'Nehirler', words: ['TUNA', 'FIRAT', 'DİCLE', 'AMAZON'] },
      { level: 3, title: "Paris'te", words: ['EYFEL', 'LOUVRE', 'NOTRE DAME', 'ŞANZELİZE'] },
    ],
  },
  {
    id: 46,
    groups: [
      { level: 0, title: 'Hastalıklar', words: ['GRİP', 'NEZLE', 'KIZAMIK', 'SUÇİÇEĞİ'] },
      { level: 1, title: 'İlaç biçimleri', words: ['ŞURUP', 'MERHEM', 'KAPSÜL', 'İĞNE'] },
      { level: 2, title: 'Ekranlı cihazlar', words: ['TELEFON', 'MONİTÖR', 'TELEVİZYON', 'TABLET'] },
      { level: 3, title: 'Misafire ikram', words: ['KOLONYA', 'LOKUM', 'KAHVE', 'ŞEKER'] },
    ],
  },
  {
    id: 47,
    groups: [
      { level: 0, title: 'Şehirde yollar', words: ['CADDE', 'SOKAK', 'MEYDAN', 'BULVAR'] },
      { level: 1, title: 'İstanbul semtleri', words: ['TAKSİM', 'BEYAZIT', 'SULTANAHMET', 'EMİNÖNÜ'] },
      { level: 2, title: 'Ankara semtleri', words: ['KIZILAY', 'ÇANKAYA', 'ULUS', 'KEÇİÖREN'] },
      { level: 3, title: 'İzmir semtleri', words: ['KORDON', 'ALSANCAK', 'KARŞIYAKA', 'BORNOVA'] },
    ],
  },
  {
    id: 48,
    groups: [
      { level: 0, title: 'Mutfak ölçüleri', words: ['BARDAK', 'KAŞIK', 'KASE', 'TUTAM'] },
      { level: 1, title: 'Türk kahvesi', words: ['CEZVE', 'KÖPÜK', 'TELVE', 'FİNCAN'] },
      { level: 2, title: 'Banyoda', words: ['KÜVET', 'LAVABO', 'DUŞ', 'KLOZET'] },
      { level: 3, title: 'Yönetmen soyadları', words: ['CEYLAN', 'ERKSAN', 'AKAD', 'GÜNEY'] },
    ],
  },
  {
    id: 49,
    groups: [
      { level: 0, title: 'Pusulada', words: ['KUZEY', 'DOĞU', 'BATI', 'İBRE'] },
      { level: 1, title: 'Rüzgârlar', words: ['POYRAZ', 'LODOS', 'KEŞİŞLEME', 'KARAYEL'] },
      { level: 2, title: 'Gemide yer adları', words: ['İSKELE', 'PRUVA', 'KIÇ', 'GÜVERTE'] },
      { level: 3, title: 'Bayrak anlamında', words: ['SANCAK', 'FLAMA', 'BANDIRA', 'ALEM'] },
    ],
  },
  {
    id: 50,
    groups: [
      { level: 0, title: 'Oyuncaklar', words: ['BEBEK', 'TOP', 'UÇURTMA', 'ROBOT'] },
      { level: 1, title: 'Sokak oyunları', words: ['SAKLAMBAÇ', 'YAKAN TOP', 'SEK SEK', 'İP ATLAMA'] },
      { level: 2, title: 'Bebek bakımı', words: ['BEZ', 'EMZİK', 'MAMA', 'BİBERON'] },
      { level: 3, title: 'Nasreddin Hoca fıkralarından', words: ['KAZAN', 'YORGAN', 'MAYA', 'KÜRK'] },
    ],
  },
];
