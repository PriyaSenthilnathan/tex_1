import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaHeart, FaTag, FaPercentage, FaFire,  FaSignOutAlt } from 'react-icons/fa';
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
    src: '/src/assets/f2.jpg',
    alt: 'Image 1 description',
    title: 'Summer Collection',
    subtitle: 'Get 20% off on all cotton fabrics',
    offerTag: true
  },

  {
    id: 2,
    src: '/src/assets/f3.jpg',
    alt: 'Image 3 description',
    title: 'New Arrivals',
    subtitle: 'Premium silks and linens now available'
  },
  {
    id: 3,
    src: '/src/assets/f4.jpg',
    alt: 'Image 4 description',
    title: 'First Time Buyer Offer',
    subtitle: 'Use code WELCOME10 for 10% off your first order',
    offerTag: true
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

// Special offers configuration
const specialOffers = {
  "Cotton": {
    discount: 15,
    description: "Summer special on cotton fabrics",
    badgeColor: "#4CAF50"
  },
  "Silk": {
    discount: 10,
    description: "Luxury silk at discounted prices",
    badgeColor: "#9C27B0"
  },
  "Linen": {
    discount: 12,
    description: "Limited time offer on premium linen",
    badgeColor: "#2196F3"
  }
};

const UserDashBoard = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

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
    // Check if user is first-time visitor
    const visitedBefore = localStorage.getItem('hasVisited');
    if (!visitedBefore) {
      setIsFirstTimeUser(true);
      localStorage.setItem('hasVisited', 'true');
    }

    // Fetch products from backend
    axios.get("http://localhost:5000/fabrics")
      .then(res => {
        // Add discount information to products
        const productsWithDiscounts = res.data.map(product => {
          const hasSpecialOffer = specialOffers[product.category];
          const bulkDiscount = product.price > 500 ? 5 : 0; // 5% discount for high-priced items
          
          return {
            ...product,
            discount: hasSpecialOffer ? hasSpecialOffer.discount : bulkDiscount,
            isSpecialOffer: !!hasSpecialOffer,
            bulkDiscount: product.quantity > 50 ? 15 : (product.quantity > 20 ? 10 : 0),
            badgeColor: hasSpecialOffer ? specialOffers[product.category].badgeColor : "#FF5722"
          };
        });
        setProducts(productsWithDiscounts);
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

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount / 100);
  };
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      // Clear user data from local storage
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");
      navigate("/login"); // Redirect to the login page
    }
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/UserDashBoard">Home</Link>
          <Link to="/search-fabrics">Fabrics</Link>
          <Link to="/favorites">Favourites</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/contact">Contact</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      {/* First-time user offer banner */}
      {isFirstTimeUser && (
        <div className="first-time-banner">
          <div className="banner-content">
            <FaTag className="banner-icon" />
            <span>Welcome! Use code <strong>WELCOME10</strong> for 10% off your first order</span>
          </div>
        </div>
      )}

      {/* Carousel */}
      <div className="carousel-container">
        <Slider {...carouselSettings}>
          {carouselImages.map(image => (
            <div key={image.id} className="carousel-slide">
              <img src={image.src} alt={image.alt} className="carousel-image" />
              {image.offerTag && (
                <div className="carousel-offer-tag">
                  <FaFire /> Special Offer
                </div>
              )}
              <div className="carousel-caption">
                <h3>{image.title}</h3>
                <p>{image.subtitle}</p>
              </div>
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

      {/* Special offers showcase */}
      <div className="special-offers-showcase">
        <h3 className="section-title-with-icon">
          <FaTag className="title-icon" /> Today's Hot Deals
        </h3>
        <div className="offer-cards">
          {Object.entries(specialOffers).map(([category, offer]) => (
            <div 
              key={category} 
              className="offer-card"
              style={{ backgroundColor: `${offer.badgeColor}20`, borderColor: offer.badgeColor }}
            >
              <div className="offer-percent" style={{ color: offer.badgeColor }}>
                {offer.discount}% OFF
              </div>
              <div className="offer-category">{category} Fabrics</div>
              <div className="offer-description">{offer.description}</div>
            </div>
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
              {/* Discount badge */}
              {(product.discount > 0 || product.bulkDiscount > 0) && (
                <div 
                  className="discount-ribbon"
                  style={{ backgroundColor: product.badgeColor }}
                >
                  {product.isSpecialOffer ? (
                    <span>🔥 {product.discount}% OFF</span>
                  ) : product.bulkDiscount > 0 ? (
                    <span>📦 Bulk {product.bulkDiscount}% OFF</span>
                  ) : (
                    <span>🎉 {product.discount}% OFF</span>
                  )}
                </div>
              )}
              
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
                <div className="price-container">
                  {product.discount > 0 ? (
                    <>
                      <span className="original-price">₹{product.price}</span>
                      <span className="discounted-price">
                        ₹{calculateDiscountedPrice(product.price, product.discount).toFixed(2)}
                      </span>
                      <span 
                        className="discount-percent"
                        style={{ backgroundColor: product.badgeColor }}
                      >
                        Save {product.discount}%
                      </span>
                    </>
                  ) : (
                    <span className="product-price">₹{product.price} per meter</span>
                  )}
                </div>
                
                {/* Bulk discount info */}
                {product.bulkDiscount > 0 && (
                  <div className="bulk-discount-info">
                    <FaPercentage style={{ color: product.badgeColor }} /> 
                    <span style={{ color: product.badgeColor }}>
                      Extra {product.bulkDiscount}% off on {product.quantity > 50 ? '50+' : '20+'} meters
                    </span>
                  </div>
                )}
                
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

      {/* Bulk order discount section */}
      <div className="bulk-discount-section">
        <h3 className="section-title-with-icon">
          <FaPercentage className="title-icon" /> Bulk Order Savings
        </h3>
        <div className="discount-tiers">
          <div className="tier">
            <div className="tier-amount">20+ meters</div>
            <div className="tier-discount">10% OFF</div>
            <div className="tier-savings">Save up to ₹500</div>
          </div>
          <div className="tier">
            <div className="tier-amount">50+ meters</div>
            <div className="tier-discount">15% OFF</div>
            <div className="tier-savings">Save up to ₹1,500</div>
          </div>
          <div className="tier">
            <div className="tier-amount">100+ meters</div>
            <div className="tier-discount">20% OFF</div>
            <div className="tier-savings">Save up to ₹3,000</div>
          </div>
        </div>
        <p className="discount-note">
          Discounts apply automatically at checkout. For orders over 200 meters, 
          please <Link to="/contacts">contact us</Link> for special wholesale pricing.
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserDashBoard;