import { useState } from "react";
import { useUserContext } from "../context/usercontextprovider";
import axios from "axios";

/* eslint-disable no-unused-vars */
export default function Approval() {
  const [formData, setFormData] = useState(null);
  const { userInfo, usertoken } = useUserContext();
  const [status, setStatus] = useState();
  // approve

  const handleApprovalRequest = async (
    type,
    id,
    items = {},
    setSelectedRequest,
    selectedRequest,
    userrole,
    closeModal
  ) => {
    var updateData = {
      ...formData,
      remark: "Approved",
    };

    const canEdit =
      userInfo.userRole === "GSO Officer" ||
      userInfo.userRole === "GSO Director";

    if (canEdit) {
      // console.log(userInfo.userRole);
      switch (type) {
        case "PR":
          //console.log(items.purchase);
          updateData = {
            ...formData,
            remark: "Approved",
            materials: items.purchase,
            canEdit: "edit",
          };
          break;
        case "JR":
          updateData = {
            ...formData,
            remark: "Approved",
            candEdit: "edit",
            joblist: items.job,
          };
          break;
        case "VR":
          updateData = {
            ...formData,
            remark: "Approved",
            canEdit: "edit",
            vehicleID: items.vehicle.vehicleID,
            driver: items.vehicle.driver,
          };
          break;
      }
    } else {
      alert("not Authorized");
    }
    if (selectedRequest) {
      // if (isAuthorized) {
      //     const date = "";
      // }

      var approval;
      //axios
      switch (type) {
        case "FR":
          approval = axios.post(
            `/api/${userrole}/facility-request/${id}/approval`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${usertoken}`,
              },
            }
          );
          break;
        case "VR":
          approval = axios.post(
            `/api/${userrole}/service-request/${id}/approval`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${usertoken}`,
              },
            }
          );
          break;
        case "PR":
          approval = axios.post(
            `/api/${userrole}/purchase-request/${id}/approval`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${usertoken}`,
              },
            }
          );
          break;
        case "JR":
          approval = axios.post(
            `/api/${userrole}/job-request/${id}/approval`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${usertoken}`,
              },
            }
          );
          break;

        default:
          break;
      }

      approval
        .then((response) => {
          const cleanData = response.data.replace(/<!--.*?-->/g, "").trim();
          const jsonData = JSON.parse(cleanData, "noError");
          setStatus(jsonData.message);
          console.log(updateData);

          closeModal();
        })
        .catch((error) => {
          console.error("Error:", error);
          const cleanData = error.response.data
            .replace(/<!--.*?-->/g, "")
            .trim();
          const jsonData = JSON.parse(cleanData);
          const validationErrors = Object.values(jsonData.errors)
            .flat()
            .join("\n");
          setStatus(`Validation Error:\n${validationErrors}`);
        });
    }

    //   // const updatedRequest = {
    //   //     ...selectedRequest,
    //   //     status: "Ongoing",
    //   // };

    //   // // Update in the main requests list
    //   // setRequests(
    //   //     requests.map((req) =>
    //   //         req.id === selectedRequest.id ? updatedRequest : req
    //   //     )
    //   // );

    // Close the form and reset selection
    setSelectedRequest(null);
  };
  // reject

  // completed

  return status;
}
