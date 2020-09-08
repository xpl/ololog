type StageCallback = (input: any, config?: any) => any;

declare interface Config {

    [key: string]: any; // can contain config for user-defined stages...

    stringify?: {
        pure?:            boolean;
        json?:            boolean;
        maxDepth?:        number;
        maxLength?:       number;
        maxArrayLength?:  number;
        maxObjectLength?: number;
        maxStringLength?: number;
        precision?:       number;
        formatter?:       (input: any) => string,
        pretty?:          true | false | 'auto';
        rightAlignKeys?:  boolean;
        fancy?:           boolean;
        indentation?:     string;
    } | StageCallback;

    '+stringify'?: StageCallback;
    'stringify+'?: StageCallback;

    trim?: {
        max?: number;
    } | StageCallback;

    '+trim'?: StageCallback;
    'trim+'?: StageCallback;

    lines?: {
        linebreak?: string;
    } | StageCallback;

    '+lines'?: StageCallback;
    'lines+'?: StageCallback;
    
    concat?: {
        separator?: string;
    } | StageCallback;

    '+concat'?: StageCallback;
    'concat+'?: StageCallback;

    indent?: {
        level?: number;
        pattern?: string;
    } | StageCallback | boolean;

    '+indent'?: StageCallback;
    'indent+'?: StageCallback;

    tag?: {
        level?: string;
        levelColor?: {
            info:  (s: string) => string;
            warn:  (s: string) => string;
            debug: (s: string) => string;
            error: (s: string) => string;
        };
    } | boolean | StageCallback;

    '+tag'?: StageCallback;
    'tag+'?: StageCallback;

    time?: {
        when?:   Date;
        format?: 'locale' | 'iso' | 'utc';
        print?:  (when: Date) => string;
    } | boolean | StageCallback;

    '+time'?: StageCallback;
    'time+'?: StageCallback;

    locate?: {
        shift?: number;
        where?: any; // TODO: add StackTracey callstack item type
        join?: (a: string, sep: string, b: string) => string;
        print?: (args: { calleeShort: string, fileName: string, line: string }) => string;
    } | boolean | StageCallback;

    '+locate'?: StageCallback;
    'locate+'?: StageCallback;

    join?: {
        linebreak?: string;
    } | StageCallback;

    '+join'?: StageCallback;
    'join+'?: StageCallback;

    render?: {
        engine?:       'chrome' | 'ansi' | 'generic' | string;
        engines?:       any;
        consoleMethod?: 'log' | 'error' | 'warn' | 'info' | 'debug';
    } | StageCallback;

    '+render'?: StageCallback;
    'render+'?: StageCallback;

    returnValue?: {
        initialArguments: any[]
    } | StageCallback;

    '+returnValue'?: StageCallback;
    'returnValue+'?: StageCallback;
}

declare interface ololog {

    (...args: any[]): any; // prints the passed arguments

    configure (config: Config): ololog;

    newline: () => void;
    handleNodeErrors: () => ololog;

    before: (stage: string) => ololog;
    after:  (stage: string) => ololog;

    methods: (newMethods: any) => ololog;

    error: ololog;
    warn: ololog;
    info: ololog;
    debug: ololog;

    noop: ololog,

    indent:          (level: number) => ololog;
    precision:       (n: number)     => ololog;
    maxArrayLength:  (n: number)     => ololog;
    maxObjectLength: (n: number)     => ololog;
    maxDepth:        (n: number)     => ololog;
    
    unlimited:        ololog;
    noPretty:         ololog;
    noFancy:          ololog;
    noRightAlignKeys: ololog;
    noLocate:         ololog;

    serialize: ololog;
    deserialize: ololog;

    default: ololog;
    white: ololog;
    black: ololog;
    red: ololog;
    green: ololog;
    yellow: ololog;
    blue: ololog;
    magenta: ololog;
    cyan: ololog;

    darkGray: ololog;
    lightGray: ololog;
    lightRed: ololog;
    lightGreen: ololog;
    lightYellow: ololog;
    lightBlue: ololog;
    lightMagenta: ololog;
    lightCyan: ololog;

    bright: ololog;
    dim: ololog;
    italic: ololog;
    underline: ololog;
    inverse: ololog;

    bgDefault: ololog;
    bgWhite: ololog;
    bgBlack: ololog;
    bgRed: ololog;
    bgGreen: ololog;
    bgYellow: ololog;
    bgBlue: ololog;
    bgMagenta: ololog;
    bgCyan: ololog;

    bgDarkGray: ololog;
    bgLightGray: ololog;
    bgLightRed: ololog;
    bgLightGreen: ololog;
    bgLightYellow: ololog;
    bgLightBlue: ololog;
    bgLightMagenta: ololog;
    bgLightCyan: ololog;
}

declare const ololog: ololog

export = ololog;
