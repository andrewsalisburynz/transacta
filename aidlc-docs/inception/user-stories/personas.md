# User Personas - Household Spending Tracker

## Purpose
This document defines the user personas for the Household Spending Tracker application. These personas represent the different contexts and mindsets users will have when interacting with the application throughout its lifecycle.

---

## Primary Personas

### Persona 1: Alex - The Setup Enthusiast

**Role**: First-time user setting up the application

**Background**:
- Tech-savvy household member comfortable with command-line tools
- Has experience with npm and basic web development
- Motivated to solve the household's spending tracking problem
- Downloaded the application and is ready to get started

**Technical Comfort Level**: High
- Comfortable running `npm install` and `npm start`
- Understands basic concepts like CSV files and databases
- Can troubleshoot basic technical issues

**Goals and Motivations**:
- Get the application running quickly and correctly
- Set up meaningful spending categories that match household needs
- Import the first batch of transactions successfully
- Provide initial training data for the ML system

**Pain Points and Frustrations**:
- Unclear setup instructions or missing dependencies
- Not knowing what categories to create initially
- Uncertainty about how much initial training data is needed
- Confusion about CSV format requirements

**Usage Pattern**:
- One-time intensive setup session (30-60 minutes)
- Creates initial categories based on household spending patterns
- Imports first CSV file and manually classifies transactions
- May need to iterate on category structure

**Success Criteria**:
- Application runs without errors
- Categories are created and make sense for household needs
- First CSV file imports successfully
- Initial transactions are classified and saved
- Understands how to use the application going forward

---

### Persona 2: Jordan - The Monthly Manager

**Role**: Regular user performing monthly transaction imports

**Background**:
- Household member responsible for tracking monthly spending
- May or may not be the person who set up the application
- Has basic computer skills but not highly technical
- Downloads bank CSV file monthly and wants quick, accurate classification

**Technical Comfort Level**: Medium
- Can navigate web interfaces comfortably
- Understands basic file operations (download, upload)
- Prefers clear instructions and intuitive interfaces
- May need help with technical errors

**Goals and Motivations**:
- Import monthly transactions quickly (under 10 minutes)
- Trust that ML classification is accurate
- Only review transactions that need attention
- Maintain accurate spending records with minimal effort

**Pain Points and Frustrations**:
- Having to manually review too many transactions
- Unclear why ML suggested a particular category
- Difficulty finding and correcting misclassified transactions
- Confusing error messages or import failures

**Usage Pattern**:
- Monthly usage (once per month, typically after bank statement arrives)
- Session duration: 10-20 minutes
- Workflow: Download CSV → Upload to app → Review flagged transactions → Approve classifications
- Occasional category adjustments as spending patterns change

**Success Criteria**:
- CSV import completes without errors
- Most transactions (>80%) are auto-approved with high confidence
- Flagged transactions are easy to review and classify
- Can complete monthly import in under 15 minutes
- Feels confident that classifications are accurate

---

### Persona 3: Sam - The Insight Seeker

**Role**: User analyzing spending patterns and generating reports

**Background**:
- Household member interested in understanding spending trends
- Uses reports to make budgeting decisions
- May or may not be the person who imports transactions
- Wants clear, actionable insights from spending data

**Technical Comfort Level**: Low to Medium
- Comfortable with web interfaces
- Understands basic financial concepts (categories, totals, trends)
- Prefers simple, clear visualizations
- Not interested in technical details

**Goals and Motivations**:
- Understand where household money is going
- Identify categories with high spending
- Make informed decisions about budget adjustments
- Track spending changes over time

**Pain Points and Frustrations**:
- Reports that are too complex or technical
- Difficulty selecting the right time period
- Unclear category names or groupings
- Missing or incomplete data in reports

**Usage Pattern**:
- Variable usage: weekly to monthly
- Session duration: 5-10 minutes
- Workflow: Navigate to reports → Select month → Review spending by category
- May drill into specific categories to see transactions

**Success Criteria**:
- Can generate monthly report in under 5 clicks
- Report clearly shows spending totals by category
- Can easily compare spending across months
- Report format is simple and easy to understand
- Can identify actionable insights (e.g., "We spent too much on dining out")

---

### Persona 4: Casey - The Category Curator

**Role**: User managing and refining spending categories

**Background**:
- Detail-oriented household member who wants precise categorization
- Notices when transactions are miscategorized
- Wants to improve ML accuracy by refining categories
- May create new categories as spending patterns evolve

**Technical Comfort Level**: Medium
- Comfortable with web interfaces and data management
- Understands the relationship between categories and ML learning
- Willing to invest time to improve system accuracy
- Appreciates control over categorization structure

**Goals and Motivations**:
- Maintain clean, logical category structure
- Ensure all transactions are correctly categorized
- Improve ML classification accuracy over time
- Adapt categories as household needs change

**Pain Points and Frustrations**:
- Difficulty finding miscategorized transactions
- Unclear impact of category changes on historical data
- Cannot merge or split categories easily
- ML doesn't learn from corrections quickly enough

**Usage Pattern**:
- Periodic usage: every few months or when issues arise
- Session duration: 20-40 minutes
- Workflow: Review categories → Identify issues → Create/edit/delete categories → Reclassify transactions
- May batch-edit multiple transactions at once

**Success Criteria**:
- Can create, edit, and delete categories easily
- Can find and reclassify transactions by category
- Understands which categories have transactions
- Can see ML learning improve after corrections
- Category structure remains clean and logical

---

## Persona Usage Mapping

### By User Story Phase

**First-Time Setup**:
- Primary: Alex (The Setup Enthusiast)
- Secondary: Jordan (will eventually use the setup)

**Regular CSV Import**:
- Primary: Jordan (The Monthly Manager)
- Secondary: Alex (may continue to be the importer)

**Transaction Review and Approval**:
- Primary: Jordan (The Monthly Manager)
- Secondary: Casey (when reviewing for accuracy)

**Category Management**:
- Primary: Casey (The Category Curator)
- Secondary: Alex (during initial setup)

**Reporting and Analysis**:
- Primary: Sam (The Insight Seeker)
- Secondary: Jordan (quick checks after import)

### By Technical Comfort Level

**High Technical Comfort**: Alex
- Can handle setup, troubleshooting, and technical errors
- Comfortable with command-line and configuration

**Medium Technical Comfort**: Jordan, Casey
- Can use web interfaces effectively
- Prefer clear instructions and intuitive design
- May need help with technical errors

**Low to Medium Technical Comfort**: Sam
- Needs simple, clear interfaces
- Focuses on outcomes, not technical details
- Requires minimal training

---

## Persona Validation

### Coverage Check
✅ **First-time user**: Alex covers initial setup and configuration
✅ **Regular user**: Jordan covers ongoing monthly usage
✅ **Analysis user**: Sam covers reporting and insights
✅ **Power user**: Casey covers advanced category management

### Technical Diversity
✅ **High technical**: Alex (comfortable with setup and troubleshooting)
✅ **Medium technical**: Jordan and Casey (comfortable with web interfaces)
✅ **Low technical**: Sam (needs simple, intuitive interfaces)

### Motivation Diversity
✅ **Efficiency-focused**: Jordan (wants quick, accurate imports)
✅ **Insight-focused**: Sam (wants to understand spending patterns)
✅ **Accuracy-focused**: Casey (wants precise categorization)
✅ **Setup-focused**: Alex (wants to get system running correctly)

### Usage Pattern Diversity
✅ **One-time intensive**: Alex (initial setup)
✅ **Regular periodic**: Jordan (monthly imports)
✅ **Variable occasional**: Sam (reporting as needed)
✅ **Periodic maintenance**: Casey (category refinement)

---

## Notes

- All personas represent the same household but in different contexts and mindsets
- A single person may embody multiple personas at different times
- Personas focus on goals and context rather than demographic details
- Technical comfort level varies by persona to ensure application serves all users
- Each persona has clear success criteria to guide story acceptance criteria

