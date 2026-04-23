BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[users] (
    [id] INT NOT NULL IDENTITY(1,1),
    [adUsername] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [role] NVARCHAR(20) NOT NULL CONSTRAINT [users_role_df] DEFAULT 'EVALUATOR',
    [isActive] BIT NOT NULL CONSTRAINT [users_isActive_df] DEFAULT 1,
    [lastLogin] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [users_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [users_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [users_adUsername_key] UNIQUE NONCLUSTERED ([adUsername]),
    CONSTRAINT [users_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[employees] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(200) NOT NULL,
    [email] NVARCHAR(255),
    [position] NVARCHAR(200) NOT NULL,
    [department] NVARCHAR(200) NOT NULL,
    [type] NVARCHAR(20) NOT NULL,
    [managerId] INT,
    [isActive] BIT NOT NULL CONSTRAINT [employees_isActive_df] DEFAULT 1,
    [hireDate] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [employees_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [employees_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [employees_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[evaluations] (
    [id] INT NOT NULL IDENTITY(1,1),
    [employeeId] INT NOT NULL,
    [evaluatorId] INT NOT NULL,
    [type] NVARCHAR(20) NOT NULL,
    [average] FLOAT(53) NOT NULL,
    [decision] NVARCHAR(20) NOT NULL,
    [justification] NVARCHAR(max) NOT NULL,
    [pointsImprovement] NVARCHAR(max),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [evaluations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [evaluations_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[evaluation_ratings] (
    [id] INT NOT NULL IDENTITY(1,1),
    [evaluationId] INT NOT NULL,
    [criterionId] NVARCHAR(50) NOT NULL,
    [criterionName] NVARCHAR(200) NOT NULL,
    [category] NVARCHAR(200) NOT NULL,
    [weight] FLOAT(53) NOT NULL,
    [rating] FLOAT(53) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [evaluation_ratings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [evaluation_ratings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[audit_logs] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT,
    [action] NVARCHAR(100) NOT NULL,
    [entityType] NVARCHAR(100) NOT NULL,
    [entityId] NVARCHAR(20) NOT NULL,
    [changes] NVARCHAR(max),
    [ipAddress] NVARCHAR(45),
    [userAgent] NVARCHAR(500),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [audit_logs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [audit_logs_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [employees_type_idx] ON [dbo].[employees]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [employees_isActive_idx] ON [dbo].[employees]([isActive]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [evaluations_employeeId_idx] ON [dbo].[evaluations]([employeeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [evaluations_evaluatorId_idx] ON [dbo].[evaluations]([evaluatorId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [evaluations_createdAt_idx] ON [dbo].[evaluations]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [evaluations_decision_idx] ON [dbo].[evaluations]([decision]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [evaluation_ratings_evaluationId_idx] ON [dbo].[evaluation_ratings]([evaluationId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_logs_userId_idx] ON [dbo].[audit_logs]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_logs_createdAt_idx] ON [dbo].[audit_logs]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [audit_logs_entityType_idx] ON [dbo].[audit_logs]([entityType]);

-- AddForeignKey
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[employees]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[evaluations] ADD CONSTRAINT [evaluations_evaluatorId_fkey] FOREIGN KEY ([evaluatorId]) REFERENCES [dbo].[users]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[evaluation_ratings] ADD CONSTRAINT [evaluation_ratings_evaluationId_fkey] FOREIGN KEY ([evaluationId]) REFERENCES [dbo].[evaluations]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[audit_logs] ADD CONSTRAINT [audit_logs_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[users]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
