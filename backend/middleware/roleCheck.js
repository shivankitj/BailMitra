// Middleware to check if user has required role
module.exports =
  (roles = []) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    // If roles is a string, convert to array
    if (typeof roles === "string") {
      roles = [roles];
    }

    // Check if user role is in the allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "Forbidden: You don't have permission to access this resource",
      });
    }

    next();
  };