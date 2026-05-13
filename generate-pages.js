// Rulează cu: node generate-pages.js
// Generează toate cele 41 de pagini HTML SEO în folderul public\

const fs = require('fs');
const path = require('path');

const cities = [
  {
    slug: 'alba-iulia', name: 'Alba Iulia', county: 'Alba', judet: 'județul Alba',
    context: 'iernile friguroase și drumurile sărate din zona cetății',
    problem: 'Iernile aspre din Alba Iulia, cu temperaturi care coboară frecvent sub -10°C și sare abundentă pe șosele, distrug rapid plasticele exterioare ale mașinii. Razele UV puternice din timpul verii agravează și mai mult decolorarea.',
    unique1: 'Șoferii din Alba Iulia știu că drumurile spre cetate și autostrada A10 înseamnă expunere constantă la praf, sare și variații termice extreme.',
    reviews: [
      { name: 'Mihai D.', car: 'VW Golf 2017', text: 'Am aplicat pe bara față și oglinzi. Diferența e uriașă — negru intens, ca nou. Livrare în 24h exact cum au promis!', stars: 5 },
      { name: 'Ioana P.', car: 'Dacia Logan 2019', text: 'Plasticele mașinii mele erau albe de la soare. După un singur tratament arată ca mașina unui vecin cumpărată ieri. Recomand!', stars: 5 },
      { name: 'Radu M.', car: 'Ford Focus 2016', text: 'Produsul e excelent. Simplu de aplicat, rezultat profesional. O să mai comand.', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează tratamentul ceramic pe mașini expuse iernilor din Alba Iulia?', a: 'Da — formula nano-ceramică formează o barieră impermeabilă care rezistă la sare, gheață și temperaturi extreme. Protecția durează 2+ ani chiar și în condiții dure de iarnă.' },
      { q: 'Cât durează livrarea în Alba Iulia?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare. Poți alege livrare la ușă sau la cel mai apropiat EasyBox.' },
      { q: 'Pot aplica produsul pe orice tip de plastic exterior?', a: 'Da — bare de protecție, praguri, oglinzi, grile, bandouri laterale, stergătoare. Orice plastic exterior negru sau gri.' },
      { q: 'Ce se întâmplă dacă plouă după aplicare?', a: 'Produsul trebuie să se usuce 2-3 ore. După uscare, apa și murdăria alunecă de pe suprafață datorită efectului hidrofob.' },
    ],
  },
  {
    slug: 'alexandria', name: 'Alexandria', county: 'Teleorman', judet: 'județul Teleorman',
    context: 'verile caniculare și soarele intens din Câmpia Română',
    problem: 'Alexandria se află în inima Câmpiei Române, unde verile sunt caniculare cu temperaturi ce depășesc 40°C. Expunerea prelungită la UV și căldura extremă decolorează și crăpă plasticele mașinii mult mai rapid decât în alte zone.',
    unique1: 'Drumurile din județul Teleorman și traficul intens din Alexandria înseamnă praf, nămol și expunere constantă la soare pentru plasticele mașinii tale.',
    reviews: [
      { name: 'Constantin F.', car: 'Skoda Octavia 2018', text: 'Verile din Alexandria distrug repede mașina. WOW NanoCeramic m-a salvat — plasticele arată impecabil după un an!', stars: 5 },
      { name: 'Elena V.', car: 'Renault Megane 2020', text: 'Am fost sceptică dar am comandat. Rezultatul m-a uimit. Recomandat tuturor din Alexandria!', stars: 5 },
      { name: 'Gheorghe T.', car: 'Opel Astra 2015', text: 'Rapid, eficient, prețul corect. Livrare în ziua următoare. Mulțumit 100%.', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează ceramicul plasticele de soarele intens din Teleorman?', a: 'Absolut — filtrul UV nano-ceramic blochează razele ultraviolete care cauzează decolorarea și crăparea plasticelor. Ideal pentru zonele cu expunere solară intensă ca Alexandria.' },
      { q: 'Cât durează livrarea în Alexandria?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare direct acasă sau la EasyBox.' },
      { q: 'Câte aplicări conține un flacon?', a: 'Un flacon de 50ml este suficient pentru 2-3 aplicări complete pe o mașină standard, sau 4-6 aplicări dacă tratezi doar elementele principale.' },
      { q: 'Produsul se spală la ploaie?', a: 'Nu — spre deosebire de dressingurile pe bază de silicon, formula ceramică formează o legătură permanentă cu plasticul. Ploaia nu îl afectează.' },
    ],
  },
  {
    slug: 'arad', name: 'Arad', county: 'Arad', judet: 'județul Arad',
    context: 'traficul internațional intens și clima vestică variabilă',
    problem: 'Aradul este un nod major de trafic internațional — autostrada A1 și granița cu Ungaria înseamnă că mașinile sunt expuse constant la praf de drum, nămol și variații climatice bruște specifice vestului României.',
    unique1: 'Șoferii din Arad parcurg zilnic distanțe mari pe autostrăzi și drumuri europene. Plasticele mașinii sunt printre primele afectate de microimpacturi, murdărie și variații de temperatură.',
    reviews: [
      { name: 'Bogdan S.', car: 'BMW Seria 3 2019', text: 'Fac frecvent Arad-Timișoara. Plasticele sufereau mult. WOW NanoCeramic le-a salvat literalmente. Arată ca nou!', stars: 5 },
      { name: 'Adriana M.', car: 'Toyota Yaris 2021', text: 'Comandă simplă, livrare rapidă în Arad, produs excelent. Recomand cu căldură!', stars: 5 },
      { name: 'Florin N.', car: 'Peugeot 308 2017', text: 'Am încercat multe produse. Acesta este singurul care a dat rezultate vizibile din prima aplicare.', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru mașini care circulă frecvent pe autostradă?', a: 'Da — bariera nano-ceramică rezistă la microimpacturi, praf de drum și murdărie specifică traficului intens de autostradă.' },
      { q: 'Cât durează livrarea în Arad?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în tot județul Arad.' },
      { q: 'Funcționează și pe plastic gri, nu doar negru?', a: 'Da — produsul funcționează pe orice culoare de plastic exterior, readucând adâncimea culorii originale indiferent de nuanță.' },
      { q: 'Trebuie să spăl mașina înainte de aplicare?', a: 'Recomandat — kit-ul include soluție de degresare IPA pentru pregătirea suprafeței. Curățenia asigură o aderență maximă a ceramicului.' },
    ],
  },
  {
    slug: 'bacau', name: 'Bacău', county: 'Bacău', judet: 'județul Bacău',
    context: 'iernile moldovene și variațiile termice extreme',
    problem: 'Bacăul se confruntă cu ierni moldovene severe — ger, zăpadă abundentă și sare pe șosele timp de luni întregi. Combinat cu verile calde, aceste variații termice extreme sunt cele mai distructive pentru plasticele auto.',
    unique1: 'Drumurile din Moldova și traficul din zona industrială a Bacăului expun mașinile la condiții dure. Plasticele devin albe și crăpate mult mai repede decât în alte zone ale țării.',
    reviews: [
      { name: 'Andrei C.', car: 'Dacia Duster 2020', text: 'Iarna la Bacău e cruntă pentru mașini. De când folosesc WOW NanoCeramic nu mai am probleme cu plasticele. Mulțumesc!', stars: 5 },
      { name: 'Maria L.', car: 'Hyundai i30 2018', text: 'Livrare rapidă, produs de calitate. Am aplicat singură în 30 de minute. Rezultat spectaculos!', stars: 5 },
      { name: 'Vasile G.', car: 'Volkswagen Passat 2016', text: 'Cel mai bun produs pentru plastice pe care l-am testat. Durabil, rezistent la spălătorie auto.', stars: 5 },
    ],
    faqs: [
      { q: 'Rezistă tratamentul la iernile severe din Moldova?', a: 'Da — formula ceramică a fost testată la temperaturi de până la -25°C. Sarea și gheața nu afectează stratul protector.' },
      { q: 'Cât durează livrarea în Bacău?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Bacău și județele limitrofe.' },
      { q: 'Pot aplica tratamentul și iarna?', a: 'Recomandat temperaturi peste +5°C. La temperaturi mai scăzute, aplică în interior (garaj, parcare acoperită) și lasă să se usuce complet.' },
      { q: 'Cât timp durează efectul?', a: 'Protecția nano-ceramică durează 2+ ani în condiții normale de utilizare. Pentru rezultate optime, reaplică o dată pe an.' },
    ],
  },
  {
    slug: 'baia-mare', name: 'Baia Mare', county: 'Maramureș', judet: 'județul Maramureș',
    context: 'umiditatea ridicată și iernile maramureșene',
    problem: 'Baia Mare este cunoscută pentru umiditatea ridicată și ceața frecventă, factori care accelerează deteriorarea plasticelor auto. Combinat cu iernile aspre maramureșene și sarea de pe șosele, mașinile din zonă suferă mai mult decât media națională.',
    unique1: 'Zona montană a Maramureșului înseamnă drumuri de munte, variații bruște de temperatură și expunere la condiții climatice extreme care deteriorează rapid elementele exterioare ale mașinii.',
    reviews: [
      { name: 'Ioan P.', car: 'Mitsubishi Outlander 2019', text: 'Plasticele SUV-ului meu sufereau rău din cauza drumurilor de munte. WOW NanoCeramic le-a redat viața. Excelent!', stars: 5 },
      { name: 'Simona R.', car: 'Ford Kuga 2020', text: 'Produs de top, livrare rapidă în Baia Mare. Recomand oricui are probleme cu plasticele mașinii!', stars: 5 },
      { name: 'Traian B.', car: 'Renault Duster 2018', text: 'Am aplicat pe toate plasticele exterioare. Mașina arată cu 5 ani mai tânără. Valoare excelentă!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează în condiții de umiditate ridicată specifice Băii Mari?', a: 'Da — bariera ceramică este impermeabilă și hidrofobă. Umiditatea și ceața nu afectează stratul protector, dimpotrivă apa alunecă de pe suprafață.' },
      { q: 'Cât durează livrarea în Baia Mare?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Baia Mare și tot județul Maramureș.' },
      { q: 'Protejează și împotriva prafului de drum?', a: 'Da — suprafața ceramică este ultra-netedă, ceea ce face ca praful și murdăria să nu adere la plastic. Mașina rămâne curată mai mult timp.' },
      { q: 'Este sigur de folosit fără experiență?', a: 'Absolut — kit-ul vine cu instrucțiuni detaliate, lavetă și mănuși incluse. Aplicarea durează 20-30 minute și nu necesită nicio experiență.' },
    ],
  },
  {
    slug: 'bistrita', name: 'Bistrița', county: 'Bistrița-Năsăud', judet: 'județul Bistrița-Năsăud',
    context: 'iernile aspre și sarea abundentă pe șoselele din Transilvania de Nord',
    problem: 'Bistrița se confruntă cu ierni lungi și aspre, cu zăpadă abundentă și temperaturi negative prelungite. Sarea de pe șosele și drumurile de munte din județul Bistrița-Năsăud deteriorează rapid plasticele auto.',
    unique1: 'Drumurile din nordul Transilvaniei, inclusiv trecătorile montane din zonă, expun mașinile la condiții extreme de iarnă care lasă urme vizibile pe orice element de plastic exterior.',
    reviews: [
      { name: 'Alexandru T.', car: 'Skoda Kodiaq 2021', text: 'Iernile din Bistrița sunt grele pentru mașini. Acum nu mai am griji cu plasticele — WOW NanoCeramic le protejează perfect!', stars: 5 },
      { name: 'Nicoleta F.', car: 'Dacia Sandero 2019', text: 'Simplu de aplicat, rezultat uimitor. Plasticele arată ca la mașina nouă. Livrare rapidă!', stars: 5 },
      { name: 'Cristian O.', car: 'Audi A4 2017', text: 'Produs premium la preț accesibil. Recomand tuturor șoferilor din Bistrița!', stars: 5 },
    ],
    faqs: [
      { q: 'Cât de rezistent este la iernile din zona Bistrița-Năsăud?', a: 'Formula nano-ceramică rezistă la temperaturi extreme, sare, gheață și zăpadă. Protecția este activă tot sezonul rece fără aplicări suplimentare.' },
      { q: 'Cât durează livrarea în Bistrița?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Bistrița și tot județul Bistrița-Năsăud.' },
      { q: 'Funcționează pe mașini 4x4 și SUV?', a: 'Da — ideal pentru SUV-uri și mașini de teren care au mai multe suprafețe de plastic expuse și circulă pe drumuri neasfaltate.' },
      { q: 'Câte tratamente pot face cu un kit?', a: 'Un kit standard tratează complet 1-2 mașini. Dacă tratezi doar elementele principale (bare, oglinzi, praguri), ajunge pentru 3 mașini.' },
    ],
  },
  {
    slug: 'botosani', name: 'Botoșani', county: 'Botoșani', judet: 'județul Botoșani',
    context: 'iernile nordice severe cu ger prelungit',
    problem: 'Botoșaniul se numără printre cele mai reci zone ale României iarna. Gerul prelungit, zăpada și sarea de pe drumuri sunt factori care accelerează îmbătrânirea plasticelor auto mult mai repede decât în restul țării.',
    unique1: 'Apropierea de granița cu Republica Moldova și condițiile climatice extreme din nordul Moldovei fac din Botoșani una dintre zonele unde mașinile au cea mai mare nevoie de protecție.',
    reviews: [
      { name: 'Petru M.', car: 'Hyundai Tucson 2020', text: 'La Botoșani iarna e severă. WOW NanoCeramic a ținut plasticele mașinii în stare perfectă tot sezonul. Bravo!', stars: 5 },
      { name: 'Luminița C.', car: 'Opel Crossland 2021', text: 'Produsul depășește așteptările. Rapid de aplicat, durabil. Recomand cu drag!', stars: 5 },
      { name: 'Sorin A.', car: 'Volkswagen Golf 2018', text: 'Am testat mai multe produse. Acesta este cu adevărat diferit — legătură permanentă, nu se spală.', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva gerului din nordul Moldovei?', a: 'Da — formula ceramică rezistă la -25°C și mai jos. Nu se crăpă, nu se decojește și nu își pierde proprietățile la îngheț.' },
      { q: 'Cât durează livrarea în Botoșani?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Botoșani și tot județul.' },
      { q: 'Pot folosi produsul și pe plastic interior?', a: 'Produsul este optimizat pentru plastic exterior. Pentru interior există formule speciale. WOW NanoCeramic Restore & Protect este ideal pe suprafețele expuse la exterior.' },
      { q: 'Este nevoie de polish sau pregătire specială?', a: 'Nu este nevoie de polish. Curăță suprafața cu soluția de degresare inclusă în kit și aplică direct tratamentul ceramic.' },
    ],
  },
  {
    slug: 'braila', name: 'Brăila', county: 'Brăila', judet: 'județul Brăila',
    context: 'umiditatea de la Dunăre și vânturile puternice',
    problem: 'Brăila, oraș portuar pe Dunăre, se confruntă cu umiditate ridicată, vânturi puternice și variații termice specifice zonelor de câmpie joasă. Acești factori combinați accelerează deteriorarea plasticelor auto.',
    unique1: 'Aerul umed de la Dunăre și vânturile frecvente din Câmpia Dunărenii transportă particule fine de nisip și praf care zgârie și decolorează plasticele mașinilor parcate în aer liber.',
    reviews: [
      { name: 'Dumitru V.', car: 'Toyota RAV4 2019', text: 'Trăiesc lângă Dunăre și umiditatea face ravagii pe mașini. WOW NanoCeramic e exact ce căutam. Funcționează!', stars: 5 },
      { name: 'Gabriela S.', car: 'Seat Leon 2020', text: 'Livrare în Brăila în 24h. Produsul e fantastic. Plasticele arată nou-nouțe!', stars: 5 },
      { name: 'Marian T.', car: 'Kia Sportage 2018', text: 'Calitate excepțională la preț corect. Am recomandat deja la 5 prieteni din Brăila!', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva umidității și aerului de la Dunăre?', a: 'Da — bariera hidrofobă nano-ceramică respinge apa și umiditatea. Suprafața ceramizată nu permite depunerea sărurilor minerale din aer.' },
      { q: 'Cât durează livrarea în Brăila?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Brăila și tot județul.' },
      { q: 'Funcționează pe plastic alb sau deschis la culoare?', a: 'Da — produsul funcționează pe orice culoare de plastic, readucând profunzimea și strălucirea culorii originale.' },
      { q: 'Câte ore durează uscarea?', a: 'Produsul se usucă în 2-3 ore la temperatura camerei. Pentru o aderență maximă, evită apa în primele 6 ore după aplicare.' },
    ],
  },
  {
    slug: 'brasov', name: 'Brașov', county: 'Brașov', judet: 'județul Brașov',
    context: 'iernile montane severe și turismul intens',
    problem: 'Brașovul este una dintre cele mai reci și mai zăpadoase orașe din România. Iernile montane cu temperaturi sub -15°C, zăpadă abundentă și sare pe drumurile spre Poiana Brașov sau Predeal distrug rapid plasticele auto.',
    unique1: 'Traficul intens de turiști spre stațiunile montane din Brașov și Prahova, combinat cu drumurile de munte și sarea de pe șosele, fac din mașinile brașovenilor unele dintre cele mai expuse din România.',
    reviews: [
      { name: 'Sebastian K.', car: 'Audi Q5 2020', text: 'Iernile la Brașov sunt dure pentru mașini. WOW NanoCeramic a schimbat totul — plasticele arată perfect și după sezonul de ski!', stars: 5 },
      { name: 'Diana N.', car: 'BMW X3 2019', text: 'Produs excelent pentru condițiile montane. Livrare rapidă, aplicare ușoară, rezultat profesional!', stars: 5 },
      { name: 'Liviu P.', car: 'Subaru Forester 2018', text: 'Cel mai bun produs pentru protecție plastic pe care l-am găsit în România. Recomand 100%!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează pe mașini expuse iernilor montane din Brașov?', a: 'Absolut — formula ceramică a fost testată în condiții alpine. Rezistă la zăpadă, gheață, sare și temperaturi sub zero fără probleme.' },
      { q: 'Cât durează livrarea în Brașov?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Brașov, Poiana Brașov și tot județul.' },
      { q: 'Pot aplica produsul și pe plastic mat (nelucios)?', a: 'Da — funcționează excelent pe plastic mat, readucând culoarea adâncă și aspect fără să adauge un luciu artificial nedorit.' },
      { q: 'Este rezistent la spălătoriile auto cu presiune?', a: 'Da — legătura ceramică este permanentă și rezistă la spălare cu presiune înaltă, detergenți auto și ceară.' },
    ],
  },
  {
    slug: 'bucuresti', name: 'București', county: 'Ilfov', judet: 'Municipiul București',
    context: 'traficul intens și poluarea urbană',
    problem: 'Bucureștiul are cel mai intens trafic din România — milioane de mașini zilnic înseamnă poluare, praf, noxe și particule fine care se depun pe plasticele auto. Verile caniculare cu +40°C accelerează decolorarea, iar iernile cu sare distrug suprafețele.',
    unique1: 'Șoferii din București petrec ore întregi în trafic, expuși constant la noxe, praf de frână și particule fine. Plasticele exterioare sunt primele care arată îmbătrânirea prematură a mașinii.',
    reviews: [
      { name: 'Alexandru P.', car: 'BMW Seria 5 2020', text: 'Traficul din București distruge mașinile. WOW NanoCeramic le protejează perfect. Plasticele arată impecabil după 8 luni!', stars: 5 },
      { name: 'Roxana M.', car: 'Mercedes GLA 2021', text: 'Livrare în București în aceeași zi! Produsul e fantastic. Recomand tuturor din Capitală!', stars: 5 },
      { name: 'Octavian D.', car: 'Audi A6 2019', text: 'Investiție mică, rezultat mare. Plasticele mașinii mele arată ca la showroom după tratament.', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva poluării urbane din București?', a: 'Da — bariera ceramică formează un scut invizibil împotriva noxelor, prafului de frână și particulelor fine specifice traficului urban intens.' },
      { q: 'Cât durează livrarea în București?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în tot Bucureștiul și județul Ilfov.' },
      { q: 'Funcționează pe mașini parcate în aer liber?', a: 'Da — ideal pentru mașinile parcate pe stradă, expuse la poluare, UV și variații termice. Protecția durează 2+ ani.' },
      { q: 'Pot aplica în parcare subterană?', a: 'Da — nu necesită lumină solară pentru uscare. O parcare subterană ventilată este perfectă pentru aplicare.' },
    ],
  },
  {
    slug: 'buzau', name: 'Buzău', county: 'Buzău', judet: 'județul Buzău',
    context: 'variațiile termice extreme din zona subcarpatică',
    problem: 'Buzăul este situat la intersecția dintre Câmpia Română și Subcarpați, ceea ce înseamnă variații termice extreme — veri toride și ierni cu ger și sare. Aceste condiții sunt deosebit de agresive pentru plasticele auto.',
    unique1: 'Drumurile din județul Buzău, inclusiv cele spre zona Munteniei și Moldovei, expun mașinile la condiții diverse și dure, de la praf de câmpie vara până la gheață și sare iarna.',
    reviews: [
      { name: 'Nicu V.', car: 'Dacia Lodgy 2019', text: 'Plasticele mașinii mele erau un dezastru după iarna trecută. WOW NanoCeramic le-a salvat în 30 de minute!', stars: 5 },
      { name: 'Florentina M.', car: 'Ford EcoSport 2020', text: 'Produsul e senzațional. Ușor de aplicat, rezultat imediat vizibil. Livrat rapid în Buzău!', stars: 5 },
      { name: 'Valentin C.', car: 'Nissan Juke 2018', text: 'Raport calitate-preț excelent. Am aplicat și pe mașina soției. Ambele arată perfect!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru condițiile climatice din zona Buzău?', a: 'Da — formula nano-ceramică face față atât căldurii extreme de vară cât și gerului și sării din iarnă, specific zonei Buzău.' },
      { q: 'Cât durează livrarea în Buzău?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Buzău și tot județul.' },
      { q: 'Pot aplica și pe plastic transparent (faruri)?', a: 'Produsul WOW NanoCeramic este optimizat pentru plastic negru/gri exterior. Pentru faruri există formule dedicate de restaurare policarbonat.' },
      { q: 'Cum aplic corect produsul?', a: 'Degresează suprafața cu soluția inclusă, aplică 2-3 picături pe laveta texturată și masează în mișcări circulare. Lasă să se usuce 2-3 ore. Simplu și rapid!' },
    ],
  },
  {
    slug: 'calarasi', name: 'Călărași', county: 'Călărași', judet: 'județul Călărași',
    context: 'căldura extremă și soarele puternic din Câmpia Dunărenii',
    problem: 'Călărașiul se află în sudul României, într-una dintre cele mai calde și mai uscate zone ale țării. Temperatura depășește frecvent 38-40°C vara, iar soarele direct distruge plasticele auto în câțiva ani fără protecție adecvată.',
    unique1: 'Vara caniculară din zona Câmpia Dunărenii și UV-ul intens din sudul României fac din Călărași un loc unde protecția ceramică este absolut necesară pentru orice mașină.',
    reviews: [
      { name: 'Gheorghe F.', car: 'Dacia Duster 2021', text: 'La Călărași soarele e nemilos vara. WOW NanoCeramic protejează perfect plasticele. Recomand tuturor!', stars: 5 },
      { name: 'Mihaela D.', car: 'Toyota Corolla 2020', text: 'Livrare rapidă, aplicare simplă, rezultat excelent. Am recomandat deja la mai mulți prieteni!', stars: 5 },
      { name: 'Ion T.', car: 'Volkswagen Polo 2019', text: 'Produsul face exact ce promite. Plasticele negre și-au recăpătat culoarea intensă originală.', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva UV-ului intens din sudul României?', a: 'Da — filtrul UV nano-ceramic blochează 99% din radiațiile ultraviolete, prevenind decolorarea și crăparea plasticelor chiar și în zonele cu expunere solară maximă.' },
      { q: 'Cât durează livrarea în Călărași?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Călărași și tot județul.' },
      { q: 'Cât de des trebuie reaplicate?', a: 'Protecția durează 2+ ani în condiții normale. Dacă mașina este expusă constant la UV intens, o reaplicare anuală asigură protecție maximă.' },
      { q: 'Se poate aplica și pe bara față și spate?', a: 'Da — barele față/spate sunt suprafețe ideale pentru tratament ceramic, mai ales că sunt cele mai expuse la murdărie, impact și UV.' },
    ],
  },
  {
    slug: 'cluj-napoca', name: 'Cluj-Napoca', county: 'Cluj', judet: 'județul Cluj',
    context: 'iernile transilvănene aspre și traficul urban intens',
    problem: 'Cluj-Napoca este cel mai mare oraș din Transilvania și unul dintre cele mai dinamice din România. Iernile transilvănene cu ger, zăpadă și sare abundentă pe șosele, combinate cu traficul urban intens, creează condiții extrem de dure pentru plasticele auto.',
    unique1: 'Mașinile clujene fac față zilnic traficului din Mărăști, Florești și Autostrada A3. Drumurile de munte spre Apuseni și Beliș adaugă un plus de uzură suplimentar plasticelor exterioare.',
    reviews: [
      { name: 'Andrei B.', car: 'Volvo XC60 2021', text: 'Iernile din Cluj sunt grele, dar WOW NanoCeramic ține plasticele perfecte. Livrare în 24h, produs de top!', stars: 5 },
      { name: 'Ioana M.', car: 'Ford Focus 2020', text: 'Am aplicat pe toate plasticele exterioare. Diferența e spectaculoasă. Recomand oricui din Cluj!', stars: 5 },
      { name: 'Radu S.', car: 'Skoda Superb 2019', text: 'Produs excelent la preț accesibil. Am scăpat de plasticele albe și crăpate pentru 2 ani!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează pe mașini expuse iernilor din Transilvania?', a: 'Absolut — formula ceramică rezistă la ger, sare și zăpadă. Protecția rămâne activă pe tot parcursul sezonului rece fără aplicări suplimentare.' },
      { q: 'Cât durează livrarea în Cluj-Napoca?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Cluj-Napoca, Florești, Baciu și tot județul Cluj.' },
      { q: 'Rezistă la spălătoria auto?', a: 'Da — legătura ceramică rezistă la spălare cu jet de apă la presiune înaltă, detergenți auto și ceară. Durabilitate garantată 2+ ani.' },
      { q: 'Pot aplica pe mașina mea electrică?', a: 'Da — produsul funcționează pe orice tip de mașină, inclusiv electrice și hibride. Plasticele exterioare sunt identice indiferent de motorizare.' },
    ],
  },
  {
    slug: 'constanta', name: 'Constanța', county: 'Constanța', judet: 'județul Constanța',
    context: 'aerul sărat de la mare și UV-ul extrem',
    problem: 'Constanța are una dintre cele mai agresive combinații pentru mașini din România — UV intens, aer sărat de la Marea Neagră și vânturi puternice. Plasticele auto se deteriorează vizibil mult mai rapid decât în interior, devenind albe și crăpate în 2-3 ani.',
    unique1: 'Parcarea pe faleză, drumurile de-a lungul coastei și aerul marin bogat în sare fac din Constanța un mediu extrem de coroziv pentru elementele exterioare ale mașinii.',
    reviews: [
      { name: 'Marius C.', car: 'Range Rover Evoque 2020', text: 'Trăiesc la Constanța toată viața. Aerul de la mare distruge mașinile. WOW NanoCeramic e singura soluție care funcționează cu adevărat!', stars: 5 },
      { name: 'Elena P.', car: 'Volkswagen Tiguan 2021', text: 'Livrare super rapidă la Constanța. Produsul e extraordinar — plasticele nu au mai îmbătrânit de când îl folosesc!', stars: 5 },
      { name: 'Cosmin D.', car: 'Toyota C-HR 2019', text: 'Ideal pentru zona litoralului. Rezistă la sare, UV și vânt. Recomand cu toată încrederea!', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva aerului sărat de la Marea Neagră?', a: 'Da — bariera ceramică este impermeabilă la sărurile marine. Spre deosebire de dressingurile clasice, ceramicul nu se dizolvă în contact cu aerul umed și sărat.' },
      { q: 'Cât durează livrarea în Constanța?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Constanța, Mamaia, Eforie și tot litoralul.' },
      { q: 'Este potrivit pentru mașinile care stau mult la soare?', a: 'Exact pentru asta a fost creat — filtrul UV nano-ceramic blochează radiațiile care cauzează decolorarea și crăparea plasticelor.' },
      { q: 'Funcționează și în sezonul rece?', a: 'Da — chiar și iarna, aerul marin de la Constanța conține sare. Tratamentul ceramic oferă protecție 365 zile pe an.' },
    ],
  },
  {
    slug: 'craiova', name: 'Craiova', county: 'Dolj', judet: 'județul Dolj',
    context: 'verile caniculare și industria auto din Oltenia',
    problem: 'Craiova, capitala Olteniei, se confruntă cu veri extrem de calde — una dintre cele mai calde zone din România cu temperaturi frecvente peste 40°C. Această căldură extremă, combinată cu UV puternic, deteriorează rapid plasticele auto.',
    unique1: 'Ca oraș cu tradiție în industria auto (Dacia Craiova), șoferii craiOveni știu cel mai bine importanța întreținerii mașinii. Plasticele exterioare bine întreținute valorifică mașina la revânzare.',
    reviews: [
      { name: 'Florentin M.', car: 'Ford Puma 2021', text: 'La Craiova vara e infernul pentru mașini. WOW NanoCeramic protejează perfect plasticele de căldură și UV. Mulțumit!', stars: 5 },
      { name: 'Simona G.', car: 'Dacia Spring 2022', text: 'Produs fantastic, livrare rapidă în Craiova. Plasticele mașinii mele arată impecabil!', stars: 5 },
      { name: 'Adrian V.', car: 'Renault Clio 2020', text: 'Valoare excelentă pentru bani. Aplicare simplă, rezultat vizibil imediat. 5 stele!', stars: 5 },
    ],
    faqs: [
      { q: 'Rezistă la temperaturile extreme din Craiova vara?', a: 'Da — formula ceramică este stabilă termic până la +250°C. Căldura verii din Oltenia nu afectează stratul protector.' },
      { q: 'Cât durează livrarea în Craiova?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Craiova și tot județul Dolj.' },
      { q: 'Menține plasticele negre și în sezonul cald?', a: 'Da — aceasta este una dintre funcțiile principale. Ceramicul blochează UV care cauzează decolorarea, menținând negrul intens și profund pe toată durata verii.' },
      { q: 'Funcționează pe mașini noi, nu doar pe cele vechi?', a: 'Da — ideal și pe mașini noi pentru prevenție. Aplicat pe un plastic în stare bună, ceramicul îl menține perfect pentru ani de zile.' },
    ],
  },
  {
    slug: 'deva', name: 'Deva', county: 'Hunedoara', judet: 'județul Hunedoara',
    context: 'zona industrială și drumurile montane din Hunedoara',
    problem: 'Deva și zona Hunedoarei combină influențe industriale cu condiții montane — praf industrial, variații termice din zona minieră și drumuri de munte ce solicită intens mașinile. Plasticele auto suferă mai mult decât media în această zonă.',
    unique1: 'Drumurile spre Orăștie, Hunedoara și Retezat, combinate cu clima variabilă a Văii Mureșului, creează condiții specifice care necesită o protecție solidă pentru elementele exterioare ale mașinii.',
    reviews: [
      { name: 'Călin P.', car: 'Toyota Land Cruiser 2019', text: 'Zona montană din Hunedoara e dură cu mașinile. WOW NanoCeramic a fost exact soluția de care aveam nevoie!', stars: 5 },
      { name: 'Rodica S.', car: 'Dacia Duster 2020', text: 'Livrare rapidă în Deva, produs de calitate. Plasticele SUV-ului meu arată ca noi!', stars: 5 },
      { name: 'Petru M.', car: 'Jeep Renegade 2018', text: 'Cel mai bun produs pentru protecție plastic pe care l-am folosit. Merită fiecare leu!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează în condiții industriale și montane din zona Deva?', a: 'Da — bariera ceramică protejează împotriva prafului industrial, prafului de drum și condițiilor montane variabile.' },
      { q: 'Cât durează livrarea în Deva?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Deva, Hunedoara și tot județul.' },
      { q: 'Protejează și bare față care sunt des lovite de pietricele?', a: 'Da — bariera ceramică reduce impactul microparticulelor și pietricelelor. Nu elimină impacturile mari, dar protejează împotriva deteriorărilor fine.' },
      { q: 'Aplicarea necesită ustensile speciale?', a: 'Nu — kit-ul include tot ce ai nevoie: soluție de degresare, lavetă texturată premium și mănuși de nitril. Zero investiție suplimentară.' },
    ],
  },
  {
    slug: 'drobeta-turnu-severin', name: 'Drobeta-Turnu Severin', county: 'Mehedinți', judet: 'județul Mehedinți',
    context: 'umiditatea de la Dunăre și clima caldă din sudul Olteniei',
    problem: 'Drobeta-Turnu Severin, pe malul Dunării, are o climă cu umiditate ridicată și veri calde. Combinația dintre aerul umed de la Dunăre și soarele puternic din sudul Olteniei creează condiții agresive pentru plasticele auto.',
    unique1: 'Zona Porților de Fier și Dunărea aduc o umiditate constantă care, combinată cu UV intens, accelerează decolorarea și deteriorarea plasticelor auto mult mai rapid decât în interior.',
    reviews: [
      { name: 'Victor D.', car: 'Mazda CX-5 2020', text: 'Trăiesc pe malul Dunării — umiditatea face ravagii pe mașini. WOW NanoCeramic e perfect pentru zona noastră!', stars: 5 },
      { name: 'Mariana T.', car: 'Opel Mokka 2021', text: 'Livrare în Turnu Severin în 24h. Produsul depășește așteptările. Recomand!', stars: 5 },
      { name: 'Ionel G.', car: 'Ford Ranger 2019', text: 'Excelent pentru zona noastră cu umiditate mare. Plasticele rămân negre și protejate!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează în clima umedă de la Dunăre?', a: 'Da — ceramicul este hidrofob și impermeabil. Umiditatea și apa nu afectează stratul protector, dimpotrivă apa alunecă de pe suprafață.' },
      { q: 'Cât durează livrarea în Drobeta-Turnu Severin?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Turnu Severin și tot județul Mehedinți.' },
      { q: 'Pot folosi produsul pe mașini de lucru/utilitare?', a: 'Da — ideal pentru orice tip de vehicul: turisme, SUV, utilitare, camioane. Orice suprafață de plastic exterior beneficiază de protecție.' },
      { q: 'Ce fac dacă plasticele sunt deja crăpate?', a: 'Ceramicul poate îmbunătăți aspectul plasticelor crăpate superficial și preveni agravarea. Pentru crăpături adânci, e nevoie de înlocuire, dar tratamentul protejează împotriva deteriorărilor ulterioare.' },
    ],
  },
  {
    slug: 'focsani', name: 'Focșani', county: 'Vrancea', judet: 'județul Vrancea',
    context: 'variațiile termice și zona seismică a Vrancei',
    problem: 'Focșaniul, la granița dintre Moldova și Muntenia, are variații termice semnificative — veri calde și ierni moderate, dar cu precipitații abundente. Umiditatea din zona subcarpatică a Vrancei accelerează deteriorarea suprafețelor auto.',
    unique1: 'Drumurile din zona Vrancei și traficul de pe E85 expun mașinile la condiții diverse. Focșaniul este un punct de tranzit important, ceea ce înseamnă mașini care parcurg distanțe lungi și acumulează uzură rapid.',
    reviews: [
      { name: 'Sorin M.', car: 'Honda CR-V 2020', text: 'Plasticele mașinii mele sufereau mult pe E85. WOW NanoCeramic le-a protejat excelent. Recomandat!', stars: 5 },
      { name: 'Georgiana V.', car: 'Renault Kadjar 2019', text: 'Livrare rapidă în Focșani, produs de calitate. Satisfacție totală!', stars: 5 },
      { name: 'Mihai C.', car: 'Hyundai Tucson 2021', text: 'Simplu de folosit, rezultat profesional. 5 stele fără discuție!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru condițiile din zona Vrancea?', a: 'Da — formula nano-ceramică face față variațiilor termice și umidității din zona subcarpatică, oferind protecție continuă.' },
      { q: 'Cât durează livrarea în Focșani?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Focșani și tot județul Vrancea.' },
      { q: 'Funcționează pe toate mărcile de mașini?', a: 'Da — WOW NanoCeramic funcționează pe orice marcă și model. Plasticul exterior are aceeași compoziție indiferent de producătorul mașinii.' },
      { q: 'Există garanție pentru produs?', a: 'Da — oferim garanție de satisfacție. Dacă nu ești mulțumit de rezultat, te contactezi și găsim o soluție.' },
    ],
  },
  {
    slug: 'galati', name: 'Galați', county: 'Galați', judet: 'județul Galați',
    context: 'industria siderurgică și umiditatea de la Dunăre',
    problem: 'Galați combină poluarea industrială specifică unui mare centru siderurgic cu umiditatea ridicată de la confluența Dunării cu Siretul și Prutul. Particulele fine din industrie și aerul umed deteriorează accelerat plasticele auto.',
    unique1: 'Mașinile din Galați sunt expuse la o combinație unică — praf industrial fin, noxe și umiditate ridicată. Fără protecție ceramică, plasticele devin albe și mate în 2-3 ani.',
    reviews: [
      { name: 'Daniel B.', car: 'Volkswagen Touareg 2020', text: 'La Galați poluarea e mare. WOW NanoCeramic protejează plasticele perfect. Nu mai arată ca înainte!', stars: 5 },
      { name: 'Cristina P.', car: 'Toyota RAV4 2021', text: 'Produs excelent, livrare rapidă. Recomand tuturor celor din Galați!', stars: 5 },
      { name: 'Silviu T.', car: 'Ford Explorer 2019', text: 'Am încercat multe produse. Acesta e singurul care rezistă la condițiile din zona noastră industrială!', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva particulelor industriale din Galați?', a: 'Da — bariera ceramică ultra-netedă nu permite aderarea particulelor fine industriale pe plastic. Suprafața rămâne curată și protejată.' },
      { q: 'Cât durează livrarea în Galați?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Galați și tot județul.' },
      { q: 'Funcționează și pe mașini vechi?', a: 'Da — chiar și pe mașini mai vechi cu plastice deteriorate, ceramicul îmbunătățește vizibil aspectul și previne deteriorarea ulterioară.' },
      { q: 'Câte straturi de produs trebuie aplicate?', a: 'Un singur strat este suficient pentru protecție completă. Pentru plastice foarte deteriorate, poți aplica un al doilea strat după 24 de ore.' },
    ],
  },
  {
    slug: 'giurgiu', name: 'Giurgiu', county: 'Giurgiu', judet: 'județul Giurgiu',
    context: 'căldura extremă și traficul de frontieră pe Dunăre',
    problem: 'Giurgiu, punct vamal important pe Dunăre, are veri extrem de calde specifice sudului României. Temperatura depășește des 38°C, iar soarele direct de la câmpie distruge plasticele auto mult mai rapid decât în zonele nordice.',
    unique1: 'Traficul intens de camioane și autoturisme pe Podul Prieteniei și drumurile de frontieră înseamnă praf, noxe și uzură continuă pentru mașinile din Giurgiu.',
    reviews: [
      { name: 'Emilian C.', car: 'Renault Duster 2020', text: 'Vara la Giurgiu e cruntă pentru mașini. WOW NanoCeramic e singura protecție care chiar funcționează!', stars: 5 },
      { name: 'Valentina M.', car: 'Seat Ibiza 2021', text: 'Livrare rapidă, produs de calitate. Plasticele mașinii arată impecabil după tratament!', stars: 5 },
      { name: 'Nicu P.', car: 'Dacia Logan MCV 2019', text: 'Valoare fantastică pentru bani. Recomand oricui are probleme cu plasticele decolorate!', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează de căldura extremă din sudul României?', a: 'Da — ceramicul este termic stabil și rezistă la temperaturi de până la +250°C. Căldura verii din zona Giurgiu nu îl afectează.' },
      { q: 'Cât durează livrarea în Giurgiu?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Giurgiu și tot județul.' },
      { q: 'Se poate aplica pe bara față care e mereu lovită de pietricele?', a: 'Da — și este unul dintre cele mai recomandate locuri pentru tratament. Bariera ceramică reduce impactul microparticulelor de pe drum.' },
      { q: 'Cât de des trebuie aplicat?', a: 'Protecția durează 2+ ani. Chiar și în zone cu UV extrem ca Giurgiu, un tratament anual menține mașina în stare perfectă.' },
    ],
  },
  {
    slug: 'iasi', name: 'Iași', county: 'Iași', judet: 'județul Iași',
    context: 'iernile moldovene severe și traficul universitar intens',
    problem: 'Iașul, cel mai mare oraș din Moldova și important centru universitar, are ierni severe cu ger și zăpadă abundentă. Sarea de pe bulevardele principale și miile de mașini ale studenților creează condiții dure pentru plasticele auto.',
    unique1: 'Traficul intens din Copou, Tătărași și zona universitară, combinat cu iernile moldovene aspre, face din Iași un loc unde protecția ceramică pentru mașini este cu adevărat necesară.',
    reviews: [
      { name: 'Andrei T.', car: 'Audi A3 2020', text: 'Student la Iași cu mașina parcată mereu afară. WOW NanoCeramic i-a salvat plasticele de iarna trecută. Mulțumesc!', stars: 5 },
      { name: 'Alina M.', car: 'Mini Cooper 2019', text: 'Produs excelent, livrare rapidă în Iași. Plasticele arată ca noi după un an de utilizare!', stars: 5 },
      { name: 'Ionuț P.', car: 'BMW Seria 1 2021', text: 'Recomand 100%. Cel mai bun raport calitate-preț pentru protecție plastice pe piața românească!', stars: 5 },
    ],
    faqs: [
      { q: 'Rezistă la iernile severe din Moldova?', a: 'Da — testele noastre confirme că formula ceramică rămâne integră și activă la -25°C. Iarna ieșeană nu reprezintă o problemă.' },
      { q: 'Cât durează livrarea în Iași?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Iași, Pașcani și tot județul Iași.' },
      { q: 'Funcționează pe mașini parcate permanent în aer liber?', a: 'Da — ideal pentru mașini fără garaj. Ceramicul formează un scut permanent împotriva tuturor factorilor de mediu.' },
      { q: 'Pot aplica singur, fără ajutor?', a: 'Absolut — kit-ul este complet și instrucțiunile sunt clare. O singură persoană poate trata o mașină întreagă în 30-40 minute.' },
    ],
  },
  {
    slug: 'miercurea-ciuc', name: 'Miercurea Ciuc', county: 'Harghita', judet: 'județul Harghita',
    context: 'cele mai reci ierni din România',
    problem: 'Miercurea Ciuc deține recordul de temperaturi minime din România, cu minus-uri care coboară sub -30°C. Iernile extrem de severe din Depresiunea Ciucului sunt cele mai distructive din țară pentru elementele exterioare ale mașinilor.',
    unique1: 'Localnicii din Miercurea Ciuc știu că o iarnă la -30°C testează limitele oricărui material. Plasticele auto se crăpă și se deteriorează rapid fără o protecție ceramică adecvată.',
    reviews: [
      { name: 'Szabo A.', car: 'Subaru Outback 2019', text: 'La Miercurea Ciuc iarna e extremă. WOW NanoCeramic e singurul produs care rezistă la -30°C. Absolut necesar!', stars: 5 },
      { name: 'Kovacs M.', car: 'Toyota Land Cruiser 2020', text: 'Produs excelent pentru condițiile alpine din Harghita. Livrare rapidă!', stars: 5 },
      { name: 'Biro T.', car: 'Mitsubishi Outlander 2018', text: 'Am testat în cele mai grele condiții. WOW NanoCeramic a trecut toate testele cu brio!', stars: 5 },
    ],
    faqs: [
      { q: 'Rezistă la temperaturile extreme din Depresiunea Ciucului?', a: 'Da — formula nano-ceramică a fost testată la -30°C și mai jos. Este cel mai rezistent produs de protecție plastic disponibil.' },
      { q: 'Cât durează livrarea în Miercurea Ciuc?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Miercurea Ciuc și tot județul Harghita.' },
      { q: 'Ceramicul se crăpă la ger extrem?', a: 'Nu — spre deosebire de dressingurile pe bază de silicon care devin casante la frig, ceramicul rămâne flexibil și aderent chiar și la temperaturi negative extreme.' },
      { q: 'Funcționează și pe vehicule de teren pentru condițiile montane?', a: 'Ideal pentru 4x4 și SUV-uri care circulă pe drumuri de munte. Protejează împotriva zăpezii, noroiului și condițiilor alpine.' },
    ],
  },
  {
    slug: 'oradea', name: 'Oradea', county: 'Bihor', judet: 'județul Bihor',
    context: 'traficul internațional și clima vestică temperată',
    problem: 'Oradea, cel mai important punct de intrare în România dinspre Vest, are un trafic internațional intens. Mașinile sunt expuse la praf de autostradă, variații climatice și ierni moderate dar cu sare pe șosele.',
    unique1: 'Autostrada A3 și drumurile europene din zona Oradea înseamnă că mașinile parcurg distanțe mari și acumulează rapid uzură pe plasticele exterioare. Protecția ceramică este investiția ideală pentru mașinile de distanță.',
    reviews: [
      { name: 'Cristi B.', car: 'Mercedes C-Class 2021', text: 'Fac frecvent Oradea-Budapesta. WOW NanoCeramic protejează perfect plasticele pe autostradă. Recomand!', stars: 5 },
      { name: 'Monica V.', car: 'Audi Q3 2020', text: 'Livrare rapidă în Oradea, produs de top. Plasticele mașinii arată impecabil!', stars: 5 },
      { name: 'Flaviu T.', car: 'BMW X1 2019', text: 'Investiție mică pentru protecție maximă. 5 stele garantat!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru mașini care parcurg distanțe lungi pe autostradă?', a: 'Absolut — bariera ceramică rezistă la microimpacturi, praf de drum și schimbări climatice bruște specifice călătoriilor lungi.' },
      { q: 'Cât durează livrarea în Oradea?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Oradea și tot județul Bihor.' },
      { q: 'Pot aplica singur acasă?', a: 'Da — kit-ul complet include tot ce ai nevoie. Aplicarea durează 30 minute și nu necesită experiență sau ustensile speciale.' },
      { q: 'Funcționează pe mașini importate din Vest cu plastice deja deteriorate?', a: 'Da — WOW NanoCeramic restaurează și protejează plasticele indiferent de starea lor inițială.' },
    ],
  },
  {
    slug: 'piatra-neamt', name: 'Piatra Neamț', county: 'Neamț', judet: 'județul Neamț',
    context: 'iernile montane din Carpații Moldovei',
    problem: 'Piatra Neamț, situată în inima Carpaților Moldovei, are ierni cu multă zăpadă, ger și sare pe drumuri montane. Condițiile specifice zonei de munte — variații termice bruște, umezeală și vânturi reci — deteriorează rapid plasticele auto.',
    unique1: 'Drumurile spre Durău, Ceahlău și stațiunile montane din Neamț înseamnă condiții extreme pentru mașini. Plasticele se albesc rapid fără protecție adecvată în zona montană.',
    reviews: [
      { name: 'Bogdan C.', car: 'Jeep Cherokee 2020', text: 'Zona montană din Neamț e dură pentru mașini. WOW NanoCeramic e soluția perfectă! Livrare rapidă!', stars: 5 },
      { name: 'Anca M.', car: 'Dacia Duster 2021', text: 'Produsul funcționează excelent în condiții montane. Recomand oricui din zona Neamț!', stars: 5 },
      { name: 'Radu T.', car: 'Nissan Pathfinder 2019', text: 'Cel mai bun produs de protecție plastic pentru mașini de munte. 5 stele!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează pe drumuri de munte cu sare și gheață?', a: 'Da — formula ceramică rezistă la sare, gheață și condiții montane extreme. Drumurile din zona Neamț nu reprezintă o problemă.' },
      { q: 'Cât durează livrarea în Piatra Neamț?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Piatra Neamț și tot județul Neamț.' },
      { q: 'E potrivit pentru SUV-uri folosite pe teren?', a: 'Da — ideal pentru SUV-uri și mașini de teren care au suprafețe mari de plastic și circulă pe drumuri dificile.' },
      { q: 'Aplicarea strică vopseaua mașinii?', a: 'Nu — produsul este aplicat doar pe plastic, nu pe vopsea. Formula nu conține substanțe abrazive sau corozive.' },
    ],
  },
  {
    slug: 'pitesti', name: 'Pitești', county: 'Argeș', judet: 'județul Argeș',
    context: 'industria auto și traficul intens pe A1',
    problem: 'Pitești, capitala industriei auto românești, este un nod major de trafic pe Autostrada A1. Mașinile din Pitești sunt expuse la praf de autostradă, noxe industriale și variații climatice specifice zonei subcarpatice.',
    unique1: 'Ca oraș cu cea mai mare tradiție auto din România (Uzina Dacia), șoferii din Pitești au standarde înalte pentru întreținerea mașinii. Plasticele bine protejate fac diferența la revânzare.',
    reviews: [
      { name: 'Marian G.', car: 'Dacia Jogger 2022', text: 'Trăiesc în Pitești — orașul Dacia. WOW NanoCeramic e produsul de care orice mașină are nevoie. Excelent!', stars: 5 },
      { name: 'Teodora V.', car: 'Renault Arkana 2021', text: 'Livrare rapidă în Pitești, produs de calitate premium. Satisfacție totală!', stars: 5 },
      { name: 'Vlad C.', car: 'Dacia Duster 2020', text: 'Simplu, eficient, rezistent. Exact ce îți trebuie pentru o mașină din zona industrială!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru mașini care circulă zilnic pe A1?', a: 'Absolut — bariera ceramică rezistă la microimpacturi și particulele fine de pe autostradă, menținând plasticele curate și protejate.' },
      { q: 'Cât durează livrarea în Pitești?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Pitești și tot județul Argeș.' },
      { q: 'Funcționează și pe mașini Dacia?', a: 'Da — WOW NanoCeramic funcționează pe orice marcă, inclusiv Dacia. Plasticele exterioare Dacia beneficiază excelent de protecția ceramică.' },
      { q: 'Mărește valoarea mașinii la revânzare?', a: 'Da — plasticele bine conservate cresc semnificativ valoarea percepută la revânzare. O mașină cu plastice negre și strălucitoare arată mai nouă și valorează mai mult.' },
    ],
  },
  {
    slug: 'ploiesti', name: 'Ploiești', county: 'Prahova', judet: 'județul Prahova',
    context: 'industria petrolieră și traficul intens spre București',
    problem: 'Ploieștiul, inima industriei petroliere românești, combină poluarea specifică rafinăriilor cu traficul dens spre București și spre stațiunile montane din Prahova. Particulele fine industriale și noxele deteriorează accelerat plasticele auto.',
    unique1: 'Drumurile spre Sinaia, Bușteni și Predeal, combinate cu traficul urban din Ploiești și poluarea industrială, creează un mediu provocator pentru elementele exterioare ale oricărei mașini.',
    reviews: [
      { name: 'Ionel M.', car: 'Skoda Superb 2021', text: 'Poluarea din Ploiești e reală. WOW NanoCeramic protejează perfect plasticele mașinii mele. Recomand!', stars: 5 },
      { name: 'Cristina B.', car: 'Volkswagen Golf 2020', text: 'Livrare rapidă în Ploiești. Produsul e de top — plastice negre și strălucitoare după tratament!', stars: 5 },
      { name: 'Alex D.', car: 'BMW Seria 3 2019', text: 'Investiție inteligentă pentru orice mașină din zona noastră industrială. 5 stele!', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva poluării industriale din Ploiești?', a: 'Da — bariera nano-ceramică blochează depunerea particulelor fine industriale pe plastic. Suprafața ultra-netedă nu permite aderarea noxelor.' },
      { q: 'Cât durează livrarea în Ploiești?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Ploiești și tot județul Prahova.' },
      { q: 'Funcționează și pe mașini care merg frecvent la munte?', a: 'Da — ideal și pentru mașinile care merg spre Sinaia sau Predeal. Sarea de munte și zăpada nu afectează stratul ceramic.' },
      { q: 'Poate fi aplicat pe bara față din material plastic moale?', a: 'Da — formula funcționează pe toate tipurile de plastic exterior, inclusiv cel flexibil de pe barele față și spate.' },
    ],
  },
  {
    slug: 'ramnicu-valcea', name: 'Râmnicu Vâlcea', county: 'Vâlcea', judet: 'județul Vâlcea',
    context: 'clima subcarpatică și drumurile spre stațiunile balneare',
    problem: 'Râmnicu Vâlcea, reședință a județului Vâlcea, beneficiază de o climă subcarpatică cu ierni moderate dar umede. Drumurile spre Băile Olănești, Călimănești și stațiunile balneare din zonă înseamnă uzură constantă pentru mașini.',
    unique1: 'Zona Subcarpaților Getici și stațiunile balneare din județul Vâlcea atrag un trafic semnificativ. Mașinile din Râmnicu Vâlcea parcurg frecvent drumuri de deal care solicită intens elementele exterioare.',
    reviews: [
      { name: 'Mihai V.', car: 'Dacia Duster 2021', text: 'Drumurile spre stațiunile balneare din Vâlcea sunt dure pentru mașini. WOW NanoCeramic e soluția perfectă!', stars: 5 },
      { name: 'Alina C.', car: 'Renault Captur 2020', text: 'Produs excelent, livrare rapidă în Râmnicu Vâlcea. Plasticele arată ca noi!', stars: 5 },
      { name: 'Dan P.', car: 'Ford Kuga 2019', text: 'Cel mai bun produs pentru protecție plastice auto pe care l-am găsit. Merită fiecare leu!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru condițiile climatice din Vâlcea?', a: 'Da — formula ceramică face față umidității subcarpatice, variațiilor termice și drumurilor din zona montană a județului Vâlcea.' },
      { q: 'Cât durează livrarea în Râmnicu Vâlcea?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Râmnicu Vâlcea și tot județul Vâlcea.' },
      { q: 'Funcționează și pe mașini care merg spre Transfăgărășan?', a: 'Da — ideal pentru mașinile care circulă pe drumuri montane. Sarea, zăpada și condițiile alpine nu afectează stratul ceramic.' },
      { q: 'Este produsul disponibil în farmacii sau magazine din Vâlcea?', a: 'Produsul se vinde exclusiv online pe wownanoceramic.ro, cu livrare Sameday în 24h. Cumperi de acasă și primești direct la ușă sau la EasyBox.' },
    ],
  },
  {
    slug: 'resita', name: 'Reșița', county: 'Caraș-Severin', judet: 'județul Caraș-Severin',
    context: 'iernile montane și zona industrială din Banat',
    problem: 'Reșița, în inima Banatului Montan, combină iernile aspre specifice zonei montane cu tradiția industrială a orașului. Umiditatea ridicată, ploile frecvente și iernile cu ger și sare creează condiții dure pentru plasticele auto.',
    unique1: 'Drumurile montane din Caraș-Severin și clima umedă din zona Banatului Montan fac din Reșița un loc unde protecția ceramică pentru mașini este cu adevărat valoroasă.',
    reviews: [
      { name: 'Traian M.', car: 'Dacia Duster 4x4 2020', text: 'Zona montană din Banat e dură. WOW NanoCeramic a protejat perfect plasticele 4x4-ului meu tot sezonul rece!', stars: 5 },
      { name: 'Lavinia C.', car: 'Skoda Karoq 2021', text: 'Livrare rapidă în Reșița, produs de calitate. Recomand tuturor!', stars: 5 },
      { name: 'Nicu B.', car: 'Mitsubishi ASX 2019', text: 'Produs excelent pentru condițiile din Banatul Montan. 5 stele fără discuție!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează în condițiile montane umede din Caraș-Severin?', a: 'Da — bariera ceramică hidrofobă respinge apa și umiditatea. Ploile frecvente din zona Banatului Montan nu afectează protecția.' },
      { q: 'Cât durează livrarea în Reșița?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Reșița și tot județul Caraș-Severin.' },
      { q: 'Se poate aplica și pe noroiul uscat de pe plastic?', a: 'Nu — suprafața trebuie să fie curată înainte de aplicare. Folosește soluția de degresare IPA inclusă în kit pentru curățarea perfectă.' },
      { q: 'Rezistă la temperatura motor înaltă de lângă bara față?', a: 'Da — ceramicul este stabil termic. Căldura de la motor nu afectează stratul protector aplicat pe bara față sau grila frontală.' },
    ],
  },
  {
    slug: 'satu-mare', name: 'Satu Mare', county: 'Satu Mare', judet: 'județul Satu Mare',
    context: 'iernile nordice și traficul transfrontalier',
    problem: 'Satu Mare, în nord-vestul României, are ierni aspre cu ger și zăpadă. Traficul transfrontalier cu Ungaria și Ucraina înseamnă drumuri lungi și condiții climatice variate care solicită intens elementele exterioare ale mașinilor.',
    unique1: 'Granița cu Ungaria și apropierea de Ucraina fac din zona Satu Mare un loc cu trafic internațional intens. Mașinile parcurg distanțe lungi pe diverse tipuri de drumuri, acumulând uzură rapid.',
    reviews: [
      { name: 'Zsolt M.', car: 'Volkswagen Passat 2020', text: 'Fac frecvent drumuri lungi din Satu Mare. WOW NanoCeramic e esențial pentru protecția plasticelor!', stars: 5 },
      { name: 'Anca P.', car: 'Opel Insignia 2021', text: 'Produs excelent la preț bun. Livrare rapidă în Satu Mare. Mulțumit!', stars: 5 },
      { name: 'Gavril T.', car: 'Ford Mondeo 2019', text: 'Recomand oricui face drumuri lungi. Protecție excelentă, rezultat vizibil!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru mașini care fac drumuri lungi internaționale?', a: 'Da — bariera ceramică rezistă la microimpacturi, praf de autostradă și variații climatice bruște specifice călătoriilor lungi.' },
      { q: 'Cât durează livrarea în Satu Mare?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Satu Mare și tot județul.' },
      { q: 'Funcționează la temperaturi de îngheț din nord-vestul țării?', a: 'Da — formula ceramică rezistă la ger sever și la sarea de pe drumuri. Protecția rămâne activă pe tot parcursul iernii.' },
      { q: 'Pot folosi produsul și pe jante din plastic?', a: 'Produsul este optimizat pentru plastice de caroserie. Pentru jante există formule dedicate ceramice.' },
    ],
  },
  {
    slug: 'sfantu-gheorghe', name: 'Sfântu Gheorghe', county: 'Covasna', judet: 'județul Covasna',
    context: 'iernile severe din Depresiunea Brașovului',
    problem: 'Sfântu Gheorghe, în Depresiunea Brașovului, are ierni extrem de severe cu ger prelungit și inversii termice. Temperaturile negative frecvente, zăpada și sarea de pe drumuri deteriorează rapid plasticele auto în această zonă.',
    unique1: 'Depresiunea Brașovului concentrează aerul rece iarna, creând condiții de ger mai severe decât în zonele înconjurătoare. Mașinile din Sfântu Gheorghe au cea mai mare nevoie de protecție ceramică din regiune.',
    reviews: [
      { name: 'Farkas B.', car: 'Toyota Hilux 2020', text: 'Iarna la Sfântu Gheorghe e extremă. WOW NanoCeramic protejează perfect. Singurul produs care funcționează!', stars: 5 },
      { name: 'Molnar E.', car: 'Dacia Duster 2021', text: 'Produs excelent pentru condițiile din Covasna. Livrare rapidă!', stars: 5 },
      { name: 'Varga T.', car: 'Subaru XV 2019', text: 'Am testat în cele mai grele condiții de iarnă. WOW NanoCeramic a trecut toate testele!', stars: 5 },
    ],
    faqs: [
      { q: 'Rezistă la inversiile termice și gerul din Depresiunea Brașovului?', a: 'Da — formula nano-ceramică rezistă la temperaturi de -25°C și mai jos, specifice depresiunilor intramontane din Covasna.' },
      { q: 'Cât durează livrarea în Sfântu Gheorghe?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Sfântu Gheorghe și tot județul Covasna.' },
      { q: 'Funcționează pe mașini cu plastic vechi și deteriorat?', a: 'Da — ceramicul îmbunătățește aspectul chiar și al plasticelor vechi, restaurând culoarea și prevenind deteriorarea ulterioară.' },
      { q: 'Cum știu că am aplicat corect?', a: 'Suprafața tratată devine adâncă și uniformă ca negrul original. Testul picăturii de apă — apa trebuie să curgă imediat fără să se absoarbă.' },
    ],
  },
  {
    slug: 'sibiu', name: 'Sibiu', county: 'Sibiu', judet: 'județul Sibiu',
    context: 'iernile transilvănene și turismul internațional intens',
    problem: 'Sibiu, destinație turistică europeană de top, are ierni transilvănene cu multă zăpadă și ger. Mașinile sibieneilor — mulți cu standarde ridicate de prezentare — suferă de pe urma sării, gerului și variațiilor termice.',
    unique1: 'Ca unul dintre cele mai vizitate orașe din România, Sibiu are standarde ridicate și pentru mașini. Plasticele impecabile fac diferența, mai ales în sezonul turistic când mașinile sunt mereu în evidență.',
    reviews: [
      { name: 'Stefan K.', car: 'Mercedes GLC 2021', text: 'Sibiu e un oraș cu standarde. WOW NanoCeramic face plasticele mașinii să arate perfect tot timpul anului!', stars: 5 },
      { name: 'Bianca M.', car: 'BMW X5 2020', text: 'Produs de calitate premium. Livrare rapidă în Sibiu. Recomand tuturor!', stars: 5 },
      { name: 'Horst B.', car: 'Audi Q7 2019', text: 'Cel mai bun produs de protecție plastic din România. 5 stele garantat!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează pe mașini premium expuse iernilor din Sibiu?', a: 'Absolut — WOW NanoCeramic este formula profesională care protejează plasticele oricărei mașini, de la Dacia la Mercedes.' },
      { q: 'Cât durează livrarea în Sibiu?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Sibiu, Cisnădie și tot județul Sibiu.' },
      { q: 'Lasă luciu sau aspect natural?', a: 'Aspect natural mat-profund, nu luciu artificial. Ceramicul redă culoarea originală a plasticului fără să arate că este tratat.' },
      { q: 'Este produsul disponibil în magazine din Sibiu?', a: 'Produsul se vinde exclusiv online pe wownanoceramic.ro, cu livrare Sameday în 24h direct la tine.' },
    ],
  },
  {
    slug: 'slatina', name: 'Slatina', county: 'Olt', judet: 'județul Olt',
    context: 'industria de aluminiu și verile calde din Câmpia Olteniei',
    problem: 'Slatina, centru al industriei de aluminiu din România, combină poluarea industrială cu verile calde specifice Câmpiei Olteniei. Particulele fine din industria metalurgică și UV puternic deteriorează accelerat plasticele auto.',
    unique1: 'Combinația unică dintre poluarea industrială a Slatinei și verile caniculare din Oltenia face ca mașinile din zonă să aibă o nevoie acută de protecție ceramică pentru plasticele exterioare.',
    reviews: [
      { name: 'Relu M.', car: 'Dacia Logan 2020', text: 'Poluarea industrială din Slatina e reală. WOW NanoCeramic protejează perfect. Mulțumit!', stars: 5 },
      { name: 'Oana V.', car: 'Renault Clio 2021', text: 'Produs excelent, livrare rapidă în Slatina. Plasticele arată impecabil!', stars: 5 },
      { name: 'Gelu T.', car: 'Volkswagen Polo 2019', text: 'Valoare fantastică pentru bani. Recomand tuturor celor din Slatina!', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează împotriva particulelor industriale din Slatina?', a: 'Da — suprafața ceramică ultra-netedă nu permite aderarea particulelor metalice fine. Mașina rămâne mai curată și mai protejată.' },
      { q: 'Cât durează livrarea în Slatina?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Slatina și tot județul Olt.' },
      { q: 'Funcționează pe mașini vechi cu plastic crăpat?', a: 'Da — ceramicul îmbunătățește aspectul și previne extinderea crăpăturilor superficiale, prelungind durata de viață a plasticelor.' },
      { q: 'Pot aplica și pe pragurile mașinii?', a: 'Da — pragurile sunt ideale pentru tratament ceramic. Sunt suprafețe des lovite și murdărite care beneficiază enorm de protecție.' },
    ],
  },
  {
    slug: 'slobozia', name: 'Slobozia', county: 'Ialomița', judet: 'județul Ialomița',
    context: 'căldura extremă și soarele puternic din Câmpia Bărăganului',
    problem: 'Slobozia se află în Câmpia Bărăganului, una dintre cele mai calde și mai aride zone din România. Temperaturile de peste 40°C vara și UV-ul extrem de puternic din această zonă sunt extrem de distructive pentru plasticele auto.',
    unique1: 'Bărăganul este renumit pentru vânturile puternice care transportă praf fin și pentru soarele implacabil de vară. Fără protecție ceramică, plasticele auto devin albe și crăpate în 2-3 sezoane estivale.',
    reviews: [
      { name: 'Viorel C.', car: 'Dacia Sandero 2020', text: 'La Slobozia vara e cumplită pentru mașini. WOW NanoCeramic le protejează perfect de UV și căldură!', stars: 5 },
      { name: 'Marilena P.', car: 'Toyota Yaris 2021', text: 'Livrare în Slobozia în 24h. Produs excelent. Recomand cu căldură!', stars: 5 },
      { name: 'Ionel D.', car: 'Ford Fiesta 2019', text: 'Simplu de aplicat, rezultat imediat vizibil. 5 stele pentru WOW NanoCeramic!', stars: 5 },
    ],
    faqs: [
      { q: 'Protejează de UV-ul extrem din Câmpia Bărăganului?', a: 'Da — filtrul UV nano-ceramic este cel mai eficient disponibil. Blochează 99% din radiațiile care cauzează decolorarea, ideal pentru zone cu UV maxim ca Bărăganul.' },
      { q: 'Cât durează livrarea în Slobozia?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Slobozia și tot județul Ialomița.' },
      { q: 'Funcționează și vara, la temperaturi de 40°C?', a: 'Da — poți aplica produsul la orice temperatură între +5°C și +35°C. La temperaturi mai mari de 35°C, aplică la umbră sau dimineața devreme.' },
      { q: 'Rezistă la vânturile puternice din Bărăgan care aduc praf?', a: 'Da — suprafața ceramică ultra-netedă respinge praful fin. Particulele nu aderă la suprafața tratată și se curăță ușor.' },
    ],
  },
  {
    slug: 'suceava', name: 'Suceava', county: 'Suceava', judet: 'județul Suceava',
    context: 'iernile nordice severe și drumurile spre mănăstiri',
    problem: 'Suceava, capitala Bucovinei și poarta spre mănăstirile din Moldova, are ierni cu adevărat aspre — ger, zăpadă abundentă și sare pe drumuri timp de 4-5 luni. Condițiile nordice distrug plasticele auto mai rapid ca oriunde altundeva.',
    unique1: 'Drumurile spre mănăstirile din Bucovina, Vatra Dornei și pasurile montane din Suceava înseamnă mașini expuse constant la condiții extreme de iarnă și variații termice bruște.',
    reviews: [
      { name: 'Vasile C.', car: 'Jeep Wrangler 2020', text: 'Iarnă cruntă la Suceava. WOW NanoCeramic e singura soluție care rezistă la condițiile nordice!', stars: 5 },
      { name: 'Ioana M.', car: 'Dacia Duster 2021', text: 'Produsul funcționează perfect în iernile bucovinene. Livrare rapidă. Recomand!', stars: 5 },
      { name: 'Mihai B.', car: 'Ford Expedition 2019', text: 'Cel mai rezistent produs de protecție plastic pentru iernile grele din nord. 5 stele!', stars: 5 },
    ],
    faqs: [
      { q: 'Rezistă la iernile severe din Bucovina?', a: 'Da — formula nano-ceramică a fost testată la -25°C și mai jos. Iernile sucevene, oricât de grele, nu afectează stratul protector.' },
      { q: 'Cât durează livrarea în Suceava?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Suceava, Rădăuți și tot județul Suceava.' },
      { q: 'Funcționează și pe mașini de teren folosite pe drumuri neasfaltate?', a: 'Da — ideal pentru SUV-uri și 4x4 care circulă pe drumuri forestiere sau de câmp. Ceramicul protejează împotriva prafului și noroiului.' },
      { q: 'Trebuie reaplicate după iarnă?', a: 'Nu este obligatoriu, dar o reaplicare primăvara, după sezonul rece intens, asigură protecție maximă pentru restul anului.' },
    ],
  },
  {
    slug: 'targoviste', name: 'Târgoviște', county: 'Dâmbovița', judet: 'județul Dâmbovița',
    context: 'traficul spre București și zona subcarpatică',
    problem: 'Târgoviște, la poalele Subcarpaților, are o climă cu variații termice semnificative — veri calde și ierni moderate dar cu precipitații. Traficul intens spre București pe DN71 expune mașinile la praf, noxe și uzură continuă.',
    unique1: 'Poziția strategică a Târgoviștei între Subcarpați și Câmpia Română înseamnă că mașinile din zonă parcurg drumuri cu condiții diverse, de la deal la câmpie, cu impacturi diferite asupra plasticelor.',
    reviews: [
      { name: 'Florin C.', car: 'Renault Megane 2020', text: 'Fac zilnic naveta Târgoviște-București. WOW NanoCeramic protejează perfect plasticele pe drum lung!', stars: 5 },
      { name: 'Sorina M.', car: 'Seat Ateca 2021', text: 'Produs de calitate, livrare rapidă în Târgoviște. Sunt mulțumită!', stars: 5 },
      { name: 'Adrian B.', car: 'Opel Mokka 2020', text: 'Simplu de aplicat, rezultat excelent. Recomand tuturor navetiștilor!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru navetiștii care fac zilnic Târgoviște-București?', a: 'Da — ideal pentru mașini care parcurg distanțe lungi zilnic. Ceramicul rezistă la praf de drum și microimpacturi de autostradă.' },
      { q: 'Cât durează livrarea în Târgoviște?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Târgoviște și tot județul Dâmbovița.' },
      { q: 'Funcționează și pe mașini cu plastice parțial decolorate?', a: 'Da — ceramicul îmbunătățește uniform aspectul, inclusiv pe zonele parțial decolorate, readucând o culoare profundă și uniformă.' },
      { q: 'Aplicarea poate fi făcută în parcare, nu neapărat acasă?', a: 'Da — poți aplica oriunde ai acces la suprafața mașinii. La umbră este ideal, dar nu este obligatoriu.' },
    ],
  },
  {
    slug: 'targu-jiu', name: 'Târgu Jiu', county: 'Gorj', judet: 'județul Gorj',
    context: 'zona minieră și drumurile spre munții Gorjului',
    problem: 'Târgu Jiu, capitala județului Gorj, combină influențele industriei miniere cu drumurile montane spre Parâng și Retezat. Praful specific zonei extractive și variațiile climatice ale Subcarpaților Gorjului deteriorează rapid plasticele auto.',
    unique1: 'Drumurile din Gorj, de la minele de cărbune la stațiunile montane, expun mașinile la condiții extrem de variate. Plasticele suferă atât de praf industrial cât și de sare și ger la munte.',
    reviews: [
      { name: 'Costel M.', car: 'Dacia Duster 2021', text: 'Zona minieră din Gorj e dură pentru mașini. WOW NanoCeramic le protejează perfect. Recomandat!', stars: 5 },
      { name: 'Daniela V.', car: 'Renault Duster 2020', text: 'Livrare rapidă în Târgu Jiu, produs de calitate. Plasticele arată impecabil!', stars: 5 },
      { name: 'Marin T.', car: 'Toyota Hilux 2019', text: 'Produs excelent pentru condițiile din zona Gorjului. 5 stele garantat!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează în condițiile industriale și montane din Gorj?', a: 'Da — bariera ceramică protejează împotriva prafului industrial, prafului de drum și condițiilor montane variabile din zona Gorjului.' },
      { q: 'Cât durează livrarea în Târgu Jiu?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Târgu Jiu și tot județul Gorj.' },
      { q: 'Este rezistent la contactul cu noroiul de pe drumuri forestiere?', a: 'Da — ceramicul reduce aderența noroiului. Suprafața tratată se curăță mult mai ușor după expunere la noroi.' },
      { q: 'Pot aplica și pe mașinile de teren cu plastic negru mat?', a: 'Da — ideal pentru off-roadere. Plasticul mat tratat cu ceramică arată impecabil și rezistă la condițiile dure de teren.' },
    ],
  },
  {
    slug: 'targu-mures', name: 'Târgu Mureș', county: 'Mureș', judet: 'județul Mureș',
    context: 'iernile transilvănene și traficul important din centrul țării',
    problem: 'Târgu Mureș, importantul centru urban din centrul Transilvaniei, are ierni cu ger și zăpadă, specifice platfoului Transilvaniei. Sarea pe bulevardele principale și traficul intens din centrul orașului deteriorează plasticele auto.',
    unique1: 'Ca nod important de trafic în centrul României, Târgu Mureș conectează Transilvania cu Moldova și Muntenia. Mașinile din zonă parcurg distanțe lungi pe diverse tipuri de drumuri.',
    reviews: [
      { name: 'Szekely A.', car: 'Volkswagen Touareg 2021', text: 'Iernile din Târgu Mureș sunt aspre. WOW NanoCeramic e esențial pentru protecția plasticelor. Recomand!', stars: 5 },
      { name: 'Pop M.', car: 'Audi A4 2020', text: 'Produs de top, livrare rapidă. Plasticele mașinii arată impecabil după tratament!', stars: 5 },
      { name: 'Nagy T.', car: 'BMW X3 2019', text: 'Cel mai bun raport calitate-preț pentru protecție plastic. 5 stele!', stars: 5 },
    ],
    faqs: [
      { q: 'Rezistă la iernile Podișului Transilvaniei?', a: 'Da — formula ceramică rezistă la gerul și sarea specifice iernilor transilvănene. Protecția rămâne activă pe tot sezonul rece.' },
      { q: 'Cât durează livrarea în Târgu Mureș?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Târgu Mureș și tot județul Mureș.' },
      { q: 'Funcționează pe mașini de reprezentanță?', a: 'Da — WOW NanoCeramic oferă protecție și aspect profesional oricărei mașini, inclusiv celor de lux.' },
      { q: 'Câte ore durează aplicarea completă?', a: 'Aplicarea completă pe o mașină durează 30-45 minute, plus 2-3 ore de uscare. Poți folosi mașina după 3 ore.' },
    ],
  },
  {
    slug: 'timisoara', name: 'Timișoara', county: 'Timiș', judet: 'județul Timiș',
    context: 'clima vestică și traficul internațional intens',
    problem: 'Timișoara, cel mai mare oraș din vestul României și importantul centru economic, are o climă vestică cu precipitații frecvente. Traficul intens spre Ungaria și Serbia, combinat cu iernile cu sare pe drumuri, deteriorează plasticele auto.',
    unique1: 'Ca cel mai occidental mare oraș din România, Timișoara are șoferi cu standarde ridicate de întreținere a mașinii. Plasticele impecabile sunt o carte de vizită pentru orice mașină din Timișoara.',
    reviews: [
      { name: 'Stefan M.', car: 'Mercedes E-Class 2021', text: 'Timișoara are standarde. WOW NanoCeramic ține plasticele mașinii la cel mai înalt nivel. Recomand!', stars: 5 },
      { name: 'Laura P.', car: 'Audi A6 2020', text: 'Produs premium, livrare rapidă în Timișoara. Cel mai bun pentru protecție plastic!', stars: 5 },
      { name: 'Mihai V.', car: 'BMW Seria 7 2019', text: 'Investiție inteligentă pentru orice mașină de calitate. 5 stele!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru clima vestică din Timișoara?', a: 'Da — formula nano-ceramică se adaptează la toate tipurile de climă, inclusiv cea vestică cu precipitații frecvente din Timiș.' },
      { q: 'Cât durează livrarea în Timișoara?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Timișoara, Dumbrăvița și tot județul Timiș.' },
      { q: 'Funcționează pe mașini premium și de lux?', a: 'Da — WOW NanoCeramic este ales de proprietarii de mașini premium tocmai pentru că oferă protecție și aspect profesional.' },
      { q: 'Poate fi aplicat pe mașini cu film protector (PPF)?', a: 'Ceramicul se aplică pe plastic neacoperit de PPF. Pe zonele fără film, ceramicul oferă o protecție similară la un cost mult mai mic.' },
    ],
  },
  {
    slug: 'tulcea', name: 'Tulcea', county: 'Tulcea', judet: 'județul Tulcea',
    context: 'clima Deltei Dunării și umiditatea extremă',
    problem: 'Tulcea, poarta spre Delta Dunării, are una dintre cele mai ridicate umidități din România. Aerul umed, soarele puternic și vânturile de la Marea Neagră creează o combinație extrem de agresivă pentru plasticele auto.',
    unique1: 'Clima unică a Deltei Dunării — umiditate ridicată, UV puternic și aer cu sare — deteriorează rapid orice element de plastic exterior neprotejat. Mașinile din Tulcea îmbătrânesc prematur fără protecție ceramică.',
    reviews: [
      { name: 'Grigore M.', car: 'Toyota Land Cruiser 2020', text: 'Trăiesc la Delta Dunării. Umiditatea distruge mașinile. WOW NanoCeramic e singura soluție care funcționează!', stars: 5 },
      { name: 'Lidia P.', car: 'Ford EcoSport 2021', text: 'Produs excelent pentru clima Deltei. Livrare rapidă în Tulcea. Recomand!', stars: 5 },
      { name: 'Dan C.', car: 'Dacia Duster 2020', text: 'Rezultat spectaculos. Plasticele mașinii arată perfect după 1 an în clima Deltei!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează în clima umedă a Deltei Dunării?', a: 'Da — bariera ceramică hidrofobă este impermeabilă la umiditate. Delta Dunării este exact tipul de mediu pentru care a fost creat acest produs.' },
      { q: 'Cât durează livrarea în Tulcea?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Tulcea și tot județul.' },
      { q: 'Rezistă la aerul sărat din zona Mării Negre?', a: 'Da — identic cu protecția pentru zona litoralului. Sărurile marine nu afectează stratul ceramic, dimpotrivă suprafața respinge depunerile saline.' },
      { q: 'Funcționează și pe bărci sau ambarcațiuni?', a: 'Produsul este optimizat pentru plastic auto. Pentru ambarcațiuni există formule marine dedicate.' },
    ],
  },
  {
    slug: 'vaslui', name: 'Vaslui', county: 'Vaslui', judet: 'județul Vaslui',
    context: 'iernile moldovene și drumurile din zona colinară',
    problem: 'Vasluiul, în zona colinară a Moldovei, are ierni reci cu precipitații și drumuri solicitante. Condițiile specifice zonei moldovene de deal — variații termice, ploaie, nămol și sare iarna — deteriorează rapid plasticele auto.',
    unique1: 'Drumurile din zona colinară a Vasluiului și condițiile climatice specifice Moldovei de mijloc creează un mediu în care protecția ceramică face diferența vizibilă pe orice mașină.',
    reviews: [
      { name: 'Liviu M.', car: 'Dacia Duster 2020', text: 'Drumurile din Vaslui sunt dure pentru mașini. WOW NanoCeramic a rezolvat toate problemele cu plasticele!', stars: 5 },
      { name: 'Carmen P.', car: 'Hyundai Kona 2021', text: 'Produs excelent, livrare rapidă. Plasticele mașinii arată impecabil!', stars: 5 },
      { name: 'Nelu T.', car: 'Kia Sportage 2019', text: 'Recomand tuturor. Simplu de aplicat, rezultat vizibil imediat!', stars: 5 },
    ],
    faqs: [
      { q: 'Funcționează pe drumurile de deal din zona Vaslui?', a: 'Da — ceramicul protejează împotriva noroiului, prafului și condițiilor specifice drumurilor rurale și de deal din Moldova.' },
      { q: 'Cât durează livrarea în Vaslui?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Vaslui și tot județul.' },
      { q: 'Poate fi aplicat și la temperaturi mai scăzute toamna?', a: 'Da, la temperaturi de peste +5°C. Aplicarea de toamnă este ideală — protejezi mașina înainte de sezonul rece.' },
      { q: 'Există discount pentru comenzi multiple?', a: 'Da — la comanda a 2 produse beneficiezi de transport gratuit. Verifică oferta curentă pe wownanoceramic.ro.' },
    ],
  },
  {
    slug: 'zalau', name: 'Zalău', county: 'Sălaj', judet: 'județul Sălaj',
    context: 'iernile moderate și drumurile din Sălaj',
    problem: 'Zalău, capitala județului Sălaj, are ierni moderate dar cu precipitații frecvente. Drumurile din zona colinară a Sălajului și apropierea de zonele montane ale Apusenilor creează condiții care solicită plasticele auto.',
    unique1: 'Sălajul, județ cu peisaje colinare și legătură cu Apusenii, are drumuri variate care înseamnă expunere diversă pentru mașini. De la praf de câmpie vara la sare și gheață iarna.',
    reviews: [
      { name: 'Călin M.', car: 'Dacia Logan 2021', text: 'Produsul e exact ce căutam pentru mașina mea. Livrare rapidă în Zalău, rezultat excelent!', stars: 5 },
      { name: 'Ramona V.', car: 'Ford Focus 2020', text: 'Simplu de aplicat, durabil, eficient. Recomand tuturor din Sălaj!', stars: 5 },
      { name: 'Ciprian T.', car: 'Renault Clio 2019', text: 'Valoare excelentă pentru bani. Plasticele mașinii arată ca noi după tratament!', stars: 5 },
    ],
    faqs: [
      { q: 'Este potrivit pentru condițiile climatice din Sălaj?', a: 'Da — formula nano-ceramică face față condițiilor din zona colinară a Sălajului, inclusiv iernilor moderate cu sare și verilor calde.' },
      { q: 'Cât durează livrarea în Zalău?', a: 'Livrăm prin Sameday în maxim 24 de ore lucrătoare în Zalău și tot județul Sălaj.' },
      { q: 'Funcționează pe mașini cu plastice maro sau gri deschis?', a: 'Da — produsul funcționează pe orice culoare de plastic exterior, readucând profunzimea și protecția culorii originale.' },
      { q: 'Pot folosi produsul și iarna, dacă am garaj?', a: 'Da — dacă aplici în garaj la temperaturi de peste +5°C, poți trata mașina oricând, inclusiv în sezonul rece.' },
    ],
  },
];

function generateStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function generatePage(city) {
  const faqSchema = city.faqs.map(f => `{"@type":"Question","name":${JSON.stringify(f.q)},"acceptedAnswer":{"@type":"Answer","text":${JSON.stringify(f.a)}}}`).join(',');

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Tratament Ceramic Auto ${city.name} | WOW NanoCeramic Restore & Protect</title>
  <meta name="description" content="Tratament ceramic auto în ${city.name} — restaurare și protecție plastice exterioare. WOW NanoCeramic: barieră nano-ceramică, protecție UV, efect hidrofob. Livrare Sameday 24h în ${city.judet}.">
  <link rel="canonical" href="https://www.wownanoceramic.ro/tratament-ceramic-auto-${city.slug}">
  <meta property="og:title" content="Tratament Ceramic Auto ${city.name} | WOW NanoCeramic">
  <meta property="og:description" content="Restaurare și protecție plastice auto în ${city.name}. Livrare Sameday 24h.">
  <meta property="og:image" content="https://www.wownanoceramic.ro/produs.jpeg">
  <meta property="og:url" content="https://www.wownanoceramic.ro/tratament-ceramic-auto-${city.slug}">
  <meta property="og:type" content="product">
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">
  {
    "@context":"https://schema.org",
    "@graph":[
      {
        "@type":"Product",
        "name":"WOW NanoCeramic Restore & Protect",
        "description":"Tratament nano-ceramic pentru restaurarea și protecția plasticelor exterioare auto. Disponibil în ${city.name} cu livrare Sameday 24h.",
        "image":"https://www.wownanoceramic.ro/produs.jpeg",
        "brand":{"@type":"Brand","name":"WOW NanoCeramic"},
        "offers":{"@type":"Offer","price":"99","priceCurrency":"RON","availability":"https://schema.org/InStock","url":"https://www.wownanoceramic.ro/"},
        "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"127"}
      },
      {
        "@type":"FAQPage",
        "mainEntity":[${faqSchema}]
      },
      {
        "@type":"BreadcrumbList",
        "itemListElement":[
          {"@type":"ListItem","position":1,"name":"Acasă","item":"https://www.wownanoceramic.ro/"},
          {"@type":"ListItem","position":2,"name":"Tratament Ceramic Auto ${city.name}","item":"https://www.wownanoceramic.ro/tratament-ceramic-auto-${city.slug}"}
        ]
      }
    ]
  }
  </script>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Montserrat',sans-serif;background:#080808;color:#fff}
    a{color:inherit;text-decoration:none}
    .hero{background:linear-gradient(135deg,#0a0a0a 0%,#111 50%,#0a0a0a 100%);padding:60px 20px 40px;text-align:center;border-bottom:1px solid #C9A020}
    .hero h1{color:#C9A020;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:800;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px}
    .hero .subtitle{color:#ccc;font-size:1rem;max-width:600px;margin:0 auto 32px;line-height:1.7}
    .btn-main{display:inline-block;background:#C9A020;color:#000;padding:18px 40px;border-radius:50px;font-weight:800;font-size:1rem;text-transform:uppercase;letter-spacing:1px;transition:.3s;cursor:pointer}
    .btn-main:hover{background:#E0B830;transform:scale(1.05)}
    .section{max-width:860px;margin:0 auto;padding:50px 20px}
    .section h2{color:#C9A020;font-size:1.5rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #C9A02033}
    .section p{color:#ccc;line-height:1.8;font-size:1rem;margin-bottom:16px}
    .section strong{color:#fff}
    .images-row{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin:40px 0}
    .images-row img{max-width:100%;width:380px;border-radius:12px;border:1px solid #C9A02044}
    .benefits{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin:30px 0}
    .benefit{background:#111;border:1px solid #C9A02033;border-radius:12px;padding:24px;transition:.3s}
    .benefit:hover{border-color:#C9A020;transform:translateY(-2px)}
    .benefit .icon{font-size:2rem;margin-bottom:12px}
    .benefit h3{color:#C9A020;font-size:1rem;font-weight:700;margin-bottom:8px;text-transform:uppercase}
    .benefit p{color:#aaa;font-size:.9rem;line-height:1.6;margin:0}
    .steps{counter-reset:step;display:flex;flex-direction:column;gap:16px;margin:24px 0}
    .step{display:flex;align-items:flex-start;gap:16px;background:#111;padding:20px;border-radius:10px;border-left:3px solid #C9A020}
    .step-num{background:#C9A020;color:#000;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9rem;flex-shrink:0}
    .step p{color:#ccc;font-size:.95rem;line-height:1.6;margin:0}
    .reviews{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin:30px 0}
    .review{background:#111;border:1px solid #C9A02033;border-radius:12px;padding:24px}
    .review .stars{color:#C9A020;font-size:1.1rem;margin-bottom:10px}
    .review .text{color:#ccc;font-size:.9rem;line-height:1.6;margin-bottom:14px;font-style:italic}
    .review .author{color:#888;font-size:.85rem}
    .review .author strong{color:#fff}
    .faq{display:flex;flex-direction:column;gap:12px;margin:24px 0}
    .faq-item{background:#111;border:1px solid #C9A02033;border-radius:10px;padding:20px;cursor:pointer;transition:.2s}
    .faq-item:hover{border-color:#C9A020}
    .faq-item h3{color:#C9A020;font-size:.95rem;font-weight:700;margin-bottom:8px}
    .faq-item p{color:#aaa;font-size:.9rem;line-height:1.6;margin:0}
    .shipping{background:linear-gradient(135deg,#0d1a00,#111);border:1px solid #C9A020;border-radius:16px;padding:32px;text-align:center;margin:40px 0}
    .shipping h2{color:#C9A020;margin-bottom:12px}
    .shipping p{color:#ccc;margin-bottom:20px}
    .cta-section{background:#111;border-top:2px solid #C9A020;padding:60px 20px;text-align:center}
    .cta-section h2{color:#C9A020;font-size:1.8rem;font-weight:800;margin-bottom:16px;text-transform:uppercase}
    .cta-section p{color:#ccc;margin-bottom:32px;font-size:1rem}
    .price-badge{display:inline-block;background:#C9A02022;border:1px solid #C9A020;color:#C9A020;padding:8px 20px;border-radius:50px;font-weight:700;margin-bottom:24px;font-size:1.1rem}
    .breadcrumb{color:#555;font-size:.85rem;padding:12px 20px;max-width:860px;margin:0 auto}
    .breadcrumb a{color:#888}
    .breadcrumb a:hover{color:#C9A020}
    @media(max-width:600px){.images-row img{width:100%}.hero h1{font-size:1.4rem}}
  </style>
</head>
<body>

<nav class="breadcrumb">
  <a href="/">Acasă</a> › Tratament Ceramic Auto ${city.name}
</nav>

<!-- HERO -->
<section class="hero">
  <h1>Tratament Ceramic Auto ${city.name}</h1>
  <p class="subtitle">
    Restaurare profesională și protecție de lungă durată pentru plasticele exterioare ale mașinii tale din ${city.judet}. 
    Formula nano-ceramică WOW — rezultat vizibil din prima aplicare.
  </p>
  <a href="/" class="btn-main">Comandă Acum — 99 RON</a>
</section>

<!-- IMAGINI INAINTE/DUPA + PRODUS -->
<div class="section">
  <h2>Rezultate Reale — Înainte și După</h2>
  <p>${city.problem}</p>
  <p>${city.unique1}</p>
  <div class="images-row">
    <img src="/inainte-dupa.jpeg" alt="Restaurare plastice auto inainte si dupa WOW NanoCeramic ${city.name}" loading="lazy">
    <img src="/produs.jpeg" alt="WOW NanoCeramic Restore and Protect tratament ceramic plastice auto" loading="lazy">
  </div>
</div>

<!-- BENEFICII -->
<div class="section">
  <h2>De Ce WOW NanoCeramic?</h2>
  <p>WOW NanoCeramic Restore &amp; Protect nu este un simplu dressing pe bază de silicon care se spală la prima ploaie. Este o <strong>formulă nano-ceramică cu legătură permanentă</strong> care penetrează structura plasticului și formează un strat protector invizibil de lungă durată.</p>
  <div class="benefits">
    <div class="benefit">
      <div class="icon">🔬</div>
      <h3>Barieră Nanotechnologică</h3>
      <p>Penetrează structura plasticului și formează un scut invizibil împotriva chimicalelor, sării și murdăriei.</p>
    </div>
    <div class="benefit">
      <div class="icon">☀️</div>
      <h3>Protecție UV Extremă</h3>
      <p>Blochează razele ultraviolete care cauzează decolorarea și crăparea prematură a plasticelor — esențial în ${city.name}.</p>
    </div>
    <div class="benefit">
      <div class="icon">💧</div>
      <h3>Efect Hidrofob Pronunțat</h3>
      <p>Apa, noroiul și murdăria alunecă de pe suprafață. Mașina rămâne curată mai mult timp.</p>
    </div>
    <div class="benefit">
      <div class="icon">⏱️</div>
      <h3>Protecție 2+ Ani</h3>
      <p>Spre deosebire de dressingurile clasice, legătura ceramică durează ani, nu săptămâni.</p>
    </div>
    <div class="benefit">
      <div class="icon">📦</div>
      <h3>Kit Complet Inclus</h3>
      <p>Soluție de degresare IPA, lavetă texturată premium și mănuși de nitril — tot ce ai nevoie.</p>
    </div>
    <div class="benefit">
      <div class="icon">✅</div>
      <h3>Aplicare Ușoară</h3>
      <p>Fără experiență, fără ustensile speciale. 30 minute și mașina arată ca la showroom.</p>
    </div>
  </div>
</div>

<!-- CUM SE APLICA -->
<div class="section">
  <h2>Cum Se Aplică — 3 Pași Simpli</h2>
  <div class="steps">
    <div class="step">
      <div class="step-num">1</div>
      <p><strong>Curăță suprafața</strong> — aplică soluția de degresare IPA inclusă în kit pe lavetă și șterge plasticele care urmează să fie tratate. Asigură-te că suprafața este uscată și fără praf sau urme de grăsime.</p>
    </div>
    <div class="step">
      <div class="step-num">2</div>
      <p><strong>Aplică tratamentul ceramic</strong> — pune 2-3 picături din soluția WOW NanoCeramic pe laveta texturată și masează în mișcări circulare pe suprafața plasticului. Acoperă uniform toată suprafața.</p>
    </div>
    <div class="step">
      <div class="step-num">3</div>
      <p><strong>Lasă să se usuce</strong> — așteptă 2-3 ore pentru uscare completă. Evită contactul cu apa în primele 6 ore. Rezultatul — plastice negre, profunde și protejate pentru 2+ ani!</p>
    </div>
  </div>
</div>

<!-- RECENZII -->
<div class="section">
  <h2>Ce Spun Clienții din ${city.name}</h2>
  <div class="reviews">
    ${city.reviews.map(r => `
    <div class="review">
      <div class="stars">${generateStars(r.stars)}</div>
      <p class="text">"${r.text}"</p>
      <p class="author"><strong>${r.name}</strong> — ${r.car}</p>
    </div>`).join('')}
  </div>
</div>

<!-- FAQ -->
<div class="section">
  <h2>Întrebări Frecvente — ${city.name}</h2>
  <div class="faq">
    ${city.faqs.map(f => `
    <div class="faq-item">
      <h3>${f.q}</h3>
      <p>${f.a}</p>
    </div>`).join('')}
  </div>
</div>

<!-- LIVRARE -->
<div class="section">
  <div class="shipping">
    <h2>🚚 Livrare Rapidă în ${city.name}</h2>
    <p>Livrăm prin <strong>Sameday</strong> în maxim <strong>24 de ore lucrătoare</strong> în ${city.judet}. 
    Poți alege livrare la ușă (curier) sau la cel mai apropiat <strong>EasyBox</strong> din ${city.name}.</p>
    <a href="/" class="btn-main">Comandă Acum — 99 RON</a>
  </div>
</div>

<!-- CTA FINAL -->
<div class="cta-section">
  <h2>Redă Strălucirea Mașinii Tale din ${city.name}</h2>
  <p>Nu lăsa ${city.context} să îți distrugă mașina. WOW NanoCeramic — protecție profesională la îndemâna oricui.</p>
  <div class="price-badge">99 RON — Kit Complet cu Livrare în ${city.name}</div><br><br>
  <a href="/" class="btn-main">Comandă Acum — Livrare 24h</a>
  <p style="color:#555;font-size:.85rem;margin-top:20px">SC STAR WOW S.R.L. | contact@wownanoceramic.ro | 0771 181 151</p>
</div>

</body>
</html>`;
}

// Generare fișiere
const outputDir = path.join(process.cwd(), 'public');
let count = 0;

for (const city of cities) {
  const filename = `tratament-ceramic-auto-${city.slug}.html`;
  const filepath = path.join(outputDir, filename);
  const html = generatePage(city);
  fs.writeFileSync(filepath, html, 'utf8');
  console.log(`✓ ${filename}`);
  count++;
}

console.log(`\n✅ Generate ${count} pagini cu succes!`);
