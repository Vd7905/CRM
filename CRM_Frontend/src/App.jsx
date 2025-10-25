// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Layout from "@/components/layout/Layout";
// import Dashboard from "@/pages/Dashboard";
// import Campaigns from "@/pages/Campaigns";
// import CustomerAnalytics from "@/pages/CustomerAnalytics";
// import SegmentCustomerAnalytics from "@/pages/SegmentCustomerAnalytics"
// import Login from "./pages/LoginPage";
// import ResetPassword from "./pages/ResetPassword";

// function App() {
  
//   return (
//     <Router>
//       <Routes>
//         {/* Public Route */}
//         <Route path="/login" element={<Login />} />

//         {/* Routes wrapped in Layout */}
//         <Route
//           path="/"
//           element={
//             <Layout>
//              <Dashboard />
//             </Layout>
//           }
//         />
//         <Route
//           path="/campaigns"
//           element={
//             <Layout>
//               <Campaigns />
//             </Layout>
//           }
//         />
//         <Route
//           path="/customers"
//           element={
//             <Layout>
//               <CustomerAnalytics/>
//             </Layout>
//           }
//         />

//         <Route
//           path="/segment-customers/:segmentId"
//           element={
//             <Layout>
//               <SegmentCustomerAnalytics/>
//             </Layout>
//           }
//         />

//         <Route
//           path="/reset-password/:token"
//           element={
//             <Layout>
//               <ResetPassword/>
//             </Layout>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import CustomerAnalytics from "@/pages/CustomerAnalytics";
import SegmentCustomerAnalytics from "@/pages/SegmentCustomerAnalytics";
import Login from "./pages/LoginPage";
import ResetPassword from "./pages/ResetPassword";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

function App() {
  const { user } = useContext(AuthContext); // <-- use context only

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            user ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/campaigns"
          element={
            user ? (
              <Layout>
                <Campaigns />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/customers"
          element={
            user ? (
              <Layout>
                <CustomerAnalytics />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/segment-customers/:segmentId"
          element={
            user ? (
              <Layout>
                <SegmentCustomerAnalytics />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Reset Password (public) */}
        <Route
          path="/reset-password/:token"
          element={
            <Layout>
              <ResetPassword />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
