
- сейчас будем рефакторить, оптимизировать, улучшать код. Я точно уверен в:

_image-input/index.tsx 
_image-input/ui/*

Я проверил на ререндеры, монтирование. Также в них нет сложной вычислетельной логики, useEffect или лишних зависимостей. Остаются другие папки:

1) С чем нужно разобраться это с:

[ImageInputSections] render #1
react.ts:35 [ImageInputSections] render #2
react.ts:30 [ImageInputSections] mounted 1 time(s), rendered 2 time(s)
react.ts:30 [ImageInputSections] mounted 2 time(s), rendered 2 time(s)
react.ts:35 [ImageInputSections] render #3
react.ts:35 [ImageInputSections] render #4
react.ts:35 [ImageInputSections] render #5
react.ts:35 [ImageInputSections] render #6
react.ts:35 [ImageInputSections] render #7
react.ts:35 [ImageInputSections] render #8
react.ts:35 [ImageInputSections] render #9
react.ts:35 [ImageInputSections] render #10
react.ts:35 [ImageInputSections] render #11
react.ts:35 [ImageInputSections] render #12
react.ts:35 [ImageInputSections] render #13
react.ts:35 [ImageInputSections] render #14
react.ts:35 [ImageInputSections] render #15
react.ts:35 [ImageInputSections] render #16
react.ts:35 [ImageInputSections] render #17
react.ts:35 [ImageInputSections] render #18


Многократным рендерингом ImageInputSections