import React from 'react';
import { Link, useLocation } from "react-router-dom";
import {
  BsColumnsGap,
  BsFileEarmarkSpreadsheetFill,
  BsFillGrid3X3GapFill,
  BsCalendar2PlusFill,
  BsFillRocketFill
} from 'react-icons/bs';
import { IoClose } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import './Sidebar.css';

function Sidebar({ openSidebarToggle, OpenSidebar }) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Liste des routes pour vérifier l'élément actif
  const menuItems = [
    { path: '/EmploisDuTemps', icon: <FaCalendarAlt className="icon" />, label: 'Emplois du temps' },
    { path: '/PlanningExams', icon: <BsFileEarmarkSpreadsheetFill className="icon" />, label: 'Planning des exams' },
    { path: '/Evenement', icon: <BsFillGrid3X3GapFill className="icon" />, label: 'Évènements' },
    { path: '/EmploisPersonnalises', icon: <BsCalendar2PlusFill className="icon" />, label: 'Emplois personnalisés' },
    { path: '/ProjetsDeadlines', icon: <BsFillRocketFill className="icon" />, label: 'Projets & deadlines' },
  ];

  // Si l'utilisateur est sur la page d'accueil, marquer le premier élément comme actif
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
            <li key={index} className={(currentPath === item.path || (isHomePage && index === 0)) ? 'active' : ''}>
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
