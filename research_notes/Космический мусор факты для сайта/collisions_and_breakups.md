# Real-world satellite collisions, ASAT tests, major breakups and ISS debris avoidance (verified notes, current to 26 Oct 2026)

How to read these notes:
- **"SATCAT 26 Oct 2026"** means I counted the numbers myself from the public CelesTrak Satellite Catalog (SATCAT), which mirrors the U.S. Space Force catalog. I pulled it as CSV on 26 Oct 2026 with `records.php?INTDES=<launch>`.
  - I counted objects of type DEB that carry the parent's name ("FENGYUN 1C DEB" and so on).
  - "In orbit" means the catalog lists no decay date.
  - The catalog only holds tracked objects, which in low Earth orbit (LEO) are generally larger than about 5–10 cm.
- **UNCERTAIN** marks a figure that is secondary-only, conflicting, or not confirmed by a primary or authoritative source.

## Iridium 33 / Cosmos 2251 collision (10 Feb 2009): time, altitude, location, speed, fragment counts, how many remain

### Takeaway
On 10 February 2009 at 16:56 UTC, the working Iridium 33 and the dead Cosmos 2251 collided at about 790 km over northern Siberia. NASA puts the collision speed at "more than 11 km/s"; the popular 11.7 km/s figure comes only from secondary sources. As of 26 Oct 2026 the public catalog lists 2,370 fragments from the two satellites: 1,714 from Cosmos 2251 and 656 from Iridium 33. 722 of them (about 30%) are still in orbit: 607 from Cosmos and 115 from Iridium.

### Cited Findings
- **Date and time.** NASA states that Iridium 33 (1997-051C, SSN 24946) and Cosmos 2251 (1993-036A, SSN 22675) "collided at 1656 GMT as the two vehicles passed over extreme northern Siberia at an altitude of 790 km". — [NASA ODQN vol. 13 iss. 2, Apr 2009, "Satellite Collision Leaves Significant Debris Clouds"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
- **Orbits and speed.** Both satellites were in nearly circular orbits inclined 86.4° (Iridium) and 74.0° (Cosmos). The orbital planes crossed "at a nearly right angle, resulting in a collision velocity of more than 11 km/s". — [NASA ODQN 13-2, Apr 2009](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
- **"First collision of two intact satellites."** NASA called it "the first accidental hypervelocity collision of two intact spacecraft". It was "the fourth known accidental hypervelocity collision between two cataloged objects"; each of the three earlier ones produced at most four catalogued debris. — [NASA ODQN 13-2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
- **Masses.**
  - NASA: 560 kg for Iridium 33 and about 900 kg for Cosmos 2251. — [NASA ODQN 13-2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
  - ESA's database gives different values: 661.0 kg (Iridium 33, altitude band 776.2–779.4 km) and 892.0 kg (Cosmos-2251, altitude band 776.1–791.1 km). — [ESA Annual Space Environment Report, Issue 10.1, 8 Sep 2026, p. 79](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
  - The two agencies use different mass definitions.
- **Exact time and predicted miss distance.**
  - CelesTrak (T.S. Kelso) gives the collision time as 16:55:59.806 UTC and the location as "over northern Russia".
  - Its SOCRATES screening, run at 15:02 UTC that day, had predicted the pair would miss by 584 m. Over the previous week the predictions ranged from 117 m to 1.812 km. — [CelesTrak, "Iridium 33/Cosmos 2251 Collision" (page last updated 19 Nov 2024)](https://celestrak.org/events/collision/)
- **Altitude 789 km, 11.7 km/s, Taymyr Peninsula (UNCERTAIN, secondary only).**
  - Wikipedia states "at a speed of 11.7 km/s … and an altitude of 789 kilometres … above the Taymyr Peninsula".
  - The 11.7 km/s figure comes from New Scientist (13 Feb 2009), which gives "42,120 km/h (11.7 km/s)". — [Wikipedia, "2009 satellite collision"](https://en.wikipedia.org/wiki/2009_satellite_collision); [New Scientist, 13 Feb 2009](https://www.newscientist.com/article/dn16604-satellite-collision-more-powerful-than-chinas-asat-test.html)
  - NASA's primary figures are 790 km and ">11 km/s".
- **How the fragment count grew:**
  - End of March 2009: 823 large debris catalogued. — [NASA ODQN 13-2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
  - 22 Jun 2012: Iridium 33 had 598 pieces (93 decayed) and Cosmos 2251 had 1,603 (222 decayed). — [CelesTrak collision page](https://celestrak.org/events/collision/)
  - Jan 2016: 1,668 catalogued from Cosmos 2251 and 628 from Iridium 33, with 1,141 and 364 still in orbit. — SpaceNews, 25 Apr 2016, "10 breakups account for 1/3 of catalogued debris", as cited by [Wikipedia](https://en.wikipedia.org/wiki/2009_satellite_collision) (secondary)
  - 14 Feb 2024 (Space-Track query cited by Wikipedia): 916 Cosmos 2251 and 212 Iridium 33 debris still in orbit. — [Wikipedia](https://en.wikipedia.org/wiki/2009_satellite_collision) (secondary)
- **Latest count (SATCAT 26 Oct 2026):**
  - Cosmos 2251: 1,714 catalogued; 1,107 decayed; 607 in orbit. First decay 12 Mar 2009, latest 20 Oct 2026. — [CelesTrak SATCAT, INTDES 1993-036](https://celestrak.org/satcat/records.php?INTDES=1993-036&FORMAT=CSV)
  - Iridium 33: 656 catalogued; 541 decayed; 115 in orbit. Latest decay 21 Sep 2026. — [CelesTrak SATCAT, INTDES 1997-051](https://celestrak.org/satcat/records.php?INTDES=1997-051&FORMAT=CSV)
  - The main bodies of both satellites are still catalogued in orbit: Cosmos 2251 at 798 × 764 km and Iridium 33 at 779 × 770 km. — [CelesTrak SATCAT CATNR 22675](https://celestrak.org/satcat/records.php?CATNR=22675&FORMAT=CSV); [CATNR 24946](https://celestrak.org/satcat/records.php?CATNR=24946&FORMAT=CSV)
- **Where the remaining debris is.** Perigees of the Cosmos 2251 debris still in orbit range from 344 to 774 km (median 689 km); apogees reach up to 1,606 km. — [CelesTrak SATCAT 1993-036](https://celestrak.org/satcat/records.php?INTDES=1993-036&FORMAT=CSV) (my tally)
- **How long it lasts.** NASA expected in 2009 that "the orbital lifetimes of many of the debris are likely to be measured in decades". — [NASA ODQN 13-2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
  - A NASA Johnson Space Center paper said some debris from both satellites will remain in orbit through the end of the century. — [NASA NTRS 20100002023](https://ntrs.nasa.gov/citations/20100002023) (seen only via search summary)

### Inferences
- **Suggested wording for the website:** "10 Feb 2009, 16:56 UTC, about 790 km above northern Siberia, more than 11 km/s (often quoted as 11.7 km/s). 2,370 tracked fragments; 722 still in orbit as of Oct 2026."
- About 70% of the catalogued collision fragments have now re-entered. Decay sped up between Feb 2024 (1,128 still in orbit per Space-Track via Wikipedia) and Oct 2026 (722), which fits the 2024–2025 solar maximum.
- All the debris catalog numbers are 33757 or higher, i.e. issued after Feb 2009. So all counted pieces can be attributed to the collision.

### Gaps
- I found no primary source (NASA, U.S. Space Command or Iridium) for the exact 11.7 km/s, the 789 km figure, or latitude/longitude coordinates. Kelso's original 2009 AMOS paper would be the best place to check.

## Fengyun-1C Chinese ASAT test (11 Jan 2007): altitude, fragments, how many remain, how long they stay

### Takeaway
China destroyed its 960 kg Fengyun-1C weather satellite with a ground-launched interceptor on 11 Jan 2007, in an 845 × 865 km orbit. It is still the worst debris event on record: 3,531 catalogued fragments, of which 2,311 (about 65%) are still in orbit as of 26 Oct 2026, almost 20 years later. NASA said the lifetimes are "measured in decades and even centuries".

### Cited Findings
- **The test.**
  - On 11 January 2007, a Chinese ASAT test destroyed Fengyun-1C (1999-025A, SSN 25730), which was "residing in an orbit of 845 km by 865 km with an inclination of 98.6°".
  - "The 960-kg spacecraft was struck by a ballistic interceptor launched near Xichang."
  - NASA called the debris cloud "the single worst contamination of low Earth orbit (LEO) during the past 50 years". — [NASA ODQN vol. 11 iss. 2, Apr 2007, "Chinese Anti-satellite Test Creates Most Severe Orbital Debris Cloud in History"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv11i2.pdf)
- **ESA's parameters:** mass 958.0 kg, altitude 843.3–863.3 km, inclination 98.6°. — [ESA Space Environment Report 2026, p. 79](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
- **Spread and lifetimes.** The debris extends "from 200 km to more than 4000 km in altitude". "The majority of the debris were thrown into long-duration orbits, with lifetimes measured in decades and even centuries." — [NASA ODQN 11-2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv11i2.pdf)
- **Early counts:**
  - Two months after the test, more than 1,200 debris were catalogued and nearly 400 more were being tracked.
  - By 31 Mar 2007, 1,613 fragments had been identified.
  - NASA estimated that objects of 1 cm or larger could number "as large as 35,000". — [NASA ODQN 11-2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv11i2.pdf)
- **Latest count (SATCAT 26 Oct 2026):**
  - 3,531 FENGYUN 1C DEB catalogued; 1,220 decayed; 2,311 still in orbit.
  - First decay 6 Feb 2007, latest 4 Oct 2026.
  - Debris catalog numbers run from 29716 to 49389, so all were catalogued after the test.
  - Perigees of the debris still in orbit run from 298 to 1,281 km (median 764 km); apogees go up to 3,140 km.
  - The FY-1C main remnant is still in orbit at 810 × 791 km. — [CelesTrak SATCAT, INTDES 1999-025](https://celestrak.org/satcat/records.php?INTDES=1999-025&FORMAT=CSV); [CATNR 25730](https://celestrak.org/satcat/records.php?CATNR=25730&FORMAT=CSV)
- **Combined effect.** NASA notes that the FY-1C test and the 2009 Iridium–Cosmos collision "alone more than doubled the cataloged objects below 1000 km altitude", in its discussion of breakup debris. — [NASA ODQN vol. 29 iss. 3, Sep 2025](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i3.pdf)
- **ISS impact.** FY-1C fragments have forced several ISS maneuvers, including 10 Nov 2021 (fragment 1999-025DKS, SSN 35114) and 25 Nov 2024 (1999-025AEN, SSN 30423). — [NASA ODQN 26-1, Mar 2022](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv26i1.pdf); [NASA ODQN 29-2, May 2025](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i2.pdf)
- **Other figures (low reliability).** Orbitalradar.com claims about 2,800 fragments remain catalogued in 2026. This conflicts with the SATCAT tally above, so do not use it. — [orbitalradar blog](https://orbitalradar.com/blog/fengyun-1c-debris-legacy-2007-asat-test)

### Inferences
- **Suggested wording for the website:** "more than 3,500 tracked fragments; about 2,300 (two-thirds) still in orbit in 2026".
- Because most of the remaining debris sits around 750–900 km, where air drag is very weak, a large share will probably still be in orbit in the 2030s–2050s. This is an inference from NASA's "decades and even centuries" statement and the current perigee distribution, not a published forecast.

### Gaps
- I found no NASA or ESA forecast dated 2024–2026 giving a year by which most FY-1C debris will be gone.
- The exact UTC time of the intercept was not found in a primary source.

## Cosmos 1408 Russian ASAT test (15 Nov 2021): altitude, fragments, ISS crew sheltering, decay

### Takeaway
Russia destroyed the 1,750 kg Cosmos 1408 in a 490 × 465 km orbit with a direct-ascent missile early on 15 Nov 2021 (UTC). U.S. Space Force tracking quickly found more than 1,500 trackable fragments, and the catalog eventually reached 1,805. The ISS crew sheltered in their docked spacecraft for about 2 hours. Because the test was at a low altitude, about 96% of the catalogued fragments had re-entered by the end of 2023 and over 99% by the end of 2024. The main body fell on 27 Oct 2024. As of 26 Oct 2026 only 4 catalog entries remain listed as in orbit.

### Cited Findings
- **The test.**
  - Russia "conducted a direct-ascent anti-satellite (ASAT) test in the early hours (Universal Time) of 15 November 2021".
  - The target was Cosmos 1408 (1982-092A, SSN 13552), "a derelict Soviet … ELINT Tselina-D-class spacecraft" with a mass of 1,750 kg.
  - It was launched in 1982 into a 666 × 636 km orbit at 82.6°. Before the test it had decayed to 490 × 465 km. — [NASA ODQN vol. 26 iss. 1, Mar 2022, "The Intentional Destruction of Cosmos 1408"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv26i1.pdf)
- **Fragment counts.**
  - The U.S. Space Force's 18th Space Control Squadron "identified more than 1500 pieces of large, trackable fragments … shortly after the event".
  - "As of 7 March 2022, 1604 Cosmos 1408 fragments" had been catalogued.
  - Some fragment apogees reached 1,440 km, and about 60% of fragments were in higher-inclination orbits than the parent. — [NASA ODQN 26-1](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv26i1.pdf)
- **ISS crew sheltering.**
  - NASA's statement of 15 Nov 2021 says "ISS astronauts and cosmonauts undertook emergency procedures for safety".
  - The crew was woken, and hatches to the radial modules were closed. Crew members went into "their spacecraft shortly before 2 a.m. EST" and "remained there until about 4 a.m." (about 07:00–09:00 UTC).
  - The sheltering covered the station's second and third passes near the debris cloud. — [NASA Administrator Statement on Russian ASAT Test, 15 Nov 2021](https://www.nasa.gov/news-release/nasa-administrator-statement-on-russian-asat-test/)
  - The seven-member crew sheltered in their Crew Dragon and Soyuz spacecraft. — [CBS News](https://cbsnews.com/news/satellite-debris-space-station-crew-take-shelter) (secondary); see also [Spaceflight Now, 15 Nov 2021](https://spaceflightnow.com/2021/11/15/u-s-officials-space-station-at-risk-from-reckless-russian-anti-satellite-test/)
- **Decay (SATCAT 26 Oct 2026):**
  - 1,805 fragments with catalog numbers from 49000 up were catalogued after the test. One older piece (SSN 42060, decayed 23 Feb 2017) predates the test and is excluded.
  - 1,801 have decayed. Re-entries per year: 2021: 47; 2022: 1,382; 2023: 304; 2024: 59; 2025: 8; 2026: 1 (2 Jun 2026).
  - 4 entries are still listed as in orbit (SSN 50032, 50058, 50621, 57286), with perigees of about 222–410 km.
  - The Cosmos 1408 main body (SSN 13552) decayed on 27 Oct 2024. — [CelesTrak SATCAT, INTDES 1982-092](https://celestrak.org/satcat/records.php?INTDES=1982-092&FORMAT=CSV); [CATNR 13552](https://celestrak.org/satcat/records.php?CATNR=13552&FORMAT=CSV)
- **Same count elsewhere.** Orbitalradar.com also lists 1,802 Cosmos 1408 debris, 4 in orbit, and a latest re-entry on 2 Jun 2026. — [orbitalradar.com](https://orbitalradar.com/register/break-ups/cosmos-1408?page=64) (non-authoritative; its numbers likely come from the same catalog)
- **Why it cleared quickly.** NASA: "Since the Russian anti-satellite test was conducted at a relatively low altitude, most of the fragments reentered in several years." — [NASA ODQN 29-3, Sep 2025](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i3.pdf)
- **ESA's view.** ESA notes "the observed spike in 2022 concerning re-entering space debris is due to the Kosmos 1408 anti-satellite missile test". — [ESA Space Environment Report 2026, p. 18](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)

### Inferences
- **Suggested wording for the website:** "more than 1,500 trackable fragments (1,805 eventually catalogued); about 96% re-entered by the end of 2023; the debris cloud is essentially gone by 2026."
- This is a useful contrast with Fengyun-1C. The same kind of test at about 480 km cleared in roughly 3 years, while debris at about 850 km lasts decades.
- The 4 entries still "in orbit" include perigees of 222 km and 317 km. Objects that low cannot stay up long, so these are probably about to re-enter or have outdated orbit data (UNCERTAIN).

### Gaps
- The U.S. Space Command press release (spacecom.mil) returned HTTP 403, so its exact wording (">1,500 pieces of trackable orbital debris", "hundreds of thousands of smaller pieces") could not be checked directly. The 1,500+ figure is confirmed by NASA ODQN.
- The number of ISS maneuvers caused specifically by Cosmos 1408 debris in 2022 was not verified (see the ISS question).

## Other notable events: Cerise 1996, Yunhai 1-02 2021, Intelsat 33e 2024, rocket-body and other recent breakups

### Takeaway
Primary sources (NASA ODQN and the catalog) verify the following:
- **Cerise:** the first collision recognized between catalogued objects from different missions (24 Jul 1996).
- **Yunhai 1-02:** collided with a 1996 Zenit rocket fragment on 18 Mar 2021, producing 37 catalogued fragments. The "Tianwen" in the request is not part of this event.
- **Intelsat 33e:** broke up in geostationary orbit (GEO) on 19 Oct 2024; 36 fragments are catalogued as of Oct 2026.
- **Long March 6A (CZ-6A) upper stages:** the two breakups of 2022 and 2024 have about 800 and about 700 catalogued fragments.
- **Resurs-P1:** broke up on 26 Jun 2024, and the ISS crew sheltered.
- **Newest event:** the ZhuQue-2E upper stage breakup on 9 Jun 2026.

### Cited Findings
- **Cerise (1996).**
  - NASA: "The first recognized collision between cataloged objects from different missions … occurred on 24 July 1996, the French CERISE spacecraft (1995-033B, U.S. Satellite Number 23606) collided with a fragment (1986-019RF, U.S. Satellite Number 18208) from the third stage of an Ariane 1 launch vehicle, which had exploded ten years earlier." — [NASA ODQN vol. 9 iss. 2, Apr 2005, "Accidental Collisions of Cataloged Satellites Identified"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv9i2.pdf)
  - Catalog status (SATCAT 26 Oct 2026):
    - The impactor, SSN 18208 (ARIANE 1 DEB, from the 22 Feb 1986 launch), decayed on 25 Jul 2000.
    - Cerise itself is still in orbit at 454 × 445 km.
    - One "CERISE DEB" piece (SSN 23994) was catalogued and decayed on 22 May 2017.
    - The 1986 Ariane 1 launch (1986-019) has 497 catalogued debris pieces, 22 still in orbit. — [CelesTrak SATCAT CATNR 18208](https://celestrak.org/satcat/records.php?CATNR=18208&FORMAT=CSV); [INTDES 1995-033](https://celestrak.org/satcat/records.php?INTDES=1995-033&FORMAT=CSV); [INTDES 1986-019](https://celestrak.org/satcat/records.php?INTDES=1986-019&FORMAT=CSV)
  - Damage: the satellite's builder SSTL says the collision tore off a 4.2 m section of Cerise's gravity-gradient stabilisation boom. Flight International describes the 6 m boom being severed. — [SSTL Cerise page](https://www.sstl.co.uk/space-portfolio/launched-missions/1990-1999/cerise-launched-1995); [Flight International](https://flightglobal.com/the-great-escape/3670.article) (seen via search summary; UNCERTAIN on the exact length)
- **Earlier and later accidental collisions (for context).**
  - The SSN later recognized a collision in late December 1991 between the dead Cosmos 1934 and a piece of debris from Cosmos 926, at about 980 km.
  - On 17 Jan 2005, a U.S. Thor Burner 2A rocket body (1974-015B) was hit by a fragment of a Chinese CZ-4 stage at 885 km over the south polar region. — [NASA ODQN 9-2, Apr 2005](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv9i2.pdf)
- **Yunhai 1-02 (2021).**
  - Jonathan McDowell (Harvard–Smithsonian) linked the March 2021 breakup of Yunhai 1-02 to object 48078, a Zenit-2 rocket fragment from a 1996 launch.
  - Space-Track annotated the object "collided with satellite".
  - The two objects passed within about 1 km at about 07:41 UTC on 18 Mar 2021, the time the 18th Space Control Squadron reported the breakup. — [Space.com](https://space.com/space-junk-collision-chinese-satellite-yunhai-1-02); [ScienceAlert](https://www.sciencealert.com/a-chinese-satellite-mysteriously-shattered-in-march-now-we-know-why) (secondary; China never announced a cause, so treat the cause as **UNCERTAIN/attributed**)
  - Catalog check (SATCAT 26 Oct 2026):
    - SSN 48078 is "SL-16 DEB", 1996-051Q, from the 4 Sep 1996 launch of Cosmos 2333 (SL-16 is the U.S. name for the Zenit rocket). It is still in orbit at 939 × 748 km.
    - Yunhai-1 02 (2019-063A, SSN 44547) is still in orbit at 789 × 778 km.
    - 37 "YUNHAI-1 02 DEB" fragments were catalogued, and all have decayed (first 2 May 2021, last 2 Mar 2026). — [CelesTrak SATCAT INTDES 1996-051](https://celestrak.org/satcat/records.php?INTDES=1996-051&FORMAT=CSV); [INTDES 2019-063](https://celestrak.org/satcat/records.php?INTDES=2019-063&FORMAT=CSV)
- **Intelsat 33e (GEO, 2024).**
  - Breakup "at approximately 04:30 UTC on 19 October 2024", in a 35,797 × 35,773 km orbit at 0.037° inclination. The satellite was launched in 2016 and "was still operational".
  - U.S. Space Forces–Space had catalogued 18 fragments as of 13 Jan 2025. — [NASA ODQN vol. 29 iss. 1, Feb 2025, "Two New On-orbit Fragmentations"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i1.pdf)
  - SATCAT 26 Oct 2026: 36 "INTELSAT 33E DEB" catalogued, all still in orbit (at GEO there is no air drag). — [CelesTrak SATCAT INTDES 2016-053](https://celestrak.org/satcat/records.php?INTDES=2016-053&FORMAT=CSV)
  - Commercial tracker ExoAnalytic reported about 500 pieces in late Oct 2024. The U.S. Space Force's first count was about 20. — [DatacenterDynamics](https://www.datacenterdynamics.com/en/news/500-pieces-of-debris-from-intelsat-33e-now-being-tracked) (secondary; UNCERTAIN)
  - ESA-linked papers estimated about 16,000–20,000 fragments larger than 1 cm. — [ESA SDC9 paper 288](https://conference.sdo.esoc.esa.int/proceedings/sdc9/paper/288/SDC9-paper288.pdf) (seen via search summary only; UNCERTAIN)
- **CZ-6A upper stage, 6 Aug 2024.**
  - Breakup of 2024-140U (SSN 60397), dry mass about 5,800 kg, "at 17:15 GMT on 6 August 2024", after it deployed the first 18 Qianfan satellites.
  - Its orbit was about 857 × 797 km at 89°. 283 fragments were catalogued as of 15 Sep 2024. — [NASA ODQN vol. 28 iss. 4, Oct 2024, "Three New On-orbit Fragmentations"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv28i4.pdf)
  - SATCAT 26 Oct 2026: 705 "CZ-6A DEB" catalogued from launch 2024-140; 573 still in orbit, 132 decayed. — [CelesTrak SATCAT INTDES 2024-140](https://celestrak.org/satcat/records.php?INTDES=2024-140&FORMAT=CSV)
- **CZ-6A upper stage, Nov 2022 (2022-151B).**
  - It broke up at 847 × 813 km in 2022. By Oct 2024, 793 fragments had been catalogued, "making it the fourth worst historical breakup event and the number one worst breakup of an upper stage in history". — [NASA ODQN 28-4, Oct 2024](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv28i4.pdf)
  - SATCAT 26 Oct 2026: 800 "CZ-6A DEB" catalogued from launch 2022-151; 612 still in orbit. — [CelesTrak SATCAT INTDES 2022-151](https://celestrak.org/satcat/records.php?INTDES=2022-151&FORMAT=CSV)
- **Resurs-P1, 26 Jun 2024.**
  - The 6-metric-ton Russian Earth-observation satellite (2013-030A) broke up "at 16:32 GMT on 26 June 2024" in a 388 × 353 km orbit. It had been decommissioned in 2022.
  - As of 26 Aug 2024, 18 fragments had been catalogued and 17 had re-entered. — [NASA ODQN 28-4](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv28i4.pdf)
  - SATCAT: all 18 fragments from the breakup (SSN 60215–60232) had decayed by 31 Aug 2024. The parent decayed on 17 Nov 2024. — [CelesTrak SATCAT INTDES 2013-030](https://celestrak.org/satcat/records.php?INTDES=2013-030&FORMAT=CSV)
  - U.S. Space Command reported more than 100 trackable pieces, and LeoLabs tracked at least 180. The ISS crew sheltered in their spacecraft (two astronauts in Boeing's Starliner) for about an hour. — [Smithsonian Magazine](https://www.smithsonianmag.com/smart-news/iss-astronauts-forced-to-briefly-take-shelter-as-russian-satellite-suddenly-breaks-up-in-orbit-180984626/); [Al Jazeera](https://www.aljazeera.com/news/2024/6/28/iss-astronauts-take-cover-as-defunct-russian-satellite-shatters) (secondary)
- **Other 2024 breakups (NASA ODQN):**
  - DMSP 5D-2 F8 at 20:41 GMT on 19 Jul 2024 (837 × 818 km): 4 fragments catalogued. — [NASA ODQN 28-4](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv28i4.pdf)
  - Atlas V Centaur 2018-022B on 6 Sep 2024, in a 34,949 × 7,622 km disposal orbit: more than 10 fragments seen, none catalogued as of 13 Jan 2025. SATCAT still shows none on 26 Oct 2026. — [NASA ODQN 29-1](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i1.pdf); [CelesTrak SATCAT 2018-022](https://celestrak.org/satcat/records.php?INTDES=2018-022&FORMAT=CSV)
  - Earlier Centaur breakups: 2014-055B (Aug 2018, 109 catalogued) and 2018-079B (Apr 2019, 214 catalogued). — [NASA ODQN 29-1](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i1.pdf)
- **Newest event: ZhuQue-2E upper stage, 9 Jun 2026.**
  - U.S. Space Forces–Space identified a breakup of China's ZhuQue-2E upper stage (2026-128C, SSN 69537) "at 08:47 GMT on 9 June 2026", shortly after it released its payload. Its orbit was about 416 × 327 km at 54.53°.
  - As of 16 Jul 2026, 7 fragments had been catalogued and 4 had re-entered. — [NASA ODQN vol. 30 iss. 3, Sep 2026](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv30i3.pdf)
  - SATCAT 26 Oct 2026: 7 catalogued, 6 decayed. — [CelesTrak SATCAT 2026-128](https://celestrak.org/satcat/records.php?INTDES=2026-128&FORMAT=CSV)
- **ESA's list of 2025 events.** ESA lists three established fragmentation events for 2025 but does not name the objects in the table:
  - 17 Jan 2025: payload, 3,980 kg, MEO, propulsion; 0 catalogued, 67 detected.
  - 1 Jun 2025: rocket body, 2,020 kg, unknown cause; 2 catalogued, 2 detected.
  - 18 Dec 2025: payload, 530 kg, LEO, propulsion; 0 catalogued, 10 detected. — [ESA Space Environment Report 2026, Table 3.7, p. 74](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
- **UNCERTAIN, secondary only:** a 2026 Yaogan-50 (02) breakup with 43 or more tracked fragments, and a Long March 6C upper-stage fragmentation, appear in blog coverage of the ESA 2026 report. I did not verify either in NASA, ESA or catalog data. — [newspaceeconomy.ca, 14 Sep 2026](https://newspaceeconomy.ca/2026/09/14/what-does-the-2026-space-environment-report-reveal-about-the-future-of-space-debris/)

### Inferences
- Rocket-body breakups have overtaken collisions as the big new debris sources of the 2020s. The two CZ-6A stages alone account for about 1,500 catalogued fragments, and about 1,185 of them are still in orbit at roughly 800 km.
- For a school site, Cerise is best described as "the first confirmed collision between two catalogued objects" (recognized in 1996). The 1991 Cosmos 1934 collision happened earlier but was only recognized in 2005.

### Gaps
- No primary source (NASA or Chinese) was found for the Yunhai 1-02 collision time and the 1 km miss distance. These rest on McDowell's analysis as reported by media.
- Cerise's altitude at the moment of impact, and the exact date of the 1986 Ariane 1 third-stage explosion, were not found in primary sources.
- The exact day of the 2022 CZ-6A breakup is in NASA ODQN vol. 27 iss. 1 (Mar 2023), which I did not fetch.
- No authoritative final count of Intelsat 33e fragments, beyond the 36 catalogued, was found.

## International Space Station debris avoidance history (total since 1999, recent maneuvers)

### Takeaway
NASA's latest figure is **41 ISS collision-avoidance maneuvers since 1999**. The 41st took place at 22:10 GMT on 30 Apr 2025, against a fragment associated with a Chinese CZ-2D rocket stage. Two maneuvers in Nov 2024 had brought the total to 40. NASA's newsletters through Sep 2026 report no later ISS maneuver. The crew has also sheltered in their spacecraft at least three times (2009, 2021, 2024) when debris was detected too late to maneuver.

### Cited Findings
- **The 41st maneuver.** "The PDAM took place at 22:10 GMT on 30 April 2025 and raised the altitude of the ISS by approximately 0.53 km."
  - The avoided object was 2005-024L (SSN 35272), "associated with the CZ-2D upper stage … that deployed China's SJ-7 spacecraft in 2005".
  - This PDAM (pre-determined debris avoidance maneuver) brought the total of ISS maneuvers against objects tracked by the U.S. Space Surveillance Network (SSN) "to a total of 41 since 1999". — [NASA ODQN vol. 29 iss. 3, Sep 2025, "International Space Station Maneuvers Again to Avoid Debris"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i3.pdf)
- **The two Nov 2024 maneuvers:**
  - 03:24 GMT on 19 Nov 2024, avoiding 1995-015FU (SSN 40680), a fragment from the 2015 explosion of the DMSP 5D-2 F13 satellite.
  - 03:30 GMT on 25 Nov 2024, avoiding a Fengyun-1C fragment, 1999-025AEN (SSN 30423).
  - These raised the total "to a total of 40 since 1999".
  - NASA notes a "strong correlation" between maneuver frequency and solar activity, and expects "fewer ISS PDAMs … in the coming years". — [NASA ODQN vol. 29 iss. 2, May 2025, "ISS Maneuvers Twice to Avoid Debris"](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i2.pdf)
  - Media described the 19 Nov 2024 maneuver as the 39th since 1999, which matches NASA's count. — [Live Science](https://www.livescience.com/space/space-exploration/iss-dodges-its-39th-piece-of-potentially-hazardous-space-junk-experts-say-it-wont-be-the-last)
- **The 2021 maneuvers.**
  - Two maneuvers in 2021: 20:15 GMT on 10 Nov 2021 (FY-1C fragment 1999-025DKS) and 07:58 GMT on 3 Dec 2021 (fragment 1994-029AFN from a Pegasus HAPS upper stage that exploded in 1996). "These were the sole ISS debris avoidance maneuvers of calendar year 2021."
  - "Presently, the ISS has conducted 30 collision avoidance maneuvers since 1999." The avoided objects included 3 FY-1C debris and 5 Iridium/Cosmos debris, which led to 2 and 3 maneuvers respectively (as of Mar 2022). — [NASA ODQN 26-1, Mar 2022](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv26i1.pdf)
- **No newer count found.**
  - NASA's 2026 slides for the UN Committee on the Peaceful Uses of Outer Space (COPUOS) reportedly give 41 maneuvers since 1999, with one in 2025. — [UNOOSA, Liou, STSC 2026 slides](https://www.unoosa.org/documents/pdf/copuos/stsc/2026/List_of_TP/Monday2/Slides_US_Jer_Chyi_Liou_Item_6.pdf) (link returned 404 when fetched; seen only via search summary)
  - A secondary 2026 history also gives 41 as of 30 Mar 2026. — [newspaceeconomy.ca, 12 Apr 2026](https://newspaceeconomy.ca/2026/04/12/a-history-of-space-debris-impacts-on-the-iss-and-iss-conjunction-avoidance-actions/)
  - The ODQN issues of Jul 2026 (vol. 30 iss. 1&2) and Sep 2026 (vol. 30 iss. 3) report no new ISS maneuver. — [ODQN 30-1&2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv30i1.pdf); [ODQN 30-3](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv30i3.pdf)
- **How screening worked (2009 description).** The SSN screened the ISS three times a day against a 2 km × 25 km × 25 km box around the station. A maneuver was considered if the collision probability exceeded 1 in 10,000. — [NASA ODQN 13-2, Apr 2009](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
- **Crew sheltering events:**
  - 12 Mar 2009: the crew retreated into Soyuz TMA-13 because a Delta 2 debris object (1993-032D) was predicted late. It passed at almost 4 km. — [NASA ODQN 13-2](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/odqnv13i2.pdf)
  - 15 Nov 2021 (Cosmos 1408): about 2 hours in the spacecraft. — [NASA statement](https://www.nasa.gov/news-release/nasa-administrator-statement-on-russian-asat-test/)
  - 26 Jun 2024 (Resurs-P1): about 1 hour. — [Smithsonian](https://www.smithsonianmag.com/smart-news/iss-astronauts-forced-to-briefly-take-shelter-as-russian-satellite-suddenly-breaks-up-in-orbit-180984626/) (secondary)

### Inferences
- The count went from 30 (early 2022) to 38 (just before Nov 2024) to 41 (Apr 2025). That is about 11 maneuvers in just over 3 years, against 30 in the previous 22 years, which fits NASA's link to the 2024–2025 solar maximum and the growing debris population.
- **Suggested wording for the website:** "41 debris-avoidance maneuvers since 1999 (NASA, latest reported 30 Apr 2025)".

### Gaps
- I did not verify which of the 2022–2023 maneuvers (counts 31–38) were caused by Cosmos 1408 debris. A search snippet suggests ODQN vol. 26 iss. 4 reported a total of 32 in late 2022, but I did not check its contents (UNCERTAIN).
- I could not confirm that no maneuver happened between Sep and Oct 2026. NASA's ISS blog was not checked for that window.

## Total fragmentation events and overall statistics

### Takeaway
ESA's latest report (8 Sep 2026) counts **661 confirmed on-orbit fragmentation events** from the start of the space age to the end of 2025. 207 of them happened in the last 20 years, an average of about 9.8 non-deliberate fragmentations per year. NASA uses a narrower definition and counts 282 "historical breakups" to the end of 2024, 214 of them accidental explosions. The two totals are not directly comparable.

### Cited Findings
- **ESA's total.** "Since the beginning of the space age until the end of 2025, there have been 661 confirmed on-orbit fragmentation events."
  - Table 5.1: 661 events in all history and 207 in the last 20 years. Non-deliberate events per year: 9.3 over all history, 9.8 over the last 20 years.
  - Report: ESA Space Debris Office, "ESA's Annual Space Environment Report", GEN-DB-LOG-00288-OPS-SD, Issue 10.1, dated 8 Sep 2026. — [ESA Space Environment Report 2026 (PDF), pp. 89–91](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
- **Impact per event.** ESA: the rate of 9.8 per year "drops significantly to 1.5 per year when the lifetime of the generated fragments is considered" (events where half the fragments last more than 10 years). It is "0.4 per year when systematic and unexplained events are excluded".
  - "Fragmentations other than collisions are currently the dominant source of space debris." — [ESA report 2026, executive summary](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
- **2024 versus 2025.** ESA: 2025 "saw a comparatively low number of fragments added … in contrast to 2024, which saw a substantial increase of over 3000 catalogued fragments mostly attributed to propulsion-related breakups". — [ESA report 2026](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
- **ESA's model population (MASTER) on 1 Feb 2026:**
  - 68,450 objects larger than 10 cm, including about 11,300 active payloads.
  - 1.5 million debris objects of 1–10 cm.
  - 230 million of 1 mm–1 cm. — [ESA report 2026, §2.4](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
- **ESA web page.** ESA's 2026 report page is dated 14 Sep 2026. It says ESA's Health Index rose "from about 4 to 50 in just one year", and that 2025 had more than 300 launches and over 4,000 new payloads. — [ESA, "ESA Space Environment Report 2026"](https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2026)
- **NASA's count.** Accidental explosions make up "214 of the 282 historical breakups that occurred as of the end of 2024". "On average, approximately three explosions per year occurred from 1961 through 2024." Fragments from accidental explosions "have historically contributed over half of all cataloged fragments." — [NASA ODQN 29-3, Sep 2025](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv29i3.pdf)
- **NASA's size picture.** NASA (Jul 2026): there are "approximately 50,000" large, trackable objects and millimeter-sized debris "on the order of 100 million". — [NASA ODQN vol. 30 iss. 1&2, Jul 2026](https://orbitaldebris.jsc.nasa.gov/quarterly-news/pdfs/ODQNv30i1.pdf)

### Inferences
- The brief's "~650+" figure matches ESA's previous edition. The current ESA figure to use is **661 (to end of 2025, published Sep 2026)**.
- NASA's 282 is lower because it counts only confirmed breakups in the U.S. catalog under its own definition. ESA also includes "anomalous" events and other classes. A website should name the agency and the date next to whichever number it uses.

### Gaps
- I did not retrieve ESA's earlier (2025) report wording, so the exact "more than 650" figure and its date remain UNCERTAIN.
- ESA's 2025 event table does not name the objects, so the three 2025 events cannot be named from ESA alone.
