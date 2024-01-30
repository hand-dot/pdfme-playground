import { DEFAULT_FONT_NAME, Plugin, PropPanelSchema, Schema, getFallbackFontName } from "@pdfme/common";
import { text } from "@pdfme/schemas";
import {
    ALIGN_CENTER,
    ALIGN_RIGHT,
    DEFAULT_ALIGNMENT,
    DEFAULT_CHARACTER_SPACING,
    DEFAULT_FONT_COLOR,
    DEFAULT_FONT_SIZE,
    DEFAULT_LINE_HEIGHT,
    DEFAULT_OPACITY,
    DEFAULT_VERTICAL_ALIGNMENT,
    HEX_COLOR_PATTERN,
    VERTICAL_ALIGN_BOTTOM,
    VERTICAL_ALIGN_MIDDLE,
    VERTICAL_ALIGN_TOP,
    testTheme
} from "./constants";


export const extractValueFromTheme = (themeValue?: string, theme?: any, fallback?: string) => {
    if (!themeValue) return fallback;
    const keys = themeValue.slice(1, themeValue.length - 1).split('.');
    let value: any = theme?.palette;
    keys.forEach(key => {
        if (typeof value !== 'object') return;
        value = value?.[key];
    });
    return typeof value === 'object' ? fallback : value;
};




export type ALIGNMENT = 'left' | 'center' | 'right';
export type VERTICAL_ALIGNMENT = 'top' | 'middle' | 'bottom';




interface TextSchema extends Schema {
    fontName?: string;
    alignment: ALIGNMENT;
    verticalAlignment: VERTICAL_ALIGNMENT;
    fontSize: number;
    lineHeight: number;
    characterSpacing: number;
    fontColor: string;
    backgroundColor: string;
    backgroundColorFromTheme?: string;
    fontColorFromTheme?: string;
}



export const textPlugin: Plugin<TextSchema> = {
    ui: text.ui,
    pdf: text.pdf,
    propPanel: {
        schema: ({ options, i18n, activeSchema, changeSchemas, theme }) => {
            // @ts-ignore
            const _activeSchema = activeSchema as TextSchema;
            const updateSchemaIfDifferent = (key: string, themeKey: string, defaultValue: string) => {
                const themeValue = extractValueFromTheme(themeKey, testTheme, defaultValue);
                if (themeValue !== _activeSchema[key]) {
                    changeSchemas([{ key, schemaId: activeSchema.id, value: themeValue }]);
                }
            }
            if (_activeSchema.fontColorFromTheme) {
                updateSchemaIfDifferent('fontColor', _activeSchema.fontColorFromTheme, DEFAULT_FONT_COLOR);
            }
            if (_activeSchema.backgroundColorFromTheme) {
                updateSchemaIfDifferent('backgroundColor', _activeSchema.backgroundColorFromTheme, '');
            }


            const font = options.font || { [DEFAULT_FONT_NAME]: { data: '', fallback: true } };
            const fontNames = Object.keys(font);
            const fallbackFontName = getFallbackFontName(font);

            const textSchema: Record<string, PropPanelSchema> = {
                fontName: {
                    title: 'Font',
                    type: 'string',
                    widget: 'select',
                    default: fallbackFontName,
                    props: { options: fontNames.map(name => ({ label: name, value: name })) },
                    span: 12
                },
                fontSize: {
                    title: i18n('schemas.text.size'),
                    type: 'number',
                    widget: 'inputNumber',
                    span: 6
                },
                characterSpacing: {
                    title: i18n('schemas.text.spacing'),
                    type: 'number',
                    widget: 'inputNumber',
                    span: 6
                },
                alignment: {
                    title: i18n('schemas.text.textAlign'),
                    type: 'string',
                    widget: 'select',
                    props: {
                        options: [
                            { label: i18n('schemas.left'), value: DEFAULT_ALIGNMENT },
                            { label: i18n('schemas.center'), value: ALIGN_CENTER },
                            { label: i18n('schemas.right'), value: ALIGN_RIGHT }
                        ]
                    },
                    span: 8
                },
                verticalAlignment: {
                    title: i18n('schemas.text.verticalAlign'),
                    type: 'string',
                    widget: 'select',
                    props: {
                        options: [
                            { label: i18n('schemas.top'), value: VERTICAL_ALIGN_TOP },
                            { label: i18n('schemas.middle'), value: VERTICAL_ALIGN_MIDDLE },
                            { label: i18n('schemas.bottom'), value: VERTICAL_ALIGN_BOTTOM }
                        ]
                    },
                    span: 8
                },
                lineHeight: {
                    title: i18n('schemas.text.lineHeight'),
                    type: 'number',
                    widget: 'inputNumber',
                    props: {
                        step: 0.1
                    },
                    span: 8
                },
                divider: {
                    widget: 'divider',
                    span: 24
                },
                fontColor: {
                    title: i18n('schemas.textColor'),
                    type: 'string',
                    widget: 'color',
                    className: '-mt-2',
                    disabled: !!(activeSchema as any)?.fontColorFromTheme,
                    span: 24,
                    rules: [{ pattern: HEX_COLOR_PATTERN, message: i18n('hexColorPrompt') }]
                },
                fontColorFromTheme: {
                    title: 'Select from Theme',
                    type: 'string',
                    widget: 'select',
                    className: 'mt-1',
                    span: 24,
                    props: {
                        options: [
                            { label: 'None', value: '' },
                            { label: 'Primary', value: '#primary.main#' },
                            { label: 'Secondary', value: '#secondary.main#' },
                            { label: 'Primary Dark', value: '#primary.dark#' }
                        ]
                    }
                },
                divider2: {
                    widget: 'divider',
                    span: 24
                },
                backgroundColor: {
                    title: i18n('schemas.bgColor'),
                    type: 'string',
                    className: '-mt-2',
                    widget: 'color',
                    disabled: !!(activeSchema as any)?.backgroundColorFromTheme,
                    span: 24,
                    rules: [
                        {
                            pattern: HEX_COLOR_PATTERN,
                            message: i18n('hexColorPrompt')
                        }
                    ]
                },
                backgroundColorFromTheme: {
                    title: 'Select from Theme',
                    type: 'string',
                    widget: 'select',
                    className: 'mt-1',
                    dependencies: ['backgroundColor'],
                    span: 24,
                    props: {

                        options: [
                            { label: 'None', value: '' },
                            { label: 'Primary', value: '#primary.main#' },
                            { label: 'Secondary', value: '#secondary.main#' },
                            { label: 'Primary Dark', value: '#primary.dark#' }
                            // { label: 'Color Picker', value: 'custom' }
                        ],

                    }
                }
            };
            return textSchema;
        },
        defaultValue: 'Type Something...',
        defaultSchema: {
            type: 'text',
            position: { x: 0, y: 0 },
            width: 45,
            height: 10,
            rotate: 0,
            alignment: DEFAULT_ALIGNMENT,
            verticalAlignment: DEFAULT_VERTICAL_ALIGNMENT,
            fontSize: DEFAULT_FONT_SIZE,
            lineHeight: DEFAULT_LINE_HEIGHT,
            characterSpacing: DEFAULT_CHARACTER_SPACING,
            fontColor: DEFAULT_FONT_COLOR,
            fontName: 'Regular',
            backgroundColor: '',
            backgroundColorFromTheme: '',
            fontColorFromTheme: '',
            opacity: DEFAULT_OPACITY
        }
    }
}
