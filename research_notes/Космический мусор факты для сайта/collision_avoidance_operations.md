# Collision Avoidance Operations Today: Starlink Maneuvers, Pc Thresholds, CDMs, Public Screening (as of 26 Oct 2026)

Verification tags used below:
- **[PRIMARY]**: checked by me in the original document (FCC filing text, NASA handbook, Space-Track handbook, CCSDS standard, ESA/NASA/Space Force-authored paper, CelesTrak page).
- **[SECONDARY]**: reputable reporting that quotes the primary source. I read the article but not the underlying filing.
- **[UNCERTAIN]**: seen only in search snippets, not in a page I could open, or sources conflict. Check before you publish.

---

## 1. SpaceX Starlink semi-annual FCC reports: maneuver counts per period, SpaceX Pc threshold, growth

### Takeaway
Starlink collision-avoidance maneuvers went from 6,873 (Dec 2021–May 2022) to 207,152 (Dec 2025–May 2026), about 30 times more in four years. That is roughly 1,100 maneuvers per day in the latest period. Part of the growth comes from SpaceX making its own trigger more sensitive in two steps: Pc 1e-5, then about 1e-6, then 3e-7. The industry norm is 1e-4. So the counts reflect SpaceX policy as well as how crowded orbit is.

### Cited Findings

**Where the reports come from**
- SpaceX files these reports under voluntary commitments written into FCC orders. For Gen1 this is ¶97u of the modification order of 27 Apr 2021. For Gen2 it is ¶¶135y, bb, ff and gg of the Gen2 authorization of 1 Dec 2022. Reports are due about 1 January and 1 July. Each one answers the FCC's request for the number of conjunction events and the number that led to a maneuver or coordination. **[PRIMARY]** — [SpaceX letter to FCC, 1 Jul 2026 (FCC ICFS attachment)](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)

**Maneuvers per six-month period**

| Reporting period | Filed | Maneuvers | SpaceX Pc trigger stated | Source / tag |
|---|---|---|---|---|
| 1 Dec 2021 – 31 May 2022 | 1 Jul 2022 | **6,873** | 1e-5 (1 in 100,000) vs industry 1e-4 | [SpaceX report copy hosted by J. McDowell (Star2207.pdf)](https://www.planet4589.org/astro/starsim/docs/Star2207.pdf) **[PRIMARY copy]** |
| 1 Jun – 30 Nov 2022 | 30 Dec 2022 | **13,612** propulsive (about 12 per satellite per year) | 1e-5, plus even more conservative triggers | [SpaceX report copy (Star2212.pdf)](https://www.planet4589.org/astro/starsim/docs/Star2212.pdf) **[PRIMARY copy]** |
| 1 Dec 2022 – 31 May 2023 | ~30 Jun 2023 | **25,299** (TechCrunch: "just over 25,000") | 1 in 100,000 (1e-5), described as an order of magnitude stricter than the 1 in 10,000 industry norm | [Space.com via Yahoo, 15 Jan 2024](https://www.yahoo.com/news/starlink-close-encounters-decrease-despite-140006542.html); [TechCrunch, 10 Jul 2023](https://techcrunch.com/2023/07/10/starlink-satellites-are-dodging-objects-in-orbit-thousands-of-times-every-month) **[SECONDARY]** |
| 1 Jun – 30 Nov 2023 | 29 Dec 2023 | **24,410** (about 6 per satellite), the first time the count did not grow | 1 in 100,000 (Space.com wording is odd: "less than 1 in 100,000") | [Space.com (T. Pultarova) via Yahoo, 15 Jan 2024](https://www.yahoo.com/news/starlink-close-encounters-decrease-despite-140006542.html) **[SECONDARY]** |
| 1 Dec 2023 – 31 May 2024 | 1 Jul 2024 | **"nearly 50,000"** (about 14 thruster firings per satellite). Exact figure not found | Lowered by another order of magnitude, to **1 in a million (1e-6)** | [Space.com (T. Pultarova) via Yahoo, 23 Jul 2024](https://www.yahoo.com/news/spacex-starlink-satellites-made-50-150047863.html) **[SECONDARY]** |
| 1 Jun – 30 Nov 2024 | 31 Dec 2024 | **50,666** propulsive (about 35 per satellite per year) | "1 chance in 1 million" vs NASA-derived 1 in 10,000 | [Space Intel Report (P. de Selding), 15 Jan 2025, republished by Kratos](https://www.kratosspace.com/constellations/articles/spacex-semi-annual-update-on-starlink-network-health-failure-rate-collision-risk) **[SECONDARY]** |
| Dec 2024 – "six months ending May 30" 2025 | ~1 Jul 2025 | **144,404** (Gen1 59,414; Gen2 about 84,990 by subtraction) | SpaceX "also lowered its threshold". The new value is behind the paywall (probably 3e-7, see below) | [Space Intel Report, 28 Jul 2025](https://www.spaceintelreport.com/starlink-performed-144000-collision-avoidance-maneuvers-between-december-and-may-wants-equal-reporting-rules-for-all/) **[SECONDARY]**; threshold value **[UNCERTAIN]** |
| 1 Jun – 30 Nov 2025 | ~31 Dec 2025 | **148,696** (Gen1 44,559; Gen2 104,137). Constellation of more than 9,000 satellites | about 3e-7 reported for 2025 | [Space Intel Report, 6 Jan 2026](https://www.spaceintelreport.com/spacex-148696-starlink-collision-maneuvers-in-6-months-ending-nov-30-continued-issues-with-operators-slipshod-reporting/) **[SECONDARY]**; Gen1/Gen2 split from [KeepTrack, 13 Jun 2026](https://keeptrack.space/deep-dive/collision-avoidance-conjunction-screening) **[SECONDARY]** |
| **1 Dec 2025 – 31 May 2026 (latest available)** | **1 Jul 2026** | **207,152** = Gen1 **65,137** (about 36 per satellite per year) + Gen2 **142,015** (about 46 per satellite per year) | **3e-7 (3 in 10,000,000) vs industry 1e-4**, plus extra miss-distance criteria | [SpaceX FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6) **[PRIMARY]** |

- The next report, covering Jun–Nov 2026, should be filed around 31 Dec 2026 – 1 Jan 2027, so it was not yet available on 26 Oct 2026. This is inferred from the filing pattern (30 Dec 2022, 29 Dec 2023, 31 Dec 2024, 1 Jul 2022, 1 Jul 2026) and the 1 January / 1 July due dates in comparable FCC conditions, e.g. [FCC DA 24-476 (Tomorrow.io order, ¶16)](https://docs.fcc.gov/public/attachments/DA-24-476A1.pdf). **[INFERENCE]**

**SpaceX's threshold in its own words**
- 2022 reports: SpaceX maneuvers when Pc is greater than 1e-5 (1 in 100,000), compared with the industry standard of 1e-4 (1 in 10,000). SpaceX calls this an order of magnitude more sensitive. **[PRIMARY]** — [Star2207.pdf](https://www.planet4589.org/astro/starsim/docs/Star2207.pdf); [Star2212.pdf](https://www.planet4589.org/astro/starsim/docs/Star2212.pdf)
- July 2026 report: SpaceX now maneuvers when Pc is greater than 3e-7, compared with the industry standard of 1e-4. It describes this as about two orders of magnitude more sensitive. **[PRIMARY]** — [FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)
- Commentators note that 3e-7 is more than 300 times smaller than 1e-4. **[SECONDARY]** — [The Space Review (B. Oktenli), 14 Sep 2026](https://www.thespacereview.com/article/5312/1)
- On the 1e-6 step in July 2024, Hugh Lewis (University of Southampton) said the doubling "must be mostly due" to the lower threshold. He estimated about 25,000 maneuvers if the old threshold had been kept, and projected about 80,000 per half-year by 2027. **[SECONDARY]** — [Space.com via Yahoo, 23 Jul 2024](https://www.yahoo.com/news/spacex-starlink-satellites-made-50-150047863.html)
- Lewis linked the flat Jun–Nov 2023 count to natural variability and better positional data. In the July 2024 article he also said rising solar activity was probably clearing debris near Starlink altitudes. **[SECONDARY]** — [Space.com via Yahoo, 15 Jan 2024](https://www.yahoo.com/news/starlink-close-encounters-decrease-despite-140006542.html); [Space.com via Yahoo, 23 Jul 2024](https://www.yahoo.com/news/spacex-starlink-satellites-made-50-150047863.html)

**Annual totals and rates reported**
- Jun 2025–May 2026: **355,848** maneuvers (148,696 + 207,152, reported as "over 355,000"). That is more than 40 per satellite per year and over three times the 2024 total. **[SECONDARY]** — [Space.com syndicated by N2YO, Jul 2026](https://www.n2yo.com/satellite-news/Every-SpaceX-Starlink-satellite-has-to-dodge-a-collision-almost-weekly-and-experts-fear-the-worst/11012)
- Calendar 2025: about 300,000 maneuvers, nearly 40 per satellite, with about 9,400 active Starlink satellites (about 65% of operational spacecraft). Some project close to 1 million maneuvers per year by 2027. **[SECONDARY]** — [TeslaNorth, Jan 2026](https://teslanorth.com/2026/01/25/starlink-satellites-made-300000-moves-to-avoid-collisions-in-2025/); [KeepTrack](https://keeptrack.space/deep-dive/collision-avoidance-conjunction-screening)
- Dec 2024–May 2025 (144,404) was a 200% rise on the previous six months, according to Hugh Lewis. **[SECONDARY]** — [Euronews, 3 Jan 2026](https://euronews.com/next/2026/01/03/spacex-to-lower-thousands-of-starlink-satellites-in-2026-as-collisions-rise-company-says)

**Which objects drive maneuvers (debris and other operators)**
- Russian ASAT debris (COSMOS 1408, test of Nov 2021): more than 1,700 maneuvers in Dec 2021–May 2022 and almost 1,700 in Jun–Nov 2022. In both periods it was the object family Starlink dodged most, even though less than 25% of the test fragments were still in orbit by late 2022. **[PRIMARY]** — [Star2207.pdf](https://www.planet4589.org/astro/starsim/docs/Star2207.pdf); [Star2212.pdf](https://www.planet4589.org/astro/starsim/docs/Star2212.pdf). Dec 2022–May 2023: more than 1,300 maneuvers for this debris. **[SECONDARY]** — [TechCrunch](https://techcrunch.com/2023/07/10/starlink-satellites-are-dodging-objects-in-orbit-thousands-of-times-every-month)
- Dec 2025–May 2026, top secondary objects SpaceX maneuvered against: TIANTIE (GUOX/ZJ Lab, NORAD 63990) 1,809; HONGHU 2 (Hongqing Technology) 1,740; NUSAT-41 (Satellogic) 1,457; NUSAT-48 1,422; CHONGZHOU (GUOX/ZJ Lab) 1,390; VSP RF C1 (Aerospacelab) 1,312; NUSAT-44 1,243; NUSAT-50 1,070; YAOGAN-36 04C (PRC) 1,057; NEIJIANG GAOXIN (GUOX/ZJ Lab) 1,041. **[PRIMARY]** — [FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)
- Same period: SpaceX coordinated with other operators "hundreds of times". Outside formal agreements, other satellites maneuvered for SpaceX fewer than 20 times. SpaceX uses "time-domain deconfliction": the transiting satellite takes responsibility far from TCA, and SpaceX keeps responsibility close to TCA. **[PRIMARY]** — [FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)

**Why the process still fails sometimes (useful for "why speed matters")**
- **Launch collision avoidance gap.** Between the end of launch screening and the moment 19 SDS catalogs and screens new satellites, one day to several weeks can pass. SpaceX releases its satellites at about 300 km, posts ephemerides to Space-Track.org with pre-arranged temporary catalog IDs, and notes that screening cycles run every 8 hours. **[PRIMARY]** — [FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)
- **Failed mitigations, Dec 2025–May 2026.** These are events where the targeted risk reduction was not achieved: 6 for Gen1 and 16 for Gen2.
  - Causes include inconsistent or late predictions for the other object; the launch screening gap (payloads from CAS Space Kinetica-1 launched 10 Dec 2025, DISKSAT A from Electron on 18 Dec 2025, MAGNARO-2 from Electron on 23 Apr 2026); and inaccurate operator ephemeris (HYDROGNSS-2).
  - Other causes: a maneuvering Russian satellite that shared no ephemeris; inconsistent radar tracking (5 events involved one poorly tracked object, RBSP A); and **3 events where a Space-Track.org outage meant the CDM arrived too late to maneuver**.
  - **[PRIMARY]** — [FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)
- **Data quality.** Many objects on Space-Track.org have no operator ephemeris or covariance. Some ephemerides show physically impossible orbits, and some covariances are "unrealistic or overly optimistic". Chinese and Russian operators often share no ephemeris or contact details. **[PRIMARY]** — [FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)
- **Forecast disruption.** A COMSPOC study found that each maneuver disrupts orbit forecasts for several days, with position errors up to about 40 km (25 miles). **[SECONDARY]** — [Space.com via Yahoo, 23 Jul 2024](https://www.yahoo.com/news/spacex-starlink-satellites-made-50-150047863.html)
- **Lowering satellites.** In January 2026 SpaceX (Michael Nicolls, VP Starlink engineering) said about 4,400 satellites would move from about 550 km down to 480 km during 2026. Stated reasons: lower collision risk, more than 80% faster decay at end of life, and less exposure to uncoordinated maneuvers and launches by others. **[SECONDARY]** — [Euronews, 3 Jan 2026](https://euronews.com/next/2026/01/03/spacex-to-lower-thousands-of-starlink-satellites-in-2026-as-collisions-rise-company-says)

### Inferences
- **Growth by period.**
  - 6,873 → 13,612 (×2.0) → 25,299 (×1.9) → 24,410 (×0.96) → ~50,000 (×~2.0, the 1e-6 step) → 50,666 (×1.0) → 144,404 (×2.85, the threshold cut) → 148,696 (×1.03) → 207,152 (×1.39).
  - The biggest jumps line up with threshold cuts, so year-to-year counts mix policy with environment.
- From 1e-5 to 3e-7 the trigger became about 33 times more sensitive. 207,152 maneuvers in 182 days (1 Dec 2025–31 May 2026) is about **1,140 maneuvers per day**, or about 47 per hour. No human team could review each one, which is why Starlink uses an onboard, automated system fed by CDMs and ephemerides.
- Lewis's July 2024 projection of about 80,000 per half-year by 2027 was already passed in the first half of 2025 (144,404). Projections are fragile when thresholds change.
- SpaceX reports maneuvers, but the visible text gives no total count of "conjunction events identified" even though the FCC asks for it. So the number of close approaches screened is much larger than the maneuver count, but it is not public.

### Gaps
- **Exact Dec 2023–May 2024 count.** The figure 49,384 is sometimes quoted, but I could not confirm it. Space.com says only "nearly 50,000". **[UNCERTAIN]** The primary FCC filing of 1 Jul 2024 was not reachable; its likely FCC file numbers are SAT-MOD-20200417-00037 (Gen1) and SAT-LOA-20200526-00055 (Gen2).
- **When 3e-7 started.** It is not confirmed whether 3e-7 was introduced in the July 2025 report or the December 2025 report. Space Intel Report says the threshold was lowered in the July 2025 report, but the value is paywalled. **[UNCERTAIN]**
- **Missing primaries.** I could not open the primary FCC PDFs for Jun 2023 through Dec 2025 (Scribd copies blocked). Those rows rest on Space.com, TechCrunch and Space Intel Report.
- **Gen1/Gen2 split for Jun–Nov 2025.** This comes from KeepTrack, a secondary source.

---

## 2. The Pc = 1e-4 maneuver threshold (NASA CARA and industry) and the 1e-5 / 1e-6 / 1e-7 levels

### Takeaway
NASA's Conjunction Assessment handbook (Feb 2023, Rev 1 of the 2020 edition) says the field has broadly settled on a per-event mitigation threshold of **Pc 1e-4 (1 in 10,000)**. Operators who want more safety may use 1e-5. CARA labels events "red" when Pc > 1e-4 and "yellow" when Pc > 1e-7. Launch collision avoidance uses 1e-6 to protect crewed assets and 1e-5 for other active payloads. ESA uses the same 1e-4 level.

### Cited Findings
- **The document.** *NASA Spacecraft Conjunction Assessment and Collision Avoidance Best Practices Handbook*, NASA/SP-20230002470 Rev 1, February 2023. It is the first revision of the 2020 handbook, updated after NPR 8079.1 was issued. **[PRIMARY]** — [NASA NTRS PDF](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **The 1e-4 consensus.** The handbook describes "broad convergence" on a per-event Pc mitigation threshold of 1E-04, meaning remediation is recommended when collision likelihood exceeds 1 in 10,000. More conservative missions "can select a more demanding Pc threshold such as 1E-05". The handbook says this method and the 1E-04 threshold are widely accepted and have historically balanced safety against mission impact. **[PRIMARY]** — [NASA CA Handbook 2023, §6](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Formal recommended practice 6.3.B:** "Pursue mitigation if the Pc value exceeds 1E-04 (1 in 10,000)." **[PRIMARY]** — [NASA CA Handbook 2023](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Target after a maneuver.** NASA recommends cutting Pc by at least 1.5 orders of magnitude. Starting from 1E-04, the goal is about 3.2E-06 or lower. The 1.5-order level comes from a 2019 study (Hall 2019a) showing diminishing returns beyond it. **[PRIMARY]** — [NASA CA Handbook 2023](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Red and yellow events (Appendix F).**
  - Red: at least one CDM with Pc > 1E-04. These need detailed monitoring and mitigation planning, and in a minority of cases a maneuver.
  - Yellow: at least one CDM with Pc > 1E-07. These get closer monitoring.
  - Green: all other events.
  - **[PRIMARY]** — [NASA CA Handbook 2023, App. F](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Launch collision avoidance (LCOLA) examples.** Requirements are 200 km stand-off or Pc 1E-6 against human spaceflight assets, and 25 km or Pc 1E-5 against other active payloads. LCOLA covers launched objects from 150 km altitude through 3 hours. **[PRIMARY]** — [NASA CA Handbook 2023](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Why 1e-4 does not mean many collisions.** If no action were taken, only about 1 in 10,000 such events would actually end in a collision. The handbook says this threshold "has emerged in the industry as an acceptable balance" between safety and mission burden. **[PRIMARY]** — [NASA CA Handbook 2023](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Miss distance alone is a bad trigger.** For events with miss distance under 1 km, low-risk events (Pc < 1E-03) outnumber Pc > 1E-03 events by six to one. Maneuvering on distance alone would produce a "huge number of unnecessary mitigations". **[PRIMARY]** — [NASA CA Handbook 2023, App. E](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **ESA uses 1e-4 too.** Aeolus (2019): ESA's threshold was "a collision probability above 1 in 10,000". **[PRIMARY]** — [ESA, 3 Sep 2019](https://www.esa.int/Space_Safety/ESA_spacecraft_dodges_large_constellation). ESA's general rule: Pc above 10^-4 typically starts maneuver preparation across several teams. **[SECONDARY, quoting ESA]** — [The Space Review, 14 Sep 2026](https://www.thespacereview.com/article/5312/1)
- **Space Force uses the same split.** For near-Earth objects, a CDM is posted to Space-Track when TCA ≤ 3 days, miss distance ≤ 1 km and Pc ≥ 1e-7. An emergency Close Approach Notification email goes out when TCA ≤ 3 days, miss ≤ 1 km and Pc ≥ 1e-4. The handbook writes these as "e^-7" and "e^-4". **[PRIMARY]** — [Spaceflight Safety Handbook for Satellite Operators v1.7, Apr 2023, Table 5](https://www.space-track.org/documents/SFS_Handbook_For_Operators_V1.7.pdf)

### Inferences
- In context, the handbook's "e^-4" and "e^-7" mean 10^-4 and 10^-7, matching the CARA red and yellow levels (my reading of the notation).
- Ladder for the website: 1e-4 = industry and NASA standard (maneuver); 1e-5 = optional stricter level and SpaceX's level through 2023; 1e-6 = launch screening against crewed vehicles and SpaceX from mid-2024; 3e-7 = SpaceX in 2026; 1e-7 = CARA "yellow" watch level and Space-Track reporting floor.

### Gaps
- I did not open the original 2020 handbook (NASA/SP-20205011318, December 2020); that number and date come from memory. **[UNCERTAIN]** The Rev 1 text above is verified.
- I found no per-operator list of thresholds beyond NASA, ESA and SpaceX (for example OneWeb or Planet).

---

## 3. Conjunction Data Messages (CDMs): the CCSDS standard, who issues them, and how many

### Takeaway
A CDM is a standard text message (CCSDS 508.0-B-1, June 2013, updated through Technical Corrigendum 2 of October 2021). Each one describes a single predicted close approach between two objects: time of closest approach, miss distance, relative position and velocity, each object's state and covariance, and the probability of collision. In the US, the Space Force's 18th and 19th Space Defense Squadrons produce them from the high-accuracy catalog and distribute them free through Space-Track.org. In 2023 that was about **600,000 CDMs per day**, up from about 200,000 per day in 2020, and more than half involved Starlink.

### Cited Findings
- **The standard.** *Conjunction Data Message*, Recommended Standard **CCSDS 508.0-B-1** (Blue Book), Issue 1, **June 2013**. Technical Corrigendum 1 came in June 2018 and Technical Corrigendum 2 in October 2021. **[PRIMARY]** — [CCSDS 508.0-B-1 (Cor. 2) PDF](https://ccsds.org/Pubs/508x0b1e2c2.pdf) (formerly at public.ccsds.org/Pubs/508x0b1e2c2.pdf)
- **Purpose.** A standard format for exchanging conjunction information between whoever performs the conjunction assessment and satellite owner/operators. Its stated aims include easier automation of the process and timely decisions. Content listed: miss distance, probability of collision, TCA, and relative position and velocity at closest approach. **[PRIMARY]** — [CCSDS 508.0-B-1 §1.1–1.2](https://ccsds.org/Pubs/508x0b1e2c2.pdf)
- **Format.** ASCII, either keyword=value (KVN) or XML. One CDM covers one conjunction between Object1 and Object2 and includes:
  - positions and velocities at TCA in ITRF, GCRF or EME2000;
  - covariances at TCA;
  - the relative position and velocity of Object2 with respect to Object1;
  - details on how all of this was computed.
  - **[PRIMARY]** — [CCSDS 508.0-B-1 §2.2](https://ccsds.org/Pubs/508x0b1e2c2.pdf)
- **Revision in progress.** A US Commerce presentation reports that the CDM standard is under the mandatory CCSDS five-year review, with a draft (508.0-P-1.2 Pink Book, Nov 2024). The Office of Space Commerce has also published its own TraCSS CDM specification (TraCSS Spec 001 v2.1, Jan 2026). **[UNCERTAIN: search snippet only]** — [Commerce/TraCSS presentation](https://space.commerce.gov/wp-content/uploads/2025/07/Presentation-TraCSS-Listening-Session-on-Updated-CDM-and-OCM-Specifications.pdf); [TraCSS Spec 001 v2.1](https://www.space.commerce.gov/wp-content/uploads/2026/01/TraCSS-Spec-001-v2.1_CDM.pdf)
- **Who does the screening.**
  - 18 SDS (Vandenberg SFB, California) maintains the catalog for USSPACECOM.
  - 19 SDS (Dahlgren, Virginia) screens protected assets against the whole High Accuracy Catalog (HAC) once per day at minimum and up to three times per day.
  - Results are posted as CDMs on Space-Track.org for account holders. Entities without accounts can get emergency email notices.
  - **[PRIMARY]** — [NASA CA Handbook 2023, §3.1–3.2](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- 19 SDS is responsible for on-orbit conjunction assessment for **all** tracked objects and sends conjunction data to US and international commercial, civil, military and academic operators. **[PRIMARY: Space Force co-authors]** — [Ramos, McKissock (18 SDS), Herzer & Eppich (19 SDS) et al., AMOS 2023](https://ntrs.nasa.gov/api/citations/20230012741/downloads/AMOS_2023_Paper_Final.pdf). KeepTrack instead says the 18th covers up to GEO and the 19th beyond. That conflicts with the AMOS paper and the NASA handbook, so don't use it. **[conflict noted]** — [KeepTrack](https://keeptrack.space/deep-dive/collision-avoidance-conjunction-screening)
- **Screening cadence and volumes.**
  - The catalog is updated and propagated (7 days for near-Earth objects, 10 days for deep space) **every 8 hours**. Every object and every operator ephemeris is screened at least once every 24 hours.
  - LEO screening boxes (radial × in-track × cross-track, 5-day propagation): perigee ≤ 500 km: 0.4 × 44 × 51 km; 500–750 km: 0.4 × 25 × 25 km; 750–1200 km: 0.4 × 12 × 12 km; 1200–2000 km: 0.4 × 2 × 2 km.
  - Operator ephemeris for near-Earth objects: 2 × 25 × 25 km, 7 days.
  - **[PRIMARY]** — [Space-Track SFS Handbook v1.7, Apr 2023, Tables 3–4](https://www.space-track.org/documents/SFS_Handbook_For_Operators_V1.7.pdf)
- **What an emergency notice contains.** The CAN email gives the primary and secondary object, miss distances, TCA, and Pc for near-Earth events. **[PRIMARY]** — [SFS Handbook v1.7](https://www.space-track.org/documents/SFS_Handbook_For_Operators_V1.7.pdf)
- **Latency.** NASA notes that screening runs only once every 8 hours. A file that just misses a cycle can take up to 16 hours to be screened, so operators must leave that much margin before a maneuver. The handbook also gives an example of stale data: an ephemeris 12 hours old at submission, then 8 hours to screen and 2 hours to analyze. **[PRIMARY]** — [NASA CA Handbook 2023](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **CDM volumes.**
  - 19 SDS generates about **600,000 CDMs per day** (2023), compared with an average of **200,000 per day in 2020**. 51.7% involve Starlink as primary or secondary, and another 14% involve other large constellations (OneWeb, Iridium, Planet).
  - Without the 2021 burden-sharing deal, in which Starlink handles conjunctions among its own satellites, 19 SDS would produce **660,000 more CDMs per day** for Starlink alone.
  - **[PRIMARY]** — [AMOS 2023 paper (18/19 SDS co-authors)](https://ntrs.nasa.gov/api/citations/20230012741/downloads/AMOS_2023_Paper_Final.pdf)
- **Yearly totals and catalog size.**
  - In 2020, 18 SDS generated **31.5 million CDMs**. As of 1 Aug 2023, 19 SDS had produced **123.5 million**.
  - Operator ephemerides submitted per day rose from 6,000 (2020) to more than 18,000 (77.8% SpaceX, 16.7% OneWeb). Space-Track receives about 51 GB of data per day.
  - As of 1 Aug 2023, conjunction assessment covered about 30,000 tracked objects, 8,700 of them active payloads.
  - **[PRIMARY]** — [AMOS 2023 paper](https://ntrs.nasa.gov/api/citations/20230012741/downloads/AMOS_2023_Paper_Final.pdf)
- **Launch screening.** 19 SDS averages 1–2 launch collision avoidance screenings per day, and Starlink launches can be as little as 4 days apart. **[PRIMARY]** — [AMOS 2023 paper](https://ntrs.nasa.gov/api/citations/20230012741/downloads/AMOS_2023_Paper_Final.pdf)
- **Starlink depends on CDMs.** In Dec 2025–May 2026, three Starlink mitigations failed because a Space-Track.org outage delayed CDM delivery. **[PRIMARY]** — [SpaceX FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)
- **TraCSS, the civil public screening service.** The NOAA Office of Space Commerce is building TraCSS (Traffic Coordination System for Space) to give civil and commercial operators basic space situational awareness data and spaceflight-safety services, under Space Policy Directive 3.
  - 17 pilot organizations as of Feb 2026; 87 pilot user organizations covering more than 11,380 satellites as of Oct 2026.
  - 12 National Government Accounts, with onboarding from 9 Jun 2026.
  - Amazon Kuiper joined on 2 Sep 2025.
  - **[PRIMARY]** — [Office of Space Commerce, TraCSS page](https://space.commerce.gov/traffic-coordination-system-for-space-tracss/)

### Inferences
- **Yearly CDM count.** 123.5 million CDMs by 1 Aug 2023 (213 days) works out to about 580,000 per day. That matches the "about 600,000 per day" figure, so 123.5 million is most likely the 2023 year-to-date total, implying roughly 200 million or more CDMs per year by 2023. This is my calculation, not a published figure.
- **Most CDMs need no action.** The AMOS paper says most constellation CDMs give "little meaningful data" because they are produced in case planned maneuvers don't happen. The bottleneck is sorting the few dangerous events from millions of routine ones quickly. That is the main argument for fast, automated risk rating, the website's AI-model theme.

### Gaps
- I found no official 2024–2026 CDM-per-day figure. The latest authoritative number is the 2023 AMOS paper.
- I did not open the 19th SDS fact sheet on spaceforce.mil.

---

## 4. CelesTrak SOCRATES: what it does, data, cadence

### Takeaway
SOCRATES (Satellite Orbital Conjunction Reports Assessing Threatening Encounters in Space) is CelesTrak's free public screening tool. In its current "SOCRATES Plus" form, it runs **three times each day**. It propagates all public GP element sets (TLEs) with SGP4 for the next **seven days**, lists every approach within **5 km**, and reports each one's minimum distance and **maximum probability**. Because TLEs carry no covariance, the results are screening indicators, not maneuver-grade Pc values.

### Cited Findings
- **What it runs on.** All unclassified GP (general perturbations) element sets released to the public, "often referred to as TLEs", propagated with SGP4 in STK version 12.2. Standard runs do not use SupGP (operator-derived) data, though CelesTrak is considering switching to SupGP where available after quality checks. **[PRIMARY]** — [CelesTrak SOCRATES Plus](https://celestrak.org/SOCRATES/)
- **Cadence, threshold, window.** Runs "three times each day". Lists conjunctions within 5 km at TCA over the next seven days. **[PRIMARY]** — [CelesTrak SOCRATES Plus](https://celestrak.org/SOCRATES/)
- **Outputs.** Each conjunction shows minimum distance and maximum probability. **[PRIMARY]** — [CelesTrak SOCRATES Plus](https://celestrak.org/SOCRATES/)
- **Scope.** Only active satellites are screened against the full catalog. Fully operational satellites in the same fleet are no longer screened against each other. As of 2 Mar 2023: 7,292 of 10,154 payloads counted as active; the screening catalog had 24,139 objects; dropping same-fleet pairs cut that day's conjunctions from 143,997 to 56,343. **[PRIMARY]** — [CelesTrak SOCRATES Plus](https://celestrak.org/SOCRATES/)
- **CelesTrak's own caveats.**
  - The minimum-distance method ignores position covariance and can overstate the true risk.
  - Maximum probability is "more reasonable (although still conservative)".
  - Risk measures that include collision consequences would need better size and mass data and public covariance.
  - The page was last updated 5 Apr 2023.
  - **[PRIMARY]** — [CelesTrak SOCRATES Plus](https://celestrak.org/SOCRATES/)
- **Aeolus example.** Press reports said a SOCRATES report put the Aeolus–Starlink 44 collision chance below 1 in a million, while ESA (working from CDM data) estimated about 1 in 1,000. **[UNCERTAIN: search snippet only]** — [Gizmodo (AU) via search](https://gizmodo.com.au/?p=1179331); compare [ESA](https://www.esa.int/Space_Safety/ESA_spacecraft_dodges_large_constellation)

### Inferences
- "Maximum probability" is a worst-case Pc. It is the largest Pc you can get by assuming the most unfavorable covariance size, because the true covariance isn't known. That is why it is conservative and why SOCRATES can rank encounters but not decide maneuvers. This is general background knowledge; the page itself only calls the method conservative.
- If the Aeolus snippet is correct, the gap between about 1e-6 (TLE-based) and about 1e-3 (CDM-based) shows how far public TLE screening can be from operational assessment.

### Gaps
- The SOCRATES page does not give its start year (often said to be 2004) or a current daily count of conjunctions. **[UNCERTAIN]**
- I could not confirm whether CelesTrak has moved SOCRATES to SupGP data since April 2023.

---

## 5. Why TLE-based screening is uncertain

### Takeaway
NASA says plainly that using TLEs for conjunction assessment "is not recommended" because they are not accurate enough. SGP4 TLEs come with no usable covariance, so a true probability can't be computed. Their built-in theory error in LEO is about **600 m to 3 km within the first 72 hours** of propagation, which is the window when most maneuver decisions are made.

### Cited Findings
- NASA: "This practice is not recommended because the TLE accuracy is not sufficient to perform the necessary conjunction assessment calculations." **[PRIMARY]** — [NASA CA Handbook 2023, §1](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **No covariance.** Most analytic theories, including SGP4 TLEs, can't produce a meaningful covariance, so they yield only a miss distance. No conclusion about probability can be drawn from that. **[PRIMARY]** — [NASA CA Handbook 2023, App. E](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Measured TLE error (Hejduk et al. 2013/2015).** Both TLE production methods (traditional SGP4 fitting and "eGP" extrapolated GP) are noisy from epoch to 72 hours for LEO objects with perigee above 500 km, with errors of 600 m to 3 km. Figure E-2 shows errors growing further at 7 and 15 days. NASA concludes public TLE catalogs should not, on their own, be the basis for risk decisions or maneuvers. **[PRIMARY]** — [NASA CA Handbook 2023, App. E, Figs. E-1–E-2](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Error vs. threshold.** That 600 m–3 km error is a large share of any 1–2 km miss-distance threshold, sometimes larger than the threshold itself. **[PRIMARY]** — [NASA CA Handbook 2023, App. E](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **History.** The TLE catalog was designed to let sensors reacquire objects, not for conjunction assessment. Because SGP4 gave no usable covariance, NASA and the Air Force built the Special Perturbations (SP) catalog to compute Pc (first for ISS protection, especially after the 2009 Iridium 33/COSMOS 2251 collision). The public catalog covers objects larger than about 10 cm in LEO. **[PRIMARY]** — [NASA CA Handbook 2023, §3.1](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Commercial TLE-based services.** NASA warns that commercial conjunction services built on public TLEs "are not sufficiently accurate" for decisions. **[PRIMARY]** — [NASA CA Handbook 2023, §5](https://ntrs.nasa.gov/api/citations/20230002470/downloads/CA_Handbook_CM%20Version%202-24-23.docx.pdf)
- **Comparison with commercial tracking.** Accuracy of the legacy TLE-derived catalog is measured in kilometers. Commercial trackers (LeoLabs, Slingshot, COMSPOC, Kayhan) claim position accuracy down to about 100 m. Covariance sizes are hundreds of meters for well-tracked active LEO satellites and kilometers for poorly tracked debris. **[SECONDARY]** — [KeepTrack, Jun 2026](https://keeptrack.space/deep-dive/collision-avoidance-conjunction-screening)
- **Maneuvers break TLEs.** A satellite's maneuver can throw off TLE-based forecasts by up to about 40 km for several days (COMSPOC). **[SECONDARY]** — [Space.com via Yahoo, 23 Jul 2024](https://www.yahoo.com/news/spacex-starlink-satellites-made-50-150047863.html)

### Inferences
- Starlink makes over 1,000 maneuvers per day, and the AMOS paper notes that the HAC itself does not include predicted maneuvers. So TLE snapshots of maneuvering constellations go stale quickly. This is why operators share ephemerides with covariance (CCSDS OEM) and why models that rate risk fast from noisy inputs are useful.

### Gaps
- The often-quoted rule of thumb "about 1 km error at epoch, growing 1–3 km per day" was **not** found in a primary source this session. Use the NASA figure (600 m–3 km within 72 h for LEO perigee > 500 km) instead. **[UNCERTAIN for the rule of thumb]**

---

## 6. Documented effects of Starlink on science missions, and close approaches with other operators

### Takeaway
Close encounters with Starlink are well documented:
- ESA moved its science satellite **Aeolus** on 2 Sep 2019 after the collision probability with Starlink 44 reached about **1 in 1,000**, ten times ESA's threshold.
- **China** told the UN that its space station maneuvered on **1 Jul and 21 Oct 2021** to avoid Starlink-1095 and Starlink-2305. The US replied that the probabilities were not significant.
- A Chinese **Kinetica-1** payload passed about **200 m** from Starlink-6079 in Dec 2025.
- **Hubble** images show satellite trails in 2.7% of exposures from 2002–2021, and the share is rising (Kruk et al., *Nature Astronomy*, 2023).

### Cited Findings
**ESA Aeolus vs Starlink 44 (2019)**
- Predicted conjunction at 11:02 UTC on 2 Sep 2019 with Starlink 44, one of the first 60 Starlink satellites. ESA's maneuver threshold (Pc > 1 in 10,000) was first crossed on the evening of 29 Aug. By the time the maneuver was approved, Pc was about 1 in 1,000. **[PRIMARY]** — [ESA, 3 Sep 2019](https://www.esa.int/Space_Safety/ESA_spacecraft_dodges_large_constellation)
- ESA contacted Starlink on 28 Aug; Starlink said it had no plan to act then. Final decision came on 1 Sep. Thrusters fired at 10:14, 10:17 and 10:18 UTC, half an orbit before the conjunction, raising Aeolus by 350 m. ESA called it its first maneuver to protect a satellite from a large constellation. **[PRIMARY]** — [ESA, 3 Sep 2019](https://www.esa.int/Space_Safety/ESA_spacecraft_dodges_large_constellation); [ESA image "Predicted near miss between Aeolus and Starlink 44"](https://www.esa.int/ESA_Multimedia/Images/2019/09/Predicted_near_miss_between_Aeolus_and_Starlink_44)
- ESA's Holger Krag called email-based coordination "an archaic process" and said manual collision avoidance will become impossible as satellite numbers grow. ESA proposed automated risk estimation and mitigation, and said 90% of its maneuvers are caused by dead debris. **[PRIMARY]** — [ESA, 3 Sep 2019](https://www.esa.int/Space_Safety/ESA_spacecraft_dodges_large_constellation)
- SpaceX reportedly said it never received the expected alert because of a fault in its on-call paging system. **[UNCERTAIN: secondary, via search snippets]** — [CBC, Sep 2019](https://www.cbc.ca/lite/story/1.5269613); [BGR](https://bgr.com/2019/09/03/spacex-esa-satellites-collision-space-debris/)

**China Space Station (Tianhe core module) vs Starlink (2021), UN document A/AC.105/1262**
- China sent a note verbale to the UN Secretary-General under Article V of the Outer Space Treaty about preventive collision-avoidance maneuvers involving Starlink-1095 and Starlink-2305. It also cited Article VI, which makes states responsible for their national space activities. Dates: the note is dated 3 Dec 2021 per the UNOOSA record, and The Space Review says it was filed 6 Dec 2021. **[SECONDARY: the UNOOSA record returned 404 to my fetcher]** — [UNOOSA A/AC.105/1262 record](https://www.unoosa.org/oosa/oosadoc/data/documents/2021/aac.105/aac.1051262_0.html); [The Space Review (Chen Lan), 28 Feb 2022](https://thespacereview.com/article/4338/1)
- **Incident 1 (1 Jul 2021).** Starlink-1095 had been stable at about 555 km from 19 Apr 2020, then descended to about 382 km between 16 May and 24 Jun 2021. The station made an evasive maneuver that evening. McDowell's analysis: the maneuver was commanded about 09:50 UTC, and the close pass would otherwise have come around 13:15 UTC. **[SECONDARY]** — [The Space Review, 28 Feb 2022](https://thespacereview.com/article/4338/1)
- **Incident 2 (21 Oct 2021).** Starlink-2305 was still raising its orbit through the station's altitude. The station adjusted its orbit at about 03:16 UTC. McDowell estimated the satellites would otherwise have passed within about 1 km; that figure is unverified. **[SECONDARY]** — [The Space Review](https://thespacereview.com/article/4338/1)
- **US reply (note verbale, 28 Jan 2022).** USSPACECOM did not estimate a significant probability of collision in either case. Neither event met emergency notification criteria, and the US knew of no Chinese contact beforehand. **[SECONDARY]** — [The Space Review](https://thespacereview.com/article/4338/1); [Breaking Defense, Feb 2022](https://breakingdefense.com/2022/02/us-rejects-charge-that-starlink-sate)

**OneWeb vs Starlink (April 2021)**
- The Space Force's 18th Space Control Squadron first projected on 30 Mar 2021 that a OneWeb satellite and a Starlink satellite would pass about 60 m apart on 3 Apr, with a 1.3% collision chance. Some outlets say 58 m.
- OneWeb said SpaceX switched off its automated avoidance system so OneWeb could maneuver. SpaceX disputed the "close call" framing in an FCC filing.
- **[UNCERTAIN: secondary/search snippets]** — [SpaceNews](https://spacenews.com/?p=113615); [AIAA summary, 12 Apr 2021](https://aiaa.org/2021/04/12/spacex-oneweb-satellites-come-within-190-feet-of-each-other-in-orbit/)

**Kinetica-1 payload vs STARLINK-6079 (December 2025)**
- SpaceX's Michael Nicolls said a payload from a Chinese Kinetica-1 launch came about 200 m from STARLINK-6079 at about 560 km, with no coordination. CAS Space replied that it chose its launch window using ground-based space awareness data, and that the encounter came about 48 hours after payload separation. **[UNCERTAIN: secondary/search snippets]** — [TechSpot](https://www.techspot.com/news/110600-spacex-satellite-near-miss-china-spacecraft-highlights-growing.html); [WION](https://www.wionews.com/world/starlink-chinese-rocket-near-collision-low-earth-orbit-1765880896941)
- SpaceX's FCC filing confirms that 3 Gen1 mitigation failures involved payloads from the CAS Space Kinetica-1 mission (launched 10 Dec 2025 per the filing; press says 9 Dec, possibly a time-zone difference). **[PRIMARY]** — [FCC filing, 1 Jul 2026](https://api-prod.fcc.gov/icfs-attachment/exp/api/v1/bff0244acfb947505791bf252f851ce6)

**Hubble Space Telescope: Kruk et al. 2023**
- Sandor Kruk (Max Planck Institute for Extraterrestrial Physics) et al., "The impact of satellite trails on Hubble Space Telescope observations", *Nature Astronomy* 7, 262–268 (2023), DOI 10.1038/s41550-023-01903-3. **[SECONDARY: bibliographic data from repository listings]** — [DOI link](https://doi.org/10.1038/s41550-023-01903-3); [Univ. of Southampton ePrints listing](https://eprints.soton.ac.uk/476918)
- **Main result.** Citizen scientists (Hubble Asteroid Hunter) and a deep-learning model checked Hubble archive images from 2002–2021. **2.7%** of individual exposures (typically 11 minutes long) are crossed by satellites, and the share grows over time. It depends on field of view, exposure time, filter and pointing, and the authors expect it to rise in the next decade. **[SECONDARY: abstract text via repository snippet]** — [Univ. of Münster CRIS listing](https://cris-portal.uni-muenster.de/portal/en/publication/99469859)
- **Dataset.** A public table of 114,607 HST images with satellite-trail labels (released in the eHST archive by 3 Oct 2021). **[SECONDARY]** — [Zenodo record 7474191](https://zenodo.org/records/7474191)
- **Trends by period.** ACS/WFC: 2.8 ± 0.2% of images affected (2002–2005) vs 4.3 ± 0.4% (2018–2021). WFC3/UVIS: 1.2 ± 0.1% (2009–2012) vs 2.0 ± 0.2% (2018–2021). **[UNCERTAIN: Astrobites summary seen via search snippet]** — [Astrobites, 10 Aug 2023](https://astrobites.org/2023/08/10/telescopes_in_orbit/)
- **Other reported numbers.** Universe Today reports the odds of a trail rose 59% for ACS/WFC and 71% for WFC3/UVIS, and that 144 images had several trails. It says LEO satellites rose about 40% from 2005 to 2021 while trail images rose about 50%. It gives Hubble's altitude as about 538 km, decaying from about 547 km at launch. **[SECONDARY]** — [Universe Today](https://www.universetoday.com/articles/hubbles-orbit-has-dropped-so-far-that-starlink-satellites-are-photobombing-its-images). A further claim, 3.7% (2009–2020) rising to 5.9% (including 2021), appears only in a Portuguese article. **[UNCERTAIN]** — [Canaltech](https://canaltech.com.br/espaco/rastros-de-satelites-tambem-estragam-fotos-tiradas-pelo-hubble-241864/)
- **Starlink is not named in the abstract.** The paper refers to LEO constellations in general; linking the trend to Starlink comes from press coverage. A NASA spokesperson said most trails can be removed in data processing and are not currently a significant threat to Hubble's science efficiency. **[SECONDARY]** — [ExplorersWeb](https://explorersweb.com/hubble-space-telescope-satellite-streaks/)

**NASA's view of Starlink Gen2 (Feb 2022 comments to the FCC)**
- NASA expected more conjunctions for its science and human spaceflight missions. Gen2's nearly 30,000 more satellites would multiply objects below 600 km "over five-fold".
- NASA said SpaceX's "zero risk" claim "lacks statistical substantiation" and that propulsion, detection and software should not be assumed 100% reliable. It raised concerns about automated systems maneuvering against each other.
- It also flagged Starlink glint affecting Hubble and asteroid-survey images.
- **[SECONDARY]** — [Via Satellite (R. Jewett), 10 Feb 2022](https://www.satellitetoday.com/government-military/2022/02/10/nasa-amazon-satellite-operators-take-issue-with-spacex-starlink-gen-2-in-fcc-filings/). Space.com's claim that NASA put current Hubble streak interference at about 8%, possibly doubling, is **[UNCERTAIN]** — [Space.com](https://space.com/nasa-collision-risk-starlink)

**How little margin there is: the "CRASH Clock"**
- Thiele, Heiland, Boley & Lawler, "An Orbital House of Cards: Frequent Satellite Close Conjunctions" (arXiv:2512.09643, v1 10 Dec 2025, v3 29 Jun 2026, accepted in *Acta Astronautica*). The CRASH Clock is the time until a catastrophic collision becomes likely if satellites stopped maneuvering, for example after a solar storm. The latest version gives **5.5 days as of June 2025** vs **164 days in 2018**. **[PRIMARY: arXiv abstract]** — [arXiv:2512.09643](https://arxiv.org/abs/2512.09643)

### Inferences
- **Hubble and the Starlink shells.** At about 538 km, Hubble now sits inside the band where Starlink operates. Main shells are around 480–560 km: the 550 → 480 km lowering plan in [Euronews](https://euronews.com/next/2026/01/03/spacex-to-lower-thousands-of-starlink-satellites-in-2026-as-collisions-rise-company-says) and STARLINK-6079 at about 560 km in the Kinetica-1 reports. So Hubble's exposure to trails and conjunctions is likely to keep growing.
- **Same pattern every time.** Aeolus (2019), the China Space Station (2021), OneWeb (2021) and Kinetica-1 (2025) all show the same failure: different operators had different data and no fast, shared way to agree on risk. ESA's 2019 call for automated risk estimation addresses exactly that.

### Gaps
- I could not open the full text of UN document A/AC.105/1262 (404). The details above come from The Space Review.
- I could not open the Kruk et al. full text on nature.com (login wall). The percentage trends rely on summaries.
- Earlier versions of the CRASH Clock paper may give different numbers than v3. Media from December 2025 may quote other values, so cite the version you use. **[UNCERTAIN]**
- I found no documented case of a NASA science satellite (other than ISS coordination) making a maneuver specifically to avoid a Starlink satellite. The AMOS paper says ISS–Starlink conjunctions are kept low by a NASA–SpaceX Space Act Agreement under which ISS ephemerides are shared. — [AMOS 2023 paper](https://ntrs.nasa.gov/api/citations/20230012741/downloads/AMOS_2023_Paper_Final.pdf)
