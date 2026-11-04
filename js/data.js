// Mock δεδομένα για το use case "Search Disaster".
// Δ2: Τύπος · Χώρα · Πόλη · Μέγεθος (1–5) · Συμβεβλημένα Hubs · Ημερομηνία · Κάλυψη αναγκών (%)

const DISASTER_TYPES = {
  flood:      { label: "Πλημμύρα",            icon: "icons/flood.svg",      color: "#1c7ed6" },
  fire:       { label: "Πυρκαγιά",            icon: "icons/fire.svg",       color: "#e8590c" },
  earthquake: { label: "Σεισμός",             icon: "icons/earthquake.svg", color: "#7048e8" },
  landslide:  { label: "Κατολίσθηση",         icon: "icons/landslide.svg",  color: "#8d6e63" },
  industrial: { label: "Βιομηχανικό ατύχημα", icon: "icons/industrial.svg", color: "#495057" }
};

const DISASTERS = [
  { id: 1,  type: "flood",      country: "Ελλάδα",      city: "Λάρισα",          lat: 39.64,  lng: 22.42,   magnitude: 4, hubs: ["Hub Θεσσαλίας", "Hub Αθήνας"],                         date: "2026-10-18", coverage: 35 },
  { id: 2,  type: "fire",       country: "Ελλάδα",      city: "Ρόδος",           lat: 36.43,  lng: 28.22,   magnitude: 3, hubs: ["Hub Δωδεκανήσου"],                                     date: "2026-10-21", coverage: 62 },
  { id: 3,  type: "earthquake", country: "Τουρκία",     city: "Σμύρνη",          lat: 38.42,  lng: 27.14,   magnitude: 5, hubs: ["Hub Σμύρνης", "Hub Αθήνας", "Hub Κωνσταντινούπολης"], date: "2026-10-12", coverage: 48 },
  { id: 4,  type: "flood",      country: "Ιταλία",      city: "Μπολόνια",        lat: 44.49,  lng: 11.34,   magnitude: 3, hubs: ["Hub Μιλάνου"],                                         date: "2026-10-15", coverage: 78 },
  { id: 5,  type: "fire",       country: "Πορτογαλία",  city: "Κοΐμπρα",         lat: 40.21,  lng: -8.43,   magnitude: 4, hubs: ["Hub Λισαβόνας"],                                       date: "2026-10-20", coverage: 55 },
  { id: 6,  type: "landslide",  country: "Νορβηγία",    city: "Μπέργκεν",        lat: 60.39,  lng: 5.32,    magnitude: 2, hubs: ["Hub Όσλο"],                                            date: "2026-10-08", coverage: 91 },
  { id: 7,  type: "industrial", country: "Γερμανία",    city: "Λουντβιχσχάφεν",  lat: 49.48,  lng: 8.44,    magnitude: 3, hubs: ["Hub Φρανκφούρτης"],                                    date: "2026-10-23", coverage: 74 },
  { id: 8,  type: "earthquake", country: "Ιαπωνία",     city: "Κουμαμότο",       lat: 32.80,  lng: 130.71,  magnitude: 4, hubs: ["Hub Τόκιο", "Hub Οσάκα"],                              date: "2026-10-05", coverage: 83 },
  { id: 9,  type: "flood",      country: "Μπαγκλαντές", city: "Σιλχέτ",          lat: 24.89,  lng: 91.87,   magnitude: 5, hubs: ["Hub Ντάκα"],                                           date: "2026-10-10", coverage: 22 },
  { id: 10, type: "landslide",  country: "Ινδονησία",   city: "Μπαντούνγκ",      lat: -6.91,  lng: 107.61,  magnitude: 3, hubs: ["Hub Τζακάρτας"],                                       date: "2026-10-17", coverage: 41 },
  { id: 11, type: "fire",       country: "ΗΠΑ",         city: "Λος Άντζελες",    lat: 34.05,  lng: -118.24, magnitude: 4, hubs: ["Hub Καλιφόρνιας", "Hub Σαν Ντιέγκο"],                  date: "2026-10-22", coverage: 67 },
  { id: 12, type: "earthquake", country: "Χιλή",        city: "Βαλπαραΐσο",      lat: -33.05, lng: -71.62,  magnitude: 3, hubs: ["Hub Σαντιάγο"],                                        date: "2026-10-02", coverage: 88 },
  { id: 13, type: "flood",      country: "Βραζιλία",    city: "Πόρτο Αλέγκρε",   lat: -30.03, lng: -51.23,  magnitude: 4, hubs: ["Hub Σάο Πάολο"],                                       date: "2026-10-14", coverage: 38 },
  { id: 14, type: "industrial", country: "Ινδία",       city: "Βισακαπατνάμ",    lat: 17.69,  lng: 83.22,   magnitude: 4, hubs: ["Hub Μουμπάι"],                                         date: "2026-10-19", coverage: 29 },
  { id: 15, type: "landslide",  country: "Κολομβία",    city: "Μεδεγίν",         lat: 6.24,   lng: -75.58,  magnitude: 2, hubs: ["Hub Μπογκοτά"],                                        date: "2026-10-24", coverage: 57 },
  { id: 16, type: "fire",       country: "Αυστραλία",   city: "Πέρθη",           lat: -31.95, lng: 115.86,  magnitude: 3, hubs: ["Hub Σίδνεϊ"],                                          date: "2026-10-11", coverage: 72 },
  { id: 17, type: "earthquake", country: "Μαρόκο",      city: "Μαρακές",         lat: 31.63,  lng: -7.99,   magnitude: 4, hubs: ["Hub Καζαμπλάνκας", "Hub Μαδρίτης"],                    date: "2026-10-09", coverage: 33 },
  { id: 18, type: "flood",      country: "Νιγηρία",     city: "Λάγος",           lat: 6.52,   lng: 3.38,    magnitude: 3, hubs: ["Hub Αμπούτζα"],                                        date: "2026-10-16", coverage: 45 },
  { id: 19, type: "industrial", country: "Ελλάδα",      city: "Ελευσίνα",        lat: 38.04,  lng: 23.54,   magnitude: 2, hubs: ["Hub Αθήνας"],                                          date: "2026-10-25", coverage: 81 },
  // Παράδειγμα: όλες οι ανάγκες έχουν καλυφθεί πλήρως → δεν υπάρχουν τρέχουσες ανάγκες
  { id: 20, type: "flood",      country: "Ισπανία",     city: "Βαλένθια",        lat: 39.47,  lng: -0.38,   magnitude: 2, hubs: ["Hub Μαδρίτης"],                                        date: "2026-10-06", coverage: 100, noNeeds: true },
  // Παράδειγμα: κανένα συμβεβλημένο hub → δεν υπάρχουν δεδομένα αναγκών/κάλυψης
  { id: 21, type: "earthquake", country: "Νεπάλ",       city: "Κατμαντού",       lat: 27.72,  lng: 85.32,   magnitude: 3, hubs: [],                                                      date: "2026-10-26", coverage: null }
];

// Κλίμακα κάλυψης: < 40% κρίσιμη · 40–69% μέτρια · ≥ 70% επαρκής
function coverageLevel(pct) {
  if (pct == null) return { key: "none", label: "Χωρίς δεδομένα" };
  if (pct < 40) return { key: "critical", label: "Κρίσιμη" };
  if (pct < 70) return { key: "medium",   label: "Μέτρια" };
  return { key: "ok", label: "Επαρκής" };
}

// Κάλυψη ως κείμενο / πλάτος μπάρας (null = δεν υπάρχουν δεδομένα, π.χ. καμία συμβεβλημένη hub)
const coverageText = (pct) => (pct == null ? "—" : `${pct}%`);
const coverageWidth = (pct) => (pct == null ? 0 : pct);

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// Τοποθεσία χρήστη (mock): υποθέτουμε ότι ο χρήστης βρίσκεται στην Ελλάδα.
// ---------------------------------------------------------------------------
const USER_LOCATION = {
  address: "Σταδίου 10, 105 64 Αθήνα, Ελλάδα",
  short: "Αθήνα, Ελλάδα",
  lat: 37.9755,
  lng: 23.7348
};

// ---------------------------------------------------------------------------
// Συμβεβλημένα Hubs. Τα DISASTERS τα αναφέρουν με το όνομά τους (πεδίο `name`).
// ---------------------------------------------------------------------------
const HUBS = [
  { id: 1,  name: "Hub Θεσσαλίας",         city: "Λάρισα",          country: "Ελλάδα",      lat: 39.64,  lng: 22.42,   address: "Ηπείρου 45, 412 22 Λάρισα",            phone: "+30 241 055 0101",  email: "larisa@hubs.resqhub.example",     hours: "Καθημερινά 08:00–20:00", since: "2024-03-12" },
  { id: 2,  name: "Hub Αθήνας",            city: "Αθήνα",           country: "Ελλάδα",      lat: 37.964, lng: 23.726,  address: "Λεωφ. Συγγρού 120, 117 41 Αθήνα",      phone: "+30 210 055 0102",  email: "athens@hubs.resqhub.example",     hours: "24/7",                   since: "2023-06-01" },
  { id: 3,  name: "Hub Δωδεκανήσου",       city: "Ρόδος",           country: "Ελλάδα",      lat: 36.43,  lng: 28.22,   address: "Αμερικής 18, 851 00 Ρόδος",            phone: "+30 224 105 0103",  email: "rhodes@hubs.resqhub.example",     hours: "Καθημερινά 09:00–19:00", since: "2024-09-20" },
  { id: 4,  name: "Hub Σμύρνης",           city: "Σμύρνη",          country: "Τουρκία",     lat: 38.42,  lng: 27.14,   address: "Atatürk Cad. 212, Konak, İzmir",        phone: "+90 232 055 0104",  email: "izmir@hubs.resqhub.example",      hours: "24/7",                   since: "2024-01-15" },
  { id: 5,  name: "Hub Κωνσταντινούπολης", city: "Κωνσταντινούπολη", country: "Τουρκία",     lat: 41.01,  lng: 28.98,   address: "İstiklal Cad. 87, Beyoğlu, İstanbul",   phone: "+90 212 055 0105",  email: "istanbul@hubs.resqhub.example",   hours: "Καθημερινά 08:00–22:00", since: "2024-01-15" },
  { id: 6,  name: "Hub Μιλάνου",           city: "Μιλάνο",          country: "Ιταλία",      lat: 45.46,  lng: 9.19,    address: "Via Torino 33, 20123 Milano",           phone: "+39 02 055 0106",   email: "milan@hubs.resqhub.example",      hours: "Καθημερινά 08:00–18:00", since: "2023-11-03" },
  { id: 7,  name: "Hub Λισαβόνας",         city: "Λισαβόνα",        country: "Πορτογαλία",  lat: 38.72,  lng: -9.14,   address: "Rua Augusta 150, 1100-053 Lisboa",      phone: "+351 21 055 0107",  email: "lisbon@hubs.resqhub.example",     hours: "Καθημερινά 09:00–19:00", since: "2024-05-27" },
  { id: 8,  name: "Hub Όσλο",              city: "Όσλο",            country: "Νορβηγία",    lat: 59.91,  lng: 10.75,   address: "Karl Johans gate 14, 0154 Oslo",        phone: "+47 22 05 5008",    email: "oslo@hubs.resqhub.example",       hours: "Καθημερινά 08:00–16:00", since: "2023-08-14" },
  { id: 9,  name: "Hub Φρανκφούρτης",      city: "Φρανκφούρτη",     country: "Γερμανία",    lat: 50.11,  lng: 8.68,    address: "Mainzer Landstr. 70, 60329 Frankfurt",  phone: "+49 69 055 0109",   email: "frankfurt@hubs.resqhub.example",  hours: "24/7",                   since: "2023-04-19" },
  { id: 10, name: "Hub Τόκιο",             city: "Τόκιο",           country: "Ιαπωνία",     lat: 35.68,  lng: 139.69,  address: "1-2-3 Marunouchi, Chiyoda, Tokyo",      phone: "+81 3 0555 0110",   email: "tokyo@hubs.resqhub.example",      hours: "24/7",                   since: "2023-02-08" },
  { id: 11, name: "Hub Οσάκα",             city: "Οσάκα",           country: "Ιαπωνία",     lat: 34.69,  lng: 135.50,  address: "4-5-6 Umeda, Kita-ku, Osaka",           phone: "+81 6 0555 0111",   email: "osaka@hubs.resqhub.example",      hours: "Καθημερινά 08:00–20:00", since: "2023-02-08" },
  { id: 12, name: "Hub Ντάκα",             city: "Ντάκα",           country: "Μπαγκλαντές", lat: 23.81,  lng: 90.41,   address: "House 12, Road 5, Dhanmondi, Dhaka",    phone: "+880 2 5550 0112",  email: "dhaka@hubs.resqhub.example",      hours: "Σαβ–Πέμ 08:00–18:00",    since: "2024-07-02" },
  { id: 13, name: "Hub Τζακάρτας",         city: "Τζακάρτα",        country: "Ινδονησία",   lat: -6.21,  lng: 106.85,  address: "Jl. Sudirman 55, Jakarta Pusat",        phone: "+62 21 5550 0113",  email: "jakarta@hubs.resqhub.example",    hours: "Καθημερινά 08:00–18:00", since: "2024-04-10" },
  { id: 14, name: "Hub Καλιφόρνιας",       city: "Σακραμέντο",      country: "ΗΠΑ",         lat: 38.58,  lng: -121.49, address: "1010 L Street, Sacramento, CA 95814",   phone: "+1 916 555 0114",   email: "sacramento@hubs.resqhub.example", hours: "24/7",                   since: "2023-09-25" },
  { id: 15, name: "Hub Σαν Ντιέγκο",       city: "Σαν Ντιέγκο",     country: "ΗΠΑ",         lat: 32.72,  lng: -117.16, address: "500 Broadway, San Diego, CA 92101",     phone: "+1 619 555 0115",   email: "sandiego@hubs.resqhub.example",   hours: "Καθημερινά 08:00–20:00", since: "2024-02-06" },
  { id: 16, name: "Hub Σαντιάγο",          city: "Σαντιάγο",        country: "Χιλή",        lat: -33.45, lng: -70.67,  address: "Av. Libertador B. O'Higgins 1302",      phone: "+56 2 5550 0116",   email: "santiago@hubs.resqhub.example",   hours: "Καθημερινά 09:00–19:00", since: "2024-06-18" },
  { id: 17, name: "Hub Σάο Πάολο",         city: "Σάο Πάολο",       country: "Βραζιλία",    lat: -23.55, lng: -46.63,  address: "Av. Paulista 1578, São Paulo",          phone: "+55 11 5550 0117",  email: "saopaulo@hubs.resqhub.example",   hours: "Καθημερινά 08:00–20:00", since: "2024-03-30" },
  { id: 18, name: "Hub Μουμπάι",           city: "Μουμπάι",         country: "Ινδία",       lat: 19.08,  lng: 72.88,   address: "Nariman Point 21, Mumbai 400021",       phone: "+91 22 5550 0118",  email: "mumbai@hubs.resqhub.example",     hours: "Καθημερινά 09:00–19:00", since: "2023-12-11" },
  { id: 19, name: "Hub Μπογκοτά",          city: "Μπογκοτά",        country: "Κολομβία",    lat: 4.71,   lng: -74.07,  address: "Carrera 7 #72-41, Bogotá",              phone: "+57 1 555 0119",    email: "bogota@hubs.resqhub.example",     hours: "Καθημερινά 08:00–17:00", since: "2024-08-05" },
  { id: 20, name: "Hub Σίδνεϊ",            city: "Σίδνεϊ",          country: "Αυστραλία",   lat: -33.87, lng: 151.21,  address: "200 George Street, Sydney NSW 2000",    phone: "+61 2 5550 0120",   email: "sydney@hubs.resqhub.example",     hours: "24/7",                   since: "2023-10-09" },
  { id: 21, name: "Hub Καζαμπλάνκας",      city: "Καζαμπλάνκα",     country: "Μαρόκο",      lat: 33.57,  lng: -7.59,   address: "Bd Mohammed V 120, Casablanca",         phone: "+212 522 055 021",  email: "casablanca@hubs.resqhub.example", hours: "Καθημερινά 08:30–18:00", since: "2024-01-29" },
  { id: 22, name: "Hub Μαδρίτης",          city: "Μαδρίτη",         country: "Ισπανία",     lat: 40.42,  lng: -3.70,   address: "Calle de Alcalá 90, 28009 Madrid",      phone: "+34 91 555 0122",   email: "madrid@hubs.resqhub.example",     hours: "Καθημερινά 09:00–19:00", since: "2023-05-22" },
  { id: 23, name: "Hub Αμπούτζα",          city: "Αμπούτζα",        country: "Νιγηρία",     lat: 9.08,   lng: 7.40,    address: "Plot 45, Gimbiya Street, Garki, Abuja", phone: "+234 9 555 0123",   email: "abuja@hubs.resqhub.example",      hours: "Καθημερινά 08:00–17:00", since: "2024-10-01" }
];

// Απόσταση μεγάλου κύκλου (Haversine) σε χιλιόμετρα
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(km) {
  return km < 10 ? `${km.toFixed(1).replace(".", ",")} km` : `${Math.round(km).toLocaleString("el-GR")} km`;
}

// Hubs ενός συμβάντος, ταξινομημένα κατά απόσταση από τον χρήστη (πλησιέστερο πρώτο)
function hubsOfDisaster(ev) {
  return ev.hubs
    .map((name) => HUBS.find((h) => h.name === name))
    .filter(Boolean)
    .map((h) => ({ ...h, distance: distanceKm(USER_LOCATION.lat, USER_LOCATION.lng, h.lat, h.lng) }))
    .sort((a, b) => a.distance - b.distance);
}

// ---------------------------------------------------------------------------
// Ανάγκες. Κατάλογος ανά τύπο καταστροφής + κοινές ανάγκες.
// priority: 1 = ζωτική, 2 = απαραίτητη, 3 = συμπληρωματική · base = βασική ποσότητα ανά hub
// ---------------------------------------------------------------------------
const NEED_CATALOG = {
  common: [
    { key: "water",  name: "Εμφιαλωμένο νερό",        category: "Νερό & Τρόφιμα", unit: "λίτρα",   base: 6000, priority: 1 },
    { key: "food",   name: "Μη φθαρτά τρόφιμα",       category: "Νερό & Τρόφιμα", unit: "πακέτα",  base: 1500, priority: 1 },
    { key: "firstaid", name: "Κιτ πρώτων βοηθειών",   category: "Υγεία",          unit: "τεμάχια", base: 400,  priority: 1 }
  ],
  flood: [
    { key: "pumps",   name: "Αντλίες απάντλησης",     category: "Εξοπλισμός",     unit: "τεμάχια", base: 40,   priority: 1 },
    { key: "sandbags", name: "Σάκοι άμμου",           category: "Εξοπλισμός",     unit: "τεμάχια", base: 3000, priority: 2 },
    { key: "blankets", name: "Κουβέρτες",             category: "Στέγαση",        unit: "τεμάχια", base: 900,  priority: 2 },
    { key: "hygiene", name: "Κιτ υγιεινής",           category: "Υγιεινή",        unit: "τεμάχια", base: 700,  priority: 2 },
    { key: "boots",   name: "Γαλότσες",               category: "Ρουχισμός",      unit: "ζεύγη",   base: 500,  priority: 3 }
  ],
  fire: [
    { key: "masks",   name: "Μάσκες FFP3",            category: "Υγεία",          unit: "τεμάχια", base: 4000, priority: 1 },
    { key: "tents",   name: "Σκηνές προσωρινής στέγασης", category: "Στέγαση",    unit: "τεμάχια", base: 180,  priority: 2 },
    { key: "clothes", name: "Σετ ρουχισμού",          category: "Ρουχισμός",      unit: "σετ",     base: 800,  priority: 2 },
    { key: "eyewash", name: "Οφθαλμικά διαλύματα",    category: "Υγεία",          unit: "φιάλες",  base: 1200, priority: 2 },
    { key: "animalfeed", name: "Ζωοτροφές",           category: "Νερό & Τρόφιμα", unit: "κιλά",    base: 1500, priority: 3 }
  ],
  earthquake: [
    { key: "tents",   name: "Σκηνές προσωρινής στέγασης", category: "Στέγαση",    unit: "τεμάχια", base: 300,  priority: 1 },
    { key: "rescue",  name: "Εξοπλισμός διάσωσης",    category: "Εξοπλισμός",     unit: "σετ",     base: 60,   priority: 1 },
    { key: "trauma",  name: "Κιτ τραύματος",          category: "Υγεία",          unit: "τεμάχια", base: 350,  priority: 1 },
    { key: "lights",  name: "Φορητά φωτιστικά",       category: "Εξοπλισμός",     unit: "τεμάχια", base: 700,  priority: 2 },
    { key: "sleeping", name: "Υπνόσακοι",             category: "Στέγαση",        unit: "τεμάχια", base: 1000, priority: 2 }
  ],
  landslide: [
    { key: "rescue",  name: "Εξοπλισμός διάσωσης",    category: "Εξοπλισμός",     unit: "σετ",     base: 50,   priority: 1 },
    { key: "tents",   name: "Σκηνές προσωρινής στέγασης", category: "Στέγαση",    unit: "τεμάχια", base: 120,  priority: 2 },
    { key: "lights",  name: "Φορητά φωτιστικά",       category: "Εξοπλισμός",     unit: "τεμάχια", base: 400,  priority: 2 },
    { key: "jackets", name: "Αδιάβροχα μπουφάν",      category: "Ρουχισμός",      unit: "τεμάχια", base: 600,  priority: 3 },
    { key: "shovels", name: "Φτυάρια & εργαλεία",     category: "Εξοπλισμός",     unit: "τεμάχια", base: 500,  priority: 3 }
  ],
  industrial: [
    { key: "suits",   name: "Στολές χημικής προστασίας", category: "Εξοπλισμός",  unit: "τεμάχια", base: 300,  priority: 1 },
    { key: "gasmask", name: "Μάσκες αερίων",          category: "Υγεία",          unit: "τεμάχια", base: 1500, priority: 1 },
    { key: "oxygen",  name: "Φιάλες ιατρικού οξυγόνου", category: "Υγεία",        unit: "τεμάχια", base: 200,  priority: 1 },
    { key: "decon",   name: "Υλικά απολύμανσης",      category: "Υγιεινή",        unit: "κιβώτια", base: 150,  priority: 2 },
    { key: "hygiene", name: "Κιτ υγιεινής",           category: "Υγιεινή",        unit: "τεμάχια", base: 500,  priority: 3 }
  ]
};

// Σοβαρότητα ανάγκης: συνδυασμός προτεραιότητας και ελλείμματος κάλυψης
const SEVERITY_LEVELS = [
  { key: "critical", label: "Κρίσιμη", rank: 4 },
  { key: "high",     label: "Υψηλή",   rank: 3 },
  { key: "medium",   label: "Μέτρια",  rank: 2 },
  { key: "ok",       label: "Χαμηλή",  rank: 1 }
];

function severityOf(priority, coveragePct) {
  const weight = { 1: 1, 2: 0.8, 3: 0.55 }[priority];
  const score = (100 - coveragePct) * weight;
  const level = score >= 50 ? "critical" : score >= 35 ? "high" : score >= 20 ? "medium" : "ok";
  return { ...SEVERITY_LEVELS.find((s) => s.key === level), score };
}

// Ντετερμινιστική γεννήτρια τυχαίων αριθμών ώστε τα mock δεδομένα να μένουν σταθερά
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ανάγκες ενός hub για ένα συμβάν (παράγονται από τον κατάλογο, σταθερά ανά ζεύγος συμβάντος/hub)
function needsOfHub(ev, hub) {
  if (ev.noNeeds) return [];                           // όλες οι ανάγκες έχουν καλυφθεί
  const rand = seededRandom(ev.id * 1000 + hub.id);
  const share = 0.6 + rand() * 0.7;                    // μερίδιο του hub στο συμβάν
  const scale = (0.5 + ev.magnitude * 0.25) * share;   // κλιμάκωση με βάση το μέγεθος
  const catalog = [...NEED_CATALOG.common, ...NEED_CATALOG[ev.type]];

  return catalog.map((n) => {
    let quantity = n.base * scale;
    const step = quantity >= 1000 ? 100 : quantity >= 100 ? 10 : quantity >= 20 ? 5 : 1;
    quantity = Math.max(step, Math.round(quantity / step) * step);
    const target = ev.coverage + (rand() - 0.5) * 50;  // γύρω από τη γενική κάλυψη του συμβάντος
    const covered = Math.round(quantity * Math.min(1, Math.max(0.03, target / 100)));
    const coverage = Math.round((covered / quantity) * 100);
    return {
      ...n, quantity, covered, remaining: quantity - covered, coverage,
      severity: severityOf(n.priority, coverage)
    };
  }).sort((a, b) => b.severity.score - a.severity.score);
}

// Συγκεντρωτικά στοιχεία hub: μέση κάλυψη και πλήθος ανοιχτών (κρίσιμων/υψηλών) αναγκών
function hubNeedsSummary(needs) {
  if (!needs.length) return { coverage: 100, urgent: 0, total: 0 };
  const coverage = Math.round(needs.reduce((s, n) => s + n.coverage, 0) / needs.length);
  const urgent = needs.filter((n) => n.severity.rank >= 3).length;
  return { coverage, urgent, total: needs.length };
}

// Κορυφαίες ανάγκες συμβάντος: συγκεντρώνονται από όλα τα hubs και ταξινομούνται κατά σοβαρότητα
function topNeedsOfDisaster(ev, limit = 3) {
  const byKey = new Map();
  for (const hub of hubsOfDisaster(ev)) {
    for (const n of needsOfHub(ev, hub)) {
      if (!byKey.has(n.key)) byKey.set(n.key, { ...n, quantity: 0, covered: 0 });
      const agg = byKey.get(n.key);
      agg.quantity += n.quantity;
      agg.covered += n.covered;
    }
  }
  return [...byKey.values()].map((n) => {
    const coverage = Math.round((n.covered / n.quantity) * 100);
    return { ...n, remaining: n.quantity - n.covered, coverage, severity: severityOf(n.priority, coverage) };
  }).sort((a, b) => b.severity.score - a.severity.score).slice(0, limit);
}

function formatQty(n) {
  return n.toLocaleString("el-GR");
}
