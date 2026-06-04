-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('PERSONA', 'CARGO', 'EMPRESA', 'CONTRATO', 'FAMILIA');

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('DESIGNO', 'OCUPA_CARGO', 'ES_PARIENTE_DE', 'ES_DUENO_DE', 'GANO', 'DENUNCIADO_POR', 'MENCIONADO_EN');

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "type" "NodeType" NOT NULL,
    "label" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "riskFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "sourceCaseId" TEXT,
    "evidenceHash" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "type" "EdgeType" NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "sourceCaseId" TEXT,
    "evidenceHash" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "subjectNodeId" TEXT NOT NULL,
    "facts" JSONB NOT NULL,
    "evidence" JSONB NOT NULL,
    "graphConnections" JSONB NOT NULL,
    "corroborationScore" DOUBLE PRECISION NOT NULL,
    "reporterPseudonym" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "evidenceHash" TEXT NOT NULL,
    "nftTokenId" TEXT,
    "nftTxHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "pseudonym" TEXT NOT NULL,
    "soulboundTokenId" TEXT,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "totalContributions" INTEGER NOT NULL DEFAULT 0,
    "totalCorroborated" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("pseudonym")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "contributedBy" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bounty" (
    "id" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountTsys" DOUBLE PRECISION NOT NULL,
    "nftBountyTokenId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "claimCriteria" TEXT NOT NULL,
    "postedBy" TEXT NOT NULL,
    "claimedBy" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Bounty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "channelUserId" TEXT NOT NULL,
    "pseudonym" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Node_type_idx" ON "Node"("type");

-- CreateIndex
CREATE INDEX "Node_label_idx" ON "Node"("label");

-- CreateIndex
CREATE INDEX "Edge_type_idx" ON "Edge"("type");

-- CreateIndex
CREATE INDEX "Edge_sourceNodeId_idx" ON "Edge"("sourceNodeId");

-- CreateIndex
CREATE INDEX "Edge_targetNodeId_idx" ON "Edge"("targetNodeId");

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_reporterPseudonym_idx" ON "Case"("reporterPseudonym");

-- CreateIndex
CREATE INDEX "Case_subjectNodeId_idx" ON "Case"("subjectNodeId");

-- CreateIndex
CREATE INDEX "Evidence_contributedBy_idx" ON "Evidence"("contributedBy");

-- CreateIndex
CREATE INDEX "Bounty_status_idx" ON "Bounty"("status");

-- CreateIndex
CREATE INDEX "Bounty_targetNodeId_idx" ON "Bounty"("targetNodeId");

-- CreateIndex
CREATE INDEX "ChatSession_pseudonym_idx" ON "ChatSession"("pseudonym");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_channel_channelUserId_key" ON "ChatSession"("channel", "channelUserId");

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_subjectNodeId_fkey" FOREIGN KEY ("subjectNodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

