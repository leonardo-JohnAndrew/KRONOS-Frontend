/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./purchase-requisition-form.css";
import ConfirmationPopup from "../../../components/confimationbox/ConfirmationPopup";
import cleanData from "../../../functions/cleandata";
import { useUserContext } from "../../../context/usercontextprovider";
import PopModal from "../../../components/confimationbox/popModal";

const PurchaseRequisitionForm = () => {
  // const token = localStorage.getItem("token");
  const [result, setResult] = useState();
  const [errors, setErrors] = useState({});
  const [isModal, setIsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { usertoken } = useUserContext();
  const [Data, setData] = useState({
    category: "",
    dateNeeded: "",
    purpose: "",
    notification:
      "Your Facility Request is Submitted Wait for Faculty Approval!",
  });

  const [materials, setMaterials] = useState({
    materials: [
      { quantity: "", materialName: "" },
      { quantity: "", materialName: "" },
      { quantity: "", materialName: "" },
    ],
  });
  const [category, setCategory] = useState({
    officeSupplies: false,
    computerParts: false,
    machineryParts: false,
    electricalSupply: false,
    others: false,
    officeEquipment: false,
    toolsEquipment: false,
    publications: false,
    otherConsumables: false,
  });

  const [reqstCODE, setCODE] = useState("");
  const [actualreqstCODE, setactualCODE] = useState("");
  //useRef
  const dateNeededRef = useRef();
  const purposeRef = useRef();

  const validateForm = () => {
    const newErrors = {};
    if (!dateNeededRef.current.value)
      newErrors.dateNeeded = "Date Needed is Required";
    if (!purposeRef.current.value) newErrors.purpose = "Purpose is Required";

    const hasValidMaterial = materials.materials.some(
      (item) => item.quantity.trim() !== "" && item.materialName.trim() !== ""
    );

    if (!hasValidMaterial)
      newErrors.materials = "At least one valid material is required.";
    const hasSelectedCategory = Object.values(category).some(
      (value) => value === true
    );
    if (!hasSelectedCategory)
      newErrors.category = "At least one category must be selected.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (errors) {
      const timeout = setTimeout(() => {
        setErrors({});
        setResult("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errors]);
  // Add state for showing the confirmation popup
  const [showConfirmation, setShowConfirmation] = useState(false);
  const latestcode = useCallback(() => {
    //  const token = localStorage.getItem("token");
    axios
      .get(`/api/purchase-request`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      })
      .then((res) => {
        const jsonData = cleanData(res, "noError");
        setCODE(jsonData.reqstCODE);
        return jsonData.reqstCODE;
      })
      .catch((error) => {
        console.error(" Error:", error);
      });
  }, []);

  useEffect(() => {
    latestcode();
  }, []);
  useEffect(() => {
    if (actualreqstCODE) {
      setIsModal(true); //
    }
  }, [actualreqstCODE]);
  const handleCategoryChange = (selectedCategory) => {
    setCategory((prev) => ({
      ...prev,
      [selectedCategory]: !prev[selectedCategory],
    }));
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toISOString().split("T")[0];
    setData({
      ...Data,
      dateNeeded: formattedDate,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...materials.materials];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setMaterials({
      ...materials,
      materials: updatedItems,
    });
  };

  // New function to add an item
  const handleAddItem = () => {
    setMaterials({
      ...materials,
      materials: [...materials.materials, { quantity: "", materialName: "" }],
    });
  };

  const handlePurposeChange = (e) => {
    setData({
      ...Data,
      purpose: e.target.value,
    });
  };

  // Updated submit handler to show confirmation popup
  const handleSubmit = (e) => {
    //setactualCODE(reqstCODE);
    e.preventDefault();
    setShowConfirmation(true);
  };

  // Handler for confirm button in popup
  const handleConfirmSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const string = Object.keys(category)
      .filter((key) => category[key])
      .join(", ");

    // Filter materials with valid values
    const filteredMaterial = materials.materials.filter(
      (item) => item.quantity.trim() !== "" && item.materialName.trim() !== ""
    );
    // Update the state (without using a callback)
    const updatedData = {
      ...Data,
      category: string,
      materials: filteredMaterial,
    };
    // Submit data after state update
    setIsSubmitting(true);
    await submitRequest(updatedData);
    setShowConfirmation(false);
    //setIsModal(true);
  };
  const submitRequest = async (updatedData) => {
    if (!validateForm()) {
      setResult("Validation Error: Please fill in all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/purchase-request/submit",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      );

      const jsonData = cleanData(response, "noError");
      console.log("Uploaded: ", jsonData);

      setResult(
        jsonData.message.includes("Submitted") ? "Submitted" : "Failed Submit"
      );
      if (jsonData.message.includes("Submitted")) {
        setactualCODE(reqstCODE);
        //  setModal(true);
      }
      setData({
        category: "",
        dateNeeded: "",
        purpose: "",
        notification:
          "Your Facility Request is Submitted Wait for Faculty Approval!",
      });
      setMaterials({
        materials: [
          { quantity: "", materialName: "" },
          { quantity: "", materialName: "" },
          { quantity: "", materialName: "" },
        ],
      });
      setCategory({
        officeSupplies: false,
        computerParts: false,
        machineryParts: false,
        electricalSupply: false,
        others: false,
        officeEquipment: false,
        toolsEquipment: false,
        publications: false,
        otherConsumables: false,
      });
      //setactualCODE("");
    } catch (error) {
      console.error("Error:", error);
      const jsonData = cleanData(error, "Error");
      setResult("Failed Submit");
      if (jsonData && jsonData.errors) {
        const validationErrors = Object.values(jsonData.errors)
          .flat()
          .join("\n");
        console.log("Error: ", validationErrors);
      }
    }
    setIsSubmitting(false);
    const newCode = await latestcode();
    setCODE(newCode);
  };

  // Handler for cancel button in popup
  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  const handleCloseModal = () => {
    setIsModal(false);
    setShowConfirmation(false);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="form-number">{reqstCODE}</div>
        <h1>Purchase Requisition Form</h1>
        <p>Kindly fill out all the required fields</p>
        <p className="sub-text">
          Accurate quotation of items are highly recommended
        </p>
        {result && (
          <div
            className={`alert ${
              result.includes("Submitted") ? "alert-success" : "alert-danger"
            }`}
          >
            {result}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {errors.category && (
          <small className="text-danger">{errors.category}</small>
        )}
        <div className="checkbox-container">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="officeSupplies"
              checked={category.officeSupplies}
              onChange={() => handleCategoryChange("officeSupplies")}
            />
            <label htmlFor="officeSupplies">Office Supplies</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="computerParts"
              checked={category.computerParts}
              onChange={() => handleCategoryChange("computerParts")}
            />
            <label htmlFor="computerParts">Computer Parts</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="machineryParts"
              checked={category.machineryParts}
              onChange={() => handleCategoryChange("machineryParts")}
            />
            <label htmlFor="machineryParts">Machinery/Parts</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="electricalSupply"
              checked={category.electricalSupply}
              onChange={() => handleCategoryChange("electricalSupply")}
            />
            <label htmlFor="electricalSupply">Electrical Supply</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="others"
              checked={category.others}
              onChange={() => handleCategoryChange("others")}
            />
            <label htmlFor="others">Others</label>
          </div>
        </div>

        <div className="checkbox-container-second-row">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="officeEquipment"
              checked={category.officeEquipment}
              onChange={() => handleCategoryChange("officeEquipment")}
            />
            <label htmlFor="officeEquipment">Office Equipment</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="toolsEquipment"
              checked={category.toolsEquipment}
              onChange={() => handleCategoryChange("toolsEquipment")}
            />
            <label htmlFor="toolsEquipment">Tools/Equipment</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="publications"
              checked={category.publications}
              onChange={() => handleCategoryChange("publications")}
            />
            <label htmlFor="publications">Publications</label>
          </div>

          <div className="checkbox-item">
            <input
              type="checkbox"
              id="otherConsumables"
              checked={category.otherConsumables}
              onChange={() => handleCategoryChange("otherConsumables")}
            />
            <label htmlFor="otherConsumables">Other Consumables</label>
          </div>
        </div>

        <div className="date-field">
          <label htmlFor="dateNeeded">Date Needed</label>
          <input
            type="date"
            className="form-input"
            style={{ width: "150px" }}
            id="dateNeeded"
            value={Data.dateNeeded}
            onChange={handleDateChange}
            ref={dateNeededRef}
          />
          {errors.dateNeeded && (
            <small className="text-danger">{errors.dateNeeded}</small>
          )}
        </div>

        <div className="items-table">
          {errors.materials && (
            <small className="text-danger">{errors.materials}</small>
          )}
          <div className="items-header">
            <div className="table-header">
              <label>Qty</label>
              <label>Particulars / Item Description /Specifications</label>
            </div>
            <button
              type="button"
              className="add-item-button"
              onClick={handleAddItem}
            >
              Add
            </button>
          </div>

          {materials.materials.map((item, index) => (
            <div key={index} className="item-row">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                min="0"
              />
              <input
                type="text"
                value={item.materialName}
                placeholder={index === 0 ? "" : "Type here..."}
                onChange={(e) =>
                  handleItemChange(index, "materialName", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div className="purpose-field">
          <label htmlFor="purpose">Purpose of Request</label>
          <input
            type="text"
            id="purpose"
            className="form-input"
            value={Data.purpose}
            onChange={handlePurposeChange}
            ref={purposeRef}
          />
          {errors.purpose && (
            <small className="text-danger">{errors.purpose}</small>
          )}
        </div>

        <button type="submit" className="submit-button">
          Submit Request
        </button>
      </form>

      {/* Render the confirmation popup conditionally */}
      {showConfirmation && (
        <ConfirmationPopup
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
        />
      )}

      <PopModal
        onClose={handleCloseModal}
        isOpen={isModal}
        referenceCode={actualreqstCODE}
      />
    </div>
  );
};

export default PurchaseRequisitionForm;
