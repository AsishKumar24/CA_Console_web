/**
 * ============================================
 * LEGACY STAFF HISTORY - TYPESCRIPT UTILITIES
 * ============================================
 * Helper functions for managing task attribution
 * when staff members are deleted from the system
 * ============================================
 */

export interface TaskAssignment {
  name: string;
  email?: string;
  type: 'active' | 'legacy' | 'unassigned';
}

export interface Task {
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
  legacyAssignedName?: string;
}

/**
 * Formats a legacy staff name for display
 */
export function formatLegacyStaffName(legacyName: string | null | undefined): string {
  if (!legacyName) return 'Unknown Staff';
  return legacyName.trim();
}

/**
 * Gets the display name for a task assignment
 * Handles active staff, inactive staff, and legacy (deleted) staff
 */
export function getTaskAssignmentDisplay(task: Task): TaskAssignment {
  // Active staff member
  if (task.assignedTo && task.assignedTo.firstName) {
    return {
      name: `${task.assignedTo.firstName} ${task.assignedTo.lastName || ''}`.trim(),
      email: task.assignedTo.email,
      type: 'active'
    };
  }
  
  // Legacy staff (deleted)
  if (task.legacyAssignedName) {
    return {
      name: formatLegacyStaffName(task.legacyAssignedName),
      type: 'legacy'
    };
  }
  
  // Unassigned
  return {
    name: 'Unassigned',
    type: 'unassigned'
  };
}

/**
 * Checks if a task has legacy attribution
 */
export function isLegacyTask(task: Task): boolean {
  return Boolean(task.legacyAssignedName && !task.assignedTo);
}

/**
 * Gets Tailwind CSS classes for the assignment badge
 */
export function getAssignmentBadgeClass(type: 'active' | 'legacy' | 'unassigned'): string {
  const classes = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800',
    legacy: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    unassigned: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
  };
  
  return classes[type];
}

/**
 * Gets an emoji icon for the assignment type
 */
export function getAssignmentIcon(type: 'active' | 'legacy' | 'unassigned'): string {
  const icons = {
    active: '✓',
    legacy: '📜',
    unassigned: '⚠️'
  };
  
  return icons[type];
}

/**
 * Gets a human-readable label for the assignment type
 */
export function getAssignmentLabel(type: 'active' | 'legacy' | 'unassigned'): string {
  const labels = {
    active: 'Active Staff',
    legacy: 'Legacy (Deleted)',
    unassigned: 'Not Assigned'
  };
  
  return labels[type];
}
