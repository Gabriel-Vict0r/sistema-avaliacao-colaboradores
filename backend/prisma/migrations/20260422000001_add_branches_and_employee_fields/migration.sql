BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[branches] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(200) NOT NULL,
    [code] NVARCHAR(50) NOT NULL,
    [isActive] BIT NOT NULL CONSTRAINT [branches_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [branches_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [branches_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [branches_code_key] UNIQUE NONCLUSTERED ([code])
);

-- AlterTable: add new columns to employees
ALTER TABLE [dbo].[employees] ADD
    [branchId] INT NULL,
    [seniorId] NVARCHAR(50) NULL,
    [avaliador01] NVARCHAR(100) NULL,
    [avaliador02] NVARCHAR(100) NULL,
    [avaliador03] NVARCHAR(100) NULL,
    [avaliador04] NVARCHAR(100) NULL,
    [avaliador05] NVARCHAR(100) NULL,
    [avaliador06] NVARCHAR(100) NULL,
    [avaliador07] NVARCHAR(100) NULL,
    [avaliador08] NVARCHAR(100) NULL;

-- CreateIndex
CREATE NONCLUSTERED INDEX [employees_branchId_idx] ON [dbo].[employees]([branchId]);

-- AddForeignKey
ALTER TABLE [dbo].[employees] ADD CONSTRAINT [employees_branchId_fkey]
    FOREIGN KEY ([branchId]) REFERENCES [dbo].[branches]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
