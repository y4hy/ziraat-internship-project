# Customer Registration Automation - Phase 3

A login screen form will be designed for the project. This will be the first form that opens in the project.

Its structure will be as follows:

- Username
- Password (The password field will display **** for each character entered. Next to the input, there will be a button called "Show" or shaped like an eye, which will reveal the password when clicked.)
- Login button

A database connection will be made for login verification. However, the parameters sent to the database for login will be done via SQL statements, not Stored Procedures.

- After a successful login, the first screen that greets the user will be the tabbed screen built in Phase 2. The first tab will be displayed.
- In addition to the tab structure carried over from Phase 2, a Menu structure will be added. The menu will contain 2 list items:
  - Customer Operations
  - Account Operations

The name of the first tab developed in Phase 2 will be revised to "Customer Transactions."

When the Account Operations item is clicked, the Customer Operations form will close. A new form named Account Operations will open. This form will contain the same list structure. When the list is opened and the Customer Operations item is selected, the currently open Account Operations form will close, and the Customer Operations form will open.

The design of the Account Operations form will be as follows:

It will contain 2 tabs:
- First tab: Customer Account Transactions
- Second tab: Customer Account Report

## Customer Account Transactions Tab

Inputs to be included in the design:

- Customer Number
- Customer Branch (Will be a combobox. When a customer branch is selected and "List" is clicked, the customers belonging to that branch will be displayed in the grid.)
- List button

When the Customer Number is entered, the customer's account information will be listed in the Account grid.

- If the customer does not have an account, a new item will be added to the grid.
- If the customer has an account, the existing account information will appear in the grid. The columns that will appear in the grid:
  - Account Number
  - Account Type (Time Deposit - Demand Deposit)
  - Currency (TL - USD - EUR)
  - Account Balance
  - Account Active Status (Yes, No)

## Customer Account Report Tab

Inputs to be included in the design:

- Customer Branch (ComboBox)
- Account Currency (ComboBox)
- Account Type (ComboBox)
- Account Active Status (ComboBox)
- Account Balance (Input)
- Report button
- If none of the inputs are selected, when the Report button is clicked, information for all customers will be listed in the grid, based on Account Type, Account Currency, Account Active Status, and total Account Balance.
- Customer Branch, Account Currency, Account Type, and Account Active Status will act as filter tools. If a selection is made in any of these, only data of that type will be reflected in the report.
- Account Balance will also act as a filter tool. If a balance value is entered, accounts with a balance greater than that value will be reflected in the report.
