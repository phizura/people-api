import fs from "fs/promises";
import { google } from "googleapis";
import config from "../config/index.js";

const authProtect = async (req, res, next) => {
    try {
        // Check for authentication
        if (!config.auth.token ||!config.auth.credentials) {
            return res.sendStatus(401);
          }

          const content = await fs.readFile(config.auth.token);
          const credentials = JSON.parse(content);
          const tokenContent = google.auth.fromJSON(credentials);

        // If everything is valid, call next()
        req.auth = tokenContent;
        next();

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export default authProtect;