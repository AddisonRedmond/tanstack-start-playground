# MVP Specification

## Overview

Build an integrated reporting and dashboard solution that can be embedded into an existing application.

The reporting system allows users to create reusable reports by selecting database tables and columns without writing SQL. Reports are stored as JSON configurations that are later interpreted by a reporting engine responsible for generating and executing the final query.

The dashboard builder allows users to create visualizations from existing report data sources. Users can configure charts and basic aggregations without needing to understand the underlying data model.

---

# Goals

- Allow non-technical users to build reports from database tables.
- Store report definitions as JSON instead of SQL.
- Decouple report configuration from query execution.
- Provide reusable reports that can be consumed by dashboards.
- Allow dashboards to visualize report data with minimal configuration.

---

# Non Goals (MVP)

The following are intentionally out of scope for the first release:

- Complex SQL editing
- Multi-level table joins
- Many-to-many relationships
- Calculated fields
- Formula editor
- Scheduled reports
- Exporting
- Permissions beyond existing application permissions
- Dashboard sharing
- Real-time updates

---

# Report Builder MVP

## Table Selection

Users should be able to:

- Select a base database table.
- View all available columns.
- Select which columns should appear in the report.

---

## Relationships

Initially only support **1:1 relationships**.

If a selected table has a one-to-one relationship with another table, users should be able to:

- Expand the related table.
- Select columns from the related table.
- Treat those columns as part of the report.

Example

```
Users
    First Name
    Last Name
    Email

Profile (1:1)
    Phone Number
    Birthday
```

No nested relationships are required for the MVP.

---

## Report Configuration

A report should be stored entirely as JSON.

Example structure:

```json
{
  "table": "users",
  "columns": [
    "firstName",
    "lastName",
    "email"
  ],
  "relations": [
    {
      "table": "profile",
      "columns": [
        "phoneNumber",
        "birthday"
      ]
    }
  ],
}
```

The JSON acts as the source of truth.

A separate reporting engine will later ingest this configuration and generate the required database query.

---

## Running Reports

After a report has been created, users should be able to execute it.

Execution should support runtime filters.

Examples:

- User Name equals "John"
- Status equals "Active"
- Created Date after January 1st
- Organization equals "Sales"

Filters should not modify the saved report definition unless explicitly saved.

---

# Dashboard Builder MVP

## Data Source

Dashboards should use an existing report as their data source.

Workflow:

1. Select report.
2. Execute report.
3. Receive dataset.
4. Configure visualization.

The dashboard builder should never query the database directly.

---

## Visualizations

Initially support a small number of charts:

- Table
- Bar Chart
- Line Chart
- Pie Chart

Additional chart types can be added later.

---

## Data Mapping

Users should be able to assign:

- Category / Label field
- Value field

Example:

Category:
```
User Name
```

Value:
```
Total Sales
```

---

## Aggregations

Support a minimal set of aggregations:

- Sum
- Count
- Average
- Minimum
- Maximum

Example:

```
Sum all sales grouped by User Name
```

---

## Dashboard Filtering

Users should be able to apply simple filters before visualization.

Examples:

- Status = Active
- Region = Midwest
- Created This Month

These filters only affect the dashboard visualization.

---

# User Flow

## Report Builder

```
Choose Table

↓

Select Columns

↓

Expand 1:1 Relationships

↓

Select Related Columns

↓

Save JSON Configuration

↓

Run Report

↓

Apply Runtime Filters
```

---

## Dashboard Builder

```
Create Dashboard

↓

Choose Existing Report

↓

Load Report Data

↓

Select Visualization

↓

Choose Category Field

↓

Choose Value Field

↓

Select Aggregation

↓

Apply Optional Filters

↓

Save Dashboard
```

---

# Architecture

## Report Builder

Responsible for:

- Schema discovery
- Relationship discovery
- JSON configuration
- Report editing

Not responsible for:

- SQL generation
- Query execution

---

## Reporting Engine

Responsible for:

- Reading JSON
- Building SQL
- Applying runtime filters
- Executing queries
- Returning results

---

## Dashboard Builder

Responsible for:

- Loading report results
- Configuring visualizations
- Aggregating data
- Applying visualization filters

---

# MVP Success Criteria

The MVP is considered complete when users can:

- Browse database tables.
- Select columns.
- Select columns from directly related 1:1 tables.
- Save a report as JSON.
- Execute a report using the JSON configuration.
- Apply runtime filters.
- Create a dashboard from an existing report.
- Display report data using basic chart types.
- Perform simple aggregations.
- Save dashboard configurations.

---

# Future Enhancements

## Report Builder

- One-to-many relationships
- Many-to-many relationships
- Nested joins
- Custom calculated fields
- SQL preview
- Sorting
- Group By
- Pivot tables
- Saved filter presets
- Permissions per report

## Dashboard Builder

- Multiple data sources
- Multiple widgets per dashboard
- Cross-filtering
- Drill-down support
- Custom color palettes
- KPI cards
- Gauge charts
- Heat maps
- Dashboard sharing
- Auto refresh
- Scheduled report snapshots