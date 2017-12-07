
const rw = require("../MrClockwork/reader_writer.js");


module.exports =
{
  dom4NationNumbersToNames:
  {
    5: "EA Arcoscephale", 6: "EA Ermor", 7: "EA Ulm", 8: "EA Marverni",
    9: "EA Sauromatia", 10: "EA T'ien Ch'i", 11: "EA Machaka", 12: "EA Mictlan",
    13: "EA Abysia", 14: "EA Caelum", 15: "EA C'tis", 16: "EA Pangaea",
    17: "EA Agartha", 18: "EA Tir na n'Og", 19: "EA Fomoria", 20: "EA Vanheim",
    21: "EA Helheim", 22: "EA Niefelheim", 25: "EA Kailasa", 26: "EA Lanka",
    27: "EA Yomi", 28: "EA Hinnom", 29: "EA Ur", 30: "EA Berytos",
    31: "EA Xibalba", 33: "MA Arcoscephale", 34: "MA Ermor", 35: "MA Sceleria",
    36: "MA Pythium", 37: "MA Man", 38: "MA Eriu", 39: "MA Ulm",
    40: "MA Marignon", 41: "MA Mictlan", 42: "MA T'ien Ch'i", 43: "MA Machaka",
    44: "MA Agartha", 45: "MA Abysia", 46: "MA Caelum", 47: "MA C'tis",
    48: "MA Pangaea", 49: "MA Asphodel", 50: "MA Vanheim", 51: "MA Jotunheim",
    52: "MA Vanarus", 53: "MA Bandar Log", 54: "MA Shinuyama", 55: "MA Ashdod",
    57: "MA Nazca", 58: "MA Xibalba", 60: "LA Arcoscephale", 61: "LA Pythium",
    62: "LA Lemuria", 63: "LA Man", 64: "LA Ulm", 65: "LA Marignon",
    66: "LA Mictlan", 67: "LA T'ien Ch'i", 69: "LA Jomon", 70: "LA Agartha",
    71: "LA Abysia", 72: "LA Caelum", 73: "LA C'tis", 74: "LA Pangaea",
    75: "LA Midgard", 76: "LA Utgard", 77: "LA Bogarus", 78: "LA Patala",
    79: "LA Gath", 80: "LA Ragha", 81: "LA Xibalba", 83: "EA Atlantis",
    84: "EA R'lyeh", 85: "EA Pelagia", 86: "EA Oceania", 87: "MA Atlantis",
    88: "MA R'lyeh", 89: "MA Pelagia", 90: "MA Oceania", 91: "LA Atlantis",
    92: "LA R'lyeh", 95: "EA Therodos", 96: "MA Ys"
  },

  dom4NationFilesToNames:
  {
    "early_abysia.2h": "EA Abysia", "mid_abysia.2h": "MA Abysia", "late_abysia.2h": "LA Abysia",
    "early_agartha.2h": "EA Agartha", "mid_agartha.2h": "MA Agartha", "late_agartha.2h": "LA Agartha",
    "early_arcoscephale.2h": "EA Arcoscephale", "mid_arcoscephale.2h": "MA Arcoscephale", "late_arcoscephale.2h": "LA Arcoscephale",
    "early_atlantis.2h": "EA Atlantis", "mid_atlantis.2h": "MA Atlantis", "late_atlantis.2h": "LA Atlantis",
    "early_caelum.2h": "EA Caelum", "mid_caelum.2h": "MA Caelum", "late_caelum.2h": "LA Caelum",
    "early_ctis.2h": "EA C'tis", "mid_ctis.2h": "MA C'tis", "late_ctis.2h": "LA C'tis",
    "early_ermor.2h": "EA Ermor", "mid_ermor.2h": "MA Ermor",
    "early_gath.2h": "EA Hinnom", "mid_gath.2h": "MA Ashdod", "late_gath.2h": "LA Gath",
    "early_machaka.2h": "EA Machaka", "mid_machaka.2h": "MA Machaka",
    "mid_man.2h": "MA Man", "late_chelms.2h": "LA Man",
    "early_mictlan.2h": "EA Mictlan", "mid_mictlan.2h": "MA Mictlan", "late_mictlan.2h": "LA Mictlan",
    "early_oceania.2h": "EA Oceania", "mid_oceania.2h": "MA Oceania",
    "early_pangaea.2h": "EA Pangaea", "mid_pangaea.2h": "MA Pangaea", "late_pangaea.2h": "LA Pangaea",
    "early_pelagia.2h": "EA Pelagia", "mid_pelagia.2h": "MA Pelagia",
    "mid_pythium.2h": "MA Pythium", "late_pythium.2h": "LA Pythium",
    "mid_rus.2h": "MA Vanarus", "late_rus.2h": "LA Bogarus",
    "early_rlyeh.2h": "EA R'lyeh", "mid_rlyeh.2h": "MA R'lyeh", "late_rlyeh.2h": "LA R'lyeh",
    "early_tienchi.2h": "EA T'ien Ch'i", "mid_tienchi.2h": "MA T'ien Ch'i", "late_tienchi.2h": "LA T'ien Ch'i",
    "early_ulm.2h": "EA Ulm", "mid_ulm.2h": "MA Ulm", "late_ulm.2h": "LA Ulm",
    "early_vanheim.2h": "EA Vanheim", "mid_vanheim.2h": "MA Vanheim",
    "early_xibalba.2h": "EA Xibalba", "mid_xibalba.2h": "MA Xibalba", "late_xibalba.2h": "LA Xibalba",
    "mid_asphodel.2h": "MA Asphodel",
    "mid_bakemono.2h": "MA Shinuyama",
    "mid_bandarlog.2h": "MA Bandar Log",
    "early_berytos.2h": "EA Berytos",
    "mid_eriu.2h": "MA Eriu",
    "early_fomoria.2h": "EA Fomoria",
    "early_helheim.2h": "EA Helheim",
    "late_jomon.2h": "LA Jomon",
    "mid_jotunheim.2h": "MA Jotunheim",
    "early_kailasa.2h": "EA Kailasa",
    "early_lanka.2h": "EA Lanka",
    "late_lemur.2h": "LA Lemur",
    "early_marverni.2h": "EA Marverni",
    "late_midgard.2h": "LA Midgard",
    "mid_nazca.2h": "MA Nazca",
    "early_niefelheim.2h": "EA Niefelheim",
    "late_patala.2h": "LA Patala",
    "late_ragha.2h": "LA Ragha",
    "early_sauromatia.2h": "EA Sauromatia",
    "mid_sceleria.2h": "MA Sceleria",
    "early_tirnanog.2h": "EA Tir na n'Og",
    "early_ur.2h": "EA Ur",
    "late_utgard.2h": "LA Utgard",
    "early_yomi.2h": "EA Yomi",
    "early_therodos.2h": "EA Therodos",
    "mid_ys.2h": "MA Ys"
  },

  dom4NationNamesToNumbers:
  {
    "EA Arcoscephale": 5, "EA Ermor": 6, "EA Ulm": 7, "EA Marverni": 8,
    "EA Sauromatia": 9, "EA T'ien Ch'i": 10, "EA Machaka": 11, "EA Mictlan": 12,
    "EA Abysia": 13, "EA Caelum": 14, "EA C'tis": 15, "EA Pangaea": 16,
    "EA Agartha": 17, "EA Tir na n'Og": 18, "EA Fomoria": 19, "EA Vanheim": 20,
    "EA Helheim": 21, "EA Niefelheim": 22, "EA Kailasa": 25, "EA Lanka": 26,
    "EA Yomi": 27, "EA Hinnom": 28, "EA Ur": 29, "EA Berytos": 30,
    "EA Xibalba": 31, "MA Arcoscephale": 33, "MA Ermor": 34, "MA Sceleria": 35,
    "MA Pythium": 36, "MA Man": 37, "MA Eriu": 38, "MA Ulm": 39,
    "MA Marignon": 40, "MA Mictlan": 41, "MA T'ien Ch'i": 42, "MA Machaka": 43,
    "MA Agartha": 44, "MA Abysia": 45, "MA Caelum": 46, "MA C'tis": 47,
    "MA Pangaea": 48, "MA Asphodel": 49, "MA Vanheim": 50, "MA Jotunheim": 51,
    "MA Vanarus": 52, "MA Bandar Log": 53, "MA Shinuyama": 54, "MA Ashdod": 55,
    "MA Nazca": 57, "MA Xibalba": 58, "LA Arcoscephale": 60, "LA Pythium": 61,
    "LA Lemuria": 62, "LA Man": 63, "LA Ulm": 64, "LA Marignon": 65,
    "LA Mictlan": 66, "LA T'ien Ch'i": 67, "LA Jomon": 69, "LA Agartha": 70,
    "LA Abysia": 71, "LA Caelum": 72, "LA C'tis": 73, "LA Pangaea": 74,
    "LA Midgard": 75, "LA Utgard": 76, "LA Bogarus": 77, "LA Patala": 78,
    "LA Gath": 79, "LA Ragha": 80, "LA Xibalba": 81, "EA Atlantis": 83,
    "EA R'lyeh": 84, "EA Pelagia": 85, "EA Oceania": 86, "MA Atlantis": 87,
    "MA R'lyeh": 88, "MA Pelagia": 89, "MA Oceania": 90, "LA Atlantis": 91,
    "LA R'lyeh": 92, "EA Therodos": 95, "MA Ys": 96
  },

  dom5NationNumbersToNames:
  {
    5: "EA Arcoscephale", 6: "EA Ermor", 7: "EA Ulm", 8: "EA Marverni",
    9: "EA Sauromatia", 10: "EA T'ien Ch'i", 11: "EA Machaka", 12: "EA Mictlan",
    13: "EA Abysia", 14: "EA Caelum", 15: "EA C'tis", 16: "EA Pangaea",
    17: "EA Agartha", 18: "EA Tir na n'Og", 19: "EA Fomoria", 20: "EA Vanheim",
    21: "EA Helheim", 22: "EA Niefelheim", 24: "EA Rus", 25: "EA Kailasa", 26: "EA Lanka",
    27: "EA Yomi", 28: "EA Hinnom", 29: "EA Ur", 30: "EA Berytos",
    31: "EA Xibalba", 43: "MA Arcoscephale", 44: "MA Ermor", 45: "MA Sceleria",
    46: "MA Pythium", 47: "MA Man", 48: "MA Eriu", 49: "MA Ulm",
    50: "MA Marignon", 51: "MA Mictlan", 52: "MA T'ien Ch'i", 53: "MA Machaka",
    54: "MA Agartha", 55: "MA Abysia", 56: "MA Caelum", 57: "MA C'tis",
    58: "MA Pangaea", 59: "MA Asphodel", 60: "MA Vanheim", 61: "MA Jotunheim",
    62: "MA Vanarus", 63: "MA Bandar Log", 64: "MA Shinuyama", 65: "MA Ashdod",
    66: "MA Uruk", 67: "MA Nazca", 68: "MA Xibalba", 80: "LA Arcoscephale", 81: "LA Pythium",
    82: "LA Lemuria", 83: "LA Man", 84: "LA Ulm", 85: "LA Marignon",
    86: "LA Mictlan", 87: "LA T'ien Ch'i", 89: "LA Jomon", 90: "LA Agartha",
    91: "LA Abysia", 92: "LA Caelum", 93: "LA C'tis", 94: "LA Pangaea",
    95: "LA Midgard", 96: "LA Utgard", 97: "LA Bogarus", 98: "LA Patala",
    99: "LA Gath", 100: "LA Ragha", 101: "LA Xibalba", 36: "EA Atlantis",
    37: "EA R'lyeh", 38: "EA Pelagia", 39: "EA Oceania", 73: "MA Atlantis",
    74: "MA R'lyeh", 75: "MA Pelagia", 76: "MA Oceania", 106: "LA Atlantis",
    107: "LA R'lyeh", 108: "LA Erytheia", 40: "EA Therodos", 77: "MA Ys"
  },

  dom5NationFilesToNames:
  {
    "early_abysia.2h": "EA Abysia", "mid_abysia.2h": "MA Abysia", "late_abysia.2h": "LA Abysia",
    "early_agartha.2h": "EA Agartha", "mid_agartha.2h": "MA Agartha", "late_agartha.2h": "LA Agartha",
    "early_arcoscephale.2h": "EA Arcoscephale", "mid_arcoscephale.2h": "MA Arcoscephale", "late_arcoscephale.2h": "LA Arcoscephale",
    "early_atlantis.2h": "EA Atlantis", "mid_atlantis.2h": "MA Atlantis", "late_atlantis.2h": "LA Atlantis",
    "early_caelum.2h": "EA Caelum", "mid_caelum.2h": "MA Caelum", "late_caelum.2h": "LA Caelum",
    "early_ctis.2h": "EA C'tis", "mid_ctis.2h": "MA C'tis", "late_ctis.2h": "LA C'tis",
    "early_ermor.2h": "EA Ermor", "mid_ermor.2h": "MA Ermor",
    "early_gath.2h": "EA Hinnom", "mid_gath.2h": "MA Ashdod", "late_gath.2h": "LA Gath",
    "early_machaka.2h": "EA Machaka", "mid_machaka.2h": "MA Machaka",
    "mid_man.2h": "MA Man", "late_chelms.2h": "LA Man",
    "early_mictlan.2h": "EA Mictlan", "mid_mictlan.2h": "MA Mictlan", "late_mictlan.2h": "LA Mictlan",
    "early_oceania.2h": "EA Oceania", "mid_oceania.2h": "MA Oceania",
    "early_pangaea.2h": "EA Pangaea", "mid_pangaea.2h": "MA Pangaea", "late_pangaea.2h": "LA Pangaea",
    "early_pelagia.2h": "EA Pelagia", "mid_pelagia.2h": "MA Pelagia",
    "mid_pythium.2h": "MA Pythium", "late_pythium.2h": "LA Pythium",
    "early_bogarus.2h": "EA Rus", "mid_rus.2h": "MA Vanarus", "late_rus.2h": "LA Bogarus",
    "early_rlyeh.2h": "EA R'lyeh", "mid_rlyeh.2h": "MA R'lyeh", "late_rlyeh.2h": "LA R'lyeh",
    "early_tienchi.2h": "EA T'ien Ch'i", "mid_tienchi.2h": "MA T'ien Ch'i", "late_tienchi.2h": "LA T'ien Ch'i",
    "early_ulm.2h": "EA Ulm", "mid_ulm.2h": "MA Ulm", "late_ulm.2h": "LA Ulm",
    "early_vanheim.2h": "EA Vanheim", "mid_vanheim.2h": "MA Vanheim",
    "early_xibalba.2h": "EA Xibalba", "mid_xibalba.2h": "MA Xibalba", "late_xibalba.2h": "LA Xibalba",
    "mid_asphodel.2h": "MA Asphodel",
    "mid_bakemono.2h": "MA Shinuyama",
    "mid_bandarlog.2h": "MA Bandar Log",
    "early_berytos.2h": "EA Berytos",
    "mid_eriu.2h": "MA Eriu",
    "late_erytheia.2h": "LA Erytheia",
    "early_fomoria.2h": "EA Fomoria",
    "early_helheim.2h": "EA Helheim",
    "late_jomon.2h": "LA Jomon",
    "mid_jotunheim.2h": "MA Jotunheim",
    "early_kailasa.2h": "EA Kailasa",
    "early_lanka.2h": "EA Lanka",
    "late_lemur.2h": "LA Lemur",
    "early_marverni.2h": "EA Marverni",
    "late_midgard.2h": "LA Midgard",
    "mid_nazca.2h": "MA Nazca",
    "early_niefelheim.2h": "EA Niefelheim",
    "late_patala.2h": "LA Patala",
    "late_ragha.2h": "LA Ragha",
    "early_sauromatia.2h": "EA Sauromatia",
    "mid_sceleria.2h": "MA Sceleria",
    "early_tirnanog.2h": "EA Tir na n'Og",
    "early_ur.2h": "EA Ur", "mid_ur.2h": "MA Uruk",
    "late_utgard.2h": "LA Utgard",
    "early_yomi.2h": "EA Yomi",
    "early_therodos.2h": "EA Therodos",
    "mid_ys.2h": "MA Ys"
  },

  dom5NationNamesToNumbers:
  {
    "EA Arcoscephale": 5, "EA Ermor": 6, "EA Ulm": 7, "EA Marverni": 8,
    "EA Sauromatia": 9, "EA T'ien Ch'i": 10, "EA Machaka": 11, "EA Mictlan": 12,
    "EA Abysia": 13, "EA Caelum": 14, "EA C'tis": 15, "EA Pangaea": 16,
    "EA Agartha": 17, "EA Tir na n'Og": 18, "EA Fomoria": 19, "EA Vanheim": 20,
    "EA Helheim": 21, "EA Niefelheim": 22, "EA Rus": 24, "EA Kailasa": 25, "EA Lanka": 26,
    "EA Yomi": 27, "EA Hinnom": 28, "EA Ur": 29, "EA Berytos": 30,
    "EA Xibalba": 31, "MA Arcoscephale": 43, "MA Ermor": 44, "MA Sceleria": 45,
    "MA Pythium": 46, "MA Man": 47, "MA Eriu": 48, "MA Ulm": 49,
    "MA Marignon": 50, "MA Mictlan": 51, "MA T'ien Ch'i": 52, "MA Machaka": 53,
    "MA Agartha": 54, "MA Abysia": 55, "MA Caelum": 56, "MA C'tis": 57,
    "MA Pangaea": 58, "MA Asphodel": 59, "MA Vanheim": 60, "MA Jotunheim": 61,
    "MA Vanarus": 62, "MA Bandar Log": 63, "MA Shinuyama": 64, "MA Ashdod": 65,
    "MA Uruk": 66, "MA Nazca": 67, "MA Xibalba": 68, "LA Arcoscephale": 80, "LA Pythium": 81,
    "LA Lemuria": 82, "LA Man": 83, "LA Ulm": 84, "LA Marignon": 85,
    "LA Mictlan": 86, "LA T'ien Ch'i": 87, "LA Jomon": 89, "LA Agartha": 90,
    "LA Abysia": 91, "LA Caelum": 92, "LA C'tis": 93, "LA Pangaea": 94,
    "LA Midgard": 95, "LA Utgard": 96, "LA Bogarus": 97, "LA Patala": 98,
    "LA Gath": 99, "LA Ragha": 100, "LA Xibalba": 101, "EA Atlantis": 36,
    "EA R'lyeh": 37, "EA Pelagia": 38, "EA Oceania": 39, "MA Atlantis": 73,
    "MA R'lyeh": 74, "MA Pelagia": 75, "MA Oceania": 76, "LA Atlantis": 106,
    "LA R'lyeh": 107, "LA Erytheia": 108, "EA Therodos": 40, "MA Ys": 77
  },

  translateDom4Setting: function(key, value)
  {
     if (key === "name")
     {
       return "Game name: " + value;
     }

     if (key === "port")
     {
       return "Game port: " + value;
     }

     if (key === "mapfile")
     {
       return "Map: " + value;
     }

     if (key === "mods")
     {
       var mods = "";

       if (typeof value === "string")
       {
         return "Mods: " + value;
       }

       for (var i = 0; i < value.length; i++)
       {
         mods += value[i];

         if (i < value.length - 1)
         {
           mods += ", ";
         }
       }

       return "Mods: " + mods;
     }

     if (key === "era")
     {
       if (value == "1")
       {
         return "Era: early age"
       }

       else if (value == "2")
       {
         return "Era: middle age"
       }

       else if (value == "3")
       {
         return "Era: late age"
       }

       else return "Era: " + value;
     }

     if (key === "research")
     {
       if (value == "-1")
       {
         return "Research: very easy";
       }

       else if (value == "0")
       {
         return "Research: easy";
       }

       else if (value == "1")
       {
         return "Research: normal";
       }

       else if (value == "2")
       {
         return "Research: hard";
       }

       else if (value == "3")
       {
         return "Research: very hard";
       }

       else return "Research: " + value;
     }

     if (key === "hofsize")
     {
       return "Hall of Fame Entries: " + value;
     }

     if (key === "indepstr")
     {
       return "Independents' Strength: " + value;
     }

     if (key === "magicsites")
     {
       return "Magic Sites: " + value;
     }

     if (key === "thrones")
     {
       if (typeof value === "string")
       {
         return "Thrones: " + value;
       }

       else return "Thrones: " + value.lvl1 + " level one, " + value.lvl2 + " level two, " + value.lvl3 + " level three\nRequired AP: " + value.ap;
     }

     if (key === "eventrarity")
     {
       if (value == "1")
       {
         return "Event Rarity: common";
       }

       else if (value == "2")
       {
         return "Event Rarity: rare";
       }

       else return "Event Rarity: " + value;
     }

     if (key === "storyevents")
     {
       return "Story Events: " + value;
     }

     if (key === "scoregraphs")
     {
       return "Score Graphs: " + value;
     }

     if (key === "masterpassword")
     {
       return "Master Password (probably don't share this): " + value;
     }

     if (key === "aiplayers")
     {
       var players = "";

       if (typeof value === "string")
       {
         return "AI Players: " + value;
       }

       for (var key in value)
       {
         players += (this.dom4NationNumbersToNames[key] || key) + " (" + value[key] + ") ";
       }

       return "AI Players: " + players;
     }

     if (key === "defaulttimer")
     {
       return "Default Timer: " + value.print();
     }

     if (key === "currenttimer")
     {
       return "Current Timer: " + value.print();
     }

     if (key === "tracked")
     {
       return "Turn and timer notifications: " + value;
     }

     if (key === "guild")
     {
       return "Guild: " + value.name;
     }

     if (key === "organizer" && value != null && value.user.username != null)
     {
       return "Organizer: " + value.user.username;
     }

     //ignore all key values that weren't caught before to obfuscate object properties
     return "";
  },

  translateDom5Setting: function(key, value)
  {
    if (key === "game")
    {
      return "Game: " + value;
    }

     if (key === "name")
     {
       return "Game name: " + value;
     }

     if (key === "port")
     {
       return "Game port: " + value;
     }

     if (key === "mapfile")
     {
       if (value.includes(".map") == false)
       {
         return "Map: random (" + value.replace(/\D+/g, "") + " provinces/player)";
       }

       else return "Map: " + value;
     }

     if (key === "mods")
     {
       var mods = "";

       if (typeof value === "string")
       {
         return "Mods: " + value;
       }

       for (var i = 0; i < value.length; i++)
       {
         mods += value[i];

         if (i < value.length - 1)
         {
           mods += ", ";
         }
       }

       return "Mods: " + mods;
     }

     if (key === "era")
     {
       if (value == "1")
       {
         return "Era: early age"
       }

       else if (value == "2")
       {
         return "Era: middle age"
       }

       else if (value == "3")
       {
         return "Era: late age"
       }

       else return "Era: " + value;
     }

     if (key === "research")
     {
       if (value == "0")
       {
         return "Research: very easy";
       }

       else if (value == "1")
       {
         return "Research: easy";
       }

       else if (value == "2")
       {
         return "Research: normal";
       }

       else if (value == "3")
       {
         return "Research: hard";
       }

       else if (value == "4")
       {
         return "Research: very hard";
       }

       else return "Research: " + value;
     }

     if (key === "startingresearch")
     {
       if (value == "random")
       {
         return "Starting Research: random school";
       }

       else if (value == "spread")
       {
         return "Starting Research: spread evenly";
       }
     }

     if (key === "hofsize")
     {
       return "Hall of Fame Entries: " + value;
     }

     if (key === "indepstr")
     {
       return "Independents' Strength: " + value;
     }

     if (key === "magicsites")
     {
       return "Magic Sites: " + value;
     }

     if (key === "thrones")
     {
       if (typeof value === "string")
       {
         return "Thrones: " + value;
       }

       else return "Thrones: " + value.lvl1 + " level one, " + value.lvl2 + " level two, " + value.lvl3 + " level three\nRequired AP: " + value.ap;
     }

     if (key === "cataclysm")
     {
       if (value === "off")
       {
         return "Cataclysm: off";
       }

       else return "Cataclysm: " + value + " turns";
     }

     if (key === "eventrarity")
     {
       if (value == "1")
       {
         return "Event Rarity: common";
       }

       else if (value == "2")
       {
         return "Event Rarity: rare";
       }

       else return "Event Rarity: " + value;
     }

     if (key === "storyevents")
     {
       return "Story Events: " + value;
     }

     if (key === "globalslots")
     {
       return "Global Slots: " + value;
     }

     if (key === "scoregraphs")
     {
       return "Score Graphs: " + value;
     }

     if (key === "masterpassword")
     {
       return "Master Password (probably don't share this): " + value;
     }

     if (key === "aiplayers")
     {
       var players = "";

       if (typeof value === "string")
       {
         return "AI Players: " + value;
       }

       for (var key in value)
       {
         players += (this.dom5NationNumbersToNames[key] || key) + " (" + value[key] + ") ";
       }

       return "AI Players: " + players;
     }

     if (key === "defaulttimer")
     {
       return "Default Timer: " + value.print();
     }

     if (key === "tracked")
     {
       return "Turn and timer notifications: " + value;
     }

     if (key === "guild")
     {
       return "Guild: " + value.name;
     }

     if (key === "organizer" && value != null && value.user.username != null)
     {
       return "Organizer: " + value.user.username;
     }

     //ignore all key values that weren't caught before to obfuscate object properties
     return "";
  },

  translateCoE4Setting: function(key, value)
  {
     if (key === "name")
     {
       return "Game name: " + value;
     }

     if (key === "port")
     {
       return "Game port: " + value;
     }

     if (key === "mapWidth")
     {
       return "Map Width: " + value;
     }

     if (key === "mapHeight")
     {
       return "Map Height: " + value;
     }

     if (key === "society")
     {
       if (value == 0)
       {
         return "Society: Random";
       }

       else if (value == 1)
       {
         return "Society: Dark Ages";
       }

       else if (value == 2)
       {
         return "Society: Agricultural";
       }

       else if (value == 3)
       {
         return "Society: Empire";
       }

       else if (value == 4)
       {
         return "Society: Fallen Empire";
       }

       else if (value == 5)
       {
         return "Society: Monarchy";
       }

       else if (value == 6)
       {
         return "Society: Dawn of a New Empire";
       }

       else return "Society: Invalid?";
     }

     if (key === "clusteredStart")
     {
       if (value === "on")
       {
         return "Clustered";
       }

       else
       {
         return "Unclustered";
       }
     }

     if (key === "commonCause")
     {
       if (value === "on")
       {
         return "Common Cause: On";
       }

       else
       {
         return "Common Cause: Off";
       }
     }

     if (key === "graphs")
     {
       if (value === "on")
       {
         return "Graphs: On";
       }

       else return "Graphs: Off";
     }

     return "";
  },

  getProvinceCount: function(mapData)
  {
    var provLines;
    var terrainMask;
    var provCount = {total: 0, land: 0, sea: 0};

    if (mapData == null || /\w+/.test(mapData) == false || /\#terrain\s+\d+\s+\d+/g.test(mapData) == false)
    {
      rw.log("The mapData provided was null, empty, or doesn't contain any #terrain expression. Returning default object.");
      return null;
    }

    provLines = mapData.match(/\#terrain\s+\d+\s+\d+/g);

    for (var i = 0; i < provLines.length; i++)
    {
      terrainMask = +provLines[i].slice(provLines[i].indexOf(" ", provLines[i].indexOf(" ") + 1) + 1).replace(/\D/g, "");

      //4 is the sea code and 2052 is the deep sea code in the .map files
      if ((terrainMask 			% 4 == 0 &&    terrainMask 			% 8 != 0) ||
         ((terrainMask - 1) 	% 4 == 0 && (terrainMask - 1) 	% 8 != 0) ||
         ((terrainMask - 2) 	% 4 == 0 && (terrainMask - 2) 	% 8 != 0))
      {
        provCount.sea++;
      }
    }

    provCount.total = provLines.length;
    provCount.land = provCount.total - provCount.sea;
    return provCount;
  },

  getSeason(number)
  {
    if (number === 0)
    {
      return "Summer";
    }

    else if (number === 1)
    {
      return "Autumn";
    }

    else if (number === 2)
    {
      return "Winter";
    }

    else if (number === 3)
    {
      return "Spring";
    }

    else return "";
  }
}
