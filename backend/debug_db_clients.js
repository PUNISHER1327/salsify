const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Client = require('./src/models/Client.model');
const User = require('./src/models/User.model');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const clients = await Client.find({});
        console.log(`Total Clients in DB: ${clients.length}`);

        clients.forEach(c => {
            console.log(`Client: ${c.name}, UserID: ${c.user}, ID Type: ${typeof c.user}`);
        });

        // Check the specific user from logs
        const specificUserId = '694bb491f4dae247d5af4e86';
        const userClients = await Client.find({ user: specificUserId });
        const userClientCount = await Client.countDocuments({ user: specificUserId });

        console.log(`\nSpecific User (${specificUserId}):`);
        console.log(`Find Count: ${userClients.length}`);
        console.log(`CountDocuments: ${userClientCount}`);

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
};

checkDB();
