
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings } from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
}

const SidebarLink = ({ to, icon, label, isActive }: SidebarLinkProps) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center p-4 rounded-md transition-colors ${
          isActive
            ? "bg-medivault-blue text-white hover:bg-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <span className="mr-3">{icon}</span>
        {label}
      </Link>
    </li>
  );
};

interface DashboardSidebarProps {
  userType: "patient" | "diagnostic";
}

const DashboardSidebar = ({ userType }: DashboardSidebarProps) => {
  const location = useLocation();
  const baseRoute = userType === "patient" ? "/patient" : "/diagnostic";

  const dashboardLinks = [
    {
      to: `${baseRoute}-dashboard`,
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      to: `${baseRoute}-settings`,
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="text-medivault-blue text-2xl font-bold">
          MediVault
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {dashboardLinks.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              isActive={location.pathname === link.to}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
