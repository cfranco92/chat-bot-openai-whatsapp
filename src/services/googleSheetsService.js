import path from "path";
import { google } from "googleapis";
import config from "../config/env.js";

const sheets = google.sheets("v4");

async function addRowToSheet(auth, spreadsheetId, values) {
  // Configure the request to append a new row to the sheet
  const request = {
    spreadsheetId,
    range: "reservas",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [values],
    },
    auth,
  };

  try {
    const response = await sheets?.spreadsheets?.values?.append(request)?.data;
    return response;
  } catch (error) {
    // Log and handle errors when adding a row to the sheet
    console.error("Error adding row to sheet:", error);
    return "Error adding row to sheet";
  }
}

const appendToSheet = async (data) => {
  try {
    // Initialize Google Auth with credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "src/credentials", "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Get authenticated client and spreadsheet ID
    const authClient = await auth.getClient();
    const spreadsheetId = config.SPREAD_SHEET_ID;

    // Add the data to the sheet
    await addRowToSheet(authClient, spreadsheetId, data);
    return "Data added successfully";
  } catch (error) {
    // Log and handle errors when appending to the sheet
    console.error("Error appending to sheet:", error);
    return "Error appending to sheet";
  }
};

export default appendToSheet;
