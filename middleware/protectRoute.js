import config from "../config/index.js";

export const protectCreate = async (req, res, next) => {
    try {
        // Validate request body parameters
        const { name, phoneNumber } = req.body;

        if (!name ||!phoneNumber) {
            return res.status(400).json({ error: "Parameter is mandatory", response_code: 400 });
        }

        // If everything is valid, call next()
        next();

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const protectUpdate = async (req, res, next) => {
    try {
        // Validate request body parameters
        const { oldNumber, newNumber } = req.body;

        if (!oldNumber ||!newNumber) {
            return res.status(400).json({ error: "Parameter is mandatory", response_code: 400 });
        }

        // If everything is valid, call next()
        next();

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// export default protectRoute;