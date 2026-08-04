import json, os, re

DATA_DIR = "/home/claude/ceniverse/data"
MOVIES_DIR = os.path.join(DATA_DIR, "movies")
os.makedirs(MOVIES_DIR, exist_ok=True)

def slugify(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

# tone cycle for placeholder art (1-8), just rotate deterministically
def tone_for(i):
    return (i % 8) + 1

movies = []

# ============================================================
# FEATURED — real, verified 2026 releases (sourced via web search,
# primarily Wikipedia film infoboxes). No invented ratings/reviews.
# ============================================================
featured = [
    dict(id="mana-shankara-vara-prasad-garu", title="Mana Shankara Vara Prasad Garu",
         year=2026, language="Telugu", genres=["Drama", "Family"],
         releaseDate="2026-01-12", runtime=None, certification=None,
         director="Anil Ravipudi",
         cast=[{"name":"Chiranjeevi"},{"name":"Nayanthara"},{"name":"Venkatesh"}],
         productionCompanies=["Shine Screens", "Gold Box Entertainments"],
         budget=None, boxOffice="₹300–400 crore (worldwide, estimates vary by source)",
         synopsis="A Sankranthi-season Telugu family entertainer starring Chiranjeevi, Nayanthara and Venkatesh, directed by Anil Ravipudi. It became the highest-grossing Telugu film of 2026.",
         sourceNote="Wikipedia: List of Telugu films of 2026 / List of 2026 box office number-one films in India"),

    dict(id="the-raja-saab", title="The Raja Saab",
         year=2026, language="Telugu", genres=["Horror", "Comedy"],
         releaseDate="2026-01-09", runtime=None, certification=None,
         director="Maruthi",
         cast=[{"name":"Prabhas"},{"name":"Nidhhi Agerwal"},{"name":"Sanjay Dutt"}],
         productionCompanies=["People Media Factory", "IVY Entertainment"],
         budget=None, boxOffice="₹208.38 crore (worldwide)",
         synopsis="A horror-comedy starring Prabhas in one of his first genre departures, released in a high-profile Sankranthi theatrical clash.",
         sourceNote="Wikipedia: List of Telugu films of 2026"),

    dict(id="ustaad-bhagat-singh", title="Ustaad Bhagat Singh",
         year=2026, language="Telugu", genres=["Action", "Drama"],
         releaseDate="2026-03-19", runtime=None, certification=None,
         director="Harish Shankar",
         cast=[{"name":"Pawan Kalyan"},{"name":"Sreeleela"},{"name":"Raashii Khanna"}],
         productionCompanies=["Mythri Movie Makers"],
         budget=None, boxOffice="₹97 crore (worldwide)",
         synopsis="A Telugu mass-action entertainer starring Pawan Kalyan, directed by Harish Shankar, released during the Ugadi theatrical window.",
         sourceNote="Wikipedia: List of Telugu films of 2026"),

    dict(id="karuppu", title="Karuppu",
         year=2026, language="Tamil", genres=["Fantasy", "Action"],
         releaseDate="2026-05-15", runtime=152, certification=None,
         director="RJ Balaji",
         cast=[{"name":"Suriya"},{"name":"Trisha Krishnan"},{"name":"RJ Balaji"}],
         productionCompanies=["Dream Warrior Pictures"],
         budget="est. ₹130–140 crore", boxOffice="est. ₹300 crore",
         synopsis="In a world where justice falters, guardian deity Vettai Karuppu takes the guise of a lawyer to battle a corrupt legal system preying on the powerless.",
         sourceNote="Wikipedia: Karuppu (film)"),

    dict(id="dhurandhar-the-revenge", title="Dhurandhar: The Revenge",
         year=2026, language="Hindi", genres=["Action", "Crime", "Thriller"],
         releaseDate="2026-03-19", runtime=229, certification="A",
         director="Aditya Dhar",
         cast=[{"name":"Ranveer Singh"},{"name":"Akshaye Khanna"},{"name":"Sanjay Dutt"},
               {"name":"R. Madhavan"},{"name":"Arjun Rampal"},{"name":"Sara Arjun"}],
         productionCompanies=["Jio Studios", "B62 Studios"],
         budget="₹250–255 crore (combined with Part 1)", boxOffice="₹1,851.26 crore",
         synopsis="Hamza Ali Mazari, whose real identity is Jaskirat Singh Rangi, continues his undercover intelligence operation within Pakistan's criminal and political underworld. The second half of a two-part spy thriller.",
         sourceNote="Wikipedia: Dhurandhar: The Revenge"),

    dict(id="drishyam-3", title="Drishyam 3",
         year=2026, language="Malayalam", genres=["Crime", "Drama", "Thriller"],
         releaseDate="2026-05-21", runtime=160, certification=None,
         director="Jeethu Joseph",
         cast=[{"name":"Mohanlal","character":"Georgekutty"},{"name":"Meena"},{"name":"Ansiba Hassan"},
               {"name":"Esther Anil"},{"name":"Siddique"},{"name":"Murali Gopy"},{"name":"Asha Sarath"}],
         productionCompanies=["Aashirvad Cinemas", "Panorama Studios", "Pen Studios"],
         budget=None, boxOffice="₹241 crore",
         synopsis="The concluding chapter of the Drishyam trilogy, bringing Georgekutty's cat-and-mouse story with the law to a close.",
         sourceNote="Wikipedia: Drishyam 3"),

    dict(id="love-mocktail-3", title="Love Mocktail 3",
         year=2026, language="Kannada", genres=["Drama", "Romance"],
         releaseDate="2026-03-19", runtime=134, certification="U/A",
         director="Darling Krishna",
         cast=[{"name":"Darling Krishna"},{"name":"Milana Nagaraj"},{"name":"Samvrutha"},
               {"name":"Rachel David"},{"name":"Amrutha Iyengar"}],
         productionCompanies=["KrissMi Films", "Krishna Talkies"],
         budget=None, boxOffice=None,
         synopsis="Adi's life takes an unexpected turn after he and his family adopt Nidhi — but their newfound contentment is soon jeopardised by a series of disturbing events. The third and final chapter of the Love Mocktail trilogy.",
         sourceNote="Wikipedia: Love Mocktail 3"),

    dict(id="border-2", title="Border 2",
         year=2026, language="Hindi", genres=["War", "Action", "Drama"],
         releaseDate="2026-01-23", runtime=201, certification="U/A",
         director="Anurag Singh",
         cast=[{"name":"Sunny Deol"},{"name":"Varun Dhawan"},{"name":"Diljit Dosanjh"},
               {"name":"Ahan Shetty"},{"name":"Mona Singh"},{"name":"Sonam Bajwa"}],
         productionCompanies=["T-Series Films", "J. P. Films"],
         budget="₹275 crore", boxOffice="₹464.5 crore",
         synopsis="A standalone spiritual successor to J. P. Dutta's 1997 war classic Border, following young Indian soldiers during the 1971 Indo-Pakistani war. Released over the Republic Day weekend.",
         sourceNote="Wikipedia: Border 2"),

    dict(id="parasakthi", title="Parasakthi",
         year=2026, language="Tamil", genres=["Action", "Drama", "History"],
         releaseDate="2026-01-10", runtime=162, certification=None,
         director="Sudha Kongara",
         cast=[{"name":"Sivakarthikeyan"},{"name":"Ravi Mohan"},{"name":"Atharvaa"},{"name":"Sreeleela"}],
         productionCompanies=["Dawn Pictures"],
         budget="₹150–250 crore", boxOffice="est. ₹84–100 crore",
         synopsis="Set in 1960s Tamil Nadu, two brothers are swept up in the Anti-Hindi Imposition agitations while facing a ruthless Intelligence Bureau officer.",
         sourceNote="Wikipedia: Parasakthi (2026 film)"),
]

# ============================================================
# CATALOG — well-established classics across languages/decades.
# Conservative fields only; no invented ratings, box office omitted
# unless it is common, widely-cited public knowledge.
# ============================================================
catalog = [
    dict(id="pather-panchali", title="Pather Panchali", year=1955, language="Bengali",
         genres=["Drama"], director="Satyajit Ray",
         cast=[{"name":"Kanu Bannerjee"},{"name":"Karuna Bannerjee"},{"name":"Subir Banerjee"}],
         synopsis="The first film in Satyajit Ray's Apu Trilogy, following a poor family in rural Bengal through the eyes of young Apu.",
         awards="Best Human Document, Cannes Film Festival 1956"),

    dict(id="mother-india", title="Mother India", year=1957, language="Hindi",
         genres=["Drama"], director="Mehboob Khan",
         cast=[{"name":"Nargis"},{"name":"Sunil Dutt"},{"name":"Rajendra Kumar"}],
         synopsis="An impoverished village woman raises her sons alone against a backdrop of debt, floods and famine.",
         awards="Academy Award nominee, Best Foreign Language Film, 1958"),

    dict(id="pyaasa", title="Pyaasa", year=1957, language="Hindi",
         genres=["Drama"], director="Guru Dutt",
         cast=[{"name":"Guru Dutt"},{"name":"Waheeda Rehman"},{"name":"Mala Sinha"}],
         synopsis="A struggling poet finds his work celebrated only after the world believes him dead."),

    dict(id="mughal-e-azam", title="Mughal-E-Azam", year=1960, language="Hindi",
         genres=["Historical", "Drama", "Romance"], director="K. Asif",
         cast=[{"name":"Prithviraj Kapoor"},{"name":"Dilip Kumar"},{"name":"Madhubala"}],
         synopsis="A forbidden romance between Prince Salim and court dancer Anarkali sets him against his father, Emperor Akbar."),

    dict(id="sholay", title="Sholay", year=1975, language="Hindi",
         genres=["Action", "Adventure", "Drama"], director="Ramesh Sippy",
         cast=[{"name":"Dharmendra"},{"name":"Amitabh Bachchan"},{"name":"Hema Malini"},{"name":"Amjad Khan"}],
         synopsis="A retired police officer hires two small-time criminals to capture the ruthless bandit Gabbar Singh."),

    dict(id="nayakan", title="Nayakan", year=1987, language="Tamil",
         genres=["Crime", "Drama"], director="Mani Ratnam",
         cast=[{"name":"Kamal Haasan"},{"name":"Saranya Ponvannan"}],
         synopsis="A Bombay don's rise and fall, loosely inspired by the life of Varadarajan Mudaliar."),

    dict(id="dilwale-dulhania-le-jayenge", title="Dilwale Dulhania Le Jayenge", year=1995, language="Hindi",
         genres=["Romance", "Drama"], director="Aditya Chopra",
         cast=[{"name":"Shah Rukh Khan"},{"name":"Kajol"}],
         synopsis="Two young NRIs fall in love on a European trip, then must win over her traditional family back in India.",
         sourceNote="Still running at Mumbai's Maratha Mandir cinema decades after release."),

    dict(id="lagaan", title="Lagaan", year=2001, language="Hindi",
         genres=["Sport", "Drama", "Musical"], director="Ashutosh Gowariker",
         cast=[{"name":"Aamir Khan"},{"name":"Gracy Singh"}],
         synopsis="Villagers in colonial India wager a cricket match against British officers to escape a crushing land tax.",
         awards="Academy Award nominee, Best Foreign Language Film, 2002"),

    dict(id="3-idiots", title="3 Idiots", year=2009, language="Hindi",
         genres=["Comedy", "Drama"], director="Rajkumar Hirani",
         cast=[{"name":"Aamir Khan"},{"name":"R. Madhavan"},{"name":"Sharman Joshi"},{"name":"Kareena Kapoor"}],
         synopsis="Two friends search for their long-lost, free-spirited engineering-college roommate, tracing his defiance of a rigid education system."),

    dict(id="drishyam", title="Drishyam", year=2013, language="Malayalam",
         genres=["Crime", "Thriller"], director="Jeethu Joseph",
         cast=[{"name":"Mohanlal","character":"Georgekutty"},{"name":"Meena"}],
         synopsis="A cable-TV operator with no formal education uses his knowledge of film plots to protect his family after a crime, staying one step ahead of a relentless police investigation.",
         sourceNote="Remade in Tamil, Telugu, Hindi, Kannada, Sinhala and Chinese."),

    dict(id="baahubali-the-beginning", title="Baahubali: The Beginning", year=2015, language="Telugu",
         genres=["Action", "Fantasy", "Drama"], director="S. S. Rajamouli",
         cast=[{"name":"Prabhas"},{"name":"Rana Daggubati"},{"name":"Anushka Shetty"},{"name":"Tamannaah"}],
         synopsis="A young man raised in a remote village discovers his royal lineage and the truth behind his father's death, setting him on a path to reclaim the kingdom of Mahishmati."),

    dict(id="baahubali-2-the-conclusion", title="Baahubali 2: The Conclusion", year=2017, language="Telugu",
         genres=["Action", "Fantasy", "Drama"], director="S. S. Rajamouli",
         cast=[{"name":"Prabhas"},{"name":"Rana Daggubati"},{"name":"Anushka Shetty"},{"name":"Ramya Krishnan"}],
         synopsis="The saga concludes as the film answers its defining question — why Kattappa killed Baahubali — while Mahendra Baahubali fights to reclaim his father's throne.",
         boxOffice="₹1,800+ crore worldwide, among the highest-grossing Indian films ever made"),

    dict(id="andhadhun", title="Andhadhun", year=2018, language="Hindi",
         genres=["Crime", "Thriller", "Comedy"], director="Sriram Raghavan",
         cast=[{"name":"Ayushmann Khurrana"},{"name":"Tabu"},{"name":"Radhika Apte"}],
         synopsis="A blind pianist becomes entangled in a murder cover-up after witnessing far more than anyone realises."),

    dict(id="tumbbad", title="Tumbbad", year=2018, language="Hindi",
         genres=["Horror", "Fantasy", "Drama"], director="Rahi Anil Barve",
         cast=[{"name":"Sohum Shah"}],
         synopsis="Across three generations, a family's greed for a mythical goddess's hidden gold curses them for decades."),

    dict(id="kgf-chapter-1", title="K.G.F: Chapter 1", year=2018, language="Kannada",
         genres=["Action", "Drama"], director="Prashanth Neel",
         cast=[{"name":"Yash"},{"name":"Srinidhi Shetty"}],
         synopsis="A young man rises from poverty to become a feared enforcer in the Kolar Gold Fields, chasing power his mother always dreamed of for him."),

    dict(id="gully-boy", title="Gully Boy", year=2019, language="Hindi",
         genres=["Drama", "Music"], director="Zoya Akhtar",
         cast=[{"name":"Ranveer Singh"},{"name":"Alia Bhatt"}],
         synopsis="A young man from Mumbai's slums channels his anger and ambition into rap, inspired by the city's underground hip-hop scene.",
         sourceNote="Loosely inspired by rappers Naezy and Divine."),

    dict(id="article-15", title="Article 15", year=2019, language="Hindi",
         genres=["Crime", "Drama"], director="Anubhav Sinha",
         cast=[{"name":"Ayushmann Khurrana"}],
         synopsis="A police officer newly posted to a rural district investigates the disappearance of three girls, confronting entrenched caste discrimination."),

    dict(id="super-deluxe", title="Super Deluxe", year=2019, language="Tamil",
         genres=["Drama", "Thriller"], director="Thiagarajan Kumararaja",
         cast=[{"name":"Vijay Sethupathi"},{"name":"Samantha"},{"name":"Fahadh Faasil"}],
         synopsis="Four interconnected stories unfold over a single day, tied together by chance, consequence and a small boy's search for his estranged father."),

    dict(id="kumbalangi-nights", title="Kumbalangi Nights", year=2019, language="Malayalam",
         genres=["Drama"], director="Madhu C. Narayanan",
         cast=[{"name":"Soubin Shahir"},{"name":"Fahadh Faasil"},{"name":"Shane Nigam"}],
         synopsis="Four dysfunctional brothers sharing a broken-down house in a fishing village slowly learn to become a family."),

    dict(id="sairat", title="Sairat", year=2016, language="Marathi",
         genres=["Romance", "Drama"], director="Nagraj Manjule",
         cast=[{"name":"Rinku Rajguru"},{"name":"Akash Thosar"}],
         synopsis="A fisherman's son and a landlord's daughter fall in love across caste lines, with devastating consequences.",
         sourceNote="At the time, the highest-grossing Marathi film ever made."),

    dict(id="jai-bhim", title="Jai Bhim", year=2021, language="Tamil",
         genres=["Crime", "Drama"], director="T. J. Gnanavel",
         cast=[{"name":"Suriya"},{"name":"Lijomol Jose"}],
         synopsis="A lawyer fights for a tribal woman whose husband disappears in police custody, exposing systemic caste-based injustice."),

    dict(id="kgf-chapter-2", title="K.G.F: Chapter 2", year=2022, language="Kannada",
         genres=["Action", "Drama"], director="Prashanth Neel",
         cast=[{"name":"Yash"},{"name":"Sanjay Dutt"},{"name":"Raveena Tandon"},{"name":"Srinidhi Shetty"}],
         synopsis="Rocky consolidates his control over the Kolar Gold Fields while facing threats from a new adversary and a political conspiracy closing in around him."),

    dict(id="rrr", title="RRR", year=2022, language="Telugu",
         genres=["Action", "Drama", "Period"], director="S. S. Rajamouli",
         cast=[{"name":"N. T. Rama Rao Jr."},{"name":"Ram Charan"},{"name":"Alia Bhatt"},{"name":"Ajay Devgn"}],
         synopsis="A fictionalised account of two real Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, and an imagined friendship forged years before they became legends.",
         awards="Academy Award, Best Original Song (\"Naatu Naatu\"), 2023"),

    dict(id="kantara", title="Kantara", year=2022, language="Kannada",
         genres=["Action", "Drama", "Mystery"], director="Rishab Shetty",
         cast=[{"name":"Rishab Shetty"},{"name":"Sapthami Gowda"}],
         synopsis="A village tied to a centuries-old spiritual tradition of Bhuta Kola clashes with a forest officer over land — and a force older than either of them."),

    dict(id="vikram", title="Vikram", year=2022, language="Tamil",
         genres=["Action", "Crime", "Thriller"], director="Lokesh Kanagaraj",
         cast=[{"name":"Kamal Haasan"},{"name":"Vijay Sethupathi"},{"name":"Fahadh Faasil"}],
         synopsis="A black-ops officer investigates a series of murders carried out by masked assailants, uncovering a conspiracy tied to a synthetic drug operation."),
]

def build_movie(d, is_featured):
    m = {
        "id": d["id"],
        "title": d["title"],
        "originalTitle": d.get("originalTitle"),
        "year": d["year"],
        "language": d["language"],
        "genres": d["genres"],
        "director": d["director"],
        "cast": d["cast"],
        "crew": d.get("crew", []),
        "synopsis": d.get("synopsis"),
        "releaseDate": d.get("releaseDate"),
        "runtime": d.get("runtime"),
        "certification": d.get("certification"),
        "productionCompanies": d.get("productionCompanies", []),
        "budget": d.get("budget"),
        "boxOffice": d.get("boxOffice"),
        "awards": d.get("awards"),
        "sourceNote": d.get("sourceNote"),
        "isFeatured2026": is_featured,
        "posterTone": None,  # filled below
        "backdropTone": None,
        "glyph": d["title"][0].upper(),
        "dataVerified": True,
    }
    return m

all_movies = []
for i, d in enumerate(featured):
    m = build_movie(d, True)
    m["posterTone"] = tone_for(i)
    m["backdropTone"] = tone_for(i)
    all_movies.append(m)

for i, d in enumerate(catalog):
    m = build_movie(d, False)
    m["posterTone"] = tone_for(i + len(featured))
    m["backdropTone"] = tone_for(i + len(featured))
    all_movies.append(m)

# write per-movie JS files (script-tag loadable — works over file:// unlike fetch)
for m in all_movies:
    path = os.path.join(MOVIES_DIR, m["id"] + ".js")
    with open(path, "w", encoding="utf-8") as f:
        f.write("// Auto-generated by gen_data.py — do not hand-edit.\n")
        f.write("// Loaded on demand by movie.html for exactly one movie id.\n")
        f.write("window.CENIVERSE_MOVIE = ")
        json.dump(m, f, ensure_ascii=False, indent=2)
        f.write(";\n")

# lightweight search index (script-tag loadable)
search_index = []
for m in all_movies:
    search_index.append({
        "id": m["id"],
        "title": m["title"],
        "year": m["year"],
        "language": m["language"],
        "director": m["director"],
        "cast": [c["name"] for c in m["cast"]],
        "genres": m["genres"],
        "posterTone": m["posterTone"],
        "glyph": m["glyph"],
    })
with open(os.path.join(DATA_DIR, "search-index.js"), "w", encoding="utf-8") as f:
    f.write("// Auto-generated by gen_data.py — do not hand-edit.\n")
    f.write("// Lightweight index: loaded on every page for search/autocomplete.\n")
    f.write("// Full movie records are NOT in here — they load on demand per ?id=.\n")
    f.write("window.CENIVERSE_INDEX = ")
    json.dump(search_index, f, ensure_ascii=False, indent=2)
    f.write(";\n")

# featured list (homepage carousel order = insertion order of `featured`)
with open(os.path.join(DATA_DIR, "featured.js"), "w", encoding="utf-8") as f:
    f.write("// Auto-generated by gen_data.py — do not hand-edit.\n")
    f.write("window.CENIVERSE_FEATURED = ")
    json.dump([d["id"] for d in featured], f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"Wrote {len(all_movies)} movie records ({len(featured)} featured 2026 + {len(catalog)} catalog)")
print("Featured order:", [d["id"] for d in featured])
