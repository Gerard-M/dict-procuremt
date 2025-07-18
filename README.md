# ILCDB Management System

This application is a comprehensive management system designed to streamline and track key processes for the ILCDB. It provides dedicated modules for Procurement, Honoraria, and Travel Vouchers, offering a centralized platform for creating, managing, and monitoring financial records.

## ✨ Features

- **Centralized Dashboard:** Quick access to all financial modules from a single, user-friendly interface.
- **Procurement Tracking:** A multi-phase system to monitor procurement requests from pre-procurement to post-procurement, ensuring all checklist items are completed and signed off.
- **Honoraria Processing:** A simplified, single-phase process for managing payments for professional fees.
- **Travel Voucher Management:** An efficient system for handling travel expense claims and reimbursements.
- **Digital Signatures:** Capture and store digital signatures for accountability and paperless processing.
- **PDF Export:** Generate a comprehensive summary report for any record, complete with all checklist items and signatures, ready for printing or digital archiving.
- **Real-time Data:** Built on Firebase Realtime Database for instantaneous updates.

## 🚀 Getting Started

To run the application locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 📖 User Manual

### 1. Main Dashboard

The application opens to the main dashboard, which displays three primary modules:

-   **Procurement:** For managing the purchase of supplies and services.
-   **Honoraria:** For processing payments for professional fees.
-   **Travel Vouchers:** For handling travel expense claims.

Click the "Open" button on any card to enter that module's specific dashboard.

### 2. Procurement Module

#### Creating a New Procurement Record

1.  From the Procurement Dashboard, click the **"Create New"** button.
2.  Fill in the required fields in the dialog box:
    -   **Activity/Procurement Title:** A descriptive title for the procurement.
    -   **Amount:** The total amount of the procurement.
    -   **PR Number:** The Purchase Request number in `YYYY-NN-NN` format. If you enter a number in a slightly incorrect format, the system will use AI to suggest a valid correction.
    -   **Project Type:** Select the associated project from the dropdown. If "OTHERS" is selected, a new field will appear to specify the project type.
3.  Click **"Create Procurement"** to save the new record.

#### Managing a Procurement Record

-   The procurement process is divided into **6 phases**.
-   Click on a record from the dashboard table to go to its detail page.
-   On the detail page, you will see the phases organized in tabs. You must complete a phase before the next one is unlocked.
-   **To complete a phase:**
    1.  Check off all the required items in the **Checklist**.
    2.  Fill in the **"Submitted by"** and **"Received by"** sections, including Name, Signature, and any optional Remarks.
    3.  Click the **"Continue to Next Phase"** button.
-   Once the final phase is completed, the entire procurement record is marked as "Completed".

### 3. Honoraria Module

#### Creating a New Honoraria Record

1.  From the Honoraria Dashboard, click the **"Create New"** button.
2.  Fill in the fields:
    -   **Activity/Program Title:** The title of the event or activity.
    -   **Amount:** The honorarium fee.
    -   **Project Type:** Select the associated project.
3.  Click **"Create Record"**.

#### Processing an Honoraria Record

-   The honoraria process has a single phase.
-   Click on a record to go to its detail page.
-   **To complete the process:**
    1.  Check off all items in the **Checklist**.
    2.  Complete the **"Submitted by"** and **"Received by"** signature blocks.
    3.  Click the **"Continue to Next Phase"** button to mark the record as "Completed".

### 4. Travel Voucher Module

#### Creating a New Travel Voucher

1.  From the Travel Voucher Dashboard, click the **"Create New"** button.
2.  Fill in the fields:
    -   **Activity/Program Title:** The title of the travel-related event.
    -   **Amount:** The total claimable amount.
    -   **Project Type:** Select the associated project.
3.  Click **"Create Record"**.

#### Processing a Travel Voucher

-   The travel voucher process has a single phase.
-   Click on a record to go to its detail page.
-   **To complete the process:**
    1.  Check off all items in the **Checklist**.
    2.  Complete the **"Submitted by"** and **"Received by"** signature blocks.
    3.  Click **"Continue to Next Phase"** to mark the record as "Completed".

### 5. Exporting a Summary PDF

In any record's detail view (Procurement, Honoraria, or Travel Voucher), you can generate a summary report.

1.  Click the **"View Progress"** or **"View Summary"** button.
2.  A dialog will appear showing a preview of the summary document.
3.  Click the **"Download PDF"** button to save a copy of the report. This document includes all details, checklist statuses, and signatures.
