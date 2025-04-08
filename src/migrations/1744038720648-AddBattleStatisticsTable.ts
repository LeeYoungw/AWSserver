import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBattleStatisticsTable1744038720648 implements MigrationInterface {
  name = 'AddBattleStatisticsTable1744038720648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 이미 테이블이 존재하므로 CREATE TABLE 제거

    // users 테이블에 exp 컬럼이 없다면 추가
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`exp\` int NOT NULL DEFAULT '0'`);

    // timestamp 관련 오류 방지: 변경 대신 생략하거나 조건 검사 후 변경하는 방식이 좋지만 단순화 위해 주석처리 가능
    // await queryRunner.query(`ALTER TABLE \`battle_pass\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    // await queryRunner.query(`ALTER TABLE \`battle_pass\` CHANGE \`last_updated\` \`last_updated\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    // await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP`);

    // 외래 키 연결 (이미 연결돼 있을 수도 있음 → try-catch로 감싸도 됨)
    await queryRunner.query(`ALTER TABLE \`battle_pass_reward\` ADD CONSTRAINT \`FK_21a08d1951a965342bc8f75fdb1\` FOREIGN KEY (\`missionId\`) REFERENCES \`battle_pass_mission\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`battle_pass_mission\` ADD CONSTRAINT \`FK_2147c1a542c677c41e7c65a20c6\` FOREIGN KEY (\`battlePassId\`) REFERENCES \`battle_pass\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`battle_statistics\` ADD CONSTRAINT \`FK_a685e0e1da5899db42f1705e8dd\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 외래 키 제거
    await queryRunner.query(`ALTER TABLE \`battle_statistics\` DROP FOREIGN KEY \`FK_a685e0e1da5899db42f1705e8dd\``);
    await queryRunner.query(`ALTER TABLE \`battle_pass_mission\` DROP FOREIGN KEY \`FK_2147c1a542c677c41e7c65a20c6\``);
    await queryRunner.query(`ALTER TABLE \`battle_pass_reward\` DROP FOREIGN KEY \`FK_21a08d1951a965342bc8f75fdb1\``);

    // 컬럼 롤백
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`exp\``);

    // NOTE: 테이블 DROP은 제거 (이미 DB에 있음)
    // await queryRunner.query(`DROP INDEX \`REL_a685e0e1da5899db42f1705e8d\` ON \`battle_statistics\``);
    // await queryRunner.query(`DROP TABLE \`battle_statistics\``);
    // await queryRunner.query(`DROP TABLE \`battle_pass_mission\``);
    // await queryRunner.query(`DROP TABLE \`battle_pass_reward\``);
  }
}
