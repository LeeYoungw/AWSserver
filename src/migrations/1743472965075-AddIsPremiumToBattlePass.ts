import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsPremiumToBattlePass1743472965075 implements MigrationInterface {
  name = 'AddIsPremiumToBattlePass1743472965075';

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`ALTER TABLE \`battle_log\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`ALTER TABLE \`battle_log\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);

    await queryRunner.query(`ALTER TABLE \`battle_pass\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    await queryRunner.query(`ALTER TABLE \`battle_pass\` CHANGE \`last_updated\` \`last_updated\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);

    await queryRunner.query(`ALTER TABLE \`user_deck\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`ALTER TABLE \`user_deck\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);

    await queryRunner.query(`ALTER TABLE \`shop_items_pool\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`ALTER TABLE \`shop_items_pool\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);

    await queryRunner.query(`ALTER TABLE \`shop_purchase_log\` DROP COLUMN \`purchase_time\``);
    await queryRunner.query(`ALTER TABLE \`shop_purchase_log\` ADD \`purchase_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);

    await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE \`shop_purchase_log\` DROP COLUMN \`purchase_time\``);
    await queryRunner.query(`ALTER TABLE \`shop_purchase_log\` ADD \`purchase_time\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);

    await queryRunner.query(`ALTER TABLE \`shop_items_pool\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`ALTER TABLE \`shop_items_pool\` ADD \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);

    await queryRunner.query(`ALTER TABLE \`user_deck\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`ALTER TABLE \`user_deck\` ADD \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);

    await queryRunner.query(`ALTER TABLE \`battle_pass\` CHANGE \`last_updated\` \`last_updated\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE \`battle_pass\` CHANGE \`created_at\` \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);

    await queryRunner.query(`ALTER TABLE \`battle_log\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`ALTER TABLE \`battle_log\` ADD \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
  }
}
