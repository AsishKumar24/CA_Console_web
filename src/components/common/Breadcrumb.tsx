import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../api/useAuth";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface RouteConfig {
  pattern: RegExp;
  breadcrumbs: (params?: any) => BreadcrumbItem[];
  context?: {
    title: string;
    subtitle?: string;
    badge?: { text: string; color: string };
  };
}

export function Breadcrumb() {
  const location = useLocation();
  const { user } = useAuth();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [context, setContext] = useState<any>({});

  useEffect(() => {
    const path = location.pathname;

    // Route configurations - define breadcrumbs for each route pattern
    const routes: RouteConfig[] = [
      // Dashboard
      {
        pattern: /^\/$/,
        breadcrumbs: () => [{ label: 'Dashboard' }],
        context: {
          title: user?.role === 'ADMIN' ? 'Admin Dashboard' : 'My Dashboard',
          subtitle: 'Overview of your workspace',
        }
      },
      
      // Tasks
      {
        pattern: /^\/tasks$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Create Task' }
        ],
        context: {
          title: 'Create New Task',
          subtitle: 'Add a task to the system',
        }
      },
      {
        pattern: /^\/my-task-board$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'My Task Board' }
        ],
        context: {
          title: 'My Task Board',
          subtitle: 'Tasks assigned to you',
          badge: { text: 'Personal', color: 'purple' }
        }
      },
      {
        pattern: /^\/my-tasks$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'My Tasks' }
        ],
        context: {
          title: 'My Tasks',
          subtitle: 'Tasks assigned to you',
          badge: { text: 'Personal', color: 'purple' }
        }
      },
      {
        pattern: /^\/tasks\/list$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Tasks', path: '/tasks' },
          { label: 'All Tasks' }
        ],
        context: {
          title: 'All Tasks',
          subtitle: user?.role === 'ADMIN' ? 'Manage and track all tasks' : 'View assigned tasks',
          badge: { text: 'Active', color: 'blue' }
        }
      },
      {
        pattern: /^\/tasks\/archived$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Tasks', path: '/tasks' },
          { label: 'Archived Tasks' }
        ],
        context: {
          title: 'Archived Tasks',
          subtitle: 'View completed and archived tasks',
        }
      },
      {
        pattern: /^\/tasks\/[a-f0-9]{24}$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Tasks', path: '/tasks/list' },
          { label: 'Task Details' }
        ],
        context: {
          title: 'Task Details',
          subtitle: 'View and manage task information',
        }
      },
      
      // Clients
      {
        pattern: /^\/clients$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Clients' }
        ],
        context: {
          title: 'Client List',
          subtitle: 'View and manage clients',
          badge: { text: 'Admin', color: 'green' }
        }
      },
      {
        pattern: /^\/clients\/create$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Clients', path: '/clients' },
          { label: 'Create Client' }
        ],
        context: {
          title: 'Create New Client',
          subtitle: 'Add a client to the system',
        }
      },
      {
        pattern: /^\/clients\/search$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Clients', path: '/clients' },
          { label: 'Search' }
        ],
        context: {
          title: 'Search Clients',
          subtitle: 'Find clients in the system',
        }
      },
      {
        pattern: /^\/clients\/[a-f0-9]{24}$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Clients', path: '/clients' },
          { label: 'Client Details' }
        ],
        context: {
          title: 'Client Details',
          subtitle: 'View and manage client information',
        }
      },
      
      // Billing
      {
        pattern: /^\/billing$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Billing' }
        ],
        context: {
          title: 'Billing Dashboard',
          subtitle: 'Track payments and invoices',
          badge: { text: 'Finance', color: 'yellow' }
        }
      },
      {
        pattern: /^\/billing\/task\/[a-f0-9]{24}$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Billing', path: '/billing' },
          { label: 'Task Billing' }
        ],
        context: {
          title: 'Task Billing',
          subtitle: 'Manage billing for this task',
        }
      },
      {
        pattern: /^\/billing\/settings$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Billing', path: '/billing' },
          { label: 'Payment Settings' }
        ],
        context: {
          title: 'Payment Settings',
          subtitle: 'Configure payment modes and preferences',
          badge: { text: 'Admin', color: 'green' }
        }
      },
      
      // Profile
      {
        pattern: /^\/profile$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: user?.role === 'ADMIN' ? 'Staff Management' : 'Profile' }
        ],
        context: {
          title: user?.role === 'ADMIN' ? 'Staff Management' : 'My Profile',
          subtitle: user?.role === 'ADMIN' ? 'Manage staff members' : 'View your profile',
        }
      },
      
      // Staff Registration (Admin only)
      {
        pattern: /^\/signup$/,
        breadcrumbs: () => [
          { label: 'Home', path: '/' },
          { label: 'Staff Management', path: '/profile' },
          { label: 'Register Staff' }
        ],
        context: {
          title: 'Register New Staff',
          subtitle: 'Add a staff member to the system',
        }
      },
    ];

    // Find matching route
    const matchedRoute = routes.find(route => route.pattern.test(path));

    if (matchedRoute) {
      setBreadcrumbs(matchedRoute.breadcrumbs());
      setContext(matchedRoute.context || {});
    } else {
      // Fallback for unknown routes
      setBreadcrumbs([{ label: 'Home', path: '/' }, { label: 'Page' }]);
      setContext({});
    }
  }, [location, user]);

  const badgeColors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  };

  return (
    <div className="flex-1 max-w-2xl">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1 md:gap-2 text-xs md:text-sm mb-0.5 md:mb-1 flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1 md:gap-2">
            {index > 0 && (
              <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {crumb.path ? (
              <Link
                to={crumb.path}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-white font-medium truncate">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* Context Info */}
      {context.title && (
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
            {context.title}
          </h2>
          {context.badge && (
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${badgeColors[context.badge.color as keyof typeof badgeColors]}`}>
              {context.badge.text}
            </span>
          )}
          {context.subtitle && (
            <>
              <span className="hidden md:inline text-gray-400">•</span>
              <p className="hidden md:block text-xs text-gray-500 dark:text-gray-400 truncate">
                {context.subtitle}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
