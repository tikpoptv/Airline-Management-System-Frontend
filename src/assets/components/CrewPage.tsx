import './CrewPage.css';
import { FaUser } from 'react-icons/fa';

const CrewPage = () => {
  const employees = [
    { id: '01010101', name: 'Johnson Smith', role: 'Chief' },
    { id: '01010101', name: 'Johnson Smith', role: 'Chief' },
    { id: '01010101', name: 'Johnson Smith', role: 'Chief' },
    { id: '01010101', name: 'Johnson Smith', role: 'Chief' },
    { id: '01010101', name: 'Johnson Smith', role: 'Chief' },
  ];

  return (
    <div className="crew-page">
      <h4>Crew</h4>
      <h2 className="title">Crew management</h2>
      <table className="crew-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={index}>
              <td>{emp.id}</td>
              <td><FaUser className="user-icon" /> {emp.name}</td>
              <td>{emp.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CrewPage;