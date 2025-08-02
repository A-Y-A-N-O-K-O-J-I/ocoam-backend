const User = require("../models/userModel");

async function moderatorMiddleware(){
    const token = req.cookies?.accessToken;
    
        if (!token) {
            return res.status(401).json({ status: 401, message: "No token provided" });
        }
    
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const isModerator = await User.isModerator(decoded.id)
            if(!isModerator){
                return res.status(403).json({
                    status:403,
                    message:"User Not Moderator Access Denied"
                })
            }
            req.user = decoded;
            next(); // Move to next middleware or route handler
        } catch (error) {
            return res.status(401).json({ status: 401, message: "Invalid or expired token" });
        }
}
module.exports = moderatorMiddleware;