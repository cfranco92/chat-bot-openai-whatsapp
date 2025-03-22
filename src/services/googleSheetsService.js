import path from "path";
import { google } from "googleapis";
import config from "../config/env.js";

const sheets = google.sheets("v4");

async function addRowToSheet(auth, spreadsheetId, values) {
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
    console.error("Error adding row to sheet:", error);
    return "Error adding row to sheet";
  }
}

const appendToSheet = async (data) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "src/credentials", "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const spreadsheetId = config.SPREAD_SHEET_ID;

    await addRowToSheet(authClient, spreadsheetId, data);
    return "Data added successfully";
  } catch (error) {
    console.error("Error appending to sheet:", error);
    return "Error appending to sheet";
  }
};

export default appendToSheet;
