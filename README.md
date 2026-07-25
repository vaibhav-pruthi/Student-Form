# Student Enrollment Form

A modern, high-fidelity college micro-project utilizing **HTML5, CSS3, Vanilla JavaScript, and JsonPowerDB (JPDB)** to manage student registration records.

The application operates as a serverless single-page application (SPA), interacting directly with the JsonPowerDB database engine via REST APIs.

---

## 🚀 Key Features

*   **State-Driven Form Inputs:** The form starts in a locked state (only `Roll-No` active). Fields and action buttons unlock dynamically based on database queries.
*   **Database Roll-No Lookup:** Checking a `Roll-No` queries the database automatically:
    *   *If the record exists:* Populates the student details, disables editing on the `Roll-No` primary key, and enables **Update** and **Reset** actions.
    *   *If the record is new:* Unlocks all editing inputs, and enables **Save** and **Reset** actions.
*   **Form Validation Engine:** Checks for empty values, verifies numeric constraints, and validates dates (e.g. Birth Date must be in the past, and Enrollment Date must occur after Birth Date).
*   **Dynamic Visual Loader:** Shows a loading spinner during active database lookups or writes to improve the user experience.
*   **Prevent Form Reloads:** Blocks default browser form submissions (like pressing Enter inside input fields) to prevent loss of state.
*   **Premium UI/UX:** Styled with a dark-indigo glassmorphism theme, custom styled input states, dynamic status alerts, and mobile responsiveness.

---

## 🛠️ Tech Stack & Dependencies

1.  **HTML5:** Structured semantic markup with accessibility bindings.
2.  **CSS3:** Vanilla CSS featuring CSS variables (`:root`), flexbox, grid, backdrop-filter blur, and keyframe animations.
3.  **JavaScript:** Clean, modular Vanilla JS controller.
4.  **jQuery CDN (v3.6.0):** Shorthand Ajax library required by JPDB Commons.
5.  **JsonPowerDB Commons (v0.0.4):** Official Javascript helper API provided by Login2Xplore.
6.  **FontAwesome (v6.4.0):** Icons used in inputs, buttons, and alert banners.
7.  **Google Fonts (Inter):** Typography styling.

---

## 📂 Project Structure

```text
StudentEnrollmentForm/
├── index.html              # Main application markup & CDN loaders
├── README.md               # Setup and project documentation
├── css/
│   └── style.css           # Custom glassmorphic styling & responsive layouts
└── js/
    └── index.js            # Validation engine, form states, and JPDB CRUD operations
```

---

## 💾 Database Configuration

The application is configured to connect to the following database schema on the JsonPowerDB server:

*   **Database (DB) Name:** `SCHOOL-DB`
*   **Relation (Table) Name:** `STUDENT-TABLE`
*   **Primary Key Reference:** `Roll-No`
*   **Connection Token:** `YOUR_TOKEN`

These values are centralized at the top of `js/index.js` for easy modification:
```javascript
const BASE_URL = "http://api.login2explore.com:5577";
const CONN_TOKEN = "YOUR_TOKEN";
const DB_NAME = "SCHOOL-DB";
const RELATION_NAME = "STUDENT-TABLE";
```

---

## 💻 How to Run the Project

### Option 1: Direct File Launch (No Setup Required)
1. Navigate to the project root folder.
2. Double-click [index.html](./index.html) (or right-click and choose **Open with Browser**).
3. The page will load and connect directly to your JsonPowerDB workspace over the internet.

### Option 2: Run via VS Code Live Server (Recommended)
1. Open the project root folder inside **Visual Studio Code**.
2. If you do not have the **Live Server** extension installed, navigate to the Extensions tab (`Ctrl+Shift+X`), search for "Live Server", and click install.
3. Open `index.html`.
4. Click the **Go Live** button in the bottom right status bar of VS Code, or right-click `index.html` and select **Open with Live Server**.
5. The project will open automatically on a local port (e.g., `http://127.0.0.1:5500/index.html`).

### Option 3: Run via Python Local Server
If you have Python installed on your system, you can spin up a quick server via terminal:
1. Open PowerShell or Command Prompt in the project folder.
2. Execute the command:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to `http://localhost:8000`.

---

## 🔄 CRUD Workflow Reference

1.  **Form Load:** Page mounts -> `initForm()` executes -> locks form inputs except `Roll-No` -> focuses cursor on `Roll-No`.
2.  **Lookup Check:** User types `Roll-No` and exits field -> `checkRollNoExists()` calls JPDB IRL endpoint (`/api/irl`) via the `GET_BY_KEY` command -> state switches depending on search response.
3.  **Insert (Save):** User fills in form and clicks **Save** -> `saveStudent()` validates the input and dispatches a `PUT` command to `/api/iml` -> form resets on success.
4.  **Update (Modify):** User alters populated details and clicks **Update** -> `updateStudent()` validates details and sends an `UPDATE` request along with the cached record number (`rec_no`) to `/api/iml` -> form resets on success.
5.  **Reset:** User clicks **Reset** -> clears data, locks inputs, and focuses back on the `Roll-No` field.
