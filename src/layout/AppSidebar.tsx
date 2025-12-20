import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDownIcon,
  HorizontaLDots,
  ListIcon,
  Binoculars,
  FileArchive,
  Client,
  PlusClient,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../api/useAuth";

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
      icon: (
        <Client className="size-6 fill-current text-gray-500 dark:text-gray-400" />
      ),
      subItems: [
        {
          name: "Create Client",
          icon: (
            <PlusClient className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
          path: "/clients/create",
        },
        {
          name: "Client List",
          path: "/clients",
          icon: (
            <ListIcon className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
        {
          name: "Search Client",
          path: "/clients/search",
          icon: (
            <Binoculars className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
      ],
    },
    {
      name: "Tasks",
      icon: (
        <FileArchive className="size-6 fill-current text-gray-500 dark:text-gray-400" />
      ),
      subItems: [
        {
          name: "Create Task",
          path: "/tasks",
          icon: (
            <PlusClient className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
        {
          name: "My Task Board",
          path: "/my-task-board",
          icon: (
            <ListIcon className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
        {
          name: "All Tasks",
          path: "/tasks/list",
          icon: (
            <ListIcon className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
        {
          name: "Archived Tasks",
          path: "/tasks/archived",
          icon: (
            <FileArchive className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
      ],
    },
    {
      name: "Billing",
      icon: (
        <svg className="size-6 fill-current text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="none">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V18M9 9H12.5C13.8807 9 15 10.1193 15 11.5C15 12.8807 13.8807 14 12.5 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      subItems: [
        {
          name: "Dashboard",
          path: "/billing",
          icon: (
            <ListIcon className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
        {
          name: "Payment Settings",
          path: "/billing/settings",
          icon: (
            <svg className="size-6 fill-current text-gray-500 dark:text-gray-400" viewBox="0 0 24 24">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
              <path fillRule="evenodd" d="M13.5 3a1.5 1.5 0 01.144 2.993L13.5 6H12v2.25a.75.75 0 01-1.493.102L10.5 8.25V6h-1.5a1.5 1.5 0 01-.144-2.993L9 3h4.5zm3.563 4.573a.75.75 0 011.152-.936l1.15 1.449a3.75 3.75 0 010 4.657l-1.15 1.45a.75.75 0 01-1.152-.937l1.05-1.323a2.25 2.25 0 000-2.794l-1.05-1.323zm-10.126 0l1.05 1.323a2.25 2.25 0 000 2.794l-1.05 1.323a.75.75 0 01-1.152.937l-1.15-1.45a3.75 3.75 0 010-4.656l1.15-1.45a.75.75 0 011.152.937zM12 15.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 011.5 0z" clipRule="evenodd"/>
            </svg>
          ),
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
      icon: (
        <FileArchive className="size-6 fill-current text-gray-500 dark:text-gray-400" />
      ),
      subItems: [
        {
          name: "Assigned to Me",
          path: "/my-tasks",
          icon: (
            <ListIcon className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
        },
        {
          name: "Archived Tasks",
          path: "/tasks/archived",
          icon: (
            <FileArchive className="size-6 fill-current text-gray-500 dark:text-gray-400" />
          ),
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
              {/* User Name with Gradient & Gloss */}
              <div className="relative">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
                  {user?.firstName ? `${user.firstName}'s` : "My"}
                </h1>
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Workspace Label with Decorative Line */}
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
                  {user?.role === "ADMIN" ? "Admin Console" : "Staff Portal"}
                </span>
              </div>
            </div>
          ) : (
            // Compact logo with modern design
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 
                flex items-center justify-center 
                shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20
                group-hover:shadow-2xl group-hover:shadow-blue-500/40 dark:group-hover:shadow-blue-500/30
                transform group-hover:scale-110 
                transition-all duration-300 ease-out
                relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Initial */}
                <span className="text-white font-bold text-xl relative z-10 drop-shadow-md">
                  {user?.firstName?.charAt(0).toUpperCase() || "W"}
                </span>
              </div>
              
              {/* Active Indicator */}
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
              <HorizontaLDots className="text-gray-400 dark:text-gray-600 w-6 h-6" />
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
                    <ChevronDownIcon
                      className={`ml-auto w-4 h-4 transition-all duration-300 ${
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
