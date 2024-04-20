const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const { valid } = require("joi");
const port = 8080; 

app.engine("ejs", ejsMate);    

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));    
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

main()
    .then(() => {
        console.log("Connection Successfull");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust'); 
};

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);   
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg)
    } else {
        next();
    }
}

app.get("/", (req, res) => {
    res.send("Root Page");
});

// app.get("/testListing", async(req, res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "by the beach",
//         price: 1200,
//         location: "Calanguate, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("successful testing");
// });

//Index Route
app.get("/listings",  wrapAsync (async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing }); 
}));

//Create Route
app.post("/listings", validateListing, wrapAsync (async (req, res, next) => {
    //method 1 to extract data (usual method)
    // let {title, description, price, country, location} = req.body
    //method 2 create object listing in ejs file and then use instance of that object
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync (async (req, res) => { 
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync (async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}) 
    res.redirect("/listings");
}));

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs")
});

//Show Route
app.get("/listings/:id", wrapAsync (async (req, res) => { 
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing}); 
}));

app.delete("/listings/:id", wrapAsync (async (req, res) => {
    let {id} = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {status = 500, message = "Something Went Wrong!"} = err;
    res.status(status).render("error.ejs", { message });
    // res.status(status).send(message);
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
}); 