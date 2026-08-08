import json, os, re

DATA_DIR = "/home/claude/ceniverse/data"
MOVIES_DIR = os.path.join(DATA_DIR, "movies")
os.makedirs(MOVIES_DIR, exist_ok=True)

def slugify(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

def tone_for(i):
    return (i % 8) + 1

movies = []

# ============================================================================
# FEATURED - real 2026 releases. Every fact below is sourced from Wikipedia
# infoboxes, official posters, or the review outlets named in publicRatings /
# sourceNote. The `review` text is CeniVerse's own original-wording summary
# of what multiple published reviews actually said - not copied from any of
# them, and not invented. ceniverseRating is our own editorial number,
# formed after reading that real coverage - it is not scraped from anywhere.
# ============================================================================
featured = [
    dict(id="mana-shankara-vara-prasad-garu", title="Mana Shankara Vara Prasad Garu",
         year=2026, language="Telugu", genres=["Drama", "Family", "Comedy"],
         releaseDate="2026-01-12", runtime=None, certification=None,
         director="Anil Ravipudi", writer="Anil Ravipudi",
         producers=["Sahu Garapati", "Sushmita Konidela"],
         musicDirector="Bheems Ceciroleo", cinematographer="Sameer Reddy", editor="Tammiraju",
         cast=[{"name":"Chiranjeevi","character":"Shankara Vara Prasad"},
               {"name":"Nayanthara","character":"Sasirekha"},
               {"name":"Venkatesh"},{"name":"Catherine Tresa"},
               {"name":"Sachin Khedekar"},{"name":"Zarina Wahab"}],
         productionCompanies=["Shine Screens", "Gold Box Entertainments"],
         budget=None, boxOffice="₹300-400 crore (worldwide, estimates vary by source)",
         ottPlatform="Not yet announced",
         synopsis="A Sankranthi-season Telugu family entertainer starring Chiranjeevi, Nayanthara and Venkatesh, directed by Anil Ravipudi. It became the highest-grossing Telugu film of 2026.",
         review={
            "Story": "A National Security officer with a broken marriage tries to reconnect with his estranged wife and children while juggling his covert duties - a premise the film treats mostly as an excuse for family sentiment rather than drama.",
            "Direction": "Anil Ravipudi leans on his familiar formula of an action-hero backstory blended with domestic comedy. The first half is genuinely engaging; momentum drops once the plot settles into a predictable villain track.",
            "Performances": "Chiranjeevi is the film's biggest asset - several reviewers called it his most free-flowing comic performance in years, including wordless scenes played entirely through expression. Nayanthara and Venkatesh provide solid support but get little to do beyond complementing the star.",
            "Music": "Bheems Ceciroleo's soundtrack, including the well-received track \"Meesala Pilla,\" is one of the film's more consistent pleasures.",
            "Editing": "Tammiraju's cut keeps the first half brisk, but the back half sags under repetitive scenes a tighter edit could have trimmed.",
         },
         positives=["Chiranjeevi's most engaged comic performance in years", "A strong, breezy first half", "The soundtrack, especially \"Meesala Pilla\"", "Warm chemistry between the lead pair"],
         negatives=["A second half that leans on a generic villain track", "A predictable, low-stakes climax", "The central marital conflict feels manufactured rather than earned"],
         finalVerdict="A pleasant Sankranthi entertainer carried almost entirely by Chiranjeevi's comic timing - satisfying for fans, less essential if you want a tightly written drama.",
         ceniverseRating=6.2,
         publicRatings=[{"source":"123telugu","value":"3.25 / 5"},{"source":"Great Andhra","value":"2.5 / 5"}],
         sourceNote="Wikipedia; reviews from 123telugu, Great Andhra, Deccan Chronicle, Gulte, Hollywood Reporter India"),

    dict(id="the-raja-saab", title="The Raja Saab",
         year=2026, language="Telugu", genres=["Horror", "Comedy", "Romance"],
         releaseDate="2026-01-09", runtime=190, certification=None,
         director="Maruthi", writer="Maruthi",
         producers=["T. G. Vishwa Prasad", "Krithi Prasad"],
         musicDirector="Thaman S", cinematographer="Karthik Palani", editor="Kotagiri Venkateswara Rao",
         cast=[{"name":"Prabhas","character":"Raju"},
               {"name":"Sanjay Dutt","character":"Pekamedala Kanakaraju"},
               {"name":"Nidhhi Agerwal"},{"name":"Malavika Mohanan"},
               {"name":"Riddhi Kumar"},{"name":"Zarina Wahab","character":"Gangamma"},
               {"name":"Boman Irani"}],
         productionCompanies=["People Media Factory", "IVY Entertainment"],
         budget=None, boxOffice="₹208.38 crore (worldwide)",
         ottPlatform="Not yet announced",
         synopsis="A horror-comedy starring Prabhas as a young man caring for his grandmother, whose Alzheimer's-clouded memories of an exiled exorcist grandfather pull the family into supernatural territory. One of Prabhas's first genre departures.",
         review={
            "Story": "Raju cares for his grandmother Gangamma, an Alzheimer's patient clinging to memories of her exiled exorcist husband - a promising emotional hook the film largely abandons for genre spectacle.",
            "Direction": "Maruthi struggles to reconcile Prabhas's stardom with a horror-comedy tone, leaning on loud background music and broad supporting performances rather than a coherent scare-comedy rhythm.",
            "Performances": "Prabhas visibly enjoys the change of pace and lands a handful of genuine laughs; Zarina Wahab brings real dignity to the grandmother role. Sanjay Dutt is left with an underwritten antagonist.",
            "Music": "Thaman S's score was singled out by several critics as excessive - loud in places that needed restraint.",
            "Cinematography": "Handsomely mounted with real scale, though the horror sequences' visual effects drew criticism for looking unfinished.",
         },
         positives=["Prabhas visibly enjoying a genre change of pace", "Zarina Wahab's emotionally grounded performance", "A handful of genuinely funny scenes"],
         negatives=["A muddled horror-comedy tone that satisfies neither genre fully", "An overloud, directionless background score", "Weak visual effects in key horror sequences", "An overlong, unfocused screenplay"],
         finalVerdict="One of the more divisive big releases of the year - most critics called it a misfire despite Prabhas's efforts, with only scattered defenders among genre-comedy fans.",
         ceniverseRating=4.5,
         publicRatings=[{"source":"Rotten Tomatoes Tomatometer","value":"39%"},{"source":"123telugu","value":"2.75 / 5"}],
         sourceNote="Rotten Tomatoes; reviews from 123telugu, Koimoi, The Indian Express, NDTV, Hindustan Times, The Hollywood Reporter India"),

    dict(id="ustaad-bhagat-singh", title="Ustaad Bhagat Singh",
         year=2026, language="Telugu", genres=["Action", "Drama"],
         releaseDate="2026-03-19", runtime=150, certification=None,
         director="Harish Shankar", writer="Harish Shankar",
         producers=[], musicDirector="Devi Sri Prasad", cinematographer=None, editor=None,
         cast=[{"name":"Pawan Kalyan","character":"Bhagat Singh"},
               {"name":"Sreeleela"},{"name":"Raashii Khanna"}],
         productionCompanies=["Mythri Movie Makers"],
         budget=None, boxOffice="₹97 crore (worldwide)",
         ottPlatform="Netflix",
         synopsis="Inspired by his teacher, who named him Bhagat Singh and shaped his values, a tribal boy grows up rooted in strong morals and unwavering courage, standing firm against injustice despite overwhelming odds.",
         review={
            "Story": "A tribal boy raised on the values of his namesake grows into a righteous vigilante - a familiar underdog-to-avenger arc stretched across multiple timelines.",
            "Direction": "Harish Shankar's screenplay struggles to juggle its parallel timelines; several critics felt the film leaned heavily on political messaging aimed at Pawan Kalyan's core fanbase rather than a wider audience.",
            "Performances": "Pawan Kalyan commits fully to the mass-hero register the film wants, though reviewers were split on whether that register still lands in 2026's action landscape.",
            "Music": "Devi Sri Prasad's score does much of the heavy lifting in the film's mass moments, even where the writing around them falters.",
         },
         positives=["Pawan Kalyan's committed screen presence", "A handful of well-mounted mass moments", "Devi Sri Prasad's score"],
         negatives=["A disjointed, multi-timeline structure", "Heavy political messaging that several critics felt overwhelmed the story", "A formula that feels dated next to 2026's bigger action releases"],
         finalVerdict="Plays best for Pawan Kalyan's committed fanbase; most critics found it a rehash that doesn't fully justify its runtime.",
         ceniverseRating=4.5,
         publicRatings=[{"source":"Rotten Tomatoes Tomatometer","value":"77%"},{"source":"The Indian Express","value":"1.5 / 5"},{"source":"Filmfare","value":"2.5 / 5"}],
         sourceNote="Rotten Tomatoes; reviews from The Indian Express, Filmfare, Rediff, Culture Mix, The Hindu, The Hollywood Reporter India"),

    dict(id="karuppu", title="Karuppu",
         year=2026, language="Tamil", genres=["Fantasy", "Action"],
         releaseDate="2026-05-15", runtime=152, certification=None,
         director="RJ Balaji", writer="RJ Balaji",
         producers=["S. R. Prakash Babu", "S. R. Prabhu"],
         musicDirector="Sai Abhyankkar", cinematographer="G. K. Vishnu", editor="R. Kalaivanan",
         cast=[{"name":"Suriya","character":"Vettai Karuppu"},
               {"name":"Trisha Krishnan"},{"name":"RJ Balaji"},{"name":"Indrans"}],
         productionCompanies=["Dream Warrior Pictures"],
         budget="est. ₹130-140 crore", boxOffice="est. ₹300 crore+ (worldwide)",
         ottPlatform="Not yet announced",
         synopsis="In a world where justice falters, guardian deity Vettai Karuppu takes the guise of a lawyer to battle a corrupt legal system preying on the powerless.",
         review={
            "Story": "A guardian deity takes the guise of a lawyer to battle a corrupt legal system - an old-school good-versus-evil premise treated with mythological scale.",
            "Direction": "RJ Balaji leans fully into mass spectacle. Critics widely praised the first half's energy and craft, though the film loses some of that control in the second half.",
            "Performances": "Suriya is repeatedly singled out as the film's biggest asset - critics called it one of his most committed, elevated performances in years.",
            "Cinematography": "G. K. Vishnu's frame and the film's technical polish were called out as key to its strongest \"elevation\" moments.",
         },
         positives=["Suriya delivering one of his most committed performances in years", "A genuinely strong, well-mounted first half", "An ambitious mix of mythology with mass entertainment"],
         negatives=["A second half critics found noticeably weaker than the first", "Some imbalance between mythology, message and mass entertainment", "Occasionally settles for routine spectacle over its own bolder ideas"],
         finalVerdict="Karuppu doesn't fully stick the landing, but a committed Suriya and a strong first half make it one of the year's more satisfying mass entertainers - it became the highest-grossing Tamil film of 2026.",
         ceniverseRating=6.8,
         publicRatings=[{"source":"Rotten Tomatoes critic excerpts","value":"~3 / 5 average across tracked reviews"}],
         sourceNote="Rotten Tomatoes; Letterboxd; Republic World box-office coverage"),

    dict(id="dhurandhar-the-revenge", title="Dhurandhar: The Revenge",
         year=2026, language="Hindi", genres=["Action", "Crime", "Thriller"],
         releaseDate="2026-03-19", runtime=229, certification="A",
         director="Aditya Dhar", writer="Aditya Dhar (additional screenplay: Shivkumar V. Panicker, Ojas Gautam)",
         producers=["Aditya Dhar", "Jyoti Deshpande"],
         musicDirector=None, cinematographer=None, editor=None,
         cast=[{"name":"Ranveer Singh","character":"Jaskirat Singh Rangi / Hamza Ali Mazari"},
               {"name":"Arjun Rampal"},{"name":"Sanjay Dutt"},
               {"name":"R. Madhavan"},{"name":"Sara Arjun"},{"name":"Rakesh Bedi"}],
         productionCompanies=["Jio Studios", "B62 Studios"],
         budget="₹250-255 crore (combined with Part 1)", boxOffice="₹1,851.26 crore (worldwide)",
         ottPlatform="Netflix",
         synopsis="Hamza Ali Mazari, whose real identity is Jaskirat Singh Rangi, continues his undercover intelligence operation within Pakistan's criminal and political underworld - the second half of a two-part spy thriller.",
         review={
            "Story": "A deep-cover Indian agent's brutal campaign inside Pakistan's criminal underworld continues, opening with an extended flashback into his origin before catching up with the first film's timeline.",
            "Direction": "Aditya Dhar doubles down on scale and violence. Several critics praised his conviction and risk-taking, while others - including a number of international outlets - felt the film's political messaging overwhelmed its craft.",
            "Performances": "Ranveer Singh drew some of the strongest reviews of his career, particularly in the film's emotional passages; Arjun Rampal and Sanjay Dutt anchor the supporting cast.",
            "Editing": "At nearly four hours combined with its predecessor, multiple reviewers flagged pacing and an overstuffed structure as the film's biggest weakness.",
         },
         positives=["Ranveer Singh in what several critics called his most accomplished performance yet", "Ambitious scale and technical polish", "A genuinely gripping opening chapter"],
         negatives=["A very long runtime that multiple reviewers felt was overstuffed", "Politically charged content that sharply divided critics - some called it propaganda", "Uneven pacing in the back half"],
         finalVerdict="Critical reception was sharply split: Indian trade press mostly celebrated it as a Ranveer Singh-powered spectacle, while several international outlets criticized its length and political framing. A box-office phenomenon either way.",
         ceniverseRating=6.0,
         publicRatings=[{"source":"Rotten Tomatoes Tomatometer","value":"42%"},{"source":"Bollywood Hungama","value":"4.5 / 5"}],
         sourceNote="Rotten Tomatoes; reviews from Bollywood Hungama, Variety, Gulf News, IGN Movies"),

    dict(id="drishyam-3", title="Drishyam 3",
         year=2026, language="Malayalam", genres=["Crime", "Drama", "Thriller"],
         releaseDate="2026-05-21", runtime=160, certification=None,
         director="Jeethu Joseph", writer="Jeethu Joseph",
         producers=["Antony Perumbavoor"],
         musicDirector="Anil Johnson", cinematographer="Sateesh Kurup", editor="Vinayak VS",
         cast=[{"name":"Mohanlal","character":"Georgekutty"},
               {"name":"Meena","character":"Rani"},
               {"name":"Ansiba Hassan","character":"Anju"},
               {"name":"Esther Anil"},{"name":"Siddique"},{"name":"Murali Gopy"},{"name":"Asha Sarath"}],
         productionCompanies=["Aashirvad Cinemas", "Pen Studios", "Panorama Studios"],
         budget=None, boxOffice="₹241 crore (worldwide, estimates vary by source)",
         ottPlatform="Not yet announced",
         synopsis="The concluding chapter of the Drishyam trilogy: years after the events of Drishyam 2, Georgekutty has rebuilt a public life around his family's ordeal - but the past refuses to stay buried.",
         review={
            "Story": "Years after the events of Drishyam 2, Georgekutty has turned his family's ordeal into a hit film as a producer - but the past resurfaces to threaten them once more.",
            "Direction": "Jeethu Joseph closes out the trilogy with what multiple reviewers called his most emotionally assured entry yet, balancing the franchise's procedural tension with real family drama.",
            "Performances": "Mohanlal's performance was widely singled out as a series-best, with critical reception and box-office momentum both pointing to the film's success.",
         },
         positives=["Mohanlal in what critics called a career-defining performance", "A genuinely gripping conclusion to the trilogy", "Strong emotional stakes for the whole family ensemble"],
         negatives=["A long runtime a few reviewers felt could have been tightened", "Some franchise fatigue for viewers less invested in the earlier films"],
         finalVerdict="A strong, emotionally satisfying close to the Drishyam trilogy - reviews were largely positive, and it became the highest-grossing film in the franchise.",
         ceniverseRating=8.0,
         publicRatings=[{"source":"Aggregated critic reception","value":"largely positive across reviews found (4+ / 5 typical)"}],
         sourceNote="Reviews and box-office coverage from Republic World, indian.community, Gulf News"),

    dict(id="love-mocktail-3", title="Love Mocktail 3",
         year=2026, language="Kannada", genres=["Drama", "Romance"],
         releaseDate="2026-03-19", runtime=134, certification="U/A",
         director="Darling Krishna", writer=None,
         producers=[], musicDirector=None, cinematographer=None, editor=None,
         cast=[{"name":"Darling Krishna"},{"name":"Milana Nagaraj"},{"name":"Samvrutha"},
               {"name":"Rachel David"},{"name":"Amrutha Iyengar"}],
         productionCompanies=["KrissMi Films", "Krishna Talkies"],
         budget=None, boxOffice=None,
         ottPlatform="Not yet announced",
         synopsis="Adi's life takes an unexpected turn after he and his family adopt Nidhi - but their newfound contentment is soon jeopardised by a series of disturbing events. The third and final chapter of the Love Mocktail trilogy.",
         review=None,
         positives=[], negatives=[], finalVerdict=None, ceniverseRating=None,
         publicRatings=[],
         sourceNote="Wikipedia; official release poster. We could not find enough independent critical coverage to responsibly summarize a consensus, so no review or rating is shown for this title yet."),

    dict(id="border-2", title="Border 2",
         year=2026, language="Hindi", genres=["War", "Action", "Drama"],
         releaseDate="2026-01-23", runtime=201, certification="U/A",
         director="Anurag Singh", writer=None,
         producers=["Bhushan Kumar", "Krishan Kumar", "J. P. Dutta", "Nidhi Dutta"],
         musicDirector="Anu Malik, Mithoon, Vishal Mishra, Sachet-Parampara, Gurmoh",
         cinematographer="Anshul Chobey", editor="Manish More",
         cast=[{"name":"Sunny Deol","character":"Lt Col Fateh Singh Kaler"},
               {"name":"Varun Dhawan","character":"Major Hoshiar Singh Dahiya"},
               {"name":"Diljit Dosanjh","character":"Flying Officer Nirmal Jit Singh Sekhon"},
               {"name":"Ahan Shetty","character":"Lt Cdr Mahendra S. Rawat"},
               {"name":"Sonam Bajwa"},{"name":"Mona Singh"}],
         productionCompanies=["T-Series Films", "J. P. Films"],
         budget="₹275 crore", boxOffice="₹464.5 crore (worldwide)",
         ottPlatform="Netflix",
         synopsis="A spiritual successor to J. P. Dutta's 1997 war classic Border: four officers trained together at the National War Academy reunite at a wedding before being urgently called to defend the border during the 1971 Indo-Pakistani war. Released over the Republic Day weekend.",
         review={
            "Story": "Four officers trained together at the National War Academy reunite at a wedding before being called to defend the border during the 1971 war - a large ensemble war drama in the mould of the original Border.",
            "Direction": "Anurag Singh delivers a heartfelt, patriotic war epic that most critics found effective, if occasionally stretched and repetitive in its back half.",
            "Performances": "Sunny Deol drew consistent praise for a commanding, emotionally grounded performance; Diljit Dosanjh and Varun Dhawan were also singled out, though a few reviewers found Dhawan's accent work inconsistent.",
            "Music": "Nostalgic, emotionally-pitched music from a multi-composer team was frequently cited as one of the film's stronger elements.",
         },
         positives=["Sunny Deol's commanding, emotionally grounded lead performance", "A well-built friendship dynamic among the four leads", "Strong, nostalgic music"],
         negatives=["A long runtime with a story that feels stretched in the second half", "Inconsistent visual effects, particularly in the naval combat sequences", "Some repetitive dialogue and familiar war-movie beats"],
         finalVerdict="A heartfelt, patriotic war epic anchored by Sunny Deol - reviews ran mixed-to-positive, with most agreeing it's an effective, if overlong, tribute to the 1971 war.",
         ceniverseRating=6.5,
         publicRatings=[{"source":"Rotten Tomatoes Tomatometer","value":"69%"},{"source":"Bollywood Hungama","value":"4.5 / 5"},{"source":"123telugu","value":"2.75 / 5"}],
         sourceNote="Rotten Tomatoes; reviews from Bollywood Hungama, 123telugu, Filmibeat, India TV News, IMDb user reviews"),

    dict(id="parasakthi", title="Parasakthi",
         year=2026, language="Tamil", genres=["Action", "Drama", "History"],
         releaseDate="2026-01-10", runtime=162, certification=None,
         director="Sudha Kongara", writer="Sudha Kongara, Arjun Nadesan",
         producers=["Aakash Baskaran"],
         musicDirector="G. V. Prakash Kumar", cinematographer="Ravi K. Chandran", editor="Sathish Suriya",
         cast=[{"name":"Sivakarthikeyan","character":"Cheliyan"},
               {"name":"Ravi Mohan","character":"Thiru"},
               {"name":"Atharvaa","character":"Chinna Durai"},
               {"name":"Sreeleela","character":"Rathnamala"}],
         productionCompanies=["Dawn Pictures"],
         budget="₹150-250 crore", boxOffice="est. ₹84-100 crore (worldwide)",
         ottPlatform="ZEE5",
         synopsis="Set against the 1960s Anti-Hindi Imposition agitations in Tamil Nadu, a student leader's resistance against a ruthless intelligence officer forms the film's political spine.",
         review={
            "Story": "Set against the 1960s Anti-Hindi Imposition movement in Tamil Nadu, a student leader's resistance against a ruthless intelligence officer forms the film's political spine - based on real historical events.",
            "Direction": "Sudha Kongara tackles a genuinely significant historical subject, but multiple reviewers felt the screenplay's pacing - a slow first half and a dragging back half - undercut the material's power.",
            "Performances": "Sivakarthikeyan delivers a sincere, restrained performance; Ravi Mohan's antagonist was widely called one of the film's strongest elements.",
            "Music": "G. V. Prakash Kumar's score was cited by several reviewers as one of the film's more consistent strengths, alongside its period production design.",
         },
         positives=["Ravi Mohan's antagonist performance", "A genuinely significant, rarely-dramatized historical subject", "Strong period production design"],
         negatives=["A slow first half that struggles to build dramatic tension", "A second half several reviewers called dragging and predictable", "An underwritten central romance"],
         finalVerdict="An honest, well-intentioned film about a real and important moment in Tamil Nadu's history, let down by uneven pacing - worth watching for the performances and subject matter, though reviews were mixed.",
         ceniverseRating=5.5,
         publicRatings=[{"source":"Rotten Tomatoes Tomatometer","value":"78%"},{"source":"123telugu","value":"2.5 / 5"},{"source":"Moviecrow","value":"3 / 5"}],
         sourceNote="Rotten Tomatoes; reviews from 123telugu, Moviecrow, IBTimes India, FilmyCircle, IMDb user reviews"),

    dict(id="korean-kanakaraju", title="Korean Kanakaraju",
         year=2026, language="Telugu", genres=["Comedy", "Horror"],
         releaseDate="2026-08-07", runtime=165, certification="UA",
         director="Merlapaka Gandhi", writer="Merlapaka Gandhi (co-writer: Sheik Dawood G. V.)",
         producers=["Y. Rajeev Reddy", "Sai Babu Jagarlamudi"],
         musicDirector="S. Thaman", cinematographer="Manojh Reddy", editor="Satya Giduturi",
         cast=[{"name":"Varun Tej","character":"Kanakaraju"},
               {"name":"Ritika Nayak","character":"Chaitra"},
               {"name":"Satya"},{"name":"Sunil"},{"name":"Muralidhar Goud"},
               {"name":"Daksha Nagarkar","character":"Special appearance"}],
         productionCompanies=["UV Creations", "First Frame Entertainment"],
         budget=None, boxOffice=None,
         ottPlatform="Not yet announced",
         synopsis="Kanakaraju leads a traditional folk performance troupe in Penukonda, Rayalaseema, and falls for Chaitra, a K-pop-obsessed local girl who works at a Kia plant. When a spirit from Korea possesses him at the interval, his life turns into a supernatural, genre-bending comedy that eventually pushes him into the local underworld.",
         review={
            "Story": "A folk-troupe leader in Rayalaseema falls for a K-pop fan, then gets possessed by a Korean spirit at the interval - a genre-bending premise blending horror, comedy and an Indo-Korean crossover.",
            "Direction": "Merlapaka Gandhi keeps the comedy consistent throughout, generating laughs in parallel with the plot rather than pausing for them, and finds a fresh hook in the film's possession twist.",
            "Performances": "Varun Tej's dual avatar and Satya's comic timing were both singled out as highlights, in what reviewers called a strong comeback after a long gap between releases.",
            "Technical Aspects": "The film's CGI, particularly around its climax, was flagged as a weak point by reviewers.",
         },
         positives=["A consistently funny screenplay that doesn't sacrifice pace for jokes", "Varun Tej's committed dual performance", "Satya's comic timing", "A genuinely fresh Indo-Korean crossover hook"],
         negatives=["Logic takes a backseat in the back half", "An underwhelming climax let down by below-par CGI"],
         finalVerdict="A fun, consistently entertaining horror-comedy that delivers on laughs even if its climax doesn't quite stick the landing - a solid comeback vehicle for Varun Tej.",
         ceniverseRating=6.5,
         publicRatings=[{"source":"123telugu","value":"3.25 / 5"}],
         sourceNote="Released 7 Aug 2026. Data and review from 123telugu, Rotten Tomatoes, IMDb, AMC Theatres, StudioFlicks, Filmibeat, industryhit.com."),
]

# ============================================================================
# CATALOG - real classics, 1955-2022. Lighter schema (no review breakdown
# researched this session); Ratings tab shows their real, well-established
# IMDb rating only, clearly labeled as IMDb rather than a CeniVerse score.
# ============================================================================
catalog = [
    dict(id="pather-panchali", title="Pather Panchali", year=1955, language="Bengali",
         genres=["Drama"], director="Satyajit Ray",
         cast=[{"name":"Kanu Bannerjee"},{"name":"Karuna Bannerjee"},{"name":"Subir Banerjee"}],
         synopsis="The first film in Satyajit Ray's Apu Trilogy, following a poor family in rural Bengal through the eyes of young Apu.",
         awards="Best Human Document, Cannes Film Festival 1956", imdbRating=8.3),

    dict(id="mother-india", title="Mother India", year=1957, language="Hindi",
         genres=["Drama"], director="Mehboob Khan",
         cast=[{"name":"Nargis"},{"name":"Sunil Dutt"},{"name":"Rajendra Kumar"}],
         synopsis="An impoverished village woman raises her sons alone against a backdrop of debt, floods and famine.",
         awards="Academy Award nominee, Best Foreign Language Film, 1958", imdbRating=7.6),

    dict(id="pyaasa", title="Pyaasa", year=1957, language="Hindi",
         genres=["Drama"], director="Guru Dutt",
         cast=[{"name":"Guru Dutt"},{"name":"Waheeda Rehman"},{"name":"Mala Sinha"}],
         synopsis="A struggling poet finds his work celebrated only after the world believes him dead.", imdbRating=8.2),

    dict(id="mughal-e-azam", title="Mughal-E-Azam", year=1960, language="Hindi",
         genres=["Historical", "Drama", "Romance"], director="K. Asif",
         cast=[{"name":"Prithviraj Kapoor"},{"name":"Dilip Kumar"},{"name":"Madhubala"}],
         synopsis="A Mughal prince falls for a court dancer, defying his emperor father.", imdbRating=8.0),

    dict(id="sholay", title="Sholay", year=1975, language="Hindi",
         genres=["Action", "Adventure", "Drama"], director="Ramesh Sippy",
         cast=[{"name":"Dharmendra"},{"name":"Amitabh Bachchan"},{"name":"Hema Malini"},{"name":"Amjad Khan"}],
         synopsis="Two small-time criminals are hired by a former police officer to capture a ruthless dacoit.", imdbRating=8.1),

    dict(id="nayakan", title="Nayakan", year=1987, language="Tamil",
         genres=["Crime", "Drama"], director="Mani Ratnam",
         cast=[{"name":"Kamal Haasan"},{"name":"Saranya Ponvannan"}],
         synopsis="A boy who witnesses his father's death at the hands of a corrupt policeman grows up to become a Mumbai crime boss.", imdbRating=8.6),

    dict(id="dilwale-dulhania-le-jayenge", title="Dilwale Dulhania Le Jayenge", year=1995, language="Hindi",
         genres=["Romance", "Drama"], director="Aditya Chopra",
         cast=[{"name":"Shah Rukh Khan"},{"name":"Kajol"}],
         synopsis="Two young NRIs fall in love on a European trip, then must win over her traditional family in Punjab.", imdbRating=8.0),

    dict(id="lagaan", title="Lagaan", year=2001, language="Hindi",
         genres=["Sport", "Drama", "Musical"], director="Ashutosh Gowariker",
         cast=[{"name":"Aamir Khan"},{"name":"Gracy Singh"}],
         synopsis="Villagers under British colonial rule wager a cricket match against their oppressors to have an oppressive tax revoked.",
         awards="Academy Award nominee, Best Foreign Language Film, 2002", imdbRating=8.1),

    dict(id="3-idiots", title="3 Idiots", year=2009, language="Hindi",
         genres=["Comedy", "Drama"], director="Rajkumar Hirani",
         cast=[{"name":"Aamir Khan"},{"name":"R. Madhavan"},{"name":"Sharman Joshi"},{"name":"Kareena Kapoor"}],
         synopsis="Two friends search for their long-lost, free-spirited college roommate, recalling how he inspired them to challenge a rigid education system.", imdbRating=8.4),

    dict(id="drishyam", title="Drishyam", year=2013, language="Malayalam",
         genres=["Crime", "Drama", "Thriller"], director="Jeethu Joseph",
         cast=[{"name":"Mohanlal"},{"name":"Meena"}],
         synopsis="A cable operator goes to extraordinary lengths to protect his family after a fatal confrontation threatens to expose them.", imdbRating=8.3),

    dict(id="baahubali-the-beginning", title="Baahubali: The Beginning", year=2015, language="Telugu",
         genres=["Action", "Drama"], director="S. S. Rajamouli",
         cast=[{"name":"Prabhas"},{"name":"Rana Daggubati"},{"name":"Anushka Shetty"},{"name":"Tamannaah"}],
         synopsis="A young man raised in a remote village sets out to discover his royal heritage and the truth behind his father's death.", imdbRating=8.1),

    dict(id="baahubali-2-the-conclusion", title="Baahubali 2: The Conclusion", year=2017, language="Telugu",
         genres=["Action", "Drama"], director="S. S. Rajamouli",
         cast=[{"name":"Prabhas"},{"name":"Rana Daggubati"},{"name":"Anushka Shetty"},{"name":"Ramya Krishnan"}],
         synopsis="The conclusion to the Baahubali saga answers the question that gripped India: why did Katappa kill Baahubali?", imdbRating=8.0),

    dict(id="andhadhun", title="Andhadhun", year=2018, language="Hindi",
         genres=["Crime", "Thriller"], director="Sriram Raghavan",
         cast=[{"name":"Ayushmann Khurrana"},{"name":"Tabu"},{"name":"Radhika Apte"}],
         synopsis="A blind pianist becomes entangled in a murder after witnessing what he shouldn't have - or did he?", imdbRating=8.2),

    dict(id="tumbbad", title="Tumbbad", year=2018, language="Hindi",
         genres=["Horror", "Fantasy"], director="Rahi Anil Barve",
         cast=[{"name":"Sohum Shah"}],
         synopsis="A family guards a dangerous secret tied to a mythical goddess of prosperity and her forgotten, greedy son.", imdbRating=8.2),

    dict(id="kgf-chapter-1", title="K.G.F: Chapter 1", year=2018, language="Kannada",
         genres=["Action", "Crime"], director="Prashanth Neel",
         cast=[{"name":"Yash"},{"name":"Srinidhi Shetty"}],
         synopsis="A man rises from poverty to become a feared enforcer in a gold-mining underworld, pursuing power he promised his dying mother.", imdbRating=8.2),

    dict(id="gully-boy", title="Gully Boy", year=2019, language="Hindi",
         genres=["Drama", "Music"], director="Zoya Akhtar",
         cast=[{"name":"Ranveer Singh"},{"name":"Alia Bhatt"}],
         synopsis="A young man from Mumbai's slums channels his frustrations into rap music, chasing a way out through his art.", imdbRating=7.9),

    dict(id="article-15", title="Article 15", year=2019, language="Hindi",
         genres=["Crime", "Drama"], director="Anubhav Sinha",
         cast=[{"name":"Ayushmann Khurrana"}],
         synopsis="A city police officer investigates the disappearance of three girls in a caste-divided rural village.", imdbRating=8.1),

    dict(id="super-deluxe", title="Super Deluxe", year=2019, language="Tamil",
         genres=["Drama"], director="Thiagarajan Kumararaja",
         cast=[{"name":"Vijay Sethupathi"},{"name":"Samantha"},{"name":"Fahadh Faasil"}],
         synopsis="Four interconnected stories collide over one chaotic day, each grappling with identity, morality and chance.", imdbRating=8.4),

    dict(id="kumbalangi-nights", title="Kumbalangi Nights", year=2019, language="Malayalam",
         genres=["Drama"], director="Madhu C. Narayanan",
         cast=[{"name":"Soubin Shahir"},{"name":"Fahadh Faasil"},{"name":"Shane Nigam"}],
         synopsis="Four dysfunctional brothers in a fishing village slowly learn to become a family again.", imdbRating=8.3),

    dict(id="sairat", title="Sairat", year=2016, language="Marathi",
         genres=["Romance", "Drama"], director="Nagraj Manjule",
         cast=[{"name":"Rinku Rajguru"},{"name":"Akash Thosar"}],
         synopsis="A fisherman's son and a landlord's daughter fall in love across a caste divide, with devastating consequences.", imdbRating=7.4),

    dict(id="jai-bhim", title="Jai Bhim", year=2021, language="Tamil",
         genres=["Crime", "Drama"], director="T. J. Gnanavel",
         cast=[{"name":"Suriya"},{"name":"Lijomol Jose"}],
         synopsis="A lawyer fights for a tribal woman whose husband has disappeared in police custody.", imdbRating=8.7),

    dict(id="kgf-chapter-2", title="K.G.F: Chapter 2", year=2022, language="Kannada",
         genres=["Action", "Crime"], director="Prashanth Neel",
         cast=[{"name":"Yash"},{"name":"Sanjay Dutt"},{"name":"Raveena Tandon"},{"name":"Srinidhi Shetty"}],
         synopsis="Rocky's rise to power over the Kolar Gold Fields draws the attention of a ruthless new enemy.", imdbRating=8.2),

    dict(id="rrr", title="RRR", year=2022, language="Telugu",
         genres=["Action", "Drama", "Period"], director="S. S. Rajamouli",
         cast=[{"name":"N. T. Rama Rao Jr."},{"name":"Ram Charan"},{"name":"Alia Bhatt"},{"name":"Ajay Devgn"}],
         synopsis="A fictional imagining of two real Indian revolutionaries and the friendship that unites them against British colonial rule.",
         awards="Academy Award, Best Original Song (\"Naatu Naatu\"), 2023", imdbRating=7.9),

    dict(id="kantara", title="Kantara", year=2022, language="Kannada",
         genres=["Action", "Drama", "Mystery"], director="Rishab Shetty",
         cast=[{"name":"Rishab Shetty"},{"name":"Sapthami Gowda"}],
         synopsis="A forest officer collides with a village's centuries-old Bhuta Kola spiritual tradition and the land dispute threatening it.", imdbRating=8.2),

    dict(id="vikram", title="Vikram", year=2022, language="Tamil",
         genres=["Action", "Crime", "Thriller"], director="Lokesh Kanagaraj",
         cast=[{"name":"Kamal Haasan"},{"name":"Vijay Sethupathi"},{"name":"Fahadh Faasil"}],
         synopsis="A black-ops officer investigates a series of murders that leads him into a war with a powerful drug syndicate.", imdbRating=8.3),
]


def build_movie(d, index_position):
    tone = tone_for(index_position)
    m = {
        "id": d["id"],
        "title": d["title"],
        "originalTitle": d.get("originalTitle", d["title"]),
        "year": d["year"],
        "language": d["language"],
        "country": "India",
        "genres": d["genres"],
        "director": d.get("director"),
        "writer": d.get("writer"),
        "producers": d.get("producers", []),
        "musicDirector": d.get("musicDirector"),
        "cinematographer": d.get("cinematographer"),
        "editor": d.get("editor"),
        "cast": d.get("cast", []),
        "productionCompanies": d.get("productionCompanies", []),
        "budget": d.get("budget"),
        "boxOffice": d.get("boxOffice"),
        "ottPlatform": d.get("ottPlatform"),
        "releaseDate": d.get("releaseDate"),
        "runtime": d.get("runtime"),
        "certification": d.get("certification"),
        "synopsis": d.get("synopsis"),
        "review": d.get("review"),
        "positives": d.get("positives", []),
        "negatives": d.get("negatives", []),
        "finalVerdict": d.get("finalVerdict"),
        "ceniverseRating": d.get("ceniverseRating"),
        "publicRatings": d.get("publicRatings", []),
        "imdbRating": d.get("imdbRating"),
        "awards": d.get("awards"),
        "sourceNote": d.get("sourceNote"),
        "posterTone": tone,
        "backdropTone": tone,
        "glyph": d["title"][0].upper(),
    }
    return m


all_movies = [build_movie(d, i) for i, d in enumerate(featured)] + \
             [build_movie(d, i + len(featured)) for i, d in enumerate(catalog)]

# ----------------------------------------------------------------------------
# Output 1: per-movie JS files (script-tag loadable - kept as source-of-truth
# build artifacts for a future real deployment with true lazy loading).
# ----------------------------------------------------------------------------
for m in all_movies:
    path = os.path.join(MOVIES_DIR, m["id"] + ".js")
    with open(path, "w", encoding="utf-8") as f:
        f.write("// Auto-generated by gen_data.py - do not hand-edit.\n")
        f.write("window.CENIVERSE_MOVIE = ")
        json.dump(m, f, ensure_ascii=False, indent=2)
        f.write(";\n")

# ----------------------------------------------------------------------------
# Output 2: lightweight search index (script-tag loadable)
# ----------------------------------------------------------------------------
search_index = []
for m in all_movies:
    search_index.append({
        "id": m["id"], "title": m["title"], "year": m["year"], "language": m["language"],
        "director": m["director"], "cast": [c["name"] for c in m["cast"]],
        "genres": m["genres"], "posterTone": m["posterTone"], "glyph": m["glyph"],
        "producers": m.get("producers", []), "musicDirector": m.get("musicDirector"),
    })
with open(os.path.join(DATA_DIR, "search-index.js"), "w", encoding="utf-8") as f:
    f.write("// Auto-generated by gen_data.py - do not hand-edit.\n")
    f.write("window.CENIVERSE_INDEX = ")
    json.dump(search_index, f, ensure_ascii=False, indent=2)
    f.write(";\n")

# ----------------------------------------------------------------------------
# Output 3: featured id order (homepage carousel)
# ----------------------------------------------------------------------------
with open(os.path.join(DATA_DIR, "featured.js"), "w", encoding="utf-8") as f:
    f.write("// Auto-generated by gen_data.py - do not hand-edit.\n")
    f.write("window.CENIVERSE_FEATURED = ")
    json.dump([d["id"] for d in featured], f, ensure_ascii=False, indent=2)
    f.write(";\n")

# ----------------------------------------------------------------------------
# Output 4: INLINED single-file database + index, for guaranteed robustness.
# These get spliced directly into movie.html / index.html as <script> blocks
# so the site works with zero dependency on sibling files resolving - this
# is what actually ships. The per-file versions above remain available for
# anyone who deploys this to a real host and wants true lazy loading.
# ----------------------------------------------------------------------------
db_by_id = {m["id"]: m for m in all_movies}
with open(os.path.join(DATA_DIR, "_inline_db.js"), "w", encoding="utf-8") as f:
    f.write("window.CENIVERSE_DB = ")
    json.dump(db_by_id, f, ensure_ascii=False, indent=2)
    f.write(";\n")
with open(os.path.join(DATA_DIR, "_inline_index.js"), "w", encoding="utf-8") as f:
    f.write("window.CENIVERSE_INDEX = ")
    json.dump(search_index, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"Wrote {len(all_movies)} movie records ({len(featured)} featured 2026 + {len(catalog)} catalog)")
print("Featured order:", [d["id"] for d in featured])
