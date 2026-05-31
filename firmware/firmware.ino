/**
 * IoT-Based Smart RFID Shopping Cart Firmware (ESP32)
 * 
 * Hardware Connections:
 * ----------------------------------------------------
 * MFRC522 RFID Reader:
 *   SDA (SS)  -> GPIO 5
 *   SCK       -> GPIO 18
 *   MOSI      -> GPIO 23
 *   MISO      -> GPIO 19
 *   RST       -> GPIO 22
 *   GND       -> GND
 *   3.3V      -> 3.3V (Do NOT connect to 5V!)
 * 
 * I2C 16x2 LCD Display:
 *   SDA       -> GPIO 21
 *   SCL       -> GPIO 4   <-- Avoids conflict with GPIO 22 (RST)
 *   VCC       -> VIN (5V) <-- Requires 5V for backlight brightness
 *   GND       -> GND
 * ----------------------------------------------------
 * 
 * Required Arduino Libraries:
 * 1. MFRC522 by github.com/OSSLibraries/Arduino_MFRC522 (or community version)
 * 2. LiquidCrystal_I2C by Frank de Brabander
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// --- Wi-Fi Credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- Google Apps Script Configuration ---
// Paste the published deployment URL of your Google Apps Script
const char* googleScriptUrl = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";

// --- Hardware Pin Definitions ---
#define RST_PIN         22   // RST pin for MFRC522
#define SS_PIN          5    // SDA (SS) pin for MFRC522
#define I2C_SDA_PIN     21   // Custom SDA for LCD
#define I2C_SCL_PIN     4    // Custom SCL for LCD (Avoids GPIO 22 conflict)

// --- RFID Setup ---
MFRC522 mfrc522(SS_PIN, RST_PIN);

// --- LCD Setup ---
// Standard I2C address is 0x27, 16 columns, 2 rows
LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- Predefined Product Database (Local Lookup) ---
struct Product {
  String uid;
  String name;
  float price;
};

// Example product listings (Matches card UIDs in hex)
const int PRODUCT_COUNT = 3;
Product productDb[PRODUCT_COUNT] = {
  {"A1B2C3", "Milk", 55.00},   // Replace with your actual card UID
  {"D4E5F6", "Bread", 40.00},  // Replace with your actual card UID
  {"G7H8I9", "Rice", 120.00}   // Replace with your actual card UID
};

// --- Shopping Session Variables ---
float totalBill = 0.00;
int totalItemsScanned = 0;

// --- Scan Debounce Variables ---
String lastScannedUid = "";
unsigned long lastScanTime = 0;
const unsigned long DEBOUNCE_COOLDOWN = 3000; // 3 seconds cooldown per UID

// --- Function Prototypes ---
void initWiFi();
void handleRFIDScan();
String getUIDString(byte *buffer, byte bufferSize);
Product findProduct(String uid);
void sendDataToCloud(Product prod, String rawUid);
void updateLCDDisplay(String line1, String line2);
String urlEncode(String str);

void setup() {
  // Initialize Serial communication
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- Smart Shopping Cart System Initializing ---");

  // Initialize custom I2C pins for Liquid Crystal LCD
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  // Initialize LCD Screen
  lcd.init();
  lcd.backlight();
  updateLCDDisplay("Smart Cart V1.0", "Initializing...");
  delay(2000);

  // Initialize Wi-Fi Connection
  initWiFi();

  // Initialize SPI bus for RFID reader
  SPI.begin();
  
  // Initialize MFRC522 RFID reader
  mfrc522.PCD_Init();
  delay(100);
  
  // Verify MFRC522 communication
  byte readReg = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
  Serial.print("MFRC522 Software Version: 0x");
  Serial.println(readReg, HEX);
  if (readReg == 0x00 || readReg == 0xFF) {
    Serial.println("WARNING: MFRC522 connection failed! Please check wiring.");
    updateLCDDisplay("MFRC522 Error", "Check Wiring");
    while (true); // Halt execution if RFID reader is not detected
  }

  Serial.println("System Ready. Scan an RFID card to start shopping.");
  updateLCDDisplay("Scan Card...", "Total: Rs 0.00");
}

void loop() {
  // Maintain Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    initWiFi();
  }

  // Look for new RFID cards
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    handleRFIDScan();
    // Halt PICC to stop reading the card continuously
    mfrc522.PICC_HaltA();
    // Stop encryption on PCD
    mfrc522.PCD_StopCrypto1();
  }
}

/**
 * Handle Wi-Fi Connection and status updates
 */
void initWiFi() {
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(ssid);
  updateLCDDisplay("Connecting Wi-Fi", "Please wait...");

  WiFi.begin(ssid, password);
  int retryCount = 0;
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    retryCount++;
    if (retryCount >= 20) {
      Serial.println("\nWi-Fi connection failed. Retrying...");
      updateLCDDisplay("WiFi Timeout", "Retrying...");
      delay(2000);
      retryCount = 0;
    }
  }

  Serial.println("\nWi-Fi Connected successfully!");
  Serial.print("Local IP Address: ");
  Serial.println(WiFi.localIP());
  updateLCDDisplay("Wi-Fi Connected", "Ready to scan!");
  delay(1500);
}

/**
 * Processes a scanned RFID tag UID
 */
void handleRFIDScan() {
  String scannedUid = getUIDString(mfrc522.uid.uidByte, mfrc522.uid.size);
  unsigned long currentTime = millis();

  Serial.print("\nCard detected! UID: ");
  Serial.println(scannedUid);

  // Debouncing logic: Check if the card was scanned in the last few seconds
  if (scannedUid == lastScannedUid && (currentTime - lastScanTime < DEBOUNCE_COOLDOWN)) {
    Serial.println("Ignored duplicate scan (Debounce cooldown active)");
    updateLCDDisplay("Duplicate Scan", "Please wait...");
    delay(1000);
    // Restore display
    updateLCDDisplay("Scan Card...", "Total: Rs " + String(totalBill, 2));
    return;
  }

  // Update cooldown parameters
  lastScannedUid = scannedUid;
  lastScanTime = currentTime;

  // Lookup product details
  Product matchedProduct = findProduct(scannedUid);

  if (matchedProduct.uid != "") {
    // Valid product found
    Serial.print("Product Matched: ");
    Serial.print(matchedProduct.name);
    Serial.print(" - Rs ");
    Serial.println(matchedProduct.price);

    // Update shopping total locally
    totalBill += matchedProduct.price;
    totalItemsScanned++;

    // Update screen to show scanned item
    updateLCDDisplay(matchedProduct.name, "Rs " + String(matchedProduct.price, 2));
    delay(2000);

    // Update LCD to show new cart total
    updateLCDDisplay("Item Added!", "Total: Rs " + String(totalBill, 2));
    delay(1500);

    // Upload transaction to Google Sheet
    sendDataToCloud(matchedProduct, scannedUid);

  } else {
    // Unrecognized tag
    Serial.println("Error: Unknown Product / Tag not registered in Database");
    updateLCDDisplay("Tag Unregistered", "Not in Database");
    delay(2000);
  }

  // Reset to scanning state
  updateLCDDisplay("Scan Card...", "Total: Rs " + String(totalBill, 2));
}

/**
 * Converts MFRC522 raw byte buffer to standard Hex String
 */
String getUIDString(byte *buffer, byte bufferSize) {
  String uidStr = "";
  for (byte i = 0; i < bufferSize; i++) {
    if(buffer[i] < 0x10) uidStr += "0";
    uidStr += String(buffer[i], HEX);
  }
  uidStr.toUpperCase();
  return uidStr;
}

/**
 * Perform database lookup for products
 */
Product findProduct(String uid) {
  for (int i = 0; i < PRODUCT_COUNT; i++) {
    if (productDb[i].uid == uid) {
      return productDb[i];
    }
  }
  // Return empty struct if no match is found
  Product emptyProduct = {"", "", 0.00};
  return emptyProduct;
}

/**
 * Transmits scanned product data to Google Sheets via secure redirect handling
 */
void sendDataToCloud(Product prod, String rawUid) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure(); // Bypasses SSL verification for easier deployment (avoids certificate renewal issues)

    HTTPClient http;
    
    // Create GET request query parameters
    // Format: ?action=add&uid=UID&product=PRODUCT_NAME&price=PRICE
    String requestUrl = String(googleScriptUrl) 
                        + "?action=add" 
                        + "&uid=" + urlEncode(rawUid) 
                        + "&product=" + urlEncode(prod.name) 
                        + "&price=" + String(prod.price, 2);

    Serial.print("Uploading to cloud URL: ");
    Serial.println(requestUrl);
    updateLCDDisplay("Uploading...", "Sending data");

    // Enable redirect handling: CRITICAL for Google Apps Script redirecting (302) to usercontent URLs
    http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);
    
    // Begin connection
    http.begin(client, requestUrl);
    
    // Send HTTP GET
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Cloud Response Code: ");
      Serial.println(httpResponseCode);
      Serial.print("Server Response: ");
      Serial.println(response);
      updateLCDDisplay("Cloud Sync OK", "Success!");
    } else {
      Serial.print("Error sending request, Code: ");
      Serial.println(httpResponseCode);
      updateLCDDisplay("Cloud Sync Err", "Code: " + String(httpResponseCode));
    }
    
    http.end(); // Close connection
    delay(1000);
  } else {
    Serial.println("Wi-Fi Disconnected. Unable to push data to cloud.");
    updateLCDDisplay("Offline Mode", "Saved locally");
    delay(1500);
  }
}

/**
 * Writes messages cleanly onto the I2C LCD screen
 */
void updateLCDDisplay(String line1, String line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1.substring(0, 16)); // Cap character length to prevent overflow
  lcd.setCursor(0, 1);
  lcd.print(line2.substring(0, 16));
}

/**
 * Helper function to encode raw URL characters
 */
String urlEncode(String str) {
  String encodedString = "";
  char c;
  char code0;
  char code1;
  for (int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (isalnum(c)) {
      encodedString += c;
    } else if (c == ' ') {
      encodedString += "+";
    } else {
      code1 = (c & 0xf) + '0';
      if ((c & 0xf) > 9) {
        code1 = (c & 0xf) - 10 + 'A';
      }
      c = (c >> 4) & 0xf;
      code0 = c + '0';
      if (c > 9) {
        code0 = c - 10 + 'A';
      }
      encodedString += "%";
      encodedString += code0;
      encodedString += code1;
    }
    yield();
  }
  return encodedString;
}
