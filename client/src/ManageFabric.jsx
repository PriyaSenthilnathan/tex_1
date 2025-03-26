import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './ManageFabric.css';
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon
import './LogoutButton.css'; // Optional: Add specific styles for the div

const ManageFabric = () => {
  const [fabrics, setFabrics] = useState([]);
  const [name, setName] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [editingFabric, setEditingFabric] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const apiUrl = 'https://your-api-endpoint.com/fabrics'; // Update API endpoint

  useEffect(() => {
    axios.get(apiUrl)
      .then(response => {
        setFabrics(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the fabrics:', error);
      });
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage('');
    }, 20000);
  };

  const handleAddFabric = () => {
    if (name && color && price && description && imageFile) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('color', color);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('image', imageFile);

      axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(response => {
          setFabrics([...fabrics, response.data]);
          clearForm();
          showMessage('Fabric added successfully.');
        })
        .catch(error => {
          console.error('There was an error adding the fabric:', error);
        });
    } else {
      alert('Please fill all fields');
    }
  };

  const handleEditFabric = (fabric) => {
    setEditingFabric(fabric);
    setName(fabric.name);
    setColor(fabric.color);
    setPrice(fabric.price);
    setDescription(fabric.description);
    setImageFile(null); // Reset image file when editing
  };

  const handleUpdateFabric = () => {
    if (editingFabric) {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('color', color);
      formData.append('price', price);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      axios.put(`${apiUrl}/${editingFabric._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(response => {
          const updatedFabrics = fabrics.map(fabric =>
            fabric._id === editingFabric._id ? response.data : fabric
          );
          setFabrics(updatedFabrics);
          clearForm();
          showMessage('Fabric updated successfully.');
        })
        .catch(error => {
          console.error('There was an error updating the fabric:', error);
        });
    }
  };

  const handleDeleteFabric = (id) => {
    axios.delete(`${apiUrl}/${id}`)
      .then(() => {
        setFabrics(fabrics.filter(fabric => fabric._id !== id));
        showMessage('Fabric deleted successfully.');
      })
      .catch(error => {
        console.error('There was an error deleting the fabric:', error);
      });
  };

  const clearForm = () => {
    setName('');
    setColor('');
    setPrice('');
    setDescription('');
    setImageFile(null);
    setEditingFabric(null);
    setMessage('');
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");
      navigate("/login");
    }
  };

  return (
    <div className="home-container">
      <div className="navbar">
        <div className="website-name">SaraswathiTex</div>
        <nav className="nav-links">
          <Link to="/AdminDashboard">Home</Link>
          <Link to="/manage-fabric">Manage Fabrics</Link>
          <Link to="/search">Search</Link>
          <Link to="/view-orders">View Orders</Link>
          <div className="logout-icon-div" onClick={handleLogout}>
            <FaSignOutAlt />
          </div>
        </nav>
      </div>

      <div className="manage-fabrics">
        <h1>Manage Fabrics</h1>
        {message && <p className="message">{message}</p>}
        <div className="form-container">
          <input
            type="text"
            placeholder="Fabric Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price per meter"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <button onClick={editingFabric ? handleUpdateFabric : handleAddFabric}>
            {editingFabric ? 'Update Fabric' : 'Add Fabric'}
          </button>
          {editingFabric && (
            <button className="cancel-button" onClick={clearForm}>Cancel</button>
          )}
        </div>

        <div className="fabrics-list">
          <h2>Fabrics List</h2>
          {fabrics.length === 0 ? (
            <p>No fabrics available. Add a fabric to get started!</p>
          ) : (
            <ul>
              {fabrics.map((fabric) => (
                <li key={fabric._id}>
                  <h3>{fabric.name}</h3>
                  <p><strong>Material:</strong> {fabric.material}</p>
                  <p><strong>Color:</strong> {fabric.color}</p>
                  <p><strong>Price:</strong> ₹{fabric.price} per meter</p>
                  <p><strong>Description:</strong> {fabric.description}</p>
                  {fabric.imagePath && (
                    <img
                      src={`https://your-api-endpoint.com/${fabric.imagePath}`}
                      alt={fabric.name}
                      width="100"
                      onError={(e) => e.target.src = 'placeholder.jpg'}
                    />
                  )}
                  <button onClick={() => handleEditFabric(fabric)}>Edit</button>
                  <button onClick={() => handleDeleteFabric(fabric._id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFabric;