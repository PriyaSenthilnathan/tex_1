const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');
const upload = require('./multerConfig'); // Import Multer configuration

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // For parsing JSON bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Log the MongoDB URI for debugging
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Fabric Schema
const fabricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  material: { type: String, required: true },
  color: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

const Fabric = mongoose.model('Fabric', fabricSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  fabricId: String,
  fabricName: String,
  userEmail: String,
  userName: String,
  userAddress: String,
  userContact: String,
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String },
  orderTime: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Routes

// Register Route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Registration failed', error });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(200).json({ message: 'Login successful', user });
    }

    return res.status(401).json({ message: 'Invalid password' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed', error });
  }
});

// Get All Fabrics
app.get('/fabrics', async (req, res) => {
  try {
    const fabrics = await Fabric.find();
    res.json(fabrics);
  } catch (err) {
    console.error('Error fetching fabrics:', err);
    res.status(500).json({ message: 'Error fetching fabrics', error: err });
  }
});

// Add a New Fabric (with Image Upload)
app.post('/fabrics', upload.single('image'), async (req, res) => {
  const { name, material, color, price, description } = req.body;

  try {
    // Get the uploaded file path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create a new fabric
    const newFabric = new Fabric({ name, material, color, imageUrl, price, description });
    await newFabric.save();

    res.status(201).json(newFabric);
  } catch (err) {
    console.error('Error adding new fabric:', err);
    res.status(400).json({ message: 'Error adding new fabric', error: err });
  }
});

// Update an Existing Fabric
app.put('/fabrics/:id', async (req, res) => {
  const { name, material, color, price, description } = req.body;

  try {
    const updatedFabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      { name, material, color, price, description },
      { new: true, runValidators: true } // Ensure validation runs on updates
    );
    if (!updatedFabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }
    res.json(updatedFabric);
  } catch (err) {
    console.error('Error updating fabric:', err);
    res.status(400).json({ message: 'Error updating fabric', error: err });
  }
});

// Delete a Fabric
app.delete('/fabrics/:id', async (req, res) => {
  try {
    const deletedFabric = await Fabric.findByIdAndDelete(req.params.id);
    if (!deletedFabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }
    res.status(200).json({ message: 'Fabric deleted successfully' });
  } catch (err) {
    console.error('Error deleting fabric:', err);
    res.status(400).json({ message: 'Error deleting fabric', error: err });
  }
});

// Admin Route to Fetch All Orders
app.get('/getAllOrders', async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders from DB
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});