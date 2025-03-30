import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1743338086589 implements MigrationInterface {
    name = 'InitSchema1743338086589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`battle_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`trophies_change\` int NOT NULL, \`card_change\` int NOT NULL, \`gold_change\` int NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`player1Id\` varchar(50) NULL, \`player2Id\` varchar(50) NULL, \`winnerId\` varchar(50) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`battle_pass\` (\`id\` int NOT NULL AUTO_INCREMENT, \`battle_pass_xp\` int NOT NULL DEFAULT '0', \`battle_pass_level\` int NOT NULL DEFAULT '1', \`is_active\` tinyint NOT NULL DEFAULT '1', \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`last_updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`userId\` varchar(50) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`civilizations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`user_deck\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`is_selected\` tinyint NOT NULL DEFAULT 0, \`userId\` varchar(50) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`deck_slots\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slot\` int NOT NULL, \`deckId\` int NULL, \`cardId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`card_level_stats\` (\`id\` int NOT NULL AUTO_INCREMENT, \`level\` int NOT NULL, \`health\` int NOT NULL, \`attack\` int NOT NULL, \`attack_speed\` float NOT NULL, \`cardId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`cards\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`type\` enum ('unit', 'spell', 'building') NOT NULL, \`mana_cost\` int NOT NULL, \`max_health\` int NOT NULL, \`attack\` int NOT NULL, \`movement_speed\` float NOT NULL, \`attack_range\` float NOT NULL, \`vision_range\` float NOT NULL, \`attack_speed\` float NOT NULL, \`hitbox_size\` float NOT NULL, \`summon_time\` float NOT NULL, \`projectile_speed\` float NOT NULL, \`civilizationId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`user_card\` (\`id\` int NOT NULL AUTO_INCREMENT, \`level\` int NOT NULL, \`quantity\` int NOT NULL, \`upgradeable\` tinyint NOT NULL DEFAULT 0, \`xp\` int NOT NULL DEFAULT '0', \`userId\` varchar(50) NULL, \`cardId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`shop_items_pool\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`price\` int NOT NULL, \`currency\` enum ('gold', 'diamond') NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`expires_at\` timestamp NOT NULL, \`is_purchased\` tinyint NOT NULL DEFAULT 0, \`userId\` varchar(50) NULL, \`cardId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`shop_purchase_log\` (\`id\` int NOT NULL AUTO_INCREMENT, \`total_price\` int NOT NULL, \`currency\` enum ('gold', 'diamond') NOT NULL, \`purchase_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`userId\` varchar(50) NULL, \`itemId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(50) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`level\` int NOT NULL DEFAULT '1', \`trophies\` int NOT NULL DEFAULT '0', \`gold\` int NOT NULL DEFAULT '0', \`diamond\` int NOT NULL DEFAULT '0', \`last_login\` timestamp NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`streak\` int NOT NULL DEFAULT '0', \`total_attendance\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // 🔗 Foreign Keys
        await queryRunner.query(`ALTER TABLE \`battle_log\` ADD CONSTRAINT \`FK_2d612e860e8382b418eb695c9bd\` FOREIGN KEY (\`player1Id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`battle_log\` ADD CONSTRAINT \`FK_67c37d56b0b5d21fb25d935c636\` FOREIGN KEY (\`player2Id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`battle_log\` ADD CONSTRAINT \`FK_8c0e2ff1534d8facd5f9f060453\` FOREIGN KEY (\`winnerId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`battle_pass\` ADD CONSTRAINT \`FK_2f1f063d9e8c67762f3f4c3e672\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_deck\` ADD CONSTRAINT \`FK_cca334b9d4a102ef44fbf8aeabe\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`deck_slots\` ADD CONSTRAINT \`FK_012312c581e8abab21ab63f0c9e\` FOREIGN KEY (\`deckId\`) REFERENCES \`user_deck\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`deck_slots\` ADD CONSTRAINT \`FK_ff145180e42bb2f11c3f22c5283\` FOREIGN KEY (\`cardId\`) REFERENCES \`cards\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`card_level_stats\` ADD CONSTRAINT \`FK_f85ae2b68c2926c22b71c592d7a\` FOREIGN KEY (\`cardId\`) REFERENCES \`cards\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`cards\` ADD CONSTRAINT \`FK_cc4ade0ce9074ab58cc7721050d\` FOREIGN KEY (\`civilizationId\`) REFERENCES \`civilizations\`(\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_card\` ADD CONSTRAINT \`FK_63c57bfaa0ef02c317b0c77f42c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_card\` ADD CONSTRAINT \`FK_5a656191ed12e26ca37b12bdc2f\` FOREIGN KEY (\`cardId\`) REFERENCES \`cards\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`shop_items_pool\` ADD CONSTRAINT \`FK_191cc7238c0c63bcfa4f9695aae\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`shop_items_pool\` ADD CONSTRAINT \`FK_73cecc49fedb85c4e46958ea7c9\` FOREIGN KEY (\`cardId\`) REFERENCES \`cards\`(\`id\`) ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`shop_purchase_log\` ADD CONSTRAINT \`FK_bfd87060905d2f4dd5152ecd9bf\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`shop_purchase_log\` ADD CONSTRAINT \`FK_75c0ddfef7227f71be7f2b847d7\` FOREIGN KEY (\`itemId\`) REFERENCES \`shop_items_pool\`(\`id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`shop_purchase_log\``);
        await queryRunner.query(`DROP TABLE \`shop_items_pool\``);
        await queryRunner.query(`DROP TABLE \`user_card\``);
        await queryRunner.query(`DROP TABLE \`cards\``);
        await queryRunner.query(`DROP TABLE \`card_level_stats\``);
        await queryRunner.query(`DROP TABLE \`deck_slots\``);
        await queryRunner.query(`DROP TABLE \`user_deck\``);
        await queryRunner.query(`DROP TABLE \`civilizations\``);
        await queryRunner.query(`DROP TABLE \`battle_pass\``);
        await queryRunner.query(`DROP TABLE \`battle_log\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}

