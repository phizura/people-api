import dotenv from 'dotenv';
dotenv.config();

const config = {
    scope : {
        url : process.env.URL_SCOPE
    },
    auth : {
        token : process.env.PATH_TOKEN,
        credentials : process.env.PATH_CREDENTIALS
    }
}

export default config;