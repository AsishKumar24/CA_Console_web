import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  CaretDown,
  DotsThree,
  Users,
  UserPlus,
  List,
  Binoculars,
  Archive,
  ClipboardText,
  Plus,
  Kanban,
  CurrencyInr,
  ChartPie,
  Gear,
  GearSix,
  Trash,
  Clock
} from "phosphor-react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; icon: React.ReactNode; path: string }[];
};

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  /* 🔧 FIX: per-submenu refs + heights */
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [subMenuHeights, setSubMenuHeights] = useState<Record<number, number>>(
    {}
  );

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  /* =========================
     ADMIN SIDEBAR CONFIG
     ========================= */
  const adminNavItems: NavItem[] = [
    {
      name: "Clients",
      icon: <Users size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
      subItems: [
        {
          name: "Create Client",
          icon: <UserPlus size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
          path: "/clients/create",
        },
        {
          name: "Client List",
          path: "/clients",
          icon: <List size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
        {
          name: "Search Client",
          path: "/clients/search",
          icon: <Binoculars size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
      ],
    },
    {
      name: "Tasks",
      icon: <ClipboardText size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
      subItems: [
        {
          name: "Create Task",
          path: "/tasks",
          icon: <Plus size={24} weight="bold" className="text-gray-500 dark:text-gray-400" />,
        },
        {
          name: "My Task Board",
          path: "/my-task-board",
          icon: <Kanban size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
        {
          name: "All Tasks",
          path: "/tasks/list",
          icon: <List size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
        {
          name: "Archived Tasks",
          path: "/tasks/archived",
          icon: <Archive size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
      ],
    },
    {
      name: "Billing",
      icon: <CurrencyInr size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
      subItems: [
        {
          name: "Dashboard",
          path: "/billing",
          icon: <ChartPie size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
        {
          name: "Payment Settings",
          path: "/billing/settings",
          icon: <Gear size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
      ],
    },
    {
      name: "Administrative",
      icon: <GearSix size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
      subItems: [
        {
          name: "Cleanup Console",
          path: "/management/cleanup",
          icon: <Trash size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
        {
          name: "Inactive Staff Tasks",
          path: "/management/staff-tasks",
          icon: <Clock size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
      ],
    },
  ];

  /* =========================
     STAFF SIDEBAR CONFIG
     ========================= */
  const staffNavItems: NavItem[] = [
    {
      name: "My Tasks",
      icon: <ClipboardText size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
      subItems: [
        {
          name: "Assigned to Me",
          path: "/my-tasks",
          icon: <List size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
        {
          name: "Archived Tasks",
          path: "/tasks/archived",
          icon: <Archive size={24} weight="duotone" className="text-gray-500 dark:text-gray-400" />,
        },
      ],
    },
  ];

  const navItems: NavItem[] = user?.role === "ADMIN" ? adminNavItems : user?.role === "STAFF" ? staffNavItems : [];

  /* =========================
     HEIGHT CALCULATION
     ========================= */
  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeights((prev) => ({
        ...prev,
        [openSubmenu]:
          subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  /* =========================
     RENDER
     ========================= */
  return (
    <aside
      className={`fixed top-0 left-0 mt-16 lg:mt-0 h-screen 
        bg-gradient-to-b from-white via-white to-gray-50/30
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-950
        border-r border-gray-200/60 dark:border-gray-800/60 
        shadow-xl dark:shadow-2xl dark:shadow-black/20
        backdrop-blur-sm
        z-50 transition-all duration-300 ease-in-out
        ${isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Personalized Workspace Header */}
      <div
        className={`py-6 px-5 flex flex-col border-b border-gray-100 dark:border-gray-800/50 
          bg-gradient-to-br from-transparent to-blue-50/10 dark:to-blue-950/10
          ${!isExpanded && !isHovered ? "items-center" : "items-start"}`}
      >
        <Link to="/" className="group relative">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="space-y-2">
              {/* Personalized Console Title */}
              <div className="relative">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight drop-shadow-sm line-clamp-1">
                  {user?.firstName ? `${user.firstName}'s` : "My"} Console
                </h1>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
                  Workspace
                </span>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-blue-400/40 via-purple-400/40 to-transparent rounded-full" />
              </div>
              
              {/* Role Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/30 dark:border-blue-800/30">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                <span className="text-[10px] font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  {user?.role === "ADMIN" ? "Admin Mode" : "Staff Mode"}
                </span>
              </div>
            </div>
          ) : (
            // Compact logo with the favicon
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 transform group-hover:scale-110 transition-all duration-300 ease-out relative">
                <img src="/favicon.png" alt="CA" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Menu */}
      <nav className="px-5 py-6 overflow-y-auto h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {/* Section Header */}
        <div className="mb-4 flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              <h2 className="text-xs font-bold uppercase bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-200 bg-clip-text text-transparent tracking-wider">
                {user?.role === "ADMIN" ? "Admin Tools" : "My Tools"}
              </h2>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <DotsThree size={24} weight="bold" className="text-gray-400 dark:text-gray-600" />
            </div>
          )}
        </div>

        <ul className="flex flex-col gap-2">
          {navItems.map((nav, index) => (
            <li key={nav.name}>
              <button
                onClick={() =>
                  setOpenSubmenu(openSubmenu === index ? null : index)
                }
                className={`menu-item group w-full rounded-xl transition-all duration-200
                  ${
                    openSubmenu === index
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 shadow-md border border-blue-200/50 dark:border-blue-800/50"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-transparent"
                  }
                  ${!isExpanded && !isHovered ? "justify-center p-3" : "justify-start px-4 py-3"}`}
              >
                <span
                  className={`transition-colors duration-200 ${
                    openSubmenu === index
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className={`menu-item-text font-medium transition-colors duration-200 ${
                      openSubmenu === index
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {nav.name}
                    </span>
                    <CaretDown
                      size={16}
                      weight="bold"
                      className={`ml-auto transition-all duration-300 ${
                        openSubmenu === index
                          ? "rotate-180 text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    />
                  </>
                )}
              </button>

              {(isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[index] = el;
                  }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    height:
                      openSubmenu === index
                        ? `${subMenuHeights[index] || 0}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9 border-l-2 border-gradient-to-b from-blue-200 to-purple-200 dark:from-blue-900/40 dark:to-purple-900/40 pl-4">
                    {nav.subItems?.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          to={sub.path}
                          className={`menu-dropdown-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                            ${
                              isActive(sub.path)
                                ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/60 dark:to-purple-950/60 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                            }`}
                        >
                          <span
                            className={`transition-colors duration-200 ${
                              isActive(sub.path)
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
                            }`}
                          >
                            {sub.icon}
                          </span>
                          <span className={`text-sm font-medium transition-colors duration-200 ${
                            isActive(sub.path)
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                          }`}>
                            {sub.name}
                          </span>
                          {isActive(sub.path) && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
