#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

ESP8266WebServer server(80);

// Wi-Fi Access Point
const char* ssid = "Nagalakshmi";
const char* password = "priya123";

// Simulated Sensor Data
int lidarDistance = 25;
String cameraStatus = "Active";
String cameraResult = "No Defect Detected";

float roll = 2.5;
float pitch = 1.8;

float latitude = 11.0168;
float longitude = 75.9558;

String servoStatus = "Moving";
String robotStatus = "Patrolling";

// Timing
unsigned long previousMillis = 0;
const long interval = 3000;

// Update simulated data
void updateSensorData() {

  lidarDistance = random(20, 101);

  if (lidarDistance < 30) {
    Serial.println("Obstacle Detected!");
    robotStatus = "Obstacle Detected";
  } else {
    robotStatus = "Patrolling";
  }

  cameraStatus = "Active";

  if (random(0, 10) < 2) {
    cameraResult = "Possible Track Issue";
  } else {
    cameraResult = "No Defect Detected";
  }

  roll = random(-100, 101) / 10.0;
  pitch = random(-100, 101) / 10.0;

  latitude += 0.0001;
  longitude += 0.0001;
}

// Existing webpage
void handleRoot() {
  String webpage = "<!DOCTYPE html><html>";
  webpage += "<head>";
  webpage += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  webpage += "<title>ASTRONOVA Robot</title>";
  webpage += "</head>";

  webpage += "<body style='font-family:Arial;text-align:center;background:#f2f2f2;'>";
  webpage += "<h1>ASTRONOVA Robot</h1>";
  webpage += "<h2>Railway Inspection Robot</h2><hr>";

  webpage += "<h3>LiDAR Distance: ";
  webpage += String(lidarDistance);
  webpage += " cm</h3>";

  webpage += "<h3>Camera Status: ";
  webpage += cameraStatus;
  webpage += "</h3>";

  webpage += "<h3>Inspection Result: ";
  webpage += cameraResult;
  webpage += "</h3>";

  webpage += "<h3>Roll: ";
  webpage += String(roll, 1);
  webpage += " degrees</h3>";

  webpage += "<h3>Pitch: ";
  webpage += String(pitch, 1);
  webpage += " degrees</h3>";

  webpage += "<h3>Latitude: ";
  webpage += String(latitude, 6);
  webpage += "</h3>";

  webpage += "<h3>Longitude: ";
  webpage += String(longitude, 6);
  webpage += "</h3>";

  webpage += "<h3>Servo Status: ";
  webpage += servoStatus;
  webpage += "</h3>";

  webpage += "<h3>Robot Status: ";
  webpage += robotStatus;
  webpage += "</h3>";

  webpage += "<p><b>Simulation Mode</b></p>";
  webpage += "</body></html>";

  server.send(200, "text/html", webpage);
}

// NEW: JSON API for frontend
void handleData() {

  String json = "{";

  json += "\"lidar\":" + String(lidarDistance) + ",";
  json += "\"camera\":\"" + cameraStatus + "\",";
  json += "\"cameraResult\":\"" + cameraResult + "\",";
  json += "\"roll\":" + String(roll, 1) + ",";
  json += "\"pitch\":" + String(pitch, 1) + ",";
  json += "\"latitude\":" + String(latitude, 6) + ",";
  json += "\"longitude\":" + String(longitude, 6) + ",";
  json += "\"servo\":\"" + servoStatus + "\",";
  json += "\"robot\":\"" + robotStatus + "\"";

  json += "}";

  // Allow VS Code Live Server frontend to access this data
  server.sendHeader("Access-Control-Allow-Origin", "*");

  server.send(200, "application/json", json);
}

void setup() {

  Serial.begin(115200);

  randomSeed(analogRead(A0));

  // Start Wi-Fi Access Point
  WiFi.softAP(ssid, password);

  Serial.println();
  Serial.println("ESP8266 Robot Started");

  Serial.print("Wi-Fi Name: ");
  Serial.println(ssid);

  Serial.print("IP Address: ");
  Serial.println(WiFi.softAPIP());

  // Routes
  server.on("/", handleRoot);

  // NEW: JSON data route
  server.on("/data", handleData);

  server.begin();

  Serial.println("Web Server Started");
}

void loop() {

  server.handleClient();

  // Update data every 3 seconds without blocking the server
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {

    previousMillis = currentMillis;

    updateSensorData();

    Serial.println("------ Railway Robot Data ------");

    Serial.print("LiDAR Distance: ");
    Serial.print(lidarDistance);
    Serial.println(" cm");

    Serial.print("Camera Status: ");
    Serial.println(cameraStatus);

    Serial.print("Camera Result: ");
    Serial.println(cameraResult);

    Serial.print("Roll: ");
    Serial.println(roll);

    Serial.print("Pitch: ");
    Serial.println(pitch);

    Serial.print("GPS Latitude: ");
    Serial.println(latitude, 6);

    Serial.print("GPS Longitude: ");
    Serial.println(longitude, 6);

    Serial.print("Servo Status: ");
    Serial.println(servoStatus);
    Serial.print("Robot Status: ");
    Serial.println(robotStatus);

    Serial.println("-------------------------------");
  }
}