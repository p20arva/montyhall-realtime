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
  π.χ. `http://192.168.Χ.Υ:5500/MontyHall.html`

- **Admin (μόνο host):**
  `http://localhost:5500/admin.html`  
  Την **πρώτη φορά** θα ζητήσει **Admin key** (το `ADMIN_KEY` του `.env`) και το αποθηκεύει τοπικά.

> Αν καλέσεις `admin.html` από LAN (`http://<LAN-IP>:5500/admin.html`) θα πάρεις **403 Forbidden** — σκόπιμα.

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

---

# 🔧 Αναλυτικός οδηγός εγκατάστασης & troubleshooting (Terminal-first)

## 0) Προαπαιτούμενα (εγκατάσταση εργαλείων μέσω terminal)

### Windows (PowerShell)
```powershell
# Εγκατάσταση Git
winget install --id Git.Git -e

# Εγκατάσταση Node LTS (18+)
winget install --id OpenJS.NodeJS.LTS -e

# Έλεγχος εκδόσεων
git --version
node -v
npm -v
```

### macOS (Terminal)
> Αν δεν έχεις Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
```bash
brew install git node
git --version
node -v
npm -v
```

### Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install -y git curl
# Node LTS με nvm (προτείνεται)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# κλείσε-άνοιξε terminal ή:
source ~/.nvm/nvm.sh
nvm install --lts
git --version
node -v
npm -v
```

---

## 1) Κατέβασμα του project (clone)
```bash
# Windows (PowerShell)
cd $env:USERPROFILE\Desktop | cd Desktop
git clone https://github.com/p20arva/montyhall-realtime.git
cd montyhall-realtime

# macOS/Linux (Terminal)
cd ~/Desktop
git clone https://github.com/p20arva/montyhall-realtime.git
cd montyhall-realtime
```

---

## 2) Εγκατάσταση dependencies
```bash
npm i
```

> (Προαιρετικά για development auto-reload)
```bash
npm i -D nodemon
```

---

## 3) Ρύθμιση μεταβλητών περιβάλλοντος (.env)
Δημιούργησε `.env` από το δείγμα:
```bash
# Windows (CMD/PowerShell)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Άνοιξε το `.env`...
```bash
notepad .env
```
...και βάλε:
```
PORT=5500
ADMIN_KEY=<ισχυρό_κλειδί>
```

**Γρήγορη γεννήτρια κλειδιού (Node):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

**Έλεγχος ότι φορτώνεται σωστά:**
```bash
node -e "require('dotenv').config(); console.log('PORT=',process.env.PORT,'KEYLEN=',(process.env.ADMIN_KEY||'').length)"
# Αναμένεται: PORT= 5500, KEYLEN > 0
```

---

## 4) Εκκίνηση server
Τρέξε **ένα** από τα δύο:
```bash
npm start         # παραγωγικά (μία εκτέλεση)

# ή (αν έχεις βάλει nodemon)
npm run dev       # development με auto-restart
```
Αναμενόμενη έξοδος:
```
MontyHall realtime backend on http://0.0.0.0:5500
```

---

## 5) Άνοιγμα σελίδων
- **Παιχνίδι (στο ίδιο PC):**  
  `http://localhost:5500/MontyHall.html`
- **Παιχνίδι (από άλλη συσκευή στο ίδιο Wi-Fi/LAN):**  
  `http://<LAN-IP>:5500/MontyHall.html`
- **Admin (μόνο host):**  
  `http://localhost:5500/admin.html`  
  → Την **πρώτη φορά** ζητά το **ADMIN_KEY** (από το `.env`) και το αποθηκεύει τοπικά.

> Admin από LAN (`http://<LAN-IP>:5500/admin.html`) επιστρέφει **403 Forbidden** (σκόπιμα).

---

## 6) Βρες το LAN IP σου (για να ανοίξεις το παιχνίδι από κινητό)

- **Windows**
  1. Άνοιξε PowerShell ή Command Prompt
  2. Τρέξε:
```powershell
      ipconfig
```
  3. Βρες το **IPv4 Address** της κάρτας δικτύου που χρησιμοποιείς (Wi-Fi/Ethernet), π.χ. `192.168.x.y`.

- **macOS**
  1. Άνοιξε Terminal
  2. Τρέξε: 
```bash
      ipconfig getifaddr en0     # Wi-Fi (συνήθως)
      ipconfig getifaddr en1     # Ethernet
      # ή
      ifconfig | grep 'inet ' | grep -v 127.0.0.1 # Εναλλακτικά
```
  3. Σημείωσε τη διεύθυνση τύπου `192.168.x.y`
  
- **Linux**
  1. Άνοιξε Terminal
  2. Τρέξε: 
```bash
      ip a | grep 'inet ' | grep -v 127.0.0.1
      # ή
      hostname -I
```
  3. Σημείωσε τη διεύθυνση τύπου `192.168.x.y`

Χρησιμοποίησε αυτό το LAN IP στο URL του παιχνιδιού:  
`http://<LAN-IP>:5500/MontyHall.html`

---

## 7) Γρήγορο functional test
1. Άνοιξε `http://localhost:5500/MontyHall.html` → παίξε 1 γύρο.  
2. Βάλε μεγάλο αριθμό αυτόματων γύρων (π.χ. `58686543`) → να εμφανιστεί μήνυμα **cap 1.000.000** και να τρέξει.  
3. Άνοιξε `http://localhost:5500/admin.html`, βάλε **ADMIN_KEY** → δες **Active players** & **Last update** να ανανεώνονται.  
4. Δοκίμασε **Export JSON/CSV** και **Reset stats δικτύου** (μηδενίζει totals).  
5. Από κινητό στο ίδιο Wi-Fi: άνοιξε `http://<LAN-IP>:5500/MontyHall.html` → παίξε 1-2 γύρους και δες τα totals live στο admin.

---

## 8) Troubleshooting (συχνά σενάρια & λύσεις)

### A) “Port already in use” (ο 5500 είναι πιασμένος)
**Windows**
```powershell
netstat -ano | findstr :5500
# σημείωσε το PID, π.χ. 12345
taskkill /PID 12345 /F
```
**macOS/Linux**
```bash
lsof -i :5500
# σημείωσε το PID
kill -9 <PID>
```
> Εναλλακτικά, άλλαξε το `PORT` στο `.env` (π.χ. 5501) και ξανατρέξε `npm start`.

### B) Admin γράφει “unauthorized”
- Έβαλες λάθος κλειδί την πρώτη φορά.  
  **Λύση:** καθάρισε το αποθηκευμένο κλειδί και ανανέωσε τη σελίδα.
  - Chrome/Edge: DevTools → **Application** → **Local Storage** → σβήσε `ADMIN_KEY`
  - Ή απλά στην κονσόλα:
    ```js
    localStorage.removeItem('ADMIN_KEY')
    location.reload()
    ```

### C) Admin από κινητό/άλλο PC βγάζει 403
- Αυτό είναι **σωστό**: admin επιτρέπεται μόνο από `localhost`. Χρησιμοποίησε τον admin στο ίδιο PC όπου τρέχει ο server:  
  `http://localhost:5500/admin.html`

### D) Το κινητό δεν ανοίγει το παιχνίδι
- Πιθανότητες:
  - **Λάθος IP**: βεβαιώσου ότι χρησιμοποιείς το σωστό **LAN IP** του PC (βλ. §6). (Μπορείς να σκανάρεις το QR code για εύκολη σύνδεση)
  - **Διαφορετικά δίκτυα**: PC και κινητό πρέπει να είναι στο **ίδιο** Wi-Fi/LAN.
  - **Firewall Windows**: Πρόσθεσε inbound rule ή επίτρεψε το Node στην ειδοποίηση του Firewall.

### E) Το `.env` δεν “διαβάζεται”
- Τρέξε:
  ```bash
  node -e "require('dotenv').config(); console.log('PORT=',process.env.PORT,'KEYLEN=',(process.env.ADMIN_KEY||'').length)"
  ```
  - Αν `KEYLEN=0`: άνοιξε `.env` και βάλε/σώσε σωστά το `ADMIN_KEY`.
  - Σιγουρέψου ότι το `.env` είναι **δίπλα** στο `server.js`.

### F) Θέλω auto-reload σε αλλαγές αρχείων
- Εγκατάστησε nodemon και χρησιμοποίησε `npm run dev`:
  ```bash
  npm i -D nodemon
  ```
  **package.json (scripts)**
  ```json
  {
    "start": "node server.js",
    "dev": "nodemon --watch . --ext js,html,css server.js"
  }
  ```

---

## 9) Χρήσιμες εντολές Git (για πλήρη κύκλο)
```bash
# Δημιουργία νέου commit
git add .
git commit -m "chore: update readme/troubleshooting"

# Push στο GitHub
git push

# Τράβηγμα αλλαγών από το remote
git pull

# Νέο tag έκδοσης
git tag -a v1.0.1 -m "Clean history release"
git push origin v1.0.1
```

