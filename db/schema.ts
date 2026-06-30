import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['super_admin', 'admin', 'project_manager', 'team_leader', 'employee', 'client'])
export const userStatusEnum = pgEnum('user_status', ['online', 'offline', 'busy', 'deactivated'])
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'critical'])
export const projectStatusEnum = pgEnum('project_status', ['backlog', 'active', 'review', 'testing', 'completed', 'cancelled', 'archived'])
export const taskStatusEnum = pgEnum('task_status', ['backlog', 'todo', 'in_progress', 'review', 'testing', 'completed', 'cancelled', 'archived'])
export const inviteStatusEnum = pgEnum('invite_status', ['pending', 'accepted', 'revoked', 'expired'])
export const approvalStatusEnum = pgEnum('approval_status', ['requested', 'approved', 'rejected', 'revision_requested'])
export const leaveStatusEnum = pgEnum('leave_status', ['pending', 'approved', 'rejected', 'cancelled'])

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logoUrl: text('logo_url'),
  timezone: text('timezone').default('UTC').notNull(),
  workingDays: jsonb('working_days').$type<string[]>().default(['mon', 'tue', 'wed', 'thu', 'fri']).notNull(),
  workingHours: jsonb('working_hours').$type<{ start: string; end: string }>().default({ start: '09:00', end: '18:00' }).notNull(),
  notificationSettings: jsonb('notification_settings').$type<Record<string, unknown>>().default({}).notNull(),
  emailTemplates: jsonb('email_templates').$type<Record<string, string>>().default({}).notNull(),
  ...timestamps,
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: roleEnum('role').notNull(),
  department: text('department'),
  designation: text('designation'),
  joiningDate: date('joining_date'),
  employeeId: text('employee_id'),
  phone: text('phone'),
  profilePictureUrl: text('profile_picture_url'),
  bio: text('bio'),
  skills: jsonb('skills').$type<string[]>().default([]).notNull(),
  workingHours: jsonb('working_hours').$type<{ weeklyCapacity: number }>().default({ weeklyCapacity: 40 }).notNull(),
  status: userStatusEnum('status').default('offline').notNull(),
  twoFactorReady: boolean('two_factor_ready').default(false).notNull(),
  deactivatedAt: timestamp('deactivated_at'),
  ...timestamps,
}, (table) => [uniqueIndex('users_company_email_unique').on(table.companyId, table.email)])

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  companyName: text('company_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  phone: text('phone'),
  email: text('email').notNull(),
  notes: text('notes'),
  documents: jsonb('documents').$type<string[]>().default([]).notNull(),
  ...timestamps,
})

export const invites = pgTable('invites', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  email: text('email').notNull(),
  role: roleEnum('role').notNull(),
  department: text('department'),
  designation: text('designation'),
  invitedById: integer('invited_by_id').references(() => users.id),
  status: inviteStatusEnum('status').default('pending').notNull(),
  acceptedAt: timestamp('accepted_at'),
  expiresAt: timestamp('expires_at'),
  ...timestamps,
})

export const workflowTemplates = pgTable('workflow_templates', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  name: text('name').notNull(),
  serviceType: text('service_type').notNull(),
  steps: jsonb('steps').$type<Array<{ title: string; department?: string; order: number }>>().notNull(),
  createdById: integer('created_by_id').references(() => users.id),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
})

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  clientId: integer('client_id').references(() => clients.id),
  workflowTemplateId: integer('workflow_template_id').references(() => workflowTemplates.id),
  name: text('name').notNull(),
  serviceType: text('service_type').notNull(),
  budget: decimal('budget', { precision: 12, scale: 2 }).default('0').notNull(),
  managerId: integer('manager_id').references(() => users.id),
  startDate: date('start_date'),
  deadline: date('deadline'),
  priority: priorityEnum('priority').default('medium').notNull(),
  status: projectStatusEnum('status').default('active').notNull(),
  progress: integer('progress').default(0).notNull(),
  description: text('description'),
  color: text('color').default('#27b089').notNull(),
  files: jsonb('files').$type<string[]>().default([]).notNull(),
  notes: text('notes'),
  archivedAt: timestamp('archived_at'),
  ...timestamps,
})

export const projectMembers = pgTable('project_members', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').default('member').notNull(),
  ...timestamps,
}, (table) => [uniqueIndex('project_members_unique').on(table.projectId, table.userId)])

export const milestones = pgTable('milestones', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  name: text('name').notNull(),
  dueDate: date('due_date'),
  completedAt: timestamp('completed_at'),
  ...timestamps,
})

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id),
  milestoneId: integer('milestone_id').references(() => milestones.id),
  parentTaskId: integer('parent_task_id'),
  name: text('name').notNull(),
  description: text('description'),
  priority: priorityEnum('priority').default('medium').notNull(),
  status: taskStatusEnum('status').default('todo').notNull(),
  labels: jsonb('labels').$type<string[]>().default([]).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  estimatedHours: decimal('estimated_hours', { precision: 8, scale: 2 }).default('0').notNull(),
  actualHours: decimal('actual_hours', { precision: 8, scale: 2 }).default('0').notNull(),
  startDate: date('start_date'),
  dueDate: date('due_date'),
  recurringRule: text('recurring_rule'),
  checklist: jsonb('checklist').$type<Array<{ title: string; done: boolean }>>().default([]).notNull(),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}).notNull(),
  archivedAt: timestamp('archived_at'),
  deletedAt: timestamp('deleted_at'),
  createdById: integer('created_by_id').references(() => users.id),
  ...timestamps,
})

export const taskAssignees = pgTable('task_assignees', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  ...timestamps,
}, (table) => [uniqueIndex('task_assignees_unique').on(table.taskId, table.userId)])

export const taskFollowers = pgTable('task_followers', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  ...timestamps,
})

export const taskDependencies = pgTable('task_dependencies', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id).notNull(),
  dependsOnTaskId: integer('depends_on_task_id').references(() => tasks.id).notNull(),
  ...timestamps,
})

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id),
  projectId: integer('project_id').references(() => projects.id),
  authorId: integer('author_id').references(() => users.id),
  body: text('body').notNull(),
  mentions: jsonb('mentions').$type<number[]>().default([]).notNull(),
  attachments: jsonb('attachments').$type<string[]>().default([]).notNull(),
  ...timestamps,
})

export const approvals = pgTable('approvals', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id),
  projectId: integer('project_id').references(() => projects.id),
  type: text('type').notNull(),
  requestedById: integer('requested_by_id').references(() => users.id),
  reviewerId: integer('reviewer_id').references(() => users.id),
  status: approvalStatusEnum('status').default('requested').notNull(),
  revisionNotes: text('revision_notes'),
  decidedAt: timestamp('decided_at'),
  ...timestamps,
})

export const timeEntries = pgTable('time_entries', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id),
  userId: integer('user_id').references(() => users.id).notNull(),
  startedAt: timestamp('started_at'),
  stoppedAt: timestamp('stopped_at'),
  minutes: integer('minutes').default(0).notNull(),
  billable: boolean('billable').default(true).notNull(),
  note: text('note'),
  ...timestamps,
})

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  workDate: date('work_date').notNull(),
  clockIn: timestamp('clock_in'),
  clockOut: timestamp('clock_out'),
  breakMinutes: integer('break_minutes').default(0).notNull(),
  lateArrival: boolean('late_arrival').default(false).notNull(),
  ...timestamps,
})

export const leaves = pgTable('leaves', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  reason: text('reason'),
  status: leaveStatusEnum('status').default('pending').notNull(),
  approvedById: integer('approved_by_id').references(() => users.id),
  ...timestamps,
})

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id),
  taskId: integer('task_id').references(() => tasks.id),
  folder: text('folder').default('/').notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  version: integer('version').default(1).notNull(),
  uploadedById: integer('uploaded_by_id').references(() => users.id),
  ...timestamps,
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  readAt: timestamp('read_at'),
  ...timestamps,
})

export const chatThreads = pgTable('chat_threads', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id),
  name: text('name').notNull(),
  isDirect: boolean('is_direct').default(false).notNull(),
  ...timestamps,
})

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id').references(() => chatThreads.id).notNull(),
  senderId: integer('sender_id').references(() => users.id),
  body: text('body').notNull(),
  attachments: jsonb('attachments').$type<string[]>().default([]).notNull(),
  readBy: jsonb('read_by').$type<number[]>().default([]).notNull(),
  ...timestamps,
})

export const calendarEvents = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  projectId: integer('project_id').references(() => projects.id),
  title: text('title').notNull(),
  type: text('type').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  googleEventId: text('google_event_id'),
  ...timestamps,
})

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  actorId: integer('actor_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps,
})

export const loginHistory = pgTable('login_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  provider: text('provider').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
