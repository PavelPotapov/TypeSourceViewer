// Тестовые типы для проверки парсера copy-types-as-string.js

// 1. Простой объект
type SimpleObject = {
  name: string;
  age: number;
};

// 2. Generic utility (Omit)
type OmitType = Omit<
  SomeProps,
  | 'children'
  | 'items'
  | 'placement'
>;

// 3. Generic utility (Pick)
type PickType = Pick<SomeProps, 'name' | 'age'>;

// 4. Intersection с объектом
type IntersectionWithObject = BaseProps & {
  extra: string;
  count: number;
};

// 5. Intersection двух типов
type IntersectionSimple = TypeA & TypeB;

// 6. Omit + intersection с объектом
type OmitAndIntersection = Omit<SomeProps, 'x' | 'y'> & {
  custom: boolean;
};

// 7. Union
type UnionType = 'success' | 'error' | 'loading';

// 8. Union с типами
type UnionComplex = string | number | { obj: true };

// 9. Функция
type FuncType = (arg: string, num: number) => void;

// 10. Функция со стрелкой (=> не должна путаться с >)
type FuncWithGeneric = <T>(arg: T) => Promise<T>;

// 11. Массив
type ArrayType = string[];

// 12. Массив объектов
type ArrayOfObjects = { id: number; name: string }[];

// 13. Interface
interface SimpleInterface {
  title: string;
  value: number;
}

// 14. Interface extends
interface ExtendedInterface extends BaseInterface {
  extra: boolean;
}

// 15. Generic тип с дженериками в объявлении + дефолтами
type GenericWithDefaults<
  RowType extends Record<string, unknown>,
  SummaryRowType = unknown,
  CustomCtxs extends Record<string, unknown> = {},
> = BaseType & {
  type: 'dropdown';
  getItems: (params: RowType) => SummaryRowType;
};

// 16. Строковые литералы со скобками
type StringWithBrackets = {
  pattern: '<div>{content}</div>';
  arrow: '=>';
};

// 17. Тип без скобок (просто alias)
type SimpleAlias = string;

// 18. ComponentProps pattern
type CompProps = ComponentProps<typeof Button> & ExtraProps;

// 19. Вложенные generic
type NestedGeneric = Map<string, Array<Set<number>>>;

// 20. Тип после которого идёт другой тип (не должен захватить следующий)
type FirstType = {
  a: string;
};

type SecondType = {
  b: number;
};

// 21. export type
export type ExportedType = {
  exported: true;
};

// 22. Тип с JSDoc
/** Это документированный тип */
type DocumentedType = {
  /** Поле с описанием */
  field: string;
};

// 23. Omit + Pick combo
type OmitPickCombo = Omit<Pick<FullProps, 'a' | 'b' | 'c'>, 'c'>;

// 24. Условный тип (conditional)
type ConditionalType = T extends string ? 'yes' : 'no';

// 25. Record utility
type RecordType = Record<string, Array<{ id: number; name: string }>>;

// 26. Partial + Required combo
type PartialRequired = Partial<Required<BaseProps>>;

// 27. Interface с generic
interface GenericInterface<T extends Record<string, unknown>> {
  data: T;
  loading: boolean;
  error: Error | null;
}

// 28. Interface extends + generic
interface ExtendedGenericInterface<T, K extends keyof T>
  extends GenericInterface<T> {
  selectedKey: K;
  getValue: (key: K) => T[K];
}

// 29. Множественное наследование interface
interface MultiExtend extends InterfaceA, InterfaceB, InterfaceC {
  own: string;
}

// 30. Тип с вложенными объектами и функциями
type ComplexNested = {
  config: {
    nested: {
      deep: {
        value: string;
      };
    };
  };
  handler: (event: { type: string; payload: unknown }) => Promise<void>;
  items: Array<{ id: number; children: Array<{ name: string }> }>;
};

// 31. Mapped type
type MappedType = {
  [K in keyof SomeType]: SomeType[K] extends string ? K : never;
};

// 32. Template literal type
type EventName = `on${string}`;

// 33. Tuple type
type TupleType = [string, number, { flag: boolean }];

// 34. Intersection chain
type IntersectionChain = TypeA & TypeB & TypeC & { extra: true };

// 35. Union chain с объектами
type UnionChain =
  | { type: 'a'; value: string }
  | { type: 'b'; value: number }
  | { type: 'c'; value: boolean };

// 36. Тип с readonly и optional
type ReadonlyOptional = {
  readonly id: string;
  name?: string;
  readonly items?: ReadonlyArray<{ key: string }>;
};

// 37. Extract/Exclude utility
type ExtractType = Extract<'a' | 'b' | 'c', 'a' | 'c'>;

// 38. ReturnType/Parameters utility
type FuncReturn = ReturnType<typeof someFunction>;

// 39. Intersection Omit + объект + generic
type ComplexIntersection<T extends Record<string, unknown>> = Omit<
  T,
  'id' | 'createdAt'
> & {
  newId: string;
  metadata: Record<string, unknown>;
};

// 40. Keyof + typeof combo
type KeysOfConfig = keyof typeof CONFIG_OBJ;

// 41. Infer в conditional type
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

// 42. Interface с index signature
interface WithIndexSignature {
  [key: string]: unknown;
  id: string;
  name: string;
}

// 43. Discriminated union
type Action =
  | { type: 'INCREMENT'; payload: number }
  | { type: 'DECREMENT'; payload: number }
  | { type: 'RESET' };

// 44. Тип с несколькими стрелочными функциями
type MultiFunc = {
  onClick: (e: MouseEvent) => void;
  onChange: (value: string) => Promise<boolean>;
  render: () => React.ReactNode;
};

// 45. JSDoc на типе — должен захватиться
/** Описание типа WithJsDoc */
type WithJsDoc = {
  /** Имя пользователя */
  name: string;
  /** Возраст (опционально) */
  age?: number;
};

// 46. JSDoc на interface
/**
 * Интерфейс с многострочным JSDoc.
 * Описывает конфигурацию таблицы.
 */
interface JsDocInterface {
  /** Массив строк */
  rows: unknown[];
  /** Конфигурация колонок */
  columns: unknown[];
}

// 47. Много generic параметров с дефолтами
type ManyGenerics<
  A extends string = 'default',
  B extends number = 0,
  C extends boolean = false,
  D extends Record<string, unknown> = {},
  E extends Array<unknown> = [],
> = {
  a: A;
  b: B;
  c: C;
  d: D;
  e: E;
};

// 48. Generic с extends + conditional + default
type ConditionalDefault<
  T extends Record<string, unknown> = {},
  K extends keyof T = keyof T,
> = K extends string ? T[K] : never;

// 49. Несколько export type подряд
export type ExportA = { a: string };

export type ExportB = { b: number };

// 50. Тип с typeof + as const
type ConfigKeys = keyof typeof CONFIG;

// 51. Recursive type
type TreeNode = {
  value: string;
  children: TreeNode[];
};

// 52. Intersection Omit + Pick + объект
type ComplexUtility = Omit<BaseProps, 'a'> &
  Pick<OtherProps, 'b' | 'c'> & {
    extra: string;
  };

// 53. Пустой interface
interface EmptyInterface {}

// 54. Пустой type объект
type EmptyObject = {};

// 55. Type с generic constraint extends другого generic
type ChainedGeneric<T extends U, U extends Record<string, unknown>> = {
  value: T;
  base: U;
};

// 56. Interface с методами
interface WithMethods {
  getId(): string;
  setName(name: string): void;
  process<T>(input: T): Promise<T>;
}

// 57. Branded type (паттерн newtype)
type UserId = string & { readonly __brand: 'UserId' };

// 58. Тип после комментария (не JSDoc)
// Обычный комментарий
type AfterComment = { value: number };
