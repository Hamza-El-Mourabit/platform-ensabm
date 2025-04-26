import React from 'react';
import { Link, useLocation } from "react-router-dom";
import {
  BsColumnsGap,
  BsFileEarmarkSpreadsheetFill,
  BsFillGrid3X3GapFill,
  BsFillRocketFill
} from 'react-icons/bs';
import { IoClose } from "react-icons/io5";
import { FaCalendarAlt, FaGraduationCap } from "react-icons/fa";
import './Sidebar.css';

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Liste des routes pour vérifier l'élément actif
  const menuItems = [
    { path: '/', icon: <BsColumnsGap className="icon" />, label: 'Tableau de bord' },
    { path: '/EmploisDuTemps', icon: <FaCalendarAlt className="icon" />, label: 'Emplois du temps' },
    { path: '/PlanningExams', icon: <BsFileEarmarkSpreadsheetFill className="icon" />, label: 'Planning des exams' },
    { path: '/Evenement', icon: <BsFillGrid3X3GapFill className="icon" />, label: 'Évènements' },
    { path: '/FormationsInscrites', icon: <FaGraduationCap className="icon" />, label: 'Formations inscrites' },
    { path: '/ProjetsDeadlines', icon: <BsFillRocketFill className="icon" />, label: 'Projets & deadlines' },
  ];

  // Vérifier si l'utilisateur est sur la page d'accueil (dashboard)
  const isHomePage = currentPath === '/' || currentPath === '';

  return (
    <aside className={`sidebar ${openSidebarToggle ? 'sidebar-responsive' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <BsColumnsGap className="icon" />
          <span>Menu Principal</span>
        </div>
        <button className="close-btn" onClick={OpenSidebar}>
          <IoClose className="icon" />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className={currentPath.toLowerCase() === item.path.toLowerCase() ? 'active' : ''}>
              <Link to={item.path}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
