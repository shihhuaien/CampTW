const mongoose = require('mongoose');
const Campground = require('../models/campground');
const campgroundsInTw = require('./twcamp');


//連線db
mongoose.connect('mongodb://127.0.0.1:27017/campTW')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!')
});

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 200; i++) {
        let ramCampNum = Math.floor(Math.random() * 500);
        const price = Math.floor(Math.random() * 1000) + 1000;
        const camp = new Campground({
            author: '64a3a4df66d176e6c7fec738',
            title: `${campgroundsInTw[ramCampNum].name}`,
            address: `${campgroundsInTw[ramCampNum].address}`,
            city: `${campgroundsInTw[ramCampNum].city}`,
            images: [{
                url: 'https://res.cloudinary.com/dufh0zepd/image/upload/v1688995220/CampTW/kkeyct8rhufx1443muou.webp',
                filename: 'CampTW/kkeyct8rhufx1443muou',
            },
            {
                url: 'https://res.cloudinary.com/dufh0zepd/image/upload/v1689002514/CampTW/vmcudhbzmx6bzuo6umgz.jpg',
                filename: 'CampTW/vmcudhbzmx6bzuo6umgz',
            }]
            ,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Numquam dolorum corporis dolore laborum vel voluptas veritatis, ipsum cum modi labore quisquam, incidunt ad exercitationem consectetur vitae similique, qui esse! Architecto.',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    campgroundsInTw[ramCampNum].latitude,
                    campgroundsInTw[ramCampNum].longitude]
            },
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});