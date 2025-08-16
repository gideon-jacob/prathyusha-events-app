import { SupabaseClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class AuthService {
  private supabase: SupabaseClient;
  private jwtSecret: string;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
    this.jwtSecret = process.env.JWT_SECRET || "supersecretjwtkey"; // Use a strong secret from env variables
    if (this.jwtSecret === "supersecretjwtkey") {
      console.warn(
        "WARNING: JWT_SECRET is not set in environment variables. Using a default insecure key."
      );
    }
  }

  async login(username: string, password: string) {
    // 1. Find user by username in your database (e.g., a 'users' table)
    const { data: userData, error: userError } = await this.supabase
      .from("publishers") // Replace 'users' with your actual user table name
      .select("id, username, hashed_password, user_role") // Select necessary fields including user_role
      .eq("username", username)
      .single();

    if (userError || !userData) {
      return { success: false, message: "Invalid username or password." };
    }

    // 2. Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      userData.hashed_password
    );

    if (!isPasswordValid) {
      return { success: false, message: "Invalid username or password." };
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      {
        userId: userData.id,
        username: userData.username,
        role: userData.user_role,
      },
      this.jwtSecret,
      { expiresIn: "90d" } // Token expires in 180 days (approx 3 months)
    );

    return { success: true, token, userRole: userData.user_role };
  }

  async register(
    username: string,
    password: string,
    user_role: string,
    department: string,
    fullname: string,
    mailid: string
  ) {
    // Check if username already exists
    const { data: existingUser, error: existingUserError } = await this.supabase
      .from("publishers")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return { success: false, message: "Username already taken." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Insert new user into the database
    const { data: newUser, error: insertError } = await this.supabase
      .from("publishers")
      .insert([
        {
          username,
          hashed_password: hashedPassword,
          user_role,
          department,
          fullname,
          mailid,
        },
      ])
      .select("id, username, user_role, department, fullname, mailid")
      .single();

    if (insertError || !newUser) {
      console.error("Registration error:", insertError);
      return { success: false, message: "User registration failed." };
    }

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        user_role: newUser.user_role,
        department: newUser.department,
        fullname: newUser.fullname,
        mailid: newUser.mailid,
      },
    };
  }
}
