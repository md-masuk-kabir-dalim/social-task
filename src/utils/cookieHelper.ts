import { CookieOptions, Response } from "express";
import config from "../config";

const isProd = config.env === "production";

/**
 * Map for short cookie names
 */
export const CookieNames = {
  ACCESS: "AT",
  REFRESH: "RT",
  OTP: "OT",
};

/**
 * Set cookie with environment-aware prefix
 */
export const setCookie = (
  res: Response,
  name: keyof typeof CookieNames,
  value: string,
  maxAge?: number,
) => {
  const cookieName = isProd
    ? `__Secure-${CookieNames[name]}`
    : `__Local-${CookieNames[name]}`;

  const options: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    ...(maxAge && { maxAge }),
    ...(isProd && config.cookies.domain && { domain: config.cookies.domain }),
  };

  res.cookie(cookieName, value, options);
};

/**
 * Clear cookie with environment-aware prefix
 */
export const clearCookie = (res: Response, name: keyof typeof CookieNames) => {
  const cookieName = isProd
    ? `__Secure-${CookieNames[name]}`
    : `__Local-${CookieNames[name]}`;
  res.clearCookie(cookieName, {
    path: "/",
    ...(isProd && config.cookies.domain && { domain: config.cookies.domain }),
  });
};
