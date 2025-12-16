# UM AI Chat Database ERD

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│     admins      │       │     users       │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ username        │       │ email           │
│ password_hashed │       │ password_hashed │
│ created_at      │       │ created_at      │
└─────────────────┘       │ last_active_at  │
          │               └─────────────────┘
          │                       │
          │                       │ 1:N
          │                       ▼
          │               ┌─────────────────┐
          │               │password_reset_  │
          │               │    tokens       │
          │               │─────────────────│
          │               │ id (PK)         │
          │               │ user_id (FK)    │
          │               │ code_hash       │
          │               │ expires_at      │
          │               │ used            │
          │               │ created_at      │
          │               └─────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────┐       ┌─────────────────┐
│   buildings     │       │  departments    │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ created_at      │       │ short_name      │
│ updated_at      │       │ admin_id (FK)   │
│ admin_id (FK)   │       │ created_at      │
└─────────────────┘       └─────────────────┘
          │                       │
          │ 1:N                  │ 1:N
          ▼                       ▼
┌─────────────────┐       ┌─────────────────┐
│     offices     │       │   professors    │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ name            │       │ name            │
│ building_id (FK)│       │ position        │
│ floor           │       │ email           │
│ open_time       │       │ program         │
│ close_time      │       │ department_id(FK│
│ lunch_start     │       │ admin_id (FK)   │
│ lunch_end       │       │ created_at      │
│ image_url       │       └─────────────────┘
│ admin_id (FK)   │
│ created_at      │
└─────────────────┘
          ▲
          │
          │ 1:N (same table name conflict)
          │
┌─────────────────┐
│     rooms       │
│─────────────────│
│ id (PK)         │
│ name            │
│ building_id (FK)│
│ floor           │
│ admin_id (FK)   │
│ status          │
│ type            │
│ image_url       │
│ created_at      │
└─────────────────┘
```

## Content Management Tables

```
┌─────────────────┐
│     admins      │
│─────────────────│
│ (central hub)   │
└─────────────────┘
          │
          │ 1:N (all content tables)
          ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     rules       │ │  announcements  │ │     logs        │
│─────────────────│ │─────────────────│ │─────────────────│
│ id (PK)         │ │ id (PK)         │ │ id (PK)         │
│ description     │ │ title           │ │ admin_id (FK)   │
│ admin_id (FK)   │ │ description     │ │ action          │
│ created_at      │ │ admin_id (FK)   │ │ details         │
└─────────────────┘ │ created_at      │ │ created_at      │
                    └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ vision_mission  │ │  campus_info    │ │non_teaching_   │
│─────────────────│ │─────────────────│ │    staff       │
│ id (PK)         │ │ id (PK)         │ │─────────────────│
│ description     │ │ description     │ │ id (PK)         │
│ admin_id (FK)   │ │ admin_id (FK)   │ │ name            │
│ created_at      │ │ created_at      │ │ role            │
└─────────────────┘ └─────────────────┘ │ admin_id (FK)   │
                                        │ created_at      │
                                        └─────────────────┘

┌─────────────────┐ ┌─────────────────┐
│   settings      │ │   officers      │
│─────────────────│ │─────────────────│
│ id (PK)         │ │ id (PK)         │
│ key_name        │ │ name            │
│ value           │ │ position        │
│ admin_id (FK)   │ │ organization    │
│ created_at      │ │ position_order  │
└─────────────────┘ │ admin_id (FK)   │
                    │ created_at      │
                    └─────────────────┘
```

## Chat & User Activity Tables

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │    feedback     │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ email           │       │ message         │
│ password_hashed │       │ rating          │
│ created_at      │       │ created_at      │
│ last_active_at  │       │ user_email      │
└─────────────────┘       └─────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────┐
│  historyChats   │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │
│ question        │
│ answer          │
│ created_at      │
└─────────────────┘
```

## Relationship Summary

### **One-to-Many Relationships:**
- **admins → buildings**: 1 admin can manage many buildings
- **admins → departments**: 1 admin can manage many departments
- **admins → offices**: 1 admin can manage many offices
- **admins → professors**: 1 admin can manage many professors
- **admins → rooms**: 1 admin can manage many rooms
- **admins → rules**: 1 admin can create many rules
- **admins → announcements**: 1 admin can create many announcements
- **admins → vision_mission**: 1 admin can manage many vision/mission entries
- **admins → campus_info**: 1 admin can manage many campus info entries
- **admins → non_teaching_staff**: 1 admin can manage many staff
- **admins → settings**: 1 admin can manage many settings
- **admins → logs**: 1 admin can have many log entries
- **admins → officers**: 1 admin can manage many student officers
- **buildings → offices**: 1 building can have many offices
- **buildings → rooms**: 1 building can have many rooms
- **departments → professors**: 1 department can have many professors
- **users → password_reset_tokens**: 1 user can have many reset tokens
- **users → historyChats**: 1 user can have many chat histories

### **Many-to-One Relationships:**
- All content tables → admins (managed by admin)
- offices → buildings (located in building)
- rooms → buildings (located in building)
- professors → departments (belong to department)
- password_reset_tokens → users (belong to user)
- historyChats → users (belong to user)

### **Special Notes:**
- **feedback** table is standalone (no FK relationships)
- **scanned_urls** table exists in migrations but not in main schema
- **officers** table is for student officers (different from offices)
- Image URLs exist for both **offices** and **rooms** tables
- Chat history is tracked per user with timestamps

## Legend
- **PK**: Primary Key
- **FK**: Foreign Key
- **1:N**: One-to-Many relationship
- **N:1**: Many-to-One relationship