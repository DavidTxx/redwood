import fs from 'fs'
import path from 'path'

// Setup test mocks
global.__dirname = __dirname
import '../../../lib/test'

import * as helpers from '../helpers'
import * as page from '../page/page'

const PAGE_TEMPLATE_OUTPUT = `import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const FooBarPage = () => {
  return (
    <>
      <MetaTags
        title="FooBar"
        // description="FooBar description"
        /* you should un-comment description and add a unique description, 155 characters or less
        You can look at this documentation for best practices : https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets */
      />
      <h1>FooBarPage</h1>
      <p>
        Find me in <code>./web/src/pages/FooBarPage/FooBarPage.js</code>
      </p>
      <p>
        My default route is named <code>fooBar</code>, link to me with \`
        <Link to={routes.fooBar()}>FooBar</Link>\`
      </p>
    </>
  )
}

export default FooBarPage
`

test('customOrDefaultTemplatePath returns the default path if no custom templates exist', () => {
  const output = helpers.customOrDefaultTemplatePath({
    side: 'web',
    generator: 'page',
    templatePath: 'page.tsx.template',
  })

  expect(output).toMatch(
    path.normalize(
      'redwood/packages/cli/src/commands/generate/page/templates/page.tsx.template'
    )
  )
})

test('customOrDefaultTemplatePath returns the app path if a custom template exists', () => {
  // pretend the custom template exists
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  const output = helpers.customOrDefaultTemplatePath({
    side: 'web',
    generator: 'page',
    templatePath: 'page.tsx.template',
  })

  expect(output).toEqual(
    path.normalize('/path/to/project/web/generators/page/page.tsx.template')
  )
})

test('customOrDefaultTemplatePath returns the app path with proper side, generator and path', () => {
  // pretend the custom template exists
  jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true)

  const output = helpers.customOrDefaultTemplatePath({
    side: 'api',
    generator: 'cell',
    templatePath: 'component.tsx.template',
  })

  expect(output).toEqual(
    path.normalize(
      '/path/to/project/api/generators/cell/component.tsx.template'
    )
  )
})

test('templateForComponentFile creates a proper output path for files', () => {
  const names = ['FooBar', 'fooBar', 'foo-bar', 'foo_bar', 'FOO_BAR', 'FOOBar']

  names.forEach((name) => {
    const output = helpers.templateForComponentFile({
      name: name,
      suffix: 'Page',
      webPathSection: 'pages',
      generator: 'page',
      templatePath: 'page.tsx.template',
      templateVars: page.paramVariants(helpers.pathName(undefined, name)),
    })

    expect(output[0]).toEqual(
      path.normalize('/path/to/project/web/src/pages/FooBarPage/FooBarPage.js')
    )
  })
})

test('templateForComponentFile can create a path in /web', () => {
  const output = helpers.templateForComponentFile({
    name: 'Home',
    suffix: 'Page',
    webPathSection: 'pages',
    generator: 'page',
    templatePath: 'page.tsx.template',
    templateVars: page.paramVariants(helpers.pathName(undefined, 'Home')),
  })

  expect(output[0]).toEqual(
    path.normalize('/path/to/project/web/src/pages/HomePage/HomePage.js')
  )
})

test('templateForComponentFile can create a path in /api', () => {
  const output = helpers.templateForComponentFile({
    name: 'Home',
    suffix: 'Page',
    apiPathSection: 'services',
    generator: 'page',
    templatePath: 'page.tsx.template',
    templateVars: page.paramVariants(helpers.pathName(undefined, 'Home')),
  })

  expect(output[0]).toEqual(
    path.normalize('/path/to/project/api/src/services/HomePage/HomePage.js')
  )
})

test('templateForComponentFile can override generated component name', () => {
  const output = helpers.templateForComponentFile({
    name: 'Home',
    componentName: 'Hobbiton',
    webPathSection: 'pages',
    generator: 'page',
    templatePath: 'page.tsx.template',
    templateVars: page.paramVariants(helpers.pathName(undefined, 'Home')),
  })

  expect(output[0]).toEqual(
    path.normalize('/path/to/project/web/src/pages/Hobbiton/Hobbiton.js')
  )
})

test('templateForComponentFile can override file extension', () => {
  const output = helpers.templateForComponentFile({
    name: 'Home',
    suffix: 'Page',
    extension: '.txt',
    webPathSection: 'pages',
    generator: 'page',
    templatePath: 'page.tsx.template',
    templateVars: page.paramVariants(helpers.pathName(undefined, 'Home')),
  })

  expect(output[0]).toEqual(
    path.normalize('/path/to/project/web/src/pages/HomePage/HomePage.txt')
  )
})

test('templateForComponentFile can override output path', () => {
  const output = helpers.templateForComponentFile({
    name: 'func',
    apiPathSection: 'functions',
    generator: 'function',
    templatePath: 'function.ts.template',
    templateVars: { name: 'func' },
    outputPath: path.normalize('/path/to/project/api/src/functions/func.ts'),
  })

  expect(output[0]).toEqual(
    path.normalize('/path/to/project/api/src/functions/func.ts')
  )
})

test('templateForComponentFile creates a template', () => {
  const output = helpers.templateForComponentFile({
    name: 'FooBar',
    suffix: 'Page',
    webPathSection: 'pages',
    generator: 'page',
    templatePath: 'page.tsx.template',
    templateVars: page.paramVariants(helpers.pathName(undefined, 'fooBar')),
  })

  expect(output[1]).toEqual(PAGE_TEMPLATE_OUTPUT)
})

test('pathName uses passed path if present', () => {
  const paths = ['FooBar', 'fooBar', 'foo-bar', 'foo_bar', 'foobar', '/foobar']

  paths.forEach((path) => {
    expect(helpers.pathName(path, 'FooBar')).toEqual(path)
  })
})

test('pathName creates path based on name if path is null', () => {
  const names = ['FooBar', 'fooBar', 'foo-bar', 'foo_bar', 'FOO_BAR']

  names.forEach((name) => {
    expect(helpers.pathName(null, name)).toEqual('/foo-bar')
  })
})

test('pathName creates path based on name if path is just a route parameter', () => {
  expect(helpers.pathName('{id}', 'post')).toEqual('/post/{id}')
  expect(helpers.pathName('{id:Int}', 'post')).toEqual('/post/{id:Int}')
})

test('pathName supports paths with route params', () => {
  expect(helpers.pathName('/post/{id:Int}/edit', 'EditPost')).toEqual(
    '/post/{id:Int}/edit'
  )
})

test('relationsForModel returns related field names from a belongs-to relationship', () => {
  const model = {
    name: 'UserProfile',
    isEmbedded: false,
    dbName: null,
    fields: [
      {
        name: 'id',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: true,
        type: 'Int',
        default: [Object],
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'userId',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        type: 'Int',
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'user',
        kind: 'object',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        type: 'User',
        relationName: 'UserToUserProfile',
        relationToFields: [Array],
        relationOnDelete: 'NONE',
        isGenerated: false,
        isUpdatedAt: false,
      },
    ],
    isGenerated: false,
    idFields: [],
    uniqueFields: [],
  }

  expect(helpers.relationsForModel(model)).toEqual(['user'])
})

test('relationsForModel returns related field names from a has-many relationship', () => {
  const model = {
    name: 'User',
    isEmbedded: false,
    dbName: null,
    fields: [
      {
        name: 'id',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: true,
        type: 'Int',
        default: [Object],
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'name',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: false,
        isUnique: false,
        isId: false,
        type: 'String',
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'profiles',
        kind: 'object',
        dbNames: [],
        isList: true,
        isRequired: false,
        isUnique: false,
        isId: false,
        type: 'UserProfile',
        relationName: 'UserToUserProfile',
        relationToFields: [],
        relationOnDelete: 'NONE',
        isGenerated: false,
        isUpdatedAt: false,
      },
    ],
    isGenerated: false,
    idFields: [],
    uniqueFields: [],
  }

  expect(helpers.relationsForModel(model)).toEqual(['profiles'])
})

test('intForeignKeysForModel returns names of foreign keys that are Int datatypes', () => {
  const model = {
    name: 'UserProfile',
    isEmbedded: false,
    dbName: null,
    fields: [
      {
        name: 'id',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: true,
        type: 'Int',
        default: [Object],
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'userId',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        type: 'Int',
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'user',
        kind: 'object',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        type: 'User',
        relationName: 'UserToUserProfile',
        relationToFields: [Array],
        relationOnDelete: 'NONE',
        isGenerated: false,
        isUpdatedAt: false,
      },
    ],
    isGenerated: false,
    idFields: [],
    uniqueFields: [],
  }

  expect(helpers.intForeignKeysForModel(model)).toEqual(['userId'])
})

test('intForeignKeysForModel does not include foreign keys of other datatypes', () => {
  const model = {
    name: 'UserProfile',
    isEmbedded: false,
    dbName: null,
    fields: [
      {
        name: 'id',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: true,
        type: 'Int',
        default: [Object],
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'userId',
        kind: 'scalar',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        type: 'String',
        isGenerated: false,
        isUpdatedAt: false,
      },
      {
        name: 'user',
        kind: 'object',
        dbNames: [],
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        type: 'User',
        relationName: 'UserToUserProfile',
        relationToFields: [Array],
        relationOnDelete: 'NONE',
        isGenerated: false,
        isUpdatedAt: false,
      },
    ],
    isGenerated: false,
    idFields: [],
    uniqueFields: [],
  }

  expect(helpers.intForeignKeysForModel(model)).toEqual([])
})

describe('mapRouteParamTypeToTsType', () => {
  it('maps scalar type String to TS type string', () => {
    expect(helpers.mapRouteParamTypeToTsType('String')).toBe('string')
  })

  it('maps scalar type Boolean to TS type boolean', () => {
    expect(helpers.mapRouteParamTypeToTsType('Boolean')).toBe('boolean')
  })

  it('maps scalar type Int to TS type number', () => {
    expect(helpers.mapRouteParamTypeToTsType('Int')).toBe('number')
  })

  it('maps scalar type Float to TS type number', () => {
    expect(helpers.mapRouteParamTypeToTsType('Float')).toBe('number')
  })

  it('maps unexpected type to TS unknown', () => {
    expect(helpers.mapRouteParamTypeToTsType('unknown')).toBe('unknown')
  })
})

describe('mapPrismaScalarToPagePropTsType', () => {
  it('maps scalar type String to TS type string', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('String')).toBe('string')
  })

  it('maps scalar type Boolean to TS type boolean', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('Boolean')).toBe('boolean')
  })

  it('maps scalar type Int to TS type number', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('Int')).toBe('number')
  })

  it('maps scalar type BigInt to TS type number', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('BigInt')).toBe('number')
  })

  it('maps scalar type Float to TS type number', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('Float')).toBe('number')
  })

  it('maps scalar type Decimal to TS type number', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('Float')).toBe('number')
  })

  it('maps scalar type DateTime to TS type string', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('DateTime')).toBe('string')
  })

  it('maps all other type not-known to TS to unknown', () => {
    expect(helpers.mapPrismaScalarToPagePropTsType('Json')).toBe('unknown')
  })
})
