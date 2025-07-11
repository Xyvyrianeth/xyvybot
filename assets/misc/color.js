export class Color {
    constructor() {
        let r, g, b;
        switch (typeof arguments[0]) {
            case "string":
                {
                    let hex = arguments[0].toLowerCase();
                    if (hex.match(/([0-9a-f]{6}|[0-9a-f]{3})$/i)) {
                        let hexa = hex.match(/([0-9a-f]{6}|[0-9a-f]{3})$/i)[0];
                        if (hexa.length == 6)
                            r = parseInt(hexa.substring(0, 2), 16),
                                g = parseInt(hexa.substring(2, 4), 16),
                                b = parseInt(hexa.substring(4, 6), 16);
                        if (hexa.length == 3)
                            r = parseInt(hexa[0] + hexa[0], 16),
                                g = parseInt(hexa[1] + hexa[1], 16),
                                b = parseInt(hexa[2] + hexa[2], 16);
                    }
                    break;
                }
            case "object":
                {
                    r = arguments[0].r;
                    g = arguments[0].g;
                    b = arguments[0].b;
                    break;
                }
            case "number":
                {
                    if (arguments.hasOwnProperty(1) && arguments.hasOwnProperty(2) && typeof arguments[1] == "number" && typeof arguments[2] == "number") {
                        r = arguments[0];
                        g = arguments[1];
                        b = arguments[2];
                    }

                    else {
                        let hexa = arguments[0].toString(16);
                        r = parseInt(hexa.substring(0, 2), 16),
                            g = parseInt(hexa.substring(2, 4), 16),
                            b = parseInt(hexa.substring(4, 6), 16);
                    }
                }
        }
        this.r = ~~r || 0;
        this.g = ~~g || 0;
        this.b = ~~b || 0;
    }
    random() {
        this.r = Math.random() * 256 | 0;
        this.g = Math.random() * 256 | 0;
        this.b = Math.random() * 256 | 0;
        return this;
    }
    distance(color) {
        var d = 0;
        d += Math.pow(this.r - color.r, 2);
        d += Math.pow(this.g - color.g, 2);
        d += Math.pow(this.b - color.b, 2);
        return Math.abs(Math.sqrt(d));
    }
    toHexa() {
        var r = (~~this.r || 0).toString(16), g = (~~this.g || 0).toString(16), b = (~~this.b || 0).toString(16);
        if (r.length == 1)
            r = "0" + r;
        if (g.length == 1)
            g = "0" + g;
        if (b.length == 1)
            b = "0" + b;
        return "#" + r + g + b;
    }
    toInt() {
        return (this.r * 256 * 256) + (this.g * 256) + this.b;
    }
    getName() {
        var low = 256;
        var name;
        for (var n in Color.map) {
            if (!Color.map.hasOwnProperty(n))
                continue;
            var color = new Color(Color.map[n]);
            if (color.r === this.r && color.g === this.g && color.b === this.b)
                return n;
            var dist = this.distance(color);
            if (dist < low)
                low = dist,
                    name = n;
        }
        if (!name)
            name = this.toHexa();

        else
            name = "A shade of " + name;
        return name;
    }
};

/*
Color Names
*/
Color.map = {
    "Aero": "#7CB9E8",
    "Aero blue": "#C9FFE5",
    "African purple": "#B284BE",
    "Air Force blue (RAF)": "#5D8AA8",
    "Air Force blue (USAF)": "#00308F",
    "Air superiority blue": "#72A0C1",
    "Alabama Crimson": "#AF002A",
    "Alice blue": "#F0F8FF",
    "Alizarin crimson": "#E32636",
    "Alloy orange": "#C46210",
    "Almond": "#EFDECD",
    "Amaranth": "#E52B50",
    "Amaranth pink": "#F19CBB",
    "Dark amaranth": "#AB274F",
    "Amazon": "#3B7A57",
    "Amber": "#FF7E00",
    "American rose": "#FF033E",
    "Amethyst": "#9966CC",
    "Android green": "#A4C639",
    "Anti-flash white": "#F2F3F4",
    "Antique brass": "#CD9575",
    "Antique bronze": "#665D1E",
    "Antique fuchsia": "#915C83",
    "Antique ruby": "#841B2D",
    "Antique white": "#FAEBD7",
    "Apple green": "#8DB600",
    "Apricot": "#FBCEB1",
    "Aqua": "#00FFFF",
    "Aquamarine": "#7FFFD4",
    "Army green": "#4B5320",
    "Arsenic": "#3B444B",
    "Artichoke": "#8F9779",
    "Ash grey": "#B2BEB5",
    "Asparagus": "#87A96B",
    "Aureolin": "#FDEE00",
    "AuroMetalSaurus": "#6E7F80",
    "Avocado": "#568203",
    "Azure": "#007FFF",
    "Azure mist/web": "#F0FFFF",
    "Baby blue": "#89CFF0",
    "Baby blue eyes": "#A1CAF1",
    "Baby powder": "#FEFEFA",
    "Baker-Miller pink": "#FF91AF",
    "Ball blue": "#21ABCD",
    "Banana Mania": "#FAE7B5",
    "Banana yellow": "#FFE135",
    "Barbie pink": "#E0218A",
    "Barn red": "#7C0A02",
    "Battleship grey": "#848482",
    "Bazaar": "#98777B",
    "Beaver": "#9F8170",
    "Beige": "#F5F5DC",
    "B'dazzled blue": "#2E5894",
    "Big dip o’ruby": "#9C2542",
    "Bisque": "#FFE4C4",
    "Bistre": "#3D2B1F",
    "Bistre brown": "#967117",
    "Bitter lemon": "#CAE00D",
    "Bitter lime": "#648C11",
    "Bittersweet": "#FE6F5E",
    "Bittersweet shimmer": "#BF4F51",
    "Black": "#000000",
    "Black bean": "#3D0C02",
    "Black leather jacket": "#253529",
    "Black olive": "#3B3C36",
    "Blanched almond": "#FFEBCD",
    "Blast-off bronze": "#A57164",
    "Bleu de France": "#318CE7",
    "Blizzard Blue": "#ACE5EE",
    "Blond": "#FAF0BE",
    "Blue": "#0000FF",
    "Blue (Crayola)": "#1F75FE",
    "Blue (Munsell)": "#0093AF",
    "Blue (NCS)": "#0087BD",
    "Blue (pigment)": "#333399",
    "Blue (RYB)": "#0247FE",
    "Blue Bell": "#A2A2D0",
    "Blue-gray": "#6699CC",
    "Blue-green": "#0D98BA",
    "Blue sapphire": "#126180",
    "Blue-violet": "#8A2BE2",
    "Blue yonder": "#5072A7",
    "Blueberry": "#4F86F7",
    "Bluebonnet": "#1C1CF0",
    "Blush": "#DE5D83",
    "Bole Brown": "#79443B",
    "Bondi blue": "#0095B6",
    "Bone": "#E3DAC9",
    "Boston University Red": "#CC0000",
    "Bottle green": "#006A4E",
    "Boysenberry": "#873260",
    "Brandeis blue": "#0070FF",
    "Brass": "#B5A642",
    "Brick red": "#CB4154",
    "Bright cerulean": "#1DACD6",
    "Bright green": "#66FF00",
    "Bright lavender": "#BF94E4",
    "Bright lilac": "#D891EF",
    "Bright maroon": "#C32148",
    "Bright navy blue": "#1974D2",
    "Bright pink": "#FF007F",
    "Bright turquoise": "#08E8DE",
    "Bright ube": "#D19FE8",
    "Brilliant lavender": "#F4BBFF",
    "Brilliant rose": "#FF55A3",
    "Brink pink": "#FB607F",
    "British racing green": "#004225",
    "Bronze": "#CD7F32",
    "Bronze Yellow": "#737000",
    "Brown": "#964B00",
    "Brown-nose": "#6B4423",
    "Bubble gum": "#FFC1CC",
    "Bubbles": "#E7FEFF",
    "Buff": "#F0DC82",
    "Bud green": "#7BB661",
    "Bulgarian rose": "#480607",
    "Burgundy": "#800020",
    "Burlywood": "#DEB887",
    "Burnt orange": "#CC5500",
    "Burnt umber": "#8A3324",
    "Byzantine": "#BD33A4",
    "Byzantium": "#702963",
    "Cadet": "#536872",
    "Cadet blue": "#5F9EA0",
    "Cadet grey": "#91A3B0",
    "Cadmium green": "#006B3C",
    "Cadmium orange": "#ED872D",
    "Cadmium red": "#E30022",
    "Cadmium yellow": "#FFF600",
    "Cafe au lait": "#A67B5B",
    "Cafe noir": "#4B3621",
    "Cal Poly green": "#1E4D2B",
    "Cambridge Blue": "#A3C1AD",
    "Cameo pink": "#EFBBCC",
    "Camouflage green": "#78866B",
    "Canary yellow": "#FFEF00",
    "Candy apple red": "#FF0800",
    "Candy pink": "#E4717A",
    "Caput mortuum": "#592720",
    "Cardinal": "#C41E3A",
    "Caribbean green": "#00CC99",
    "Carmine": "#960018",
    "Carmine pink": "#EB4C42",
    "Carmine red": "#FF0038",
    "Carnation pink": "#FFA6C9",
    "Carolina blue": "#99BADD",
    "Carrot orange": "#ED9121",
    "Castleton green": "#00563F",
    "Catalina blue": "#062A78",
    "Catawba": "#703642",
    "Cedar Chest": "#C95A49",
    "Ceil": "#92A1CF",
    "Celadon": "#ACE1AF",
    "Celadon blue": "#007BA7",
    "Celadon green": "#2F847C",
    "Celestial blue": "#4997D0",
    "Cerise pink": "#EC3B83",
    "Cerulean blue": "#2A52BE",
    "Cerulean frost": "#6D9BC3",
    "CG Blue": "#007AA5",
    "CG Red": "#E03C31",
    "Chamoisee": "#A0785A",
    "Champagne": "#F7E7CE",
    "Charcoal": "#36454F",
    "Charleston green": "#232B2B",
    "Charm pink": "#E68FAC",
    "Chartreuse": "#DFFF00",
    "Chartreuse (web)": "#7FFF00",
    "Cherry": "#DE3163",
    "Cherry blossom pink": "#FFB7C5",
    "Chestnut": "#954535",
    "China rose": "#A8516E",
    "Chinese red": "#AA381E",
    "Chinese violet": "#856088",
    "Chocolate": "#7B3F00",
    "Chrome yellow": "#FFA700",
    "Cinereous": "#98817B",
    "Citrine": "#E4D00A",
    "Citron": "#9FA91F",
    "Claret": "#7F1734",
    "Classic rose": "#FBCCE7",
    "Cobalt": "#0047AB",
    "Cocoa brown": "#D2691E",
    "Coconut": "#965A3E",
    "Coffee Brown": "#6F4E37",
    "Columbia blue": "#9BDDFF",
    "Cool black": "#002E63",
    "Cool grey": "#8C92AC",
    "Copper": "#B87333",
    "Copper penny": "#AD6F69",
    "Copper red": "#CB6D51",
    "Copper rose": "#996666",
    "Coquelicot": "#FF3800",
    "Coral": "#FF7F50",
    "Coral pink": "#F88379",
    "Coral red": "#FF4040",
    "Cordovan": "#893F45",
    "Corn Yellow": "#FBEC5D",
    "Cornell Red": "#B31B1B",
    "Cornflower blue": "#6495ED",
    "Cornsilk": "#FFF8DC",
    "Cosmic latte": "#FFF8E7",
    "Cotton candy": "#FFBCD9",
    "Cream": "#FFFDD0",
    "Crimson": "#DC143C",
    "Crimson glory": "#BE0032",
    "Cyan": "#00B7EB",
    "Cyber grape": "#58427C",
    "Cyber yellow": "#FFD300",
    "Daffodil": "#FFFF31",
    "Dandelion": "#F0E130",
    "Dark blue": "#00008B",
    "Dark blue-gray": "#666699",
    "Dark brown": "#654321",
    "Dark byzantium": "#5D3954",
    "Dark candy apple red": "#A40000",
    "Dark cerulean": "#08457E",
    "Dark chestnut": "#986960",
    "Dark coral": "#CD5B45",
    "Dark cyan": "#008B8B",
    "Dark electric blue": "#536878",
    "Dark goldenrod": "#B8860B",
    "Dark gray": "#A9A9A9",
    "Dark green": "#013220",
    "Dark imperial blue": "#00416A",
    "Dark jungle green": "#1A2421",
    "Dark khaki": "#BDB76B",
    "Dark lavender": "#734F96",
    "Dark liver": "#534B4F",
    "Dark liver (horses)": "#543D37",
    "Dark magenta": "#8B008B",
    "Dark midnight blue": "#003366",
    "Dark moss green": "#4A5D23",
    "Dark olive green": "#556B2F",
    "Dark orange": "#FF8C00",
    "Dark orchid": "#9932CC",
    "Dark pastel blue": "#779ECB",
    "Dark pastel green": "#03C03C",
    "Dark pastel purple": "#966FD6",
    "Dark pastel red": "#C23B22",
    "Dark pink": "#E75480",
    "Dark powder blue": "#003399",
    "Dark puce": "#4F3A3C",
    "Dark raspberry": "#872657",
    "Dark red": "#8B0000",
    "Dark salmon": "#E9967A",
    "Dark scarlet": "#560319",
    "Dark sea green": "#8FBC8F",
    "Dark sienna": "#3C1414",
    "Dark sky blue": "#8CBED6",
    "Dark slate blue": "#483D8B",
    "Dark slate gray": "#2F4F4F",
    "Dark spring green": "#177245",
    "Dark tan": "#918151",
    "Dark tangerine": "#FFA812",
    "Dark terra cotta": "#CC4E5C",
    "Dark turquoise": "#00CED1",
    "Dark vanilla": "#D1BEA8",
    "Dark violet": "#9400D3",
    "Dark yellow": "#9B870C",
    "Dartmouth green": "#00703C",
    "Davy's grey": "#555555",
    "Debian red": "#D70A53",
    "Deep carmine": "#A9203E",
    "Deep carmine pink": "#EF3038",
    "Deep carrot orange": "#E9692C",
    "Deep cerise": "#DA3287",
    "Deep chestnut": "#B94E48",
    "Deep fuchsia": "#C154C1",
    "Deep jungle green": "#004B49",
    "Deep lemon": "#F5C71A",
    "Deep lilac": "#9955BB",
    "Deep magenta": "#CC00CC",
    "Deep mauve": "#D473D4",
    "Deep moss green": "#355E3B",
    "Deep peach": "#FFCBA4",
    "Deep puce": "#A95C68",
    "Deep ruby": "#843F5B",
    "Deep saffron": "#FF9933",
    "Deep sky blue": "#00BFFF",
    "Deep Space Sparkle": "#4A646C",
    "Deep Taupe": "#7E5E60",
    "Deep Tuscan red": "#66424D",
    "Deer": "#BA8759",
    "Denim": "#1560BD",
    "Desert sand": "#EDC9AF",
    "Desire": "#EA3C53",
    "Diamond": "#B9F2FF",
    "Dim gray": "#696969",
    "Dirt": "#9B7653",
    "Dodger blue": "#1E90FF",
    "Dogwood rose": "#D71868",
    "Dollar bill": "#85BB65",
    "Donkey Brown": "#664C28",
    "Duke blue": "#00009C",
    "Dust storm": "#E5CCC9",
    "Dutch white": "#EFDFBB",
    "Earth yellow": "#E1A95F",
    "Ebony": "#555D50",
    "Eerie black": "#1B1B1B",
    "Eggplant": "#614051",
    "Eggshell": "#F0EAD6",
    "Egyptian blue": "#1034A6",
    "Electric blue": "#7DF9FF",
    "Electric crimson": "#FF003F",
    "Electric green": "#00FF00",
    "Electric indigo": "#6F00FF",
    "Electric lime": "#CCFF00",
    "Electric purple": "#BF00FF",
    "Electric ultramarine": "#3F00FF",
    "Electric yellow": "#FFFF00",
    "Emerald": "#50C878",
    "Eminence": "#6C3082",
    "English green": "#1B4D3E",
    "English lavender": "#B48395",
    "English red": "#AB4B52",
    "English violet": "#563C5C",
    "Eton blue": "#96C8A2",
    "Eucalyptus": "#44D7A8",
    "Falu red": "#801818",
    "Fandango": "#B53389",
    "Fandango pink": "#DE5285",
    "Fashion fuchsia": "#F400A1",
    "Fawn": "#E5AA70",
    "Feldgrau": "#4D5D53",
    "Fern green": "#4F7942",
    "Ferrari Red": "#FF2800",
    "Field drab": "#6C541E",
    "Firebrick": "#B22222",
    "Fire engine red": "#CE2029",
    "Flame": "#E25822",
    "Flamingo pink": "#FC8EAC",
    "Flavescent": "#F7E98E",
    "Flax": "#EEDC82",
    "Flirt": "#A2006D",
    "Floral white": "#FFFAF0",
    "Fluorescent orange": "#FFBF00",
    "Fluorescent pink": "#FF1493",
    "Folly": "#FF004F",
    "Forest green": "#014421",
    "Forest green (web)": "#228B22",
    "French bistre": "#856D4D",
    "French blue": "#0072BB",
    "French fuchsia": "#FD3F92",
    "French lilac": "#86608E",
    "French lime": "#9EFD38",
    "French pink": "#FD6C9E",
    "French puce": "#4E1609",
    "French raspberry": "#C72C48",
    "French rose": "#F64A8A",
    "French sky blue": "#77B5FE",
    "French violet": "#8806CE",
    "French wine": "#AC1E44",
    "Fresh Air": "#A6E7FF",
    "Fuchsia pink": "#FF77FF",
    "Fuchsia purple": "#CC397B",
    "Fuchsia rose": "#C74375",
    "Fulvous": "#E48400",
    "Fuzzy Wuzzy": "#CC6666",
    "Gainsboro": "#DCDCDC",
    "Gamboge": "#E49B0F",
    "Generic viridian": "#007F66",
    "Ghost white": "#F8F8FF",
    "Giants orange": "#FE5A1D",
    "Ginger": "#B06500",
    "Glaucous": "#6082B6",
    "Glitter": "#E6E8FA",
    "GO green": "#00AB66",
    "Gold (metallic)": "#D4AF37",
    "Gold (web) (Golden)": "#FFD700",
    "Gold Fusion": "#85754E",
    "Golden brown": "#996515",
    "Golden poppy": "#FCC200",
    "Golden yellow": "#FFDF00",
    "Goldenrod": "#DAA520",
    "Granny Smith Apple": "#A8E4A0",
    "Grape": "#6F2DA8",
    "Gray": "#808080",
    "Gray (X11 gray)": "#BEBEBE",
    "Gray-asparagus": "#465945",
    "Green (Crayola)": "#1CAC78",
    "Green": "#008000",
    "Green (Munsell)": "#00A877",
    "Green (NCS)": "#009F6B",
    "Green (pigment)": "#00A550",
    "Green (RYB)": "#66B032",
    "Green-yellow": "#ADFF2F",
    "Grullo": "#A99A86",
    "Halaya ube": "#663854",
    "Han blue": "#446CCF",
    "Han purple": "#5218FA",
    "Hansa yellow": "#E9D66B",
    "Harlequin": "#3FFF00",
    "Harvard crimson": "#C90016",
    "Harvest gold": "#DA9100",
    "Heliotrope": "#DF73FF",
    "Heliotrope gray": "#AA98A9",
    "Honeydew": "#F0FFF0",
    "Honolulu blue": "#006DB0",
    "Hooker's green": "#49796B",
    "Hot magenta": "#FF1DCE",
    "Hot pink": "#FF69B4",
    "Iceberg": "#71A6D2",
    "Icterine": "#FCF75E",
    "Illuminating Emerald": "#319177",
    "Imperial": "#602F6B",
    "Imperial blue": "#002395",
    "Imperial purple": "#66023C",
    "Imperial red": "#ED2939",
    "Inchworm": "#B2EC5D",
    "Independence": "#4C516D",
    "India green": "#138808",
    "Indian red": "#CD5C5C",
    "Indian yellow": "#E3A857",
    "Indigo": "#4B0082",
    "International Klein Blue": "#002FA7",
    "International orange (aerospace)": "#FF4F00",
    "International orange (engineering)": "#BA160C",
    "International orange (Golden Gate Bridge)": "#C0362C",
    "Iris": "#5A4FCF",
    "Isabelline": "#F4F0EC",
    "Islamic green": "#009000",
    "Italian sky blue": "#B2FFFF",
    "Ivory": "#FFFFF0",
    "Jade": "#00A86B",
    "Japanese carmine": "#9D2933",
    "Japanese indigo": "#264348",
    "Japanese violet": "#5B3256",
    "Jasper": "#D73B3E",
    "Jazzberry jam": "#A50B5E",
    "Jelly Bean": "#DA614E",
    "Jet": "#343434",
    "Jonquil": "#F4CA16",
    "Jordy blue": "#8AB9F1",
    "June bud": "#BDDA57",
    "Jungle green": "#29AB87",
    "Kelly green": "#4CBB17",
    "Kenyan copper": "#7C1C05",
    "Keppel": "#3AB09E",
    "Khaki": "#C3B091",
    "Kobi": "#E79FC4",
    "Kombu green": "#354230",
    "KU Crimson": "#E8000D",
    "La Salle Green": "#087830",
    "Languid lavender": "#D6CADD",
    "Lapis lazuli": "#26619C",
    "Laurel green": "#A9BA9D",
    "Lava": "#CF1020",
    "Lavender (floral)": "#B57EDC",
    "Lavender blue": "#CCCCFF",
    "Lavender blush": "#FFF0F5",
    "Lavender gray": "#C4C3D0",
    "Lavender indigo": "#9457EB",
    "Lavender magenta": "#EE82EE",
    "Lavender mist": "#E6E6FA",
    "Lavender pink": "#FBAED2",
    "Lavender purple": "#967BB6",
    "Lavender rose": "#FBA0E3",
    "Lawn green": "#7CFC00",
    "Lemon": "#FFF700",
    "Lemon chiffon": "#FFFACD",
    "Lemon curry": "#CCA01D",
    "Lemon glacier": "#FDFF00",
    "Lemon lime": "#E3FF00",
    "Lemon meringue": "#F6EABE",
    "Lemon yellow": "#FFF44F",
    "Licorice": "#1A1110",
    "Liberty": "#545AA7",
    "Light apricot": "#FDD5B1",
    "Light blue": "#ADD8E6",
    "Light brown": "#B5651D",
    "Light carmine pink": "#E66771",
    "Light coral": "#F08080",
    "Light cornflower blue": "#93CCEA",
    "Light crimson": "#F56991",
    "Light cyan": "#E0FFFF",
    "Light deep pink": "#FF5CCD",
    "Light French beige": "#C8AD7F",
    "Light fuchsia pink": "#F984EF",
    "Light goldenrod yellow": "#FAFAD2",
    "Light gray": "#D3D3D3",
    "Light green": "#90EE90",
    "Light hot pink": "#FFB3DE",
    "Light khaki": "#F0E68C",
    "Light medium orchid": "#D39BCB",
    "Light moss green": "#ADDFAD",
    "Light orchid": "#E6A8D7",
    "Light pastel purple": "#B19CD9",
    "Light pink": "#FFB6C1",
    "Light red ochre": "#E97451",
    "Light salmon": "#FFA07A",
    "Light salmon pink": "#FF9999",
    "Light sea green": "#20B2AA",
    "Light sky blue": "#87CEFA",
    "Light slate gray": "#778899",
    "Light steel blue": "#B0C4DE",
    "Light taupe": "#B38B6D",
    "Light yellow": "#FFFFE0",
    "Lilac": "#C8A2C8",
    "Lime": "#BFFF00",
    "Lime green": "#32CD32",
    "Limerick": "#9DC209",
    "Lincoln green": "#195905",
    "Linen": "#FAF0E6",
    "Little boy blue": "#6CA0DC",
    "Liver (dogs)": "#B86D29",
    "Liver": "#6C2E1F",
    "Liver chestnut": "#987456",
    "Lumber": "#FFE4CD",
    "Lust": "#E62020",
    "Magenta": "#FF00FF",
    "Magenta (dye)": "#CA1F7B",
    "Magenta (Pantone)": "#D0417E",
    "Magenta (process)": "#FF0090",
    "Magenta haze": "#9F4576",
    "Magic mint": "#AAF0D1",
    "Magnolia": "#F8F4FF",
    "Mahogany": "#C04000",
    "Majorelle Blue": "#6050DC",
    "Malachite": "#0BDA51",
    "Manatee": "#979AAA",
    "Mango Tango": "#FF8243",
    "Mantis": "#74C365",
    "Mardi Gras": "#880085",
    "Maroon": "#800000",
    "Mauve": "#E0B0FF",
    "Mauve taupe": "#915F6D",
    "Mauvelous": "#EF98AA",
    "May green": "#4C9141",
    "Maya blue": "#73C2FB",
    "Meat brown": "#E5B73B",
    "Medium aquamarine": "#66DDAA",
    "Medium blue": "#0000CD",
    "Medium candy apple red": "#E2062C",
    "Medium carmine": "#AF4035",
    "Medium electric blue": "#035096",
    "Medium jungle green": "#1C352D",
    "Medium orchid": "#BA55D3",
    "Medium purple": "#9370DB",
    "Medium red-violet": "#BB3385",
    "Medium ruby": "#AA4069",
    "Medium sea green": "#3CB371",
    "Medium sky blue": "#80DAEB",
    "Medium slate blue": "#7B68EE",
    "Medium spring bud": "#C9DC87",
    "Medium spring green": "#00FA9A",
    "Medium taupe": "#674C47",
    "Medium turquoise": "#48D1CC",
    "Pale vermilion": "#D9603B",
    "Mellow apricot": "#F8B878",
    "Mellow yellow": "#F8DE7E",
    "Melon": "#FDBCB4",
    "Metallic Seaweed": "#0A7E8C",
    "Metallic Sunburst": "#9C7C38",
    "Mexican pink": "#E4007C",
    "Midnight blue": "#191970",
    "Midnight green (eagle green)": "#004953",
    "Mikado yellow": "#FFC40C",
    "Mindaro": "#E3F988",
    "Mint": "#3EB489",
    "Mint cream": "#F5FFFA",
    "Mint green": "#98FF98",
    "Misty rose": "#FFE4E1",
    "Moonstone blue": "#73A9C2",
    "Mordant red 19": "#AE0C00",
    "Moss green": "#8A9A5B",
    "Mountain Meadow": "#30BA8F",
    "Mountbatten pink": "#997A8D",
    "MSU Green": "#18453B",
    "Mughal green": "#306030",
    "Mulberry": "#C54B8C",
    "Mustard": "#FFDB58",
    "Myrtle green": "#317873",
    "Nadeshiko pink": "#F6ADC6",
    "Napier green": "#2A8000",
    "Navajo white": "#FFDEAD",
    "Navy": "#000080",
    "Neon Carrot": "#FFA343",
    "Neon fuchsia": "#FE4164",
    "Neon green": "#39FF14",
    "New Car": "#214FC6",
    "New York pink": "#D7837F",
    "Non-photo blue": "#A4DDED",
    "North Texas Green": "#059033",
    "Nyanza": "#E9FFDB",
    "Ocean Boat Blue": "#0077BE",
    "Ochre": "#CC7722",
    "Old burgundy": "#43302E",
    "Old gold": "#CFB53B",
    "Old lace": "#FDF5E6",
    "Old lavender": "#796878",
    "Old mauve": "#673147",
    "Old moss green": "#867E36",
    "Old rose": "#C08081",
    "Olive": "#808000",
    "Olive Drab #3": "#6B8E23",
    "Olive Drab #7": "#3C341F",
    "Olivine": "#9AB973",
    "Onyx": "#353839",
    "Opera mauve": "#B784A7",
    "Orange": "#FF7F00",
    "Orange (Crayola)": "#FF7538",
    "Orange (Pantone)": "#FF5800",
    "Orange (RYB)": "#FB9902",
    "Orange (web)": "#FFA500",
    "Orange peel": "#FF9F00",
    "Orange-red": "#FF4500",
    "Orchid": "#DA70D6",
    "Orchid pink": "#F2BDCD",
    "Orioles orange": "#FB4F14",
    "Outer Space": "#414A4C",
    "Outrageous Orange": "#FF6E4A",
    "Oxford Blue": "#002147",
    "Crimson Red": "#990000",
    "Pakistan green": "#006600",
    "Palatinate blue": "#273BE2",
    "Palatinate purple": "#682860",
    "Pale aqua": "#BCD4E6",
    "Pale blue": "#AFEEEE",
    "Pale brown": "#987654",
    "Pale cerulean": "#9BC4E2",
    "Pale chestnut": "#DDADAF",
    "Pale copper": "#DA8A67",
    "Pale cornflower blue": "#ABCDEF",
    "Pale gold": "#E6BE8A",
    "Pale goldenrod": "#EEE8AA",
    "Pale green": "#98FB98",
    "Pale lavender": "#DCD0FF",
    "Pale magenta": "#F984E5",
    "Pale pink": "#FADADD",
    "Pale plum": "#DDA0DD",
    "Pale red-violet": "#DB7093",
    "Pale robin egg blue": "#96DED1",
    "Pale silver": "#C9C0BB",
    "Pale spring bud": "#ECEBBD",
    "Pale taupe": "#BC987E",
    "Pansy purple": "#78184A",
    "Paolo Veronese green": "#009B7D",
    "Papaya whip": "#FFEFD5",
    "Paradise pink": "#E63E62",
    "Pastel blue": "#AEC6CF",
    "Pastel brown": "#836953",
    "Pastel gray": "#CFCFC4",
    "Pastel green": "#77DD77",
    "Pastel magenta": "#F49AC2",
    "Pastel orange": "#FFB347",
    "Pastel pink": "#DEA5A4",
    "Pastel purple": "#B39EB5",
    "Pastel red": "#FF6961",
    "Pastel violet": "#CB99C9",
    "Pastel yellow": "#FDFD96",
    "Peach": "#FFE5B4",
    "Peach-orange": "#FFCC99",
    "Peach puff": "#FFDAB9",
    "Peach-yellow": "#FADFAD",
    "Pear": "#D1E231",
    "Pearl": "#EAE0C8",
    "Pearl Aqua": "#88D8C0",
    "Pearly purple": "#B768A2",
    "Peridot": "#E6E200",
    "Persian blue": "#1C39BB",
    "Persian green": "#00A693",
    "Persian indigo": "#32127A",
    "Persian orange": "#D99058",
    "Persian pink": "#F77FBE",
    "Persian plum": "#701C1C",
    "Persian red": "#CC3333",
    "Persian rose": "#FE28A2",
    "Persimmon": "#EC5800",
    "Peru": "#CD853F",
    "Phthalo blue": "#000F89",
    "Phthalo green": "#123524",
    "Picton blue": "#45B1E8",
    "Pictorial carmine": "#C30B4E",
    "Piggy pink": "#FDDDE6",
    "Pine green": "#01796F",
    "Pink": "#FFC0CB",
    "Pink (Pantone)": "#D74894",
    "Pink lace": "#FFDDF4",
    "Pink lavender": "#D8B2D1",
    "Pink-orange": "#FF9966",
    "Pink pearl": "#E7ACCF",
    "Pink Sherbet": "#F78FA7",
    "Pistachio": "#93C572",
    "Platinum": "#E5E4E2",
    "Plum": "#8E4585",
    "Popstar": "#BE4F62",
    "Portland Orange": "#FF5A36",
    "Powder blue": "#B0E0E6",
    "Princeton orange": "#FF8F00",
    "Prussian blue": "#003153",
    "Psychedelic purple": "#DF00FF",
    "Puce": "#CC8899",
    "Pullman Brown (UPS Brown)": "#644117",
    "Pumpkin": "#FF7518",
    "Deep purple": "#800080",
    "Purple (Munsell)": "#9F00C5",
    "Purple": "#A020F0",
    "Purple Heart": "#69359C",
    "Purple mountain majesty": "#9678B6",
    "Purple navy": "#4E5180",
    "Purple pizzazz": "#FE4EDA",
    "Purple taupe": "#50404D",
    "Purpureus": "#9A4EAE",
    "Quartz": "#51484F",
    "Queen blue": "#436B95",
    "Queen pink": "#E8CCD7",
    "Quinacridone magenta": "#8E3A59",
    "Radical Red": "#FF355E",
    "Rajah": "#FBAB60",
    "Raspberry": "#E30B5D",
    "Raspberry pink": "#E25098",
    "Raspberry rose": "#B3446C",
    "Raw umber": "#826644",
    "Razzle dazzle rose": "#FF33CC",
    "Razzmatazz": "#E3256B",
    "Razzmic Berry": "#8D4E85",
    "Red": "#FF0000",
    "Red (Crayola)": "#EE204D",
    "Red (Munsell)": "#F2003C",
    "Red (NCS)": "#C40233",
    "Red (pigment)": "#ED1C24",
    "Red (RYB)": "#FE2712",
    "Red-brown": "#A52A2A",
    "Red devil": "#860111",
    "Red-orange": "#FF5349",
    "Red-purple": "#E40078",
    "Red-violet": "#C71585",
    "Redwood": "#A45A52",
    "Regalia": "#522D80",
    "Resolution blue": "#002387",
    "Rhythm": "#777696",
    "Rich black": "#004040",
    "Rich brilliant lavender": "#F1A7FE",
    "Rich carmine": "#D70040",
    "Rich electric blue": "#0892D0",
    "Rich lavender": "#A76BCF",
    "Rich lilac": "#B666D2",
    "Rich maroon": "#B03060",
    "Rifle green": "#444C38",
    "Deep Roast coffee": "#704241",
    "Robin egg blue": "#00CCCC",
    "Rocket metallic": "#8A7F80",
    "Roman silver": "#838996",
    "Rose bonbon": "#F9429E",
    "Rose ebony": "#674846",
    "Rose gold": "#B76E79",
    "Rose pink": "#FF66CC",
    "Rose red": "#C21E56",
    "Rose taupe": "#905D5D",
    "Rose vale": "#AB4E52",
    "Rosewood": "#65000B",
    "Rosso corsa": "#D40000",
    "Rosy brown": "#BC8F8F",
    "Royal azure": "#0038A8",
    "Royal blue": "#002366",
    "Royal light blue": "#4169E1",
    "Royal fuchsia": "#CA2C92",
    "Royal purple": "#7851A9",
    "Royal yellow": "#FADA5E",
    "Ruber": "#CE4676",
    "Rubine red": "#D10056",
    "Ruby": "#E0115F",
    "Ruby red": "#9B111E",
    "Ruddy": "#FF0028",
    "Ruddy brown": "#BB6528",
    "Ruddy pink": "#E18E96",
    "Rufous": "#A81C07",
    "Russet": "#80461B",
    "Russian green": "#679267",
    "Russian violet": "#32174D",
    "Rust": "#B7410E",
    "Rusty red": "#DA2C43",
    "Saddle brown": "#8B4513",
    "Safety orange (blaze orange)": "#FF6700",
    "Safety yellow": "#EED202",
    "Saffron": "#F4C430",
    "Sage": "#BCB88A",
    "St. Patrick's blue": "#23297A",
    "Salmon": "#FA8072",
    "Salmon pink": "#FF91A4",
    "Sand": "#C2B280",
    "Sandstorm": "#ECD540",
    "Sandy brown": "#F4A460",
    "Sangria": "#92000A",
    "Sap green": "#507D2A",
    "Sapphire": "#0F52BA",
    "Sapphire blue": "#0067A5",
    "Satin sheen gold": "#CBA135",
    "Scarlet": "#FF2400",
    "School bus yellow": "#FFD800",
    "Screamin' Green": "#76FF7A",
    "Sea blue": "#006994",
    "Sea green": "#2E8B57",
    "Seal brown": "#321414",
    "Seashell": "#FFF5EE",
    "Selective yellow": "#FFBA00",
    "Sepia": "#704214",
    "Shadow": "#8A795D",
    "Shadow blue": "#778BA5",
    "Shampoo": "#FFCFF1",
    "Shamrock green": "#009E60",
    "Sheen Green": "#8FD400",
    "Shimmering Blush": "#D98695",
    "Shocking pink": "#FC0FC0",
    "Sienna": "#882D17",
    "Silver": "#C0C0C0",
    "Silver chalice": "#ACACAC",
    "Silver Lake blue": "#5D89BA",
    "Silver pink": "#C4AEAD",
    "Silver sand": "#BFC1C2",
    "Sinopia": "#CB410B",
    "Skobeloff": "#007474",
    "Sky blue": "#87CEEB",
    "Sky magenta": "#CF71AF",
    "Slate blue": "#6A5ACD",
    "Slate gray": "#708090",
    "Smitten": "#C84186",
    "Smoke": "#738276",
    "Smokey topaz": "#933D41",
    "Smoky black": "#100C08",
    "Snow": "#FFFAFA",
    "Soap": "#CEC8EF",
    "Solid pink": "#893843",
    "Sonic silver": "#757575",
    "Spartan Crimson": "#9E1316",
    "Space cadet": "#1D2951",
    "Spanish bistre": "#807532",
    "Spanish blue": "#0070B8",
    "Spanish carmine": "#D10047",
    "Spanish crimson": "#E51A4C",
    "Spanish gray": "#989898",
    "Spanish green": "#009150",
    "Spanish orange": "#E86100",
    "Spanish pink": "#F7BFBE",
    "Spanish red": "#E60026",
    "Spanish violet": "#4C2882",
    "Spanish viridian": "#007F5C",
    "Spiro Disco Ball": "#0FC0FC",
    "Spring bud": "#A7FC00",
    "Spring green": "#00FF7F",
    "Star command blue": "#007BB8",
    "Steel blue": "#4682B4",
    "Steel pink": "#CC33CC",
    "Stormcloud": "#4F666A",
    "Straw": "#E4D96F",
    "Strawberry": "#FC5A8D",
    "Sunglow": "#FFCC33",
    "Sunray": "#E3AB57",
    "Sunset": "#FAD6A5",
    "Sunset orange": "#FD5E53",
    "Super pink": "#CF6BA9",
    "Tan": "#D2B48C",
    "Tangelo": "#F94D00",
    "Tangerine": "#F28500",
    "Tangerine yellow": "#FFCC00",
    "Dark Grayish Brown": "#483C32",
    "Taupe gray": "#8B8589",
    "Tea green": "#D0F0C0",
    "Tea rose": "#F4C2C2",
    "Teal": "#008080",
    "Teal blue": "#367588",
    "Teal deer": "#99E6B3",
    "Teal green": "#00827F",
    "Telemagenta": "#CF3476",
    "Tenne": "#CD5700",
    "Terra cotta": "#E2725B",
    "Thistle": "#D8BFD8",
    "Thulian pink": "#DE6FA1",
    "Tickle Me Pink": "#FC89AC",
    "Tiffany Blue": "#0ABAB5",
    "Tiger's eye": "#E08D3C",
    "Timberwolf": "#DBD7D2",
    "Titanium yellow": "#EEE600",
    "Tomato": "#FF6347",
    "Toolbox": "#746CC0",
    "Toothpaste advert green": "#42B72A",
    "Topaz": "#FFC87C",
    "Tractor red": "#FD0E35",
    "Tropical rain forest": "#00755E",
    "True Blue": "#0073CF",
    "Tufts Blue": "#417DC1",
    "Tulip": "#FF878D",
    "Tumbleweed": "#DEAA88",
    "Turkish rose": "#B57281",
    "Turquoise": "#40E0D0",
    "Turquoise blue": "#00FFEF",
    "Turquoise green": "#A0D6B4",
    "Tuscan red": "#7C4848",
    "Tuscany": "#C09999",
    "Twilight lavender": "#8A496B",
    "UA blue": "#0033AA",
    "UA red": "#D9004C",
    "Ube": "#8878C3",
    "UCLA Blue": "#536895",
    "UCLA Gold": "#FFB300",
    "UFO Green": "#3CD070",
    "Ultramarine": "#120A8F",
    "Ultramarine blue": "#4166F5",
    "Ultra pink": "#FF6FFF",
    "Umber": "#635147",
    "Unbleached silk": "#FFDDCA",
    "United Nations blue": "#5B92E5",
    "University of California Gold": "#B78727",
    "Unmellow yellow": "#FFFF66",
    "UP Maroon": "#7B1113",
    "Upsdell red": "#AE2029",
    "Urobilin": "#E1AD21",
    "USAFA blue": "#004F98",
    "University of Tennessee Orange": "#F77F00",
    "Utah Crimson": "#D3003F",
    "Vanilla": "#F3E5AB",
    "Vanilla ice": "#F38FA9",
    "Vegas gold": "#C5B358",
    "Venetian red": "#C80815",
    "Verdigris": "#43B3AE",
    "Medium vermilion": "#E34234",
    "Vermilion": "#D9381E",
    "Violet": "#8F00FF",
    "Violet (color wheel)": "#7F00FF",
    "Violet (RYB)": "#8601AF",
    "Violet-blue": "#324AB2",
    "Violet-red": "#F75394",
    "Viridian": "#40826D",
    "Viridian green": "#009698",
    "Vivid auburn": "#922724",
    "Vivid burgundy": "#9F1D35",
    "Vivid cerise": "#DA1D81",
    "Vivid orchid": "#CC00FF",
    "Vivid sky blue": "#00CCFF",
    "Vivid tangerine": "#FFA089",
    "Vivid violet": "#9F00FF",
    "Warm black": "#004242",
    "Waterspout": "#A4F4F9",
    "Wenge": "#645452",
    "Wheat": "#F5DEB3",
    "White": "#FFFFFF",
    "White smoke": "#F5F5F5",
    "Wild blue yonder": "#A2ADD0",
    "Wild orchid": "#D470A2",
    "Wild Strawberry": "#FF43A4",
    "Wild watermelon": "#FC6C85",
    "Willpower orange": "#FD5800",
    "Windsor tan": "#A75502",
    "Wine": "#722F37",
    "Wisteria": "#C9A0DC",
    "Wood brown": "#C19A6B",
    "Xanadu": "#738678",
    "Yale Blue": "#0F4D92",
    "Yankees blue": "#1C2841",
    "Yellow (Crayola)": "#FCE883",
    "Yellow (Munsell)": "#EFCC00",
    "Yellow (Pantone)": "#FEDF00",
    "Yellow": "#FEFE33",
    "Yellow Green": "#9ACD32",
    "Yellow Orange": "#FFAE42",
    "Yellow rose": "#FFF000",
    "Zaffre": "#0014A8",
    "Zinnwaldite brown": "#2C1608",
    "Zomp": "#39A78E",
};