// import { BrowserRouter as Router, Routes, Route } from "react-router";
// import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
// import NotFound from "./pages/OtherPage/NotFound";
// import UserProfiles from "./pages/UserProfiles";
// // import Videos from "./pages/UiElements/Videos";
// // import Images from "./pages/UiElements/Images";
// // import Alerts from "./pages/UiElements/Alerts";
// // import Badges from "./pages/UiElements/Badges";
// // import Avatars from "./pages/UiElements/Avatars";
// // import Buttons from "./pages/UiElements/Buttons";
// import LineChart from "./pages/Charts/LineChart";
// // import BarChart from "./pages/Charts/BarChart";
// import Calendar from "./pages/Calendar";
// // import BasicTables from "./pages/Tables/BasicTables";
// // import FormElements from "./pages/Forms/FormElements";
// import Blank from "./pages/Blank";
// import AppLayout from "./layout/AppLayout";
// import { ScrollToTop } from "./components/common/ScrollToTop";
// import Home from "./pages/Dashboard/Home";
// import Metrics from "./pages/Tables/Metrics";
// import ReportViewer from "./components/otherspg/ReportViewer";
// import PhotoGallery from "./components/otherspg/PhotoGallery";

// export default function App() {
//   return (
//     <>
//       <Router>
//         <ScrollToTop />
//         <Routes>
//           {/* Dashboard Layout */}
//           <Route element={<AppLayout />}>
//             <Route index path="/" element={<Home />} />

//             {/* Others Page */}
//             <Route path="/metrics" element={<Metrics/>}/>
//             <Route path="/profile" element={<UserProfiles />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/blank" element={<Blank />} />
//             <Route path="/documents" element={<ReportViewer />} />
//             <Route path="/snippets" element ={<PhotoGallery/>}/>
//             {/* <Route path="/metrics" element={<Metrics/>}/> */}
//             // {/* Forms */}
//             // {/* <Route path="/form-elements" element={<FormElements />} /> */}

//             // {/* Tables */}
//             // {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

//             // {/* Ui Elements */}
//             // {/* <Route path="/alerts" element={<Alerts />} />
//             // <Route path="/avatars" element={<Avatars />} />
//             // <Route path="/badge" element={<Badges />} />
//             // <Route path="/buttons" element={<Buttons />} />
//             // <Route path="/images" element={<Images />} />
//             // <Route path="/videos" element={<Videos />} /> */}

//             // {/* Charts */}
//             <Route path="/line-chart" element={<LineChart />}/>
//             {/* <Route path="/bar-chart" element={<BarChart />} /> */}
//           </Route>

//           {/* Auth Layout */}
//           <Route path="/signin" element={<SignIn />} />
//           <Route path="/signup" element={<SignUp />} />

//           {/* Fallback Route */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Router>
//     </>
//   );
// }
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";

import AppLayout from "./layout/AppLayout";

// Pages
import Home from "./pages/Dashboard/Home";
import Metrics from "./pages/Tables/Metrics";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import LineChart from "./pages/Charts/LineChart";
import ReportViewer from "./components/otherspg/ReportViewer";
import PhotoGallery from "./components/otherspg/PhotoGallery";

// Auth pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import CreateClient from "./pages/clients/CreateClient";
import SearchClient from "./pages/clients/SearchClient";
import ClientList from "./pages/clients/ClientList";
import ClientDetails from "./pages/clients/ClientDetails";
import TasksPage from "./pages/tasks/TaskPage";
import TaskDetails from "./pages/tasks/TaskDetails";
import MyTasks from "./pages/tasks/MyTasks";
import AdminTaskBoard from "./pages/tasks/AdminTaskBoard";
import AllTasks from "./pages/tasks/AllTasks";


export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* ========== PUBLIC (ONLY SIGNIN) ========== */}
        <Route path="/signin" element={<SignIn />} />

        {/* 🔐 Auth protected */}
        <Route
          element={
            
              <ProtectedRoute />}
        >
              {/* 🧱 Persistent layout */}
          <Route element ={<AppLayout />}>
          <Route index path="/" element={<Home />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/documents" element={<ReportViewer />} />
          <Route path="/snippets" element={<PhotoGallery />} />
          <Route path="/line-chart" element={<LineChart />} />
          
          {/* Staff: My Tasks */}
          <Route path="/my-tasks" element={<MyTasks />} />
          </Route>
          {/* ===== ADMIN ONLY ===== */}
          <Route element={<AdminRoute />}>
            <Route path="/signup" element={<SignUp />} />
              <Route element={<AppLayout />}>
                <Route path="/clients/create" element={<CreateClient />} />
                <Route path="/clients/search" element={<SearchClient />} />
                <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/:id" element={<ClientDetails />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetails />}/>
              <Route path="/my-task-board" element={<AdminTaskBoard />} />
              <Route path="/tasks/list" element={<AllTasks />} />
            </Route>
          </Route>


        </Route>

        {/* ========== FALLBACK ========== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
// AdminRoute guarantees:

// User is logged in

// User role === ADMIN

// Otherwise → redirect / block

// Even if:

// Button is hidden

// URL is typed manually