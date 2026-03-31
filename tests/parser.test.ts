import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { parseTypeFromContent } from '../src/core/parser';

const fixturesPath = path.join(__dirname, 'fixtures.ts');
const content = readFileSync(fixturesPath, 'utf8');

function parse(typeName: string): string | undefined {
  return parseTypeFromContent(content, typeName);
}

describe('parseTypeFromContent', () => {
  it('should parse simple object type', () => {
    expect(parse('SimpleObject')).toBe('type SimpleObject = {\n  name: string;\n  age: number;\n};');
  });

  it('should parse Omit generic utility', () => {
    const result = parse('OmitType')!;
    expect(result).toContain('Omit<');
    expect(result).toContain('SomeProps');
    expect(result).toContain("'children'");
    expect(result).toContain("'items'");
    expect(result).toContain("'placement'");
    expect(result).toContain('>;');
  });

  it('should parse Pick generic utility', () => {
    expect(parse('PickType')).toContain("Pick<SomeProps, 'name' | 'age'>");
  });

  it('should parse intersection with object', () => {
    const result = parse('IntersectionWithObject')!;
    expect(result).toContain('BaseProps &');
    expect(result).toContain('extra: string');
    expect(result).toContain('count: number');
  });

  it('should parse simple intersection', () => {
    const result = parse('IntersectionSimple')!;
    expect(result).toContain('TypeA & TypeB');
    expect(result).not.toContain('{');
  });

  it('should parse Omit + intersection', () => {
    const result = parse('OmitAndIntersection')!;
    expect(result).toContain("Omit<SomeProps, 'x' | 'y'>");
    expect(result).toContain('&');
    expect(result).toContain('custom: boolean');
  });

  it('should parse union type', () => {
    const result = parse('UnionType')!;
    expect(result).toContain("'success'");
    expect(result).toContain("'error'");
    expect(result).toContain("'loading'");
  });

  it('should parse complex union', () => {
    const result = parse('UnionComplex')!;
    expect(result).toContain('string | number |');
    expect(result).toContain('obj: true');
  });

  it('should parse function type', () => {
    const result = parse('FuncType')!;
    expect(result).toContain('(arg: string, num: number)');
    expect(result).toContain('=> void');
  });

  it('should parse function with generic (=> vs >)', () => {
    const result = parse('FuncWithGeneric')!;
    expect(result).toContain('<T>');
    expect(result).toContain('(arg: T)');
    expect(result).toContain('=> Promise<T>');
  });

  it('should parse array type', () => {
    expect(parse('ArrayType')).toContain('string[]');
  });

  it('should parse array of objects', () => {
    const result = parse('ArrayOfObjects')!;
    expect(result).toContain('id: number');
    expect(result).toContain('name: string');
    expect(result).toContain('[]');
  });

  it('should parse simple interface', () => {
    const result = parse('SimpleInterface')!;
    expect(result).toContain('interface SimpleInterface');
    expect(result).toContain('title: string');
    expect(result).toContain('value: number');
  });

  it('should parse extended interface', () => {
    const result = parse('ExtendedInterface')!;
    expect(result).toContain('interface ExtendedInterface extends BaseInterface');
    expect(result).toContain('extra: boolean');
  });

  it('should parse generic with defaults', () => {
    const result = parse('GenericWithDefaults')!;
    expect(result).toContain('RowType extends Record');
    expect(result).toContain('SummaryRowType = unknown');
    expect(result).toContain("type: 'dropdown'");
    expect(result).toContain('getItems:');
  });

  it('should handle string literals with brackets', () => {
    const result = parse('StringWithBrackets')!;
    expect(result).toContain("'<div>{content}</div>'");
    expect(result).toContain("'=>'");
  });

  it('should parse simple alias', () => {
    expect(parse('SimpleAlias')).toContain('type SimpleAlias = string;');
  });

  it('should parse ComponentProps pattern', () => {
    const result = parse('CompProps')!;
    expect(result).toContain('ComponentProps<typeof Button>');
    expect(result).toContain('& ExtraProps');
  });

  it('should parse nested generics', () => {
    expect(parse('NestedGeneric')).toContain('Map<string, Array<Set<number>>>');
  });

  it('should not capture the next type', () => {
    const result = parse('FirstType')!;
    expect(result).toContain('a: string');
    expect(result).not.toContain('b: number');
    expect(result).not.toContain('SecondType');
  });

  it('should parse exported type', () => {
    const result = parse('ExportedType')!;
    expect(result).toContain('type ExportedType');
    expect(result).toContain('exported: true');
  });

  it('should not capture JSDoc before type', () => {
    const result = parse('DocumentedType')!;
    expect(result).toContain('type DocumentedType');
    expect(result).toContain('field: string');
    expect(result).not.toContain('Это документированный тип');
  });

  it('should parse Omit + Pick combo', () => {
    expect(parse('OmitPickCombo')).toContain("Omit<Pick<FullProps, 'a' | 'b' | 'c'>, 'c'>");
  });

  it('should parse conditional type', () => {
    const result = parse('ConditionalType')!;
    expect(result).toContain('T extends string');
    expect(result).toContain("'yes'");
    expect(result).toContain("'no'");
  });

  it('should parse Record utility', () => {
    const result = parse('RecordType')!;
    expect(result).toContain('Record<string, Array<');
    expect(result).toContain('id: number');
    expect(result).toContain('name: string');
  });

  it('should parse Partial + Required', () => {
    expect(parse('PartialRequired')).toContain('Partial<Required<BaseProps>>');
  });

  it('should parse generic interface', () => {
    const result = parse('GenericInterface')!;
    expect(result).toContain('interface GenericInterface');
    expect(result).toContain('data: T');
    expect(result).toContain('loading: boolean');
    expect(result).toContain('error: Error | null');
  });

  it('should parse extended generic interface', () => {
    const result = parse('ExtendedGenericInterface')!;
    expect(result).toContain('interface ExtendedGenericInterface');
    expect(result).toContain('extends GenericInterface<T>');
    expect(result).toContain('selectedKey: K');
    expect(result).toContain('getValue:');
  });

  it('should parse multi-extend interface', () => {
    const result = parse('MultiExtend')!;
    expect(result).toContain('extends InterfaceA, InterfaceB, InterfaceC');
    expect(result).toContain('own: string');
  });

  it('should parse complex nested type', () => {
    const result = parse('ComplexNested')!;
    expect(result).toContain('config:');
    expect(result).toContain('nested:');
    expect(result).toContain('deep:');
    expect(result).toContain('handler:');
    expect(result).toContain('Promise<void>');
    expect(result).toContain('items:');
  });

  it('should parse mapped type', () => {
    const result = parse('MappedType')!;
    expect(result).toContain('[K in keyof SomeType]');
    expect(result).toContain('extends string');
  });

  it('should parse template literal type', () => {
    expect(parse('EventName')).toContain('`on${string}`');
  });

  it('should parse tuple type', () => {
    const result = parse('TupleType')!;
    expect(result).toContain('[string, number,');
    expect(result).toContain('flag: boolean');
  });

  it('should parse intersection chain', () => {
    const result = parse('IntersectionChain')!;
    expect(result).toContain('TypeA & TypeB & TypeC &');
    expect(result).toContain('extra: true');
  });

  it('should parse union chain', () => {
    const result = parse('UnionChain')!;
    expect(result).toContain("type: 'a'");
    expect(result).toContain("type: 'b'");
    expect(result).toContain("type: 'c'");
  });

  it('should parse readonly and optional', () => {
    const result = parse('ReadonlyOptional')!;
    expect(result).toContain('readonly id:');
    expect(result).toContain('name?:');
    expect(result).toContain('readonly items?:');
  });

  it('should parse Extract utility', () => {
    expect(parse('ExtractType')).toContain("Extract<'a' | 'b' | 'c', 'a' | 'c'>");
  });

  it('should parse ReturnType utility', () => {
    expect(parse('FuncReturn')).toContain('ReturnType<typeof someFunction>');
  });

  it('should parse complex intersection with generic', () => {
    const result = parse('ComplexIntersection')!;
    expect(result).toContain('Omit<');
    expect(result).toContain("'id' | 'createdAt'");
    expect(result).toContain('&');
    expect(result).toContain('newId: string');
    expect(result).toContain('metadata:');
  });

  it('should parse keyof typeof', () => {
    expect(parse('KeysOfConfig')).toContain('keyof typeof CONFIG_OBJ');
  });

  it('should parse conditional with infer', () => {
    const result = parse('UnpackPromise')!;
    expect(result).toContain('Promise<infer U>');
    expect(result).toContain('? U : T');
  });

  it('should parse interface with index signature', () => {
    const result = parse('WithIndexSignature')!;
    expect(result).toContain('interface WithIndexSignature');
    expect(result).toContain('[key: string]:');
    expect(result).toContain('id: string');
  });

  it('should parse discriminated union (Action)', () => {
    const result = parse('Action')!;
    expect(result).toContain("'INCREMENT'");
    expect(result).toContain("'DECREMENT'");
    expect(result).toContain("'RESET'");
    expect(result).not.toContain('MultiFunc');
  });

  it('should parse type with multiple arrow functions', () => {
    const result = parse('MultiFunc')!;
    expect(result).toContain('onClick:');
    expect(result).toContain('onChange:');
    expect(result).toContain('render:');
    expect(result).toContain('React.ReactNode');
    expect(result).not.toContain('Action');
  });

  it('should not include JSDoc before type WithJsDoc', () => {
    const result = parse('WithJsDoc')!;
    expect(result).toContain('type WithJsDoc');
    expect(result).toContain('name: string');
    expect(result).toContain('age?: number');
    expect(result).not.toContain('Описание типа WithJsDoc');
  });

  it('should parse interface with JSDoc', () => {
    const result = parse('JsDocInterface')!;
    expect(result).toContain('interface JsDocInterface');
    expect(result).toContain('rows:');
    expect(result).toContain('columns:');
  });

  it('should parse type with many generic defaults', () => {
    const result = parse('ManyGenerics')!;
    expect(result).toContain("A extends string = 'default'");
    expect(result).toContain('B extends number = 0');
    expect(result).toContain('C extends boolean = false');
    expect(result).toContain('D extends Record<string, unknown> = {}');
    expect(result).toContain('E extends Array<unknown> = []');
    expect(result).toContain('a: A');
    expect(result).toContain('e: E');
  });

  it('should parse conditional with defaults', () => {
    const result = parse('ConditionalDefault')!;
    expect(result).toContain('T extends Record');
    expect(result).toContain('K extends keyof T');
    expect(result).toContain('K extends string');
    expect(result).toContain('? T[K] : never');
  });

  it('should parse ExportA without ExportB', () => {
    const result = parse('ExportA')!;
    expect(result).toContain('type ExportA');
    expect(result).toContain('a: string');
    expect(result).not.toContain('ExportB');
  });

  it('should parse ExportB without ExportA', () => {
    const result = parse('ExportB')!;
    expect(result).toContain('type ExportB');
    expect(result).toContain('b: number');
    expect(result).not.toContain('ExportA');
  });

  it('should parse keyof typeof CONFIG', () => {
    expect(parse('ConfigKeys')).toContain('keyof typeof CONFIG');
  });

  it('should parse recursive type', () => {
    const result = parse('TreeNode')!;
    expect(result).toContain('value: string');
    expect(result).toContain('children: TreeNode[]');
  });

  it('should parse complex utility intersection', () => {
    const result = parse('ComplexUtility')!;
    expect(result).toContain("Omit<BaseProps, 'a'>");
    expect(result).toContain("Pick<OtherProps, 'b' | 'c'>");
    expect(result).toContain('extra: string');
  });

  it('should parse empty interface', () => {
    expect(parse('EmptyInterface')).toContain('interface EmptyInterface {}');
  });

  it('should parse empty object type', () => {
    expect(parse('EmptyObject')).toContain('type EmptyObject = {}');
  });

  it('should parse chained generic constraints', () => {
    const result = parse('ChainedGeneric')!;
    expect(result).toContain('T extends U');
    expect(result).toContain('U extends Record');
    expect(result).toContain('value: T');
    expect(result).toContain('base: U');
  });

  it('should parse interface with methods', () => {
    const result = parse('WithMethods')!;
    expect(result).toContain('getId():');
    expect(result).toContain('setName(name: string):');
    expect(result).toContain('process<T>(input: T):');
  });

  it('should parse branded type', () => {
    const result = parse('UserId')!;
    expect(result).toContain('string &');
    expect(result).toContain("__brand: 'UserId'");
  });

  it('should parse type after comment', () => {
    const result = parse('AfterComment')!;
    expect(result).toContain('type AfterComment');
    expect(result).toContain('value: number');
    expect(result).not.toContain('Обычный комментарий');
  });
});
