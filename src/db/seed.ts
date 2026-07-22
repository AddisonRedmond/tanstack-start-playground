import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { seed } from "drizzle-seed";

import {
  todos,
  profileData,
  fakeDoctorData,
  shipmentData,
} from "./schema";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  await seed(db, {
    todos,
    profileData,
    fakeDoctorData,
    shipmentData,
  }).refine((f) => ({
    todos: {
      count: 300,
      columns: {
        title: f.loremIpsum(),
        completed: f.boolean(),
      },
    },

    profileData: {
      count: 300,
      columns: {
        likes: f.int({ minValue: 0, maxValue: 10000 }),
        friends: f.int({ minValue: 0, maxValue: 5000 }),
        posts: f.int({ minValue: 0, maxValue: 1000 }),
      },
    },

    fakeDoctorData: {
      count: 300,
      columns: {
        name: f.fullName(),
        specialty: f.valuesFromArray({
          values: [
            "Cardiology",
            "Dermatology",
            "Emergency Medicine",
            "Family Medicine",
            "Internal Medicine",
            "Neurology",
            "Obstetrics",
            "Oncology",
            "Orthopedics",
            "Pediatrics",
            "Psychiatry",
            "Radiology",
            "Surgery",
            "Urology",
          ],
        }),
        location: f.city(),
        yearsOfExperience: f.int({
          minValue: 1,
          maxValue: 45,
        }),
        isAvailable: f.boolean(),
      },
    },

    shipmentData: {
      count: 300,
      columns: {
        trackingNumber: f.uuid(),
        carrier: f.valuesFromArray({
          values: [
            "UPS",
            "FedEx",
            "USPS",
            "DHL",
            "Amazon Logistics",
          ],
        }),
        destination: f.city(),
        status: f.valuesFromArray({
          values: [
            "Pending",
            "Processing",
            "In Transit",
            "Out for Delivery",
            "Delivered",
            "Delayed",
            "Returned",
          ],
        }),
        weightKg: f.int({
          minValue: 1,
          maxValue: 100,
        }),
        isDelivered: f.boolean(),
      },
    },
  }));

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});