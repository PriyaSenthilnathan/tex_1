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
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies/sessions if you're using them
}));

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
  color: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

const Fabric = mongoose.model('Fabric', fabricSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  fabricId: String,
  fabricName: String,
  color: String,
  category: String,  
  pricePerMeter: Number,  
  userName: String,
  userAddress: String,
  userContact: String,
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, required: true }, 
  orderTime: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Routes

// Register Route
app.post('/register', async (req, res) => {
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
app.post('/login', async (req, res) => {
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

// Get All Fabrics (updated)
app.get('/fabrics', async (req, res) => {
  try {
    const fabrics = await Fabric.find();
    // Map fabrics to include full image URLs
    const fabricsWithUrls = fabrics.map(fabric => ({
      ...fabric.toObject(),
      imageUrl: fabric.imageUrl ? `http://localhost:5000${fabric.imageUrl}` : null
    }));
    res.json(fabricsWithUrls);
  } catch (err) {
    console.error('Error fetching fabrics:', err);
    res.status(500).json({ message: 'Error fetching fabrics', error: err });
  }
});

// Add a New Fabric (updated)
app.post('/fabrics', upload.single('image'), async (req, res) => {
  try {
    const { name, color, category, price, description } = req.body;
    
    if (!name || !color || !price || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newFabric = new Fabric({ 
      name,  
      color,
      category, 
      imageUrl, 
      price: parseFloat(price), 
      description 
    });
    
    await newFabric.save();

    res.status(201).json({
      ...newFabric.toObject(),
      imageUrl: imageUrl ? `http://localhost:5000${imageUrl}` : null
    });
  } catch (err) {
    console.error('Error adding new fabric:', err);
    res.status(400).json({ message: 'Error adding new fabric', error: err.message });
  }
});

// Update Fabric (with image support)
app.put('/fabrics/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, color, price, description } = req.body;
    const updateData = { name, color, category, price: parseFloat(price), description };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedFabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedFabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }

    res.json({
      ...updatedFabric.toObject(),
      imageUrl: updatedFabric.imageUrl ? `http://localhost:5000${updatedFabric.imageUrl}` : null
    });
  } catch (err) {
    console.error('Error updating fabric:', err);
    res.status(400).json({ message: 'Error updating fabric', error: err.message });
  }
});

// Delete Fabric (with image cleanup)
app.delete('/fabrics/:id', async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);
    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }

    // In production, you would delete the image file here
    // const fs = require('fs');
    // if (fabric.imageUrl) {
    //   fs.unlinkSync(path.join(__dirname, fabric.imageUrl));
    // }

    await Fabric.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Fabric deleted successfully' });
  } catch (err) {
    console.error('Error deleting fabric:', err);
    res.status(400).json({ message: 'Error deleting fabric', error: err.message });
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

// In server.js, update the search endpoint
app.get('/fabrics/search', async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};
    
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query = {
        $or: [
          { name: searchRegex },
          { color: searchRegex },
          { category: searchRegex },
          { description: searchRegex }
        ]
      };
    }
    
    const fabrics = await Fabric.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Add full image URLs
    const fabricsWithUrls = fabrics.map(fabric => ({
      ...fabric,
      imageUrl: fabric.imageUrl 
        ? `${req.protocol}://${req.get('host')}${fabric.imageUrl}`
        : null
    }));
    
    res.json(fabricsWithUrls);
  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});
// Favorite Schema
const favoriteSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fabricId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fabric', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

// Get user favorites
app.get('/favorites', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const favorites = await Favorite.find({ email })
      .populate('fabricId')
      .lean();
    
    // Map to include full image URLs
    const favoritesWithUrls = favorites.map(fav => ({
      ...fav,
      fabricId: {
        ...fav.fabricId,
        imageUrl: fav.fabricId.imageUrl 
          ? `${req.protocol}://${req.get('host')}${fav.fabricId.imageUrl}`
          : null
      }
    }));
    
    res.json(favoritesWithUrls);
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ message: 'Error fetching favorites', error: err.message });
  }
});

app.post('/favorites', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const userFavorites = await Favorite.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    );
    res.status(200).json(userFavorites);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
  try {
    const { email, fabricId } = req.body;
    
    if (!email || !fabricId) {
      return res.status(400).json({ message: 'Email and fabricId are required' });
    }

    // Check if fabric exists
    const fabric = await Fabric.findById(fabricId);
    if (!fabric) {
      return res.status(404).json({ message: 'Fabric not found' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ email, fabricId });
    if (existing) {
      return res.status(400).json({ message: 'This fabric is already in your favorites' });
    }

    const favorite = new Favorite({
      email,
      fabricId,
      createdAt: new Date()
    });

    await favorite.save();
    
    // Populate the fabric data in the response
    const populatedFavorite = await Favorite.findById(favorite._id).populate('fabricId');
    
    res.status(201).json({ 
      message: 'Fabric added to favorites',
      favorite: {
        ...populatedFavorite.toObject(),
        fabricId: {
          ...populatedFavorite.fabricId.toObject(),
          imageUrl: populatedFavorite.fabricId.imageUrl 
            ? `${req.protocol}://${req.get('host')}${populatedFavorite.fabricId.imageUrl}`
            : null
        }
      }
    });
  } catch (err) {
    console.error('Error adding to favorites:', err);
    res.status(500).json({ message: 'Error adding to favorites', error: err.message });
  }
});

// Remove from favorites
app.delete('/favorites', async (req, res) => {
  try {
    const { email, fabricId } = req.query;
    
    if (!email || !fabricId) {
      return res.status(400).json({ message: 'Email and fabricId are required' });
    }

    const result = await Favorite.findOneAndDelete({ email, fabricId });
    
    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ message: 'Error removing favorite', error: err.message });
  }
});

const cartSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fabricId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fabric', required: true },
  fabricName: { type: String, required: true },
  color: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

// Add to Cart
app.post('/cart', async (req, res) => {
  try {
    const { email, fabricId, fabricName, color, category, imageUrl, price } = req.body;
    
    // Check if already in cart
    let cartItem = await Cart.findOne({ email, fabricId });
    
    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        email,
        fabricId,
        fabricName,
        color,
        category,
        imageUrl,
        price,
        quantity: 1
      });
      await cartItem.save();
    }
    
    res.json({ message: 'Added to cart', cartItem });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
});

// Get Cart Items
app.get('/cart', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cartItems = await Cart.find({ email }).populate('fabricId');
    res.json(cartItems);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
});

// In your backend routes
app.put('/cart/update', async (req, res) => {
  try {
    const { email, fabricId, quantity } = req.body;
    
    // Update in database
    const result = await CartModel.findOneAndUpdate(
      { email, 'fabricId._id': fabricId },
      { $set: { quantity } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    res.json({ success: true, updatedItem: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove from Cart
app.delete('/cart', async (req, res) => {
  try {
    const { email, fabricId } = req.query;
    
    if (!email || !fabricId) {
      return res.status(400).json({ message: 'Email and fabricId are required' });
    }

    const result = await Cart.findOneAndDelete({ email, fabricId });
    
    if (!result) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Error removing from cart', error: err.message });
  }
});

// Order endpoint (update this existing route)
app.post('/orders', async (req, res) => {
  try {
    const { 
      fabricId,
      fabricName,
      userEmail,
      userName,
      userAddress,
      userContact,
      quantity,
      paymentMethod,
      totalPrice
    } = req.body;

    // Validate required fields
    if (!fabricId || !userEmail || !userName || !userAddress || !userContact || !quantity || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new order
    const newOrder = new Order({
      fabricId,
      fabricName,
      userEmail,
      userName,
      userAddress,
      userContact,
      quantity: Number(quantity),
      totalPrice: Number(totalPrice),
      paymentMethod
    });

    await newOrder.save();
    

    res.status(201).json({ 
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});