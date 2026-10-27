// Карточки фактов на трёх языках. Цифры — из ресерча (research_notes/),
// у каждой карточки ссылка на первоисточник. «ours» — результаты нашего проекта.
import { SRC } from './sources.js'

const IMG_DEBRIS = '/img/debris_cloud_nasa.png'
const IMG_ELSA = '/img/elsa_d_astroscale.webp'

const ru = [
  {
    big: '47 260',
    text: 'объектов отслеживают на орбите на октябрь 2026 года. Работающих спутников среди них около 15 900 — примерно каждый третий объект. Остальное — мёртвые спутники, ступени ракет и обломки.',
    source: SRC.esaNumbers,
    image: { src: IMG_DEBRIS, alt: 'Компьютерная иллюстрация: облако объектов вокруг Земли', credit: 'Иллюстрация: NASA ODPO (объекты не в масштабе)' },
  },
  {
    big: '1,5 млн',
    text: 'обломков размером от 1 до 10 см кружат вокруг Земли по модели ESA (1 февраля 2026). Крупнее 10 см — около 68 450, от 1 мм до 1 см — около 230 миллионов.',
    source: SRC.esa2026,
  },
  {
    big: '40 км/ч',
    text: 'Обломок размером всего 1 см на скорости около 10 км/с бьёт с энергией небольшого автомобиля, врезающегося на скорости 40 км/ч.',
    source: SRC.esaImpact,
  },
  {
    big: '0',
    text: 'кусков настоящего мусора пока убрано с орбиты специальной миссией (октябрь 2026). Ближе всех японская Astroscale: ELSA-d в 2021 году поймала собственный тестовый спутник, а ADRAS-J в 2024-м подлетела на 15 м к брошенной ступени ракеты H-IIA и сфотографировала её. Первый настоящий захват — задача миссии ADRAS-J2.',
    source: SRC.astroscale,
    image: { src: IMG_ELSA, alt: 'Аппарат ELSA-d и его тестовый «клиент»', credit: 'Изображение: © Astroscale' },
  },
  {
    big: '207 152',
    text: 'манёвра уклонения сделали спутники Starlink за полгода — с декабря 2025 по май 2026. Это около 1 100 в сутки и примерно в 30 раз больше, чем за тот же период 2021–2022 годов.',
    source: SRC.spacexFcc,
  },
  {
    big: '≈ 600 000',
    text: 'предупреждений о сближении (CDM) в сутки выпускали военные США в 2023 году — в три раза больше, чем в 2020-м. 51,7% из них касались Starlink.',
    source: SRC.amos2023,
  },
  {
    big: '41',
    text: 'раз МКС уходила от обломков с 1999 года. Станция маневрирует, если вероятность столкновения выше 1 к 10 000.',
    source: SRC.nasaFaq,
  },
  {
    big: '2 370',
    text: 'каталогизированных обломков осталось от столкновения Iridium 33 и «Космоса-2251» в 2009 году. Спустя 17 лет 722 из них всё ещё на орбите.',
    source: SRC.cosmos2251,
  },
  {
    big: '3 531',
    text: 'обломок дало испытание противоспутниковой ракеты в 2007 году, когда Китай уничтожил свой спутник Fengyun-1C. Это худшее событие в истории: почти через 20 лет на орбите остаются 2 311 обломков.',
    source: SRC.fengyun,
  },
  {
    big: '5,5 дня',
    text: 'хватило бы, чтобы произошло вероятное катастрофическое столкновение, если бы все спутники разом перестали уклоняться (оценка на июнь 2025 года). В 2018 году этот срок был 164 дня.',
    source: SRC.crash,
  },
  {
    big: '0,6–3 км',
    text: 'составляет ошибка положения по открытым данным TLE уже в первые 72 часа. Поэтому NASA не рекомендует оценивать сближения только по TLE — и наша нейросеть служит фильтром перед точной проверкой, а не её заменой.',
    source: SRC.nasaHandbook,
  },
  {
    big: '77–90%',
    text: 'всех сближений ближе 5 км, которые мы нашли за 48 часов, — пары внутри одной группировки, в основном Starlink–Starlink. Их координирует оператор, поэтому наша модель учитывает только внешние угрозы.',
    ours: true,
  },
  {
    big: '214',
    text: 'спутников оказались опасными во всех четырёх наших расчётах с 21 по 31 октября 2026 года. Большинство летает на высоте 460–510 км, в том же слое, что и тысячи спутников Starlink. Среди них — телескоп «Хаббл».',
    ours: true,
  },
]

const en = [
  {
    big: '47,260',
    text: 'objects were tracked in orbit as of October 2026. About 15,900 of them are working satellites — roughly one object in three. The rest are dead satellites, rocket bodies and fragments.',
    source: SRC.esaNumbers,
    image: { src: IMG_DEBRIS, alt: 'Computer illustration: a cloud of objects around the Earth', credit: 'Illustration: NASA ODPO (objects not to scale)' },
  },
  {
    big: '1.5 million',
    text: 'fragments between 1 and 10 cm circle the Earth according to ESA’s model (1 February 2026). About 68,450 are larger than 10 cm, and about 230 million are between 1 mm and 1 cm.',
    source: SRC.esa2026,
  },
  {
    big: '40 km/h',
    text: 'A fragment just 1 cm across, moving at about 10 km/s, hits with the energy of a small car crashing at 40 km/h.',
    source: SRC.esaImpact,
  },
  {
    big: '0',
    text: 'pieces of real debris have been removed by a dedicated mission so far (October 2026). Japan’s Astroscale is closest: ELSA-d captured its own test satellite in 2021, and in 2024 ADRAS-J flew within 15 m of an abandoned H-IIA rocket stage and photographed it. The first real capture is the goal of ADRAS-J2.',
    source: SRC.astroscale,
    image: { src: IMG_ELSA, alt: 'The ELSA-d servicer and its test client', credit: 'Image: © Astroscale' },
  },
  {
    big: '207,152',
    text: 'collision-avoidance manoeuvres were made by Starlink satellites in six months, December 2025 to May 2026. That is about 1,100 a day and roughly 30 times more than in the same period of 2021–2022.',
    source: SRC.spacexFcc,
  },
  {
    big: '≈ 600,000',
    text: 'conjunction warnings (CDMs) a day were issued by the US military in 2023 — three times more than in 2020. 51.7% of them involved Starlink.',
    source: SRC.amos2023,
  },
  {
    big: '41',
    text: 'times the ISS has dodged debris since 1999. The station manoeuvres when the chance of a collision is above 1 in 10,000.',
    source: SRC.nasaFaq,
  },
  {
    big: '2,370',
    text: 'catalogued fragments came from the 2009 collision of Iridium 33 and Cosmos 2251. Seventeen years later, 722 of them are still in orbit.',
    source: SRC.cosmos2251,
  },
  {
    big: '3,531',
    text: 'fragments were created in 2007 when China destroyed its Fengyun-1C satellite in an anti-satellite missile test. It is the worst debris event on record: almost 20 years on, 2,311 fragments are still in orbit.',
    source: SRC.fengyun,
  },
  {
    big: '5.5 days',
    text: 'is how soon a catastrophic collision would become likely if all satellites stopped manoeuvring at once (estimate for June 2025). In 2018 it was 164 days.',
    source: SRC.crash,
  },
  {
    big: '0.6–3 km',
    text: 'is the position error of open TLE data within the first 72 hours. That is why NASA does not recommend assessing conjunctions from TLEs alone — and why our neural network is a filter before a precise check, not a replacement for it.',
    source: SRC.nasaHandbook,
  },
  {
    big: '77–90%',
    text: 'of all approaches closer than 5 km that we found over 48 hours were pairs within the same constellation, mostly Starlink–Starlink. The operator coordinates them, so our model counts only external threats.',
    ours: true,
  },
  {
    big: '214',
    text: 'satellites were dangerous in all four of our runs between 21 and 31 October 2026. Most fly at 460–510 km, in the same layer as thousands of Starlink satellites. The Hubble Space Telescope is among them.',
    ours: true,
  },
]

const kk = [
  {
    big: '47 260',
    text: 'нысан 2026 жылғы қазандағы жағдай бойынша орбитада бақыланады. Олардың ішінде жұмыс істеп тұрған серіктер шамамен 15 900 — әр үшінші нысан. Қалғаны — істен шыққан серіктер, зымыран сатылары мен сынықтар.',
    source: SRC.esaNumbers,
    image: { src: IMG_DEBRIS, alt: 'Компьютерлік иллюстрация: Жерді қоршаған нысандар бұлты', credit: 'Иллюстрация: NASA ODPO (нысандар масштабта емес)' },
  },
  {
    big: '1,5 млн',
    text: 'өлшемі 1-ден 10 см-ге дейінгі сынық ESA моделі бойынша Жерді айналып жүр (2026 жылғы 1 ақпан). 10 см-ден үлкені — шамамен 68 450, 1 мм-ден 1 см-ге дейінгісі — шамамен 230 миллион.',
    source: SRC.esa2026,
  },
  {
    big: '40 км/сағ',
    text: 'Өлшемі небәрі 1 см сынық шамамен 10 км/с жылдамдықпен соғылғанда 40 км/сағ жылдамдықпен соқтығысқан шағын автокөліктей энергия бөледі.',
    source: SRC.esaImpact,
  },
  {
    big: '0',
    text: 'нақты қоқыс бөлігі әзірге арнайы миссиямен орбитадан алынды (2026 жылғы қазан). Жапондық Astroscale бәрінен жақын: ELSA-d 2021 жылы өзінің сынақ серігін ұстады, ал ADRAS-J 2024 жылы H-IIA зымыранының тастанды сатысына 15 м-ге дейін жақындап, оны суретке түсірді. Алғашқы нақты ұстау — ADRAS-J2 миссиясының міндеті.',
    source: SRC.astroscale,
    image: { src: IMG_ELSA, alt: 'ELSA-d аппараты және оның сынақ «клиенті»', credit: 'Сурет: © Astroscale' },
  },
  {
    big: '207 152',
    text: 'соқтығысудан жалтару маневрін Starlink серіктері жарты жылда — 2025 жылғы желтоқсаннан 2026 жылғы мамырға дейін жасады. Бұл тәулігіне шамамен 1 100 және 2021–2022 жылдардағы осындай кезеңнен шамамен 30 есе көп.',
    source: SRC.spacexFcc,
  },
  {
    big: '≈ 600 000',
    text: 'жақындасу туралы ескерту (CDM) 2023 жылы АҚШ әскерилері тәулігіне жариялап отырды — 2020 жылмен салыстырғанда үш есе көп. Олардың 51,7%-ы Starlink-ке қатысты болды.',
    source: SRC.amos2023,
  },
  {
    big: '41',
    text: 'рет ХҒС 1999 жылдан бері сынықтардан жалтарды. Соқтығысу ықтималдығы 10 000-нан 1-ден асса, станция маневр жасайды.',
    source: SRC.nasaFaq,
  },
  {
    big: '2 370',
    text: 'каталогқа енген сынық 2009 жылы Iridium 33 пен «Космос-2251» соқтығысуынан қалды. 17 жыл өтсе де, олардың 722-сі әлі орбитада.',
    source: SRC.cosmos2251,
  },
  {
    big: '3 531',
    text: 'сынық 2007 жылы Қытай өзінің Fengyun-1C серігін серікке қарсы зымыранмен қиратқанда пайда болды. Бұл — тарихтағы ең ауыр оқиға: 20 жылға жуық уақыт өтсе де, орбитада 2 311 сынық қалып отыр.',
    source: SRC.fengyun,
  },
  {
    big: '5,5 күн',
    text: 'ішінде барлық серіктер бірден жалтаруды тоқтатса, апатты соқтығысу ықтимал болар еді (2025 жылғы маусымдағы баға). 2018 жылы бұл мерзім 164 күн болған.',
    source: SRC.crash,
  },
  {
    big: '0,6–3 км',
    text: '— ашық TLE деректері бойынша орынның алғашқы 72 сағаттағы қателігі. Сондықтан NASA жақындасуды тек TLE арқылы бағалауды ұсынбайды — ал біздің нейрожелі дәл тексеруді алмастырмайды, оның алдындағы сүзгі қызметін атқарады.',
    source: SRC.nasaHandbook,
  },
  {
    big: '77–90%',
    text: '— біз 48 сағатта тапқан 5 км-ден жақын барлық жақындасулар ішіндегі бір топтама жұптарының үлесі, олардың басым бөлігі — Starlink–Starlink. Оларды оператор үйлестіреді, сондықтан біздің модель тек сыртқы қауіптерді ескереді.',
    ours: true,
  },
  {
    big: '214',
    text: 'серік 2026 жылғы 21–31 қазан аралығындағы төрт есептеуіміздің бәрінде қауіпті болып шықты. Олардың көбі 460–510 км биіктікте, мыңдаған Starlink серігімен бір қабатта ұшады. Солардың ішінде «Хаббл» телескопы да бар.',
    ours: true,
  },
]

export const FACTS = { ru, en, kk }
