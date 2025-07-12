import { useState } from "react";
import { FaSearch, FaBell } from "react-icons/fa";
const Header = ({ searchTerm }) => {
    const [hasNotifications, setHasNotifications] = useState(false);
    const handleSearch = (e) => {
        // setSearchTerm(e.target.value);
    };
    return (
        <div className="header">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-input"
                />
                <span className="search-icon">
                    <FaSearch />
                </span>
            </div>
            <div className="notification-icon">
                <FaBell className="bell-icon" />
                {hasNotifications && <span className="notification-dot"></span>}
            </div>
        </div>
    );
};
export default Header;
