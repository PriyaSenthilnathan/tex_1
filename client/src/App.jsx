import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./homepage.jsx";
import Register from './Register.jsx';
import Login from './Login.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ManageFabric from "./ManageFabric.jsx";
import Search from "./Search.jsx";
import OrdersPage from "./OrdersPage.jsx";
import UserDashBoard from "./UserDashBoard.jsx";
import SearchFabric from "./SearchFabric.jsx";
import FavoritesPage from "./FavouritesPage.jsx";
import CartPage from "./cartPage.jsx";
import Contact from "./Contact.jsx";

const App = () => {
  return(
  <Router>
    <Routes>
      <Route path = "/" element = { <HomePage /> } />
      <Route path="/register" element={ <Register /> } />
      <Route path="/login" element={ <Login /> } />
      <Route path="/AdminDashboard" element={ <AdminDashboard /> } />
      <Route path="/manage-fabric" element={ <ManageFabric /> } />
      <Route path="/search" element={ <Search />} />
      <Route path="/view-orders" element={ <OrdersPage/>} />
      <Route path="/UserDashBoard" element={ <UserDashBoard /> } />
      <Route path="/search-fabrics" element={ <SearchFabric /> } />
      <Route path="/favorites" element={ <FavoritesPage /> } />
      <Route path="/cart" element={ <CartPage /> } />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  </Router>
  );
}

export default App;