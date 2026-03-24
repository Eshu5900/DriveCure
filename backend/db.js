const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://mechuser:mech123@cluster0.kcsvbvf.mongodb.net/mechai?retryWrites=true&w=majority")

.then(() => {
    console.log("MongoDB Atlas Connected Successfully");
})

.catch((err) => {
    console.log("MongoDB Connection Error:", err);
});