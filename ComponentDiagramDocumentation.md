# Περιγραφή μονάδων

## Search Disaster

**`SearchServlet.java`**: Διαβάζει τα κριτήρια αναζήτησης από το request (χώρα/πόλη, τύπος καταστροφής, ταξινόμηση) και καλεί την αντίστοιχη μέθοδο της `Disaster`, π.χ. `Disaster.search("Greece", "Flood")`. Προωθεί (forward) τα αποτελέσματα στη `disasters.jsp`.

**`disasters.jsp`**: Εμφανίζει τις καταστροφές σε χάρτη και λίστα. Είναι η κεντρική σελίδα της εφαρμογής: από εδώ ο χρήστης μεταβαίνει στις υπόλοιπες λειτουργίες, ανάλογα με τον ρόλο του:
- Επιλογή συμβάντος → `AidServlet` → `aid.jsp`
- «Edit Disaster» (μόνο Admin) → `DisasterServlet` → `createAndEditDisaster.jsp`
- «Edit Needs» (μόνο Hub) → `NeedsServlet` → `editDisasterNeeds.jsp`
- «Login» → `login.jsp`

## Provide Aid

**`aid.jsp`**: Εμφανίζει τα στοιχεία και τις εκκρεμείς ανάγκες του συμβάντος, με φόρμες για τον τρόπο συνεισφοράς (αγαθά, εθελοντικός ρόλος, χρήματα). Με την υποβολή εμφανίζεται παράθυρο σύνοψης για επιβεβαίωση. Μετά την επιβεβαίωση, η σελίδα ξαναφορτώνεται με μήνυμα επιτυχίας και τις ενημερωμένες ανάγκες.

## Define/Edit Needed Resources

**`editDisasterNeeds.jsp`**: Φόρμα (μόνο Hubs) για τον αριθμό εθελοντών και τις υλικές και χρηματικές ανάγκες ενός συμβάντος. Είναι προσυμπληρωμένη με τις τρέχουσες τιμές.

**`NeedsServlet.java`**: Φορτώνει τις καταστροφές στις οποίες είναι συμβεβλημένο το Hub και τις ανάγκες τους (`DisasterNeeds.findByDisaster(id)`). Ελέγχει τα υποχρεωτικά πεδία και αποθηκεύει τις αλλαγές (`needs.save()`).

## Create/Edit Disaster

**`createAndEditDisaster.jsp`**: Φόρμα (μόνο Admin) για δημιουργία και επεξεργασία συμβάντος. Αν υπάρχει `id`, προσυμπληρώνεται με τα υπάρχοντα στοιχεία.

**`DisasterServlet.java`**: Φορτώνει το συμβάν προς επεξεργασία και τη λίστα των Hubs (για το πεδίο «συμβεβλημένα hubs»). Ελέγχει την εγκυρότητα της φόρμας και δημιουργεί, ενημερώνει ή διαγράφει το συμβάν (`disaster.save()`, `Disaster.delete(id)`). Σε σφάλμα επιστρέφει στη φόρμα με μήνυμα, χωρίς να χάνονται τα στοιχεία που έχουν συμπληρωθεί.

## Login

**`login.jsp`**: Φόρμα σύνδεσης.

**`LoginServlet.java`**: Ελέγχει τα στοιχεία (`User.authenticate(email, password)`), αποθηκεύει τον χρήστη στο session και τον ανακατευθύνει ανάλογα με τον ρόλο του (Citizen, Hub, Admin).

> Ο έλεγχος πρόσβασης γίνεται στα servlets, με βάση τον ρόλο που είναι αποθηκευμένος στο session. Η απόκρυψη κουμπιών στις JSP δεν αρκεί.


`aidServlet`: Δέχεται το request ώστε να εμφανίσει τις ανάγκες ενός disaster. Ανανεώνει τις ανάγκες ενός Event (HubManager)

`aidRequestForm.jsp`
- Use Case: **Define/edit resources**
- Scope: HubManager
- Καλεί το AidRequestServlet ->  AidRequest το οποίο με την σειρά του γράφει στην ΒΔ.

`aidRequestView.jsp`
- Use Case: **View Disaster Needs**
- Scope: Everyone
- Καλεί το DisasterServlet το οποίο φέρνει τα συμβεβλημένα hubs και τις ανάγκες κάθε hub.

# Use cases

`Publish needs`: **Organization**
`Handle incoming offers`: **Organization**
`View Disasters`: **Ci  tizen, Organization**
`Offer help`: **Citizen**

και αυτά σαν use cases

## Διορθώσεις
`Disaster` event should be free text?
