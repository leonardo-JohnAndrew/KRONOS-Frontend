/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/DataTable.js

import "./DataTable.css";
import { FaCog, FaPlus, FaTrash, FaPencilAlt } from "react-icons/fa";
function DataTable({ columns, data, onEdit, onArchive }) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {/* <th></th> Checkbox column */}
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th></th> {/* Actions column */}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {/* <td>
                <input type="checkbox" />
              </td> */}
              {columns.map((col) => (
                <td key={col.key}>{item[col.key]}</td>
              ))}
              <td className="actions">
                <button className="icon-button" onClick={() => onArchive(item)}>
                  {/* <span role="img" aria-label="archive">
                    ⬇️
                    </span> */}
                  <FaTrash className="delete-icon" />
                </button>
                <button className="icon-button" onClick={() => onEdit(item)}>
                  {/* <span role="img" aria-label="edit">
                    📝
                    </span> */}
                  <FaPencilAlt className="edit-icon" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
