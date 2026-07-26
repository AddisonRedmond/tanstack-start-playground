import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  todos,
  profileData,
  fakeDoctorData,
  shipmentData,
  users,
  posts,
  userProfiles,
  userAddressData,
} from "./schema";

const specialties = [
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
];

const carriers = ["UPS", "FedEx", "USPS", "DHL", "Amazon Logistics"];
const shipmentStatuses = [
  "Pending",
  "Processing",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Delayed",
  "Returned",
];

function makeTitle(index: number) {
  return `Sample Todo ${index}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  // await db.insert(todos).values(
  //   Array.from({ length: 300 }, (_, index) => ({
  //     title: makeTitle(index + 1),
  //     completed: index % 3 === 0,
  //   })),
  // );

  // await db.insert(profileData).values(
  //   Array.from({ length: 300 }, (_, index) => ({
  //     likes: index * 17 + 3,
  //     friends: (index % 25) * 11,
  //     posts: (index % 10) * 9,
  //   })),
  // );

  // await db.insert(fakeDoctorData).values(
  //   Array.from({ length: 300 }, (_, index) => ({
  //     name: `Dr. ${["Ada", "Ben", "Cara", "Drew", "Eli", "Faye"][index % 6]} ${["Smith", "Nguyen", "Patel", "Lopez", "Kim", "Osei"][index % 6]}`,
  //     specialty: specialties[index % specialties.length],
  //     location: ["Seattle", "Austin", "Chicago", "Denver", "Miami"][index % 5],
  //     yearsOfExperience: 1 + (index % 40),
  //     isAvailable: index % 2 === 0,
  //   })),
  // );

  // await db.insert(shipmentData).values(
  //   Array.from({ length: 300 }, (_, index) => ({
  //     trackingNumber: `TRK-${1000 + index}`,
  //     carrier: carriers[index % carriers.length],
  //     destination: ["Seattle", "Austin", "Chicago", "Denver", "Miami"][index % 5],
  //     status: shipmentStatuses[index % shipmentStatuses.length],
  //     weightKg: 1 + (index % 100),
  //     isDelivered: index % 4 === 0,
  //   })),
  // );

  const insertedUsers = await db
    .insert(users)
    .values(
      Array.from({ length: 50 }, (_, index) => ({
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
      })),
    )
    .returning({ id: users.id });

  // await db.insert(posts).values(
  //   Array.from({ length: 150 }, (_, index) => ({
  //     userId: insertedUsers[index % insertedUsers.length]?.id ?? 1,
  //     title: `Post ${index + 1}`,
  //     content: `This is the content for post ${index + 1}.`,
  //   })),
  // );

  const insertedProfiles = await db
    .insert(userProfiles)
    .values(
      Array.from({ length: 50 }, (_, index) => ({
        userId: insertedUsers[index]?.id ?? 1,
        bio: `Bio for user ${index + 1}`,
        avatarUrl: `https://example.com/avatar/${index + 1}.png`,
      })),
    )
    .returning({ id: userProfiles.id });

  await db.insert(userAddressData).values(
    Array.from({ length: insertedProfiles.length }, (_, index) => ({
      userProfileId: insertedProfiles[index]?.id ?? 1,
      street: `${index + 100} Sample Street`,
      city: ["Seattle", "Austin", "Chicago", "Denver", "Miami"][index % 5],
      state: ["WA", "TX", "IL", "CO", "FL"][index % 5],
      postalCode: `${98000 + index}`,
      country: "USA",
    })),
  );

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
