const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        default: "https://unsplash.com/photos/an-aerial-view-of-a-beach-with-a-group-of-people-V8WvhNWWDwY",
        set: (v) => v === "" ? "https://unsplash.com/photos/an-aerial-view-of-a-beach-with-a-group-of-people-V8WvhNWWDwY" : v,
    },
    price: {
        type: Number,
    },
    location: {
        type: String,   
    },
    country: {
        type: String,
    },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;