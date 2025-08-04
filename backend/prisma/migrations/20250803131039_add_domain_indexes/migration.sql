-- CreateIndex
CREATE INDEX `domains_status_idx` ON `domains`(`status`);

-- CreateIndex
CREATE INDEX `domains_registrar_idx` ON `domains`(`registrar`);

-- CreateIndex
CREATE INDEX `domains_createdAt_idx` ON `domains`(`createdAt`);

-- CreateIndex
CREATE INDEX `domains_name_idx` ON `domains`(`name`);
