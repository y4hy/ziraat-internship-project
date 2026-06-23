IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CustomerRegistrationDb')
BEGIN
    CREATE DATABASE CustomerRegistrationDb;
END
GO

USE CustomerRegistrationDb;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customer' AND xtype='U')
BEGIN
    CREATE TABLE Customer (
        Id             INT IDENTITY(1,1) PRIMARY KEY,
        FirstName      NVARCHAR(150)     NOT NULL,
        LastName       NVARCHAR(100)     NOT NULL,
        NationalNumber VARCHAR(11)       NOT NULL,
        Gender         CHAR(1)           NOT NULL,
        CustomerType   TINYINT           NOT NULL,
        Nationality    TINYINT           NOT NULL,
        Age            INT               NOT NULL,
        BankBranch     NVARCHAR(150)     NOT NULL,
        CreatedAt      DATETIME2         NOT NULL DEFAULT SYSDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customer_History' AND xtype='U')
BEGIN
    CREATE TABLE Customer_History (
        HistoryId      INT IDENTITY(1,1) PRIMARY KEY,
        Operation      VARCHAR(6)        NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
        ChangedAt      DATETIME2         NOT NULL DEFAULT SYSDATETIME(),
        Id             INT,
        FirstName      NVARCHAR(150),
        LastName       NVARCHAR(100),
        NationalNumber VARCHAR(11),
        Gender         CHAR(1),
        CustomerType   TINYINT,
        Nationality    TINYINT,
        Age            INT,
        BankBranch     NVARCHAR(150),
        CreatedAt      DATETIME2
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Customer_History')
BEGIN
    EXEC('
    CREATE TRIGGER trg_Customer_History
    ON Customer
    AFTER INSERT, UPDATE, DELETE
    AS
    BEGIN
        SET NOCOUNT ON;

        IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        BEGIN
            INSERT INTO Customer_History (Operation, Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt)
            SELECT ''UPDATE'', Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt
            FROM inserted;
        END
        ELSE IF EXISTS (SELECT 1 FROM inserted)
        BEGIN
            INSERT INTO Customer_History (Operation, Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt)
            SELECT ''INSERT'', Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt
            FROM inserted;
        END
        ELSE IF EXISTS (SELECT 1 FROM deleted)
        BEGIN
            INSERT INTO Customer_History (Operation, Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt)
            SELECT ''DELETE'', Id, FirstName, LastName, NationalNumber, Gender, CustomerType, Nationality, Age, BankBranch, CreatedAt
            FROM deleted;
        END
    END
    ');
END
GO
