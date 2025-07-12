import "./ReportsModule.css";
import SummarySection from "./SummarySection";
import RequestDistribution from "./RequestDistribution";
import RequestTrends from "./RequestTrends";
import CategoryFilter from "./CategoryFilter";
import VehicleRequestSection from "../sections/VehicleRequestSection";
import FacilityRequestSection from "../sections/FacilityRequestSection";
import PurchaseRequestSection from "../sections/PurchaseRequestSection";
import JobRequestSection from "../sections/JobRequestSection";
import { useEffect, useState } from "react";
import axios from "axios";
import cleanData from "../../../functions/cleandata";

const ReportsModule = () => {
  const [selectedCategory, setSelectedCategory] = useState("Facility");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [facilitySummary, setFacilitySummary] = useState({});
  const [facilityRequests, setFacilityRequests] = useState([]);
  const [vehicleSummary, setVehicleSummary] = useState({});
  const [vehicleRequests, setVehicleRequests] = useState([]);
  const [purchaseSummary, setPurchaseSummary] = useState({});
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [jobSummary, setJobSummary] = useState({});
  const [jobRequests, setJobRequests] = useState([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState([]);

  useEffect(() => {
    // Fetch reports summary & requests
    axios
      .get("/api/reports", {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      })
      .then((res) => {
        const { facility, vehicle, purchase, job } = cleanData(res, "noError");

        setFacilitySummary(facility.summary);
        setFacilityRequests(facility.requests);

        setVehicleSummary(vehicle.summary);
        setVehicleRequests(vehicle.requests);

        setPurchaseSummary(purchase.summary);
        setPurchaseRequests(purchase.requests);

        setJobSummary(job.summary);
        setJobRequests(job.requests);
      })
      .catch((err) => {
        console.error("Failed to load report data", err);
      });

    // Fetch monthly trend data
    axios
      .get("/api/reports/monthly", {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      })
      .then((res) => {
        setMonthlyTrendData(cleanData(res, "noError"));
      })
      .catch((err) => {
        console.error("Failed to load monthly trends", err);
      });
  }, [dateRange, selectedCategory]);
  console.log(monthlyTrendData);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleDateChange = (type, value) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
    setSelectedCategory("Facility");
  };

  const totalSummary = {
    total:
      Number(facilitySummary.total || 0) +
      Number(vehicleSummary.total || 0) +
      Number(purchaseSummary.total || 0) +
      Number(jobSummary.total || 0),
    completed:
      Number(facilitySummary.completed || 0) +
      Number(vehicleSummary.completed || 0) +
      Number(purchaseSummary.completed || 0) +
      Number(jobSummary.completed || 0),
    approved:
      Number(facilitySummary.approved || 0) +
      Number(vehicleSummary.approved || 0) +
      Number(purchaseSummary.approved || 0) +
      Number(jobSummary.approved || 0),
    ongoing:
      Number(facilitySummary.ongoing || 0) +
      Number(vehicleSummary.ongoing || 0) +
      Number(purchaseSummary.ongoing || 0) +
      Number(jobSummary.ongoing || 0),
    rejected:
      Number(facilitySummary.rejected || 0) +
      Number(vehicleSummary.rejected || 0) +
      Number(purchaseSummary.rejected || 0) +
      Number(jobSummary.rejected || 0),
    submitted:
      Number(facilitySummary.submitted || 0) +
      Number(vehicleSummary.submitted || 0) +
      Number(purchaseSummary.submitted || 0) +
      Number(jobSummary.submitted || 0),
  };

  const distributionData = [
    { name: "Facility", value: facilitySummary.total || 0, color: "#3498db" },
    { name: "Vehicle", value: vehicleSummary.total || 0, color: "#2ecc71" },
    { name: "Purchase", value: purchaseSummary.total || 0, color: "#f39c12" },
    { name: "Job", value: jobSummary.total || 0, color: "#f1c40f" },
  ];

  const renderRequestSection = () => {
    switch (selectedCategory) {
      case "Facility":
        return (
          <FacilityRequestSection
            summary={facilitySummary}
            requests={facilityRequests}
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        );
      case "Vehicle":
        return (
          <VehicleRequestSection
            summary={vehicleSummary}
            requests={vehicleRequests}
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        );
      case "Purchase":
        return (
          <PurchaseRequestSection
            summary={purchaseSummary}
            requests={purchaseRequests}
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        );
      case "Job":
        return (
          <JobRequestSection
            summary={jobSummary}
            requests={jobRequests}
            dateRange={dateRange}
            onDateChange={handleDateChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="reports-module">
      <div className="headers">
        <h1>Reports</h1>
      </div>

      <SummarySection data={totalSummary} />

      <div className="reports-visualization">
        <div className="chart-section">
          <h3>Request:</h3>
          <RequestDistribution data={distributionData} />
        </div>
        <div className="chart-section">
          <RequestTrends data={monthlyTrendData} />
        </div>
      </div>

      <CategoryFilter
        categories={distributionData.map((item) => item.name)}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {renderRequestSection()}
    </div>
  );
};

export default ReportsModule;
