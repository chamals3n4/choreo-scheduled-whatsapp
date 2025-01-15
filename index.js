import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

//twilio config
const ACCSID = process.env.TWILIO_ACC_SID;
const AUTHTOKEN = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(ACCSID, AUTHTOKEN);
const whatsappNum = process.env.TWILIO_WHATSAPP_NUM;

//supabase config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// function to fetch data from supabase
async function fetchLatestHealthData() {
  const { data, error } = await supabase
    .from("bpm_readings")
    .select("bpm")
    .limit(1);

  if (error) {
    console.error("Error fetching health data:", error);
    return null;
  }

  return data.length > 0 ? data[0] : null;
}

async function createMessage(heartRate) {
  const messageBody = `📊 Health Update:
- Heart Rate: ${heartRate} BPM`;

  const message = await client.messages.create({
    body: messageBody,
    from: `whatsapp:${whatsappNum}`,
    to: "whatsapp:+94717110160",
  });

  console.log(message.body);
}

//  fetch health data and send the WhatsApp message
async function sendHealthDataMessage() {
  const healthData = await fetchLatestHealthData();

  if (healthData) {
    const {  heart_rate, user_phone } = healthData;
    await createMessage(heart_rate);
  } else {
    console.log("No health data available.");
  }
}

sendHealthDataMessage();
