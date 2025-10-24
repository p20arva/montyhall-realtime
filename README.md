# Monty Hall — Realtime Simulation (Express + Socket.IO)

Προσομοίωση του προβλήματος Monty Hall με **συγκεντρωτικά στατιστικά σε πραγματικό χρόνο**.
Το παιχνίδι και ο Socket.IO server τρέχουν **στον ίδιο port (5500)**. Η σελίδα **admin** είναι προσβάσιμη **μόνο από τον host (localhost)**.

---

## 🌟 Χαρακτηριστικά
- Διαδραστικό παιχνίδι Monty Hall σε browser (`MontyHall.html`).
- Αυτόματες προσομοιώσεις με cap (προεπιλογή: 1.000.000 γύροι).
- Συγκεντρωτικά global stats (win/lose, switch/stay, total rates).
- **Admin dashboard** με:
  - Realtime ενημέρωση,
  - “Active players” counter,
  - “Last update” timestamp,
  - **Reset δικτύου**,
  - **Export** των stats σε **JSON** ή **CSV**.
- **Ασφάλεια admin**:
  - Το `admin.html` σερβίρεται **μόνο** από `localhost` (HTTP 403 από LAN).
  - Το namespace `/admin` του Socket.IO απαιτεί **IP από host** + **ADMIN_KEY**.

---

## 🧩 Προαπαιτούμενα
- Node.js **18+**
- npm

---

## 📦 Εγκατάσταση
```bash
npm i
```

---

## ⚙️ Ρύθμιση περιβάλλοντος

1) Δημιούργησε αρχείο **`.env`** στη ρίζα του project (δίπλα στο `server.js`):

```
PORT=5500
ADMIN_KEY=βάλε_ένα_ισχυρό_κλειδί_εδώ
```

> Γεννήτρια κλειδιού (Node):
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
> ```

2) (Προαιρετικό) Από το δείγμα:
```bash
# Windows (CMD)
copy .env.example .env
# macOS / Linux
cp .env.example .env
```
…και άλλαξε το `ADMIN_KEY`.

> Το **`.env`** είναι στο `.gitignore` → δεν ανεβαίνει στο GitHub.  
> Το **`.env.example`** μένει στο repo.

---

## ▶️ Εκκίνηση
```bash
npm start
# ή
npm run dev   # αν έχεις script για nodemon
```

Θα δεις:
```
MontyHall realtime backend on http://0.0.0.0:5500
```

### `npm start` vs `npm run dev`

- **`npm start`**: εκκινεί τον server “κανονικά” (μία φορά) με `node server.js`.  
  Χρήσιμο για παρουσίαση/παραγωγή.

- **`npm run dev`**: εκκινεί τον server σε **development mode** με αυτόματη επανεκκίνηση όταν αλλάζουν αρχεία (χάρη στο `nodemon`).  
  Χρήσιμο ενώ αναπτύσσεις/πειράζεις κώδικα.

> Αν δεν έχεις ήδη το script `dev`, πρόσθεσέ το στο `package.json` και εγκατέστησε το `nodemon`:
>
> ```bash
> npm i -D nodemon
> ```
>
> **package.json (απόσπασμα scripts):**
> ```json
> {
>   "scripts": {
>     "start": "node server.js",
>     "dev": "nodemon server.js"
>   }
> }
> ```

---

## 🌐 Άνοιγμα σελίδων

- **Παιχνίδι (LAN):**
  `http://<LAN-IP>:5500/MontyHall.html`  
  π.χ. `http://192.168.X.Y:5500/MontyHall.html`

- **Admin (μόνο host):**
  `http://localhost:5500/admin.html`  
  Την **πρώτη φορά** θα ζητήσει **Admin key** (το `ADMIN_KEY` του `.env`) και το αποθηκεύει τοπικά.

> Αν καλέσεις `admin.html` από LAN (`http://<LAN-IP>:5500/admin.html`) θα πάρεις **403 Forbidden** — σκόπιμα.

---

### Πώς βρίσκω το LAN IP μου

- **Windows**
  1. Άνοιξε PowerShell ή Command Prompt
  2. Τρέξε: `ipconfig`
  3. Βρες την κάρτα δικτύου που χρησιμοποιείς (Wi-Fi ή Ethernet) και σημείωσε το **IPv4 Address** (π.χ. `192.168.x.y`)

- **macOS**
  1. Άνοιξε Terminal
  2. Τρέξε: `ipconfig getifaddr en0` (συνήθως Wi-Fi) ή `ipconfig getifaddr en1` (Ethernet)
     - Εναλλακτικά: `ifconfig | grep 'inet ' | grep -v 127.0.0.1`
  3. Σημείωσε τη διεύθυνση τύπου `192.168.x.y`

- **Linux**
  1. Άνοιξε Terminal
  2. Τρέξε: `ip a | grep 'inet ' | grep -v 127.0.0.1`
     - Εναλλακτικά: `hostname -I`
  3. Σημείωσε τη διεύθυνση τύπου `192.168.x.y`

> Χρησιμοποίησε αυτό το LAN IP στη διεύθυνση του παιχνιδιού:  
> `http://<LAN-IP>:5500/MontyHall.html`

---

## 🕹️ Χρήση
- Χειροκίνητοι γύροι: άνοιξε πόρτα → **SWITCH** ή **STAY**.
- Αυτόματο: βάλε γύρους (έως cap) → **Τρέξε αυτόματα**. Αν ζητήσεις παραπάνω, εφαρμόζεται cap και γράφεται μήνυμα στο log.
- Admin: βλέπει/μηδενίζει τα global stats, εξάγει JSON/CSV.

---

## 🛡️ Σημειώσεις ασφαλείας
- Route-level IP lock για `admin.html` (localhost only).
- Socket.IO `/admin`: IP host + `ADMIN_KEY`.
- Μην ανεβάσεις ποτέ το πραγματικό `.env`.

---

## 🧪 Troubleshooting
- **Admin “unauthorized”**: λάθος key. Καθάρισε `localStorage.ADMIN_KEY` και βάλε το key του `.env`.
- **Admin “forbidden ip”**: άνοιξες admin από LAN—χρησιμοποίησε `http://localhost:5500/admin.html`.
- **PORT πιασμένο**: κλείσε Live Server ή άλλαξε `PORT` στο `.env`.

Γρήγορος έλεγχος `.env`:
```bash
node -e "require('dotenv').config(); console.log('PORT=',process.env.PORT,'KEYLEN=',(process.env.ADMIN_KEY||'').length)"
```

---

## 📁 Δομή
```
.
├─ server.js
├─ MontyHall.html
├─ admin.html
├─ package.json
├─ .env               # (τοπικά, ΔΕΝ ανεβαίνει)
├─ .env.example       # δείγμα
└─ .gitignore
```

## 📜 Άδεια

Αυτό το έργο διανέμεται με την άδεια **MIT**.  
Δες το αρχείο [`LICENSE`](./LICENSE) για το πλήρες κείμενο.