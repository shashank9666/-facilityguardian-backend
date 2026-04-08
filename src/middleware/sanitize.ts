import { Request, Response, NextFunction } from "express";

/**
 * Recursively strips <script> and other HTML tags from strings in an object.
 */
function sanitize(val: any): any {
  if (typeof val === "string") {
    // Basic XSS prevention: strip HTML tags
    return val.replace(/<[^>]*>?/gm, "").trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitize);
  }
  if (val !== null && typeof val === "object") {
    const out: any = {};
    for (const key in val) {
      out[key] = sanitize(val[key]);
    }
    return out;
  }
  return val;
}

export function xssSanitizer(req: Request, _res: Response, next: NextFunction) {
  if (req.body)  req.body  = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
}
