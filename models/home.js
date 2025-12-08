const mongoose = require('mongoose');

const homeSchema = mongoose.Schema({
    houseName: { type: String, required: true },
    price: { type: String, required: true },
    location: { type: String, required: true },
    photoUrl: { type: String, required: true },
    rating: { type: String, required: true },
    description: { type: String }
})

module.exports = mongoose.model('Home', homeSchema);
