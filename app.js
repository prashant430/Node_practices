const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// MongoDB connection URL and options
const url = 'mongodb://localhost:27017/mydatabase';
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4 // Use IPv4, skip trying IPv6
};

mongoose.Promise = global.Promise;
mongoose.connect(url, options)
.then(() => { console.log("Connected to MongoDB"); })
.catch((err) => console.log(err));

// Defining the user schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', UserSchema);
const mydatabase = mongoose.model('mydatabase', UserSchema);


// Route to add a new user
app.post('/add-user', async (req, res) => {
    const { name, email } = req.body;

    // Validate that name and email are provided
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        const user = new User({ name, email });
        await user.save(); // Save the user to the database
        res.status(201).json({ message: 'User added successfully', id: user._id }); // Send success response
    } catch (err) {
        res.status(500).json({ message: 'Error adding user', error: err.message });
    }
});

app.get('/get-users', async (req, res) => {
    try {
        const users = await User.find().select('name'); // Retrieve all users from the database
        res.status(200).json({ users }); // Send the users in the response
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving users', error: err.message });
    }
});

app.put('/update-user-id/:id', async (req, res) => {
    const oldId = req.params.id;  // Get the old user ID from the URL parameter
    const { newId } = req.body;   // Get the new ID from the request body

    if (!newId) {
        return res.status(400).json({ message: 'New ID is required' });
    }

    try {
        // Step 1: Find the existing user
        const user = await User.findById(oldId);
        
        // Step 2: If user is not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Step 3: Create a new user document with the new ID
        const updatedUser = new User({
            _id: newId,  // Set the new _id
            name: user.name,
            email: user.email
        });

        // Step 4: Save the new user document
        await updatedUser.save();

        // Step 5: Delete the old user document
        await User.findByIdAndDelete(oldId);

        // Return success response
        res.status(200).json({ message: 'User ID updated successfully', updatedUser });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user ID', error: err.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Your server is available at http://localhost:${PORT}`);
});
