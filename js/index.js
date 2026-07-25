/**
 * Student Enrollment Form Control Logic
 * Connected with JsonPowerDB - Phase 6
 */

/* ==========================================================================
   1. Centralized JPDB Configuration & Constants
   ========================================================================== */
const BASE_URL = "http://api.login2explore.com:5577";
// Note: CONN_TOKEN is loaded dynamically from js/config.js to keep credentials secure
const DB_NAME = "SCHOOL-DB";
const RELATION_NAME = "STUDENT-TABLE";

// JPDB Endpoint paths
const IRL_ENDPOINT = "/api/irl"; // Index Retrieval Language (Queries & Reads)
const IML_ENDPOINT = "/api/iml"; // Index Manipulation Language (Writes & Updates)

/* ==========================================================================
   2. DOM Element Caching
   ========================================================================== */
const formEl = document.getElementById('studentForm');
const rollNoInput = document.getElementById('rollNo');
const fullNameInput = document.getElementById('fullName');
const classInput = document.getElementById('studentClass');
const birthDateInput = document.getElementById('birthDate');
const addressInput = document.getElementById('address');
const enrollmentDateInput = document.getElementById('enrollmentDate');

const btnSave = document.getElementById('btnSave');
const btnUpdate = document.getElementById('btnUpdate');
const btnReset = document.getElementById('btnReset');
const notificationArea = document.getElementById('notificationArea');
const loadingIndicator = document.getElementById('loadingIndicator');

// Global state variable to cache the JPDB internal record number (rec_no) for updates
window.saveRecNo = "";

/* ==========================================================================
   3. Reusable UI Helper Functions
   ========================================================================== */

/**
 * Sets the disabled attribute on a form field.
 * @param {HTMLElement} element - The form control element.
 * @param {boolean} isDisabled - True to disable, false to enable.
 */
function setFieldDisabledState(element, isDisabled) {
    if (element) {
        element.disabled = isDisabled;
    }
}

/**
 * Sets the disabled attribute on an action button.
 * @param {HTMLElement} button - The button element.
 * @param {boolean} isDisabled - True to disable, false to enable.
 */
function setButtonDisabledState(button, isDisabled) {
    if (button) {
        button.disabled = isDisabled;
    }
}

/**
 * Displays a beautiful alert message within the form banner area.
 * @param {string} msg - The notification message.
 * @param {string} type - The alert type ('success', 'error', 'info').
 */
function showNotification(msg, type = 'info') {
    if (!notificationArea) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    
    alertDiv.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${msg}</span>`;
    
    notificationArea.innerHTML = '';
    notificationArea.appendChild(alertDiv);
}

/**
 * Flushes all alert banners inside the notification container.
 */
function clearNotification() {
    if (notificationArea) {
        notificationArea.innerHTML = '';
    }
}

/**
 * Toggles the visibility of the database connectivity loader spinner.
 * @param {boolean} show - True to display the loader, false to hide it.
 */
function toggleLoading(show) {
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

/**
 * Resets the application state back to start configurations.
 */
function initForm() {
    // Hide database loader spinner
    toggleLoading(false);

    // Clear global cached database record primary key index
    window.saveRecNo = "";

    // Clear form inputs
    if (formEl) {
        formEl.reset();
    }

    // Initialize inputs: Only Roll-No can be typed in
    setFieldDisabledState(rollNoInput, false);
    setFieldDisabledState(fullNameInput, true);
    setFieldDisabledState(classInput, true);
    setFieldDisabledState(birthDateInput, true);
    setFieldDisabledState(addressInput, true);
    setFieldDisabledState(enrollmentDateInput, true);

    // Initialize buttons: Buttons disabled on entry
    setButtonDisabledState(btnSave, true);
    setButtonDisabledState(btnUpdate, true);
    setButtonDisabledState(btnReset, true);

    // Focus cursor to Roll-No field
    if (rollNoInput) {
        rollNoInput.focus();
    }
}

/* ==========================================================================
   4. Data Validation Engine
   ========================================================================== */

/**
 * Checks if a string value is empty or contains only spaces.
 * @param {string} val - The string to check.
 * @returns {boolean} True if empty/spaces, false otherwise.
 */
function isEmpty(val) {
    return !val || val.trim().length === 0;
}

/**
 * Checks if a value represents a positive integer.
 * @param {string} val - The value to check.
 * @returns {boolean} True if positive integer, false otherwise.
 */
function isPositiveNumeric(val) {
    const num = Number(val);
    return !isNaN(num) && Number.isInteger(num) && num > 0;
}

/**
 * Compiles, trims, and validates student enrollment form inputs.
 * Displays descriptive alert messages and focuses on the first offending field.
 * @returns {Object|null} Structured database column object if valid, null otherwise.
 */
function validateAndGetFormData() {
    // Retrieve trimmed values from all inputs
    const rollNoVal = rollNoInput.value.trim();
    const fullNameVal = fullNameInput.value.trim();
    const classVal = classInput.value.trim();
    const birthDateVal = birthDateInput.value.trim();
    const addressVal = addressInput.value.trim();
    const enrollmentDateVal = enrollmentDateInput.value.trim();

    // 1. Roll-No Validation
    if (isEmpty(rollNoVal)) {
        showNotification("Roll Number field is required.", "error");
        rollNoInput.focus();
        return null;
    }
    if (!isPositiveNumeric(rollNoVal)) {
        showNotification("Roll Number must be a valid positive integer.", "error");
        rollNoInput.focus();
        return null;
    }

    // 2. Full Name Validation
    if (isEmpty(fullNameVal)) {
        showNotification("Full Name field is required.", "error");
        fullNameInput.focus();
        return null;
    }

    // 3. Class Validation
    if (isEmpty(classVal)) {
        showNotification("Class field is required.", "error");
        classInput.focus();
        return null;
    }

    // 4. Birth Date Validation
    if (isEmpty(birthDateVal)) {
        showNotification("Birth Date field is required.", "error");
        birthDateInput.focus();
        return null;
    }
    const dob = new Date(birthDateVal);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zero hours for strict date comparison
    if (dob >= today) {
        showNotification("Birth Date must be a date in the past.", "error");
        birthDateInput.focus();
        return null;
    }

    // 5. Address Validation
    if (isEmpty(addressVal)) {
        showNotification("Address field is required.", "error");
        addressInput.focus();
        return null;
    }

    // 6. Enrollment Date Validation
    if (isEmpty(enrollmentDateVal)) {
        showNotification("Enrollment Date field is required.", "error");
        enrollmentDateInput.focus();
        return null;
    }
    const enrollDate = new Date(enrollmentDateVal);
    if (enrollDate < dob) {
        showNotification("Enrollment Date cannot be earlier than the student's Birth Date.", "error");
        enrollmentDateInput.focus();
        return null;
    }

    // Flush any preceding validation error highlights
    clearNotification();

    // Map object properties to match database schema casings
    return {
        "Roll-No": rollNoVal,
        "Full-Name": fullNameVal,
        "Class": classVal,
        "Birth-Date": birthDateVal,
        "Address": addressVal,
        "Enrollment-Date": enrollmentDateVal
    };
}

/* ==========================================================================
   5. Database Communication & Form Transitions
   ========================================================================== */

/**
 * Handles the Roll-No field change event. Queries JPDB via IRL
 * to check if the roll number exists, and adjusts form states accordingly.
 */
function checkRollNoExists() {
    const rollNoVal = rollNoInput.value.trim();
    if (!rollNoVal) {
        clearNotification();
        return;
    }

    // 1. Basic validation: Roll-No must be a positive numeric value
    if (isNaN(rollNoVal) || Number(rollNoVal) <= 0) {
        showNotification("Please enter a valid positive numeric Roll Number.", "error");
        rollNoInput.focus();
        return;
    }

    // 2. Build the GET_BY_KEY request object
    // We target the field "Roll-No" (as primary key index)
    const lookupObj = {
        "Roll-No": rollNoVal
    };
    
    // createGET_BY_KEYRequest is a helper from jpdb-commons.js
    // Parameters: token, dbName, relName, jsonObjStr, createTime, updateTime
    const requestStr = createGET_BY_KEYRequest(
        CONN_TOKEN,
        DB_NAME,
        RELATION_NAME,
        JSON.stringify(lookupObj),
        false,
        false
    );

    // 3. Make HTTP request to JPDB IRL endpoint
    // We execute synchronously to block user UI input during lookup transition
    clearNotification();
    toggleLoading(true);
    $.ajaxSetup({ async: false });
    const response = executeCommandAtGivenBaseUrl(requestStr, BASE_URL, IRL_ENDPOINT);
    $.ajaxSetup({ async: true });
    toggleLoading(false);

    // 4. Handle response states
    if (response.status === 400) {
        // CASE A: Record NOT found (JPDB returns status 400 for lookup fail)
        showNotification("Roll Number not found in record. You may enter details and Save.", "info");

        // Enable editing fields
        setFieldDisabledState(fullNameInput, false);
        setFieldDisabledState(classInput, false);
        setFieldDisabledState(birthDateInput, false);
        setFieldDisabledState(addressInput, false);
        setFieldDisabledState(enrollmentDateInput, false);

        // Buttons: Enable Save and Reset, keep Update disabled
        setButtonDisabledState(btnSave, false);
        setButtonDisabledState(btnUpdate, true);
        setButtonDisabledState(btnReset, false);

        // Focus cursor to Full Name input
        fullNameInput.focus();

    } else if (response.status === 200) {
        // CASE B: Record found (JPDB returns status 200)
        showNotification("Roll Number found! Record retrieved.", "success");

        try {
            // JPDB stores record payload inside stringified 'data' attribute
            const dataObj = JSON.parse(response.data);
            const record = dataObj.record;

            // Cache the internal record number (rec_no) to perform UPDATE target operations later
            window.saveRecNo = dataObj.rec_no;

            // Populate form values
            fullNameInput.value = record["Full-Name"] || "";
            classInput.value = record["Class"] || "";
            birthDateInput.value = record["Birth-Date"] || "";
            addressInput.value = record["Address"] || "";
            enrollmentDateInput.value = record["Enrollment-Date"] || "";

            // Transition states: Disable Roll-No to protect PK, enable other fields for edits
            setFieldDisabledState(rollNoInput, true);
            setFieldDisabledState(fullNameInput, false);
            setFieldDisabledState(classInput, false);
            setFieldDisabledState(birthDateInput, false);
            setFieldDisabledState(addressInput, false);
            setFieldDisabledState(enrollmentDateInput, false);

            // Buttons: Enable Update and Reset, keep Save disabled
            setButtonDisabledState(btnSave, true);
            setButtonDisabledState(btnUpdate, false);
            setButtonDisabledState(btnReset, false);

            // Move cursor to Full Name
            fullNameInput.focus();

        } catch (error) {
            showNotification("Error parsing database data: " + error.message, "error");
        }
    } else {
        // CASE C: Connection error or internal token/schema issue
        showNotification("Database Error: " + response.message, "error");
    }
}

/**
 * Validates, formats, and executes an insert (PUT) operation to write
 * student details to SCHOOL-DB STUDENT-TABLE on JsonPowerDB.
 */
function saveStudent() {
    // 1. Invoke validation compiler
    const formData = validateAndGetFormData();
    if (!formData) {
        return; // Validation failed; user has been alerted
    }

    // 2. Generate PUT request payload
    // Parameters: token, jsonObjStr, dbName, relName
    const putRequestStr = createPUTRequest(
        CONN_TOKEN,
        JSON.stringify(formData),
        DB_NAME,
        RELATION_NAME
    );

    // 3. Dispatch synchronous POST request to JPDB IML endpoint
    clearNotification();
    toggleLoading(true);
    $.ajaxSetup({ async: false });
    const response = executeCommandAtGivenBaseUrl(putRequestStr, BASE_URL, IML_ENDPOINT);
    $.ajaxSetup({ async: true });
    toggleLoading(false);

    // 4. Handle response states
    if (response.status === 200) {
        // Success case
        showNotification("Student record saved successfully!", "success");
        // Revert form back to initial focus state
        initForm();
    } else {
        // Failure case
        showNotification("Failed to save student record: " + response.message, "error");
    }
}

/**
 * Validates, formats, and executes an update (UPDATE) operation to modify
 * existing student details in SCHOOL-DB STUDENT-TABLE using the cached record number (saveRecNo).
 */
function updateStudent() {
    // 1. Invoke validation compiler
    const formData = validateAndGetFormData();
    if (!formData) {
        return; // Validation failed; user has been alerted
    }

    // Double check that we have a valid record number cached
    if (!window.saveRecNo) {
        showNotification("No record identifier found. Try querying the Roll Number again.", "error");
        return;
    }

    // 2. Generate UPDATE request payload
    // Parameters: token, jsonObjStr, dbName, relName, recNo
    const updateRequestStr = createUPDATERecordRequest(
        CONN_TOKEN,
        JSON.stringify(formData),
        DB_NAME,
        RELATION_NAME,
        window.saveRecNo
    );

    // 3. Dispatch synchronous POST request to JPDB IML endpoint
    clearNotification();
    toggleLoading(true);
    $.ajaxSetup({ async: false });
    const response = executeCommandAtGivenBaseUrl(updateRequestStr, BASE_URL, IML_ENDPOINT);
    $.ajaxSetup({ async: true });
    toggleLoading(false);

    // 4. Handle response states
    if (response.status === 200) {
        // Success case
        showNotification("Student record updated successfully!", "success");
        // Revert form back to initial focus state
        initForm();
    } else {
        // Failure case
        showNotification("Failed to update student record: " + response.message, "error");
    }
}

/* ==========================================================================
   6. Event Listeners Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Run initial form setup on page load
    initForm();

    // Prevent browser default form submission reloads (capturing Enter keystroke events)
    if (formEl) {
        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    // Bind change listener on Roll Number input to perform dynamic query search
    if (rollNoInput) {
        rollNoInput.addEventListener('change', checkRollNoExists);
    }

    // Bind Save button click action
    if (btnSave) {
        btnSave.addEventListener('click', saveStudent);
    }

    // Bind Update button click action
    if (btnUpdate) {
        btnUpdate.addEventListener('click', updateStudent);
    }

    // Bind Reset button click action
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            initForm();
            clearNotification();
        });
    }
});
