import { readFileSync, PathOrFileDescriptor } from 'node:fs';
import { sync } from 'glob';

type Locale = string | string[] | Language;

interface Language {
    [key: string]: string | string[] | Language;
}

interface FormatOptions {
    index?: number;
    [key: string]: any;
}

export class Translate {
    private dir!: PathOrFileDescriptor;
    private languages: Record<string, Language> = {};
    private actualLang = 'pt-BR';

    public constructor(dir: PathOrFileDescriptor) {
        this.dir = dir;
    }

    public async init(): Promise<(locale: string, options?: FormatOptions) => string> {
        const dirs = sync(`${this.dir}/**/*.json`);

        if (dirs.length === 0) throw new Error('No translation files found');

        await Promise.all(
            dirs.map((file) => {
                // windows: .split('\\').slice(-2); 
                // linux: .split('/').slice(-2);

                const [language, ns] = process.platform === 'win32' ? file.split('\\').slice(-2) : file.split('/').slice(-2);

                if (!this.languages[language]) {
                    this.languages[language] = {};
                }

                const data = readFileSync(file, 'utf8');
                const object = JSON.parse(data) as Language;
                this.languages[language][ns.replace('.json', '')] = object;
            })
        );

        return this.t.bind(this);
    }

    public setLang(language: string) {
        this.actualLang = language;
    }

    public t(locale: string, options?: FormatOptions): string {
        const nSeparator = locale.split(':');
        const actualLocale: (string | number)[] = [
            this.actualLang,
            ...nSeparator.flatMap((ns) => {
                const lSeparator = ns.split('.');
                return lSeparator.length !== 2 ? [ns] : lSeparator;
            })
        ];

        const finalLocale = actualLocale.reduce((localeObj: Locale, key: string | number) => {
            return localeObj ? localeObj[key] : undefined;
        }, this.languages);

        const formattedLocale = finalLocale ? Translate.format(finalLocale, options) : 'Translation not available';
        return formattedLocale;
    }

    private static format(locale: Locale, options?: FormatOptions): string {
        const translatedLocale = options?.index ? locale[options.index] : Array.isArray(locale) ? locale[0] : locale;

        if (typeof options !== 'object') return translatedLocale;

        return Object.entries(options).reduce(
            (formatted, [key, value]) => formatted.replace(new RegExp(`{{${key}}}`, 'gi'), String(value)),
            String(translatedLocale)
        );
    }
}