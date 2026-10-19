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
];
