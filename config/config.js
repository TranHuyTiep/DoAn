module.exports = {

    name: 'Server',
    root_dir: '/home/tranhuytiep/Desktop/DoAN/DoAn/',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    db: {
        // uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elearning-api',
    },
    jwt: {
        cert: 'var/cert',
        r: 'var/r',
        password:"Aa123456",
        hash_algorithm: 'AES'
    }
};
