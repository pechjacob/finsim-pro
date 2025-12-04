# FinSim Pro - Project Overview

## Purpose
FinSim Pro is a financial simulation application designed to help users visualize and forecast their financial future. It allows users to model various financial scenarios by defining accounts, income sources, expenses, and compounding effects over time.

## Key Features
- **Financial Simulation**: Projects daily balances up to 5 years into the future based on user-defined events.
- **Interactive Chart**: A responsive area chart (using Recharts) visualizing the projected balance over time.
- **Event Timeline**: A drag-and-drop timeline interface for managing financial events (income, expenses, effects).
- **Compounding Effects**: Supports complex financial logic like compound interest, inflation, or recurring adjustments.
- **Scenario Management**: Users can toggle events on/off to see how different decisions impact their financial trajectory.
- **Data Persistence**: Supports exporting and importing simulation data via JSON.

## Core Concepts
- **Accounts**: Containers for funds (e.g., Checking, Savings).
- **Items (Events)**: Discrete financial actions:
  - **Income**: Adds to balance (e.g., Salary).
  - **Expense**: Subtracts from balance (e.g., Rent).
  - **Effect**: Modifies balance based on formulas (e.g., 5% annual interest).
- **Simulation Engine**: A deterministic engine that calculates daily balances by applying all active items in chronological order.
