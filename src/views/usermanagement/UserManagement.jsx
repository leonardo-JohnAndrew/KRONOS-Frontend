/* eslint-disable no-unused-vars */
import { useState, useEffect, useReducer, useCallback } from "react";
import axios from "axios";
import "./UserManagement.css";
import { FaCog, FaPlus, FaTrash, FaPencilAlt } from "react-icons/fa";
import { actions, initials, reducer } from "../../functions/formrequest";
import cleanData from "../../functions/cleandata";
import Header from "../../components/confimationbox/header";
import { useUserContext } from "../../context/usercontextprovider";
import formatDate from "../../functions/dateformat";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ArchiveModal from "../properties/ArchiveModal";
const UserManagement = () => {
  // Sample user data based on the image
  const [users, setUsers] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    userRole: "",
    dprtID: "",
    orgID: "",
    archive: "No",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [state, dispatch] = useReducer(reducer, initials);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [hasNotifications, setHasNotifications] = useState(false);
  const { usertoken } = useUserContext();
  const { dateformat } = formatDate();
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [userToArchive, setUserToArchive] = useState(null);
  //fetch user
  const fetchUsers = useCallback(() => {
    axios
      .get("/api/manage-user", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        const clean = cleanData(res, "noError");
        //   console.log(clean);
        setUsers(clean);
      });
  }, [usertoken]);

  // call all departments
  const fetchdepartments = useCallback(() => {
    dispatch({ type: actions.fetch_request });
    axios.get("/api/department").then((res) => {
      const clean = cleanData(res, "noError");
      setDepartments(clean); // store sa local state
      dispatch({
        type: actions.fetch_success,
        payload: { departments: clean },
      });
    });
  }, []);
  useEffect(() => {
    fetchdepartments();
    fetchUsers();
  }, [usertoken, formData, fetchUsers]);
  useEffect(() => {
    const selected = departments.find((dep) => dep.dprtID === formData.dprtID);
    // console.log("department:  ", departments.dprtID);
    if (selected) {
      setOrganizations(selected.organizations);
    } else {
      setOrganizations([]);
    }
    // reset org and position when changing department
    setFormData((prev) => ({
      ...prev,
      orgID: "",
      officerpostID: "",
    }));
  }, [formData.dprtID]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);
  // Handle changing pages
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  useEffect(() => {
    const departments = state.items.departments || [];
  }, [state.items.departments, state.loading]);

  useEffect(() => {
    // Simulate notification appearance after 2 seconds
    const timer = setTimeout(() => {
      setHasNotifications(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddUser = () => {
    setIsEdit(false);
    setEditingUser({
      fullName: "",
      userRole: "",
      username: "",
      password: "•••••",
    });

    setFormData({
      firstname: "",
      middlename: "",
      lastname: "",
      email: "",
      userRole: "",
      department: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleEditUser = (user) => {
    // Parse fullName into its components (assumed format: FirstName MiddleName LastName)

    setIsEdit(true);
    setEditingUser(user);
    setFormData({
      firstname: user.firstname,
      middlename: user.middlename,
      lastname: user.lastname,
      email: user.email,
      userRole: user.userRole,
      dprtID: user.department?.dprtID || "none",
      orgID: user.organization?.orgID || "none",
      dprtname: user.department?.dprtName || "none",
      orgname: user.organization?.orgName || "none",
      password: "",
      confirmPassword: "",

      lastLogin: user.latest_login || "---",
    });
  };

  const handleFormChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSaveUser = () => {
    if (!editingUser) return;
    if (formData.password !== formData.confirmPassword) {
      alert("Password and confirm password do not match.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const payload = {
      firstname: formData.firstname,
      middlename: formData.middlename,
      lastname: formData.lastname,
      email: formData.email,
      userRole: formData.userRole,
      dprtID: formData.dprtID,
      orgID: formData.orgID,
      officerpostID: formData.officerpostID,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${usertoken}`,
      },
    };

    if (isEdit) {
      // PATCH: Update existing user
      axios
        .patch(`/api/manage-user/update/${editingUser.userid}`, payload, config)
        .then(() => {
          fetchUsers();
          setEditingUser(null);
        })
        .catch((err) => {
          console.error("Update failed", err);
          alert("Failed to update user.");
        });
    } else {
      // POST: Register new user
      axios
        .post("/api/register", payload, config)
        .then(() => {
          fetchUsers();
          setEditingUser(null);
        })
        .catch((err) => {
          console.error("Registration failed", err);
          alert("Failed to register user.");
        });
    }

    // Clear form after save
    setFormData({
      firstname: "",
      middlename: "",
      lastname: "",
      email: "",
      userRole: "",
      dprtID: "",
      orgID: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleFilters = () => {
    alert("Filter options would appear here");
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      setSelectedUsers(filteredUsers.map((user) => user.userId));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  const handleArchiveUser = (userId, reason) => {
    axios
      .delete(
        `/api/manage-user/archive/${userId}`,
        { archive: "Yes", archiveReason: reason },
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      )
      .then(() => {
        fetchUsers();
      })
      .catch((err) => {
        console.error("Archiving failed", err);
        alert("Failed to archive user.");
      });
  };

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management-container">
      {/* header */}

      {/* Main content */}
      <div className="content">
        <h1>User Management</h1>
        <p className="subtitle">Manage users and their account permission</p>
        <hr />
        <div className="user-list-section">
          <div className="all-users">
            <span>All Users</span>
            <span className="user-count">{users.length}</span>
          </div>

          <div className="action-buttons">
            {/* <button className="filter-button" onClick={handleFilters}>
              <span className="filter-icon">
                <FaCog />
              </span>
              Filters
            </button> */}
            <button className="add-user-button" onClick={handleAddUser}>
              <span className="plus-icon">
                <FaPlus />
              </span>
              Add Users
            </button>
          </div>
        </div>

        {/* User list table */}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th className="user-id-column">User ID</th>
                <th>Full Name</th>
                <th>User Role</th>
                <th>Department</th>
                <th>Date Registered</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user) => (
                  <tr key={user.userid}>
                    <td className="user-id-cell">
                      <a href="#">{user.userid}</a>
                    </td>
                    <td>{user.lastname + ", " + user.firstname}</td>
                    <td>{user.userRole}</td>
                    <td>{user.department?.dprtName || "none"}</td>
                    <td>{dateformat(user.created_at)}</td>

                    <td className="action-cell">
                      <button
                        className="edit-button"
                        onClick={() => handleEditUser(user)}
                      >
                        <FaPencilAlt className="edit-icon" />
                      </button>
                      <button
                        className="delete-buttons"
                        onClick={() => {
                          setUserToArchive(user);
                          setShowArchiveModal(true);
                        }}
                      >
                        <FaTrash className="delete-icon" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="7" className="empty-message">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="user-modal">
            <div className="modal-header">
              <div className="modal-user-info">
                <h2 className="name-holder">
                  {" "}
                  {editingUser.userid
                    ? `${
                        editingUser.userid
                      }:   ${editingUser.lastname.toUpperCase()} , ${editingUser.firstname.toUpperCase()} `
                    : "New User"}
                </h2>
              </div>
              <span className="user-id-display">{editingUser.userId}</span>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    name="firstname"
                    className="form-control"
                    placeholder="First"
                    value={formData.firstname}
                    onChange={handleFormChange}
                  />
                  <input
                    type="text"
                    name="middlename"
                    className="form-control"
                    placeholder="Middle"
                    value={formData.middlename}
                    onChange={handleFormChange}
                  />
                  <input
                    type="text"
                    name="lastname"
                    className="form-control"
                    placeholder="Last"
                    value={formData.lastname}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleFormChange}
                />
              </div>
              <div className="row">
                {/* Left Column */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="userRole"
                      className="form-control"
                      value={formData.userRole}
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty Adviser">Faculty </option>
                      <option value="Faculty Adviser">Faculty Adviser</option>
                      <option value="Dean/Head">Dean/Head</option>
                      <option value="GSO Officer">GSO Officer</option>
                      <option value="GSO Director">GSO Director</option>
                    </select>
                  </div>
                  {
                    <div className="form-group">
                      <label>Department & Organization</label>
                      <div className="d-flex gap-2">
                        <select
                          name="dprtID"
                          className="form-control"
                          value={formData.dprtID}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              dprtID: parseInt(e.target.value),
                            }))
                          }
                        >
                          <option>
                            {isEdit ? formData.dprtname : "Department"}
                          </option>
                          {departments.map((dep) => (
                            <option key={dep.dprtID} value={dep.dprtID}>
                              {dep.dprtName}
                            </option>
                          ))}
                        </select>

                        <select
                          name="orgID"
                          className="form-control"
                          value={formData.orgID}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              orgID: parseInt(e.target.value),
                            }))
                          }
                          disabled={!organizations.length}
                        >
                          <option>
                            {isEdit ? formData.orgname : "Organization"}
                          </option>
                          {organizations.map((org) => (
                            <option key={org.orgID} value={org.orgID}>
                              {org.orgName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  }
                </div>

                {/* Right Column */}
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="New Password?"
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                    />
                  </div>

                  {isEdit && (
                    <div className="form-group">
                      <label>Last Login</label>
                      <input
                        type="text"
                        name="lastLogin"
                        className="form-control"
                        value={formData.lastLogin}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions mt-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={handleSaveUser}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Pagination Controls */}
      {users.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing <span>{Math.min(indexOfFirstItem + 1, users.length)}</span>{" "}
            to <span>{Math.min(indexOfLastItem, users.length)}</span> of{" "}
            <span>{users.length}</span> results
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-link"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="page-link"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      {showArchiveModal && userToArchive && (
        <ArchiveModal
          itemName={
            userToArchive
              ? `${userToArchive.lastname}, ${userToArchive.firstname}`
              : ""
          }
          onCancel={() => {
            setShowArchiveModal(false);
            setUserToArchive(null);
          }}
          handleArchive={(reason) => {
            handleArchiveUser(userToArchive.userid, reason);
            setShowArchiveModal(false);
            setUserToArchive(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
