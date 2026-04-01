# storybook-type-viewer — план open-source аддона

## Идея

Open-source аддон для Storybook, который позволяет документировать произвольные TypeScript типы
прямо в MDX-страницах. В Storybook нет нормального способа показать `type`, `interface`,
`Omit<>`, `Pick<>`, intersection и другие сложные типы — все инструменты заточены под пропсы
компонентов. Этот аддон закрывает эту нишу.

## Как это работает (уже реализовано в проекте)

### Компонент (runtime)
Пользователь пишет в MDX:
```mdx
import { TypeSourceViewer } from 'storybook-type-viewer';

<TypeSourceViewer
  filePath="src/components/Table/types.ts"
  typeName="TableConfig"
/>
```

Компонент берёт строку типа из JSON (сгенерированного на этапе сборки) и рендерит
с подсветкой синтаксиса через `@storybook/blocks` → `<Source>`.

### Генератор (build time)
CLI-скрипт или webpack/vite плагин:
1. Сканирует `.mdx` файлы storybook на `<TypeSourceViewer filePath="..." typeName="..." />`
2. Парсит исходные `.ts` файлы — находит объявление типа по имени
3. Извлекает полное определение типа как строку (с учётом скобок, generic, intersection и т.д.)
4. Сохраняет в JSON файл `types.string.json` — ключ `filePath$$$typeName`, значение — строка типа

### Парсер типов
Ключевая часть — парсер `copyTypeAsString`, который корректно извлекает любой TypeScript тип:
- Объекты: `type A = { ... }`
- Generic/utility: `Omit<B, 'x'>`, `Pick<B, 'y'>`, `Record<K, V>`
- Intersection: `TypeA & TypeB & { ... }`
- Union: `'a' | 'b' | { type: 'c' }`
- Функции: `(arg: string) => void` (=> не путается с >)
- Conditional: `T extends string ? 'yes' : 'no'`
- Interface: `interface A extends B { ... }`
- Generic с дефолтами: `type A<T extends X = {}, K = keyof T>`
- Mapped types, tuple, template literal, recursive types
- Строковые литералы: скобки внутри строк игнорируются
- JSDoc комментарии внутри типа сохраняются
- Не захватывает следующий тип в файле

Покрыто 59 тестами.

## Исходные файлы (абсолютные пути)

### Парсер типов (ядро — перенести в аддон)
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\generators\storybook\copy-types-as-string.js`
  - Функция `copyTypeAsStringSync(filePath, typeName)` — основная
  - Функция `copyTypeAsString(filePath, typeName)` — async-версия (устаревшая, не обновлена)
  - Функция `findDeclarationStart(content, typeName)` — поиск начала типа
  - Функция `getDeclarationPrefixLength(content, startIndex, typeName)` — длина ключевого слова

### Генератор JSON (сканер MDX → парсер → JSON)
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\generators\storybook\generate-storybook-types-as-string-json.js`
  - Рекурсивно обходит storybook-файлы
  - Ищет `<TypeSourceViewer>` и `getTypeAsString()` вызовы
  - Для каждого найденного типа вызывает `copyTypeAsStringSync`
  - Сохраняет результат в `types.string.json`

### React-компонент (UI)
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\packages\storybook\src\utils\TypeSourceViewer.tsx`
  - Пропсы: `filePath`, `typeName`, `asString`, `preSource`, `postSource`
  - Рендерит через `<Source>` из `@storybook/blocks`

### Хелпер для программного использования
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\packages\storybook\src\utils\getTypeAsString.ts`

### Вспомогательные утилиты
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\generators\helpers.js`
  - `getOSAgnosticPath(filePath)` — нормализация путей
  - `getStrWithReplacedNewLineSymbols(str)` — нормализация переводов строк

### Тесты (59 кейсов)
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\_sync\test-parser\run-tests.js` — тест-раннер
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\_sync\test-parser\fixtures.ts` — фикстуры с типами

### Примеры использования в MDX
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\packages\storybook\src\stories\TableCanvas\Table.ContextMenu\TableContextMenuAPI.mdx`

### Сгенерированный JSON (результат работы генератора)
- `C:\Users\potap\OneDrive\Desktop\SBER_OS\packages\storybook\src\types.string.json`

## Структура npm-пакета (предложение)

```
storybook-type-viewer/
├── src/
│   ├── parser/
│   │   ├── parse-type.ts         ← ядро парсера (из copy-types-as-string.js)
│   │   └── find-declaration.ts   ← поиск начала типа
│   ├── generator/
│   │   ├── scan-mdx.ts           ← сканер MDX файлов
│   │   ├── generate-json.ts      ← генерация types.string.json
│   │   └── cli.ts                ← CLI: npx storybook-type-viewer generate
│   ├── component/
│   │   └── TypeSourceViewer.tsx   ← React-компонент для MDX
│   └── index.ts                   ← публичный API
├── tests/
│   ├── fixtures.ts
│   └── parser.test.ts
├── README.md
├── package.json
└── tsconfig.json
```

## API пакета

### CLI
```bash
npx storybook-type-viewer generate --storybook-dir ./src/stories --output ./src/types.string.json
```

### Компонент
```tsx
import { TypeSourceViewer } from 'storybook-type-viewer';

// В MDX
<TypeSourceViewer filePath="src/types.ts" typeName="MyConfig" />

// С дополнительным кодом
<TypeSourceViewer
  filePath="src/types.ts"
  typeName="MyConfig"
  preSource="// Конфигурация таблицы\n"
/>

// Как строка (программно)
const typeStr = TypeSourceViewer({ filePath: '...', typeName: '...', asString: true });
```

### Интеграция со Storybook
В `.storybook/main.ts`:
```ts
// Вариант 1: автоматическая генерация при запуске
export default {
  // ...
  previewAnnotations: ['storybook-type-viewer/preview'],
};
```

Или в `package.json`:
```json
{
  "scripts": {
    "prestorybook": "storybook-type-viewer generate"
  }
}
```

## Конкуренты / аналоги

Прямых конкурентов НЕТ. Существующие инструменты:
- `react-docgen-typescript` — только пропсы компонентов, не произвольные типы
- `typedoc` — отдельный сайт, не встраивается в Storybook
- `@storybook/addon-docs` ArgsTable — только компоненты
- `ts-json-schema-generator` — JSON Schema, не для визуального отображения

## Целевая аудитория
- Разработчики UI-библиотек с TypeScript
- Команды, документирующие сложные API через Storybook
- Проекты с utility types, generic конфигами, сложными пропсами

## Ключевые преимущества для README
- Показывает ЛЮБОЙ TypeScript тип (не только пропсы компонентов)
- 59 тестов покрывают все виды типов
- Zero runtime cost — типы извлекаются на этапе сборки
- Простая интеграция — один компонент + CLI
- Подсветка синтаксиса через Storybook Source
