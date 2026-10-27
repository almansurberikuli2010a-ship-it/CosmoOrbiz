// Источники (общие для всех языков). Цифры проверены по первоисточникам
// в ходе ресерча: research_notes/Космический мусор факты для сайта/.
export const SRC = {
  esaNumbers: { label: 'ESA, Space debris by the numbers (23.10.2026)', url: 'https://www.esa.int/Space_Safety/Space_Debris/Space_debris_by_the_numbers' },
  esa2026: { label: 'ESA Space Environment Report 2026', url: 'https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2026' },
  esaImpact: { label: 'ESA, The impact of space debris (2021)', url: 'https://www.esa.int/ESA_Multimedia/Images/2021/03/The_impact_of_space_debris' },
  astroscale: { label: 'Astroscale, 01.09.2026', url: 'https://www.astroscale.com/en/news/astroscale-japan-selects-isar-aerospace-to-launch-adras-j2' },
  spacexFcc: { label: 'SpaceX, отчёт в FCC, 01.07.2026', url: 'https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6' },
  amos2023: { label: '18/19 SDS, AMOS 2023', url: 'https://ntrs.nasa.gov/api/citations/20230012741/downloads/AMOS_2023_Paper_Final.pdf' },
  nasaFaq: { label: 'NASA Orbital Debris Program Office, FAQ', url: 'https://orbitaldebris.jsc.nasa.gov/faq/' },
  cosmos2251: { label: 'CelesTrak SATCAT (26.10.2026)', url: 'https://celestrak.org/satcat/records.php?INTDES=1993-036&FORMAT=CSV' },
  fengyun: { label: 'CelesTrak SATCAT (26.10.2026)', url: 'https://celestrak.org/satcat/records.php?INTDES=1999-025&FORMAT=CSV' },
  crash: { label: 'Thiele et al., Acta Astronautica (2026)', url: 'https://arxiv.org/abs/2512.09643' },
  nasaHandbook: { label: 'NASA CA Handbook (2023)', url: 'https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf' },
  kessler1978: { label: 'Kessler & Cour-Palais, JGR (1978)', url: 'https://ntrs.nasa.gov/citations/19780057167' },
  iridium: { label: 'NASA ODQN, апрель 2009', url: 'https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf' },
}

// для текстов раздела «Синдром Кесслера»
export const KESSLER_SOURCES = {
  nasaHandbook: SRC.nasaFaq,
  iridium: SRC.iridium,
  nasaFaq: SRC.nasaFaq,
  esa2026: SRC.esa2026,
}
