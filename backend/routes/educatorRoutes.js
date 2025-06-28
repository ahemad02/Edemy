import express from "express";
import { updateRoleEducator } from "../controllers/educatorController.js";


const educatorRouter = express.Router();

educatorRouter.get("/update-role", updateRoleEducator);

export default educatorRouter;