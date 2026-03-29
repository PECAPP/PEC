-- CreateTable
CREATE TABLE "HostelIssue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "roomNumber" TEXT NOT NULL,
    "studentId" TEXT,
    "studentName" TEXT NOT NULL,
    "organizationId" TEXT,
    "responses" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostelIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusMapRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "link" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusMapRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampusMapRoad" (
    "id" TEXT NOT NULL,
    "points" JSONB NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusMapRoad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMaterial" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "fileURL" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'other',
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HostelIssue_studentId_status_idx" ON "HostelIssue"("studentId", "status");

-- CreateIndex
CREATE INDEX "HostelIssue_organizationId_idx" ON "HostelIssue"("organizationId");

-- CreateIndex
CREATE INDEX "HostelIssue_createdAt_idx" ON "HostelIssue"("createdAt");

-- CreateIndex
CREATE INDEX "CampusMapRegion_organizationId_category_idx" ON "CampusMapRegion"("organizationId", "category");

-- CreateIndex
CREATE INDEX "CampusMapRoad_organizationId_idx" ON "CampusMapRoad"("organizationId");

-- CreateIndex
CREATE INDEX "CourseMaterial_courseId_type_idx" ON "CourseMaterial"("courseId", "type");

-- CreateIndex
CREATE INDEX "CourseMaterial_uploadedBy_idx" ON "CourseMaterial"("uploadedBy");
