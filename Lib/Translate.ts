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

    constructor(dir: PathOrFileDescriptor) {
        this.dir = dir;
    }

    public async init(): Promise<(locale: string, options?: FormatOptions) => string> {
        const dirs = sync(`${this.dir}/**/*.json`);

        await Promise.all(
            dirs.map((file) => {
                // node 22: .split('\\').slice(-2); 
                // node 20: .split('/').slice(-2);

                const [language, ns] = process.platform === 'win32' ? file.split('\\').slice(-2) : file.split('/').slice(-2);
                
                if (!this.languages[language]) {
                    this.languages[language] = {};
                }

                const data = readFileSync(file, 'utf8');
                this.languages[language][ns.replace('.json', '')] = JSON.parse(data);
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

        const formattedLocale = finalLocale ? this.format(finalLocale, options) : 'Translation not available.';
        return formattedLocale;
    }

    private format(locale: Locale, options?: FormatOptions): string {
        const translatedLocale: string = options?.index ? locale[options.index] : Array.isArray(locale) ? locale[0] : locale;

        if (typeof options !== 'object') return translatedLocale;

        return Object.entries(options).reduce(
            (formatted, [key, value]) => formatted.replace(new RegExp(`{{${key}}}`, 'gi'), String(value)),
            String(translatedLocale)
        );
    }
}