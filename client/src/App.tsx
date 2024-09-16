import React from "react";
import RestaurantList from "./components/RestaurantList";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App">
      <Header />
      <RestaurantList />
      <Footer />
    </div>
  );
}

export default App;
