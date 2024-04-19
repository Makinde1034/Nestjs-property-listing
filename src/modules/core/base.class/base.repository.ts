import { ILike, Repository } from 'typeorm';
import QueryDTO from '../dto/query.dto';
import { parseObjectValues, stringToJson } from '../../../common/utils/helper';

/**
 * This class is extendable by entity repositories but not callable on it's own...
 * this is deliberately to curb anti-patterns
 * Example usage:
 * @Injectable()
 * export class UserRepository extends BaseRepository<User> {
 *    constructor(
 *      @InjectRepository(User)
 *      repository: Repository<User>,
 *      ) {
 *          super(repository.target, repository.manager, repository.queryRunner);
 *      }
 * }
 */
export default abstract class BaseRepository<T> extends Repository<T> {
  private safeParse(data) {
    try {
      if (typeof data === 'object') {
        return parseObjectValues(data);
      }
      return stringToJson(data);
    } catch (exception) {
      console.log('error', data);
      return data;
    }
  }

  /**
   * @param populate populate data
   * @returns object {key: true}
   */
  private addPopulation(populate) {
    const populateData = {};
    // if sort is a string, convert into an array
    if (typeof populate === 'string') {
      populate = this.safeParse(populate)
        .toString()
        .replace(/,/g, ' ')
        .split(' ');
    }

    // if sort is an Array, run formatter on the converted data too
    if (Array.isArray(populate)) {
      populate.forEach((el) => {
        populateData[`${el.trim()}`] = true;
      });
    }
    return populateData;
  }

  /**
   * @param sort contains the sort order string [field, -field]
   * @returns object {field: 'DESC'}
   */
  private addOrderBy(sort) {
    let sortData = sort;
    const orderBy = {};
    // if sort is a string, convert into an array
    if (typeof sortData === 'string') {
      sortData = this.safeParse(sortData)
        .toString()
        .replace(/,/g, ' ')
        .split(' ');
    }

    // if sort is an Array, run formatter on the converted data too
    if (Array.isArray(sortData)) {
      sortData.forEach((el) => {
        orderBy[`${el[0].match(/\w/) ? el : el.slice(1)}`] =
          el[0] === '-' ? 'DESC' : 'ASC';
      });
    }
    return orderBy;
  }

  /**
   *
   * @param search the test to be searched
   * @param searchFields the fields to search the text in
   * @returns object {field: ILike('%')}
   */
  private addSearchQuery(search: string, searchFields: string[]) {
    const query = [];
    // if search and searchFields does not exist, return an empty object
    if (!search || !searchFields) {
      return query;
    }
    const searchData = this.safeParse(search);
    const searchFieldsData = this.safeParse(searchFields)
      .toString()
      .replace(/,/g, ' ')
      .split(' ');
    //
    if (Array.isArray(searchFieldsData)) {
      searchFieldsData.forEach((el, index) => {
        query[index] = { [el]: ILike('%' + searchData + '%') };
      });
    }
    return query;
  }

  /**
   *
   * @param query the query input to be formatted to the typeorm style
   * @returns object {...}
   */
  formatQuery(queryObject: Partial<QueryDTO>) {
    const query = this.safeParse(queryObject);
    const queryBuilder: any = {};

    // get the search query
    const searchQuery = this.addSearchQuery(query.search, query.searchFields);

    queryBuilder.select = this.safeParse(query.fields);
    queryBuilder.where = [this.safeParse(query.query)] || [];
    queryBuilder.take = query.limit;
    queryBuilder.relations = this.addPopulation(query.populate);
    queryBuilder.skip = ((query.page || 1) - 1) * query.limit || 0;
    queryBuilder.order = this.addOrderBy(query.sort);
    queryBuilder.withDeleted = query.withDeleted;

    // add the search query to the query builder
    searchQuery &&
      (queryBuilder.where = queryBuilder.where.concat(searchQuery));
    return queryBuilder;
  }

  async countSome(query: Partial<QueryDTO>) {
    // try {
    const formattedQuery = this.formatQuery(query);
    return await this.count(formattedQuery);
  }

  /**
   *
   * @param query
   * @returns Object
   */
  async search(query: Partial<QueryDTO>) {
    const formattedQuery = this.formatQuery(query);
    const response = await this.find(formattedQuery);
    const count = await this.count(formattedQuery);
    const limit = +query.limit;
    const totalPages = Math.ceil(count / limit);
    return {
      data: response,
      page: +query.page,
      count: response.length,
      totalCount: count,
      totalPages,
      limit,
    };
  }

  /**
   *
   * @param query
   * @returns Object
   */
  async getById(id: string, query: Partial<QueryDTO> = {}) {
    let formattedQuery = this.formatQuery(query);
    formattedQuery = Object.assign(formattedQuery, { id });
    return await this.findOne(formattedQuery);
  }

  /**
   *
   * @param query
   * @returns Object
   */
  async getOne(query: Partial<QueryDTO>) {
    const formattedQuery = this.formatQuery(query);
    return await this.findOne(formattedQuery);
  }

  async countAll(query: Partial<QueryDTO>) {
    const formattedQuery = this.formatQuery(query);
    return await this.count(formattedQuery);
  }

  /**
   * Gets ranks for all items by given params
   * @param param: { by: string; order: OrderBy; page: number; limit: number }
   * @returns Array
   */
  findRanked(param: {
    by: string;
    order: OrderBy;
    page: number;
    limit: number;
  }) {
    const offset = ((param.page || 1) - 1) * param.limit || 0;
    return this.createQueryBuilder()
      .select('*')
      .addSelect(
        `DENSE_RANK() OVER(ORDER BY ${param.by} ${param.order}) as rank`,
      )
      .offset(offset)
      .limit(param.limit ?? 10)
      .getRawMany();
  }

  /**
   * Gets rank of one item by given params
   * @param param: { by: string; order: OrderBy; searchKey: string; value: string }
   * @returns Object
   */
  getOneRanked(param: {
    by: string;
    order: OrderBy;
    searchKey: string;
    value: string;
  }) {
    return this.createQueryBuilder()
      .select('*')
      .addSelect(
        `DENSE_RANK() OVER(ORDER BY ${param.by} ${param.order}) as rank`,
      )
      .where(`${param.searchKey} =  :value`, { value: param.value })
      .getRawOne();
  }
}

/**
 * Enum Type for Ordering
 */
export enum OrderBy {
  DESC = 'DESC',
  ASC = 'ASC',
}
