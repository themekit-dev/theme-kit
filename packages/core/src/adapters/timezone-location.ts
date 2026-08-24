/**
 * IANA timezone → approximate coordinates resolution.
 *
 * Solar time needs a location (latitude/longitude). Instead of forcing every
 * consumer to configure coordinates, Theme Kit can derive them from the
 * visitor's IANA timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`):
 * each zone is anchored to the reference city the tz database uses for its
 * rules, which is accurate enough for sunrise/sunset switching.
 *
 * The map below mirrors the reference coordinates of `zone.tab` (IANA tzdb).
 */

/** `latitude, longitude` tuple. */
export type TimeZoneLocation = [latitude: number, longitude: number];

/** Fallback used when nothing else can be resolved (New York). */
export const DEFAULT_TIMEZONE_LOCATION: TimeZoneLocation = [40.7128, -74.006];

const TIMEZONE_LOCATIONS: Record<string, TimeZoneLocation> = {
  // Africa
  "Africa/Abidjan": [5.36, -4.02],
  "Africa/Accra": [5.56, -0.22],
  "Africa/Addis_Ababa": [9.03, 38.75],
  "Africa/Algiers": [36.75, 3.06],
  "Africa/Asmara": [15.33, 38.93],
  "Africa/Bamako": [12.65, -8.0],
  "Africa/Bangui": [4.37, 18.58],
  "Africa/Banjul": [13.46, -16.65],
  "Africa/Bissau": [11.86, -15.6],
  "Africa/Blantyre": [-15.79, 35.01],
  "Africa/Brazzaville": [-4.27, 15.28],
  "Africa/Bujumbura": [-3.38, 29.36],
  "Africa/Cairo": [30.05, 31.25],
  "Africa/Casablanca": [33.57, -7.58],
  "Africa/Ceuta": [35.88, -5.32],
  "Africa/Conakry": [9.54, -13.68],
  "Africa/Dakar": [14.69, -17.45],
  "Africa/Dar_es_Salaam": [-6.8, 39.28],
  "Africa/Djibouti": [11.59, 43.15],
  "Africa/Douala": [4.05, 9.7],
  "Africa/El_Aaiun": [27.15, -13.2],
  "Africa/Freetown": [8.48, -13.24],
  "Africa/Gaborone": [-24.65, 25.91],
  "Africa/Harare": [-17.83, 31.05],
  "Africa/Johannesburg": [-26.2, 28.05],
  "Africa/Juba": [4.85, 31.58],
  "Africa/Kampala": [0.32, 32.58],
  "Africa/Khartoum": [15.6, 32.53],
  "Africa/Kigali": [-1.95, 30.06],
  "Africa/Kinshasa": [-4.32, 15.31],
  "Africa/Lagos": [6.45, 3.39],
  "Africa/Libreville": [0.39, 9.45],
  "Africa/Lome": [6.14, 1.21],
  "Africa/Luanda": [-8.84, 13.23],
  "Africa/Lubumbashi": [-11.66, 27.48],
  "Africa/Lusaka": [-15.42, 28.28],
  "Africa/Malabo": [3.75, 8.78],
  "Africa/Maputo": [-25.97, 32.57],
  "Africa/Maseru": [-29.32, 27.48],
  "Africa/Mbabane": [-26.32, 31.13],
  "Africa/Mogadishu": [2.07, 45.34],
  "Africa/Monrovia": [6.31, -10.8],
  "Africa/Nairobi": [-1.28, 36.82],
  "Africa/Ndjamena": [12.11, 15.04],
  "Africa/Niamey": [13.51, 2.11],
  "Africa/Nouakchott": [18.09, -15.98],
  "Africa/Ouagadougou": [12.37, -1.53],
  "Africa/Porto-Novo": [6.5, 2.6],
  "Africa/Sao_Tome": [0.34, 6.73],
  "Africa/Tripoli": [32.9, 13.19],
  "Africa/Tunis": [36.8, 10.18],
  "Africa/Windhoek": [-22.57, 17.08],

  // America
  "America/Adak": [51.88, -176.65],
  "America/Anchorage": [61.22, -149.9],
  "America/Anguilla": [18.22, -63.05],
  "America/Antigua": [17.12, -61.85],
  "America/Araguaina": [-7.19, -48.21],
  "America/Argentina/Buenos_Aires": [-34.6, -58.38],
  "America/Argentina/Catamarca": [-28.47, -65.79],
  "America/Argentina/Cordoba": [-31.4, -64.18],
  "America/Argentina/Jujuy": [-24.19, -65.3],
  "America/Argentina/La_Rioja": [-29.41, -66.86],
  "America/Argentina/Mendoza": [-32.89, -68.84],
  "America/Argentina/Rio_Gallegos": [-51.62, -69.22],
  "America/Argentina/Salta": [-24.79, -65.41],
  "America/Argentina/San_Juan": [-31.54, -68.53],
  "America/Argentina/San_Luis": [-33.3, -66.34],
  "America/Argentina/Tucuman": [-26.82, -65.22],
  "America/Argentina/Ushuaia": [-54.8, -68.31],
  "America/Aruba": [12.52, -70.03],
  "America/Asuncion": [-25.27, -57.63],
  "America/Atikokan": [48.75, -91.62],
  "America/Bahia": [-12.98, -38.52],
  "America/Bahia_Banderas": [20.8, -105.25],
  "America/Barbados": [13.1, -59.62],
  "America/Belem": [-1.46, -48.5],
  "America/Belize": [17.5, -88.2],
  "America/Blanc-Sablon": [51.43, -57.13],
  "America/Boa_Vista": [2.82, -60.67],
  "America/Bogota": [4.6, -74.08],
  "America/Boise": [43.6, -116.2],
  "America/Cambridge_Bay": [69.11, -105.06],
  "America/Campo_Grande": [-20.45, -54.62],
  "America/Cancun": [21.08, -86.77],
  "America/Caracas": [10.5, -66.93],
  "America/Cayenne": [4.94, -52.33],
  "America/Cayman": [19.3, -81.38],
  "America/Chicago": [41.85, -87.65],
  "America/Chihuahua": [28.63, -106.07],
  "America/Ciudad_Juarez": [31.66, -106.43],
  "America/Costa_Rica": [9.93, -84.08],
  "America/Creston": [49.1, -116.51],
  "America/Cuiaba": [-15.6, -56.1],
  "America/Curacao": [12.12, -68.93],
  "America/Danmarkshavn": [76.77, -18.67],
  "America/Dawson": [64.06, -139.43],
  "America/Dawson_Creek": [59.77, -120.24],
  "America/Denver": [39.74, -104.98],
  "America/Detroit": [42.33, -83.05],
  "America/Dominica": [15.3, -61.39],
  "America/Edmonton": [53.55, -113.49],
  "America/Eirunepe": [-6.66, -69.87],
  "America/El_Salvador": [13.69, -89.19],
  "America/Fort_Nelson": [58.81, -122.7],
  "America/Fortaleza": [-3.72, -38.54],
  "America/Glace_Bay": [46.2, -59.97],
  "America/Goose_Bay": [53.3, -60.42],
  "America/Grand_Turk": [21.47, -71.14],
  "America/Grenada": [12.05, -61.75],
  "America/Guadeloupe": [16.27, -61.53],
  "America/Guatemala": [14.63, -90.52],
  "America/Guayaquil": [-2.17, -79.92],
  "America/Guyana": [6.8, -58.16],
  "America/Halifax": [44.65, -63.58],
  "America/Havana": [23.13, -82.37],
  "America/Hermosillo": [29.07, -110.96],
  "America/Indiana/Indianapolis": [39.77, -86.16],
  "America/Indiana/Knox": [41.3, -86.62],
  "America/Indiana/Marengo": [38.38, -86.34],
  "America/Indiana/Petersburg": [38.49, -87.28],
  "America/Indiana/Tell_City": [37.95, -86.76],
  "America/Indiana/Vevay": [38.75, -85.07],
  "America/Indiana/Vincennes": [38.68, -87.53],
  "America/Indiana/Winamac": [41.05, -86.6],
  "America/Inuvik": [68.36, -133.71],
  "America/Iqaluit": [63.75, -68.52],
  "America/Jamaica": [17.97, -76.79],
  "America/Juneau": [58.3, -134.42],
  "America/Kentucky/Louisville": [38.25, -85.77],
  "America/Kentucky/Monticello": [36.83, -84.85],
  "America/La_Paz": [-16.5, -68.15],
  "America/Lima": [-12.05, -77.05],
  "America/Los_Angeles": [34.05, -118.24],
  "America/Lower_Princes": [18.05, -63.05],
  "America/Maceio": [-9.67, -35.74],
  "America/Managua": [12.15, -86.27],
  "America/Manaus": [-3.13, -60.02],
  "America/Marigot": [18.07, -63.08],
  "America/Martinique": [14.6, -61.07],
  "America/Matamoros": [25.87, -97.5],
  "America/Mazatlan": [23.23, -106.42],
  "America/Menominee": [45.1, -87.62],
  "America/Merida": [20.97, -89.62],
  "America/Metlakatla": [55.13, -131.57],
  "America/Mexico_City": [19.43, -99.13],
  "America/Miquelon": [47.05, -56.38],
  "America/Moncton": [46.1, -64.78],
  "America/Monterrey": [25.67, -100.32],
  "America/Montevideo": [-34.9, -56.22],
  "America/Montserrat": [16.7, -62.22],
  "America/Nassau": [25.05, -77.47],
  "America/New_York": [40.71, -74.01],
  "America/Nipigon": [49.02, -88.27],
  "America/Nome": [64.5, -165.4],
  "America/Noronha": [-3.85, -32.42],
  "America/North_Dakota/Beulah": [47.26, -101.78],
  "America/North_Dakota/Center": [47.12, -101.3],
  "America/North_Dakota/New_Salem": [46.84, -100.49],
  "America/Nuuk": [64.18, -51.72],
  "America/Ojinaga": [29.57, -104.52],
  "America/Panama": [8.97, -79.52],
  "America/Pangnirtung": [66.15, -65.7],
  "America/Paramaribo": [5.87, -55.17],
  "America/Phoenix": [33.45, -112.07],
  "America/Port-au-Prince": [18.54, -72.34],
  "America/Port_of_Spain": [10.65, -61.52],
  "America/Porto_Velho": [-8.76, -63.9],
  "America/Puerto_Rico": [18.47, -66.11],
  "America/Punta_Arenas": [-53.15, -70.92],
  "America/Rainy_River": [48.72, -94.57],
  "America/Rankin_Inlet": [62.82, -92.08],
  "America/Recife": [-8.05, -34.9],
  "America/Regina": [50.45, -104.62],
  "America/Resolute": [74.7, -94.98],
  "America/Rio_Branco": [-9.97, -67.8],
  "America/Santarem": [-2.44, -54.7],
  "America/Santiago": [-33.45, -70.66],
  "America/Santo_Domingo": [18.47, -69.89],
  "America/Sao_Paulo": [-23.55, -46.63],
  "America/Scoresbysund": [70.48, -21.97],
  "America/Sitka": [57.17, -135.3],
  "America/St_Barthelemy": [17.9, -62.85],
  "America/St_Johns": [47.57, -52.71],
  "America/St_Kitts": [17.3, -62.72],
  "America/St_Lucia": [14.0, -60.99],
  "America/St_Thomas": [18.34, -64.93],
  "America/St_Vincent": [13.16, -61.23],
  "America/Swift_Current": [50.28, -107.8],
  "America/Tegucigalpa": [14.1, -87.2],
  "America/Thule": [76.57, -68.78],
  "America/Thunder_Bay": [48.38, -89.25],
  "America/Tijuana": [32.5, -117.02],
  "America/Toronto": [43.65, -79.38],
  "America/Tortola": [18.43, -64.62],
  "America/Vancouver": [49.25, -123.12],
  "America/Whitehorse": [60.72, -135.06],
  "America/Winnipeg": [49.88, -97.15],
  "America/Yakutat": [59.55, -139.73],
  "America/Yellowknife": [62.45, -114.37],

  // Antarctica
  "Antarctica/Casey": [-66.28, 110.52],
  "Antarctica/Davis": [-68.58, 77.97],
  "Antarctica/DumontDUrville": [-66.66, 140.0],
  "Antarctica/Macquarie": [-54.5, 158.95],
  "Antarctica/Mawson": [-67.6, 62.87],
  "Antarctica/McMurdo": [-77.84, 166.67],
  "Antarctica/Palmer": [-64.77, -64.05],
  "Antarctica/Rothera": [-67.57, -68.13],
  "Antarctica/Syowa": [-69.0, 39.58],
  "Antarctica/Troll": [-72.0, 2.53],
  "Antarctica/Vostok": [-78.46, 106.87],

  // Arctic
  "Arctic/Longyearbyen": [78.22, 15.63],

  // Asia
  "Asia/Aden": [12.78, 45.04],
  "Asia/Almaty": [43.25, 76.95],
  "Asia/Amman": [31.95, 35.93],
  "Asia/Anadyr": [64.75, 177.48],
  "Asia/Aqtau": [44.52, 50.26],
  "Asia/Aqtobe": [50.28, 57.17],
  "Asia/Ashgabat": [37.95, 58.38],
  "Asia/Atyrau": [47.12, 51.88],
  "Asia/Baghdad": [33.34, 44.39],
  "Asia/Bahrain": [26.27, 50.55],
  "Asia/Baku": [40.38, 49.89],
  "Asia/Bangkok": [13.75, 100.52],
  "Asia/Barnaul": [53.36, 83.76],
  "Asia/Beirut": [33.89, 35.5],
  "Asia/Bishkek": [42.87, 74.59],
  "Asia/Brunei": [4.94, 114.93],
  "Asia/Chita": [52.05, 113.47],
  "Asia/Choibalsan": [48.08, 114.5],
  "Asia/Colombo": [6.93, 79.85],
  "Asia/Damascus": [33.51, 36.29],
  "Asia/Dhaka": [23.71, 90.41],
  "Asia/Dili": [-8.55, 125.57],
  "Asia/Dubai": [25.06, 55.17],
  "Asia/Dushanbe": [38.54, 68.77],
  "Asia/Famagusta": [35.12, 33.94],
  "Asia/Gaza": [31.5, 34.47],
  "Asia/Hebron": [31.53, 35.1],
  "Asia/Ho_Chi_Minh": [10.78, 106.7],
  "Asia/Hong_Kong": [22.3, 114.17],
  "Asia/Hovd": [48.0, 91.63],
  "Asia/Irkutsk": [52.27, 104.35],
  "Asia/Jakarta": [-6.17, 106.83],
  "Asia/Jayapura": [-2.53, 140.72],
  "Asia/Jerusalem": [31.78, 35.22],
  "Asia/Kabul": [34.53, 69.17],
  "Asia/Kamchatka": [53.02, 158.65],
  "Asia/Karachi": [24.87, 67.01],
  "Asia/Kathmandu": [27.72, 85.32],
  "Asia/Khandyga": [62.66, 135.21],
  "Asia/Kolkata": [22.57, 88.37],
  "Asia/Krasnoyarsk": [56.01, 92.83],
  "Asia/Kuala_Lumpur": [3.16, 101.7],
  "Asia/Kuching": [1.53, 110.34],
  "Asia/Kuwait": [29.3, 47.93],
  "Asia/Macau": [22.2, 113.55],
  "Asia/Magadan": [59.57, 150.8],
  "Asia/Makassar": [-5.19, 119.42],
  "Asia/Manila": [14.6, 120.98],
  "Asia/Muscat": [23.61, 58.59],
  "Asia/Nicosia": [35.17, 33.37],
  "Asia/Novokuznetsk": [53.75, 87.11],
  "Asia/Novosibirsk": [55.04, 82.9],
  "Asia/Omsk": [55.0, 73.4],
  "Asia/Oral": [51.23, 51.37],
  "Asia/Phnom_Penh": [11.55, 104.92],
  "Asia/Pontianak": [-0.03, 109.32],
  "Asia/Pyongyang": [39.03, 125.76],
  "Asia/Qatar": [25.29, 51.53],
  "Asia/Qostanay": [53.21, 63.62],
  "Asia/Qyzylorda": [44.85, 65.52],
  "Asia/Riyadh": [24.69, 46.72],
  "Asia/Sakhalin": [46.96, 142.73],
  "Asia/Samarkand": [39.65, 66.97],
  "Asia/Seoul": [37.57, 126.98],
  "Asia/Shanghai": [31.23, 121.47],
  "Asia/Singapore": [1.35, 103.82],
  "Asia/Srednekolymsk": [67.47, 153.71],
  "Asia/Taipei": [25.05, 121.5],
  "Asia/Tashkent": [41.32, 69.3],
  "Asia/Tbilisi": [41.69, 44.83],
  "Asia/Tehran": [35.68, 51.42],
  "Asia/Thimphu": [27.47, 89.63],
  "Asia/Tokyo": [35.68, 139.77],
  "Asia/Tomsk": [56.5, 84.97],
  "Asia/Ulaanbaatar": [47.91, 106.88],
  "Asia/Urumqi": [43.82, 87.6],
  "Asia/Ust-Nera": [64.56, 143.24],
  "Asia/Vientiane": [17.97, 102.6],
  "Asia/Vladivostok": [43.16, 131.89],
  "Asia/Yakutsk": [62.03, 129.68],
  "Asia/Yangon": [16.78, 96.17],
  "Asia/Yekaterinburg": [56.84, 60.65],
  "Asia/Yerevan": [40.18, 44.51],

  // Atlantic
  "Atlantic/Azores": [37.74, -25.67],
  "Atlantic/Bermuda": [32.29, -64.78],
  "Atlantic/Canary": [28.29, -16.63],
  "Atlantic/Cape_Verde": [14.91, -23.51],
  "Atlantic/Faroe": [62.01, -6.77],
  "Atlantic/Madeira": [32.63, -16.9],
  "Atlantic/Reykjavik": [64.15, -21.94],
  "Atlantic/South_Georgia": [-54.28, -36.51],
  "Atlantic/St_Helena": [-15.93, -5.72],
  "Atlantic/Stanley": [-51.7, -57.85],

  // Australia
  "Australia/Adelaide": [-34.93, 138.6],
  "Australia/Brisbane": [-27.47, 153.03],
  "Australia/Broken_Hill": [-31.95, 141.47],
  "Australia/Darwin": [-12.46, 130.84],
  "Australia/Eucla": [-31.68, 128.88],
  "Australia/Hobart": [-42.88, 147.33],
  "Australia/Lindeman": [-20.31, 149.04],
  "Australia/Lord_Howe": [-31.55, 159.08],
  "Australia/Melbourne": [-37.82, 144.97],
  "Australia/Perth": [-31.95, 115.86],
  "Australia/Sydney": [-33.87, 151.21],

  // Europe
  "Europe/Amsterdam": [52.37, 4.9],
  "Europe/Andorra": [42.51, 1.52],
  "Europe/Astrakhan": [46.35, 48.05],
  "Europe/Athens": [37.97, 23.72],
  "Europe/Belgrade": [44.85, 20.45],
  "Europe/Berlin": [52.5, 13.37],
  "Europe/Bratislava": [48.15, 17.11],
  "Europe/Brussels": [50.83, 4.33],
  "Europe/Bucharest": [44.44, 26.1],
  "Europe/Budapest": [47.5, 19.04],
  "Europe/Busingen": [47.7, 8.69],
  "Europe/Chisinau": [47.0, 28.86],
  "Europe/Copenhagen": [55.67, 12.58],
  "Europe/Dublin": [53.33, -6.26],
  "Europe/Gibraltar": [36.14, -5.35],
  "Europe/Helsinki": [60.17, 24.94],
  "Europe/Istanbul": [41.02, 28.97],
  "Europe/Kaliningrad": [54.71, 20.5],
  "Europe/Kyiv": [50.45, 30.52],
  "Europe/Kirov": [58.6, 49.66],
  "Europe/Lisbon": [38.72, -9.13],
  "Europe/Ljubljana": [46.05, 14.51],
  "Europe/London": [51.51, -0.13],
  "Europe/Luxembourg": [49.61, 6.13],
  "Europe/Madrid": [40.42, -3.7],
  "Europe/Malta": [35.9, 14.44],
  "Europe/Mariehamn": [60.1, 19.94],
  "Europe/Minsk": [53.9, 27.57],
  "Europe/Monaco": [43.74, 7.42],
  "Europe/Moscow": [55.76, 37.62],
  "Europe/Oslo": [59.92, 10.75],
  "Europe/Paris": [48.85, 2.35],
  "Europe/Podgorica": [42.44, 19.26],
  "Europe/Prague": [50.09, 14.42],
  "Europe/Riga": [56.95, 24.1],
  "Europe/Rome": [41.89, 12.48],
  "Europe/Samara": [53.2, 50.15],
  "Europe/Saratov": [51.57, 46.03],
  "Europe/Simferopol": [44.95, 34.1],
  "Europe/Sofia": [42.7, 23.32],
  "Europe/Stockholm": [59.33, 18.06],
  "Europe/Tallinn": [59.44, 24.75],
  "Europe/Tirane": [41.33, 19.82],
  "Europe/Ulyanovsk": [54.33, 48.4],
  "Europe/Uzhgorod": [48.62, 22.3],
  "Europe/Vaduz": [47.14, 9.52],
  "Europe/Vatican": [41.9, 12.45],
  "Europe/Vienna": [48.21, 16.37],
  "Europe/Vilnius": [54.69, 25.28],
  "Europe/Volgograd": [48.71, 44.5],
  "Europe/Warsaw": [52.23, 21.01],
  "Europe/Zagreb": [45.81, 15.98],
  "Europe/Zurich": [47.38, 8.54],

  // Indian
  "Indian/Antananarivo": [-18.92, 47.52],
  "Indian/Chagos": [-7.35, 72.42],
  "Indian/Christmas": [-10.45, 105.69],
  "Indian/Cocos": [-12.17, 96.82],
  "Indian/Comoro": [-11.7, 43.26],
  "Indian/Kerguelen": [-49.28, 69.35],
  "Indian/Mahe": [-4.68, 55.49],
  "Indian/Maldives": [4.17, 73.51],
  "Indian/Mauritius": [-20.15, 57.49],
  "Indian/Mayotte": [-12.78, 45.23],
  "Indian/Reunion": [-20.9, 55.48],

  // Pacific
  "Pacific/Apia": [-13.83, -171.75],
  "Pacific/Auckland": [-36.85, 174.76],
  "Pacific/Bougainville": [-6.21, 155.57],
  "Pacific/Chatham": [-43.95, -176.56],
  "Pacific/Chuuk": [7.42, 151.84],
  "Pacific/Easter": [-27.15, -109.44],
  "Pacific/Efate": [-17.66, 168.43],
  "Pacific/Enderbury": [-3.13, -171.08],
  "Pacific/Fakaofo": [-9.38, -171.24],
  "Pacific/Fiji": [-18.14, 178.44],
  "Pacific/Funafuti": [-8.52, 179.2],
  "Pacific/Galapagos": [-0.9, -89.6],
  "Pacific/Gambier": [-23.12, -134.96],
  "Pacific/Guadalcanal": [-9.42, 160.01],
  "Pacific/Guam": [13.47, 144.75],
  "Pacific/Honolulu": [21.32, -157.87],
  "Pacific/Kanton": [-2.77, -171.72],
  "Pacific/Kiritimati": [1.87, -157.43],
  "Pacific/Kosrae": [5.31, 162.98],
  "Pacific/Kwajalein": [8.72, 167.73],
  "Pacific/Majuro": [7.11, 171.14],
  "Pacific/Marquesas": [-9.0, -139.5],
  "Pacific/Midway": [28.21, -177.37],
  "Pacific/Nauru": [-0.52, 166.93],
  "Pacific/Niue": [-19.06, -169.92],
  "Pacific/Norfolk": [-29.05, 167.97],
  "Pacific/Noumea": [-22.27, 166.46],
  "Pacific/Pago_Pago": [-14.28, -170.7],
  "Pacific/Palau": [7.35, 134.48],
  "Pacific/Pitcairn": [-25.07, -130.1],
  "Pacific/Pohnpei": [6.96, 158.21],
  "Pacific/Port_Moresby": [-9.44, 147.18],
  "Pacific/Rarotonga": [-21.2, -159.78],
  "Pacific/Saipan": [15.19, 145.74],
  "Pacific/Tahiti": [-17.53, -149.57],
  "Pacific/Tarawa": [1.42, 173.0],
  "Pacific/Tongatapu": [-21.17, -175.21],
  "Pacific/Wake": [19.28, 166.62],
  "Pacific/Wallis": [-13.28, -176.17],

  // Etc / aliases
  "Etc/GMT": [0, 0],
  "Etc/UTC": [0, 0],
  "Etc/Universal": [0, 0],
  "Etc/Zulu": [0, 0],
  "GMT": [0, 0],
  "UTC": [0, 0],
  "Universal": [0, 0],
  "Zulu": [0, 0],
};

const ETG_GMT_OFFSET = /^Etc\/GMT([+-])(\d{1,2})$/;

/** IANA backward-compatibility aliases → canonical zone names. Browsers and
 *  `Intl` can report legacy spellings (e.g. Chrome returns `Asia/Katmandu`),
 *  so we normalize them before the lookup. */
const TIMEZONE_ALIASES: Record<string, string> = {
  "Africa/Asmera": "Africa/Asmara",
  "Africa/Timbuktu": "Africa/Bamako",
  "America/Argentina/ComodRivadavia": "America/Argentina/Catamarca",
  "America/Atka": "America/Adak",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "America/Catamarca": "America/Argentina/Catamarca",
  "America/Coral_Harbour": "America/Atikokan",
  "America/Cordoba": "America/Argentina/Cordoba",
  "America/Ensenada": "America/Tijuana",
  "America/Fort_Wayne": "America/Indiana/Indianapolis",
  "America/Godthab": "America/Nuuk",
  "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Jujuy": "America/Argentina/Jujuy",
  "America/Knox_IN": "America/Indiana/Knox",
  "America/Louisville": "America/Kentucky/Louisville",
  "America/Mendoza": "America/Argentina/Mendoza",
  "America/Montreal": "America/Toronto",
  "America/Nipigon": "America/Toronto",
  "America/Pangnirtung": "America/Iqaluit",
  "America/Porto_Acre": "America/Rio_Branco",
  "America/Rainy_River": "America/Winnipeg",
  "America/Rosario": "America/Argentina/Cordoba",
  "America/Santa_Isabel": "America/Tijuana",
  "America/Shiprock": "America/Denver",
  "America/Thunder_Bay": "America/Toronto",
  "America/Virgin": "America/Port_of_Spain",
  "America/Yellowknife": "America/Edmonton",
  "Antarctica/South_Pole": "Pacific/Auckland",
  "Asia/Ashkhabad": "Asia/Ashgabat",
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Chongqing": "Asia/Shanghai",
  "Asia/Chungking": "Asia/Shanghai",
  "Asia/Dacca": "Asia/Dhaka",
  "Asia/Harbin": "Asia/Shanghai",
  "Asia/Istanbul": "Europe/Istanbul",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Macao": "Asia/Macau",
  "Asia/Rangoon": "Asia/Yangon",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Asia/Tel_Aviv": "Asia/Jerusalem",
  "Asia/Ujung_Pandang": "Asia/Makassar",
  "Asia/Ulan_Bator": "Asia/Ulaanbaatar",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "Atlantic/Jan_Mayen": "Arctic/Longyearbyen",
  "Australia/ACT": "Australia/Sydney",
  "Australia/Canberra": "Australia/Sydney",
  "Australia/Currie": "Australia/Hobart",
  "Australia/LHI": "Australia/Lord_Howe",
  "Australia/NSW": "Australia/Sydney",
  "Australia/North": "Australia/Darwin",
  "Australia/Queensland": "Australia/Brisbane",
  "Australia/South": "Australia/Adelaide",
  "Australia/Tasmania": "Australia/Hobart",
  "Australia/Victoria": "Australia/Melbourne",
  "Australia/West": "Australia/Perth",
  "Australia/Yancowinna": "Australia/Broken_Hill",
  "Brazil/Acre": "America/Rio_Branco",
  "Brazil/DeNoronha": "America/Noronha",
  "Brazil/East": "America/Sao_Paulo",
  "Brazil/West": "America/Manaus",
  "Canada/Atlantic": "America/Halifax",
  "Canada/Central": "America/Winnipeg",
  "Canada/Eastern": "America/Toronto",
  "Canada/Mountain": "America/Edmonton",
  "Canada/Newfoundland": "America/St_Johns",
  "Canada/Pacific": "America/Vancouver",
  "Canada/Saskatchewan": "America/Regina",
  "Canada/Yukon": "America/Whitehorse",
  "Chile/Continental": "America/Santiago",
  "Chile/EasterIsland": "Pacific/Easter",
  "Cuba": "America/Havana",
  "Egypt": "Africa/Cairo",
  "Eire": "Europe/Dublin",
  "Europe/Belfast": "Europe/London",
  "Europe/Kiev": "Europe/Kyiv",
  "Europe/Tiraspol": "Europe/Chisinau",
  "GB": "Europe/London",
  "GB-Eire": "Europe/London",
  "Hongkong": "Asia/Hong_Kong",
  "Iceland": "Atlantic/Reykjavik",
  "Iran": "Asia/Tehran",
  "Israel": "Asia/Jerusalem",
  "Jamaica": "America/Jamaica",
  "Japan": "Asia/Tokyo",
  "Kwajalein": "Pacific/Kwajalein",
  "Libya": "Africa/Tripoli",
  "Mexico/BajaNorte": "America/Tijuana",
  "Mexico/BajaSur": "America/Mazatlan",
  "Mexico/General": "America/Mexico_City",
  "NZ": "Pacific/Auckland",
  "NZ-CHAT": "Pacific/Chatham",
  "Navajo": "America/Denver",
  "PRC": "Asia/Shanghai",
  "Pacific/Johnston": "Pacific/Honolulu",
  "Pacific/Ponape": "Pacific/Pohnpei",
  "Pacific/Samoa": "Pacific/Pago_Pago",
  "Pacific/Truk": "Pacific/Chuuk",
  "Pacific/Yap": "Pacific/Chuuk",
  "Poland": "Europe/Warsaw",
  "Portugal": "Europe/Lisbon",
  "ROC": "Asia/Taipei",
  "ROK": "Asia/Seoul",
  "Singapore": "Asia/Singapore",
  "Turkey": "Europe/Istanbul",
  "US/Alaska": "America/Anchorage",
  "US/Aleutian": "America/Adak",
  "US/Arizona": "America/Phoenix",
  "US/Central": "America/Chicago",
  "US/East-Indiana": "America/Indiana/Indianapolis",
  "US/Eastern": "America/New_York",
  "US/Hawaii": "Pacific/Honolulu",
  "US/Indiana-Starke": "America/Indiana/Knox",
  "US/Michigan": "America/Detroit",
  "US/Mountain": "America/Denver",
  "US/Pacific": "America/Los_Angeles",
  "US/Samoa": "Pacific/Pago_Pago",
  "W-SU": "Europe/Moscow",
};

/** Look up the reference coordinates for an IANA timezone. Returns `null`
 *  when the zone is unknown (or `Etc/GMT±n`, which is derived from offset). */
export function getLocationForTimeZone(
  timeZone: string,
): TimeZoneLocation | null {
  if (!timeZone) return null;

  const direct = TIMEZONE_LOCATIONS[timeZone];
  if (direct) return direct;

  const aliased = TIMEZONE_ALIASES[timeZone];
  if (aliased) {
    const resolved = TIMEZONE_LOCATIONS[aliased];
    if (resolved) return resolved;
  }

  const etcMatch = ETG_GMT_OFFSET.exec(timeZone);
  if (etcMatch) {
    const sign = etcMatch[1] === "+" ? -1 : 1;
    const hours = Number(etcMatch[2]);
    return [0, sign * hours * 15];
  }

  return null;
}

/** Detect the visitor's IANA timezone, e.g. `"Asia/Kathmandu"`. Returns `null`
 *  when `Intl` is unavailable or reports an empty zone. */
export function getBrowserTimeZone(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && zone.length > 0 ? zone : null;
  } catch {
    return null;
  }
}

/** All known timezone ids, sorted alphabetically. Useful for building pickers
 *  (the docs site uses it for its timezone selector). */
export function getTimeZoneList(): string[] {
  return Object.keys(TIMEZONE_LOCATIONS).sort((a, b) =>
    a.localeCompare(b),
  );
}

export interface SolarLocationInput {
  latitude?: number;
  longitude?: number;
  /** IANA timezone to resolve coordinates from (e.g. `"Asia/Kathmandu"`).
   *  Takes precedence over auto-detection. */
  timeZone?: string;
  /** Auto-detect the visitor's location from their browser timezone when no
   *  explicit coordinates/timezone are given. Default `true`. On the server
   *  (no `window`) detection is skipped and the default coordinates are used
   *  so SSR output stays deterministic. */
  autoDetectLocation?: boolean;
}

export interface ResolvedSolarLocation {
  latitude: number;
  longitude: number;
  /** The timezone the coordinates were resolved from, or `null` when explicit
   *  coordinates were used (or nothing could be detected). */
  timeZone: string | null;
  /** Whether the coordinates came from timezone resolution (explicit
   *  `timeZone` or browser auto-detection) rather than explicit coordinates. */
  autoDetected: boolean;
}

/**
 * Resolve the coordinates a solar calculation should use.
 *
 * Priority: explicit `latitude`/`longitude` → explicit `timeZone` →
 * browser timezone auto-detection → `DEFAULT_TIMEZONE_LOCATION`.
 */
export function resolveSolarLocation(
  input: SolarLocationInput = {},
): ResolvedSolarLocation {
  const hasLatitude = input.latitude !== undefined;
  const hasLongitude = input.longitude !== undefined;

  // 1. Explicit coordinates win when at least one is present. A lone value is
  //    honored and the missing axis is filled from the timezone/defaults.
  if (hasLatitude || hasLongitude) {
    const fromZone = input.timeZone
      ? getLocationForTimeZone(input.timeZone)
      : null;
    const latitude =
      input.latitude !== undefined
        ? input.latitude
        : fromZone
          ? fromZone[0]
          : DEFAULT_TIMEZONE_LOCATION[0];
    const longitude =
      input.longitude !== undefined
        ? input.longitude
        : fromZone
          ? fromZone[1]
          : DEFAULT_TIMEZONE_LOCATION[1];

    return {
      latitude,
      longitude,
      timeZone: input.timeZone ?? null,
      autoDetected: false,
    };
  }

  // 2. Explicit timezone.
  if (input.timeZone) {
    const fromZone = getLocationForTimeZone(input.timeZone);
    if (fromZone) {
      return {
        latitude: fromZone[0],
        longitude: fromZone[1],
        timeZone: input.timeZone,
        autoDetected: true,
      };
    }
  }

  // 3. Auto-detect from the browser timezone (client only — keeps SSR
  //    deterministic).
  const shouldDetect = input.autoDetectLocation !== false;
  if (shouldDetect && typeof window !== "undefined") {
    const detectedZone = getBrowserTimeZone();
    if (detectedZone) {
      const fromZone = getLocationForTimeZone(detectedZone);
      if (fromZone) {
        return {
          latitude: fromZone[0],
          longitude: fromZone[1],
          timeZone: detectedZone,
          autoDetected: true,
        };
      }
    }
  }

  // 4. Fallback defaults.
  return {
    latitude: DEFAULT_TIMEZONE_LOCATION[0],
    longitude: DEFAULT_TIMEZONE_LOCATION[1],
    timeZone: input.timeZone ?? null,
    autoDetected: false,
  };
}
