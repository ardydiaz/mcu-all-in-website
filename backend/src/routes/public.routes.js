import { Router } from "express";
import { PublicController } from "../controllers/PublicController.js";
import { subscribeToDirectoryEvents } from "../helpers/directoryEvents.js";

const router = Router();
router.get("/systems", PublicController.systems);
router.get("/categories", PublicController.categories);
router.get("/events", (request, response) => {
  response.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });
  response.flushHeaders();
  const unsubscribe = subscribeToDirectoryEvents(response);
  request.on("close", unsubscribe);
});
export default router;
