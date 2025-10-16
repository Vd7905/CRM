// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
// import Dashboard from "@/pages/Dashboard";
// import Campaigns from "@/pages/Campaigns";
// import Customers from "@/pages/Customers";
import Login from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Routes wrapped in Layout */}
        <Route
          path="/"
          element={
            <Layout>
             {/* <Dashboard /> */}
            </Layout>
          }
        />
        <Route
          path="/campaigns"
          element={
            <Layout>
              {/* <Campaigns /> */}
            </Layout>
          }
        />
        <Route
          path="/customers"
          element={
            <Layout>
              {/* <Customers /> */}
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
