/* eslint-disable no-unused-vars */
// src/App.js

import Tabs from "./Tabs";
import DataTable from "./DataTable";
import ConfirmationModal from "./ConfirmationModal";
import EditFormModal from "./EditFormModal";
import AddFormModal from "./AddFormModal";
import ArchiveModal from "./ArchiveModal";
import "./properties.css"; // For basic styling
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useUserContext } from "../../context/usercontextprovider";
import cleanData from "../../functions/cleandata";
import {
  Search,
  Bell,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
function Properties() {
  const [activeTab, setActiveTab] = useState("facility"); // 'facility' or 'vehicle'
  const { usertoken } = useUserContext();
  const [refresh, setRefresh] = useState(false);
  // Initial Data for Facilities
  const [id, setId] = useState();
  const [facilities, setFacilities] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Determine data source based on tab
  const activeData = activeTab === "facility" ? facilities : vehicles;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(activeData.length / itemsPerPage);
  // Handle changing pages
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  // axios facilities
  /* 
 Route::post('/facilities', [FacilityController::class, 'add']);
        Route::get('/facilities/view', [FacilityController::class, 'showall']);
        Route::get('/facilities/view/{facilityID}', [FacilityController::class, 'show']);
        Route::patch('/facilities/update/{facilityID}', [FacilityController::class, 'update']);
        Route::delete('/facilities/archive/{facilityID}', [FacilityController::class, 'archive']);

*/
  //archived
  const archiveAxios = async (item, reason) => {
    var type;
    if (activeTab === "facility") {
      type = "facilities";
    } else {
      type = "vehicles";
    }
    await axios
      .delete(
        `/api/${type}/archive/${item.id}`,
        { archiveReason: reason },
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      )
      .then((res) => {
        //alert(cleanData(res, "noError"));
      })
      .catch((error) => {
        console.log(error);
      });
  };
  //saveAxios
  const saveAxios = async (item) => {
    var type;
    if (activeTab === "facility") {
      type = "facilities";
    } else {
      type = "vehicles";
    }
    await axios
      .post(`/api/${type}`, item, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        alert(cleanData(res, "noError").message);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //update

  const updateAxios = async (item) => {
    var type;
    if (activeTab === "facility") {
      type = "facilities";
    } else {
      type = "vehicles";
    }
    await axios
      .patch(`/api/${type}/update/${item.id}`, item, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        alert(cleanData(res, "noError").message);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  //fetch for the facilities
  const FetchFacilities = useCallback(() => {
    axios
      .get("/api/facilities/view", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        setFacilities(cleanData(res, "noError"));
        //console.log(facilities);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [usertoken]);
  // Initial Data for Vehicles

  /* 
          Route::post('/vehicles', [VehicleController::class, 'add']);
        Route::get('/vehicles/view', [VehicleController::class, 'showall']);
        Route::get('/vehicles/view/{vehicleID}', [VehicleController::class, 'show']);
        Route::patch('/vehicles/update/{vehicleID}', [VehicleController::class, 'update']);
        Route::delete('/vehicles/archive/{vehicleID}', [VehicleController::class, 'archive']);
        
        */

  //fetch vehicles

  const FetchVehicle = useCallback(() => {
    axios
      .get("/api/vehicles/view", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        setVehicles(cleanData(res, "noError"));
        console.log(vehicles);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [usertoken]);
  //useeffect for facilities
  useEffect(() => {
    FetchFacilities();
    FetchVehicle();
  }, [FetchFacilities, FetchVehicle, refresh]);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // State for controlling modal visibility
  const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // The item being edited/archived

  // Column definitions for Facility table
  const facilityColumns = [
    { key: "facilityID", label: "Facility ID" },
    { key: "facilityName", label: "Facility Name" },
    { key: "location", label: "Location" },
    { key: "description", label: "Description" },
    { key: "capacity", label: "Capacity" },
  ];

  // Column definitions for Vehicle table
  const vehicleColumns = [
    { key: "vehicleID", label: "Vehicle ID" },
    { key: "plateNo", label: "Plate Number" },
    { key: "maxSeat", label: "Capacity" },
    { key: "brand", label: "Brand" },
    { key: "unit", label: "Unit" },
  ];

  // Field definitions for Facility forms (Edit and Add)
  const facilityFormFields = [
    { name: "facilityID", label: "Facility ID", readOnly: true },
    {
      name: "facilityName",
      label: "Facility Name",
      type: "text",
      placeholder: "Enter facility name",
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Enter location",
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      placeholder: "Enter description",
    },
    {
      name: "capacity",
      label: "Capacity",
      type: "number",
      placeholder: "Enter capacity",
    },
  ];

  // Field definitions for Vehicle forms (Edit and Add)
  const vehicleFormFields = [
    { name: "vehicleID", label: "Vehicle ID", readOnly: true },
    {
      name: "plateNo",
      label: "Plate No.",
      type: "text",
      placeholder: "Enter plate number",
    },
    {
      name: "maxSeat",
      label: "Capacity",
      type: "number",
      placeholder: "Enter capacity",
    },
    {
      name: "color",
      label: "Color",
      type: "text",
      placeholder: "Enter color",
    },
    {
      name: "brand",
      label: "Brand",
      type: "text",
      placeholder: "Enter brand",
    },
    {
      name: "unit",
      label: "Unit",
      type: "text",
      placeholder: "Enter unit",
    },
    {
      name: "yearManufacture",
      label: "Year Model",
      type: "number",
      placeholder: "Enter year model",
    },
  ];

  // --- Handlers for Modals and Actions ---

  // Function to handle opening the edit confirmation modal
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditConfirmModalOpen(true);
  };

  // Function to handle confirmation of edit, then open the actual edit form modal
  const handleEditConfirm = () => {
    setIsEditConfirmModalOpen(false); // Close confirmation
    setIsEditModalOpen(true); // Open edit form
  };

  // Function to handle saving edited data
  const handleSaveEdit = (updatedItem) => {
    if (activeTab === "facility") {
      setFacilities(
        facilities.map((f) => (f.id === updatedItem.id ? updatedItem : f))
      );
    } else {
      setVehicles(
        vehicles.map((v) => (v.id === updatedItem.id ? updatedItem : v))
      );
    }
    updateAxios(updatedItem);
    setIsEditModalOpen(false); // Close edit form
    setSelectedItem(null); // Clear selected item
  };

  // Function to handle opening the add form modal
  const handleAddClick = () => {
    setSelectedItem(null); // Ensure no item is selected when adding
    setIsAddModalOpen(true);
  };

  // Function to handle saving new data
  const handleSaveAdd = (newItem) => {
    // Generate a new ID (in a real app, this would likely come from a backend API)

    // alert(id);

    if (activeTab === "facility") {
      setFacilities([...facilities, { ...newItem }]);
    } else {
      setVehicles([...vehicles, { ...newItem }]);
    }

    saveAxios(newItem);
    setIsAddModalOpen(false); // Close add form
  };

  // Function to handle opening the archive modal
  const handleArchiveClick = (item) => {
    setSelectedItem(item);
    setIsArchiveModalOpen(true);
  };

  // Function to handle confirming archive action
  const handleArchiveConfirm = (reason) => {
    // In a real application, you'd send an API call to archive the item (e.g., set an 'isArchived' flag).
    // For this example, we'll just filter it out from the display.
    if (!reason) {
      alert("Reason Filled is Required");
      return;
    }
    if (activeTab === "facility") {
      setFacilities(facilities.filter((f) => f.id !== selectedItem.id));
    } else {
      setVehicles(vehicles.filter((v) => v.id !== selectedItem.id));
    }
    archiveAxios(selectedItem, reason);
    alert(`Archiving ${selectedItem.id} with reason: ${reason}`); // Log the reason
    setIsArchiveModalOpen(false); // Close archive modal
    setSelectedItem(null); // Clear selected item
  };

  // Generic function to close any active modal
  const handleCloseModal = () => {
    setIsEditConfirmModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setIsArchiveModalOpen(false);
    setSelectedItem(null); // Always clear selected item when closing modals
  };

  return (
    <div className="app-container">
      <div className="properties-section">
        <h2>Properties</h2>
        <p>Properties under General Services Office</p>
        <hr />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="data-table-wrapper">
          {activeTab === "facility" && (
            <DataTable
              columns={facilityColumns}
              data={currentItems}
              onEdit={handleEditClick}
              onArchive={handleArchiveClick}
            />
          )}
          {activeTab === "vehicle" && (
            <DataTable
              columns={vehicleColumns}
              data={currentItems}
              onEdit={handleEditClick}
              onArchive={handleArchiveClick}
            />
          )}
        </div>
      </div>
      {/* Pagination Controls */}
      {activeData.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing{" "}
            <span>{Math.min(indexOfFirstItem + 1, activeData.length)}</span> to{" "}
            <span>{Math.min(indexOfLastItem, activeData.length)}</span> of{" "}
            <span>{activeData.length}</span> results
          </div>
          <div
            className="pagination"
            style={{
              marginRight: "10px",
            }}
          >
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

      {/* Add Button */}
      <button className="add-button" onClick={handleAddClick}>
        <span className="plus-icon">+</span>
      </button>

      {/* Modals are conditionally rendered based on state */}

      {/* Edit Confirmation Modal */}
      {isEditConfirmModalOpen && (
        <ConfirmationModal
          title="Are you sure you want to edit?"
          message="Warning: Data from the past transactions might be corrupted once edited."
          onConfirm={handleEditConfirm}
          onCancel={handleCloseModal}
          confirmText="Yes"
          cancelText="Cancel"
        />
      )}

      {/* Edit Form Modal */}
      {isEditModalOpen && selectedItem && (
        <EditFormModal
          title="EDIT"
          type={activeTab}
          data={selectedItem}
          onSave={handleSaveEdit}
          onCancel={handleCloseModal}
          // Pass the correct fields based on the active tab
          fields={
            activeTab === "facility" ? facilityFormFields : vehicleFormFields
          }
        />
      )}

      {/* Add Form Modal */}
      {isAddModalOpen && (
        <AddFormModal
          title="ADD"
          type={activeTab}
          onSave={handleSaveAdd}
          onCancel={handleCloseModal}
          // Pass the correct fields based on the active tab (excluding 'id' for add forms)
          fields={
            activeTab === "facility"
              ? facilityFormFields.filter((field) => field.name !== "id")
              : vehicleFormFields.filter((field) => field.name !== "id")
          }
          setId={setId}
        />
      )}

      {/* Archive Modal */}
      {isArchiveModalOpen && selectedItem && (
        <ArchiveModal
          itemName={selectedItem.id}
          handleArchive={handleArchiveConfirm}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Properties;
