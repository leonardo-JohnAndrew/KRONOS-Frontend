/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./main.css";
import axios from "axios";
import { useUserContext } from "../context/usercontextprovider";
import { u } from "fonts/defaultFont";

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReservationDropdownOpen, setIsReservationDropdownOpen] =
    useState(false);
  const { userInfo } = useUserContext();

  const allMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "□",
      section: "menu",
      path: "/main/content/dashboard",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "□",
      section: "menu",
      path: "/main/content/calendar",
    },
    {
      id: "reservation",
      label: "Reservation Forms",
      icon: "□",
      section: "menu",
      hasDropdown: true,
      path: "/main/content/reservation-forms",
      subItems: [
        {
          id: "facility-reservation",
          label: "Facility Reservation",
          path: "/main/reservation-forms/facility-reservation",
        },
        {
          id: "vehicle-reservation",
          label: "Vehicle Reservation",
          path: "/main/reservation-forms/vehicle-reservation",
        },
        {
          id: "purchase-requisition",
          label: "Purchase Requisition",
          path: "/main/reservation-forms/purchase-requisit",
          restrictedRoles: ["Student"],
        },
        {
          id: "job-request",
          label: "Job Request",
          path: "/main/reservation-forms/job-request",
          restrictedRoles: ["Student"],
        },
      ],
    },
    {
      id: "records",
      label: "Records",
      icon: "□",
      section: "menu",
      path: "/main/content/records",
    },
    {
      id: "request",
      label: "Request Management",
      icon: "□",
      section: "menu",
      path: "/main/content/request-management",
    },
    {
      id: "recommending",
      label: "Recommending Approval",
      icon: "□",
      section: "menu",
      path: "/main/content/request-management",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "□",
      section: "menu",
      path: "/main/content/reports",
    },
    {
      id: "properties",
      label: "Properties",
      icon: "□",
      section: "others",
      path: "/main/content/properties",
    },
    {
      id: "user",
      label: "User Management",
      icon: "□",
      section: "others",
      path: "/main/content/user-management",
    },
    {
      id: "logout",
      label: "Logout",
      icon: "□",
      section: "footer",
      hasArrow: true,
    },
  ];

  const getMenuItemsForRole = (userRole) => {
    const roleMenuMap = {
      "GSO Director": [
        "Dashboard",
        "Calendar",
        "Reservation Forms",
        "Records",
        "Request Management",
        "Reports",
        "Properties",
        "User Management",
      ],
      Student: ["Dashboard", "Calendar", "Reservation Forms", "Records"],

      Faculty: ["Dashboard", "Calendar", "Reservation Forms", "Records"],
      "Officer Assistant": [
        "Dashboard",
        "Calendar",
        "Reservation Forms",
        "Records",
      ],
      "Faculty Adviser": [
        "Dashboard",
        "Calendar",
        "Reservation Forms",
        "Records",
        "Recommending Approval",
      ],
      "Dean/Head": [
        "Dashboard",
        "Calendar",
        "Reservation Forms",
        "Records",
        "Recommending Approval",
      ],
      "GSO Officer": [
        "Dashboard",
        "Calendar",
        "Reservation Forms",
        "Records",
        "Request Management",
      ],
    };

    const allowedItems = roleMenuMap[userRole] || [];
    return allMenuItems.filter(
      (item) => allowedItems.includes(item.label) || item.label === "Logout"
    );
  };

  const menuItems = userInfo?.userRole
    ? getMenuItemsForRole(userInfo.userRole)
    : allMenuItems;

  const getFilteredSubItems = (subItems, userRole) => {
    if (!subItems) return [];
    return subItems.filter(
      (subItem) =>
        !subItem.restrictedRoles || !subItem.restrictedRoles.includes(userRole)
    );
  };

  const isItemActive = (item) => {
    if (activePage === item.label) return true;
    if (item.hasDropdown && item.subItems)
      return item.subItems.some((subItem) => subItem.label === activePage);
    return false;
  };

  const handleItemClick = (item) => {
    if (item.label === "Logout") {
      if (window.confirm("Are you sure you want to log out?")) onLogout();
    } else if (item.hasDropdown) {
      setIsReservationDropdownOpen(!isReservationDropdownOpen);
      //   setActivePage(item.label);
    } else {
      setActivePage(item.label);
      navigate(item.path);
      setIsReservationDropdownOpen(false);
    }
  };

  const handleSubItemClick = (subItem) => {
    setActivePage(subItem.label);
    navigate(subItem.path);
    //   setIsReservationDropdownOpen(false);
  };

  const renderMenuItem = (item) => (
    <div
      key={item.id}
      className={`menu-item ${isItemActive(item) ? "active" : ""}`}
      onClick={() => handleItemClick(item)}
    >
      <div className="flex items-center">
        <span
          className={`mr-3 ${
            isItemActive(item) ? "text-blue-500" : "text-gray-500"
          }`}
        >
          {isItemActive(item) ? "■" : item.icon}
        </span>
        <span className={isItemActive(item) ? "font-medium" : ""}>
          {item.label}
        </span>
      </div>
      {item.hasDropdown && (
        <span
          className={`text-gray-400 transform transition-transform duration-200 ${
            isReservationDropdownOpen ? "rotate-180" : ""
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path
              d="M3.5 4.5L6 7L8.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
      )}
      {item.hasArrow && !item.hasDropdown && (
        <span className="text-gray-400">&gt;</span>
      )}
    </div>
  );

  const renderSubItems = (item) =>
    item.hasDropdown &&
    isReservationDropdownOpen && (
      <div className="ml-6 mt-1">
        {getFilteredSubItems(item.subItems, userInfo?.userRole).map(
          (subItem) => (
            <div
              key={subItem.id}
              className={`menu-item ${
                activePage === subItem.label ? "active" : ""
              }`}
              onClick={() => handleSubItemClick(subItem)}
              style={{ paddingLeft: "1rem" }}
            >
              <div className="flex items-center">
                <span
                  className={`mr-3 ${
                    activePage === subItem.label
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  •
                </span>
                <span
                  className={activePage === subItem.label ? "font-medium" : ""}
                >
                  {subItem.label}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    );

  return (
    <div
      className={`h-screen bg-white flex flex-col shadow-md transition-all duration-300 ${
        isCollapsed ? "w-16" : ""
      }`}
    >
      <div className="side">
        <div className="p-4 border-b flex items-center justify-between">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6L10 13L14 9L21 16"
                stroke="#FF6B6B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 13L5 18L14 9L19 4"
                stroke="#FF6B6B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {!isCollapsed && (
              <div className="ml-2">
                <h1 className="text-lg font-bold text-blue-500">KRONOS</h1>
                <p className="text-xs text-gray-500">GSO Management System</p>
              </div>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-2">
              <p className="text-xs font-semibold text-gray-400 px-2 py-1">
                MENU
              </p>
              {menuItems
                .filter((i) => i.section === "menu")
                .map((item) => (
                  <div key={item.id}>
                    {renderMenuItem(item)}
                    {renderSubItems(item)}
                  </div>
                ))}
            </div>

            <div className="p-2">
              <p className="text-xs font-semibold text-gray-400 px-2 py-1">
                OTHERS
              </p>
              {menuItems
                .filter((i) => i.section === "others")
                .map(renderMenuItem)}
            </div>

            <div className="p-2 mt-auto">
              {menuItems
                .filter((i) => i.section === "footer")
                .map(renderMenuItem)}
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="flex-1 overflow-y-auto p-2">
            {["menu", "others", "footer"].map((section) => (
              <div key={section} className={section !== "menu" ? "mt-4" : ""}>
                {menuItems
                  .filter((i) => i.section === section)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`menu-item justify-center ${
                        isItemActive(item) ? "active" : ""
                      }`}
                      onClick={() => handleItemClick(item)}
                      title={item.label}
                    >
                      <span
                        className={`${
                          isItemActive(item) ? "text-blue-500" : "text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Layout = () => {
  const { usertoken, logout, loginID } = useUserContext();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(
    () => localStorage.getItem("active") || "Dashboard"
  );

  const handleLogout = async () => {
    try {
      await axios.post(
        "/api/logout",
        { id: loginID },
        { headers: { Authorization: `Bearer ${usertoken}` } }
      );
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      logout();
      localStorage.removeItem("active");
      navigate("/login");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem("active", page);
  };

  return (
    <div className="flex">
      <Sidebar
        activePage={currentPage}
        setActivePage={handlePageChange}
        onLogout={handleLogout}
      />
      <div className="flex-1 p-4 contents">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
