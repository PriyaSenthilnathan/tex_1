import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaHeart } from 'react-icons/fa';
import Slider from 'react-slick';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './home.css';
import fab1 from '/src/assets/fab1.jpg';
import fab2 from '/src/assets/fab2.jpg';
import fab3 from '/src/assets/fab3.jpg';

const carouselImages = [
  {
    id: 1,
    src: fab1,
    alt: 'Image 1 description',
  },
  {
    id: 2,
    src: fab2,
    alt: 'Image 2 description',
  },
  {
    id: 3,
    src: fab3,
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
  "Banarasi Silk",
  "Velvet"
];

const products = [
  {
    id: 1,
    name: 'Silk Cotton Saree',
    price: '₹1,299',
    image: 'https://vannamayil.com/cdn/shop/products/Korasilkcottontowerkorvaikottanchisaree_31.jpg?v=1659505292&width=1946',
    description: 'Pure silk cotton blend with traditional patterns',
    category: 'Silk'
  },
  {
    id: 2,
    name: 'Linen Dress Material',
    price: '₹899',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-PgRQE5JWEV7HUxoZ5Gw6BZ7G6bC5WwU-EA&s',
    description: 'Premium linen fabric for comfortable dresses',
    category: 'Linen'
  },
  {
    id: 3,
    name: 'Rayon',
    price: '₹749',
    image: 'https://www.sarojfabrics.com/pub/media/catalog/product/cache/e461f6a7c3abe4058405e5b51e40efd3/s/f/sf10444a.jpg',
    description: 'Soft cotton perfect for summer kurtas',
    category: 'Rayon'
  },
  {
    id: 4,
    name: 'Designer Chiffon',
    price: '₹1,599',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwAka7YMc3HQ8wFbWap08mSkXBYNP6M_iuyg&s',
    description: 'Elegant chiffon with designer prints',
    category: 'Chiffon'
  },
  {
    id: 5,
    name: 'Woolen Suiting',
    price: '₹2,199',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc88wFk36kNDrdcQaw-qQxP4HIy7N7GhIdUg&s',
    description: 'Premium wool blend for winter wear',
    category: 'Wool'
  },
  {
    id: 6,
    name: 'Banarasi Silk',
    price: '₹3,499',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTD7r7dHpwOONscSHTTuITZZ-aI5QGZo5ifg&s',
    description: 'Authentic Banarasi silk with gold zari work',
    category: 'Banarasi Silk'
  }
];

const HomePage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")); // Adjust per your auth

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

  // Category checkbox toggle
  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Filter products by selected categories or show all if none selected
  const filteredProducts = selectedCategories.length === 0
    ? products
    : products.filter(product => selectedCategories.includes(product.category));

  // Add to cart API call
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

  // Add to favorites API call
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
          <Link to="/contact">Contact</Link>
        </nav>
      </div>

      {/* Carousel */}
      <div className="carousel-container">
        <Slider {...carouselSettings}>
          {carouselImages.map((image) => (
            <div key={image.id} className="carousel-slide">
              <img src={image.src} alt={image.alt} className="carousel-image" />
              <div className="carousel-caption">{image.caption}</div>
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
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://i.imgur.com/6Q8Z3Ym.jpg';
                }}
              />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">{product.price}</p>
                <p className="product-description">{product.description}</p>
                <div className="button-container">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    Add to Cart
                  </button>
                  <FaHeart
                    className="fav-icon"
                    onClick={() => handleAddToFavorites(product.id)}
                    title="Add to favorites"
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
