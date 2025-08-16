import express, { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { supabase } from "../supabase";

const router = express.Router();
const authService = new AuthService(supabase);

router.post("/login", async (req: Request, res: Response) => { 
  const {
    username,
    password
  } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username and password are required." });
  }

  const result = await authService.login(username, password);

  if (result.success) {
    res.json({ success: true, token: result.token, userRole: result.userRole });
  } else {
    res.status(401).json({ success: false, message: result.message });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  const { username, password, user_role, department, fullname, mailid } =
    req.body;

  if (
    !username ||
    !password ||
    !user_role ||
    !department ||
    !fullname ||
    !mailid
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Username, password, user role, department, full name, and mail ID are required.",
      });
  }

  const result = await authService.register(
    username,
    password,
    user_role,
    department,
    fullname,
    mailid
  );

  if (result.success) {
    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully.",
        user: result.user,
      });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

export default router;
