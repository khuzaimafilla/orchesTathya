import YAML from 'yaml';

export interface TargetConfigInput {
  baseUrl: string;
  loginPath?: string;
  role: {
    name: string;
    username: string;
    password: string;
  };
  crawl: {
    maxDepth: number;
    maxPages: number;
    include: string[];
    exclude: string[];
  };
  oracleErrorSelector?: string;
  fields?: Record<string, string>;
  requiredFields?: string[];
}

export const SAUCEDEMO_PRESET: TargetConfigInput = {
  baseUrl: 'https://www.saucedemo.com',
  loginPath: '/',
  role: {
    name: 'standard_user',
    username: 'standard_user',
    password: 'secret_sauce',
  },
  crawl: {
    maxDepth: 3,
    maxPages: 50,
    include: [
      '/inventory.html',
      '/cart.html',
      '/checkout-step-one.html',
      '/checkout-step-two.html',
    ],
    exclude: [],
  },
  oracleErrorSelector: '[data-test="error"]',
  fields: {
    firstName: 'Jane',
    lastName: 'Doe',
    postalCode: '12345',
  },
  requiredFields: ['firstName', 'lastName', 'postalCode'],
};

/**
 * Builds a valid TathyaTest YAML configuration object
 */
export function buildTathyaConfigYaml(input: TargetConfigInput): string {
  const configObj: Record<string, any> = {
    baseUrl: input.baseUrl,
    output: {
      dir: 'tests/generated',
      language: 'ts',
    },
    coverage: 'all',
    oracle: {
      errorSelector: input.oracleErrorSelector || '[data-test="error"]',
    },
    auth: {
      loginPath: input.loginPath || '/',
      roles: [
        {
          name: input.role.name || 'standard_user',
          username: input.role.username,
          password: input.role.password,
        },
      ],
    },
    crawl: {
      maxDepth: Number(input.crawl.maxDepth) || 3,
      maxPages: Number(input.crawl.maxPages) || 50,
      include: input.crawl.include.filter(Boolean),
      exclude: input.crawl.exclude.filter(Boolean),
    },
    data: {
      fields: input.fields || {
        firstName: 'Jane',
        lastName: 'Doe',
        postalCode: '12345',
      },
      defaults: {
        text: 'Sample',
      },
      unique: [],
      duplicates: {},
      requiredFields: input.requiredFields || ['firstName', 'lastName', 'postalCode'],
      confirmFields: [],
      faker: {
        locale: 'en',
        seed: null,
      },
    },
  };

  return YAML.stringify(configObj);
}
