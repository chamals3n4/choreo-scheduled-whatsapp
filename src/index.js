import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

//twilio config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

//supabase config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// function to fetch data from supabase
async function fetchLatestHealthData() {
  const { data, error } = await supabase
    .from("healthData")
    .select("body_temperature, heart_rate")
    .limit(1);

  if (error) {
    console.error("Error fetching health data:", error);
    return null;
  }

  return data.length > 0 ? data[0] : null;
}

async function createMessage(bodyTemperature, heartRate) {
  const messageBody = `📊 Health Update:
- Body Temperature: ${bodyTemperature}°C
- Heart Rate: ${heartRate} BPM`;

  const message = await client.messages.create({
    body: messageBody,
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUM}`,
    to: "whatsapp:+94717110160",
  });

  console.log(message.body);
}

//  fetch health data and send the WhatsApp message
async function sendHealthDataMessage() {
  const healthData = await fetchLatestHealthData();

  if (healthData) {
    const { body_temperature, heart_rate, user_phone } = healthData;
    await createMessage(body_temperature, heart_rate);
  } else {
    console.log("No health data available.");
  }
}

sendHealthDataMessage();
