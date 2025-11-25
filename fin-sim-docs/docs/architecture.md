# FinSim Pro - Architecture

## High-Level Overview
FinSim Pro is a client-side React application built with Vite. It follows a unidirectional data flow where the `App` component holds the state, passes it to the `Simulation Engine` for calculation, and distributes the results to the `Chart` and `Timeline` components.

## Component Diagram

```mermaid
graph TD
    App[App.tsx] -->|State: Items, Accounts| Simulation[Simulation Engine]
    App -->|Props: Data, Settings| Chart[FinancialChart.tsx]
    App -->|Props: Items, Handlers| Sidebar[Sidebar.tsx]
    App -->|Props: Items, SimulationData| Timeline[TimelineEvents.tsx]

    subgraph "Simulation Engine"
        Simulation -->|Input| Calculate[calculateDailyBalances]
        Calculate -->|Output| Points[SimulationPoints[]]
    end

    subgraph "UI Components"
        Sidebar -->|User Action| UpdateState[Update App State]
        Timeline -->|Drag & Drop| Reorder[Reorder Items]
        Chart -->|Hover| Crosshair[Sync Crosshair]
    end

    Timeline -.->|Sync| Chart
```

## Key Modules

### 1. App Container (`App.tsx`)
- **Role**: Root orchestrator.
- **Responsibilities**:
  - Manages global state (`items`, `accounts`, `viewSettings`).
  - Triggers the simulation recalculation via `useMemo` whenever inputs change.
  - Handles global actions like Export/Import and Delete Account.

### 2. Simulation Service (`services/simulation.ts`)
- **Role**: The "Brain" of the application.
- **Logic**:
  - Iterates through every day from `viewStartDate` to `viewEndDate`.
  - For each day, applies active `FinancialItems` in their specified `order`.
  - Calculates interest/effects based on the running balance.
  - Returns an array of `SimulationPoint` objects.

### 3. Timeline (`TimelineEvents.tsx`)
- **Role**: Interactive list of events.
- **Features**:
  - **Drag-and-Drop**: Uses `@dnd-kit` to reorder items, which directly affects the calculation order in the simulation.
  - **Visual Sync**: Renders event bars that align perfectly with the Chart's X-Axis.
  - **Inline Controls**: Toggle visibility, delete, and view delta summaries.

### 4. Chart (`FinancialChart.tsx`)
- **Role**: Visualization.
- **Tech**: `recharts`.
- **Features**:
  - Responsive Area Chart.
  - Dynamic Granularity (Daily, Weekly, Monthly, etc.).
  - Custom Tooltips and Crosshair synchronization with the Timeline.
