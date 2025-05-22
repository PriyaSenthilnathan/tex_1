import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaHeart } from 'react-icons/fa';
import Slider from 'react-slick';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './home.css';

const carouselImages = [
  {
    id: 1,
    src: '/src/assets/fab1.jpg',
    alt: 'Image 1 description',
  },
  {
    id: 2,
    src: '/src/assets/fab2.jpg',
    alt: 'Image 2 description',
  },
  {
    id: 3,
    src: '/src/assets/fab3.jpg',
    alt: 'Image 3 description',
  },
];

const categories = [
  "Cotton",
  "Rayon",
  "Linen",
  "Polyester",
  "Silk",
  "Wool",
  "Nylon",
  "Chiffon",
  "Spandex",
  "Velvet"
];

const HomePage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false
  };

  useEffect(() => {
    // Fetch products from backend
    axios.get("http://localhost:5000/fabrics")
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error("Error fetching fabrics:", err);
      });
  }, []);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const filteredProducts = selectedCategories.length === 0
    ? products
    : products.filter(product => selectedCategories.includes(product.category));

  const handleAddToCart = async (productId) => {
    if (!user || user.role !== 'user') {
      toast.warning("Please login as a user to add to cart");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/cart", {
        userId: user._id,
        productId,
      });
      toast.success("Product added to cart!");
    } catch (err) {
      toast.error("Error adding to cart");
      console.error(err);
    }
  };

  const handleAddToFavorites = async (productId) => {
    if (!user || user.role !== 'user') {
      toast.warning("Please login as a user to add to favorites");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/favorites", {
        userId: user._id,
        productId,
      });
      toast.success("Added to favorites!");
    } catch (err) {
      toast.error("Error adding to favorites");
      console.error(err);
    }
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login"><FaUser /> Login</Link>
          <Link to="/cart"><FaShoppingCart /> Cart</Link>
          <Link to="/contacts">Contact</Link>
        </nav>
      </div>

      {/* Carousel */}
      <div className="carousel-container">
        <Slider {...carouselSettings}>
          {carouselImages.map(image => (
            <div key={image.id} className="carousel-slide">
              <img src={image.src} alt={image.alt} className="carousel-image" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Categories Filter */}
      <div className="categories-container">
        <h3>Filter by Categories</h3>
        <div className="categories-list">
          {categories.map(category => (
            <label key={category} className="category-checkbox">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div className="collection-intro">
        <h2>Shop Your Fashion Needs</h2>
        <p>Discover the finest textiles at the best prices!</p>
      </div>

      {/* Product Grid */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products">No products found for selected categories.</p>
        ) : (
          filteredProducts.map(product => (
            <div key={product._id} className="product-card">
              <img
                src={product.imageUrl || 'https://i.imgur.com/6Q8Z3Ym.jpg'}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://i.imgur.com/6Q8Z3Ym.jpg';
                }}
              />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">₹{product.price} per meter</p>
                <div className="button-container">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product._id)}
                  >
                    Add to Cart
                  </button>
                  <FaHeart
                    className="fav-icon"
                    onClick={() => handleAddToFavorites(product._id)}
                    title="Add to favorites"
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default HomePage;
