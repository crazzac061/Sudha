import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { filterXSS } from 'xss';
import sanitizeHtml from 'sanitize-html';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

// XSS protection middleware
const xssProtection = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    // Recursive function to sanitize nested objects
    const sanitizeData = (data: any): any => {
      if (typeof data === 'string') {
        return filterXSS(data, {
          whiteList: {}, // No tags allowed
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script'] // Strip script tags and their content
        });
      }
      if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
      }
      if (typeof data === 'object' && data !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = sanitizeData(value);
        }
        return sanitized;
      }
      return data;
    };

    req.body = sanitizeData(req.body);
  }
  next();
};

// HTML sanitization middleware
const htmlSanitization = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    const sanitizeData = (data: any): any => {
      if (typeof data === 'string') {
        return sanitizeHtml(data, {
          allowedTags: [], // No HTML tags allowed
          allowedAttributes: {}, // No attributes allowed
          disallowedTagsMode: 'recursiveEscape'
        });
      }
      if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item));
      }
      if (typeof data === 'object' && data !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = sanitizeData(value);
        }
        return sanitized;
      }
      return data;
    };

    req.body = sanitizeData(req.body);
  }
  next();
};

// Export security middleware
export default {
  helmetMiddleware: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
  mongoSanitize: mongoSanitize(),
  xssProtection,
  htmlSanitization,
  hpp: hpp()
};
