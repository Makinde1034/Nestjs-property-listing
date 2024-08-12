import { Logger } from '@nestjs/common';
import { DataSource, DeepPartial } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ChildIssue, IssueCategory, ParentIssue } from '../../entities';
import { IssueFactory } from '../factories/issue.factory';
import { IssuesCategoryFactory } from '../factories/issue-category';

export class Issue1720110596406 implements Seeder {
  track = false;
  private logger = new Logger(Issue1720110596406.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${ParentIssue.name}...`, factoryManager);
    const parentRepository = dataSource.getRepository(ParentIssue);
    const childIssueRepository = dataSource.getRepository(ChildIssue);
    const categoryRepository = dataSource.getRepository(IssueCategory);

    const parentIssues: DeepPartial<ParentIssue>[] = [];
    const childIssues: DeepPartial<ChildIssue>[] = [];

    try {
      // Fetch categories and prepare a map
      const categories = await categoryRepository.find();

      if (categories.length > 0) {
        this.logger.debug(
          `Seeding for: ${IssueCategory.name} already completed`,
        );
      } else {
        // Save categories if not present
        const categories = await categoryRepository.save(IssuesCategoryFactory);
        const categoryMap = new Map(categories.map((cat) => [cat.name, cat]));

        this.logger.debug('Seeding Parent Issues');

        // Create parent issues
        IssueFactory.forEach((element, index) => {
          const category = categoryMap.get(element.category);

          if (category) {
            const issue: DeepPartial<ParentIssue> = {
              issueCategoryId: category.id,
              issueCategory: category,
              parentReason: element.parentReason,
              parentArabicReason: element.parentArabicName,
              sequentialId: index + 1,
            };

            parentIssues.push(issue);
          } else {
            this.logger.warn(
              `Category ${element.category} not found for ParentIssue`,
            );
          }
        });

        if (parentIssues.length > 0) {
          // Save parent issues and check the result
          const savedParentIssues = await parentRepository.save(parentIssues);
          this.logger.debug('Saved ParentIssues:', savedParentIssues);

          // Fetch existing child issues
          const existingChildIssues = await childIssueRepository.find();
          const existingChildMap = new Map(
            existingChildIssues.map((child) => [
              child.parentIssue.id + '-' + child.sequentialId,
              child,
            ]),
          );

          // Create child issues
          IssueFactory.forEach((element, index) => {
            const parentIssue = savedParentIssues.find(
              (issue) => issue.parentReason === element.parentReason,
            );
            if (parentIssue) {
              const childKey = parentIssue.id + '-' + (index + 1);
              if (!existingChildMap.has(childKey)) {
                const childIssue: DeepPartial<ChildIssue> = {
                  parentIssue,
                  sequentialId: index + 1,
                  childArabicReason: element.childArabicName,
                  childReason: element.childReason,
                };
                childIssues.push(childIssue);
              }
            }
          });
          if (childIssues.length > 0) {
            // Save child issues
            await childIssueRepository.save(childIssues);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error during seeding', error);
      throw error;
    }

    this.logger.debug(`Seeding for: ${Issue1720110596406.name} finished`);
  }
}
