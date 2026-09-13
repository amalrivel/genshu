import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let cause = error;
  for (let depth = 0; cause && depth < 10; depth++, cause = cause.cause) {
    if (cause.sqlState === "23503" || cause.code === "23503") {
      res.status(409).json({
        error:
          req.method === "DELETE" && req.path.startsWith("/questions/")
            ? "Remove this question from its practice sets before deleting it."
            : req.method === "DELETE"
              ? "Delete this topic’s materials and questions before deleting the topic."
              : "The selected topic does not exist.",
      });
      return;
    }
  }
  if (error.type === "entity.too.large") {
    res.status(413).json({ error: "Content is too large (maximum request size: 1 MB)." });
    return;
  }
  if (error.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON." });
    return;
  }
  if ([400, 401, 403].includes(error.status)) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error("API request failed:", error.code ?? error.name);
  res.status(500).json({ error: "Unable to complete the request. Please try again." });
};
