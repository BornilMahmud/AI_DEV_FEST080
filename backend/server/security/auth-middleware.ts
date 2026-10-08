import { Request, Response, NextFunction } from "express";
import { verifyFirebaseIdToken, VerifiedTokenPayload } from "./token-verifier.js";
import { SecurityService, SystemRole, UserProfileRecord } from "./security-service.js";
import { getClientIp } from "./ip-detection.js";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: UserProfileRecord;
      tokenPayload?: VerifiedTokenPayload;
      requestId?: string;
    }
  }
}

export function createAuthMiddleware(securityService: SecurityService) {
  /**
   * Mandatory Authentication Middleware.
   * Verifies Firebase ID Token and resolves trusted database role.
   */
  const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required. Missing or malformed Bearer token.",
        },
        meta: { requestId: req.requestId },
      });
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Empty authentication token provided.",
        },
        meta: { requestId: req.requestId },
      });
    }

    try {
      // 1. Verify token cryptographic integrity
      const verified = await verifyFirebaseIdToken(token);
      req.tokenPayload = verified;

      // 2. Resolve trusted profile & role from database
      const ipDetails = getClientIp(req);
      const userAgent = req.headers["user-agent"] || "unknown";

      const profile = await securityService.resolveUserProfile({
        firebaseUid: verified.firebaseUid,
        email: verified.email,
        displayName: verified.displayName,
        avatarUrl: verified.avatarUrl,
        observedIp: ipDetails.ipAddress,
        userAgent,
      });

      req.user = profile;
      next();
    } catch (err: any) {
      // Record security event for rejected token
      const ipDetails = getClientIp(req);
      securityService.logSecurityEvent({
        eventType: "TOKEN_REJECTED",
        ipAddress: ipDetails.ipAddress,
        userAgent: req.headers["user-agent"] || "unknown",
        riskLevel: "MEDIUM",
        reason: `Rejected authentication token: ${err.message}`,
        requestId: req.requestId,
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Authentication token is invalid or expired.",
        },
        meta: { requestId: req.requestId },
      });
    }
  };

  /**
   * Optional Authentication Middleware.
   * Attaches req.user if a valid token exists, otherwise proceeds anonymously.
   */
  const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7).trim();
    if (!token) return next();

    try {
      const verified = await verifyFirebaseIdToken(token);
      req.tokenPayload = verified;
      const ipDetails = getClientIp(req);
      const userAgent = req.headers["user-agent"] || "unknown";

      const profile = await securityService.resolveUserProfile({
        firebaseUid: verified.firebaseUid,
        email: verified.email,
        displayName: verified.displayName,
        avatarUrl: verified.avatarUrl,
        observedIp: ipDetails.ipAddress,
        userAgent,
      });

      req.user = profile;
    } catch {
      // Continue without user
    }
    next();
  };

  /**
   * Role-Based Access Control (RBAC) Enforcement.
   * Rejects request if the authenticated user does not have one of the required roles.
   */
  const requireRole = (...allowedRoles: SystemRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required before role verification.",
          },
          meta: { requestId: req.requestId },
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        // Log unauthorized attempt
        const ipDetails = getClientIp(req);
        securityService.logSecurityEvent({
          userId: req.user.id,
          firebaseUid: req.user.firebase_uid,
          eventType: "ROLE_ACCESS_DENIED",
          ipAddress: ipDetails.ipAddress,
          riskLevel: "HIGH",
          reason: `User with role ${req.user.role} attempted to access endpoint restricted to [${allowedRoles.join(", ")}]`,
          requestId: req.requestId,
        }).catch(() => {});

        return res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to perform this action.",
          },
          meta: { requestId: req.requestId },
        });
      }

      next();
    };
  };

  return {
    authenticateUser,
    optionalAuth,
    requireRole,
  };
}
