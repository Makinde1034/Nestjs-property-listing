export enum PermissionsEnum {
  // Auctions Permissions
  AUCTIONS_READ = 'auctions-read',
  AUCTIONS_CREATE = 'auctions-create',
  AUCTIONS_EDIT = 'auctions-edit',
  AUCTIONS_DELETE = 'auctions-delete',
  AUCTIONS_EXPORT = 'auctions-export',
  AUCTIONS_VIEW_AUDIT_TRAIL = 'auctions-view-audit-trail',
  AUCTIONS_STATUS_DEACTIVATE_REACTIVATE = 'auctions-status-deactivate-reactivate',

  // CMS Permissions
  CMS_CREATE_CONTENT = 'cms-create-content',
  CMS_EDIT_CONTENT = 'cms-edit-content',
  CMS_VIEW = 'cms-view-cms',
  CMS_DELETE_CONTENT = 'cms-delete-content',
  CMS_VIEW_AUDIT_TRAIL = 'cms-view-cms-audit-trail',
  CMS_CHANGE_CONTENT_STATUS = 'cms-change-content-status-published-un-published',

  // CMS Categories Permissions
  CMS_CATEGORIES_VIEW = 'cms-categories-view-cms-categories',
  CMS_CATEGORIES_CREATE = 'cms-categories-create-categories',
  CMS_CATEGORIES_EDIT = 'cms-categories-edit-categories',
  CMS_CATEGORIES_DELETE = 'cms-categories-delete-categories',
  CMS_CATEGORIES_VIEW_AUDIT_TRAIL = 'cms-categories-view-categories-audit-trail',

  // Coupons Permissions
  COUPONS_VIEW = 'coupons-view-coupons',
  COUPONS_CREATE = 'coupons-create-coupons',
  COUPONS_EDIT = 'coupons-edit-coupons',
  COUPONS_EXPORT = 'coupons-export-coupons',
  COUPONS_DELETE = 'coupons-delete-coupons',
  COUPONS_VIEW_AUDIT_TRAIL = 'coupons-view-coupons-audit-trail',
  COUPONS_CHANGE_STATUS = 'coupons-change-coupon-status-deactivatereactivate',

  // Dashboard Permissions
  DASHBOARD_LISTINGS_FUNNEL = 'dashboard-listings-funnel',
  DASHBOARD_REVENUE_CARD = 'dashboard-revenue-card',
  DASHBOARD_USERS_FUNNEL = 'dashboard-users-funnel',
  DASHBOARD_USERS_DEMOGRAPHICS = 'dashboard-users-demgraphics',
  DASHBOARD_SAII_CARD = 'dashboard-saii-card',
  DASHBOARD_SUPPORT_RESPONSE_CARD = 'dashboard-support-response-card',

  // Issues Categories Permissions
  ISSUES_CATEGORIES_READ = 'issues-categories-read',
  ISSUES_CATEGORIES_CREATE = 'issues-categories-create',
  ISSUES_CATEGORIES_DELETE = 'issues-categories-delete',
  ISSUES_CATEGORIES_VIEW_AUDIT_TRAIL = 'issues-categories-view-audit-trail',

  // Knowledge Base Categories Permissions
  KB_CATEGORIES_READ = 'kb-categories-read',
  KB_CATEGORIES_CREATE = 'kb-categories-create',
  KB_CATEGORIES_EDIT = 'kb-categories-edit',
  KB_CATEGORIES_DELETE = 'kb-categories-delete',
  KB_CATEGORIES_VIEW_AUDIT_TRAIL = 'kb-categories-view-audit-trail',

  // Knowledge Base Permissions
  KNOWLEDGE_BASE_READ = 'knowledge-base-read',
  KNOWLEDGE_BASE_CREATE = 'knowledge-base-create',
  KNOWLEDGE_BASE_EDIT = 'knowledge-base-edit',
  KNOWLEDGE_BASE_DELETE = 'knowledge-base-delete',
  KNOWLEDGE_BASE_VIEW_AUDIT_TRAIL = 'knowledge-base-view-audit-trail',
  KNOWLEDGE_BASE_PUBLISH_UNPUBLISH = 'knowledge-base-publish-unpublish',

  // Listing Type and Attributes Permissions
  LISTING_TYPE_VIEW = 'listing-type-and-attributes-view-listing-types',
  LISTING_ATTRIBUTES_VIEW = 'listing-type-and-attributes-view-attributes',
  LISTING_TYPE_CREATE = 'listing-type-and-attributes-create-listing-types',
  LISTING_ATTRIBUTES_CREATE = 'listing-type-and-attributes-create-attributes',
  LISTING_TYPE_EDIT = 'listing-type-and-attributes-edit-listing-types',
  LISTING_ATTRIBUTES_EDIT = 'listing-type-and-attributes-edit-attributes',
  LISTING_TYPE_DELETE = 'listing-type-and-attributes-delete-listing-types',
  LISTING_ATTRIBUTES_DELETE = 'listing-type-and-attributes-delete-attributes',
  LISTING_TYPE_EXPORT = 'listing-type-and-attributes-export-listing-types',
  LISTING_ATTRIBUTES_EXPORT = 'listing-type-and-attributes-export-attributes',
  LISTING_TYPE_VIEW_AUDIT_TRAIL = 'listing-type-and-attributes-view-listing-types-audit-trail',
  LISTING_ATTRIBUTES_VIEW_AUDIT_TRAIL = 'listing-type-and-attributes-view-atrributes-audit-trail',

  // Listings Permissions
  LISTINGS_VIEW_DETAILS = 'listings-view-listing-details',
  LISTINGS_CREATE = 'listings-create',
  LISTINGS_EDIT = 'listings-edit',
  LISTINGS_DELETE = 'listings-delete',
  LISTINGS_EXPORT = 'listings-export',
  LISTINGS_VIEW_AUDIT_TRAIL = 'listings-view-audit-trail',
  LISTINGS_MULTI_ACTIONS = 'listings-multi-actions-stop-promotions,-deactivate,-etc',

  // Reports Permissions
  REPORTS_READ = 'reports-read',
  REPORTS_CREATE = 'reports-create',
  REPORTS_EXPORT = 'reports-export',

  // Response Templates Permissions
  RESPONSE_TEMPLATES_READ = 'response-templates-read',
  RESPONSE_TEMPLATES_EDIT = 'response-templates-edit',
  RESPONSE_TEMPLATES_CREATE = 'response-templates-create',
  RESPONSE_TEMPLATES_DELETE = 'response-templates-delete',
  RESPONSE_TEMPLATES_VIEW_AUDIT_TRAIL = 'response-templates-view-audit-trail',

  // Reviews Permissions
  REVIEWS_READ = 'reviews-read',
  REVIEWS_EXPORT = 'reviews-export',

  // Roles Permissions
  ROLES_VIEW = 'roles-view-roles',
  ROLES_CREATE = 'roles-create-roles',
  ROLES_EDIT = 'roles-edit-roles',
  ROLES_DELETE = 'roles-delete-role',
  ROLES_EXPORT = 'roles-export-roles',
  ROLES_VIEW_AUDIT_TRAIL = 'roles-view-roles-audit-trail',

  // Service Provider Applications Permissions

  SERVICE_PROVIDER_APPLICATIONS_VIEW = 'service-provider-applications-view-service-provider-applications',
  SERVICE_PROVIDER_APPLICATIONS_EXPORT = 'service-provider-applications-export-applications',
  SERVICE_PROVIDER_APPLICATIONS_VIEW_AUDIT_TRAIL = 'service-provider-applications-view-applications-audit-trail',
  SERVICE_PROVIDER_APPLICATIONS_APPROVE_DECLINE = 'service-provider-applications-approve-decline-applications',

  // Services Permissions
  SERVICES_READ = 'services-read',
  SERVICES_CREATE = 'services-create',
  SERVICES_EDIT = 'services-edit',
  SERVICES_DELETE = 'services-delete',
  SERVICES_EXPORT = 'services-export',
  SERVICES_VIEW_AUDIT_TRAIL = 'services-view-audit-trail',
  SERVICES_STATUS_DEACTIVATE_REACTIVATE = 'services-status-deactivate-reactivate',

  // Support Tickets Permissions
  SUPPORT_TICKETS_READ = 'support-tickets-read',
  SUPPORT_TICKETS_EDIT = 'support-tickets-edit',
  SUPPORT_TICKETS_EXPORT = 'support-tickets-export',
  SUPPORT_TICKETS_CHANGE_STATUS = 'support-tickets-change-status-open-,-closed,-etc',
  SUPPORT_TICKETS_VIEW_AUDIT_TRAIL = 'support-tickets-view-audit-trail',

  // System Settings Permissions
  SYSTEM_SETTINGS_VIEW = 'system-settings-view-system-settings',
  SYSTEM_SETTINGS_EDIT = 'system-settings-edit-system-settings',
  SYSTEM_SETTINGS_VIEW_AUDIT_TRAIL = 'system-settings-view-system-settings-audit-trail',

  // User Management Permissions
  USER_MANAGEMENT_CREATE = 'user-management-create-user',
  USER_MANAGEMENT_EDIT = 'user-management-edit-user',
  USER_MANAGEMENT_DELETE = 'user-management-delete-user',
  USER_MANAGEMENT_EDIT_STATUS = 'user-management-edit-user-status',
  USER_MANAGEMENT_RESET_PASSWORD = 'user-management-reset-password',
  USER_MANAGEMENT_VIEW_AUDIT_TRAIL = 'user-management-view-user-audit-trail',
  USER_MANAGEMENT_VIEW = 'user-management-view-user',
  USER_MANAGEMENT_EXPORT_INFORMATION = 'user-management-export-users-information',

  // Workflow Permissions
  WORKFLOW_READ = 'workflow-read',
  WORKFLOW_CREATE = 'workflow-create',
  WORKFLOW_EDIT = 'workflow-edit',
  WORKFLOW_DELETE = 'workflow-delete',
  WORKFLOW_EXPORT = 'workflow-export',
  WORKFLOW_VIEW_AUDIT_TRAIL = 'workflow-view-audit-trail',
  WORKFLOW_STATUS_DEACTIVATE_REACTIVATE = 'workflow-status-deactivate-reactivate',
}
