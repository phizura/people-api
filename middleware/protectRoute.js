import config from "../config/index.js";

const protectRoute = async (req, res, next) => {
    try {
        // Check for authentication
        const token = config.auth.token;
        const credentials = config.auth.credentials;

        if (!token &&!credentials) {
            return res.status(401).json({ error: "Unauthorized", response_code: 401 });
        }

        // Validate request body parameters
        const { name, phoneNumber, oldNumber, newNumber } = req.body;

        if (!name ||!phoneNumber ||!oldNumber ||!newNumber) {
            return res.status(400).json({ error: "Parameter is mandatory", response_code: 400 });
        }

        // If everything is valid, call next()
        next();

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export default protectRoute;