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
        yes?: boolean;
        max?: number;
    } | boolean | StageCallback;

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
        yes?:     boolean;
        level?:   number;
        pattern?: string;
    } | boolean | StageCallback;

    '+indent'?: StageCallback;
    'indent+'?: StageCallback;

    tag?: {
        yes?:   boolean;
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
        yes?:     boolean;
        when?:    Date;
        format?:  'locale' | 'iso' | 'utc' | null;
        locale?:  string;
        options?: Intl.DateTimeFormatOptions;
        print?:   (when: Date) => string;
    } | boolean | StageCallback;

    '+time'?: StageCallback;
    'time+'?: StageCallback;

    locate?: {
        yes?:   boolean;
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

    configure (config: Config): this;

    newline: () => void;
    handleNodeErrors: () => this;

    before: (stage: string) => this;
    after:  (stage: string) => this;

    methods: <T>(newMethods: T) => this & T;

    error: this;
    warn: this;
    info: this;
    debug: this;

    noop: this;

    indent:          (level: number) => this;
    precision:       (n: number)     => this;
    maxArrayLength:  (n: number)     => this;
    maxObjectLength: (n: number)     => this;
    maxDepth:        (n: number)     => this;
    
    unlimited:        this;
    noPretty:         this;
    noFancy:          this;
    noRightAlignKeys: this;
    noLocate:         this;

    serialize: this;
    deserialize: this;

    default: this;
    white: this;
    black: this;
    red: this;
    green: this;
    yellow: this;
    blue: this;
    magenta: this;
    cyan: this;

    darkGray: this;
    lightGray: this;
    lightRed: this;
    lightGreen: this;
    lightYellow: this;
    lightBlue: this;
    lightMagenta: this;
    lightCyan: this;

    bright: this;
    dim: this;
    italic: this;
    underline: this;
    inverse: this;

    bgDefault: this;
    bgWhite: this;
    bgBlack: this;
    bgRed: this;
    bgGreen: this;
    bgYellow: this;
    bgBlue: this;
    bgMagenta: this;
    bgCyan: this;

    bgDarkGray: this;
    bgLightGray: this;
    bgLightRed: this;
    bgLightGreen: this;
    bgLightYellow: this;
    bgLightBlue: this;
    bgLightMagenta: this;
    bgLightCyan: this;
}

declare const ololog: ololog

export = ololog;
