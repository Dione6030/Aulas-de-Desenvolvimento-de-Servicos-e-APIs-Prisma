-- CreateTable
CREATE TABLE `viagens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `destino` VARCHAR(200) NOT NULL,
    `transporte` ENUM('TERRESTRE', 'AEREO', 'MARITIMO') NOT NULL DEFAULT 'TERRESTRE',
    `preco` DECIMAL(10, 2) NOT NULL,
    `dataSaida` DATETIME(0) NOT NULL,
    `dataRetorno` DATETIME(0) NOT NULL,
    `roteiro` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
