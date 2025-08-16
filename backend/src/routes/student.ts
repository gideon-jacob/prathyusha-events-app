import express, { Request, Response } from "express";
import { supabase } from "../supabase";
import { StudentService } from "../services/student.service";

const router = express.Router();
const studentService = new StudentService(supabase);

router.get("/events", async (req: Request, res: Response) => {
  const { dept = '', type = '', name = '' } = req.query as { dept: string, type: string, name: string };
  const result = await studentService.getEvents(dept, type, name);
  res.json(result);
});

router.get("/events/:eventId", async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const result = await studentService.getEventById(eventId);
  res.json(result);
});

export default router;
