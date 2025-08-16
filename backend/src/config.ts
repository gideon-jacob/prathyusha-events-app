import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  // dotenv.config({ path: ".env.example" });
  dotenv.config({ path: ".env" });
}
