import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import CreateClubModal from '../components/CreateClubModal';

// console.log('✅ Home.jsx loaded');

const Home = () => {
  const [showCreateClub, setShowCreateClub] = useState(false);
  
  // console.log('🏠 Home rendered, showCreateClub =', showCreateClub);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Welcome to Our University Club</h2>
      <p>Here you can find information about our club activities, events, and more.</p>
      
      <Button 
        variant="primary" 
        size="lg"
        onClick={() => {
          // console.log('🔘 Button clicked, opening modal...');
          setShowCreateClub(true);
        }}
        className="mb-4"
      >
        ➕ Create Club
      </Button>

      <CreateClubModal 
        show={showCreateClub} 
        onHide={() => setShowCreateClub(false)} 
      />
    </div>
  );
};

export default Home;
