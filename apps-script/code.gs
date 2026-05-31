/**
 * Google Apps Script Backend for IoT Smart RFID Shopping Cart
 * 
 * This script runs as a Web App and serves as the bridge between:
 * 1. ESP32 (which uploads scanned tags using HTTP GET)
 * 2. Google Sheets (which serves as the cloud database)
 * 3. React Frontend (which pulls the items list in real-time)
 * 
 * Deployment URL structure:
 * https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
 * 
 * Spreadsheet Column Layout (Original):
 * | Column A (0) | Column B (1) | Column C (2) | Column D (3) |
 * | UID          | Product Name | Price        | Timestamp    |
 */

function doGet(e) {
  // Add CORS headers for web clients
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var action = e.parameter.action;

    // Handle "add" action: ESP32 scanned an RFID tag
    if (action === "add" || e.parameter.uid) {
      var uid = e.parameter.uid;
      var product = e.parameter.product || "Unknown Product";
      var price = parseFloat(e.parameter.price) || 0.0;
      var timestamp = new Date();

      // Format Timestamp: YYYY-MM-DD HH:MM:SS
      var formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

      // Check for valid inputs
      if (!uid) {
        return createJsonResponse({
          "status": "error",
          "message": "Missing RFID tag UID"
        }, 400);
      }

      // Append row to sheet: UID, Product Name, Price, Timestamp
      sheet.appendRow([uid, product, price, formattedTimestamp]);

      return createJsonResponse({
        "status": "success",
        "message": "Item added successfully",
        "data": {
          "uid": uid,
          "product": product,
          "price": price,
          "timestamp": formattedTimestamp
        }
      });
    }

    // Handle "clear" action: Website requested to empty the cart
    if (action === "clear") {
      var lastRow = sheet.getLastRow();
      
      if (lastRow > 1) {
        // Keep header row (row 1), delete rows below it
        sheet.deleteRows(2, lastRow - 1);
      }

      return createJsonResponse({
        "status": "success",
        "message": "Cart cleared successfully"
      });
    }

    // Default action / "get": Read items from Google Sheet
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var items = [];

    // Check if sheet contains rows besides header
    if (values.length > 1) {
      // Columns index mapping:
      // Row 1 represents headers: [UID, Product Name, Price, Timestamp]
      for (var i = 1; i < values.length; i++) {
        var row = values[i];
        
        // Skip empty rows if any
        if (!row[0] && !row[1]) continue;

        items.push({
          "uid": row[0] ? row[0].toString().trim() : "",
          "productName": row[1] ? row[1].toString().trim() : "Unknown Product",
          "price": parseFloat(row[2]) || 0.0,
          "timestamp": row[3] ? row[3].toString() : ""
        });
      }
    }

    return createJsonResponse({
      "status": "success",
      "count": items.length,
      "data": items
    });

  } catch (error) {
    return createJsonResponse({
      "status": "error",
      "message": error.toString()
    }, 500);
  }
}

/**
 * Helper function to construct JSON response output with CORS support
 */
function createJsonResponse(responseObj, statusCode) {
  var JSONString = JSON.stringify(responseObj);
  return ContentService.createTextOutput(JSONString)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup function to initialize Sheet headers if they are empty
 */
function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["UID", "Product Name", "Price", "Timestamp"]);
  }
}
