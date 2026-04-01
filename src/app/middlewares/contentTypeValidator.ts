import { Request, Response, NextFunction } from "express";

export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowedTypes = [
    "application/json",
    "application/x-www-form-urlencoded",
    "multipart/form-data",
  ];

console.log( req.headers["content-type"]);

  const contentType = req.headers["content-type"] || "";
  const matches = allowedTypes.some((type) => contentType.includes(type));

  if (!matches) {
    res.status(415).json({
      success: false,
      message: `Unsupported content-type. Allowed: ${allowedTypes.join(", ")}`,
    });
    return;
  }

  next();
};
